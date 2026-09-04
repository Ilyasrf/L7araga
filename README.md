# L7araga — 1337 Transfer Tracker

A web app that tracks and displays students holding the "L7araga" achievement across 42 network campuses. Pulls data from the 42 API, stores it in PostgreSQL, and serves it through a responsive dashboard with real-time filtering.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + tsParticles
- **Deployment:** Vercel (with cron-based auto-sync)

## Features

- Dashboard displaying achievement holders in a responsive grid
- Filter by campus and promo (year)
- Animated starfield background
- Automatic data sync via Vercel cron (every 6 hours)
- Manual sync trigger via protected API endpoint
- 42 API integration for real-time student data

## Getting Started

```bash
git clone https://github.com/YOUR-USERNAME/L7araga.git
cd L7araga
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables below)
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FORTY_TWO_CLIENT_ID` | Yes | 42 API application UID |
| `FORTY_TWO_CLIENT_SECRET` | Yes | 42 API application secret |
| `CRON_SECRET` | Yes | Random string for cron endpoint auth |
| `SYNC_MODE` | Yes | `campus` or `achievement` |
| `ACHIEVEMENT_ID` | If `SYNC_MODE=achievement` | Target achievement ID |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions (Vercel + Supabase + 42 API).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client and build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
