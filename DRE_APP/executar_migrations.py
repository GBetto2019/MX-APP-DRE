"""
MX Seguros — DRE-IA
Executa as migrations SQL diretamente no Supabase.

Uso:
    python executar_migrations.py
    python executar_migrations.py --apenas 0001  # roda só a migration 0001
    python executar_migrations.py --reset        # cuidado: dropa tudo e recria
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL      = os.environ["SUPABASE_URL"]
SERVICE_ROLE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
MIGRATIONS_DIR    = Path(__file__).parent / "migrations"

HEADERS = {
    "apikey":        SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=minimal",
}


def executar_sql(sql: str, descricao: str) -> bool:
    """Executa um bloco SQL via Supabase REST (rpc exec_sql)."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    resp = httpx.post(url, json={"query": sql}, headers=HEADERS, timeout=60)

    if resp.status_code in (200, 201, 204):
        print(f"  [OK] {descricao}")
        return True
    else:
        # Tenta a abordagem alternativa via pg endpoint
        return _executar_sql_direto(sql, descricao)


def _executar_sql_direto(sql: str, descricao: str) -> bool:
    """Fallback: usa o endpoint de query do Supabase Management API."""
    proj_ref = SUPABASE_URL.replace("https://", "").split(".")[0]
    url = f"https://api.supabase.com/v1/projects/{proj_ref}/database/query"

    # Este endpoint requer Personal Access Token (PAT), não service role key
    # Se falhar, o usuário precisa rodar no SQL Editor do dashboard
    resp = httpx.post(url, json={"query": sql}, headers=HEADERS, timeout=60)

    if resp.status_code in (200, 201, 204):
        print(f"  [OK] {descricao}")
        return True
    else:
        print(f"  [ERRO] {descricao}")
        print(f"         Status: {resp.status_code}")
        print(f"         Resposta: {resp.text[:200]}")
        return False


def rodar_arquivo(caminho: Path) -> bool:
    print(f"\n>>> Rodando: {caminho.name}")
    sql = caminho.read_text(encoding="utf-8")

    # Executa em blocos separados por "-- ──" para melhor diagnóstico
    ok = executar_sql(sql, caminho.name)
    return ok


def listar_migrations(apenas: str | None = None) -> list[Path]:
    arquivos = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if apenas:
        arquivos = [f for f in arquivos if f.name.startswith(apenas)]
    return arquivos


def main() -> None:
    parser = argparse.ArgumentParser(description="Executor de migrations MX DRE-IA")
    parser.add_argument("--apenas", help="Prefixo da migration (ex: 0001)")
    parser.add_argument("--reset",  action="store_true",
                        help="PERIGO: dropa todas as tabelas e recria do zero")
    args = parser.parse_args()

    print("=" * 55)
    print("  MX Seguros DRE-IA — Executor de Migrations")
    print("=" * 55)
    print(f"  Supabase: {SUPABASE_URL}")
    print()

    if args.reset:
        confirmar = input("ATENCAO: --reset vai APAGAR TODOS OS DADOS. Digite 'sim' para continuar: ")
        if confirmar.lower() != "sim":
            print("Abortado.")
            sys.exit(0)
        _resetar()

    migrations = listar_migrations(args.apenas)
    if not migrations:
        print("[AVISO] Nenhuma migration encontrada.")
        sys.exit(1)

    print(f"  {len(migrations)} migration(s) encontrada(s):\n")
    for m in migrations:
        print(f"   - {m.name}")

    print()
    erros = 0
    for migration in migrations:
        ok = rodar_arquivo(migration)
        if not ok:
            erros += 1

    print()
    print("=" * 55)
    if erros == 0:
        print(f"  [SUCESSO] {len(migrations)} migration(s) aplicada(s)!")
    else:
        print(f"  [ATENCAO] {erros} erro(s) encontrado(s).")
        print()
        print("  Se o erro for de autenticacao, rode as migrations")
        print("  diretamente no SQL Editor do Supabase:")
        print(f"  https://supabase.com/dashboard/project/"
              f"{SUPABASE_URL.replace('https://','').split('.')[0]}/sql/new")
        sys.exit(1)
    print("=" * 55)


def _resetar() -> None:
    drop_sql = """
    DROP TABLE IF EXISTS audit_log       CASCADE;
    DROP TABLE IF EXISTS metas           CASCADE;
    DROP TABLE IF EXISTS impostos        CASCADE;
    DROP TABLE IF EXISTS despesas        CASCADE;
    DROP TABLE IF EXISTS estornos        CASCADE;
    DROP TABLE IF EXISTS repasses        CASCADE;
    DROP TABLE IF EXISTS comissoes       CASCADE;
    DROP TABLE IF EXISTS apolices        CASCADE;
    DROP TABLE IF EXISTS clientes        CASCADE;
    DROP TABLE IF EXISTS ramos           CASCADE;
    DROP TABLE IF EXISTS seguradoras     CASCADE;
    DROP TABLE IF EXISTS usuarios        CASCADE;
    DROP TABLE IF EXISTS produtores      CASCADE;
    DROP TABLE IF EXISTS equipes         CASCADE;
    DROP TYPE  IF EXISTS despesa_categoria CASCADE;
    DROP TYPE  IF EXISTS user_role         CASCADE;
    DROP FUNCTION IF EXISTS get_meu_role()         CASCADE;
    DROP FUNCTION IF EXISTS get_minha_equipe()     CASCADE;
    DROP FUNCTION IF EXISTS get_meu_produtor()     CASCADE;
    DROP FUNCTION IF EXISTS dre_por_periodo(DATE, DATE)            CASCADE;
    DROP FUNCTION IF EXISTS receita_por_ramo(DATE, DATE)           CASCADE;
    DROP FUNCTION IF EXISTS taxa_estorno(DATE, DATE)               CASCADE;
    DROP FUNCTION IF EXISTS comissoes_por_produtor(DATE, DATE, UUID) CASCADE;
    DROP FUNCTION IF EXISTS atingimento_metas(DATE)                CASCADE;
    """
    executar_sql(drop_sql, "RESET: removendo schema anterior")


if __name__ == "__main__":
    main()
