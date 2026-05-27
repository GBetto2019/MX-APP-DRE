"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Check, X, Power } from "lucide-react";
import { api, Banco, CentroCusto, TipoLancamento } from "@/lib/api";
import { cn } from "@/lib/utils";

const CUSTO_TIPO_LABEL: Record<string, string> = {
  fixo:             "Custo Fixo",
  variavel:         "Custo Variável",
  nao_operacional:  "Não Operacional",
};

const CATEGORIA_LABEL: Record<string, string> = {
  pessoal:                      "Pessoal",
  comercial:                    "Comercial",
  administrativa_operacional:   "Administrativa / Operacional",
  veiculos:                     "Veículos",
  terceiros:                    "Terceiros",
  financeira:                   "Financeira",
  nao_operacional:              "Não Operacional",
  investimento_imobilizado:     "Investimento / Imobilizado",
};

const CATEGORIAS_DRE = Object.keys(CATEGORIA_LABEL);

export default function ConfiguracoesView({ token }: { token: string }) {
  // ── Bancos ────────────────────────────────────────────────
  const [bancos, setBancos]         = useState<Banco[]>([]);
  const [novoBanco, setNovoBanco]   = useState("");
  const [editBanco, setEditBanco]   = useState<{ id: string; nome: string } | null>(null);
  const [loadBancos, setLoadBancos] = useState(false);
  const [erroBancos, setErroBancos] = useState("");

  async function carregarBancos() {
    setLoadBancos(true);
    try {
      setBancos(await api.configuracoes.bancos(token));
    } catch (e: unknown) {
      setErroBancos(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoadBancos(false);
    }
  }

  async function salvarBanco() {
    if (!novoBanco.trim()) return;
    try {
      const b = await api.configuracoes.criarBanco(token, { nome: novoBanco.trim() });
      setBancos(prev => [...prev, b]);
      setNovoBanco("");
    } catch (e: unknown) {
      setErroBancos(e instanceof Error ? e.message : "Erro");
    }
  }

  async function confirmarEditBanco() {
    if (!editBanco) return;
    try {
      const b = await api.configuracoes.editarBanco(token, editBanco.id, { nome: editBanco.nome });
      setBancos(prev => prev.map(x => x.id === b.id ? b : x));
      setEditBanco(null);
    } catch (e: unknown) {
      setErroBancos(e instanceof Error ? e.message : "Erro");
    }
  }

  async function toggleAtivoBanco(banco: Banco) {
    try {
      const b = await api.configuracoes.editarBanco(token, banco.id, { ativo: !banco.ativo });
      setBancos(prev => prev.map(x => x.id === b.id ? b : x));
    } catch (e: unknown) {
      setErroBancos(e instanceof Error ? e.message : "Erro");
    }
  }

  // ── Centros de Custo ──────────────────────────────────────
  const [centros, setCentros]         = useState<CentroCusto[]>([]);
  const [novoCentro, setNovoCentro]   = useState({ nome: "", codigo: "" });
  const [editCentro, setEditCentro]   = useState<{ id: string; nome: string } | null>(null);
  const [loadCentros, setLoadCentros] = useState(false);
  const [erroCentros, setErroCentros] = useState("");

  async function carregarCentros() {
    setLoadCentros(true);
    try {
      setCentros(await api.configuracoes.centros(token));
    } catch (e: unknown) {
      setErroCentros(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoadCentros(false);
    }
  }

  async function salvarCentro() {
    if (!novoCentro.nome.trim() || !novoCentro.codigo.trim()) return;
    try {
      const c = await api.configuracoes.criarCentro(token, {
        nome:   novoCentro.nome.trim(),
        codigo: novoCentro.codigo.trim().toLowerCase().replace(/\s+/g, "_"),
      });
      setCentros(prev => [...prev, c]);
      setNovoCentro({ nome: "", codigo: "" });
    } catch (e: unknown) {
      setErroCentros(e instanceof Error ? e.message : "Erro");
    }
  }

  async function confirmarEditCentro() {
    if (!editCentro) return;
    try {
      const c = await api.configuracoes.editarCentro(token, editCentro.id, { nome: editCentro.nome });
      setCentros(prev => prev.map(x => x.id === c.id ? c : x));
      setEditCentro(null);
    } catch (e: unknown) {
      setErroCentros(e instanceof Error ? e.message : "Erro");
    }
  }

  async function toggleAtivoCentro(centro: CentroCusto) {
    try {
      const c = await api.configuracoes.editarCentro(token, centro.id, { ativo: !centro.ativo });
      setCentros(prev => prev.map(x => x.id === c.id ? c : x));
    } catch (e: unknown) {
      setErroCentros(e instanceof Error ? e.message : "Erro");
    }
  }

  // ── Tipos de Lançamento ───────────────────────────────────
  const [tipos, setTipos]       = useState<TipoLancamento[]>([]);
  const [novoTipo, setNovoTipo] = useState<{
    nome: string; natureza: "despesa" | "receita";
    categoria: string; custo_tipo: string;
  }>({ nome: "", natureza: "despesa", categoria: "", custo_tipo: "fixo" });
  const [loadTipos, setLoadTipos] = useState(false);
  const [erroTipos, setErroTipos] = useState("");

  async function carregarTipos() {
    setLoadTipos(true);
    try {
      setTipos(await api.configuracoes.tipos(token));
    } catch (e: unknown) {
      setErroTipos(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoadTipos(false);
    }
  }

  async function salvarTipo() {
    if (!novoTipo.nome.trim()) return;
    try {
      const t = await api.configuracoes.criarTipo(token, {
        nome:       novoTipo.nome.trim(),
        natureza:   novoTipo.natureza,
        categoria:  novoTipo.natureza === "despesa" && novoTipo.categoria ? novoTipo.categoria : null,
        custo_tipo: novoTipo.natureza === "despesa" && novoTipo.custo_tipo ? novoTipo.custo_tipo : null,
      } as never);
      setTipos(prev => [...prev, t]);
      setNovoTipo({ nome: "", natureza: "despesa", categoria: "", custo_tipo: "fixo" });
    } catch (e: unknown) {
      setErroTipos(e instanceof Error ? e.message : "Erro");
    }
  }

  async function toggleAtivoTipo(tipo: TipoLancamento) {
    try {
      if (tipo.ativo) {
        await api.configuracoes.deletarTipo(token, tipo.id);
        setTipos(prev => prev.map(x => x.id === tipo.id ? { ...x, ativo: false } : x));
      } else {
        const t = await api.configuracoes.editarTipo(token, tipo.id, { ativo: true });
        setTipos(prev => prev.map(x => x.id === t.id ? t : x));
      }
    } catch (e: unknown) {
      setErroTipos(e instanceof Error ? e.message : "Erro");
    }
  }

  useEffect(() => {
    carregarBancos();
    carregarCentros();
    carregarTipos();
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Parâmetros do sistema — exclusivo para Administrador
        </p>
      </div>

      {/* ── BANCOS ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Bancos</h2>
          <span className="text-xs text-gray-400">{bancos.length} registros</span>
        </div>

        {erroBancos && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
            {erroBancos}
          </div>
        )}

        {/* Form adicionar */}
        <div className="px-6 pt-4 pb-2 flex gap-2">
          <input
            type="text"
            placeholder="Nome do banco"
            value={novoBanco}
            onChange={e => setNovoBanco(e.target.value)}
            onKeyDown={e => e.key === "Enter" && salvarBanco()}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={salvarBanco}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Nome</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loadBancos ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">Carregando...</td></tr>
            ) : bancos.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">Nenhum banco cadastrado</td></tr>
            ) : bancos.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3">
                  {editBanco?.id === b.id ? (
                    <input
                      type="text"
                      value={editBanco.nome}
                      onChange={e => setEditBanco({ ...editBanco, nome: e.target.value })}
                      className="border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      autoFocus
                    />
                  ) : (
                    <span className={cn("text-gray-700", !b.ativo && "text-gray-400 line-through")}>
                      {b.nome}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    b.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {b.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editBanco?.id === b.id ? (
                      <>
                        <button onClick={confirmarEditBanco} className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditBanco(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditBanco({ id: b.id, nome: b.nome })}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleAtivoBanco(b)}
                          className={cn(b.ativo ? "text-red-400 hover:text-red-600" : "text-green-500 hover:text-green-700")}
                          title={b.ativo ? "Desativar" : "Ativar"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── CENTROS DE CUSTO ──────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Centros de Custo</h2>
          <span className="text-xs text-gray-400">{centros.length} registros</span>
        </div>

        {erroCentros && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
            {erroCentros}
          </div>
        )}

        <div className="px-6 pt-4 pb-2 flex gap-2">
          <input
            type="text"
            placeholder="Nome (ex: Filial SP)"
            value={novoCentro.nome}
            onChange={e => setNovoCentro(prev => ({ ...prev, nome: e.target.value }))}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Código (ex: filial_sp)"
            value={novoCentro.codigo}
            onChange={e => setNovoCentro(prev => ({ ...prev, codigo: e.target.value }))}
            className="w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={salvarCentro}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Nome</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Código</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loadCentros ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Carregando...</td></tr>
            ) : centros.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">Nenhum centro cadastrado</td></tr>
            ) : centros.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3">
                  {editCentro?.id === c.id ? (
                    <input
                      type="text"
                      value={editCentro.nome}
                      onChange={e => setEditCentro({ ...editCentro, nome: e.target.value })}
                      className="border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none w-48"
                      autoFocus
                    />
                  ) : (
                    <span className={cn("text-gray-700", !c.ativo && "text-gray-400 line-through")}>
                      {c.nome}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <code className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{c.codigo}</code>
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    c.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editCentro?.id === c.id ? (
                      <>
                        <button onClick={confirmarEditCentro} className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditCentro(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditCentro({ id: c.id, nome: c.nome })}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleAtivoCentro(c)}
                          className={cn(c.ativo ? "text-red-400 hover:text-red-600" : "text-green-500 hover:text-green-700")}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── TIPOS DE LANÇAMENTO ───────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Tipos de Lançamento</h2>
          <span className="text-xs text-gray-400">{tipos.length} registros</span>
        </div>

        {erroTipos && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
            {erroTipos}
          </div>
        )}

        {/* Form novo tipo */}
        <div className="px-6 pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Nome do tipo"
            value={novoTipo.nome}
            onChange={e => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
            className="lg:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={novoTipo.natureza}
            onChange={e => setNovoTipo(prev => ({ ...prev, natureza: e.target.value as "despesa" | "receita" }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
          {novoTipo.natureza === "despesa" && (
            <>
              <select
                value={novoTipo.custo_tipo}
                onChange={e => setNovoTipo(prev => ({ ...prev, custo_tipo: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="fixo">Custo Fixo</option>
                <option value="variavel">Custo Variável</option>
                <option value="nao_operacional">Não Operacional</option>
              </select>
              <select
                value={novoTipo.categoria}
                onChange={e => setNovoTipo(prev => ({ ...prev, categoria: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Categoria DRE (opcional)</option>
                {CATEGORIAS_DRE.map(cat => (
                  <option key={cat} value={cat}>{CATEGORIA_LABEL[cat]}</option>
                ))}
              </select>
            </>
          )}
          <button
            onClick={salvarTipo}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Nome</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Natureza</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Tipo de Custo</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Categoria DRE</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {loadTipos ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-400">Carregando...</td></tr>
            ) : tipos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-400">Nenhum tipo cadastrado</td></tr>
            ) : tipos.map(t => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3">
                  <span className={cn("text-gray-700", !t.ativo && "text-gray-400 line-through")}>{t.nome}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    t.natureza === "despesa" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {t.natureza === "despesa" ? "Despesa" : "Receita"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {t.custo_tipo ? CUSTO_TIPO_LABEL[t.custo_tipo] : "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {t.categoria ? CATEGORIA_LABEL[t.categoria] ?? t.categoria : "—"}
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => toggleAtivoTipo(t)}
                    className={cn(
                      "transition-colors",
                      t.ativo ? "text-red-400 hover:text-red-600" : "text-green-500 hover:text-green-700"
                    )}
                    title={t.ativo ? "Desativar" : "Ativar"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
