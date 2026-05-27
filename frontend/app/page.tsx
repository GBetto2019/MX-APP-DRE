import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  Lock,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// ── Paleta MX Seguros ─────────────────────────────────────────
// Navy:       #0C1934
// Azul claro: #CAE3F2
// Carvão:     #3E3E3E
// Khaki:      #B5A882
// Cinza bg:   #F6F6F4

// ── Dados ────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BarChart3,
    titulo: "DRE em Tempo Real",
    descricao:
      "Demonstrativo de Resultados atualizado automaticamente. Receita bruta, despesas, EBITDA e resultado líquido sempre à mão.",
    cor: "#0C1934",
  },
  {
    icon: Bot,
    titulo: "Assistente com IA",
    descricao:
      "Pergunte em português sobre qualquer dado financeiro. A IA analisa o DRE e responde com precisão e contexto.",
    cor: "#B5A882",
  },
  {
    icon: BookOpen,
    titulo: "Lançamentos",
    descricao:
      "Registre despesas e receitas manualmente, separadas por centro de custo e banco (Itaú, Santander, Sicredi).",
    cor: "#0C1934",
  },
  {
    icon: Target,
    titulo: "Metas e Performance",
    descricao:
      "Acompanhe o atingimento de metas da equipe e de cada produtor com indicadores visuais em tempo real.",
    cor: "#B5A882",
  },
  {
    icon: TrendingDown,
    titulo: "Controle de Estornos",
    descricao:
      "Monitore estornos de comissões por período. Alerta automático quando a taxa ultrapassa 5% da receita.",
    cor: "#0C1934",
  },
  {
    icon: Lock,
    titulo: "Acesso por Perfil",
    descricao:
      "Cada usuário vê apenas o que precisa. Dados sensíveis (despesas, EBITDA) ficam restritos ao nível adequado.",
    cor: "#B5A882",
  },
];

const PERFIS = [
  {
    role: "Admin",
    cor: "#0C1934",
    corTexto: "#CAE3F2",
    acessos: [
      "DRE completo",
      "Lançamentos (CRUD)",
      "Configurações do sistema",
      "Repasses e metas",
      "Log de auditoria",
    ],
  },
  {
    role: "Contador",
    cor: "#3E3E3E",
    corTexto: "#CAE3F2",
    acessos: [
      "DRE completo",
      "Despesas e receitas",
      "Comissões e estornos",
      "Repasses",
      "Metas (visualização)",
    ],
  },
  {
    role: "Gestor",
    cor: "#B5A882",
    corTexto: "#0C1934",
    acessos: [
      "DRE até Margem de Contribuição",
      "Receita por ramo",
      "Performance da equipe",
      "Estornos",
      "Metas da equipe",
    ],
  },
  {
    role: "Comercial",
    cor: "#CAE3F2",
    corTexto: "#0C1934",
    acessos: [
      "Comissões próprias",
      "Estornos próprios",
      "Metas individuais",
      "Repasses próprios",
      "Assistente IA",
    ],
  },
];

const PASSOS = [
  {
    num: "01",
    titulo: "Acesse com seu e-mail",
    descricao:
      "Entre com o e-mail e senha cadastrados pelo administrador. O sistema identifica seu perfil automaticamente.",
  },
  {
    num: "02",
    titulo: "Selecione o período",
    descricao:
      "Escolha mês de início e fim. Todos os dados — DRE, comissões, metas — são filtrados pelo período selecionado.",
  },
  {
    num: "03",
    titulo: "Analise e decida",
    descricao:
      "Visualize os indicadores, pergunte ao Assistente IA ou registre novos lançamentos. Simples e rápido.",
  },
];

