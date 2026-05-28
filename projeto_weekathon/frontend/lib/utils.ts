import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
