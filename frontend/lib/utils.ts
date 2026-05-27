import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número como moeda BRL */
export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formata número como percentual */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/** Retorna "YYYY-MM" do mês atual */
export function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Retorna "YYYY-MM-DD" do primeiro dia do mês */
export function primeiroDia(mes: string): string {
  return `${mes}-01`;
}

/** Retorna "YYYY-MM-DD" do último dia do mês */
export function ultimoDia(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  const ultimo = new Date(ano, m, 0);
  return ultimo.toISOString().slice(0, 10);
}

/** Label legível para role */
export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  comercial: "Comercial",
  contador: "Contador",
};
