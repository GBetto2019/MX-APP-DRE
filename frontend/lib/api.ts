/**
 * MX Seguros — DRE-IA | Cliente da API FastAPI.
 * Injeta automaticamente o JWT do Supabase em todos os requests.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Extrai mensagem legível de erros FastAPI (detail pode ser array em 422)
function extrairMensagemErro(err: Record<string, unknown>, status: number): string {
  if (err.erro && typeof err.erro === "string") return err.erro;
  if (Array.isArray(err.detail))
    return err.detail.map((d: { msg?: string }) => d.msg ?? "Erro").join("; ");
  if (err.detail && typeof err.detail === "string") return err.detail;
  return `HTTP ${status}`;
}

// ── Helpers de fetch ──────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error(extrairMensagemErro(err as Record<string, unknown>, res.status));
  }

  return res.json();
}

async function apiPost<T>(
  path: string,
  token: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error(extrairMensagemErro(err as Record<string, unknown>, res.status));
  }

  return res.json();
}

async function apiPut<T>(
  path: string,
  token: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error(extrairMensagemErro(err as Record<string, unknown>, res.status));
  }

  return res.json();
}

async function apiDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error(extrairMensagemErro(err as Record<string, unknown>, res.status));
  }
}

// ── Tipos: DRE ────────────────────────────────────────────────

export interface LinhasDRE {
  receita_bruta: number;
  estornos: number;
  impostos: number;
  receita_liquida: number | null;
  repasses_produtores: number | null;
  margem_contribuicao: number | null;
  despesas_fixas: number | null;
  ebitda: number | null;
  despesas_nao_operacionais: number | null;
  resultado_liquido: number | null;
}

interface DREApiResponse {
  periodo: { inicio: string; fim: string };
  dre: LinhasDRE;
  perfil: string;
}

export interface ReceitaRamo {
  ramo: string;
  receita: number;
  percentual: number;
}

interface ReceitaRamoApiItem {
  ramo_codigo: string;
  ramo_nome: string;
  receita_total: number;
  num_apolices: number;
}

interface DRERamosApiResponse {
  periodo: { inicio: string; fim: string };
  items: ReceitaRamoApiItem[];
  total: number;
}

// ── Tipos: Existentes ─────────────────────────────────────────

export interface Comissao {
  id: string;
  competencia: string;
  seguradora: string;
  ramo: string;
  valor: number;
  produtor_nome: string | null;
}

export interface Estorno {
  id: string;
  competencia: string;
  seguradora: string;
  motivo: string;
  valor: number;
}

// MetaItem espelha MetaItem do backend (atingimento_metas RPC)
export interface MetaItem {
  meta_id: string;
  escopo: string;
  escopo_id: string | null;
  metrica: string;        // "receita" | "comissoes"
  valor_alvo: number;
  valor_atual: number;
  percentual: number;
  atingida: boolean;
}

export interface MetasApiResponse {
  competencia: string;
  items: MetaItem[];
}

export interface Repasse {
  id: string;
  competencia: string;
  produtor_nome: string;
  valor: number;
  status: string;
}

interface RepassesApiResponse {
  total: number;
  items: Repasse[];
  soma_previsto: number;
  soma_pago: number;
}

// ── Tipos: Configurações ──────────────────────────────────────

export interface Banco {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CentroCusto {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface TipoLancamento {
  id: string;
  nome: string;
  natureza: "despesa" | "receita";
  categoria: string | null;
  custo_tipo: "fixo" | "variavel" | "nao_operacional" | null;
  ativo: boolean;
}

// ── Tipos: Lançamentos ────────────────────────────────────────

export interface DespesaItem {
  id: string;
  tipo_lancamento_id: string | null;
  tipo_nome: string | null;
  banco_id: string | null;
  banco_nome: string | null;
  categoria: string | null;
  subcategoria: string;
  descricao: string;
  valor: number;
  competencia: string;
  paga_em: string | null;
  centro_custo: string;
  recorrente: boolean;
  parcela_atual: number | null;
  parcela_total: number | null;
}

export interface DespesasResponse {
  total: number;
  items: DespesaItem[];
  soma_total: number;
}

export interface DespesaCreate {
  tipo_lancamento_id?: string;
  banco_id?: string;
  categoria?: string;
  subcategoria: string;
  descricao: string;
  valor: number;
  competencia: string;
  paga_em?: string;
  centro_custo: string;
  recorrente: boolean;
  parcela_atual?: number;
  parcela_total?: number;
}

export interface ReceitaItem {
  id: string;
  origem: "comissao" | "manual";
  tipo_lancamento_id: string | null;
  tipo_nome: string | null;
  banco_id: string | null;
  banco_nome: string | null;
  descricao: string;
  valor: number;
  competencia: string;
  recebido_em: string | null;
  centro_custo: string | null;
  observacao: string | null;
}

export interface ReceitasResponse {
  total: number;
  items: ReceitaItem[];
  soma_comissoes: number;
  soma_manuais: number;
  soma_total: number;
}

export interface ReceitaCreate {
  tipo_lancamento_id?: string;
  banco_id?: string;
  centro_custo: string;
  descricao: string;
  valor: number;
  competencia: string;
  recebido_em?: string;
  observacao?: string;
}

// ── API ───────────────────────────────────────────────────────

export const api = {
  // DRE
  dre: async (token: string, inicio: string, fim: string): Promise<LinhasDRE> => {
    const resp = await apiFetch<DREApiResponse>("/dre", token, { inicio, fim });
    return resp.dre;
  },

  dreRamos: async (token: string, inicio: string, fim: string): Promise<ReceitaRamo[]> => {
    const resp = await apiFetch<DRERamosApiResponse>("/dre/ramos", token, { inicio, fim });
    const total = Number(resp.total) || 1;
    return (resp.items || []).map((item) => ({
      ramo: item.ramo_nome,
      receita: Number(item.receita_total),
      percentual: (Number(item.receita_total) / total) * 100,
    }));
  },

  // Existentes
  comissoes: (token: string, inicio: string, fim: string) =>
    apiFetch<Comissao[]>("/comissoes", token, { inicio, fim }),

  estornos: (token: string, inicio: string, fim: string) =>
    apiFetch<Estorno[]>("/estornos", token, { inicio, fim }),

  // competencia vem como "YYYY-MM" do input[type=month]; FastAPI exige "YYYY-MM-DD"
  metas: (token: string, competencia: string) =>
    apiFetch<MetasApiResponse>("/metas", token, { competencia: `${competencia}-01` }),

  repasses: async (token: string, inicio: string, fim: string): Promise<Repasse[]> => {
    const resp = await apiFetch<RepassesApiResponse>("/repasses", token, { inicio, fim });
    return resp.items ?? [];
  },

  // Configurações
  configuracoes: {
    bancos: (token: string) =>
      apiFetch<Banco[]>("/configuracoes/bancos", token),
    criarBanco: (token: string, body: { nome: string }) =>
      apiPost<Banco>("/configuracoes/bancos", token, body),
    editarBanco: (token: string, id: string, body: { nome?: string; ativo?: boolean }) =>
      apiPut<Banco>(`/configuracoes/bancos/${id}`, token, body),

    centros: (token: string) =>
      apiFetch<CentroCusto[]>("/configuracoes/centros-custo", token),
    criarCentro: (token: string, body: { nome: string; codigo: string }) =>
      apiPost<CentroCusto>("/configuracoes/centros-custo", token, body),
    editarCentro: (token: string, id: string, body: { nome?: string; ativo?: boolean }) =>
      apiPut<CentroCusto>(`/configuracoes/centros-custo/${id}`, token, body),

    tipos: (token: string, natureza?: string) =>
      apiFetch<TipoLancamento[]>("/configuracoes/tipos", token, natureza ? { natureza } : undefined),
    criarTipo: (token: string, body: Omit<TipoLancamento, "id" | "ativo">) =>
      apiPost<TipoLancamento>("/configuracoes/tipos", token, body),
    editarTipo: (token: string, id: string, body: Partial<TipoLancamento>) =>
      apiPut<TipoLancamento>(`/configuracoes/tipos/${id}`, token, body),
    deletarTipo: (token: string, id: string) =>
      apiDelete(`/configuracoes/tipos/${id}`, token),
  },

  // Lançamentos
  lancamentos: {
    despesas: (
      token: string,
      inicio: string,
      fim: string,
      centro_custo?: string,
      banco_id?: string
    ) =>
      apiFetch<DespesasResponse>("/lancamentos/despesas", token, {
        inicio,
        fim,
        centro_custo,
        banco_id,
      }),
    criarDespesa: (token: string, body: DespesaCreate) =>
      apiPost<DespesaItem>("/lancamentos/despesas", token, body),
    deletarDespesa: (token: string, id: string) =>
      apiDelete(`/lancamentos/despesas/${id}`, token),

    receitas: (
      token: string,
      inicio: string,
      fim: string,
      centro_custo?: string,
      banco_id?: string
    ) =>
      apiFetch<ReceitasResponse>("/lancamentos/receitas", token, {
        inicio,
        fim,
        centro_custo,
        banco_id,
      }),
    criarReceita: (token: string, body: ReceitaCreate) =>
      apiPost<ReceitaItem>("/lancamentos/receitas", token, body),
    deletarReceita: (token: string, id: string) =>
      apiDelete(`/lancamentos/receitas/${id}`, token),
  },
};
