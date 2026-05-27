"""MX Seguros — DRE-IA | Router: /repasses"""
from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request

from app.auth import UsuarioAtual, obter_usuario_atual
from app.database import get_supabase_usuario
from app.models.schemas import RepassesResponse
from app.services import dre_service

router = APIRouter(prefix="/repasses", tags=["Repasses"])


@router.get("", response_model=RepassesResponse, summary="Repasses a produtores")
async def get_repasses(
    request: Request,
    inicio:      date       = Query(...),
    fim:         date       = Query(...),
    produtor_id: UUID | None = Query(None, description="Filtrar por produtor específico"),
    usuario: Annotated[UsuarioAtual, Depends(obter_usuario_atual)] = None,
):
    """
    Lista repasses do período.
    Comercial só vê os próprios; Gestor vê da equipe; Admin/Contador veem tudo.
    """
    # Comercial só pode ver seus próprios repasses
    if usuario.role == "comercial":
        produtor_id = UUID(usuario.produtor_id) if usuario.produtor_id else None

    token = request.headers.get("authorization", "").replace("Bearer ", "")
    db = get_supabase_usuario(token)
    return await dre_service.buscar_repasses(
        inicio, fim, usuario, db,
        produtor_id=str(produtor_id) if produtor_id else None,
    )
