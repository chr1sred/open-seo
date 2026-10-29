import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSavedKeywords,
  removeSavedKeyword,
} from "@/serverFunctions/keywords";
import { clusterKeywords } from "@/serverFunctions/aiTools";
import { Trash2, Download, Search, Loader2, AlertCircle } from "lucide-react";
import { buildCsv, downloadCsv } from "@/client/lib/csv";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export const Route = createFileRoute("/p/$projectId/saved")({
  component: SavedKeywordsPage,
});

function SavedKeywordsPage() {
  const { projectId } = Route.useParams();
  const queryClient = useQueryClient();
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: savedKeywordsData, isLoading } = useQuery({
    queryKey: ["savedKeywords", projectId],
    queryFn: () => getSavedKeywords({ data: { projectId } }),
  });
  const savedKeywords = savedKeywordsData?.rows ?? [];

  const removeMutation = useMutation({
    mutationFn: (savedKeywordId: string) =>
      removeSavedKeyword({ data: { savedKeywordId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["savedKeywords", projectId],
      });
      toast.success("Palavra-chave removida");
    },
    onError: (error) => {
      setRemoveError(getStandardErrorMessage(error, "Falha ao remover."));
    },
  });

  const clusterMutation = useMutation({
    mutationFn: (pId: string) => clusterKeywords({ data: { projectId: pId } }),
    onSuccess: (res: any) => {
      if (res.success && res.clustersUpdated > 0) {
        toast.success(
          `${res.clustersUpdated} palavras-chave agrupadas com sucesso!`,
        );
        void queryClient.invalidateQueries({
          queryKey: ["savedKeywords", projectId],
        });
      } else if (res.error) {
        toast.error(`Falha no agrupamento automático: ${res.error}`);
      } else {
        toast.error("Nenhuma palavra-chave precisou ser agrupada.");
      }
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Falha no agrupamento com IA."),
      );
    },
  });

  const handleRemoveKeyword = (savedKeywordId: string) => {
    setRemoveError(null);
    setRemovingId(savedKeywordId);
    removeMutation.mutate(savedKeywordId, {
      onSettled: () => {
        setRemovingId((current) =>
          current === savedKeywordId ? null : current,
        );
      },
    });
  };

  const exportCsv = () => {
    if (savedKeywords.length === 0) {
      toast.error("Não há palavras-chave para exportar");
      return;
    }

    const headers = [
      "Palavra-chave",
      "Volume",
      "CPC",
      "Concorrência",
      "Dificuldade",
      "Intenção",
      "Atualizado em",
    ];
    const csvRows = savedKeywords.map((kw) => [
      kw.keyword,
      kw.searchVolume ?? "",
      kw.cpc?.toFixed(2) ?? "",
      kw.competition?.toFixed(2) ?? "",
      kw.keywordDifficulty ?? "",
      kw.intent ?? "",
      kw.fetchedAt ?? "",
    ]);
    const csv = buildCsv(headers, csvRows);
    downloadCsv("saved-keywords.csv", csv);
  };

  return (
    <SavedKeywordsContent
      isLoading={isLoading}
      isClustering={clusterMutation.isPending}
      removeError={removeError}
      removingId={removingId}
      savedKeywords={savedKeywords}
      onExportCsv={exportCsv}
      onRemoveKeyword={handleRemoveKeyword}
      onCluster={() => clusterMutation.mutate(projectId)}
    />
  );
}

function SavedKeywordsContent({
  isLoading,
  isClustering,
  removeError,
  removingId,
  savedKeywords,
  onExportCsv,
  onRemoveKeyword,
  onCluster,
}: {
  isLoading: boolean;
  isClustering?: boolean;
  removeError: string | null;
  removingId: string | null;
  savedKeywords: Array<{
    id: string;
    keyword: string;
    searchVolume: number | null;
    cpc: number | null;
    competition: number | null;
    keywordDifficulty: number | null;
    intent: string | null;
    fetchedAt: string | null;
    aiCluster?: string | null;
  }>;
  onExportCsv: () => void;
  onRemoveKeyword: (savedKeywordId: string) => void;
  onCluster: () => void;
}) {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Palavras Salvas</h1>
            <p className="text-sm text-base-content/70">
              Palavras-chave que você salvou na pesquisa de palavras-chave.
            </p>
          </div>
          {savedKeywords.length > 0 && (
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={onCluster}
                disabled={isClustering}
              >
                {isClustering ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "✨"
                )}
                Agrupar com IA
              </button>
              <button className="btn btn-sm" onClick={onExportCsv}>
                <Download className="size-4" /> Exportar CSV
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3" aria-busy>
              <div className="skeleton h-4 w-48" />
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 gap-3 items-center"
                >
                  <div className="skeleton h-4 col-span-2" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                </div>
              ))}
            </div>
          </div>
        ) : savedKeywords.length === 0 ? (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body text-center py-12 text-base-content/50">
              <Search className="size-8 mx-auto mb-2 opacity-40" />
              <p>
                Nenhuma palavra-chave salva ainda. Use a página de
                Palavras-chave para encontrar e salvar termos.
              </p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              {removeError ? (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{removeError}</span>
                </div>
              ) : null}
              <p className="text-sm text-base-content/70">
                {savedKeywords.length} palavra
                {savedKeywords.length !== 1 ? "s-chave salvas" : "-chave salva"}
              </p>
              <SavedKeywordsTable
                rows={savedKeywords}
                removingId={removingId}
                onRemoveKeyword={onRemoveKeyword}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const INTENT_LABELS: Record<string, string> = {
  informational: "Informacional",
  commercial: "Comercial",
  transactional: "Transacional",
  navigational: "Navegacional",
};

function SavedKeywordsTable({
  rows,
  removingId,
  onRemoveKeyword,
}: {
  rows: Array<{
    id: string;
    keyword: string;
    searchVolume: number | null;
    cpc: number | null;
    competition: number | null;
    keywordDifficulty: number | null;
    intent: string | null;
    fetchedAt: string | null;
    aiCluster?: string | null;
  }>;
  removingId: string | null;
  onRemoveKeyword: (savedKeywordId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-sm">
        <thead>
          <tr>
            <th>Palavra-chave</th>
            <th>Volume</th>
            <th>CPC</th>
            <th>Concorrência</th>
            <th>Dificuldade</th>
            <th>Intenção</th>
            <th>Grupo (IA)</th>
            <th>Atualizado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((kw) => (
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
