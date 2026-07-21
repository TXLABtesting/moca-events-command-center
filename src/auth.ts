import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';

// ---------------------------------------------------------------------------
// Authentication — MOCA Events Command Center
//
// The login will be SSO. This config is wired for two OAuth strategies now so
// switching on the real IdP later is only an env change:
//
//   1. Microsoft Entra ID (Azure AD)  — the primary org SSO.
//   2. A generic OAuth 2.0 / OIDC provider — any other IdP (Okta, Auth0, a
//      government OIDC gateway, etc.). Enabled when OAUTH_* env vars are set.
//
// A Credentials provider is included ONLY for the demo build (role switching /
// local login without an IdP). It is disabled unless AUTH_ALLOW_CREDENTIALS is
// "true" — the IT build leaves it off so the only way in is real SSO.
//
// Sessions use JWT strategy so the app runs without a database when demoing;
// the Prisma adapter can be layered in for the IT build (see README).
// ---------------------------------------------------------------------------

type Role = 'VIEWER' | 'MANAGER' | 'ADMIN';

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

// Generic OAuth 2.0 / OIDC provider (discovery via issuer .well-known).
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

// Demo-only credentials login (never enabled in the IT build).
if (process.env.AUTH_ALLOW_CREDENTIALS === 'true') {
  providers.push(
    Credentials({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      authorize: async (creds) => {
        const email = (creds?.email as string) || 'demo@moca.gov.ae';
        const role = ((creds?.role as string) || 'VIEWER').toUpperCase() as Role;
        return { id: email, email, name: 'Demo User', role };
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) token.role = (user as { role?: Role }).role ?? 'VIEWER';
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: Role }).role = (token.role as Role) ?? 'VIEWER';
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
