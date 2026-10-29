import {
  Bookmark,
  Bot,
  ClipboardCheck,
  Globe,
  Link2,
  Search,
  TrendingUp,
} from "lucide-react";

export const projectNavItems = [
  {
    to: "/p/$projectId/keywords" as const,
    label: "Palavras-chave",
    icon: Search,
    matchSegment: "/keywords",
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Palavras Salvas",
    icon: Bookmark,
    matchSegment: "/saved",
  },
  {
    to: "/p/$projectId/domain" as const,
    label: "Domínios",
    icon: Globe,
    matchSegment: "/domain",
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks",
    icon: Link2,
    matchSegment: "/backlinks",
  },
  {
    to: "/p/$projectId/rankings" as const,
    label: "Posições",
    icon: TrendingUp,
    matchSegment: "/rankings",
  },
  {
    to: "/p/$projectId/audit" as const,

    label: "Auditoria",
    icon: ClipboardCheck,
    matchSegment: "/audit",
  },
  {
    to: "/p/$projectId/ai" as const,
    label: "Visibilidade em IA",
    icon: Bot,
    matchSegment: "/ai",
  },
] as const;
