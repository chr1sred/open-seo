# OpenSEO self-hosted image (CapRover / Docker).
# Runs on the open-source workerd runtime in local mode: database (SQLite/D1),
# KV, R2 and Workflows are all stored on disk. No Cloudflare account needed.
#
# Use the full Node image so workerd has a working CA trust store for outbound HTTPS.
FROM node:22

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Expose container env vars (DATAFORSEO_API_KEY, BASIC_AUTH_*, LLM_*...) to the Worker.
ENV CLOUDFLARE_INCLUDE_PROCESS_ENV=true
# No telemetry / update checks towards Cloudflare.
ENV WRANGLER_SEND_METRICS=false
ENV CLOUDFLARE_CF_FETCH_ENABLED=false
ENV VITE_SHOW_DEVTOOLS=false
ENV PORT=80

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile=false

COPY . .

# Build once at image build time (faster container restarts).
# Only `vite build` (no type-check) and a capped Node heap to keep memory
# usage low on small VPSs. Remove the deploy redirect so `wrangler dev`
# uses the built bundle directly.
# Build without process env so no build-time .dev.vars gets baked into dist
# (it would override the runtime env vars set in CapRover).
RUN CLOUDFLARE_INCLUDE_PROCESS_ENV=false NODE_OPTIONS=--max-old-space-size=1536 pnpm exec vite build \
  && rm -rf .wrangler/deploy \
  && rm -f dist/server/.dev.vars .dev.vars

# Mount /app/.wrangler/state as a CapRover Persistent Directory to keep your data.
EXPOSE 80

CMD ["sh", "scripts/start-selfhost.sh"]
