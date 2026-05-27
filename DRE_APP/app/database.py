"""
MX Seguros — DRE-IA | Conexão com o banco de dados.

Usa supabase-py (PostgREST) como driver principal.
Quando DATABASE_URL estiver definida no .env, usa asyncpg direto
para queries que exigem RLS via JWT claims (Fase 3+).
"""
from __future__ import annotations

from functools import lru_cache
from supabase import create_client, Client
from app.config import cfg


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """
    Cliente com service_role — bypassa RLS.
    Usar APENAS para operações administrativas do backend
    (ex: sincronizar metadados de usuário após login).
    NUNCA retornar dados filtrados por este cliente para o usuário final.
    """
    return create_client(cfg.supabase_url, cfg.supabase_service_role_key)


def get_supabase_anonimo() -> Client:
    """
    Cliente com anon key.
    Use para operações públicas (ex: verificar health do banco).
    """
    return create_client(cfg.supabase_url, cfg.supabase_anon_key)


def get_supabase_usuario(jwt_token: str) -> Client:
    """
    Cliente autenticado com o JWT do usuário.
    PostgREST aplica RLS automaticamente com base no JWT.
    Este é o cliente correto para todas as queries de negócio.
    """
    from supabase import ClientOptions
    client = create_client(
        cfg.supabase_url,
        cfg.supabase_anon_key,
        options=ClientOptions(headers={"Authorization": f"Bearer {jwt_token}"}),
    )
    return client
