"""
MX Seguros — DRE-IA | Serviço de DRE e consultas financeiras.

REGRA FUNDAMENTAL: LLM nunca calcula DRE.
Todo cálculo é determinístico via funções SQL (dre_por_periodo etc.).
Este serviço apenas chama essas funções com o cliente do usuário
(JWT) para que o RLS filtre automaticamente.
"""
from __future__ import annotations

import logging
from datetime import date
from decimal import Decimal

from supabase import Client

from app.auth import UsuarioAtual
from app.models.schemas import (
    ComissaoItem, ComissoesResponse,
    DREResponse, EstornoItem, EstornosResponse,
    LinhasDRE, MetaItem, MetasResponse,
    RepasseItem, RepassesResponse,
    ReceitaRamoItem, ReceitaRamoResponse,
)

logger = logging.getLogger(__name__)


# ── DRE ───────────────────────────────────────────────────────

async def buscar_dre(
    inicio: date,
    fim: date,
    usuario: UsuarioAtual,
    db: Client,
) -> DREResponse:
    """
    Chama a função SQL dre_por_periodo com o cliente JWT do usuário.
    RLS filtra automaticamente conforme o perfil.
    """
    resp = db.rpc("dre_por_periodo", {
        "p_inicio": inicio.isoformat(),
        "p_fim":    fim.isoformat(),
    }).execute()

    dados = resp.data or {}

    periodo = dados.get("periodo", {})

    def _decimal(chave: str) -> Decimal | None:
        val = dados.get(chave)
        return Decimal(str(val)) if val is not None else None

    # Campos sempre visíveis
    dre = LinhasDRE(
        receita_bruta   = _decimal("receita_bruta")   or Decimal(0),
        estornos        = _decimal("estornos")        or Decimal(0),
        impostos        = _decimal("impostos")        or Decimal(0),
        # Campos filtrados conforme perfil (§4.5)
        receita_liquida     = None if usuario.role == "comercial" else _decimal("receita_liquida"),
        repasses_produtores = _decimal("repasses_produtores"),
        margem_contribuicao = None if usuario.role == "comercial" else _decimal("margem_contribuicao"),
        # Gestor e Comercial não veem despesas nem EBITDA
        despesas_fixas            = None if usuario.role in ("gestor", "comercial") else _decimal("despesas_fixas"),
        ebitda                    = None if usuario.role in ("gestor", "comercial") else _decimal("ebitda"),
        despesas_nao_operacionais = None if usuario.role in ("gestor", "comercial") else _decimal("despesas_nao_operacionais"),
        resultado_liquido         = None if usuario.role in ("gestor", "comercial") else _decimal("resultado_liquido"),
    )

    return DREResponse(periodo=periodo, dre=dre, perfil=usuario.role)


# ── COMISSÕES ─────────────────────────────────────────────────

async def buscar_comissoes(
    inicio: date,
    fim: date,
    usuario: UsuarioAtual,
    db: Client,
) -> ComissoesResponse:
    resp = db.table("comissoes") \
        .select("*") \
        .gte("competencia", inicio.isoformat()) \
        .lte("competencia", fim.isoformat()) \
        .order("competencia", desc=True) \
        .execute()

    items = [ComissaoItem(**row) for row in (resp.data or [])]
    soma = sum(i.valor for i in items)

    return ComissoesResponse(
        total=len(items),
        items=items,
        soma_total=soma,
    )


# ── ESTORNOS ──────────────────────────────────────────────────

