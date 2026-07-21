import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listEvents, createEvent } from '@/lib/data-provider';

// GET /api/events — list events from Postgres (IT build).
export async function GET() {
  const events = await listEvents();
  return NextResponse.json({ events });
}

// POST /api/events — create an event. Requires Management/Admin.
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || (role !== 'MANAGER' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.nameEn || !body?.slug) {
    return NextResponse.json({ error: 'slug and nameEn are required' }, { status: 400 });
  }
  const event = await createEvent(body);
  return NextResponse.json({ event }, { status: 201 });
}
