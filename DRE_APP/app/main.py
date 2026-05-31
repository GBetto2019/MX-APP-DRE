"""
MX Seguros — DRE-IA | Ponto de entrada do backend FastAPI.

Rodar localmente:
    uvicorn app.main:app --reload --port 8000

Swagger UI: http://localhost:8000/docs
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import cfg
from app.database import close_asyncpg_pool, init_asyncpg_pool
from app.routers import chat, comissoes, configuracoes, dre, estornos, fechamentos, lancamentos, metas, repasses

logging.basicConfig(
    level=logging.DEBUG if not cfg.is_production else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_asyncpg_pool()
    yield
    await close_asyncpg_pool()


app = FastAPI(
    lifespan=lifespan,
    title="MX Seguros — DRE-IA API",
    description=(
        "Backend do sistema de DRE com IA para a MX Seguros. "
        "Todos os endpoints exigem JWT do Supabase Auth no header Authorization."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
# Ajustar origins em produção para o domínio real do frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["http://localhost:3000", "http://localhost:3001"]
        if not cfg.is_production
        else ["https://app.mxseguros.com.br"]
    ),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── ROUTERS ───────────────────────────────────────────────────

app.include_router(chat.router)
app.include_router(dre.router)
app.include_router(comissoes.router)
app.include_router(estornos.router)
app.include_router(metas.router)
app.include_router(repasses.router)
app.include_router(lancamentos.router)
app.include_router(configuracoes.router)


# ── HEALTH CHECK ──────────────────────────────────────────────

@app.get("/health", tags=["Sistema"], summary="Health check")
async def health():
    return {
        "status":      "ok",
        "ambiente":    cfg.environment,
        "supabase_url": cfg.supabase_url,
    }


# ── HANDLER GLOBAL DE ERROS ───────────────────────────────────

@app.exception_handler(Exception)
async def handler_global(request: Request, exc: Exception):
    logging.getLogger(__name__).error("Erro não tratado: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"erro": "Erro interno do servidor", "detalhe": str(exc) if not cfg.is_production else None},
    )
