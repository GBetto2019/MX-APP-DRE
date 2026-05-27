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

// Shared input class (without focus ring — using inline style)
const inputCls = "border rounded-xl px-3 py-2 text-sm outline-none transition-all";

function MxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(inputCls, props.className)}
      style={{ borderColor: "#E5E5E5", color: "#0C1934", ...props.style }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#0C1934"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function MxSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(inputCls, "bg-white", props.className)}
      style={{ borderColor: "#E5E5E5", color: "#0C1934", ...props.style }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#0C1934"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function AdicionarBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-white text-sm px-4 py-2 rounded-xl transition-colors"
      style={{ backgroundColor: "#0C1934" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0C1934")}
    >
      {children}
    </button>
  );
}

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

  const theadStyle: React.CSSProperties = { backgroundColor: "#F6F6F4", borderBottom: "1px solid #EBEBEB" };
  const thStyle: React.CSSProperties = { color: "#3E3E3E", fontWeight: 500 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Configurações</h1>
        <p className="text-sm mt-0.5" style={{ color: "#3E3E3E" }}>
          Parâmetros do sistema — exclusivo para Administrador
        </p>
      </div>

      {/* ── BANCOS ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: "#0C1934" }}>Bancos</h2>
          <span className="text-xs text-gray-400">{bancos.length} registros</span>
        </div>

        {erroBancos && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
            {erroBancos}
          </div>
        )}

        {/* Form adicionar */}
        <div className="px-6 pt-4 pb-2 flex gap-2">
          <MxInput
            type="text"
            placeholder="Nome do banco"
            value={novoBanco}
            onChange={e => setNovoBanco(e.target.value)}
            onKeyDown={e => e.key === "Enter" && salvarBanco()}
            className="flex-1"
          />
          <AdicionarBtn onClick={salvarBanco}>
            <Plus className="w-4 h-4" /> Adicionar
          </AdicionarBtn>
        </div>

        <table className="w-full text-sm">
          <thead style={theadStyle}>
            <tr>
              <th className="px-6 py-3 text-left" style={thStyle}>Nome</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Status</th>
              <th className="px-6 py-3 text-right" style={thStyle}>Ações</th>
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
                    <MxInput
                      type="text"
                      value={editBanco.nome}
                      onChange={e => setEditBanco({ ...editBanco, nome: e.target.value })}
                      className="w-48"
                      autoFocus
                    />
                  ) : (
                    <span className={cn(!b.ativo ? "text-gray-400 line-through" : "")} style={b.ativo ? { color: "#0C1934" } : undefined}>
                      {b.nome}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={b.ativo
                      ? { backgroundColor: "#EEFBF4", color: "#065F46" }
                      : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {b.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editBanco?.id === b.id ? (
                      <>
                        <button onClick={confirmarEditBanco} style={{ color: "#065F46" }}>
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
                          style={{ color: "#1E3A5F" }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleAtivoBanco(b)}
                          style={{ color: b.ativo ? "#DC2626" : "#065F46" }}
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
          <h2 className="font-semibold" style={{ color: "#0C1934" }}>Centros de Custo</h2>
          <span className="text-xs text-gray-400">{centros.length} registros</span>
        </div>

        {erroCentros && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
            {erroCentros}
          </div>
        )}

        <div className="px-6 pt-4 pb-2 flex gap-2">
          <MxInput
            type="text"
            placeholder="Nome (ex: Filial SP)"
            value={novoCentro.nome}
            onChange={e => setNovoCentro(prev => ({ ...prev, nome: e.target.value }))}
            className="flex-1"
          />
          <MxInput
            type="text"
            placeholder="Código (ex: filial_sp)"
            value={novoCentro.codigo}
            onChange={e => setNovoCentro(prev => ({ ...prev, codigo: e.target.value }))}
            className="w-40"
          />
          <AdicionarBtn onClick={salvarCentro}>
            <Plus className="w-4 h-4" /> Adicionar
          </AdicionarBtn>
        </div>

        <table className="w-full text-sm">
          <thead style={theadStyle}>
            <tr>
              <th className="px-6 py-3 text-left" style={thStyle}>Nome</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Código</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Status</th>
              <th className="px-6 py-3 text-right" style={thStyle}>Ações</th>
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
                    <MxInput
                      type="text"
                      value={editCentro.nome}
                      onChange={e => setEditCentro({ ...editCentro, nome: e.target.value })}
                      className="w-48"
                      autoFocus
                    />
                  ) : (
                    <span className={cn(!c.ativo ? "text-gray-400 line-through" : "")} style={c.ativo ? { color: "#0C1934" } : undefined}>
                      {c.nome}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <code className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#F6F6F4", color: "#3E3E3E" }}>{c.codigo}</code>
                </td>
                <td className="px-6 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={c.ativo
                      ? { backgroundColor: "#EEFBF4", color: "#065F46" }
                      : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {c.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editCentro?.id === c.id ? (
                      <>
                        <button onClick={confirmarEditCentro} style={{ color: "#065F46" }}>
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
                          style={{ color: "#1E3A5F" }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleAtivoCentro(c)}
                          style={{ color: c.ativo ? "#DC2626" : "#065F46" }}
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
          <h2 className="font-semibold" style={{ color: "#0C1934" }}>Tipos de Lançamento</h2>
          <span className="text-xs text-gray-400">{tipos.length} registros</span>
        </div>

        {erroTipos && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
            {erroTipos}
          </div>
        )}

        {/* Form novo tipo */}
        <div className="px-6 pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <MxInput
            type="text"
            placeholder="Nome do tipo"
            value={novoTipo.nome}
            onChange={e => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
            className="lg:col-span-2"
          />
          <MxSelect
            value={novoTipo.natureza}
            onChange={e => setNovoTipo(prev => ({ ...prev, natureza: e.target.value as "despesa" | "receita" }))}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </MxSelect>
          {novoTipo.natureza === "despesa" && (
            <>
              <MxSelect
                value={novoTipo.custo_tipo}
                onChange={e => setNovoTipo(prev => ({ ...prev, custo_tipo: e.target.value }))}
              >
                <option value="fixo">Custo Fixo</option>
                <option value="variavel">Custo Variável</option>
                <option value="nao_operacional">Não Operacional</option>
              </MxSelect>
              <MxSelect
                value={novoTipo.categoria}
                onChange={e => setNovoTipo(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="">Categoria DRE (opcional)</option>
                {CATEGORIAS_DRE.map(cat => (
                  <option key={cat} value={cat}>{CATEGORIA_LABEL[cat]}</option>
                ))}
              </MxSelect>
            </>
          )}
          <AdicionarBtn onClick={salvarTipo}>
            <Plus className="w-4 h-4" /> Adicionar
          </AdicionarBtn>
        </div>

        <table className="w-full text-sm">
          <thead style={theadStyle}>
            <tr>
              <th className="px-6 py-3 text-left" style={thStyle}>Nome</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Natureza</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Tipo de Custo</th>
              <th className="px-6 py-3 text-left" style={thStyle}>Categoria DRE</th>
              <th className="px-6 py-3 text-right" style={thStyle}>Ativo</th>
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
                  <span className={cn(!t.ativo ? "text-gray-400 line-through" : "")} style={t.ativo ? { color: "#0C1934" } : undefined}>
                    {t.nome}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={
                      t.natureza === "despesa"
                        ? { backgroundColor: "#FEF2F2", color: "#DC2626" }
                        : { backgroundColor: "#EEF4FA", color: "#0C1934" }
                    }
                  >
                    {t.natureza === "despesa" ? "Despesa" : "Receita"}
                  </span>
                </td>
                <td className="px-6 py-3" style={{ color: "#3E3E3E" }}>
                  {t.custo_tipo ? CUSTO_TIPO_LABEL[t.custo_tipo] : "—"}
                </td>
                <td className="px-6 py-3" style={{ color: "#3E3E3E" }}>
                  {t.categoria ? CATEGORIA_LABEL[t.categoria] ?? t.categoria : "—"}
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => toggleAtivoTipo(t)}
                    style={{ color: t.ativo ? "#DC2626" : "#065F46" }}
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
