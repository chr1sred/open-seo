import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/serverFunctions/keywords";

export const PROJECTS_QUERY_KEY = ["projects"] as const;

export type ProjectSummary = Awaited<ReturnType<typeof listProjects>>[number];

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => listProjects(),
    staleTime: 30_000,
  });
}

export function formatProjectDate(value: string | null | undefined) {
  if (!value) return "-";
  // SQLite current_timestamp is UTC without a timezone suffix.
  const normalized = value.includes("T")
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
