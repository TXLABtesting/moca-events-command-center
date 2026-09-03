import 'server-only';
import { prisma } from './prisma';
import { type Me, readableTeamIds, seesAll, toUiRole } from './roles';

// ---------------------------------------------------------------------------
// /api/bootstrap — everything the dashboard shows, composed from the database
// and filtered to the caller's scope. The shapes mirror what the interface's
// logic expects (the same [en, ar] pairs and document keys the design uses), so
// the UI needs no transformation layer.
// ---------------------------------------------------------------------------

type Pair = [string, string];
const P = (en?: string | null, ar?: string | null): Pair => [en ?? '', ar ?? en ?? ''];
const LEAD_T: Pair = ['Team Lead', 'قائد الفريق'];
const DEP_T: Pair = ['Deputy Lead', 'نائب القائد'];

export async function composeBootstrap(me: Me) {
  const teamFilter = readableTeamIds(me);
  const all = seesAll(me);

  const events = await prisma.event.findMany({
    where: all ? {} : { id: { in: me.eventIds } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: {
      teams: {
        where: teamFilter ? { id: { in: teamFilter } } : {},
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          members: { orderBy: { order: 'asc' } },
          tasks: { orderBy: { order: 'asc' } },
          logEntries: { orderBy: { createdAt: 'asc' } },
          nominations: { orderBy: { createdAt: 'asc' } },
        },
      },
      days: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
      docs: true,
      feedback: me.role === 'admin' || me.role === 'he' ? { orderBy: { createdAt: 'asc' } } : false,
    },
  });

  const depts: Record<string, unknown[]> = {};
  const meta: Record<string, unknown> = {};
  const timeline: Record<string, unknown[]> = {};
  const tasks: Record<string, unknown[]> = {};
  const deptMembers: Record<string, unknown[]> = {};
  const wfNom: Record<string, unknown[]> = {};
  const teamlog: Record<string, Record<string, unknown[]>> = {};
  const approvals: Record<string, unknown> = {};
  const design: Record<string, unknown> = {};
  const basehide: Record<string, unknown> = {};
  const fbOpen: Record<string, boolean> = {};
  const feedback: Record<string, unknown[]> = {};
  const photoKeys = new Set<string>();

  for (const ev of events) {
    depts[ev.id] = ev.teams.map((t) => {
      photoKeys.add('DL' + t.id);
      photoKeys.add('DD' + t.id);
      t.members.forEach((m) => photoKeys.add(m.id));
      return {
        id: t.id,
        n: P(t.nameEn, t.nameAr),
        s: t.status || 'a',
        u: t.updatedLabel || '',
        lead: { n: t.leadName || '', t: t.leadTitleEn ? P(t.leadTitleEn, t.leadTitleAr) : LEAD_T },
        dep: { n: t.depName || '', t: t.depTitleEn ? P(t.depTitleEn, t.depTitleAr) : DEP_T },
        mem: t.members.map((m) => ({ id: m.id, n: P(m.nameEn, m.nameAr), r: P(m.roleEn, m.roleAr) })),
        upd: Array.isArray(t.updates) ? t.updates : [],
        chal: Array.isArray(t.challenges) ? t.challenges : [],
        appr: { item: P(t.apprItemEn, t.apprItemAr), dec: P(t.apprDecEn, t.apprDecAr), owner: t.apprOwner || '', due: t.apprDue || '' },
        next: { action: P(t.nextActionEn, t.nextActionAr), who: t.nextWho || '', due: t.nextDue || '' },
      };
    });
    for (const t of ev.teams) {
      meta[t.id] = { p: t.progress, due: t.dueLabel || '', delay: t.delayed, actions: [] };
      tasks[t.id] = t.tasks.map((k) => ({
        t: P(k.titleEn, k.titleAr), o: k.owner || '—', s: k.status, pr: k.priority, d: k.dueLabel || '—',
        dep: P(k.dependencyEn || '—', k.dependencyAr || '—'), nx: P(k.nextEn || '—', k.nextAr || '—'),
        up: P(k.updateEn, k.updateAr), ch: P(k.challengeEn, k.challengeAr), ap: k.approval || 'nr', mt: k.meeting ?? null,
      }));
      deptMembers[t.id] = t.members.map((m) => ({ id: m.id, n: P(m.nameEn, m.nameAr), r: P(m.roleEn, m.roleAr) }));
      if (t.nominations.length) wfNom[t.id] = t.nominations.map((x) => x.data);
      if (t.logEntries.length) {
        const byKind: Record<string, unknown[]> = {};
        for (const e of t.logEntries) (byKind[e.kind] ||= []).push(e.data);
        teamlog[ev.id + ':' + t.id] = byKind;
      }
    }
    timeline[ev.id] = ev.days.map((d) => ({
      icon: d.icon || 'sessions', date: P(d.dateEn, d.dateAr), day: P(d.dayEn, d.dayAr),
      tagline: d.taglineEn ? P(d.taglineEn, d.taglineAr) : undefined, desc: d.descEn ? P(d.descEn, d.descAr) : undefined,
      blocks: d.blocks.map((b) => ({
        time: b.time || '', icon: b.icon || 'sessions', t: P(b.titleEn, b.titleAr), sub: b.subEn ? P(b.subEn, b.subAr) : undefined,
        loc: P(b.locEn, b.locAr), team: P(b.teamEn, b.teamAr), notes: P(b.notesEn, b.notesAr),
      })),
    }));
    for (const d of ev.docs) {
      if (d.key === 'approvals' && (me.role === 'admin' || me.role === 'he' || me.role === 'lead')) approvals[ev.id] = d.doc;
      if (d.key === 'design') design[ev.id] = d.doc;
      if (d.key === 'basehide') basehide[ev.id] = d.doc;
    }
    fbOpen[ev.id] = ev.feedbackOpen;
    if (Array.isArray(ev.feedback) && ev.feedback.length) feedback[ev.id] = ev.feedback.map((f) => f.data);
  }

  // Photos: everything the caller can see (leads/deputies/members of visible teams).
  const photos: Record<string, string> = {};
  const photoRows = all ? await prisma.photo.findMany() : await prisma.photo.findMany({ where: { key: { in: [...photoKeys] } } });
  for (const p of photoRows) photos[p.key] = p.dataUrl;

  const docs: Record<string, unknown> = {
    wef_custom_events: [], wef_event_edits: {}, wef_event_deleted: [], wef_event_teams: {},
    wef_deptedits: {}, wef_deptmembers: deptMembers, wef_wfnom: wfNom,
    wef_tasks: tasks, wef_taskov: {}, wef_taskdel: {}, wef_teamlog: teamlog, wef_tledits: {},
    wef_photos: photos, wef_design: design, wef_basehide: basehide, wef_approvals: approvals,
    wef_fbopen: fbOpen, wef_feedback: feedback,
  };
  if (me.role === 'admin' || me.role === 'hotel') {
    docs.wef_empdir = (await prisma.directoryEntry.findMany({ orderBy: { createdAt: 'asc' } })).map((e) => ({ id: e.id, n: e.name, name: e.name, email: e.email || '', phone: e.phone || '', ...((e.data as object) || {}) }));
    const hotel: Record<string, unknown> = {};
    for (const h of await prisma.hotelAssignment.findMany()) hotel[h.memberId] = h.data;
    docs.wef_hotel = hotel;
  } else {
    docs.wef_empdir = [];
    docs.wef_hotel = {};
  }
  if (me.role === 'admin') {
    for (const g of await prisma.globalDoc.findMany()) {
      if (g.key === 'ws_edits') docs.wef_edits = g.doc;
      if (g.key === 'ws_members') docs.wef_members = g.doc;
      if (g.key === 'ws_order') docs.wef_order = g.doc;
    }
  }

  const users = me.role === 'admin'
    ? (await prisma.user.findMany({ orderBy: { createdAt: 'asc' }, include: { assignments: true } })).map((u) => ({
        id: u.id, email: u.email, n: u.name || u.email, name: u.name || u.email, role: toUiRole[u.role], active: u.active,
        lastSignInAt: u.lastSignInAt ? u.lastSignInAt.getTime() : null, teamIds: u.assignments.map((a) => a.teamId),
      }))
    : [];

  return {
    me: { id: me.id, email: me.email, name: me.name, role: me.role, teamIds: me.teamIds },
    events: events.map((ev) => ({
      id: ev.id, en: ev.nameEn, ar: ev.nameAr, logo: ev.logo || null, owner: ev.owner || '',
      status: ev.teams.length ? 'active' : 'blank', period: ev.periodEn ? P(ev.periodEn, ev.periodAr) : null,
    })),
    depts, meta, timeline, docs, users,
    generatedAt: Date.now(),
  };
}
