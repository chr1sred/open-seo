# Self-hosting no CapRover (100% VPS, sem Cloudflare)

Esta versão do OpenSEO roda inteira na sua VPS. Não precisa de conta na Cloudflare, de Cloudflare Access nem de Workers AI.

## Como funciona

O app continua sendo um "Worker", mas executado pelo **workerd**, o runtime open-source que o `wrangler dev --local` usa. Todos os recursos ficam em disco, dentro do container:

| Recurso | Na Cloudflare | Nesta versão (VPS) |
|---|---|---|
| Banco de dados (D1) | Cloudflare D1 | SQLite local em `/app/.wrangler/state` |
| Cache (KV) | Workers KV | Arquivos locais em `/app/.wrangler/state` |
| Arquivos (R2) | R2 | Arquivos locais em `/app/.wrangler/state` |
| Site Audit (Workflows) | Cloudflare Workflows | Workflows locais (workerd) |
| Login | Cloudflare Access | Basic Auth opcional (`BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD`) |
| IA (correções, clusters, sentimento) | Workers AI | Qualquer API compatível com OpenAI (`LLM_*`) |
| Cron diário | Cron Triggers | Agendador dentro do container (`CRON_HOUR_UTC`) |
| Telemetria / `Request.cf` | Ativos | Desligados (`WRANGLER_SEND_METRICS=false`, `CLOUDFLARE_CF_FETCH_ENABLED=false`) |

As únicas chamadas externas são para as APIs que você configurar: DataForSEO, Google PageSpeed (chave por projeto), seu provedor de LLM e o webhook do Discord.

## Deploy

1. No CapRover, abra o app (ex.: `openseo`) e vá em **Deployment**.
2. Use o método **Deploy from GitHub/Bitbucket/Gitlab**, apontando para este repositório e para a branch desejada. O CapRover lê o `captain-definition` e monta o `Dockerfile` automaticamente.
3. Em **HTTP Settings**, deixe **Container HTTP Port = 80**.
4. Em **App Configs → Persistent Directories**, adicione:
   - **Path in App:** `/app/.wrangler/state`
   - **Label:** `openseo-data`

   ⚠️ Sem isso, o banco é **apagado a cada deploy**.

   Se o app foi criado sem "Has Persistent Data" (a seção de diretórios persistentes não aparece), use o **Service Update Override**:

   ```json
   {
     "TaskTemplate": {
       "ContainerSpec": {
         "Mounts": [
           { "Type": "volume", "Source": "openseo-data", "Target": "/app/.wrangler/state" }
         ]
       }
     }
   }
   ```
5. Em **App Configs → Environmental Variables**, configure:

| Variável | Obrigatória | Exemplo / Descrição |
|---|---|---|
| `DATAFORSEO_API_KEY` | ✅ | Base64 de `login:senha` (`printf '%s' 'LOGIN:SENHA' \| base64`) |
| `BASIC_AUTH_USER` | Recomendado | `admin` |
| `BASIC_AUTH_PASSWORD` | Recomendado | Uma senha forte. Sem ela, qualquer pessoa que achar a URL consome seus créditos |
| `LLM_API_KEY` | Opcional | Chave do provedor de IA. Sem ela, os recursos de IA ficam desativados |
| `LLM_BASE_URL` | Opcional | `https://api.openai.com/v1` (padrão), `https://openrouter.ai/api/v1`, `https://api.groq.com/openai/v1`, `https://generativelanguage.googleapis.com/v1beta/openai` |
| `LLM_MODEL` | Opcional | `gpt-4o-mini` (padrão), `google/gemini-2.0-flash-001`, `llama-3.1-8b-instant`... |
| `CRON_ENABLED` | Opcional | `true` (padrão). Use `false` para desligar a automação diária |
| `CRON_HOUR_UTC` | Opcional | `3` (padrão; equivale a 00h em Brasília) |
| `DISCORD_WEBHOOK_URL` | Opcional | Alerta no Discord quando a automação diária termina |
| `APP_URL` | Opcional | `https://openseo.seudominio.com` (link usado no alerta do Discord) |

6. Clique em **Save & Update**.

## Verificando

Nos logs do app (`docker service logs <app> -f`) devem aparecer:

```
[openseo] Applying database migrations...
[openseo] Daily automation scheduled at 3:00 UTC
[openseo] Starting server on port 80...
[wrangler:info] Ready on http://0.0.0.0:80
```

## Backup

Todo o estado fica no volume persistente. Para fazer backup, copie o conteúdo de `/app/.wrangler/state` (na VPS: `/var/lib/docker/volumes/captain--openseo-data/_data` via Persistent Directory, ou `/var/lib/docker/volumes/openseo-data/_data` via Service Update Override).
