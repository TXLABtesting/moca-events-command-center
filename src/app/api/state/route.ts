import { NextResponse } from 'next/server';
import { getMe } from '@/lib/roles';
import { applyState, StateError } from '@/lib/state';

export const dynamic = 'force-dynamic';

// POST /api/state { key, value } — persist one dashboard document.
// Authorized per key and per team, then translated into rows (see lib/state.ts).
export async function POST(req: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in or not provisioned' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.key !== 'string') return NextResponse.json({ error: 'key is required' }, { status: 400 });
  try {
    await applyState(me, body.key, body.value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof StateError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('[state]', body.key, e);
    return NextResponse.json({ error: 'Could not save to the database' }, { status: 500 });
  }
}
