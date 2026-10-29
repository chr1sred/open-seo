import { useMemo, useState } from "react";
import { Trash2, Loader2, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const INTENT_LABELS: Record<string, string> = {
  informational: "Informacional",
  commercial: "Comercial",
  transactional: "Transacional",
  navigational: "Navegacional",
};

type SavedKeywordTableRow = {
  id: string;
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  keywordDifficulty: number | null;
  intent: string | null;
  fetchedAt: string | null;
  aiCluster?: string | null;
};

type SortField =
  | "keyword"
  | "searchVolume"
  | "cpc"
  | "competition"
  | "keywordDifficulty";
type SortState = { field: SortField; direction: "asc" | "desc" } | null;

function useSortedRows(rows: SavedKeywordTableRow[], sort: SortState) {
  return useMemo(() => {
    if (!sort) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    return rows.toSorted((a, b) => {
      if (sort.field === "keyword") {
        return factor * a.keyword.localeCompare(b.keyword, "pt-BR");
      }
      const left = a[sort.field];
      const right = b[sort.field];
      // Rows without data always go last, whatever the direction.
      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;
      return factor * (left - right);
    });
  }, [rows, sort]);
}

function SortableTh({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
}) {
  const isActive = sort?.field === field;
  const Icon = !isActive
    ? ArrowUpDown
    : sort.direction === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <th
      aria-sort={
        isActive
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1 hover:text-base-content ${
          isActive ? "text-primary" : ""
        }`}
        onClick={() => onSort(field)}
        title={`Ordenar por ${label.toLowerCase()}`}
      >
        {label}
        <Icon className={`size-3.5 ${isActive ? "" : "opacity-40"}`} />
      </button>
    </th>
  );
}

export function SavedKeywordsTable({
  rows,
  removingId,
  onRemoveKeyword,
}: {
  rows: SavedKeywordTableRow[];
  removingId: string | null;
  onRemoveKeyword: (savedKeywordId: string) => void;
}) {
  const [sort, setSort] = useState<SortState>(null);
  const sortedRows = useSortedRows(rows, sort);

  // First click: largest first (A-Z for keywords); second click flips.
  const handleSort = (field: SortField) => {
    setSort((current) => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: field === "keyword" ? "asc" : "desc" };
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-sm">
        <thead>
          <tr>
            <SortableTh
              label="Palavra-chave"
              field="keyword"
              sort={sort}
              onSort={handleSort}
            />
            <SortableTh
              label="Volume"
              field="searchVolume"
              sort={sort}
              onSort={handleSort}
            />
            <SortableTh
              label="CPC"
              field="cpc"
              sort={sort}
              onSort={handleSort}
            />
            <SortableTh
              label="Concorrência"
              field="competition"
              sort={sort}
              onSort={handleSort}
            />
            <SortableTh
              label="Dificuldade"
              field="keywordDifficulty"
              sort={sort}
              onSort={handleSort}
            />
            <th>Intenção</th>
            <th>Grupo (IA)</th>
            <th>Atualizado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((kw) => (
            <tr key={kw.id}>
              <td className="font-medium">{kw.keyword}</td>
              <td>{formatNumber(kw.searchVolume)}</td>
              <td>{kw.cpc == null ? "-" : `$${kw.cpc.toFixed(2)}`}</td>
              <td>
                {kw.competition == null ? "-" : kw.competition.toFixed(2)}
              </td>
              <td>
                <DifficultyBadge value={kw.keywordDifficulty} />
              </td>
              <td>
                <span className="badge badge-sm badge-ghost">
                  {(kw.intent && INTENT_LABELS[kw.intent]) ?? kw.intent ?? "?"}
                </span>
              </td>
              <td>
                {kw.aiCluster ? (
                  <span className="badge badge-sm badge-info badge-outline border-info/30 bg-info/5 font-semibold">
                    {kw.aiCluster}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="text-xs text-base-content/50">
                {kw.fetchedAt
                  ? new Date(kw.fetchedAt).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => onRemoveKeyword(kw.id)}
                  disabled={removingId === kw.id}
                  title="Remover"
                >
                  {removingId === kw.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DifficultyBadge({ value }: { value: number | null }) {
  if (value == null)
    return <span className="badge badge-ghost badge-sm">-</span>;
  if (value < 30)
    return <span className="badge badge-success badge-sm">{value}</span>;
  if (value <= 60)
    return <span className="badge badge-warning badge-sm">{value}</span>;
  return <span className="badge badge-error badge-sm">{value}</span>;
}

function formatNumber(value: number | null | undefined) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(value);
}
