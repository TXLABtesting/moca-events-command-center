# Architecture — MOCA Events Command Center

Bilingual (EN / العربية, RTL-aware) executive events command center for the UAE Ministry
of Cabinet Affairs. This document describes the target production architecture on the
**`it`** branch (Next.js + PostgreSQL + SSO) and how the demo build relates to it.

---

## 1. System context

```mermaid
flowchart TB
    subgraph Users
        A1["Ministry staff<br/>(Admin / Manager / Viewer)"]
        A2["Team leads / inputters"]
        A3["Leadership (H.E.)"]
    end

    subgraph IdP["Identity Provider"]
        E["Microsoft Entra ID (Azure AD)<br/>or generic OAuth / OIDC"]
    end

    subgraph App["MOCA Events Command Center (Next.js)"]
        MW["middleware.ts<br/>route gating"]
        UI["React UI (App Router)"]
        API["API routes /api/*"]
        AUTH["Auth.js / NextAuth v5"]
    end

    DB[("PostgreSQL<br/>(Prisma ORM)")]

    A1 & A2 & A3 -->|HTTPS| MW --> UI
    UI -->|fetch| API
    UI -. sign in .-> AUTH
    AUTH <-->|OAuth 2.0 / OIDC| E
    API --> DB
    AUTH --> DB
```

---

## 2. Application layers

```mermaid
flowchart LR
    subgraph Client["Client (browser)"]
        R["React 18 components<br/>(bilingual, RTL, localStorage cache)"]
    end
    subgraph Server["Next.js server (Node)"]
        direction TB
        P["App Router pages / layouts"]
        M["middleware.ts (edge)"]
        H["/api/auth/[...nextauth]"]
        EV["/api/events (+ future teams,<br/>members, actions, timeline, updates)"]
        DP["lib/data-provider.ts<br/>(UI ⇄ DB seam)"]
        PR["lib/prisma.ts (singleton)"]
    end
    subgraph Data["Data / Identity"]
        PG[("PostgreSQL")]
        IDP["Entra ID / OAuth"]
    end

    R --> P
    R --> EV
    R -.auth.-> H
    M --> P
    H <--> IDP
    H --> PR
    EV --> DP --> PR --> PG
```

| Layer | Tech | Responsibility |
|---|---|---|
| UI | Next.js 15 App Router, React 18, TypeScript | Screens, bilingual/RTL, client interactions |
| Styling | Verbatim design CSS tokens (`globals.css`) | Pixel-perfect match to the approved design |
| Auth | Auth.js / NextAuth v5 | SSO (Entra ID + generic OAuth) + session/JWT |
| Gating | `middleware.ts` | Redirect unauthenticated users to `/signin` |
| API | Route handlers under `/api` | CRUD over domain entities |
| Data seam | `lib/data-provider.ts` | Maps DB rows ⇄ the UI's `[en, ar]` DTOs |
| ORM | Prisma | Typed DB access, migrations |
| DB | PostgreSQL | Persistent store (see `DATABASE.md`) |

---

## 3. Environments / builds

```mermaid
flowchart TB
    subgraph demo["demo build (branch: demo)"]
        d1["NEXT_PUBLIC_DEMO_MODE=true"]
        d2["Seed / fake data baked in"]
        d3["Role switcher (Admin/Team/…)"]
        d4["No DB, no SSO — static export → GitHub Pages"]
    end
    subgraph it["it build (branch: it)"]
        i1["NEXT_PUBLIC_DEMO_MODE=false"]
        i2["Zero fake data"]
        i3["SSO required (Entra ID / OAuth)"]
        i4["PostgreSQL via Prisma"]
    end
    subgraph shared["Shared"]
        s1["Same UI + design tokens"]
        s2["Same domain model"]
    end
    shared --> demo
    shared --> it
```

- **Live demo (Pages):** `https://txlabtesting.github.io/moca-events-command-center/`
- **`current-build/`** in this branch is the exact current shipping UI (the approved
  Claude Design build: latest redesign + timeline editing + no loading splash), provided
  so IT can run/inspect the real UI offline while the Next.js port is completed.

---

## 4. Deployment topology (target for IT)

```mermaid
flowchart LR
    subgraph Edge
        CDN["CDN / reverse proxy (TLS)"]
    end
    subgraph AppTier["App tier (Node 20)"]
        N1["Next.js instance"]
        N2["Next.js instance"]
    end
    subgraph DataTier
        PGP[("PostgreSQL (primary)")]
        PGR[("PostgreSQL (replica, optional)")]
    end
    IDP["Microsoft Entra ID"]

    CDN --> N1 & N2
    N1 & N2 --> PGP
    PGP --> PGR
    N1 & N2 <-->|OIDC| IDP
```

Recommended: containerize the Next.js app (Dockerfile), run behind the ministry's
reverse proxy/WAF, connect to a managed PostgreSQL, and register the app in Entra ID
(redirect URI `https://<host>/api/auth/callback/microsoft-entra-id`).

---

## 5. Repository / branch map

| Branch | Purpose |
|---|---|
| `main` | Shared base (Next.js + Prisma + Auth scaffold) |
| `demo` | Fake data + role switcher; static export → GitHub Pages (live demo) |
| `it` | Proper architecture, zero fake data, SSO; **this branch** — includes `docs/` + `current-build/` |
| `gh-pages` | Published static site (serves the live demo build) |

See also: [`DATABASE.md`](./DATABASE.md) · [`FLOWS.md`](./FLOWS.md)
