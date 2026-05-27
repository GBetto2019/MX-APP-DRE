"use client";

import { useEffect, useState } from "react";
import { api, Estorno } from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia, formatBRL } from "@/lib/utils";
import PeriodoPicker from "@/components/PeriodoPicker";

export default function EstornosView({ token }: { token: string }) {
  const mes = mesAtual();
  const [inicio, setInicio] = useState(mes);
  const [fim, setFim]       = useState(mes);
  const [dados, setDados]   = useState<Estorno[]>([]);
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const data = await api.estornos(token, primeiroDia(inicio), ultimoDia(fim));
      setDados(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) carregar(); }, [token, inicio, fim]);

  const total = dados.reduce((s, e) => s + e.valor, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estornos</h1>
          {dados.length > 0 && (
            <p className="text-sm text-red-600 font-medium mt-0.5">
              Total: {formatBRL(total)}
            </p>
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
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Seguradora</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Motivo</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
            ) : dados.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum estorno no período</td></tr>
            ) : (
              dados.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{e.competencia}</td>
                  <td className="px-4 py-3 text-gray-700">{e.seguradora}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.motivo}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600">{formatBRL(e.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
