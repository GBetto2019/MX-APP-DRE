"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [senha, setSenha]         = useState("");
  const [erro, setErro]           = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha inválidos. Tente novamente.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F6F6F4" }}>

      {/* ── Painel esquerdo (decorativo) ──────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#0C1934" }}
      >
        {/* Círculos decorativos */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5"
          style={{ backgroundColor: "#CAE3F2" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: "#B5A882" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logos/logo_01.png"
            alt="MX Corretora de Seguros"
            width={200}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Copy central */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestão financeira{" "}
            <span style={{ color: "#CAE3F2" }}>inteligente</span>
            <br />em tempo real
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(202,227,242,0.65)" }}>
            DRE atualizado, lançamentos organizados por banco e centro de
            custo, e um assistente com IA pronto para responder suas dúvidas.
          </p>
        </div>

        {/* Footer do painel */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "rgba(202,227,242,0.3)" }}>
            © {new Date().getFullYear()} MX Corretora de Seguros
          </p>
        </div>
      </div>

      {/* ── Painel direito (formulário) ───────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">

        {/* Voltar para landing (mobile) */}
        <div className="w-full max-w-md mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#B5A882" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Logo mobile */}
        <div className="lg:hidden mb-8">
          <Image
            src="/logos/logo_02.png"
            alt="MX Corretora de Seguros"
            width={180}
            height={45}
            className="object-contain"
          />
        </div>

        {/* Card do formulário */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-10">

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#0C1934" }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: "#3E3E3E" }}>
              Acesse com as suas credenciais
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "#0C1934" }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all"
                style={{
                  borderColor: "#E5E5E5",
                  color: "#0C1934",
                  backgroundColor: "#FAFAFA",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0C1934")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
                placeholder="seu@mxseguros.com.br"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "#0C1934" }}
              >
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all"
                style={{
                  borderColor: "#E5E5E5",
                  color: "#0C1934",
                  backgroundColor: "#FAFAFA",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0C1934")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {erro && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#DC2626",
                }}
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#0C1934", color: "#CAE3F2" }}
            >
              {carregando ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>

          <p
            className="text-center text-xs mt-8 leading-relaxed"
            style={{ color: "#B5A882" }}
          >
            Não tem acesso? Fale com o administrador do sistema.
          </p>
        </div>
      </div>

    </div>
  );
}
