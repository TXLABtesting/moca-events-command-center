import { redirect } from 'next/navigation';
import { signIn, auth } from '@/auth';
import { authConfig } from '@/auth';

// Sign-in page. Renders a button per configured provider (Microsoft Entra ID,
// generic OAuth, and demo credentials when enabled). In the IT build only the
// real SSO providers are configured, so this becomes the SSO entry point.
export default async function SignInPage() {
  const session = await auth();
  if (session) redirect('/');

  const providers = authConfig.providers.map((p) => {
    const cfg = typeof p === 'function' ? (p as unknown as () => { id: string; name: string })() : (p as { id: string; name: string });
    return { id: cfg.id, name: cfg.name };
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(58% 52% at 80% 16%,rgba(185,130,28,.22),transparent 60%),radial-gradient(55% 50% at 14% 26%,rgba(15,36,64,.18),transparent 62%),linear-gradient(160deg,#F8FAFC 0%,#EEF1F6 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #E7EAF1',
          borderRadius: 20,
          padding: '40px 44px',
          width: 380,
          boxShadow: '0 10px 40px rgba(22,35,58,.08)',
          textAlign: 'center',
        }}
      >
        <img src="/assets/logo-moca.png" alt="" style={{ height: 64, objectFit: 'contain', marginBottom: 18 }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#17233B', margin: '0 0 6px' }}>
          Events Command Center
        </h1>
        <p style={{ fontSize: 13, color: '#6B7688', margin: '0 0 26px' }}>
          Ministry of Cabinet Affairs · Sign in to continue
        </p>
        {providers.length === 0 && (
          <p style={{ fontSize: 12.5, color: '#B03A32' }}>
            No identity provider configured. Set the AUTH_* env vars (see .env.example).
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {providers.map((p) => (
            <form
              key={p.id}
              action={async () => {
                'use server';
                await signIn(p.id, { redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #1B66C9',
                  background: '#1B66C9',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue with {p.name}
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
