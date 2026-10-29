import type {
  LaunchState,
  SettingsFormApi,
} from "@/client/features/audit/launch/types";

export function SettingsModal({
  settingsForm,
  state,
  setState,
  onClear,
  onSave,
}: {
  settingsForm: SettingsFormApi;
  state: LaunchState;
  setState: React.Dispatch<React.SetStateAction<LaunchState>>;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="card w-full max-w-lg bg-base-100 border border-base-300 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-base">Configurações da auditoria</h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setState((prev) => ({ ...prev, isSettingsOpen: false }))
              }
            >
              Fechar
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-base-content/70">
              Chave da API Google PageSpeed Insights
            </label>
            <div className="flex gap-2">
              <settingsForm.Field name="psiApiKey">
                {(field) => (
                  <input
                    type={state.showPsiKey ? "text" : "password"}
                    className="input input-bordered flex-1"
                    placeholder="Chave da API do Google"
                    value={field.state.value}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      if (state.settingsError || state.psiRequirementError) {
                        setState((prev) => ({
                          ...prev,
                          settingsError: null,
                          psiRequirementError: null,
                        }));
                      }
                    }}
                  />
                )}
              </settingsForm.Field>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showPsiKey: !prev.showPsiKey,
                  }))
                }
              >
                {state.showPsiKey ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="text-xs text-base-content/50">
              Fica salva neste projeto e é usada pelo PSI e pela Auditoria.
              Necessária para rodar testes de PageSpeed nas auditorias.
            </p>
            <PsiKeyHelp />
            {state.settingsError ? (
              <p className="text-sm text-error">{state.settingsError}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="btn btn-ghost btn-sm text-error"
              onClick={onClear}
            >
              Remover chave
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PsiKeyHelp() {
  return (
    <div className="rounded-md border border-base-300 bg-base-200/30 p-3 text-xs text-base-content/70 space-y-1.5">
      <p className="font-medium text-base-content/80">
        Precisa de uma chave PSI? (gratuita)
      </p>
      <ol className="list-decimal list-inside space-y-1">
        <li>
          Abra o{" "}
          <a
            className="link link-primary"
            href="https://developers.google.com/speed/docs/insights/v5/get-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            guia de introdução do PageSpeed Insights
          </a>{" "}
          e clique em "Get a key".
        </li>
        <li>Crie qualquer projeto no Google Cloud (por exemplo: Open SEO).</li>
        <li>Cole a chave aqui e salve.</li>
      </ol>
    </div>
  );
}
