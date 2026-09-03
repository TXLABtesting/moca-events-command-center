import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Authentication — MOCA Events Command Center (IT build)
//
// Identity comes from the ministry's identity provider; the platform holds no
// passwords. A person can sign in only if an administrator has added their email
// on the Management Access page (allow-list) and the account is active. Role and
// team assignments are read from the database on every request (see lib/roles).
//
//   1. Microsoft Entra ID (Azure AD) — AUTH_MICROSOFT_ENTRA_ID_* env vars.
//   2. Any other OIDC provider     — OAUTH_* env vars (optional, e.g. UAE PASS gateway).
//   3. Credentials (email only)    — ONLY when AUTH_ALLOW_CREDENTIALS=true, for local
//      testing without an IdP. Never enable it in production.
// ---------------------------------------------------------------------------

const providers: NextAuthConfig['providers'] = [];

if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  );
}

if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_ISSUER) {
  providers.push({
    id: 'oauth',
    name: process.env.OAUTH_NAME || 'SSO',
    type: 'oidc',
    issuer: process.env.OAUTH_ISSUER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    authorization: { params: { scope: process.env.OAUTH_SCOPE || 'openid profile email' } },
  });
}

if (process.env.AUTH_ALLOW_CREDENTIALS === 'true') {
  providers.push(
    Credentials({
      name: 'Local test sign-in',
      credentials: { email: { label: 'Email', type: 'email' } },
      authorize: async (creds) => {
        const email = String(creds?.email || '').trim().toLowerCase();
        if (!email) return null;
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u || !u.active) return null;
        return { id: u.id, email: u.email, name: u.name ?? u.email };
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  pages: { signIn: '/signin', error: '/signin' },
  trustHost: true,
  callbacks: {
    // Allow-list: the email must exist and be active. Unknown accounts are refused.
    async signIn({ user }) {
      const email = user?.email?.toLowerCase();
      if (!email) return false;
      const u = await prisma.user.findUnique({ where: { email } });
      if (!u || !u.active) {
        await prisma.auditLog.create({ data: { actorEmail: email, action: 'auth.denied', detail: { reason: !u ? 'not-provisioned' : 'disabled' } } }).catch(() => {});
        return '/signin?error=AccessDenied';
      }
      await prisma.user.update({ where: { id: u.id }, data: { lastSignInAt: new Date(), name: u.name ?? user.name ?? undefined } }).catch(() => {});
      await prisma.auditLog.create({ data: { actorId: u.id, actorEmail: email, action: 'auth.signin' } }).catch(() => {});
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email.toLowerCase();
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) session.user.email = String(token.email);
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
