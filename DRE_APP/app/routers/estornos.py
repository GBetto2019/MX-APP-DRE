"""MX Seguros — DRE-IA | Router: /estornos"""
from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.auth import UsuarioAtual, obter_usuario_atual
from app.database import get_supabase_usuario
from app.models.schemas import EstornosResponse
from app.services import dre_service

router = APIRouter(prefix="/estornos", tags=["Estornos"])


@router.get("", response_model=EstornosResponse, summary="Estornos do período")
async def get_estornos(
    request: Request,
    inicio: date = Query(...),
    fim:    date = Query(...),
    usuario: Annotated[UsuarioAtual, Depends(obter_usuario_atual)] = None,
):
    """
    Lista estornos do período com taxa calculada.
    Alerta automático quando taxa > 5% da receita bruta (§4.2).
    """
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    db = get_supabase_usuario(token)

    resultado = await dre_service.buscar_estornos(inicio, fim, usuario, db)

    from app.database import get_supabase_admin
    await dre_service.registrar_auditoria(
        usuario, "consulta_estornos",
        {"inicio": str(inicio), "fim": str(fim), "alerta": resultado.alerta_5pct},
        request.client.host if request.client else None,
        get_supabase_admin(),
    )

    return resultado
