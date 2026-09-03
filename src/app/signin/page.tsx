import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn, auth, authConfig } from '@/auth';

// Sign-in page — the design's sign-in card. In the IT build the only way in is
// the ministry SSO (Microsoft Entra ID); the email/password fields of the demo
// are replaced by a single "Sign in with Microsoft" action. A local test
// sign-in (email only) appears solely when AUTH_ALLOW_CREDENTIALS=true.
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user?.email) redirect('/');
  const { error } = await searchParams;

  const providers = authConfig.providers.map((p) => {
    const cfg = typeof p === 'function' ? (p as unknown as () => { id: string; name: string })() : (p as { id: string; name: string });
    return { id: cfg.id, name: cfg.name };
  });
  const sso = providers.filter((p) => p.id !== 'credentials');
  const allowCreds = providers.some((p) => p.id === 'credentials');

  const denied = error === 'AccessDenied' || error === 'CredentialsSignin';

  return (
    <main className="login-ovl">
      <div className="login-card">
        <img className="login-logo" src="/assets/logo-moca-login.png" alt="Ministry of Cabinet Affairs" />
        <h1 className="login-title">MOCA Events Command Center</h1>
        <div className="login-ar">مركز قيادة فعاليات وزارة شؤون مجلس الوزراء</div>
        <p className="login-sub">
          Sign in with your ministry account. Access levels (Admin, Team, Stream Lead, Hotel, H.E.) are assigned by your administrator.
          <br />
          <span dir="rtl" style={{ display: 'block', marginTop: 6 }}>سجّل الدخول بحساب الوزارة. مستويات الوصول يحددها مسؤول النظام.</span>
        </p>
        {denied && (
          <div className="login-err">
            Your account is not provisioned on this platform, or it is disabled. Ask an administrator to add your email on the Management Access page.
            <br />
            <span dir="rtl">حسابك غير مضاف إلى المنصة أو موقوف — اطلب من المشرف إضافة بريدك في صفحة إدارة الصلاحيات.</span>
          </div>
        )}
        {error && !denied && <div className="login-err">Sign-in failed ({error}). Please try again or contact IT.</div>}
        {sso.length === 0 && !allowCreds && (
          <div className="login-err">No identity provider is configured. IT: set AUTH_MICROSOFT_ENTRA_ID_* in .env (see IT-DEPLOYMENT-GUIDE.md).</div>
        )}
        <div style={{ display: 'grid', gap: 10 }}>
          {sso.map((p) => (
            <form key={p.id} action={async () => { 'use server'; try { await signIn(p.id, { redirectTo: '/' }); } catch (e) { if (e instanceof AuthError) redirect('/signin?error=' + encodeURIComponent(e.type)); throw e; } }}>
              <button className="login-btn" type="submit">Sign in with {p.name} · تسجيل الدخول</button>
            </form>
          ))}
          {allowCreds && (
            <form action={async (fd: FormData) => { 'use server'; try { await signIn('credentials', { email: String(fd.get('email') || ''), redirectTo: '/' }); } catch (e) { if (e instanceof AuthError) redirect('/signin?error=AccessDenied'); throw e; } }}>
              <input className="login-inp" name="email" type="email" placeholder="Email (local test sign-in)" autoComplete="username" required />
              <button className="login-btn" type="submit" style={{ background: '#6B7688' }}>Local test sign-in (no SSO)</button>
            </form>
          )}
        </div>
        <div className="login-foot">Ministry of Cabinet Affairs · United Arab Emirates</div>
      </div>
    </main>
  );
}
