"""
MX Seguros — DRE-IA | Autenticação via JWT do Supabase.

O perfil do usuário (role) NUNCA vem do body/query da requisição.
Vem exclusivamente do JWT validado aqui. Tentativas de forjar role
via input são rejeitadas automaticamente.
"""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import cfg

BEARER = HTTPBearer()

ROLES_VALIDOS = {"admin", "gestor", "comercial", "contador"}


class UsuarioAtual(BaseModel):
    """Contexto do usuário extraído do JWT — fonte de verdade para permissões."""
    user_id:     str
    email:       str
    role:        str
    equipe_id:   str | None = None
    produtor_id: str | None = None


async def obter_usuario_atual(
    credenciais: Annotated[HTTPAuthorizationCredentials, Depends(BEARER)],
) -> UsuarioAtual:
    """
    Dependency do FastAPI: valida o JWT via Supabase Auth.
    Supabase passou a usar ES256 (novo formato de chave sb_publishable_/sb_secret_),
    então validamos diretamente no servidor Supabase em vez de localmente.
    O perfil (role) NUNCA vem do token — vem da tabela usuarios.
    """
    from supabase import create_client
    token = credenciais.credentials

    try:
        admin = create_client(cfg.supabase_url, cfg.supabase_service_role_key)
        resp = admin.auth.get_user(token)
        user = resp.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado.",
        )

    # Role vem exclusivamente do banco (nunca do token)
    role = await _buscar_role_no_banco(user.id)

    return UsuarioAtual(
        user_id=user.id,
        email=user.email or "",
        role=role,
    )


async def _buscar_role_no_banco(user_id: str) -> str:
    """
    Busca o role do usuário diretamente na tabela usuarios.
    Source of truth para permissões — nunca confia no JWT para isso.
    """
    from supabase import create_client
    admin = create_client(cfg.supabase_url, cfg.supabase_service_role_key)
    try:
        resp = admin.table("usuarios") \
            .select("role") \
            .eq("id", user_id) \
            .limit(1) \
            .execute()
        if resp.data:
            return resp.data[0]["role"]
    except Exception:
        pass
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Usuário não encontrado no sistema.",
    )


# ── Shortcuts para roles específicos ─────────────────────────

def _exigir_roles(*roles: str):
    async def _dep(usuario: Annotated[UsuarioAtual, Depends(obter_usuario_atual)]) -> UsuarioAtual:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Perfil '{usuario.role}' não tem permissão.",
            )
        return usuario
    return _dep


ExigeAdmin         = Depends(_exigir_roles("admin"))
ExigeAdminContador = Depends(_exigir_roles("admin", "contador"))
ExigeTodos         = Depends(obter_usuario_atual)
