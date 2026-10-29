import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  const message = getStandardErrorMessage(
    error,
    "Algo deu errado. Tente novamente.",
  );
  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <p className="text-center text-error">{message}</p>
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => {
            void router.invalidate();
          }}
          className="btn btn-neutral btn-sm uppercase"
        >
          Tentar novamente
        </button>
        {isRoot ? (
          <Link to="/" className="btn btn-neutral btn-sm uppercase">
            Início
          </Link>
        ) : (
          <Link
            to="/"
            className="btn btn-neutral btn-sm uppercase"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Voltar
          </Link>
        )}
      </div>
    </div>
  );
}
