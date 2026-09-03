import 'server-only';
import type { Role } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from './prisma';

// ---------------------------------------------------------------------------
// Roles, the signed-in user, and data scope.
//
// The interface uses short role keys; the database uses the Role enum.
//   admin → ADMIN  · inputter (Team) → TEAM · lead → LEAD · hotel → HOTEL · he → HE
// ---------------------------------------------------------------------------

export type UiRole = 'admin' | 'inputter' | 'lead' | 'hotel' | 'he';

export const toUiRole: Record<Role, UiRole> = { ADMIN: 'admin', TEAM: 'inputter', LEAD: 'lead', HOTEL: 'hotel', HE: 'he' };
export const toDbRole: Record<UiRole, Role> = { admin: 'ADMIN', inputter: 'TEAM', lead: 'LEAD', hotel: 'HOTEL', he: 'HE' };

export interface Me {
  id: string;
  email: string;
  name: string | null;
  role: UiRole;
  teamIds: string[]; // teams this user is assigned to (Stream Lead / Team roles)
  eventIds: string[]; // events those teams belong to
}

/** The signed-in user with a fresh role + assignments from the database (never trusts the token alone). */
export async function getMe(): Promise<Me | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  const u = await prisma.user.findUnique({
    where: { email },
    include: { assignments: { include: { team: { select: { id: true, eventId: true } } } } },
  });
  if (!u || !u.active) return null;
  const teamIds = u.assignments.map((a) => a.team.id);
  const eventIds = [...new Set(u.assignments.map((a) => a.team.eventId))];
  return { id: u.id, email: u.email, name: u.name, role: toUiRole[u.role], teamIds, eventIds };
}

/** True when the role sees every event and team. */
export function seesAll(me: Me): boolean {
  return me.role === 'admin' || me.role === 'he' || me.role === 'hotel';
}

/** Team ids the user may read; null means "all". */
export function readableTeamIds(me: Me): string[] | null {
  return seesAll(me) ? null : me.teamIds;
}

/** Can the user write team-scoped data for this team? */
export function canWriteTeam(me: Me, teamId: string): boolean {
  if (me.role === 'admin') return true;
  if (me.role === 'lead' || me.role === 'inputter') return me.teamIds.includes(teamId);
  return false;
}

// Which roles may write each persisted key. Team-scoped keys are additionally
// checked per team id (see state.ts). H.E. is read-only except approvals and feedback.
export const KEY_WRITE_ROLES: Record<string, UiRole[]> = {
  wef_custom_events: ['admin'],
  wef_event_edits: ['admin'],
  wef_event_deleted: ['admin'],
  wef_event_teams: ['admin'],
  wef_tledits: ['admin'],
  wef_fbopen: ['admin'],
  wef_basehide: ['admin'],
  wef_empdir: ['admin', 'hotel'],
  wef_edits: ['admin'],
  wef_members: ['admin'],
  wef_order: ['admin'],
  wef_deptedits: ['admin', 'lead', 'inputter'],
  wef_deptmembers: ['admin', 'lead', 'inputter'],
  wef_wfnom: ['admin', 'lead', 'inputter'],
  wef_tasks: ['admin', 'lead', 'inputter'],
  wef_taskov: ['admin', 'lead', 'inputter'],
  wef_taskdel: ['admin', 'lead', 'inputter'],
  wef_teamlog: ['admin', 'lead', 'inputter'],
  wef_photos: ['admin', 'lead', 'inputter', 'hotel'],
  wef_design: ['admin', 'lead', 'inputter'],
  wef_approvals: ['admin', 'he', 'lead'],
  wef_hotel: ['admin', 'hotel'],
  wef_feedback: ['admin', 'he', 'lead', 'inputter', 'hotel'],
};

/** Keys whose document is an object keyed by team id — every key must be a team the user may write. */
export const TEAM_KEYED = new Set(['wef_deptedits', 'wef_deptmembers', 'wef_wfnom', 'wef_tasks', 'wef_taskov', 'wef_taskdel']);

export async function audit(me: Me | null, action: string, entityType?: string, entityId?: string, detail?: unknown) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: me?.id ?? null,
        actorEmail: me?.email ?? null,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        detail: (detail as object) ?? undefined,
      },
    });
  } catch {
    // auditing must never break the request
  }
}
