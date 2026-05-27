"use client";

import { useEffect, useState } from "react";
import { api, Repasse } from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia, formatBRL } from "@/lib/utils";
import PeriodoPicker from "@/components/PeriodoPicker";

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pago:      { backgroundColor: "#EEFBF4", color: "#065F46", border: "1px solid #C6F0D8" },
  pendente:  { backgroundColor: "#FBF7F0", color: "#7C5A1A", border: "1px solid #EDE0CA" },
  cancelado: { backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FEE2E2" },
};

export default function RepassesView({ token }: { token: string }) {
  const mes = mesAtual();
  const [inicio, setInicio] = useState(mes);
  const [fim, setFim]       = useState(mes);
  const [dados, setDados]   = useState<Repasse[]>([]);
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      setDados(await api.repasses(token, primeiroDia(inicio), ultimoDia(fim)));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) carregar(); }, [token, inicio, fim]);

  const total = dados.filter(r => r.status === "pago").reduce((s, r) => s + r.valor, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Repasses</h1>
          {dados.length > 0 && (
            <p className="text-sm mt-0.5" style={{ color: "#3E3E3E" }}>
              Pagos: <strong style={{ color: "#065F46" }}>{formatBRL(total)}</strong>
            </p>
          )}
        </div>
        <PeriodoPicker inicio={inicio} fim={fim} onInicio={setInicio} onFim={setFim} />
      </div>

      {erro && (
        <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>{erro}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F6F6F4", borderBottom: "1px solid #EBEBEB" }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Competência</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Produtor</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Status</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
            ) : dados.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum repasse no período</td></tr>
            ) : (
              dados.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3" style={{ color: "#3E3E3E" }}>{r.competencia}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#0C1934" }}>{r.produtor_nome}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={STATUS_STYLE[r.status] ?? { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: "#0C1934" }}>{formatBRL(r.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
