import { ArrowDown, ArrowUp } from "lucide-react";
import { HeaderHelpLabel } from "@/client/features/keywords/components";
import {
  getNextSort,
  type BacklinksTableSort,
  type ReferringDomainsTableSort,
  type SortDirection,
  type TopPagesTableSort,
} from "./backlinksTableSorting";

export function BacklinksTableHeader({
  sort,
  onSortChange,
}: {
  sort: BacklinksTableSort;
  onSortChange: (sort: BacklinksTableSort) => void;
}) {
  return (
    <thead>
      <tr>
        <SortableHeaderCell
          label="Origem"
          helpText="Página ou domínio que aponta para você"
          field="source"
          defaultDirection="asc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Destino"
          helpText="Destino no seu site"
          field="target"
          defaultDirection="asc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Âncora"
          helpText="Texto ou formato do link"
          field="anchor"
          defaultDirection="asc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <th>
          <HeaderHelpLabel
            label="Sinais"
            helpText="Atributos especiais do backlink, como perdido, quebrado, nofollow ou vários links da mesma origem."
          />
        </th>
        <SortableHeaderCell
          align="right"
          label="Link"
          helpText="Autoridade da página que aponta o link"
          field="linkAuthority"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          align="right"
          label="DA"
          helpText="Autoridade do domínio que aponta o link"
          field="domainAuthority"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Visto em"
          helpText="Quando o rastreador encontrou este link pela primeira vez"
          field="firstSeen"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
      </tr>
    </thead>
  );
}

export function ReferringDomainsTableHeader({
  sort,
  onSortChange,
}: {
  sort: ReferringDomainsTableSort;
  onSortChange: (sort: ReferringDomainsTableSort) => void;
}) {
  return (
    <thead>
      <tr>
        <SortableHeaderCell
          label="Domínio"
          helpText="O site de referência que aponta para o seu alvo."
          field="domain"
          defaultDirection="asc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Backlinks"
          helpText="Total de backlinks encontrados vindos deste domínio."
          field="backlinks"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Páginas de referência"
          helpText="Páginas únicas deste domínio que apontam para o seu alvo."
          field="referringPages"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Autoridade"
          helpText="Pontuação de autoridade do domínio de referência."
          field="rank"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Spam"
          helpText="Risco de spam deste domínio de referência."
          field="spamScore"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Visto em"
          helpText="Quando este domínio foi visto apontando para o seu alvo pela primeira vez."
          field="firstSeen"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Problemas"
          helpText="Quantidade de links e páginas quebradas ligadas a este domínio."
          field="issues"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
      </tr>
    </thead>
  );
}

export function TopPagesTableHeader({
  sort,
  onSortChange,
}: {
  sort: TopPagesTableSort;
  onSortChange: (sort: TopPagesTableSort) => void;
}) {
  return (
    <thead>
      <tr>
        <SortableHeaderCell
          label="Página"
          helpText="Página do site alvo que recebe backlinks."
          field="page"
          defaultDirection="asc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Backlinks"
          helpText="Total de backlinks apontando para esta página."
          field="backlinks"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Domínios de referência"
          helpText="Domínios únicos que apontam para esta página."
          field="referringDomains"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Autoridade"
          helpText="Pontuação de autoridade desta página."
          field="rank"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
        <SortableHeaderCell
          label="Backlinks quebrados"
          helpText="Backlinks apontando para cá que estão quebrados."
          field="brokenBacklinks"
          defaultDirection="desc"
          sort={sort}
          onSortChange={onSortChange}
        />
      </tr>
    </thead>
  );
}

function SortableHeaderCell<TField extends string>({
  align,
  label,
  helpText,
  field,
  defaultDirection,
  sort,
  onSortChange,
}: {
  align?: "left" | "right";
  label: string;
  helpText: string;
  field: TField;
  defaultDirection: SortDirection;
  sort: { field: TField; direction: SortDirection };
  onSortChange: (sort: { field: TField; direction: SortDirection }) => void;
}) {
  const isActive = sort.field === field;
  const content = (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium transition-colors hover:text-base-content"
      onClick={() => onSortChange(getNextSort(sort, field, defaultDirection))}
      aria-label={`Ordenar por ${label}`}
      aria-pressed={isActive}
    >
      <HeaderHelpLabel label={label} helpText={helpText} />
      {isActive ? (
        sort.direction === "asc" ? (
          <ArrowUp className="size-3 shrink-0" />
        ) : (
          <ArrowDown className="size-3 shrink-0" />
        )
      ) : null}
    </button>
  );

  return (
    <th className={align === "right" ? "text-right" : undefined}>
      {align === "right" ? (
        <span className="inline-flex justify-end">{content}</span>
      ) : (
        content
      )}
    </th>
  );
}
