import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { audit, getMe } from '@/lib/roles';

export const dynamic = 'force-dynamic';

// DELETE /api/teams/:id — admin only. Removes a team and everything under it
// (members, tasks, log entries, nominations, assignments) via cascade.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { id } = await ctx.params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  await prisma.team.delete({ where: { id } });
  await audit(me, 'teams.delete', 'team', id, { eventId: team.eventId, name: team.nameEn });
  return NextResponse.json({ ok: true });
}
