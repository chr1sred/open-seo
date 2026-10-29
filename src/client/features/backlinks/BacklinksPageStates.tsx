import {
  Link2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { BacklinksAccessStatusData } from "./backlinksPageTypes";
import { formatRelativeTimestamp } from "./backlinksPageUtils";

export function BacklinksAccessLoadingState() {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-10 w-48" />
      </div>
    </div>
  );
}

export function BacklinksSetupGate({
  status,
  isTesting,
  testError,
  onTest,
}: {
  status: BacklinksAccessStatusData | undefined;
  isTesting: boolean;
  testError: string | null;
  onTest: () => void;
}) {
  return (
    <section>
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 md:p-7 space-y-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-warning/15 p-2.5 text-warning shrink-0">
            <Wrench className="size-5" />
          </div>
          <div className="max-w-3xl space-y-1.5">
            <h2 className="text-xl font-semibold">Ativar Backlinks</h2>
            <p className="text-sm text-base-content/68">
              O módulo de Backlinks ainda não está ativo na sua conta
              DataForSEO. Ative-o na DataForSEO e depois teste o acesso aqui.
            </p>
            <p className="text-xs text-base-content/50">
              A DataForSEO oferece 14 dias grátis de Backlinks. Depois, custa
              US$ 100/mês. Há planos de uma alternativa mais barata:{" "}
              <InlineMailingListLink /> se tiver interesse.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="btn btn-primary"
            onClick={onTest}
            disabled={isTesting}
          >
            {isTesting ? "Confirmando..." : "Confirmar acesso aos Backlinks"}
          </button>
          <a
            className="btn btn-outline"
            href="https://app.dataforseo.com/api-access-subscriptions"
            target="_blank"
            rel="noreferrer"
          >
            Abrir Backlinks na DataForSEO
          </a>
        </div>

        <BacklinksSetupFeedback status={status} testError={testError} />
      </div>
    </section>
  );
}

export function BacklinksEmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-8 text-center space-y-3">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Link2 className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium">
          Comece com um domínio ou URL de página
        </p>
        <p className="mx-auto max-w-2xl text-sm text-base-content/65">
          Pesquisa de backlinks sem complicação: veja quem aponta para você,
          quais páginas atraem links e os ganhos ou perdas recentes, sem se
          perder em painéis corporativos de SEO.
        </p>
      </div>
      <div className="grid gap-3 pt-2 text-left md:grid-cols-3">
        <BeginnerCard
          icon={TrendingUp}
          title="Verifique a saúde dos links"
          body="Use a visão geral para ver o total de backlinks, domínios de referência e links quebrados que valem a correção."
        />
        <BeginnerCard
          icon={Sparkles}
          title="Revise os links reais"
          body="Comece pela aba de backlinks para ver as páginas que apontam para você e as fontes mais fortes primeiro."
        />
        <BeginnerCard
          icon={ShieldAlert}
          title="Encontre ações fáceis"
          body="Procure destinos quebrados, links perdidos recentemente e suas páginas mais linkadas para decidir o próximo passo."
        />
      </div>
    </section>
  );
}

export function BacklinksLoadingState() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3 p-4">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-64 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div className="skeleton h-8 w-60" />
          <div className="skeleton h-80 w-full" />
        </div>
      </div>
    </div>
  );
}

export function BacklinksErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string | null;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-error/30 bg-error/5 p-6 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-error/10 p-2.5 text-error shrink-0">
          <ShieldAlert className="size-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Não foi possível carregar os backlinks
          </h2>
          <p className="text-sm text-base-content/70">
            {errorMessage ?? "Tente novamente em instantes."}
          </p>
        </div>
      </div>
      <button className="btn btn-outline btn-sm" onClick={onRetry}>
        Tentar novamente
      </button>
    </section>
  );
}

function BacklinksSetupFeedback({
  status,
  testError,
}: {
  status: BacklinksAccessStatusData | undefined;
  testError: string | null;
}) {
  return (
    <div className="space-y-3">
      {status?.lastCheckedAt ? (
        <div className="text-sm text-base-content/60">
          Última verificação: {formatRelativeTimestamp(status.lastCheckedAt)}.
        </div>
      ) : null}
      {status?.lastErrorMessage ? (
        <div className="alert alert-warning">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{status.lastErrorMessage}</span>
        </div>
      ) : null}
      {testError ? (
        <div className="alert alert-error">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{testError}</span>
        </div>
      ) : null}
    </div>
  );
}

function BeginnerCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2">
      <Icon className="size-4 text-primary" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-base-content/65">{body}</p>
    </div>
  );
}

function InlineMailingListLink() {
  return (
    <a
      className="underline underline-offset-2 hover:text-base-content/70"
      href="https://openseo.so"
      target="_blank"
      rel="noreferrer"
    >
      entre na lista de e-mails do OpenSEO
    </a>
  );
}
