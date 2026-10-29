#!/bin/sh
# Self-hosted entrypoint (CapRover / Docker). Runs OpenSEO on the local
# workerd runtime with all data (D1/SQLite, KV, R2, Workflows) stored on disk.
# No Cloudflare account or network access to Cloudflare is required.
set -e

PORT="${PORT:-80}"
STATE_DIR="${STATE_DIR:-/app/.wrangler/state}"
CRON_HOUR_UTC="${CRON_HOUR_UTC:-3}"
CRON_ENABLED="${CRON_ENABLED:-true}"

mkdir -p "$STATE_DIR"

# Runtime env vars (CapRover / Docker) must win: a .dev.vars file would
# make wrangler ignore process.env entirely.
rm -f dist/server/.dev.vars .dev.vars

# Secret shared between the scheduler loop and the internal cron endpoint.
if [ -z "$CRON_SECRET" ]; then
  CRON_SECRET="$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')"
fi
export CRON_SECRET

echo "[openseo] Applying database migrations..."
npx wrangler d1 migrations apply DB --local --persist-to "$STATE_DIR"

# Daily automation (Rank Tracking + LLM Mentions), replacing Cloudflare Cron Triggers.
if [ "$CRON_ENABLED" = "true" ]; then
  (
    while true; do
      now=$(date -u +%s)
      next=$(date -u -d "today ${CRON_HOUR_UTC}:00" +%s)
      if [ "$next" -le "$now" ]; then
        next=$(date -u -d "tomorrow ${CRON_HOUR_UTC}:00" +%s)
      fi
      sleep $((next - now))
      echo "[openseo] Triggering daily automation..."
      curl -fsS -X POST -H "x-cron-secret: ${CRON_SECRET}" \
        "http://127.0.0.1:${PORT}/__internal/cron" || echo "[openseo] Cron trigger failed"
      sleep 60
    done
  ) &
  echo "[openseo] Daily automation scheduled at ${CRON_HOUR_UTC}:00 UTC"
fi

echo "[openseo] Starting server on port ${PORT}..."
exec npx wrangler dev dist/server/index.js \
  --port "$PORT" \
  --ip 0.0.0.0 \
  --local \
  --persist-to "$STATE_DIR" \
  --show-interactive-dev-session=false
