import { FileDown, RotateCcw, Save, SlidersHorizontal } from "lucide-react";
import {
  KeywordCard,
  SerpAnalysisCard,
} from "@/client/features/keywords/components";
import type { KeywordResearchControllerState } from "./types";

type Props = {
  controller: KeywordResearchControllerState;
};

export function KeywordResearchMobileResults({ controller }: Props) {
  const { filteredRows, mobileTab } = controller;

  return (
    <div className="flex-1 flex flex-col overflow-hidden md:hidden">
      <div className="shrink-0 flex border-b border-base-300 bg-base-100">
        <button
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            mobileTab === "keywords"
              ? "border-primary text-primary"
              : "border-transparent text-base-content/60"
          }`}
          onClick={() => controller.setMobileTab("keywords")}
        >
          Palavras-chave ({filteredRows.length})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            mobileTab === "serp"
              ? "border-primary text-primary"
              : "border-transparent text-base-content/60"
          }`}
          onClick={() => controller.setMobileTab("serp")}
        >
          Análise da SERP
        </button>
      </div>

      {mobileTab === "keywords" ? (
        <MobileKeywordCards controller={controller} />
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <SerpAnalysisCard
            items={controller.serpResults}
            keyword={controller.activeSerpKeyword}
            loading={controller.serpLoading}
            error={controller.serpError}
            onRetry={() => void controller.serpQuery.refetch()}
            page={controller.serpPage}
            pageSize={controller.SERP_PAGE_SIZE}
            onPageChange={controller.setSerpPage}
          />
        </div>
      )}
    </div>
  );
}

function MobileKeywordCards({ controller }: Props) {
  const { activeFilterCount, filteredRows, selectedRows, showFilters } =
    controller;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {controller.showApproximateMatchNotice ? (
        <div
          className="mx-4 mt-2 rounded-lg border border-warning/40 bg-warning/15 px-3 py-2 text-xs text-base-content"
          role="status"
        >
          Nenhuma correspondência exata para{" "}
          <span className="font-medium">"{controller.searchedKeyword}"</span>.
          Mostrando as palavras-chave relacionadas mais próximas.
        </div>
      ) : null}

      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-base-300 bg-base-100">
        <button
          className={`btn btn-ghost btn-xs gap-1 ${showFilters ? "btn-active" : ""}`}
          onClick={() => controller.setShowFilters((current) => !current)}
        >
          <SlidersHorizontal className="size-3.5" />
          Filtros
          {activeFilterCount > 0 ? (
            <span className="badge badge-xs badge-primary border-0 text-primary-content">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <span className="text-xs text-base-content/60">
          {selectedRows.size > 0
            ? `${selectedRows.size} selecionadas`
            : `${filteredRows.length} palavras-chave`}
        </span>
        <div className="flex-1" />
        <button
          className="btn btn-ghost btn-xs"
          onClick={controller.handleSaveKeywords}
          disabled={selectedRows.size === 0}
        >
          <Save className="size-3.5" />
        </button>
        <button
          className="btn btn-ghost btn-xs"
          onClick={controller.exportCsv}
          disabled={filteredRows.length === 0}
        >
          <FileDown className="size-3.5" />
        </button>
      </div>

      {showFilters ? <MobileFilters controller={controller} /> : null}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRows.length === 0 ? (
          <div className="h-full min-h-48 flex flex-col items-center justify-center text-center px-4 text-base-content/50 gap-3">
            <p className="text-sm font-medium">
              Nenhuma palavra-chave corresponde aos filtros atuais.
            </p>
            {activeFilterCount > 0 ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={controller.resetFilters}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : (
          filteredRows.map((row) => (
            <KeywordCard
              key={row.keyword}
              row={row}
              isSelected={selectedRows.has(row.keyword)}
              isActive={controller.overviewKeyword?.keyword === row.keyword}
              onToggle={() => controller.toggleRowSelection(row.keyword)}
              onClick={() => controller.handleRowClick(row)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MobileFilters({ controller }: Props) {
  const { activeFilterCount, filtersForm } = controller;

  return (
    <div className="shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">Refinar resultados</p>
          {activeFilterCount > 0 ? (
            <span className="badge badge-xs badge-primary border-0 text-primary-content">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <button
          className="btn btn-xs btn-ghost gap-1"
          onClick={controller.resetFilters}
          disabled={activeFilterCount === 0}
        >
          <RotateCcw className="size-3" />
          Limpar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <filtersForm.Field name="include">
          {(field) => (
            <input
              className="input input-bordered input-sm bg-base-100"
              placeholder="Incluir termos (curso, grátis)"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </filtersForm.Field>
        <filtersForm.Field name="exclude">
          {(field) => (
            <input
              className="input input-bordered input-sm bg-base-100"
              placeholder="Excluir termos (vagas, emprego)"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </filtersForm.Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MobileRangeInput
          form={filtersForm}
          name="minVol"
          placeholder="Volume mín."
        />
        <MobileRangeInput
          form={filtersForm}
          name="maxVol"
          placeholder="Volume máx."
        />
        <MobileRangeInput
          form={filtersForm}
          name="minCpc"
          placeholder="CPC mín."
          step="0.01"
        />
        <MobileRangeInput
          form={filtersForm}
          name="maxCpc"
          placeholder="CPC máx."
          step="0.01"
        />
        <MobileRangeInput
          form={filtersForm}
          name="minKd"
          placeholder="Dificuldade mín."
        />
        <MobileRangeInput
          form={filtersForm}
          name="maxKd"
          placeholder="Dificuldade máx."
        />
      </div>
    </div>
  );
}

function MobileRangeInput({
  form,
  name,
  placeholder,
  step,
}: {
  form: KeywordResearchControllerState["filtersForm"];
  name: "minVol" | "maxVol" | "minCpc" | "maxCpc" | "minKd" | "maxKd";
  placeholder: string;
  step?: string;
}) {
  return (
    <form.Field name={name}>
      {(field) => (
        <input
          className="input input-bordered input-sm bg-base-100"
          placeholder={placeholder}
          type="number"
          step={step}
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)}
        />
      )}
    </form.Field>
  );
}
