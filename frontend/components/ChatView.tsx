"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, Wrench, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  erro?: boolean;
}

interface SSEEvent {
  tipo: "texto" | "tool" | "erro" | "fim";
  conteudo?: string;
  nome?: string;
  status?: "chamando" | "concluido";
  mensagem?: string;
}

export default function ChatView({ token }: { token: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "boas-vindas",
      role: "assistant",
      content:
        "Olá! Sou o assistente de DRE da MX Seguros. Posso ajudar com análises financeiras, comparativos de períodos, receita por ramo, estornos, metas e muito mais. O que você gostaria de saber?",
    },
  ]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toolAtiva, setToolAtiva] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, toolAtiva]);

  async function enviar() {
    if (!input.trim() || enviando) return;
    const pergunta = input.trim();
    setInput("");
    setEnviando(true);
    setToolAtiva(null);

    // Adiciona mensagem do usuário
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: pergunta,
    };
    setMsgs((prev) => [...prev, userMsg]);

    // Placeholder para a resposta do assistente
    const assistId = crypto.randomUUID();
    setMsgs((prev) => [
      ...prev,
      { id: assistId, role: "assistant", content: "", tools: [] },
    ]);

    try {
      const resp = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensagem: pergunta }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const evt: SSEEvent = JSON.parse(raw);

            if (evt.tipo === "texto" && evt.conteudo) {
              setMsgs((prev) =>
                prev.map((m) =>
                  m.id === assistId
                    ? { ...m, content: m.content + evt.conteudo! }
                    : m
                )
              );
            } else if (evt.tipo === "tool" && evt.nome) {
              if (evt.status === "chamando") {
                setToolAtiva(evt.nome);
              } else {
                setToolAtiva(null);
                setMsgs((prev) =>
                  prev.map((m) =>
                    m.id === assistId
                      ? { ...m, tools: [...(m.tools ?? []), evt.nome!] }
                      : m
                  )
                );
              }
            } else if (evt.tipo === "erro") {
              setMsgs((prev) =>
                prev.map((m) =>
                  m.id === assistId
                    ? {
                        ...m,
                        content: evt.mensagem ?? "Erro desconhecido",
                        erro: true,
                      }
                    : m
                )
              );
            } else if (evt.tipo === "fim") {
              setToolAtiva(null);
            }
          } catch {
            // linha malformada, ignorar
          }
        }
      }
    } catch (e: unknown) {
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === assistId
            ? {
                ...m,
                content: e instanceof Error ? e.message : "Erro de conexão",
                erro: true,
              }
            : m
        )
      );
    } finally {
      setEnviando(false);
      setToolAtiva(null);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#0C1934" }}>Assistente IA</h1>
        <p className="text-sm mt-0.5" style={{ color: "#3E3E3E" }}>
          Análises inteligentes do seu DRE — pergunte em português
        </p>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={
                msg.role === "assistant"
                  ? { backgroundColor: "#CAE3F2", color: "#0C1934" }
                  : { backgroundColor: "#E8E2D9", color: "#3E3E3E" }
              }
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            {/* Balão */}
            <div
              className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm")}
              style={
                msg.role === "user"
                  ? { backgroundColor: "#0C1934", color: "#CAE3F2" }
                  : msg.erro
                  ? { backgroundColor: "rgba(239,68,68,0.07)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }
                  : { backgroundColor: "#FFFFFF", color: "#3E3E3E", border: "1px solid #EBEBEB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
              }
            >
              {msg.role === "assistant" && msg.content === "" && !msg.erro ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : msg.erro ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{msg.content}</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}

              {/* Tools chamadas */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.tools.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#EEF4FA", color: "#0C1934" }}
                    >
                      <Wrench className="w-3 h-3" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicador de tool em execução */}
        {toolAtiva && (
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#CAE3F2", color: "#0C1934" }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2 shadow-sm"
              style={{ backgroundColor: "#EEF4FA", color: "#0C1934", border: "1px solid #CAE3F2" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Consultando <strong>{toolAtiva}</strong>...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm flex items-end gap-2 p-3" style={{ border: "1px solid #E5E5E5" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Pergunte sobre o DRE, estornos, metas... (Enter para enviar)"
          disabled={enviando}
          className="flex-1 resize-none bg-transparent text-sm placeholder-gray-400 focus:outline-none max-h-32 leading-relaxed"
          style={{ color: "#0C1934", minHeight: "2rem" }}
        />
        <button
          onClick={enviar}
          disabled={enviando || !input.trim()}
          className="flex-shrink-0 w-9 h-9 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: "#0C1934" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0C1934")}
        >
          {enviando ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
