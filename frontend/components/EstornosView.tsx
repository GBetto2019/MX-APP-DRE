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
          <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Estornos</h1>
          {dados.length > 0 && (
            <p className="text-sm font-medium mt-0.5" style={{ color: "#DC2626" }}>
              Total: {formatBRL(total)}
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
              <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Seguradora</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Motivo</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}>Valor</th>
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
                  <td className="px-4 py-3" style={{ color: "#3E3E3E" }}>{e.competencia}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#0C1934" }}>{e.seguradora}</td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: "#3E3E3E" }}>{e.motivo}</td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: "#DC2626" }}>{formatBRL(e.valor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