async def buscar_estornos(
    inicio: date,
    fim: date,
    usuario: UsuarioAtual,
    db: Client,
) -> EstornosResponse:
    resp_estornos = db.table("estornos") \
        .select("*") \
        .gte("competencia_estorno", inicio.isoformat()) \
        .lte("competencia_estorno", fim.isoformat()) \
        .order("competencia_estorno", desc=True) \
        .execute()

    # Calcula taxa via função SQL
    taxa_resp = db.rpc("taxa_estorno", {
        "p_inicio": inicio.isoformat(),
        "p_fim":    fim.isoformat(),
    }).execute()

    taxa_dados = taxa_resp.data or {}
    items = [EstornoItem(**row) for row in (resp_estornos.data or [])]
    soma = sum(i.valor for i in items)

    return EstornosResponse(
        total=len(items),
        items=items,
        soma_total=soma,
        taxa_estorno=Decimal(str(taxa_dados.get("taxa_estorno", 0))),
        alerta_5pct=bool(taxa_dados.get("alerta_5pct", False)),
    )


# ── METAS ─────────────────────────────────────────────────────

async def buscar_metas(
    competencia: date,
    usuario: UsuarioAtual,
    db: Client,
) -> MetasResponse:
    resp = db.rpc("atingimento_metas", {
        "p_competencia": competencia.isoformat(),
    }).execute()

    items = []
    for row in (resp.data or []):
        if row:
            items.append(MetaItem(
                meta_id=row["meta_id"],
                escopo=row["escopo"],
                escopo_id=row.get("escopo_id"),
                metrica=row["metrica"],
                valor_alvo=Decimal(str(row["valor_alvo"])),
                valor_atual=Decimal(str(row["valor_atual"])),
                percentual=Decimal(str(row["percentual"])),
                atingida=bool(row["atingida"]),
            ))

    return MetasResponse(competencia=competencia, items=items)


# ── REPASSES ──────────────────────────────────────────────────

async def buscar_repasses(
    inicio: date,
    fim: date,
    usuario: UsuarioAtual,
    db: Client,
    produtor_id: str | None = None,
) -> RepassesResponse:
    query = db.table("repasses") \
        .select("*") \
        .gte("competencia", inicio.isoformat()) \
        .lte("competencia", fim.isoformat())

    if produtor_id:
        query = query.eq("produtor_id", produtor_id)

    resp = query.order("competencia", desc=True).execute()

    items = [RepasseItem(**row) for row in (resp.data or [])]
    soma_previsto = sum(i.valor for i in items if i.status == "previsto")
    soma_pago = sum(i.valor for i in items if i.status == "pago")

    return RepassesResponse(
        total=len(items),
        items=items,
        soma_previsto=soma_previsto,
        soma_pago=soma_pago,
    )


# ── RECEITA POR RAMO ──────────────────────────────────────────

async def buscar_receita_por_ramo(
    inicio: date,
    fim: date,
    db: Client,
) -> ReceitaRamoResponse:
    resp = db.rpc("receita_por_ramo", {
        "p_inicio": inicio.isoformat(),
        "p_fim":    fim.isoformat(),
    }).execute()

    items = []
    total = Decimal(0)
    for row in (resp.data or []):
        if row:
            item = ReceitaRamoItem(
                ramo_codigo=row["ramo_codigo"],
                ramo_nome=row["ramo_nome"],
                receita_total=Decimal(str(row["receita_total"])),
                num_apolices=int(row["num_apolices"]),
            )
            items.append(item)
            total += item.receita_total

    return ReceitaRamoResponse(
        periodo={"inicio": inicio, "fim": fim},
        items=items,
        total=total,
    )


# ── AUDIT LOG ─────────────────────────────────────────────────

async def registrar_auditoria(
    usuario: UsuarioAtual,
    acao: str,
    detalhes: dict,
    ip: str | None,
    db_admin: Client,
) -> None:
    """Registra toda interação no audit_log (append-only)."""
    try:
        db_admin.table("audit_log").insert({
            "usuario_id": usuario.user_id,
            "acao":       acao,
            "detalhes":   detalhes,
            "ip":         ip,
        }).execute()
    except Exception as e:
        # Falha no log não deve derrubar a requisição
        logger.error("Falha ao registrar audit_log: %s", e)
