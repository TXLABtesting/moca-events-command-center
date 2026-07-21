import 'server-only';
import { prisma } from './prisma';

// ---------------------------------------------------------------------------
// Data provider — the single seam between the UI and its data source.
//
// Demo build:  the dashboard uses its baked-in seed arrays (fake data). This
//              module is unused there.
// IT build:    the dashboard hydrates from these functions via /api/*, which
//              read Postgres through Prisma. The database starts EMPTY (zero
//              fake data); events/teams are created by admins through the UI.
//
// The DTO shape mirrors the dashboard's [en, ar] bilingual convention so the
// client can consume it without transformation.
// ---------------------------------------------------------------------------

export type Pair = [string, string];

export interface EventDTO {
  id: string;
  en: string;
  ar: string;
  logo: string | null;
  status: 'active' | 'blank';
  period: Pair | null;
}

export async function listEvents(): Promise<EventDTO[]> {
  const events = await prisma.event.findMany({ orderBy: { createdAt: 'asc' } });
  return events.map((e) => ({
    id: e.slug,
    en: e.nameEn,
    ar: e.nameAr,
    logo: e.logoUrl,
    status: e.state === 'ACTIVE' ? 'active' : 'blank',
    period: e.periodEn ? [e.periodEn, e.periodAr ?? e.periodEn] : null,
  }));
}

export async function createEvent(input: {
  slug: string;
  nameEn: string;
  nameAr: string;
  periodEn?: string;
  periodAr?: string;
  logoUrl?: string;
}): Promise<EventDTO> {
  const e = await prisma.event.create({
    data: {
      slug: input.slug,
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      periodEn: input.periodEn,
      periodAr: input.periodAr,
      logoUrl: input.logoUrl,
      state: 'BLANK',
    },
  });
  return {
    id: e.slug,
    en: e.nameEn,
    ar: e.nameAr,
    logo: e.logoUrl,
    status: 'blank',
    period: e.periodEn ? [e.periodEn, e.periodAr ?? e.periodEn] : null,
  };
}
