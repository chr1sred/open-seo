import type { BacklinksTab } from "@/types/schemas/backlinks";
import type { BacklinksOverviewData } from "./backlinksPageTypes";

export const TAB_DESCRIPTIONS: Record<BacklinksTab, string> = {
  backlinks:
    "Veja cada link que aponta para o seu alvo, com página de origem, texto âncora e sinais de qualidade.",
  domains:
    "Veja os domínios únicos que apontam para o seu alvo, agrupados por site em vez de link a link.",
  pages:
    "Veja quais páginas do site alvo atraem mais backlinks e domínios de referência.",
};

export function buildSummaryStats(data: BacklinksOverviewData | undefined) {
  if (!data) return [];

  return [
    {
      label: "Backlinks",
      value: formatNumber(data.summary.backlinks),
      description: "Total de links apontando para este site ou página.",
    },
    {
      label: "Domínios de referência",
      value: formatNumber(data.summary.referringDomains),
      description: "Domínios únicos que apontam para este site ou página.",
    },
    {
      label: "Páginas de referência",
      value: formatNumber(data.summary.referringPages),
      description: "Páginas únicas que apontam para este site ou página.",
    },
    {
      label: "Autoridade",
      value: formatNumber(data.summary.rank),
      description: "Pontuação de autoridade de 0 a 100 da DataForSEO.",
    },
    {
      label: "Spam dos backlinks",
      value: formatDecimal(data.summary.backlinksSpamScore),
      description: "Risco estimado de spam dos links que apontam para cá.",
    },
    {
      label: "Backlinks quebrados",
      value: formatNumber(data.summary.brokenBacklinks),
      description: "Links que apontam para páginas quebradas daqui.",
    },
    {
      label: "Páginas quebradas",
      value: formatNumber(data.summary.brokenPages),
      description: "Páginas quebradas daqui que ainda recebem backlinks.",
    },
    {
      label: "Spam do alvo",
      value: formatDecimal(data.summary.targetSpamScore),
      description: "Risco estimado de spam deste site ou página.",
    },
  ];
}

export function formatNumber(value: number | null | undefined) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(Math.round(value));
}

export function formatDecimal(value: number | null | undefined) {
  if (value == null) return "-";
  return value.toFixed(value >= 100 ? 0 : 1);
}

export function formatTooltipValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;
  return "-";
}

export function formatCompactDate(value: string | null | undefined) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

export function formatRelativeTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "recentemente";
  return parsed.toLocaleString("pt-BR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function extractUrlPath(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

export function truncateMiddle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const sideLength = Math.floor((maxLength - 1) / 2);
  return `${value.slice(0, sideLength)}...${value.slice(-sideLength)}`;
}
