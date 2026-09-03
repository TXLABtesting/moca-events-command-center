#!/bin/sh
# Applies migrations, seeds the first administrator (if SEED_ADMIN_EMAIL is set)
# and starts the server. Safe to run on every container start.
set -e
echo "[entrypoint] applying database migrations…"
node ./node_modules/prisma/build/index.js migrate deploy
if [ -n "$SEED_ADMIN_EMAIL" ]; then
  echo "[entrypoint] ensuring administrator(s): $SEED_ADMIN_EMAIL"
  node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "[entrypoint] seed skipped (see message above)"
fi
echo "[entrypoint] starting MOCA Events Command Center on port ${PORT:-3000}"
exec node server.js
