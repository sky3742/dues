# Dues Reminder App — MVP 1 Plan

## Overview

A personal web app to track payment due dates and receive browser push notifications when payments are approaching.

## Tech Stack

| Layer              | Technology                | Version       |
| ------------------ | ------------------------- | ------------- |
| Framework          | Next.js (App Router)      | 16.x          |
| Styling            | Tailwind CSS + DaisyUI    | v4 + v5       |
| ORM                | Drizzle ORM               | Latest        |
| Database           | SQLite (Turso)            | libSQL driver |
| Push Notifications | web-push                  | Latest        |
| Package Manager    | pnpm                      | Latest        |
| Git Hooks          | Husky                     | 9.x           |
| Linting            | ESLint + Prettier         | Latest        |
| Commit Convention  | commitlint (conventional) | Latest        |
| Staged Files       | lint-staged               | Latest        |

Auth excluded from MVP 1 (personal tool, single user).

## Data Model

SQLite uses different types than Postgres. Drizzle handles the mapping. Boolean = integer (0/1), timestamps = text (ISO strings), IDs generated via `crypto.randomUUID()`.

### `accounts` table

Stores payment/bill accounts.

| Column        | Type    | Notes                                              |
| ------------- | ------- | -------------------------------------------------- |
| id            | text    | PK, default `crypto.randomUUID()`                  |
| name          | text    | NOT NULL — e.g. "Rent", "Internet"                 |
| type          | text    | NOT NULL — `recurring` or `one_time`               |
| due_day       | integer | NOT NULL — day of month (1-31)                     |
| reminder_days | integer | NOT NULL, default 3 — days before due to send push |
| is_active     | integer | NOT NULL, default 1 — boolean (1=true, 0=false)    |
| created_at    | text    | NOT NULL — ISO timestamp                           |
| updated_at    | text    | NOT NULL — ISO timestamp                           |

### `payments` table

Tracks paid status per billing cycle (per account per month).

| Column     | Type    | Notes                                            |
| ---------- | ------- | ------------------------------------------------ |
| id         | text    | PK, default `crypto.randomUUID()`                |
| account_id | text    | NOT NULL, FK → accounts.id ON DELETE CASCADE     |
| year       | integer | NOT NULL — e.g. 2026                             |
| month      | integer | NOT NULL — 1=Jan, 12=Dec                         |
| paid       | integer | NOT NULL, default 0 — boolean (1=paid, 0=unpaid) |
| paid_at    | text    | NULL — ISO timestamp when marked paid            |
| created_at | text    | NOT NULL — ISO timestamp                         |

**Unique constraint:** `(account_id, year, month)`

### `push_subscriptions` table

Stores browser push subscriptions (required for server-side push).

| Column     | Type | Notes                                        |
| ---------- | ---- | -------------------------------------------- |
| id         | text | PK, default `crypto.randomUUID()`            |
| endpoint   | text | NOT NULL, UNIQUE — push service endpoint URL |
| p256dh     | text | NOT NULL — encryption key                    |
| auth       | text | NOT NULL — auth secret                       |
| user_agent | text | NULL — browser info                          |
| created_at | text | NOT NULL — ISO timestamp                     |

## Project Structure

