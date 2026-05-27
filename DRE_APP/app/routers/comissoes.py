"""MX Seguros — DRE-IA | Router: /comissoes"""
from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.auth import UsuarioAtual, obter_usuario_atual
from app.database import get_supabase_usuario
from app.models.schemas import ComissoesResponse
from app.services import dre_service

router = APIRouter(prefix="/comissoes", tags=["Comissões"])


@router.get("", response_model=ComissoesResponse, summary="Comissões do período")
async def get_comissoes(
    request: Request,
    inicio: date = Query(...),
    fim:    date = Query(...),
    usuario: Annotated[UsuarioAtual, Depends(obter_usuario_atual)] = None,
):
    """
    Lista comissões do período. RLS filtra automaticamente:
    - Admin/Contador: todas
    - Gestor: apenas da sua equipe
    - Comercial: apenas as próprias
    """
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    db = get_supabase_usuario(token)

    resultado = await dre_service.buscar_comissoes(inicio, fim, usuario, db)

    from app.database import get_supabase_admin
    await dre_service.registrar_auditoria(
        usuario, "consulta_comissoes",
        {"inicio": str(inicio), "fim": str(fim)},
        request.client.host if request.client else None,
        get_supabase_admin(),
    )

    return resultado
