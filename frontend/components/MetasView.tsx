"use client";

import { useEffect, useState } from "react";
import { api, Meta } from "@/lib/api";
import { mesAtual, formatBRL, formatPercent } from "@/lib/utils";

function barra(atingido: number | null, meta: number): number {
  if (!atingido || !meta) return 0;
  return Math.min(100, (atingido / meta) * 100);
}

function corBarra(pct: number): string {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 80)  return "bg-amber-400";
  return "bg-red-400";
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
        <h1 className="text-2xl font-bold text-gray-900">Metas</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Competência</label>
          <input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          />
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{erro}</div>
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
                <p className="text-sm text-gray-500 mb-3">{m.competencia}</p>
                <div className="space-y-4">
                  {/* Receita */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">Receita</span>
                      <span className="text-gray-700">
                        {m.atingido_receita != null ? formatBRL(m.atingido_receita) : "—"}
                        <span className="text-gray-400 ml-1">/ {formatBRL(m.meta_receita)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${corBarra(pctReceita)}`}
                        style={{ width: `${pctReceita}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-0.5">{pctReceita.toFixed(1)}%</p>
                  </div>
                  {/* Comissões */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">Comissões</span>
                      <span className="text-gray-700">
                        {m.atingido_comissoes != null ? formatBRL(m.atingido_comissoes) : "—"}
                        <span className="text-gray-400 ml-1">/ {formatBRL(m.meta_comissoes)}</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${corBarra(pctComissoes)}`}
                        style={{ width: `${pctComissoes}%` }}
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
