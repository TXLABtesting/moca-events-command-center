import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { audit, getMe, toDbRole, toUiRole, type UiRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const ROLES: UiRole[] = ['admin', 'inputter', 'lead', 'hotel', 'he'];

// GET /api/users — admin only: every provisioned user with role and team assignments.
export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' }, include: { assignments: true } });
  return NextResponse.json({ users: users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: toUiRole[u.role], active: u.active, lastSignInAt: u.lastSignInAt, teamIds: u.assignments.map((a) => a.teamId) })) });
}

// POST /api/users { email, name?, role, teamIds? } — admin only. Adds a person to the
// allow-list. No password: they sign in with the ministry SSO account for that email.
export async function POST(req: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const role = String(body?.role || 'inputter') as UiRole;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: 'Unknown role' }, { status: 400 });
  const teamIds: string[] = Array.isArray(body?.teamIds) ? body.teamIds.map(String) : [];
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'This email is already provisioned' }, { status: 409 });
  const user = await prisma.user.create({
    data: { email, name: String(body?.name || '').trim() || null, role: toDbRole[role], createdById: me.id, assignments: { create: teamIds.map((teamId) => ({ teamId })) } },
  });
  await audit(me, 'users.create', 'user', user.id, { email, role, teamIds });
  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}
