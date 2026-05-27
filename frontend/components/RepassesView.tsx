"use client";

import { useEffect, useState } from "react";
import { api, Repasse } from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia, formatBRL } from "@/lib/utils";
import PeriodoPicker from "@/components/PeriodoPicker";

const STATUS_BADGE: Record<string, string> = {
  pago:      "bg-green-100 text-green-700",
  pendente:  "bg-amber-100 text-amber-700",
  cancelado: "bg-red-100 text-red-700",
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
          <h1 className="text-2xl font-bold text-gray-900">Repasses</h1>
          {dados.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">Pagos: <strong>{formatBRL(total)}</strong></p>
          )}
        </div>
        <PeriodoPicker inicio={inicio} fim={fim} onInicio={setInicio} onFim={setFim} />
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{erro}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Competência</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Produtor</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Valor</th>
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
                  <td className="px-4 py-3 text-gray-700">{r.competencia}</td>
                  <td className="px-4 py-3 text-gray-700">{r.produtor_nome}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatBRL(r.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
