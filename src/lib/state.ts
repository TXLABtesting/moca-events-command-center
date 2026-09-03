import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { KEY_WRITE_ROLES, TEAM_KEYED, audit, canWriteTeam, type Me } from './roles';

// ---------------------------------------------------------------------------
// /api/state — turns the documents the interface persists into database rows.
//
// The dashboard keeps working exactly as designed (it persists whole documents
// per key); this module authorizes the write, checks it stays inside the
// caller's scope, and translates it into normalized rows. The next bootstrap
// composes the same documents back from those rows, so the database — never the
// browser — is the source of truth.
// ---------------------------------------------------------------------------

export class StateError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

type Doc = Record<string, unknown>;
type Pair = [string, string];
const MAX_DOC_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_BYTES = 600 * 1024;

const isObj = (v: unknown): v is Doc => !!v && typeof v === 'object' && !Array.isArray(v);
const pair = (v: unknown, fallback = ''): Pair => (Array.isArray(v) ? [String(v[0] ?? fallback), String(v[1] ?? v[0] ?? fallback)] : [String(v ?? fallback), String(v ?? fallback)]);
const str = (v: unknown, fb = '') => (v == null ? fb : String(v));
const lines = (v: unknown): Pair[] | undefined => (v == null ? undefined : String(v).split('\n').map((x) => x.trim()).filter(Boolean).map((x) => [x, x] as Pair));
const noScripts = (s: string) => { if (/javascript:/i.test(s)) throw new StateError('Rejected: script URLs are not allowed'); };

export async function applyState(me: Me, key: string, value: unknown) {
  const roles = KEY_WRITE_ROLES[key];
  if (!roles) throw new StateError(`Unknown key: ${key}`, 400);
  if (!roles.includes(me.role)) throw new StateError(`Your role (${me.role}) cannot change ${key}`, 403);
  const raw = JSON.stringify(value ?? null);
  if (raw.length > MAX_DOC_BYTES) throw new StateError('Document too large', 413);
  noScripts(raw);

  // Team-scoped documents: every team key must be one the caller may edit.
  if (TEAM_KEYED.has(key)) {
    if (!isObj(value)) throw new StateError('Expected an object keyed by team id', 400);
    for (const teamId of Object.keys(value)) if (!canWriteTeam(me, teamId)) throw new StateError(`Team ${teamId} is outside your assigned streams`, 403);
  }

  const handler = TRANSLATORS[key];
  if (!handler) throw new StateError(`No translator for ${key}`, 500);
  await prisma.$transaction(async (tx) => { await handler(tx, me, value); }, { timeout: 30000 });
  await audit(me, 'state.set', 'state', key, { bytes: raw.length });
}

type Tx = Prisma.TransactionClient;
type Translator = (tx: Tx, me: Me, value: unknown) => Promise<void>;

