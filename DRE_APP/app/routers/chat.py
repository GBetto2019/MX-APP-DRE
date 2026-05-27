"""
MX Seguros — DRE-IA | Router: /chat (streaming SSE)

Fluxo:
1. Usuário envia POST /chat com {"mensagem": "..."}
2. Backend valida JWT → extrai perfil
3. Orquestrador chama Claude API com tool_use
4. Resposta streamada via Server-Sent Events
5. Frontend consome os eventos conforme chegam
"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from app.auth import UsuarioAtual, obter_usuario_atual
from app.database import get_supabase_admin, get_supabase_usuario

router = APIRouter(prefix="/chat", tags=["IA"])

MAX_PERGUNTA_CHARS = 2000   # evita inputs gigantes


class ChatRequest(BaseModel):
    mensagem: str

    @field_validator("mensagem")
    @classmethod
    def nao_vazia(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Mensagem não pode ser vazia")
        if len(v) > MAX_PERGUNTA_CHARS:
            raise ValueError(f"Mensagem muito longa (máx {MAX_PERGUNTA_CHARS} caracteres)")
        return v


@router.post("", summary="Chat com IA (streaming SSE)")
async def chat(
    body:    ChatRequest,
    request: Request,
    usuario: Annotated[UsuarioAtual, Depends(obter_usuario_atual)],
):
    """
    Endpoint de chat com IA. Resposta via Server-Sent Events (SSE).

    **Como consumir no frontend:**
    ```js
    const es = new EventSource('/chat', { ... });
    es.onmessage = (e) => {
      const evento = JSON.parse(e.data);
      if (evento.tipo === 'texto') anexarTexto(evento.conteudo);
      if (evento.tipo === 'fim')   es.close();
    };
    ```

    **Tipos de evento:**
    - `{"tipo": "texto", "conteudo": "..."}` — chunk de texto do LLM
    - `{"tipo": "tool", "nome": "...", "status": "chamando|concluido"}` — tool sendo executada
    - `{"tipo": "erro", "mensagem": "..."}` — erro
    - `{"tipo": "fim"}` — resposta completa
    """
    from app.ai.orchestrator import processar_pergunta

    token    = request.headers.get("authorization", "").replace("Bearer ", "")
    db       = get_supabase_usuario(token)
    db_admin = get_supabase_admin()

    return StreamingResponse(
        processar_pergunta(body.mensagem, usuario, db, db_admin),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",   # evita buffer no Nginx
        },
    )
