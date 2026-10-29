import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import type { DomainOverviewData } from "@/client/features/domain/types";

type SaveMutation = (payload: {
  projectId: string;
  keywords: string[];
  locationCode: number;
  languageCode: string;
  metrics?: Array<{
    keyword: string;
    searchVolume?: number | null;
    cpc?: number | null;
    keywordDifficulty?: number | null;
  }>;
}) => void;

type SaveOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function saveSelectedKeywords({
  selectedKeywords,
  filteredKeywords,
  save,
  projectId,
}: {
  selectedKeywords: Set<string>;
  filteredKeywords: DomainOverviewData["keywords"];
  save: (payload: Parameters<SaveMutation>[0], opts?: SaveOptions) => void;
  projectId: string;
}) {
  if (selectedKeywords.size === 0) {
    toast.error("Selecione pelo menos uma palavra-chave");
    return;
  }

  const selectedRows = filteredKeywords.filter((row) =>
    selectedKeywords.has(row.keyword),
  );
  save(
    {
      projectId,
      keywords: [...selectedKeywords],
      locationCode: 2076,
      languageCode: "pt",
      metrics: selectedRows.map((row) => ({
        keyword: row.keyword,
        searchVolume: row.searchVolume,
        cpc: row.cpc,
        keywordDifficulty: row.keywordDifficulty,
      })),
    },
    {
      onSuccess: () => {
        toast.success(`${selectedKeywords.size} palavras-chave salvas`);
      },
      onError: (error: unknown) => {
        toast.error(getStandardErrorMessage(error, "Falha ao salvar."));
      },
    },
  );
}
