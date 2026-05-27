# CLAUDE.md — Instruções permanentes para o Claude Code

Este arquivo é lido em todo prompt. Mantenha-o curto. Para contexto de
negócio completo, leia `ESCOPO_DRE_IA_CORRETORA.md`.

---

## Sobre o projeto

Sistema de DRE para a **MX Seguros**, corretora tributada pelo Simples
Nacional. Substitui controle atual em planilhas Excel. Stack:
**PostgreSQL (Supabase) + FastAPI + Next.js + Claude API**. ~50
usuários, 10k+ apólices/mês, 4 perfis (admin, gestor, comercial,
contador).

## Antes de qualquer tarefa

1. Leia `ESCOPO_DRE_IA_CORRETORA.md` se ainda não leu nesta sessão.
2. Identifique qual **fase** (1 a 6) a tarefa pertence. Se ambíguo,
   pergunte.
3. Se a tarefa contradiz o escopo, **pare e pergunte**. Não invente
   regra de negócio.
4. Antes de criar arquivo novo, rode `tree -L 3` e verifique se já
   existe similar para editar.

## Princípios não-negociáveis

### Segurança
- **Autorização vive no banco (RLS), nunca no prompt do LLM.**
- Perfil do usuário vem do JWT validado pelo backend. Tentativas
  de receber perfil via input do usuário são bug crítico.
- Toda função SQL nova é `SECURITY INVOKER` por padrão.
  `SECURITY DEFINER` só com revisão explícita e justificada em comentário.
- Toda nova tabela com dado sensível **precisa** de política RLS na
  mesma migration. PR sem RLS é rejeitado.
- Nunca logue valores de comissão/salário em texto. Logue ID + ação.

### Cálculos financeiros
- **LLM nunca calcula DRE.** Cálculo é determinístico em SQL/Python.
- Valores monetários: sempre `NUMERIC(14,2)`, nunca `FLOAT`.
- Datas de competência: sempre o primeiro dia do mês (`DATE_TRUNC('month', ...)`)
  para comparação consistente.
- Estornos vão na competência do estorno, não retroagem (ver §4.2 do
  escopo).

### Migração e ETL
- Importar apenas dados de 2026 (balancete Itaú). DRE histórico de
  2023/2025 está fora.
- Classificação de despesas usa dicionário explícito em
  `etl/categorizacao.py`. Sem regex mágica nem ML.
- Linhas ambíguas vão para `revisar.csv`, não para o banco com palpite.

## Convenções de código

### Python (backend + ETL)
- Python 3.12+. Type hints em todo lugar. `from __future__ import annotations`.
- Formatador: `ruff format`. Linter: `ruff check`. Type checker: `mypy --strict`.
- FastAPI com routers modulares em `app/routers/`. Lógica em
  `app/services/`. Sem lógica em handlers.
- Async por padrão (`asyncpg`, não `psycopg`).
- Testes com `pytest` + `pytest-asyncio` + `httpx.AsyncClient`.
- Nomes de variáveis e comentários em **português** (é o idioma do
  domínio). Nomes técnicos genéricos (`session`, `request`) em inglês.

### SQL
- Migrations numeradas: `migrations/NNNN_descricao.sql`.
- Toda alteração de schema é uma nova migration. Nunca edite migration
  antiga aplicada.
- Nomes de tabelas e colunas em **português, snake_case**, singular
  (`apolice`, não `apolices`... espera, exceto que o escopo já usa
  plural — siga o escopo: `apolices`, `comissoes`, `repasses`).
- Sempre `created_at TIMESTAMPTZ DEFAULT now()` em toda tabela nova
  (chame `criado_em` para manter consistência com o escopo).
- `EXPLAIN ANALYZE` em queries novas que tocam tabelas grandes.

### TypeScript (frontend)
- Next.js 15 App Router. Server Components por padrão; Client Components
  só quando precisa de interatividade.
- Tailwind para estilo. shadcn/ui para componentes base.
- Tipos gerados do schema Supabase via `supabase gen types typescript`.
- Sem `any`. Sem `// @ts-ignore`. Se precisar, comente o motivo.

## Workflow de IA (camada Claude)

- Modelo: `claude-sonnet-4-5`. Se mudar, atualize aqui.
- Tool use obrigatório para qualquer consulta a dado. Nunca passe
  resultado de query para o LLM como contexto inicial — passe via tool
  result, sob demanda.
- Limite duro de 20 iterações de tool_use por mensagem.
- System prompt vive em `app/ai/prompts/system.py`, versionado.
- Audit log a cada mensagem: `user_id`, `pergunta`, `tools_chamadas`,
  `resposta`, `timestamp`. Append-only.

## O que NÃO fazer

- Não usar ORM (SQLAlchemy, Prisma) — SQL puro com `asyncpg`. O
  controle fino que o domínio exige não compensa a abstração.
- Não criar endpoint `/admin/*` que ignora RLS "porque é admin".
  Admin usa as mesmas tabelas; RLS distingue pelo `role`.
- Não armazenar planilhas no repositório. ETL lê de
  `/data/uploads/` (gitignored), nunca commitado.
- Não chamar a Claude API direto do frontend. Sempre via backend.
- Não usar `print()` para debug. `logging.getLogger(__name__).debug(...)`.
- Não criar testes que dependem de ordem de execução.

## Quando pedir ajuda ao humano

- Mudança em política RLS (impacto de segurança).
- Mudança em function de cálculo de DRE (impacto financeiro).
- Decisão de regra de negócio não coberta pelo escopo §4.
- Dependência nova com licença não-MIT/Apache/BSD.
- Qualquer migration que faça `DROP` ou `ALTER` destrutivo em produção.

## Comandos úteis (referência rápida)

```bash
# Subir ambiente local
docker compose up -d
supabase start

# Rodar migrations
supabase db reset

# Testes
pytest tests/ -v
pytest tests/test_rls.py -v  # crítico, rode antes de cada PR

# Lint + type check
ruff check . && ruff format --check . && mypy app/

# Frontend
pnpm dev
pnpm test
```

## Estrutura esperada do repo

```
.
├── CLAUDE.md                          # este arquivo
├── ESCOPO_DRE_IA_CORRETORA.md         # escopo completo
├── README.md
├── docker-compose.yml
├── migrations/
│   ├── 0001_init.sql
│   ├── 0002_rls.sql
│   └── ...
├── app/                               # backend Python
│   ├── main.py
│   ├── routers/
│   ├── services/
│   ├── ai/
│   │   ├── orchestrator.py
│   │   ├── tools.py
│   │   └── prompts/
│   └── models/
├── etl/                               # scripts de migração
│   ├── import_balancete.py
│   ├── categorizacao.py
│   └── MIGRACAO_2026.md
├── tests/
│   ├── test_rls.py                    # crítico
│   ├── test_api.py
│   └── test_adversarial.py            # prompt injection
├── web/                               # frontend Next.js
│   ├── app/
│   ├── components/
│   └── lib/
└── data/                              # gitignored
    └── uploads/                       # planilhas de origem
```

---

**Em dúvida sobre algo não coberto aqui: leia o escopo. Em dúvida sobre
o escopo: pergunte ao humano. Nunca chute em código financeiro.**