const TRANSLATORS: Record<string, Translator> = {
  // ---- events ---------------------------------------------------------------
  async wef_custom_events(tx, me, value) {
    if (!Array.isArray(value)) return;
    for (const ev of value) {
      if (!isObj(ev) || !ev.id) continue;
      const period = Array.isArray(ev.period) ? ev.period : null;
      await tx.event.upsert({
        where: { id: String(ev.id) },
        update: {},
        create: { id: String(ev.id), nameEn: str(ev.en, 'Event'), nameAr: str(ev.ar, str(ev.en, 'Event')), periodEn: period ? str(period[0]) : null, periodAr: period ? str(period[1]) : null, owner: str(ev.owner) || null, logo: str(ev.logo) || null, createdById: me.id },
      });
    }
  },
  async wef_event_edits(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [id, patch] of Object.entries(value)) {
      if (!isObj(patch)) continue;
      const data: Prisma.EventUpdateInput = {};
      if (patch.en != null) data.nameEn = str(patch.en);
      if (patch.ar != null) data.nameAr = str(patch.ar);
      if (patch.owner != null) data.owner = str(patch.owner);
      if (patch.logo !== undefined) data.logo = patch.logo ? str(patch.logo) : null;
      if (Array.isArray(patch.period)) { data.periodEn = str(patch.period[0]); data.periodAr = str(patch.period[1] ?? patch.period[0]); }
      await tx.event.updateMany({ where: { id }, data });
    }
  },
  async wef_event_deleted(tx, _me, value) {
    if (!Array.isArray(value) || !value.length) return;
    await tx.event.deleteMany({ where: { id: { in: value.map(String) } } });
  },
  async wef_event_teams(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [eventId, list] of Object.entries(value)) {
      if (!Array.isArray(list)) continue;
      const exists = await tx.event.findUnique({ where: { id: eventId }, select: { id: true } });
      if (!exists) continue;
      let order = await tx.team.count({ where: { eventId } });
      for (const t of list) {
        if (!isObj(t) || !t.id) continue;
        const n = pair(t.n);
        const base = { nameEn: n[0], nameAr: n[1], status: str(t.s, 'a'), progress: Number(t.p) || 0, dueLabel: str(t.due) || null, updatedLabel: str(t.u) || null, leadName: pair(t.leadN)[0] || null, depName: pair(t.depN)[0] || null };
        await tx.team.upsert({ where: { id: String(t.id) }, update: base, create: { id: String(t.id), eventId, order: order++, ...base } });
      }
    }
  },
  // ---- teams ----------------------------------------------------------------
  async wef_deptedits(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, e] of Object.entries(value)) {
      if (!isObj(e)) continue;
      const data: Prisma.TeamUpdateInput = {};
      if (e.n != null) { data.nameEn = str(e.n); data.nameAr = str(e.n); }
      if (e.s != null) data.status = str(e.s);
      if (e.u != null) data.updatedLabel = str(e.u);
      if (e.p != null) data.progress = Number(e.p) || 0;
      if (e.leadN != null) data.leadName = str(e.leadN);
      if (e.leadT != null) { data.leadTitleEn = str(e.leadT); data.leadTitleAr = str(e.leadT); }
      if (e.depN != null) data.depName = str(e.depN);
      if (e.depT != null) { data.depTitleEn = str(e.depT); data.depTitleAr = str(e.depT); }
      const upd = lines(e.upd); if (upd) data.updates = upd;
      const chal = lines(e.chal); if (chal) data.challenges = chal;
      if (e.apprItem != null) { data.apprItemEn = str(e.apprItem); data.apprItemAr = str(e.apprItem); }
      if (e.apprDec != null) { data.apprDecEn = str(e.apprDec); data.apprDecAr = str(e.apprDec); }
      if (e.apprOwner != null) data.apprOwner = str(e.apprOwner);
      if (e.apprDue != null) data.apprDue = str(e.apprDue);
      if (e.nextAction != null) { data.nextActionEn = str(e.nextAction); data.nextActionAr = str(e.nextAction); }
      if (e.nextWho != null) data.nextWho = str(e.nextWho);
      if (e.nextDue != null) data.nextDue = str(e.nextDue);
      await tx.team.updateMany({ where: { id: teamId }, data });
    }
  },
  async wef_deptmembers(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, list] of Object.entries(value)) {
      if (!Array.isArray(list)) continue;
      const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
      if (!team) continue;
      const keep: string[] = [];
      let order = 0;
      for (const m of list) {
        if (!isObj(m) || !m.id) continue;
        const n = pair(m.n), r = pair(m.r);
        const id = String(m.id); keep.push(id);
        await tx.member.upsert({ where: { id }, update: { nameEn: n[0], nameAr: n[1], roleEn: r[0], roleAr: r[1], order }, create: { id, teamId, nameEn: n[0], nameAr: n[1], roleEn: r[0], roleAr: r[1], order } });
        order++;
      }
      await tx.member.deleteMany({ where: { teamId, id: { notIn: keep } } });
    }
  },
  async wef_wfnom(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, list] of Object.entries(value)) {
      if (!Array.isArray(list)) continue;
      const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
      if (!team) continue;
      await tx.nomination.deleteMany({ where: { teamId } });
      for (const x of list) {
        if (!isObj(x)) continue;
        const id = str(x.id) || 'nom-' + Math.random().toString(36).slice(2);
        await tx.nomination.create({ data: { id, teamId, data: x as Prisma.InputJsonValue } });
      }
    }
  },
  // ---- tasks ----------------------------------------------------------------
  async wef_tasks(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, list] of Object.entries(value)) {
      if (!Array.isArray(list)) continue;
      const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
      if (!team) continue;
      await tx.task.deleteMany({ where: { teamId } });
      let order = 0;
      for (const k of list) {
        if (!isObj(k)) continue;
        await tx.task.create({ data: taskRow(teamId, order++, k) });
      }
    }
  },
  async wef_taskov(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, ov] of Object.entries(value)) {
      if (!isObj(ov)) continue;
      for (const [idx, patch] of Object.entries(ov)) {
        if (!isObj(patch)) continue;
        const row = await tx.task.findUnique({ where: { teamId_order: { teamId, order: Number(idx) } } });
        if (!row) continue;
        const merged = taskRow(teamId, row.order, { ...taskToDoc(row), ...patch });
        await tx.task.update({ where: { id: row.id }, data: merged });
      }
    }
  },
  async wef_taskdel(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [teamId, idxs] of Object.entries(value)) {
      if (!Array.isArray(idxs) || !idxs.length) continue;
      const rows = await tx.task.findMany({ where: { teamId }, orderBy: { order: 'asc' } });
      const del = new Set(idxs.map(Number));
      const keep = rows.filter((r) => !del.has(r.order));
      await tx.task.deleteMany({ where: { teamId } });
      let order = 0;
      for (const r of keep) await tx.task.create({ data: taskRow(teamId, order++, taskToDoc(r)) });
    }
  },
  async wef_teamlog(tx, me, value) {
    if (!isObj(value)) return;
    for (const [k, kinds] of Object.entries(value)) {
      const teamId = k.includes(':') ? k.slice(k.indexOf(':') + 1) : k;
      if (!canWriteTeam(me, teamId)) throw new StateError(`Team ${teamId} is outside your assigned streams`, 403);
      if (!isObj(kinds)) continue;
      const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
      if (!team) continue;
      for (const [kind, entries] of Object.entries(kinds)) {
        if (!Array.isArray(entries)) continue;
        await tx.teamLogEntry.deleteMany({ where: { teamId, kind } });
        for (const e of entries) {
          if (!isObj(e)) continue;
          const id = str(e.id) || 'log-' + Math.random().toString(36).slice(2);
          await tx.teamLogEntry.create({ data: { id, teamId, kind, data: e as Prisma.InputJsonValue } });
        }
      }
    }
  },
  // ---- timeline -------------------------------------------------------------
  async wef_tledits(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [eventId, store] of Object.entries(value)) {
      if (!isObj(store)) continue;
      const days = isObj(store.days) ? store.days : {};
      for (const [di, d] of Object.entries(days)) {
        if (!isObj(d)) continue;
        const data: Prisma.TimelineDayUpdateInput = {};
        if (d.date != null) { data.dateEn = str(d.date); data.dateAr = str(d.date); }
        if (d.day != null) { data.dayEn = str(d.day); data.dayAr = str(d.day); }
        if (d.tagline != null) { data.taglineEn = str(d.tagline); data.taglineAr = str(d.tagline); }
        const order = Number(di);
        const existingDay = await tx.timelineDay.findUnique({ where: { eventId_order: { eventId, order } } });
        if (existingDay) await tx.timelineDay.update({ where: { id: existingDay.id }, data });
        else await tx.timelineDay.create({ data: { eventId, order, dateEn: str(d.date), dateAr: str(d.date), dayEn: str(d.day, 'Day ' + (order + 1)), dayAr: str(d.day, 'اليوم ' + (order + 1)), taglineEn: str(d.tagline) || null, taglineAr: str(d.tagline) || null } });
      }
      const blocks = isObj(store.blocks) ? store.blocks : {};
      for (const [key, b] of Object.entries(blocks)) {
        if (!isObj(b)) continue;
        const [di, bi] = key.split(':').map(Number);
        const day = await tx.timelineDay.findUnique({ where: { eventId_order: { eventId, order: di } } });
        if (!day) continue;
        const data: Prisma.TimelineBlockUpdateInput = {};
        if (b.time != null) data.time = str(b.time);
        if (b.t != null) { data.titleEn = str(b.t); data.titleAr = str(b.t); }
        if (b.sub != null) { data.subEn = str(b.sub); data.subAr = str(b.sub); }
        if (b.loc != null) { data.locEn = str(b.loc); data.locAr = str(b.loc); }
        if (b.team != null) { data.teamEn = str(b.team); data.teamAr = str(b.team); }
        if (b.notes != null) { data.notesEn = str(b.notes); data.notesAr = str(b.notes); }
        const existingBlock = await tx.timelineBlock.findUnique({ where: { dayId_order: { dayId: day.id, order: bi } } });
        if (existingBlock) await tx.timelineBlock.update({ where: { id: existingBlock.id }, data });
        else await tx.timelineBlock.create({ data: { dayId: day.id, order: bi, time: str(b.time) || null, titleEn: str(b.t, 'Session'), titleAr: str(b.t, 'جلسة'), subEn: str(b.sub) || null, subAr: str(b.sub) || null, locEn: str(b.loc) || null, locAr: str(b.loc) || null, teamEn: str(b.team) || null, teamAr: str(b.team) || null, notesEn: str(b.notes) || null, notesAr: str(b.notes) || null } });
      }
    }
  },
  // ---- people / photos / directory -------------------------------------------
  async wef_photos(tx, me, value) {
    if (!isObj(value)) return;
    const keys = Object.keys(value);
    // Scoped users may only touch photos of their own teams' people.
    if (me.role !== 'admin' && me.role !== 'hotel') {
      const members = await tx.member.findMany({ where: { teamId: { in: me.teamIds } }, select: { id: true } });
      const allowed = new Set<string>([...members.map((m) => m.id), ...me.teamIds.map((t) => 'DL' + t), ...me.teamIds.map((t) => 'DD' + t)]);
      for (const k of keys) if (!allowed.has(k)) throw new StateError('Photo key outside your scope: ' + k, 403);
      const existing = await tx.photo.findMany({ where: { key: { in: [...allowed] } }, select: { key: true } });
      for (const e of existing) if (!(e.key in value)) await tx.photo.delete({ where: { key: e.key } });
    } else {
      await tx.photo.deleteMany({ where: { key: { notIn: keys } } });
    }
    for (const [k, v] of Object.entries(value)) {
      const dataUrl = str(v);
      if (!dataUrl) continue;
      if (dataUrl.length > MAX_PHOTO_BYTES) throw new StateError('Photo too large (max 600 KB): ' + k, 413);
      if (!/^data:image\//i.test(dataUrl) && !dataUrl.startsWith('/')) throw new StateError('Photos must be image data: ' + k, 400);
      await tx.photo.upsert({ where: { key: k }, update: { dataUrl }, create: { key: k, dataUrl } });
    }
  },
  async wef_empdir(tx, _me, value) {
    if (!Array.isArray(value)) return;
    await tx.directoryEntry.deleteMany({});
    for (const e of value) {
      if (!isObj(e)) continue;
      const { n, name, email, phone, id: _id, ...rest } = e as Doc;
      await tx.directoryEntry.create({ data: { name: str(name ?? n), email: str(email) || null, phone: str(phone) || null, data: rest as Prisma.InputJsonValue } });
    }
  },
  async wef_hotel(tx, _me, value) {
    if (!isObj(value)) return;
    const keys = Object.keys(value);
    await tx.hotelAssignment.deleteMany({ where: { memberId: { notIn: keys } } });
    for (const [memberId, data] of Object.entries(value)) {
      if (!isObj(data)) continue;
      await tx.hotelAssignment.upsert({ where: { memberId }, update: { data: data as Prisma.InputJsonValue }, create: { memberId, data: data as Prisma.InputJsonValue } });
    }
  },
  // ---- feedback ---------------------------------------------------------------
  async wef_fbopen(tx, _me, value) {
    if (!isObj(value)) return;
    for (const [eventId, open] of Object.entries(value)) await tx.event.updateMany({ where: { id: eventId }, data: { feedbackOpen: !!open } });
  },
  async wef_feedback(tx, me, value) {
    if (!isObj(value)) return;
    for (const [eventId, list] of Object.entries(value)) {
      if (!Array.isArray(list)) continue;
      const ev = await tx.event.findUnique({ where: { id: eventId }, select: { id: true } });
      if (!ev) continue;
      const existing = await tx.feedbackEntry.findMany({ where: { eventId } });
      const seen = new Set(existing.map((f) => JSON.stringify(f.data)));
      if (me.role === 'admin') await tx.feedbackEntry.deleteMany({ where: { eventId } });
      for (const f of list) {
        if (!isObj(f)) continue;
        const sig = JSON.stringify(f);
        if (me.role !== 'admin' && seen.has(sig)) continue; // non-admins only append
        await tx.feedbackEntry.create({ data: { eventId, data: f as Prisma.InputJsonValue } });
      }
    }
  },
  // ---- per-event documents -----------------------------------------------------
  wef_approvals: (tx, _me, v) => eventDoc(tx, 'approvals', v),
  wef_design: (tx, _me, v) => eventDoc(tx, 'design', v),
  wef_basehide: (tx, _me, v) => eventDoc(tx, 'basehide', v),
  // ---- legacy workstream views (global) ------------------------------------------
  wef_edits: (tx, _me, v) => globalDoc(tx, 'ws_edits', v),
  wef_members: (tx, _me, v) => globalDoc(tx, 'ws_members', v),
  wef_order: (tx, _me, v) => globalDoc(tx, 'ws_order', v),
};

