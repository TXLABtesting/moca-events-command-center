import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/health — deployment check for IT. Public (no data is revealed), shows
// whether the database is reachable, migrations are applied, an admin exists and
// which sign-in providers are configured. Returns 503 when something is wrong so
// a load balancer / uptime monitor can see it.
export async function GET() {
  const out: Record<string, unknown> = {
    app: 'moca-events-command-center',
    version: process.env.APP_VERSION || '7.0.0',
    time: new Date().toISOString(),
    database: { ok: false },
    migrations: { ok: false },
    admins: 0,
    auth: {
      microsoftEntraId: !!process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      oidc: !!(process.env.OAUTH_CLIENT_ID && process.env.OAUTH_ISSUER),
      credentialsTestMode: process.env.AUTH_ALLOW_CREDENTIALS === 'true',
      authUrl: process.env.AUTH_URL || null,
    },
  };
  let ok = true;
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    out.database = { ok: true };
  } catch (e) {
    ok = false;
    out.database = { ok: false, error: e instanceof Error ? e.message.split('\n')[0] : String(e) };
  }
  if ((out.database as { ok: boolean }).ok) {
    try {
      const rows = await prisma.$queryRawUnsafe<{ n: number | bigint }[]>('SELECT COUNT(*) AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL').catch(async () => prisma.$queryRawUnsafe<{ n: number | bigint }[]>('SELECT COUNT(*) AS n FROM _prisma_migrations WHERE finished_at IS NOT NULL'));
      const applied = Number(rows[0]?.n ?? 0);
      out.migrations = { ok: applied > 0, applied };
      if (applied === 0) ok = false;
      out.admins = await prisma.user.count({ where: { role: 'ADMIN', active: true } });
      if ((out.admins as number) === 0) out.warning = 'No active administrator — run: npm run db:seed with SEED_ADMIN_EMAIL set';
    } catch (e) {
      ok = false;
      out.migrations = { ok: false, error: e instanceof Error ? e.message.split('\n')[0] : String(e) };
    }
  }
  const authOk = (out.auth as { microsoftEntraId: boolean; oidc: boolean; credentialsTestMode: boolean });
  if (!authOk.microsoftEntraId && !authOk.oidc && !authOk.credentialsTestMode) { ok = false; out.authError = 'No sign-in provider configured (set AUTH_MICROSOFT_ENTRA_ID_* in .env)'; }
  out.ok = ok;
  return NextResponse.json(out, { status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } });
}