```
dues/
├── public/
│   ├── sw.js                             # Service worker for push events
│   └── manifest.json                     # PWA manifest (optional)
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, font, providers
│   │   ├── page.tsx                      # Dashboard (home)
│   │   ├── globals.css                   # Tailwind + DaisyUI config
│   │   ├── accounts/
│   │   │   ├── page.tsx                  # Account list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create account form
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx          # Edit account form
│   │   └── api/
│   │       ├── accounts/
│   │       │   ├── route.ts              # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts          # GET (one), PUT (update), DELETE
│   │       ├── payments/
│   │       │   ├── route.ts              # GET (list payments)
│   │       │   └── toggle/
│   │       │       └── route.ts          # POST (toggle paid/unpaid)
│   │       ├── push/
│   │       │   ├── subscribe/
│   │       │   │   └── route.ts          # POST (save subscription)
│   │       │   └── unsubscribe/
│   │       │       └── route.ts          # POST (remove subscription)
│   │       └── cron/
│   │           └── check-due/
│   │               └── route.ts          # GET (Vercel cron trigger)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client (Turso/libSQL)
│   │   │   └── schema.ts                 # All table definitions
│   │   ├── push.ts                       # web-push send wrapper
│   │   └── utils.ts                      # Date helpers, due calculation
│   ├── components/
│   │   ├── account-card.tsx              # Account summary card
│   │   ├── account-form.tsx              # Create/edit form component
│   │   ├── payment-toggle.tsx            # Paid/unpaid toggle button
│   │   ├── dashboard-stats.tsx           # Upcoming/overdue summary
│   │   └── push-subscribe.tsx            # Push notification subscribe UI
│   ├── hooks/
│   │   └── use-push-notification.ts      # Browser push subscription hook
│   └── actions/
│       ├── accounts.ts                   # Server actions for CRUD
│       └── payments.ts                   # Server actions for toggle
├── drizzle.config.ts                     # Drizzle Kit config (turso dialect)
├── vercel.json                           # Cron job config
├── package.json
├── tsconfig.json
├── postcss.config.mjs                    # Tailwind CSS plugin
├── .prettierrc
├── commitlint.config.js
├── .husky/
│   ├── pre-commit                        # format + lint (lint-staged)
│   └── pre-push                          # build
└── PLAN.md                               # This file
```

## Due Date Logic

### Recurring accounts

- Each month, the due date is `due_day` of the current month.
- If `due_day` exceeds the month's last day, use the last day (e.g. `due_day: 31` in Feb → Feb 28/29).

### One-time accounts

- The due date is `due_day` of the month the account was created.
- After the due date passes, no further notifications are sent.
- User can optionally set a different month, but MVP 1 uses creation month.

### "Days until due" calculation

```
next_due_date = calculateNextDueDate(account, today)
days_until_due = differenceInDays(next_due_date, today)
```

For recurring: if today's day >= due_day, next_due is due_day of next month.
For one-time: if already past due, return null (no notification).

## Cron Job Logic (`/api/cron/check-due`)

```
1. Verify x-vercel-cron header OR Bearer token (CRON_SECRET env var)
2. Query all active accounts
3. Fetch all push subscriptions
4. For each account:
   a. Calculate next due date (handle month-end edge cases)
   b. Calculate days until due
   c. If days_until_due <= account.reminder_days AND days_until_due >= 0:
      - Check payments table: is there a paid record for this cycle?
      - If NOT paid → send push notification to all subscriptions
5. Return JSON: { accountsChecked, notificationsSent }
```

Runs **daily at 8am UTC** via Vercel cron.

### Push notification payload

```json
{
  "title": "Dues Reminder",
  "body": "Your [account name] is due in [X] days",
  "icon": "/icon.png"
}
```

## Web Push Architecture

### Client side

1. User clicks "Enable Notifications" on dashboard
2. `use-push-notification.ts` hook:
   - Registers service worker (`/sw.js`)
   - Requests browser push permission
   - Subscribes to push via `PushManager`
   - Sends subscription to `/api/push/subscribe`

### Server side

1. `/api/push/subscribe` saves subscription to `push_subscriptions` table
2. `/api/push/unsubscribe` removes subscription
3. Cron job reads subscriptions from DB, sends via `web-push` library

### Service Worker (`public/sw.js`)

- Listens for `push` events
- Displays notification with title/body/icon from payload
- Handles `notificationclick` to focus/open the app

### VAPID Keys

Generated once locally via `npx web-push generate-vapid-keys`.
Stored as env vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (email).

## Dashboard UX

