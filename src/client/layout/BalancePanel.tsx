import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw, Wallet, X } from "lucide-react";
import { getDataforseoBalance } from "@/serverFunctions/config";

const DATAFORSEO_TOP_UP_URL = "https://app.dataforseo.com/users/getrows";
const LOW_BALANCE_THRESHOLD = 1;

const usdFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const preciseUsdFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

function formatUsd(value: number | null | undefined, precise = false) {
  if (value === null || value === undefined) return "—";
  return (precise ? preciseUsdFormatter : usdFormatter).format(value);
}

function useDataforseoBalance() {
  return useQuery({
    queryKey: ["dataforseo-balance"],
    queryFn: () => getDataforseoBalance(),
    staleTime: 30_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function BalanceButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const query = useDataforseoBalance();
  const balance = query.data?.balance ?? null;
  const isLow = balance !== null && balance < LOW_BALANCE_THRESHOLD;

  // Hide entirely when the API key is not configured.
  if (query.isSuccess && query.data === null) return null;

  return (
    <>
      <button
        type="button"
        className={`btn btn-sm gap-2 ${
          isLow
            ? "btn-warning btn-outline"
            : "btn-ghost text-base-content/80 hover:text-base-content"
        }`}
        onClick={() => {
          setOpen(true);
          void query.refetch();
        }}
        aria-label="Abrir painel de saldo da DataForSEO"
      >
        <Wallet className="size-4" />
        {compact ? null : <span className="hidden lg:inline">Saldo</span>}
        <span className="font-semibold tabular-nums">
          {query.isLoading ? (
            <span className="loading loading-dots loading-xs" />
          ) : query.isError ? (
            "—"
          ) : (
            formatUsd(balance)
          )}
        </span>
      </button>

      {open ? (
        <BalanceSidePanel query={query} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function BalanceSidePanel({
  query,
  onClose,
}: {
  query: ReturnType<typeof useDataforseoBalance>;
  onClose: () => void;
}) {
  const data = query.data;
  const balance = data?.balance ?? null;
  const spent = data?.spent ?? null;
  const total = data?.totalDeposited ?? null;
  const spentPercent =
    total && spent !== null ? Math.min(100, (spent / total) * 100) : 0;
  const isLow = balance !== null && balance < LOW_BALANCE_THRESHOLD;
  const updatedAt = query.dataUpdatedAt
    ? new Date(query.dataUpdatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar painel de saldo"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="balance-panel-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-base-300 bg-base-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <h2
            id="balance-panel-title"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Wallet className="size-5 text-primary" />
            Saldo DataForSEO
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <BalanceDetails
          query={query}
          balance={balance}
          spent={spent}
          total={total}
          spentPercent={spentPercent}
          isLow={isLow}
        />
        <BalanceActions
          query={query}
          updatedAt={updatedAt}
          login={data?.login}
        />
      </aside>
    </div>
  );
}

function BalanceDetails({
  query,
  balance,
  spent,
  total,
  spentPercent,
  isLow,
}: {
  query: ReturnType<typeof useDataforseoBalance>;
  balance: number | null;
  spent: number | null;
  total: number | null;
  spentPercent: number;
  isLow: boolean;
}) {
  return (
    <div className="flex-1 space-y-5 overflow-auto px-5 py-5">
      {query.isError ? (
        <div className="alert alert-error text-sm">
          Não foi possível consultar o saldo. Verifique a chave
          DATAFORSEO_API_KEY e tente novamente.
        </div>
      ) : null}

      <div className="rounded-xl border border-base-300 bg-base-200/60 p-4">
        <p className="text-sm text-base-content/60">Saldo disponível</p>
        <p
          className={`mt-1 text-3xl font-bold tabular-nums ${
            isLow ? "text-warning" : "text-base-content"
          }`}
        >
          {query.isLoading ? (
            <span className="loading loading-dots loading-md" />
          ) : (
            formatUsd(balance)
          )}
        </p>
        {isLow ? (
          <p className="mt-2 text-xs text-warning">
            Saldo baixo: recarregue para continuar usando as pesquisas.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-base-300 p-3">
          <p className="text-xs text-base-content/60">Consumido</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatUsd(spent, true)}
          </p>
        </div>
        <div className="rounded-xl border border-base-300 p-3">
          <p className="text-xs text-base-content/60">Total depositado</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatUsd(total)}
          </p>
        </div>
      </div>

      {total ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-base-content/60">
            <span>Uso do crédito</span>
            <span className="tabular-nums">
              {spentPercent.toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
              })}
              %
            </span>
          </div>
          <progress
            className={`progress w-full ${
              spentPercent > 80 ? "progress-warning" : "progress-primary"
            }`}
            value={spentPercent}
            max={100}
          />
        </div>
      ) : null}

      <div className="rounded-xl border border-base-300 p-3 text-xs text-base-content/70 space-y-1">
        <p className="font-medium text-base-content/80">Custos aproximados</p>
        <p>Pesquisa de palavras-chave (150): ~US$ 0,035</p>
        <p>Visão geral de domínio: ~US$ 0,04</p>
        <p>Backlinks de domínio: ~US$ 0,08</p>
        <p>Auditoria de site: grátis</p>
      </div>
    </div>
  );
}

function BalanceActions({
  query,
  updatedAt,
  login,
}: {
  query: ReturnType<typeof useDataforseoBalance>;
  updatedAt: string | null;
  login: string | null | undefined;
}) {
  return (
    <div className="space-y-2 border-t border-base-300 px-5 py-4">
      <a
        href={DATAFORSEO_TOP_UP_URL}
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary w-full gap-2"
      >
        Recarregar saldo
        <ExternalLink className="size-4" />
      </a>
      <button
        type="button"
        className="btn btn-ghost btn-sm w-full gap-2"
        onClick={() => void query.refetch()}
        disabled={query.isFetching}
      >
        <RefreshCw
          className={`size-4 ${query.isFetching ? "animate-spin" : ""}`}
        />
        Atualizar
      </button>
      {updatedAt ? (
        <p className="text-center text-xs text-base-content/50">
          Atualizado às {updatedAt}
          {login ? ` · login ${login}` : ""}
        </p>
      ) : null}
    </div>
  );
}
