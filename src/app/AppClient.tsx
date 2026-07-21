'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Client-only mount: no SSR, matching the prototype's SPA runtime (avoids
// hydration mismatches from the live countdown + localStorage hydration).
const DashboardApp = dynamic(() => import('@/components/DashboardApp'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EEF1F6',
        color: '#6B7688',
        font: "14px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      Loading Command Center…
    </div>
  ),
});

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Demo-only role switcher. Broadcasts the selected role to the dashboard,
// which maps Admin/Manager → Management Access (edit + budget) and Viewer →
// read-only. Not rendered in the IT build (NEXT_PUBLIC_DEMO_MODE unset).
function RoleSwitcher() {
  const [role, setRole] = useState<'viewer' | 'manager' | 'admin'>('viewer');
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('moca-demo-role', { detail: { role, admin: role !== 'viewer' } }),
    );
  }, [role]);
  const roles: Array<['viewer' | 'manager' | 'admin', string]> = [
    ['viewer', 'Viewer'],
    ['manager', 'Manager'],
    ['admin', 'Admin'],
  ];
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        insetInlineStart: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        border: '1px solid #E7EAF1',
        borderRadius: 999,
        padding: '6px 8px 6px 14px',
        boxShadow: '0 6px 24px rgba(22,35,58,.12)',
        font: "12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <span style={{ fontWeight: 700, color: '#6B7688', letterSpacing: '.04em' }}>DEMO ROLE</span>
      <div style={{ display: 'flex', gap: 2, background: '#F5F7FA', borderRadius: 999, padding: 3 }}>
        {roles.map(([r, label]) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              appearance: 'none',
              border: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 999,
              background: role === r ? '#1B66C9' : 'transparent',
              color: role === r ? '#fff' : '#6B7688',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppClient() {
  return (
    <>
      <DashboardApp />
      {DEMO && <RoleSwitcher />}
    </>
  );
}