// ── Componente ────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased">

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "#0C1934", borderColor: "rgba(202,227,242,0.1)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/logos/logo_01.png"
            alt="MX Corretora de Seguros"
            width={160}
            height={40}
            className="object-contain"
          />
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
            style={{ backgroundColor: "#B5A882", color: "#0C1934" }}
          >
            Entrar no sistema
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#0C1934" }}
      >
        {/* Decorativo: círculos de fundo */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ backgroundColor: "#CAE3F2" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ backgroundColor: "#B5A882" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: "rgba(181,168,130,0.15)", color: "#B5A882" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistema interno · Acesso restrito
            </div>

            {/* Headline */}
            <h1
              className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: "#FFFFFF" }}
            >
              Gestão financeira{" "}
              <span style={{ color: "#CAE3F2" }}>inteligente</span>
              <br />para a MX Seguros
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: "rgba(202,227,242,0.75)" }}>
              Acompanhe o DRE em tempo real, registre lançamentos, analise
              metas e obtenha insights financeiros com apoio de Inteligência
              Artificial — tudo em uma única plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#B5A882", color: "#0C1934" }}
              >
                Acessar o sistema
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base border transition-all duration-200"
                style={{
                  borderColor: "rgba(202,227,242,0.3)",
                  color: "#CAE3F2",
                }}
              >
                Conhecer o sistema
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 mt-16 pt-10" style={{ borderTop: "1px solid rgba(202,227,242,0.1)" }}>
              {[
                { val: "4 perfis", label: "de acesso" },
                { val: "100%", label: "dados em tempo real" },
                { val: "IA", label: "integrada ao DRE" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold" style={{ color: "#CAE3F2" }}>{s.val}</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(202,227,242,0.5)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FUNCIONALIDADES ═════════════════════════════════ */}
      <section id="funcionalidades" className="py-24 lg:py-32" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Título */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#B5A882" }}>
              O que você encontra aqui
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "#0C1934" }}>
              Tudo que a equipe precisa
            </h2>
            <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#3E3E3E" }}>
              Cada módulo foi pensado para facilitar o dia a dia financeiro da
              corretora, do lançamento de despesas à análise do resultado.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, titulo, descricao, cor }) => (
              <div
                key={titulo}
                className="group relative p-7 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: "#FAFAFA" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: cor === "#0C1934" ? "#0C1934" : "#B5A882" }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0C1934" }}>
                  {titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  {descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PERFIS DE ACESSO ════════════════════════════════ */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "#F6F6F4" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#B5A882" }}>
              Controle de permissões
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "#0C1934" }}>
              Cada perfil, o que precisa
            </h2>
            <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#3E3E3E" }}>
              O sistema exibe automaticamente apenas as informações relevantes
              para o seu nível de acesso. Sem configuração manual.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERFIS.map(({ role, cor, corTexto, acessos }) => (
              <div
                key={role}
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                {/* Header do card */}
                <div className="px-6 py-5" style={{ backgroundColor: cor }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: corTexto, opacity: 0.7 }}>
                    Perfil
                  </p>
                  <h3 className="text-2xl font-bold" style={{ color: corTexto }}>
                    {role}
                  </h3>
                </div>
                {/* Lista de acessos */}
                <div className="px-6 py-5">
                  <ul className="space-y-2.5">
                    {acessos.map((a) => (
                      <li key={a} className="flex items-start gap-2.5 text-sm" style={{ color: "#3E3E3E" }}>
                        <TrendingUp
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: "#B5A882" }}
                        />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ═══════════════════════════════════ */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#B5A882" }}>
              Simples e rápido
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "#0C1934" }}>
              Como usar o sistema
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {PASSOS.map(({ num, titulo, descricao }, i) => (
              <div key={num} className="relative">
                {/* Linha conectora (não no último) */}
                {i < PASSOS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px -ml-4"
                    style={{ backgroundColor: "rgba(12,25,52,0.1)" }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6"
                  style={{ backgroundColor: "#0C1934", color: "#CAE3F2" }}
                >
                  {num}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#0C1934" }}>
                  {titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  {descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: "#F6F6F4" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="rounded-3xl px-10 py-14 shadow-xl"
            style={{ backgroundColor: "#0C1934" }}
          >
            <Image
              src="/logos/logo_01.png"
              alt="MX Seguros"
              width={180}
              height={45}
              className="mx-auto mb-8 object-contain"
            />
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-base mb-8" style={{ color: "rgba(202,227,242,0.75)" }}>
              Acesse com as credenciais fornecidas pelo administrador.
              Em caso de dúvidas, fale com o responsável do sistema.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#B5A882", color: "#0C1934" }}
            >
              Entrar no sistema
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#0C1934" }}>
        <div
          className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(202,227,242,0.1)" }}
        >
          <Image
            src="/logos/logo_01.png"
            alt="MX Seguros"
            width={130}
            height={33}
            className="object-contain"
          />
          <p className="text-xs" style={{ color: "rgba(202,227,242,0.4)" }}>
            © {new Date().getFullYear()} MX Corretora de Seguros · Sistema DRE-IA · Todos os direitos reservados
          </p>
        </div>
      </footer>

    </div>
  );
}
