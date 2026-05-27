# MX Seguros — Sistema DRE-IA

Sistema de DRE (Demonstração do Resultado do Exercício) com camada de IA
para a corretora MX Seguros. Substitui o controle atual em planilhas
Excel por banco de dados estruturado, com permissões por perfil
(admin / gestor / comercial / contador) e assistente conversacional.

## Como começar

1. **Leia primeiro:**
   - [`ESCOPO_DRE_IA_CORRETORA.md`](./ESCOPO_DRE_IA_CORRETORA.md) —
     escopo completo: contexto, arquitetura, schema, fases.
   - [`CLAUDE.md`](./CLAUDE.md) — regras operacionais para o Claude
     Code (lidas em todo prompt do Cursor).

2. **Resolva as decisões pendentes** (seção §10 do escopo) com o
   Product Owner antes de iniciar a Fase 1.

3. **Configure ambiente:**
   ```bash
   # Pré-requisitos: Docker, Node 20+, Python 3.12+, pnpm, Supabase CLI
   cp .env.example .env  # preencher com chaves do Supabase + Anthropic
   docker compose up -d
   supabase start
   ```

4. **Abra o Cursor na raiz do projeto.** Use o prompt sugerido na
   Fase 1 do escopo para iniciar.

## Stack

| Camada | Tecnologia |
|---|---|
| Banco | PostgreSQL via Supabase (RLS nativa) |
| Backend | FastAPI (Python 3.12 + asyncpg) |
| Frontend | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| IA | Claude Sonnet 4.5 (API Anthropic) com tool use |
| Testes | pytest + Playwright |

## Cronograma resumido

- **Fase 1** (sem. 1-3): schema + RLS + auth.
- **Fase 2** (sem. 3-4): ETL do balancete 2026.
- **Fase 3** (sem. 4-6): API REST + função de DRE.
- **Fase 4** (sem. 6-8): orquestrador de IA.
- **Fase 5** (sem. 8-11): frontend.
- **Fase 6** (sem. 11-13): hardening e go-live.

## Estrutura

Ver árvore completa em `CLAUDE.md`.

## Suporte

Decisões de negócio: PO (a definir). Bugs de segurança: tratar como
P0; abrir issue privada. Custos de API: monitor em
`https://console.anthropic.com`.
