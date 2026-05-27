"use client";

import { useEffect, useState } from "react";
import { api, MetaItem } from "@/lib/api";
import { mesAtual, formatBRL } from "@/lib/utils";

const METRICA_LABEL: Record<string, string> = {
  receita:    "Receita",
  comissoes:  "Comissões",
};

const ESCOPO_LABEL: Record<string, string> = {
  global:    "Global",
  equipe:    "Equipe",
  produtor:  "Produtor",
  individual:"Individual",
};

function corBarra(pct: number): string {
  if (pct >= 100) return "#2D9B6F";   // verde MX
  if (pct >= 80)  return "#B5A882";   // khaki MX
  return "#DC2626";                    // vermelho alerta
}

export default function MetasView({ token }: { token: string }) {
  const mes = mesAtual();
  const [competencia, setCompetencia] = useState(mes);
  const [items, setItems]   = useState<MetaItem[]>([]);
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const resp = await api.metas(token, competencia);
      setItems(resp.items ?? []);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) carregar(); }, [token, competencia]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Metas</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm" style={{ color: "#3E3E3E" }}>Competência</label>
          <input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white"
            style={{ borderColor: "#E5E5E5", color: "#0C1934" }}
            onFocus={(e) => (e.target.style.borderColor = "#0C1934")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
          />
        </div>
      </div>

      {erro && (
        <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
          {erro}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Nenhuma meta encontrada para {competencia}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m, idx) => {
            const pct = Math.min(100, Number(m.percentual));
            return (
              <div key={`${m.meta_id}-${m.metrica}-${idx}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#EEF4FA", color: "#0C1934" }}
                    >
                      {ESCOPO_LABEL[m.escopo] ?? m.escopo}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#0C1934" }}>
                      {METRICA_LABEL[m.metrica] ?? m.metrica}
                    </span>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={m.atingida
                      ? { backgroundColor: "#EEFBF4", color: "#065F46" }
                      : { backgroundColor: "#F6F6F4", color: "#3E3E3E" }
                    }
                  >
                    {m.atingida ? "✓ Atingida" : `${pct.toFixed(1)}%`}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: "#3E3E3E" }}>Realizado</span>
                  <span style={{ color: "#3E3E3E" }}>
                    <strong style={{ color: "#0C1934" }}>{formatBRL(Number(m.valor_atual))}</strong>
                    <span className="text-gray-400 ml-1">/ {formatBRL(Number(m.valor_alvo))}</span>
                  </span>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: corBarra(pct) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
