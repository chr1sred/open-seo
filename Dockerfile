# Use the full Node image so workerd has a working CA trust store for outbound HTTPS.
FROM node:22

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV AUTH_MODE=local_noauth

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 80

CMD ["sh", "-c", "pnpm run db:migrate:local && pnpm run build && rm -rf .wrangler/deploy && PORT=${PORT:-80} HOST=0.0.0.0 npx wrangler dev dist/server/index.js --port ${PORT:-80} --ip 0.0.0.0 --local"]
