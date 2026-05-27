"""
MX Seguros — DRE-IA | Schemas Pydantic (request/response).
Valores monetários: sempre Decimal, nunca float.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, field_validator


# ── BASE ──────────────────────────────────────────────────────

class RespostaBase(BaseModel):
    class Config:
        populate_by_name = True


# ── DRE ───────────────────────────────────────────────────────

class DRERequest(BaseModel):
    inicio: date
    fim: date

    @field_validator("fim")
    @classmethod
    def fim_apos_inicio(cls, fim: date, info) -> date:
        inicio = info.data.get("inicio")
        if inicio and fim < inicio:
            raise ValueError("'fim' deve ser igual ou posterior a 'inicio'")
        return fim


class LinhasDRE(RespostaBase):
    receita_bruta:             Decimal
    estornos:                  Decimal
    impostos:                  Decimal
    receita_liquida:           Decimal | None = None  # None para perfis sem permissão
    repasses_produtores:       Decimal | None = None
    margem_contribuicao:       Decimal | None = None
    despesas_fixas:            Decimal | None = None  # bloqueado para gestor/comercial
    ebitda:                    Decimal | None = None  # bloqueado para gestor/comercial
    despesas_nao_operacionais: Decimal | None = None
    resultado_liquido:         Decimal | None = None


class DREResponse(RespostaBase):
    periodo: dict[str, date]
    dre:     LinhasDRE
    perfil:  str   # qual perfil gerou (campos podem ser None se sem permissão)


# ── COMISSÕES ─────────────────────────────────────────────────

class ComissaoItem(RespostaBase):
    id:           UUID
    apolice_id:   UUID
    tipo:         str
    valor:        Decimal
    percentual:   Decimal | None
    competencia:  date
    recebida_em:  date | None


class ComissoesResponse(RespostaBase):
    total:      int
    items:      list[ComissaoItem]
    soma_total: Decimal


# ── ESTORNOS ──────────────────────────────────────────────────

class EstornoItem(RespostaBase):
    id:                   UUID
    apolice_id:           UUID
    valor:                Decimal
    motivo:               str | None
    competencia_original: date
    competencia_estorno:  date


class EstornosResponse(RespostaBase):
    total:          int
    items:          list[EstornoItem]
    soma_total:     Decimal
    taxa_estorno:   Decimal   # estornos / receita_bruta do período
    alerta_5pct:    bool


# ── METAS ─────────────────────────────────────────────────────

class MetaItem(RespostaBase):
    meta_id:      UUID
    escopo:       str
    escopo_id:    UUID | None
    metrica:      str
    valor_alvo:   Decimal
    valor_atual:  Decimal
    percentual:   Decimal
    atingida:     bool


class MetasResponse(RespostaBase):
    competencia: date
    items:       list[MetaItem]


# ── REPASSES ──────────────────────────────────────────────────

class RepasseItem(RespostaBase):
    id:           UUID
    comissao_id:  UUID
    produtor_id:  UUID
    valor:        Decimal
    percentual:   Decimal | None
    competencia:  date
    pago_em:      date | None
    status:       str


class RepassesResponse(RespostaBase):
    total:          int
    items:          list[RepasseItem]
    soma_previsto:  Decimal
    soma_pago:      Decimal


# ── RECEITA POR RAMO ──────────────────────────────────────────

class ReceitaRamoItem(RespostaBase):
    ramo_codigo:   str
    ramo_nome:     str
    receita_total: Decimal
    num_apolices:  int


class ReceitaRamoResponse(RespostaBase):
    periodo:  dict[str, date]
    items:    list[ReceitaRamoItem]
    total:    Decimal


# ── CONFIGURAÇÕES: BANCOS ─────────────────────────────────────

class BancoItem(RespostaBase):
    id:        UUID
    nome:      str
    ativo:     bool


class BancoCreate(RespostaBase):
    nome: str


class BancoUpdate(RespostaBase):
    nome:  str | None = None
    ativo: bool | None = None


# ── CONFIGURAÇÕES: CENTROS DE CUSTO ───────────────────────────

class CentroCustoItem(RespostaBase):
    id:     UUID
    nome:   str
    codigo: str
    ativo:  bool


class CentroCustoCreate(RespostaBase):
    nome:   str
    codigo: str


class CentroCustoUpdate(RespostaBase):
    nome:  str | None = None
    ativo: bool | None = None


# ── CONFIGURAÇÕES: TIPOS DE LANÇAMENTO ────────────────────────

class TipoLancamentoItem(RespostaBase):
    id:         UUID
    nome:       str
    natureza:   str   # 'despesa' | 'receita'
    categoria:  str | None
    custo_tipo: str | None
    ativo:      bool


class TipoLancamentoCreate(RespostaBase):
    nome:       str
    natureza:   str
    categoria:  str | None = None
    custo_tipo: str | None = None


class TipoLancamentoUpdate(RespostaBase):
    nome:       str | None = None
    categoria:  str | None = None
    custo_tipo: str | None = None
    ativo:      bool | None = None


# ── LANÇAMENTOS: DESPESAS ─────────────────────────────────────

class DespesaCreate(RespostaBase):
    tipo_lancamento_id: UUID | None = None
    banco_id:           UUID | None = None
    categoria:          str | None = None   # ENUM legado — obrigatório se tipo_lancamento_id for None
    subcategoria:       str
    descricao:          str
    valor:              Decimal
    competencia:        date
    paga_em:            date | None = None
    centro_custo:       str = "matriz"
    recorrente:         bool = False
    parcela_atual:      int | None = None
    parcela_total:      int | None = None


class DespesaItem(RespostaBase):
    id:                 UUID
    tipo_lancamento_id: UUID | None
    tipo_nome:          str | None          # nome do tipo (join)
    banco_id:           UUID | None
    banco_nome:         str | None          # nome do banco (join)
    categoria:          str | None
    subcategoria:       str
    descricao:          str
    valor:              Decimal
    competencia:        date
    paga_em:            date | None
    centro_custo:       str
    recorrente:         bool
    parcela_atual:      int | None
    parcela_total:      int | None
    criado_em:          Any | None = None


class DespesasResponse(RespostaBase):
    total:      int
    items:      list[DespesaItem]
    soma_total: Decimal


# ── LANÇAMENTOS: RECEITAS ─────────────────────────────────────

class ReceitaOutraCreate(RespostaBase):
    tipo_lancamento_id: UUID | None = None
    banco_id:           UUID | None = None
    centro_custo:       str = "matriz"
    descricao:          str
    valor:              Decimal
    competencia:        date
    recebido_em:        date | None = None
    observacao:         str | None = None


class ReceitaItem(RespostaBase):
    """Representa tanto comissão (origem=comissao) quanto receita manual (origem=manual)."""
    id:                 UUID
    origem:             str             # 'comissao' | 'manual'
    tipo_lancamento_id: UUID | None = None
    tipo_nome:          str | None = None
    banco_id:           UUID | None = None
    banco_nome:         str | None = None
    descricao:          str
    valor:              Decimal
    competencia:        date
    recebido_em:        date | None = None
    centro_custo:       str | None = None
    observacao:         str | None = None


class ReceitasResponse(RespostaBase):
    total:               int
    items:               list[ReceitaItem]
    soma_comissoes:      Decimal
    soma_manuais:        Decimal
    soma_total:          Decimal


# ── ERROS ─────────────────────────────────────────────────────

class ErroResponse(RespostaBase):
    erro:    str
    detalhe: str | None = None
