# Flows — MOCA Events Command Center

Key user and system flows. Diagrams render on GitHub (mermaid).

---

## 1. Authentication / SSO (IT build)

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant MW as middleware.ts
    participant NA as Auth.js (/api/auth)
    participant IdP as Entra ID / OAuth
    participant DB as PostgreSQL

    U->>B: open app
    B->>MW: GET /
    alt no session
        MW-->>B: 307 redirect /signin
        U->>B: click "Continue with SSO"
        B->>NA: signIn(provider)
        NA->>IdP: OAuth 2.0 / OIDC authorize
        IdP-->>NA: code → tokens + profile
        NA->>DB: upsert User / Account / Session
        NA-->>B: set session cookie → redirect /
    end
    B->>MW: GET / (with session)
    MW-->>B: allow → app renders
```

Roles (`VIEWER` / `MANAGER` / `ADMIN`) are carried on the session (JWT `role` claim) and
mapped from IdP claims in `src/auth.ts` → `callbacks.jwt`.

---

## 2. Navigation: events → team → detail

```mermaid
flowchart TD
    L["Landing: Events Tracker<br/>(cards + calendar + role switcher)"] --> E{Open event}
    E --> OV["Executive Overview<br/>(readiness, countdown, KPIs, attention)"]
    OV --> OT["Operational Tracker<br/>(team cards)"]
    OT --> TD["Team Detail<br/>(workforce, updates, challenges,<br/>approvals, next steps, action list)"]
    OT --> ED["Event Design"]
    L --> TL["Timeline (agenda)"]
    L --> FB["Feedback"]
    L --> ST["Settings"]
    TD --> AC["Action popup"]
```

---

## 3. Timeline editing (Admin) — latest feature

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as Timeline page
    participant S as State + localStorage

    A->>UI: switch role → Admin
    A->>UI: open Timeline → click "Edit Timeline"
    Note over UI: edit mode on (blocks highlighted, ✎ Edit Day chips)
    alt edit a session
        A->>UI: click a session card
        UI-->>A: modal (time, title, subtitle, location, team, notes)
        A->>UI: Save Changes
        UI->>S: persist wef_tledits[event].blocks[di:bi]
    else edit a day
        A->>UI: click "✎ Edit Day"
        UI-->>A: modal (date, day title, tagline)
        A->>UI: Save Changes
        UI->>S: persist wef_tledits[event].days[di]
    end
    UI-->>A: "Timeline updated" toast; changes persist across reloads
```

*IT note:* in the production build this persistence moves from `localStorage` to
`TimelineDay` / `TimelineBlock` via `/api/*` (data-provider), gated to `MANAGER`/`ADMIN`.

---

## 4. Approvals workflow

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Approved: approve
    Pending --> Rejected: reject (+ reason)
    Pending --> InfoRequested: request more info
    InfoRequested --> Pending: info provided
    Approved --> [*]
    Rejected --> [*]
```

---

## 5. Data persistence (demo vs it)

```mermaid
flowchart LR
    subgraph Demo["demo build"]
        A1["Edit / add"] --> A2[("localStorage")]
        A2 --> A3["Re-render (client only)"]
    end
    subgraph IT["it build"]
        B1["Edit / add"] --> B2["POST/PATCH /api/*"]
        B2 --> B3["data-provider → Prisma"]
        B3 --> B4[("PostgreSQL")]
        B4 --> B5["Read back → UI"]
    end
```

---

## 6. Event creation (Add New Event)

```mermaid
sequenceDiagram
    actor A as Manager/Admin
    participant UI as Landing
    participant API as /api/events
    participant DB as PostgreSQL
    A->>UI: "Add New Event" → fill form (name EN/AR, logo, period, owner)
    UI->>API: POST /api/events
    API->>API: check role (MANAGER|ADMIN)
    API->>DB: INSERT Event (state=BLANK)
    DB-->>API: event
    API-->>UI: 201 → new blank tracker (zero-state)
```

See also: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`DATABASE.md`](./DATABASE.md)
