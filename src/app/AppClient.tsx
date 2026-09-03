'use client';

import dynamic from 'next/dynamic';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Client shell for the dashboard.
//  - loads /api/bootstrap (the user's scoped data) and re-loads it after every
//    successful save so the screen always reflects the database;
//  - serializes saves (one at a time, in order) so the server never sees two
//    writes for the same key racing each other;
//  - exposes the users API for the Management Access page;
//  - signs out through Auth.js.
const DashboardApp = dynamic(() => import('@/components/DashboardAppV7'), {
  ssr: false,
  loading: () => <Splash text="Loading Command Center…" />,
});

function Splash({ text, error }: { text: string; error?: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF1F6', color: error ? '#B03A32' : '#6B7688', font: "14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 520 }}>{text}</div>
    </div>
  );
}

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, { cache: 'no-store', headers: { 'content-type': 'application/json' }, ...init });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `Request failed (${r.status})`);
  }
  return r.json();
}

export default function AppClient() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const payload = await api('/api/bootstrap');
    setData(payload);
    return payload;
  }, []);

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);

  // Save queue: one request at a time, then one refresh once the queue drains.
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const inflight = useRef(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { if (inflight.current === 0) refresh().catch(() => {}); }, 350);
  }, [refresh]);

  const sync = useCallback((key: string, value: unknown) => {
    inflight.current++;
    const p = chain.current
      .then(() => api('/api/state', { method: 'POST', body: JSON.stringify({ key, value }) }))
      .finally(() => { inflight.current--; if (inflight.current === 0) scheduleRefresh(); });
    chain.current = p.catch(() => {});
    return p;
  }, [scheduleRefresh]);

  const users = {
    create: (body: { email: string; name?: string; role: string; teamIds?: string[] }) => api('/api/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, patch: Record<string, unknown>) => api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => api(`/api/users/${id}`, { method: 'DELETE' }),
  };

  if (error) return <Splash error text={`Could not load your data: ${error}. Check /api/health, then reload.`} />;
  if (!data) return <Splash text="Loading Command Center…" />;
  return (
    <DashboardApp
      me={data.me}
      data={data}
      sync={sync}
      refresh={refresh}
      users={users}
      onSignOut={() => signOut({ callbackUrl: '/signin' })}
    />
  );
}
