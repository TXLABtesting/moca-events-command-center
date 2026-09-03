import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { audit, getMe, toDbRole, type UiRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const ROLES: UiRole[] = ['admin', 'inputter', 'lead', 'hotel', 'he'];
type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/users/:id — admin only. Body may contain:
//   role, name, active, teamIds (replace all), setTeamForEvent: { eventId, teamId|null }
export async function PATCH(req: Request, ctx: Ctx) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const target = await prisma.user.findUnique({ where: { id }, include: { assignments: { include: { team: { select: { eventId: true } } } } } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === me.id && (body.role !== undefined || body.active === false)) return NextResponse.json({ error: "You can't change your own role or disable yourself" }, { status: 400 });

  const data: { role?: 'ADMIN' | 'TEAM' | 'LEAD' | 'HOTEL' | 'HE'; name?: string; active?: boolean } = {};
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'Unknown role' }, { status: 400 });
    data.role = toDbRole[body.role as UiRole];
  }
  if (body.name !== undefined) data.name = String(body.name).trim() || undefined;
  if (body.active !== undefined) data.active = !!body.active;
  await prisma.user.update({ where: { id }, data });

  if (Array.isArray(body.teamIds)) {
    await prisma.teamAssignment.deleteMany({ where: { userId: id } });
    await prisma.teamAssignment.createMany({ data: body.teamIds.map((teamId: string) => ({ userId: id, teamId: String(teamId) })), skipDuplicates: true });
  }
  if (body.setTeamForEvent && typeof body.setTeamForEvent === 'object') {
    const { eventId, teamId } = body.setTeamForEvent as { eventId?: string; teamId?: string | null };
    if (eventId) {
      const inEvent = target.assignments.filter((a) => a.team.eventId === eventId).map((a) => a.teamId);
      if (inEvent.length) await prisma.teamAssignment.deleteMany({ where: { userId: id, teamId: { in: inEvent } } });
      if (teamId) {
        const team = await prisma.team.findFirst({ where: { id: teamId, eventId }, select: { id: true } });
        if (!team) return NextResponse.json({ error: 'Team does not belong to that event' }, { status: 400 });
        await prisma.teamAssignment.create({ data: { userId: id, teamId } });
      }
    }
  }
  await audit(me, 'users.update', 'user', id, body);
  return NextResponse.json({ ok: true });
}

// DELETE /api/users/:id — admin only; removes the person from the allow-list.
export async function DELETE(_req: Request, ctx: Ctx) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { id } = await ctx.params;
  if (id === me.id) return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  await prisma.user.delete({ where: { id } });
  await audit(me, 'users.delete', 'user', id, { email: target.email });
  return NextResponse.json({ ok: true });
}
