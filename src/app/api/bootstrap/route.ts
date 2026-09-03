import { NextResponse } from 'next/server';
import { getMe } from '@/lib/roles';
import { composeBootstrap } from '@/lib/bootstrap';

export const dynamic = 'force-dynamic';

// GET /api/bootstrap — the dashboard payload for the signed-in user, filtered to
// their role and assigned teams on the server.
export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in or not provisioned' }, { status: 401 });
  const payload = await composeBootstrap(me);
  return NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } });
}
