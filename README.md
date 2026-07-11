# Dues

A payment reminder app that tracks recurring and one-time dues with push notifications.

<p align="center">
  <img src="public/screenshot-mobile.png" alt="Dashboard mobile view" width="360" />
</p>

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Turso (libSQL) with Drizzle ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Testing**: Vitest (unit) + Playwright (e2e)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                 |
| ------------------ | --------------------------- |
| `pnpm dev`         | Start dev server            |
| `pnpm build`       | Production build            |
| `pnpm start`       | Start production server     |
| `pnpm lint`        | Run ESLint                  |
| `pnpm format`      | Format with Prettier        |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm test`        | Run unit tests              |
| `pnpm test:e2e`    | Run Playwright tests        |

## Project Structure

```
src/
├── app/              # Next.js pages, layouts, and server actions
│   ├── actions/      # Server actions (thin entry points)
│   ├── accounts/     # Account pages
│   └── api/          # API routes (cron only)
├── components/       # React components
│   ├── shared/       # Reusable UI
│   ├── accounts/     # Account-specific
│   └── dashboard/    # Dashboard-specific
├── db/               # Drizzle schema and client
├── repositories/     # Data access layer
├── schemas/          # Zod validation schemas
├── services/         # Business logic
└── utils/            # Pure helper functions
```
