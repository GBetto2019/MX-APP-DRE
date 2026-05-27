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

// MX Seguros brand palette
const CORES: Record<string, { bg: string; iconBg: string; iconColor: string; valor: string }> = {
  azul: {
    bg: "#EEF4FA",
    iconBg: "#CAE3F2",
    iconColor: "#0C1934",
    valor: "#0C1934",
  },
  verde: {
    bg: "#EEFBF4",
    iconBg: "#C6F0D8",
    iconColor: "#065F46",
    valor: "#065F46",
  },
  vermelho: {
    bg: "#FEF2F2",
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
    valor: "#DC2626",
  },
  amarelo: {
    bg: "#FBF7F0",
    iconBg: "#EDE0CA",
    iconColor: "#7C5A1A",
    valor: "#7C5A1A",
  },
  roxo: {
    bg: "#EFF2FA",
    iconBg: "#D0DBEF",
    iconColor: "#1E3A5F",
    valor: "#1E3A5F",
  },
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
    <div
      className="rounded-2xl p-5 border shadow-sm"
      style={{ backgroundColor: c.bg, borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: "#3E3E3E" }}>{titulo}</p>
          {bloqueado || valor == null ? (
            <p className="mt-1 text-2xl font-bold text-gray-300">—</p>
          ) : (
            <p className="mt-1 text-2xl font-bold" style={{ color: c.valor }}>
              {formatBRL(valor)}
            </p>
          )}
          {subtitulo && (
            <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: c.iconBg, color: c.iconColor }}
        >
          <Icone className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
