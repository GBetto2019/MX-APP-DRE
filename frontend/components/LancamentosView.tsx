"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import {
  api,
  Banco, CentroCusto, TipoLancamento,
  DespesaItem, DespesaCreate,
  ReceitaItem, ReceitaCreate,
  DespesasResponse, ReceitasResponse,
} from "@/lib/api";
import { mesAtual, primeiroDia, ultimoDia, formatBRL } from "@/lib/utils";
import PeriodoPicker from "@/components/PeriodoPicker";
import { cn } from "@/lib/utils";

const CENTRO_LABEL: Record<string, string> = {
  matriz:        "Matriz",
  aguas_lindoia: "Águas de Lindóia",
};

// ── Modal Nova Despesa ────────────────────────────────────────

function ModalDespesa({
  token, bancos, centros, tipos, onSalvo, onFechar,
}: {
  token: string;
  bancos: Banco[];
  centros: CentroCusto[];
  tipos: TipoLancamento[];
  onSalvo: (item: DespesaItem) => void;
  onFechar: () => void;
}) {
  const [form, setForm] = useState<DespesaCreate>({
    tipo_lancamento_id: "",
    banco_id: "",
    subcategoria: "",
    descricao: "",
    valor: 0,
    competencia: `${mesAtual()}-01`,
    paga_em: "",
    centro_custo: "matriz",
    recorrente: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    if (!form.descricao.trim() || form.valor <= 0 || !form.tipo_lancamento_id) {
      setErro("Preencha Tipo, Descrição e Valor.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const payload: DespesaCreate = {
        ...form,
        tipo_lancamento_id: form.tipo_lancamento_id || undefined,
        banco_id:           form.banco_id           || undefined,
        paga_em:            form.paga_em            || undefined,
        subcategoria:       form.subcategoria       || "geral",
      };
      const item = await api.lancamentos.criarDespesa(token, payload);
      onSalvo(item);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  const tiposDespesa = tipos.filter(t => t.natureza === "despesa" && t.ativo);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold" style={{ color: "#0C1934" }}>Nova Despesa</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{erro}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Lançamento *</label>
              <select
                value={form.tipo_lancamento_id}
                onChange={e => setForm(p => ({ ...p, tipo_lancamento_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione...</option>
                {tiposDespesa.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
              <input
                type="text"
                value={form.descricao}
                onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                placeholder="Ex: Aluguel de sala comercial"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor || ""}
                onChange={e => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Competência */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Competência *</label>
              <input
                type="date"
                value={form.competencia}
                onChange={e => setForm(p => ({ ...p, competencia: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Banco */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Banco</label>
              <select
                value={form.banco_id}
                onChange={e => setForm(p => ({ ...p, banco_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Não informado</option>
                {bancos.filter(b => b.ativo).map(b => (
                  <option key={b.id} value={b.id}>{b.nome}</option>
                ))}
              </select>
            </div>

            {/* Centro de Custo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Centro de Custo</label>
              <select
                value={form.centro_custo}
                onChange={e => setForm(p => ({ ...p, centro_custo: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {centros.filter(c => c.ativo).map(c => (
                  <option key={c.id} value={c.codigo}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Pago em */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pago em</label>
              <input
                type="date"
                value={form.paga_em || ""}
                onChange={e => setForm(p => ({ ...p, paga_em: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Recorrente */}
            <div className="flex items-center gap-2 mt-2">
              <input
                id="recorrente"
                type="checkbox"
                checked={form.recorrente}
                onChange={e => setForm(p => ({ ...p, recorrente: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="recorrente" className="text-sm text-gray-600">Despesa recorrente</label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onFechar} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="px-6 py-2 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
            style={{ backgroundColor: "#0C1934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0C1934")}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Nova Receita ────────────────────────────────────────

function ModalReceita({
  token, bancos, centros, tipos, onSalvo, onFechar,
}: {
  token: string;
  bancos: Banco[];
  centros: CentroCusto[];
  tipos: TipoLancamento[];
  onSalvo: (item: ReceitaItem) => void;
  onFechar: () => void;
}) {
  const [form, setForm] = useState<ReceitaCreate>({
    tipo_lancamento_id: "",
    banco_id: "",
    centro_custo: "matriz",
    descricao: "",
    valor: 0,
    competencia: `${mesAtual()}-01`,
    recebido_em: "",
    observacao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    if (!form.descricao.trim() || form.valor <= 0) {
      setErro("Preencha Descrição e Valor.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const payload: ReceitaCreate = {
        ...form,
        tipo_lancamento_id: form.tipo_lancamento_id || undefined,
        banco_id:           form.banco_id           || undefined,
        recebido_em:        form.recebido_em        || undefined,
        observacao:         form.observacao         || undefined,
      };
      const item = await api.lancamentos.criarReceita(token, payload);
      onSalvo(item);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  const tiposReceita = tipos.filter(t => t.natureza === "receita" && t.ativo);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold" style={{ color: "#0C1934" }}>Nova Receita</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{erro}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Receita</label>
              <select
                value={form.tipo_lancamento_id}
                onChange={e => setForm(p => ({ ...p, tipo_lancamento_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione (opcional)...</option>
                {tiposReceita.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
              <input
                type="text"
                value={form.descricao}
                onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                placeholder="Ex: Honorário consultoria seguro"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor || ""}
                onChange={e => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Competência *</label>
              <input
                type="date"
                value={form.competencia}
                onChange={e => setForm(p => ({ ...p, competencia: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Banco</label>
              <select
                value={form.banco_id}
                onChange={e => setForm(p => ({ ...p, banco_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Não informado</option>
                {bancos.filter(b => b.ativo).map(b => (
                  <option key={b.id} value={b.id}>{b.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Centro de Custo</label>
              <select
                value={form.centro_custo}
                onChange={e => setForm(p => ({ ...p, centro_custo: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {centros.filter(c => c.ativo).map(c => (
                  <option key={c.id} value={c.codigo}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Recebido em</label>
              <input
                type="date"
                value={form.recebido_em || ""}
                onChange={e => setForm(p => ({ ...p, recebido_em: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
              <textarea
                value={form.observacao || ""}
                onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onFechar} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="px-6 py-2 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
            style={{ backgroundColor: "#0C1934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0C1934")}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Principal ────────────────────────────────────────────

type Aba = "despesas" | "receitas";

export default function LancamentosView({ token }: { token: string }) {
  const mes = mesAtual();
  const [inicio, setInicio] = useState(mes);
  const [fim, setFim]       = useState(mes);
  const [aba, setAba]       = useState<Aba>("despesas");

  // Filtros
  const [filtroBanco,  setFiltroBanco]  = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");

  // Dados
  const [despesas, setDespesas] = useState<DespesasResponse | null>(null);
  const [receitas, setReceitas] = useState<ReceitasResponse | null>(null);

  // Parâmetros (para os modais)
  const [bancos,  setBancos]  = useState<Banco[]>([]);
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [tipos,   setTipos]   = useState<TipoLancamento[]>([]);

  // UI
  const [loading,     setLoading]     = useState(false);
  const [erro,        setErro]        = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  // Carrega parâmetros uma vez
  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.configuracoes.bancos(token).then(setBancos).catch(() => {}),
      api.configuracoes.centros(token).then(setCentros).catch(() => {}),
      api.configuracoes.tipos(token).then(setTipos).catch(() => {}),
    ]);
  }, [token]);

  // Carrega dados quando muda filtro ou aba
  useEffect(() => {
    if (!token) return;
    carregar();
  }, [token, inicio, fim, aba, filtroBanco, filtroCentro]);

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const ini = primeiroDia(inicio);
      const fin = ultimoDia(fim);
      const banco   = filtroBanco  || undefined;
      const centro  = filtroCentro || undefined;

      if (aba === "despesas") {
        const d = await api.lancamentos.despesas(token, ini, fin, centro, banco);
        setDespesas(d);
      } else {
        const r = await api.lancamentos.receitas(token, ini, fin, centro, banco);
        setReceitas(r);
      }
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function deletarDespesa(id: string) {
    if (!confirm("Confirmar exclusão desta despesa?")) return;
    try {
      await api.lancamentos.deletarDespesa(token, id);
      setDespesas(prev => prev ? {
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        total: prev.total - 1,
        soma_total: prev.items.filter(i => i.id !== id).reduce((s, i) => s + i.valor, 0),
      } : null);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  async function deletarReceita(id: string) {
    if (!confirm("Confirmar exclusão desta receita?")) return;
    try {
      await api.lancamentos.deletarReceita(token, id);
      setReceitas(prev => prev ? {
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        total: prev.total - 1,
        soma_manuais: prev.items.filter(i => i.id !== id && i.origem === "manual").reduce((s, i) => s + i.valor, 0),
        soma_total:   prev.items.filter(i => i.id !== id).reduce((s, i) => s + i.valor, 0),
      } : null);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const totalDespesas = despesas?.soma_total ?? 0;
  const totalReceitas = receitas?.soma_total ?? 0;
  const saldo = totalReceitas - totalDespesas;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Lançamentos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#3E3E3E" }}>Despesas e receitas por centro de custo e banco</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodoPicker inicio={inicio} fim={fim} onInicio={setInicio} onFim={setFim} />
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 text-white text-sm px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: "#0C1934" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0C1934")}
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
      </div>

      {/* KPIs resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
            <TrendingDown className="w-5 h-5" style={{ color: "#DC2626" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Despesas</p>
            <p className="text-lg font-bold" style={{ color: "#DC2626" }}>{formatBRL(totalDespesas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#C6F0D8" }}>
            <TrendingUp className="w-5 h-5" style={{ color: "#065F46" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Receitas</p>
            <p className="text-lg font-bold" style={{ color: "#065F46" }}>{formatBRL(totalReceitas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: saldo >= 0 ? "#CAE3F2" : "#FEE2E2" }}
          >
            <DollarSign className="w-5 h-5" style={{ color: saldo >= 0 ? "#0C1934" : "#DC2626" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo do Período</p>
            <p className="text-lg font-bold" style={{ color: saldo >= 0 ? "#0C1934" : "#DC2626" }}>
              {formatBRL(saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{erro}</div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs + Filtros */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Abas */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setAba("despesas")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                aba === "despesas"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Despesas {despesas && `(${despesas.total})`}
            </button>
            <button
              onClick={() => setAba("receitas")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                aba === "receitas"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Receitas {receitas && `(${receitas.total})`}
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 sm:ml-auto">
            <select
              value={filtroBanco}
              onChange={e => setFiltroBanco(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            >
              <option value="">Todos os bancos</option>
              {bancos.filter(b => b.ativo).map(b => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
            <select
              value={filtroCentro}
              onChange={e => setFiltroCentro(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            >
              <option value="">Todos os centros</option>
              {centros.filter(c => c.ativo).map(c => (
                <option key={c.id} value={c.codigo}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Tabela Despesas ── */}
        {aba === "despesas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F6F6F4", borderBottom: "1px solid #EBEBEB" }}>
                <tr>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Competência</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Tipo</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Descrição</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Centro</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Banco</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}>Valor</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Pago em</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !despesas || despesas.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Nenhuma despesa no período
                    </td>
                  </tr>
                ) : despesas.items.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {new Date(d.competencia + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {d.tipo_nome ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FBF7F0", color: "#7C5A1A" }}>{d.tipo_nome}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{d.categoria ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{d.descricao}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {CENTRO_LABEL[d.centro_custo] ?? d.centro_custo}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.banco_nome ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">{formatBRL(d.valor)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {d.paga_em
                        ? new Date(d.paga_em + "T12:00:00").toLocaleDateString("pt-BR")
                        : <span className="text-amber-500">Pendente</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deletarDespesa(d.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {despesas && despesas.items.length > 0 && (
                <tfoot style={{ backgroundColor: "#F6F6F4", borderTop: "1px solid #EBEBEB" }}>
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-600">
                      {formatBRL(despesas.soma_total)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* ── Tabela Receitas ── */}
        {aba === "receitas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F6F6F4", borderBottom: "1px solid #EBEBEB" }}>
                <tr>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Competência</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Origem</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Descrição</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Tipo</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Centro</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Banco</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}>Valor</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "#3E3E3E" }}>Recebido em</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "#3E3E3E" }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !receitas || receitas.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      Nenhuma receita no período
                    </td>
                  </tr>
                ) : receitas.items.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {new Date(r.competencia + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={
                          r.origem === "comissao"
                            ? { backgroundColor: "#EEF4FA", color: "#0C1934" }
                            : { backgroundColor: "#EEFBF4", color: "#065F46" }
                        }
                      >
                        {r.origem === "comissao" ? "Comissão" : "Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{r.descricao}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.tipo_nome ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.centro_custo ? (CENTRO_LABEL[r.centro_custo] ?? r.centro_custo) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.banco_nome ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-600">{formatBRL(r.valor)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {r.recebido_em
                        ? new Date(r.recebido_em + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.origem === "manual" ? (
                        <button
                          onClick={() => deletarReceita(r.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-200 text-xs" title="Importado via ETL">•</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {receitas && receitas.items.length > 0 && (
                <tfoot style={{ backgroundColor: "#F6F6F4", borderTop: "1px solid #EBEBEB" }}>
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-600">
                      {formatBRL(receitas.soma_total)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                  <tr className="text-xs text-gray-400">
                    <td colSpan={6} className="px-4 py-1">
                      Comissões: {formatBRL(receitas.soma_comissoes)} · Manuais: {formatBRL(receitas.soma_manuais)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalAberto && aba === "despesas" && (
        <ModalDespesa
          token={token}
          bancos={bancos}
          centros={centros}
          tipos={tipos}
          onSalvo={item => {
            setDespesas(prev => prev ? {
              ...prev,
              items: [item, ...prev.items],
              total: prev.total + 1,
              soma_total: prev.soma_total + item.valor,
            } : { items: [item], total: 1, soma_total: item.valor });
            setModalAberto(false);
          }}
          onFechar={() => setModalAberto(false)}
        />
      )}

      {modalAberto && aba === "receitas" && (
        <ModalReceita
          token={token}
          bancos={bancos}
          centros={centros}
          tipos={tipos}
          onSalvo={item => {
            setReceitas(prev => prev ? {
              ...prev,
              items: [item, ...prev.items],
              total: prev.total + 1,
              soma_manuais: prev.soma_manuais + item.valor,
              soma_total:   prev.soma_total   + item.valor,
            } : {
              items: [item], total: 1,
              soma_comissoes: 0, soma_manuais: item.valor, soma_total: item.valor,
            });
            setModalAberto(false);
          }}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
