import { cn, formatBRL } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: number | null | undefined;
  icone: LucideIcon;
  cor?: "azul" | "verde" | "vermelho" | "amarelo" | "roxo";
  subtitulo?: string;
  bloqueado?: boolean;
}

const CORES = {
  azul:     { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   valor: "text-blue-700" },
  verde:    { bg: "bg-green-50",  icon: "bg-green-100 text-green-600",  valor: "text-green-700" },
  vermelho: { bg: "bg-red-50",    icon: "bg-red-100 text-red-600",      valor: "text-red-700" },
  amarelo:  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-600",  valor: "text-amber-700" },
  roxo:     { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600",valor: "text-purple-700" },
};

export default function KpiCard({
  titulo,
  valor,
  icone: Icone,
  cor = "azul",
  subtitulo,
  bloqueado = false,
}: KpiCardProps) {
  const c = CORES[cor];

  return (
    <div className={cn("rounded-2xl p-5 border border-gray-100 shadow-sm", c.bg)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{titulo}</p>
          {bloqueado || valor == null ? (
            <p className="mt-1 text-2xl font-bold text-gray-300">—</p>
          ) : (
            <p className={cn("mt-1 text-2xl font-bold", c.valor)}>
              {formatBRL(valor)}
            </p>
          )}
          {subtitulo && (
            <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", c.icon)}>
          <Icone className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
