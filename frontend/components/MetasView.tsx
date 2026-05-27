"use client";

import { useEffect, useState } from "react";
import { api, Meta } from "@/lib/api";
import { mesAtual, formatBRL } from "@/lib/utils";

function barra(atingido: number | null, meta: number): number {
  if (!atingido || !meta) return 0;
  return Math.min(100, (atingido / meta) * 100);
}

function corBarra(pct: number): string {
  if (pct >= 100) return "#2D9B6F";   // verde MX
  if (pct >= 80)  return "#B5A882";   // khaki MX
  return "#DC2626";                    // vermelho para alerta
}

export default function MetasView({ token }: { token: string }) {
  const mes = mesAtual();
  const [competencia, setCompetencia] = useState(mes);
  const [dados, setDados]   = useState<Meta[]>([]);
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      setDados(await api.metas(token, competencia));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
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
        <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>{erro}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : dados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Nenhuma meta encontrada para {competencia}
        </div>
      ) : (
        <div className="space-y-4">
          {dados.map((m) => {
            const pctReceita    = barra(m.atingido_receita, m.meta_receita);
            const pctComissoes  = barra(m.atingido_comissoes, m.meta_comissoes);
            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-medium mb-4" style={{ color: "#3E3E3E" }}>{m.competencia}</p>
                <div className="space-y-4">
                  {/* Receita */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium" style={{ color: "#0C1934" }}>Receita</span>
                      <span style={{ color: "#3E3E3E" }}>
                        {m.atingido_receita != null ? formatBRL(m.atingido_receita) : "—"}
                        <span className="text-gray-400 ml-1">/ {formatBRL(m.meta_receita)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pctReceita}%`, backgroundColor: corBarra(pctReceita) }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-0.5">{pctReceita.toFixed(1)}%</p>
                  </div>
                  {/* Comissões */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium" style={{ color: "#0C1934" }}>Comissões</span>
                      <span style={{ color: "#3E3E3E" }}>
                        {m.atingido_comissoes != null ? formatBRL(m.atingido_comissoes) : "—"}
                        <span className="text-gray-400 ml-1">/ {formatBRL(m.meta_comissoes)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pctComissoes}%`, backgroundColor: corBarra(pctComissoes) }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-0.5">{pctComissoes.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
