"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Target,
  RefreshCw,
} from "lucide-react";
import { api, LinhasDRE } from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";

interface Props {
  token: string;
}

export default function DashboardOverview({ token }: Props) {
  const mes = mesAtual();
  const [dre, setDre] = useState<LinhasDRE | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const data = await api.dre(token, primeiroDia(mes), ultimoDia(mes));
      setDre(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar DRE");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (token) carregar();
  }, [token]);

  const mesLabel = new Date(primeiroDia(mes)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">{mesLabel}</p>
        </div>
        <button
          onClick={carregar}
          disabled={carregando}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {erro}
        </div>
      )}

      {/* KPIs */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            titulo="Receita Bruta"
            valor={dre?.receita_bruta}
            icone={TrendingUp}
            cor="azul"
            subtitulo="Competência"
          />
          <KpiCard
            titulo="Estornos"
            valor={dre?.estornos}
            icone={TrendingDown}
            cor="vermelho"
          />
          <KpiCard
            titulo="Receita Líquida"
            valor={dre?.receita_liquida}
            icone={DollarSign}
            cor="verde"
            bloqueado={dre?.receita_liquida == null}
          />
          <KpiCard
            titulo="Repasses"
            valor={dre?.repasses_produtores}
            icone={BarChart2}
            cor="amarelo"
            bloqueado={dre?.repasses_produtores == null}
          />
          <KpiCard
            titulo="EBITDA"
            valor={dre?.ebitda}
            icone={Target}
            cor="roxo"
            bloqueado={dre?.ebitda == null}
          />
          <KpiCard
            titulo="Resultado Líquido"
            valor={dre?.resultado_liquido}
            icone={DollarSign}
            cor="verde"
            bloqueado={dre?.resultado_liquido == null}
          />
        </div>
      )}

      {/* Nota sobre campos bloqueados */}
      {dre && (
        <p className="text-xs text-gray-400 mt-4">
          Campos exibidos conforme seu perfil de acesso. "—" indica informação
          não disponível para seu perfil.
        </p>
      )}
    </div>
  );
}