```
┌──────────────────────────────────────────┐
│  💰 Dues Reminder                 [+ Add]│
├──────────────────────────────────────────┤
│                                          │
│  ⚠ Overdue: 1       ⏰ Due Soon: 2      │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🏠 Rent                          │    │
│  │ Due: Jun 1 • Recurring           │    │
│  │ ⚠ Overdue by 20 days            │    │
│  │                   [Mark Paid ✓]  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🌐 Internet                      │    │
│  │ Due: Jun 15 • Recurring          │    │
│  │ 16 days left                     │    │
│  │                   [Paid ✓]       │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🔧 Car Repair                    │    │
│  │ Due: Jul 1 • One-time            │    │
│  │ 10 days left                     │    │
│  │                   [Mark Paid ✓]  │    │
│  └──────────────────────────────────┘    │
│                                          │
├──────────────────────────────────────────┤
│  🔔 Push Notifications: [Subscribed ✓]  │
└──────────────────────────────────────────┘
```

### Color coding (DaisyUI alerts)

- **Overdue** (past due, unpaid): `alert-error`
- **Due soon** (within reminder window): `alert-warning`
- **Paid**: `alert-success` or muted
- **Not due yet** (beyond reminder window): neutral/card style

## Pages

| Route                 | Description                                     |
| --------------------- | ----------------------------------------------- |
| `/`                   | Dashboard — upcoming dues, stats, quick actions |
| `/accounts`           | Full account list with management               |
| `/accounts/new`       | Create new account form                         |
| `/accounts/[id]/edit` | Edit account form                               |

## Server Actions

### Accounts

- `createAccount(data)` → insert into accounts, revalidate
- `updateAccount(id, data)` → update accounts, revalidate
- `deleteAccount(id)` → delete from accounts (cascade deletes payments), revalidate
- `toggleAccountActive(id)` → flip is_active

### Payments

- `togglePayment(accountId, year, month)` → upsert paid status, revalidate
- `getPaymentsForAccount(accountId)` → list payment history

## Environment Variables

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# VAPID (web push)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your@email.com

# Cron security
CRON_SECRET=a-random-secret-string

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Build & Dev Tooling

### Scripts (package.json)

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "prepare": "husky"
  }
}
```

> Note: `drizzle-kit push` pushes schema changes directly to the DB (no migration files needed for development). `drizzle-kit generate` creates migration files for production use.

### Husky hooks

- **pre-commit**: `lint-staged` → prettier format + eslint fix on staged files
- **pre-push**: `pnpm build`

### lint-staged config

```json
{
  "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
  "*.{json,css,md}": ["prettier --write"]
}
```

### commitlint

Enforces [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `ci:`

## Vercel Cron Config

```json
{
  "crons": [
    {
      "path": "/api/cron/check-due",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## Key Decisions

1. **No auth** — Personal tool, single user. Can add Better Auth later.
2. **Subscriptions in DB** — Server-side cron needs DB access to send push.
3. **Month-end edge case** — `due_day: 31` in 30-day month → last day of month.
4. **Standard notification message** — "Your [name] is due in [X] days". No custom messages.
5. **DaisyUI v5** — Uses CSS-based config (`@plugin "daisyui"` in globals.css), no tailwind.config.js.
6. **Next.js 16** — Uses `proxy.ts` instead of `middleware.ts` (not needed for MVP1 without auth).
7. **Turbopack** — Default dev server flag for faster HMR.
8. **Turso over Neon** — More generous free tier (9 GB vs 0.5 GB), faster edge reads, simpler billing for a personal tool. SQLite is sufficient for 3 small tables.

## Future Considerations (Post-MVP1)

- Add Better Auth for multi-user support
- Email statement parsing (LLM-based PDF extraction)
- Custom reminder messages
- Amount tracking
- Payment history dashboard with charts
- Email notifications as fallback
- PWA install prompt
- Recurring auto-reset logic refinements
