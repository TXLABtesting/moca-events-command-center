# MOCA Events Command Center

A bilingual (English / العربية, RTL-aware) executive **events command center** for the
UAE Ministry of Cabinet Affairs. It tracks multiple government events (World Economic
Forum, Annual Government Meetings, MBR Government Excellence Award, …) with a landing
"Events Tracker", per-event Executive Overview, an Operational Tracker of team cards →
full team-detail pages, an event Timeline, an Update-submission form, and Settings —
plus Admin/Management editing, a WhatsApp "Comment" feature, a printable "Generate
Guide", live countdown, and localStorage persistence.

The UI is a **pixel-perfect** port of the approved Claude Design prototype
(`WEF Command Center.dc.html`). Its full CSS is reused verbatim and the prototype's
state/logic is preserved, so the look and behavior are identical to the sign-off design.

---

## Tech stack

| Concern      | Choice |
|--------------|--------|
| Framework    | **Next.js 15** (App Router) + **React 18** + **TypeScript** |
| Styling      | Verbatim design CSS (`src/app/globals.css`) — design tokens unchanged |
| Database     | **PostgreSQL** via **Prisma** ORM (`prisma/schema.prisma`) |
| Auth         | **Auth.js / NextAuth v5** — Microsoft Entra ID (Azure AD) SSO + generic OAuth/OIDC + demo credentials |
| Dashboard    | `src/components/DashboardApp.jsx` — the ported design (client-only SPA) |

---

## Branches

This repository is organized around two long-lived branches, per the delivery brief:

### `demo` — for demonstrations
- **Fake/seed data baked in** (WEF fully populated, AGM populated, MBR blank) so the app
  is instantly explorable with no database.
- **Role switcher** (bottom-left): Viewer / Manager / Admin — flips Management Access
  (edit + budget breakdown) live, no login required.
- Credentials login enabled; `NEXT_PUBLIC_DEMO_MODE=true`.
- **No backend required** — runs from `npm install && npm run dev`.

### `it` — for IT / production hardening
- **Full proper architecture, zero fake data.** The dashboard's seed arrays are emptied;
  events/teams are created by admins through the UI and persist to **Postgres** via the
  API (`/api/events`, `src/lib/data-provider.ts`).
- **SSO required** — `middleware.ts` gates every route to an authenticated session and
  sends anonymous users to `/signin`. Credentials login is disabled.
- `NEXT_PUBLIC_DEMO_MODE` unset; `AUTH_ALLOW_CREDENTIALS=false`.

Both branches share one codebase; they differ by environment flags and (on `it`) the
emptied seed data + auth gate.

---

## Getting started

```bash
cp .env.example .env        # then edit values
npm install
npm run dev                 # http://localhost:3000
```

### Demo build
`.env` → `NEXT_PUBLIC_DEMO_MODE=true`, `AUTH_ALLOW_CREDENTIALS=true`. No DB needed.
Admin password inside the app is `1234` (from the prototype), or use the role switcher.

### IT build (Postgres + SSO)
1. Provision Postgres and set `DATABASE_URL`.
2. `npx prisma migrate deploy` (or `npm run prisma:migrate` in dev) to create tables.
3. `SEED_ADMIN_EMAIL=you@moca.gov.ae npm run db:seed` to grant yourself admin.
4. Configure SSO (below) and set `NEXT_PUBLIC_DEMO_MODE=false`, `AUTH_ALLOW_CREDENTIALS=false`.
5. `npm run build && npm start`.

---

## SSO configuration

Set these in `.env` (see `.env.example` for the full list):

**Microsoft Entra ID (Azure AD)** — the primary org SSO:
```
AUTH_MICROSOFT_ENTRA_ID_ID=<application (client) id>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<client secret>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://your-host
```
Redirect URI to register in Azure: `https://your-host/api/auth/callback/microsoft-entra-id`.

**Generic OAuth 2.0 / OIDC** (any other IdP — Okta, Auth0, a government OIDC gateway):
```
OAUTH_NAME="SSO"
OAUTH_ISSUER=<https://idp/.well-known base issuer>
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
```
Redirect URI: `https://your-host/api/auth/callback/oauth`.

Roles (`VIEWER` / `MANAGER` / `ADMIN`) are carried on the session; map them from your
IdP claims in the `jwt` callback in `src/auth.ts`.

---

## Project structure

```
src/
  app/
    layout.tsx                    root layout (loads globals.css)
    page.tsx                      renders the dashboard
    AppClient.tsx                 client mount (ssr:false) + demo role switcher
    globals.css                   verbatim design CSS / tokens
    signin/page.tsx               SSO sign-in page
    api/
      auth/[...nextauth]/route.ts NextAuth handlers
      events/route.ts             list/create events (Postgres)
  components/
    DashboardApp.jsx              the ported design (state, data, handlers, render)
  lib/
    prisma.ts                     Prisma client singleton
    data-provider.ts             UI ↔ Postgres seam (IT build)
  auth.ts                         NextAuth config (Entra + OAuth + demo creds)
  middleware.ts                   route gating (IT build)
prisma/
  schema.prisma                   Postgres schema
  seed.ts                         admin bootstrap (no fake data)
public/assets/                    logos + background (from the design bundle)
```

## Notes / next steps for IT

- The demo build persists edits in the browser (localStorage), matching the prototype.
- The `it` branch wires event listing/creation to Postgres; extending the same
  data-provider pattern to teams, members, action items, timeline and submitted updates
  (models already defined in `schema.prisma`) is the remaining backend work.
- The dashboard component carries a `// @ts-nocheck` header because it is a faithful
  JS port of the design; it is isolated from the typed application code around it.
