import { createFileRoute } from "@tanstack/react-router";

const DATAFORSEO_API_ACCESS_URL = "https://app.dataforseo.com/api-access";

export const Route = createFileRoute("/help/dataforseo-api-key")({
  component: DataforseoApiKeyHelpPage,
});

function DataforseoApiKeyHelpPage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h1 className="text-2xl font-semibold">
              Configure sua chave da API DataForSEO
            </h1>
            <p className="text-sm text-base-content/70">
              O OpenSEO precisa da variável <code>DATAFORSEO_API_KEY</code> para
              buscar dados de palavras-chave, domínios e SEO.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <h2 className="card-title text-base">Passo a passo</h2>
            <ol className="list-decimal pl-5 text-sm space-y-3 text-base-content/80">
              <li>
                Acesse{" "}
                <a
                  className="link link-primary"
                  href={DATAFORSEO_API_ACCESS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  DataForSEO API Access
                </a>{" "}
                e copie o valor do campo <b>Base64 format</b> (ou peça as
                credenciais da API por e-mail).
              </li>
              <li>
                Se preferir gerar manualmente, codifique em Base64 o login e a
                senha da API neste formato:
                <pre className="mt-2 p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs">
                  <code>printf '%s' 'SEU_LOGIN:SUA_SENHA_API' | base64</code>
                </pre>
              </li>
              <li>
                Salve o resultado na variável <code>DATAFORSEO_API_KEY</code> do
                seu ambiente.
              </li>
            </ol>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-2 text-sm text-base-content/75">
            <h2 className="card-title text-base">
              Hospedagem própria (CapRover / Docker)
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-base-content/80">
              <li>
                No CapRover, abra o app do OpenSEO e vá em{" "}
                <code>Configurações do App</code> -&gt;{" "}
                <code>Variáveis de Ambiente</code>.
              </li>
              <li>
                Adicione a variável
                <code className="mx-1">DATAFORSEO_API_KEY</code>
                com o valor em Base64.
              </li>
              <li>
                Clique em <code>Salvar &amp; Reiniciar</code>.
              </li>
            </ol>
            <p>
              Com Docker Compose, defina <code>DATAFORSEO_API_KEY</code> no
              arquivo <code>.env</code> e rode <code>docker compose up -d</code>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
