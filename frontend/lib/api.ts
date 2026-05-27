/**
 * MX Seguros — DRE-IA | Cliente da API FastAPI.
 * Injeta automaticamente o JWT do Supabase em todos os requests.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Tipos espelhando os schemas do backend ────────────────────

export interface LinhasDRE {
  periodo_inicio: string;
  periodo_fim: string;
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

export interface ReceitaRamo {
  ramo: string;
  receita: number;
  percentual: number;
}

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

export interface Meta {
  id: string;
  competencia: string;
  meta_receita: number;
  meta_comissoes: number;
  atingido_receita: number | null;
  atingido_comissoes: number | null;
}

export interface Repasse {
  id: string;
  competencia: string;
  produtor_nome: string;
  valor: number;
  status: string;
}

// ── Funções de fetch ──────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
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
    throw new Error(err.erro || err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  dre: (token: string, inicio: string, fim: string) =>
    apiFetch<LinhasDRE>("/dre", token, { inicio, fim }),

  dreRamos: (token: string, inicio: string, fim: string) =>
    apiFetch<ReceitaRamo[]>("/dre/ramos", token, { inicio, fim }),

  comissoes: (token: string, inicio: string, fim: string) =>
    apiFetch<Comissao[]>("/comissoes", token, { inicio, fim }),

  estornos: (token: string, inicio: string, fim: string) =>
    apiFetch<Estorno[]>("/estornos", token, { inicio, fim }),

  metas: (token: string, competencia: string) =>
    apiFetch<Meta[]>("/metas", token, { competencia }),

  repasses: (token: string, inicio: string, fim: string) =>
    apiFetch<Repasse[]>("/repasses", token, { inicio, fim }),
};
