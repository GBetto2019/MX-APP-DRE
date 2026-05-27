"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { api, LinhasDRE, ReceitaRamo } from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia, formatBRL } from "@/lib/utils";
import PeriodoPicker from "@/components/PeriodoPicker";

// MX Seguros brand palette for charts
const CORES_RAMO = ["#0C1934","#CAE3F2","#B5A882","#1E3A5F","#4A7FA5","#8B7355","#6B9BC0"];

const LINHAS_DRE: { key: keyof LinhasDRE; label: string; destaque?: boolean; negativo?: boolean }[] = [
  { key: "receita_bruta",            label: "Receita Bruta",              destaque: true },
  { key: "estornos",                 label: "(-) Estornos",               negativo: true },
  { key: "impostos",                 label: "(-) Impostos",               negativo: true },
  { key: "receita_liquida",          label: "= Receita Líquida",          destaque: true },
  { key: "repasses_produtores",      label: "(-) Repasses Produtores",    negativo: true },
  { key: "margem_contribuicao",      label: "= Margem de Contribuição",   destaque: true },
  { key: "despesas_fixas",           label: "(-) Despesas Fixas",         negativo: true },
  { key: "ebitda",                   label: "= EBITDA",                   destaque: true },
  { key: "despesas_nao_operacionais",label: "(-) Desp. Não Operacionais", negativo: true },
  { key: "resultado_liquido",        label: "= Resultado Líquido",        destaque: true },
];

export default function DREView({ token }: { token: string }) {
  const mes = mesAtual();
  const [inicio, setInicio] = useState(mes);
  const [fim, setFim]       = useState(mes);
  const [dre, setDre]       = useState<LinhasDRE | null>(null);
  const [ramos, setRamos]   = useState<ReceitaRamo[]>([]);
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const ini = primeiroDia(inicio);
      const fin = ultimoDia(fim);
      const [dreData, ramosData] = await Promise.all([
        api.dre(token, ini, fin),
        api.dreRamos(token, ini, fin),
      ]);
      setDre(dreData);
      setRamos(ramosData);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar DRE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) carregar(); }, [token, inicio, fim]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>DRE</h1>
        <PeriodoPicker
          inicio={inicio} fim={fim}
          onInicio={setInicio} onFim={setFim}
        />
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">{erro}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela DRE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold" style={{ color: "#0C1934" }}>Demonstração de Resultados</h2>
          </div>
          <div className="p-1">
            {loading ? (
              <div className="space-y-2 p-5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : dre ? (
              <table className="w-full text-sm">
                <tbody>
                  {LINHAS_DRE.map(({ key, label, destaque, negativo }) => {
                    const valor = dre[key] as number | null;
                    return (
                      <tr
                        key={key}
                        style={destaque ? { backgroundColor: "#EEF4FA" } : undefined}
                        className={destaque ? "" : "hover:bg-gray-50"}
                      >
                        <td
                          className={`px-5 py-2.5 ${destaque ? "font-semibold pl-5" : "text-gray-600 pl-8"}`}
                          style={destaque ? { color: "#0C1934" } : undefined}
                        >
                          {label}
                        </td>
                        <td className={`px-5 py-2.5 text-right font-mono ${
                          valor == null ? "text-gray-300" :
                          negativo ? "text-red-600" : "text-gray-700"
                        } ${destaque ? "font-semibold" : ""}`}
                          style={destaque && valor != null && !negativo ? { color: "#0C1934" } : undefined}
                        >
                          {valor == null ? "—" : formatBRL(valor)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>

        {/* Gráfico de ramos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold" style={{ color: "#0C1934" }}>Receita por Ramo</h2>
          </div>
          <div className="p-4 h-80">
            {loading ? (
              <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
            ) : ramos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ramos}
                    dataKey="receita"
                    nameKey="ramo"
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    label={(props) => {
                      const d = props as unknown as ReceitaRamo & { x?: number; y?: number };
                      return `${d.ramo} ${d.percentual?.toFixed(1)}%`;
                    }}
                    labelLine={false}
                  >
                    {ramos.map((_, idx) => (
                      <Cell key={idx} fill={CORES_RAMO[idx % CORES_RAMO.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatBRL(Number(v))}
                    labelFormatter={(l) => String(l)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Sem dados no período
              </div>
            )}
          </div>

          {/* Mini bar chart receita bruta por ramo */}
          {ramos.length > 0 && !loading && (
            <div className="px-4 pb-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ramos} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ramo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatBRL(Number(v))} />
                  <Bar dataKey="receita" radius={[4, 4, 0, 0]}>
                    {ramos.map((_, idx) => (
                      <Cell key={idx} fill={CORES_RAMO[idx % CORES_RAMO.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
