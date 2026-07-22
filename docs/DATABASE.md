# Database — MOCA Events Command Center

PostgreSQL, accessed through **Prisma** (`prisma/schema.prisma`). Bilingual content is
stored as `*_en` / `*_ar` column pairs to match the UI's `[en, ar]` convention. Auth
models follow the Auth.js (NextAuth v5) Prisma adapter contract.

## Entity–relationship diagram

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ Update : submits

    Event ||--o{ Team : contains
    Event ||--o{ TimelineDay : has
    Event ||--o{ Update : receives

    Team ||--o{ Member : has
    Team ||--o{ ActionItem : has

    TimelineDay ||--o{ TimelineBlock : has

    User {
        string id PK
        string email UK
        string name
        Role   role "VIEWER | MANAGER | ADMIN"
        datetime createdAt
    }
    Account {
        string id PK
        string userId FK
        string provider
        string providerAccountId
    }
    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }
    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }
    Event {
        string id PK
        string slug UK "wef | agm | mbr | …"
        string nameEn
        string nameAr
        string periodEn
        string periodAr
        string logoUrl
        EventState state "ACTIVE | BLANK"
        datetime eventDate
    }
    Team {
        string id PK
        string eventId FK
        string key "d1 … dN (per event)"
        string nameEn
        string nameAr
        Status status "GREEN | AMBER | RED"
        int    progress
        string leadName
        string depName
        int    order
    }
    Member {
        string id PK
        string teamId FK
        string nameEn
        string nameAr
        string roleEn
        string roleAr
        string photo "data URI / URL"
        int    order
    }
    ActionItem {
        string id PK
        string teamId FK
        string titleEn
        string titleAr
        string owner
        Status status
        string priority "h | m | l"
        string dueLabel
    }
    TimelineDay {
        string id PK
        string eventId FK
        string dateEn
        string dateAr
        string dayEn
        string dayAr
        string icon
        int    order
    }
    TimelineBlock {
        string id PK
        string dayId FK
        string time
        string titleEn
        string titleAr
        string locEn
        string locAr
        string teamEn
        string notesEn
        int    order
    }
    Update {
        string id PK
        string eventId FK
        string userId FK
        string workstream
        int    progress
        string status
        datetime createdAt
    }
```

## Enums

| Enum | Values | Meaning |
|---|---|---|
| `Role` | `VIEWER`, `MANAGER`, `ADMIN` | RBAC. `MANAGER`+ unlock editing & budget breakdown. |
| `Status` | `GREEN`, `AMBER`, `RED` | On track / needs attention / at risk. |
| `EventState` | `ACTIVE`, `BLANK` | Populated event vs. empty (zero-state) event. |

## Tables (summary)

| Table | Purpose |
|---|---|
| `User`, `Account`, `Session`, `VerificationToken` | Auth.js identity & SSO linkage |
| `Event` | Top-level events (WEF, AGM, MBR, custom) |
| `Team` | Operational teams / streamlines per event |
| `Member` | Team members (workforce) |
| `ActionItem` | Per-team operational tracker rows |
| `TimelineDay` / `TimelineBlock` | Event agenda days and sessions (editable) |
| `Update` | Submitted team updates |

## Migrations & seeding

```bash
# create the schema
npx prisma migrate deploy         # prod
npx prisma migrate dev            # local (creates + applies a migration)

# generate the typed client
npx prisma generate

# provision an initial admin (IT build ships with ZERO fake data)
SEED_ADMIN_EMAIL=you@moca.gov.ae npm run db:seed
```

The IT build creates **no** sample events/teams — content is created by admins in-app and
persisted via the API / data-provider (`src/lib/data-provider.ts`).

## Data-flow (demo vs it)

```mermaid
flowchart LR
    subgraph Demo
        DUI["UI"] --> LS[("localStorage<br/>(seed + edits)")]
    end
    subgraph IT
        IUI["UI"] -->|/api/*| DPV["data-provider"] --> PZ[("PostgreSQL")]
    end
```