async function eventDoc(tx: Tx, key: string, value: unknown) {
  if (!isObj(value)) return;
  for (const [eventId, doc] of Object.entries(value)) {
    const ev = await tx.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!ev) continue;
    await tx.eventDoc.upsert({ where: { eventId_key: { eventId, key } }, update: { doc: doc as Prisma.InputJsonValue }, create: { eventId, key, doc: doc as Prisma.InputJsonValue } });
  }
}
async function globalDoc(tx: Tx, key: string, value: unknown) {
  await tx.globalDoc.upsert({ where: { key }, update: { doc: (value ?? null) as Prisma.InputJsonValue }, create: { key, doc: (value ?? null) as Prisma.InputJsonValue } });
}

function taskRow(teamId: string, order: number, k: Doc): Prisma.TaskUncheckedCreateInput {
  const t = pair(k.t), dep = pair(k.dep, '—'), nx = pair(k.nx, '—'), up = pair(k.up), ch = pair(k.ch);
  return {
    teamId, order, titleEn: t[0], titleAr: t[1], owner: str(k.o, '—'), status: str(k.s, 'n'), priority: str(k.pr, 'm'), dueLabel: str(k.d, '—'),
    dependencyEn: dep[0], dependencyAr: dep[1], nextEn: nx[0], nextAr: nx[1], updateEn: up[0] || null, updateAr: up[1] || null,
    challengeEn: ch[0] || null, challengeAr: ch[1] || null, approval: str(k.ap, 'nr'), meeting: isObj(k.mt) ? (k.mt as Prisma.InputJsonValue) : Prisma.JsonNull,
  };
}
function taskToDoc(r: { titleEn: string; titleAr: string; owner: string | null; status: string; priority: string; dueLabel: string | null; dependencyEn: string | null; dependencyAr: string | null; nextEn: string | null; nextAr: string | null; updateEn: string | null; updateAr: string | null; challengeEn: string | null; challengeAr: string | null; approval: string; meeting: unknown }): Doc {
  return { t: [r.titleEn, r.titleAr], o: r.owner, s: r.status, pr: r.priority, d: r.dueLabel, dep: [r.dependencyEn, r.dependencyAr], nx: [r.nextEn, r.nextAr], up: [r.updateEn, r.updateAr], ch: [r.challengeEn, r.challengeAr], ap: r.approval, mt: r.meeting };
}
