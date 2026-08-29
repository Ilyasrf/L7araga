# 1337 Transfer Tracker v2 — Design Spec

## Overview

Refactored architecture: Public dashboard showing Moroccan 42 students who've achieved travel/exchange. Data synced automatically via 42 API Client Credentials flow. No user login required.

## Key Changes from v1

- Removed: NextAuth, user OAuth, onboarding, login page
- Added: 42 API Client Credentials sync, public dashboard, cron job
- Database: Supabase PostgreSQL (Prisma connects directly)
- Deployment: Vercel + Supabase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion |
| Animation | tsparticles (stars/galaxy background) |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Sync | 42 API Client Credentials Flow |
| Deployment | Vercel (hosting + cron) + Supabase (database) |

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AchievementHolder {
  id          String   @id @default(cuid())
  intraId     Int      @unique
  login       String   @unique
  displayName String?
  imageUrl    String?
  campusName  String
  campusId    Int
  promo       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([campusName])
  @@index([promo])
}
```

## API Design

### `GET /api/holders` (Public)
- Returns all achievement holders
- Query params:
  - `campus` — filter by campus name (e.g., "Khouribga")
  - `promo` — filter by promo year (e.g., "2024")
  - `limit` — max results (default: 100)
- No authentication required

### `GET /api/sync` (Cron Protected)
- Triggered by Vercel Cron or manual refresh button
- Protected by `CRON_SECRET` header
- Flow:
  1. Get 42 API access token via client_credentials grant
  2. Fetch users from configured endpoint
  3. Upsert into PostgreSQL via Prisma
  4. Return sync status

### 42 API Client Credentials Flow
```
POST https://api.intra.42.fr/oauth/token
Body: grant_type=client_credentials&client_id=UID&client_secret=SECRET
```

### Sync Mode (Configurable)
- `SYNC_MODE=achievement` — uses `/v2/achievements/{ACHIEVEMENT_ID}/users`
- `SYNC_MODE=campus` — queries users with campus_users for IDs 16, 21, 43 who have secondary campus records

## Environment Variables

```
DATABASE_URL=...          # Supabase PostgreSQL connection string
FORTY_TWO_CLIENT_ID=...   # 42 API application UID
FORTY_TWO_CLIENT_SECRET=... # 42 API application SECRET
CRON_SECRET=...           # Vercel Cron authentication
SYNC_MODE=achievement     # or "campus"
ACHIEVEMENT_ID=...        # Required if SYNC_MODE=achievement
```

## UI Design

### Landing Page
- Simple redirect to `/dashboard`

### Dashboard (Main Page)
- **Header:**
  - Title: "Achievement Holders"
  - Subtitle: "Moroccan students who've traveled to 42 Paris this year"

- **Filter Controls:**
  - Campus dropdown: `All | Tétouan | Khouribga | Ben Guerir`
  - Promo dropdown: `All | 2021 | 2022 | 2023 | 2024 | ...` (dynamic)
  - Show count: `25 | 50 | 100`
  - Refresh button: triggers `/api/sync` with loading state
  - Counter text: "X student(s) at Campus"

- **Student Grid:**
  - Responsive grid: 1 → 2 → 3 columns
  - Compact glassmorphic cards
  - Left: Circular avatar (42 profile image)
  - Right: Full name (bold white) + `@login` (muted gray)

### Theme
- Dark space theme with moving stars (tsparticles)
- Glassmorphism cards: `bg-black/20 backdrop-blur-md border border-white/10`
- Space Grotesk font
- Neon cyan/purple accents

## File Changes

### Files to DELETE
- `src/lib/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/components/LoginButton.tsx`
- `src/components/Navbar.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/api/users/route.ts`
- `src/types/index.ts` (old types)
- `src/components/Providers.tsx`

### Files to CREATE
- `src/lib/sync.ts` — 42 API client credentials + sync logic
- `src/app/api/sync/route.ts` — cron endpoint
- `src/app/api/holders/route.ts` — public holders endpoint
- `src/types/index.ts` — new types
- `vercel.json` — cron configuration

### Files to MODIFY
- `prisma/schema.prisma` — new AchievementHolder model
- `src/app/page.tsx` — redirect to `/dashboard`
- `src/app/layout.tsx` — remove SessionProvider
- `src/app/dashboard/page.tsx` — complete redesign
- `src/components/FilterBar.tsx` — campus/promo/count filters
- `src/components/StudentCard.tsx` — compact avatar + name
- `src/lib/campus.ts` — update for campus IDs (16, 21, 43)
- `.env.example` — new env vars
- `package.json` — remove next-auth, @auth/prisma-adapter

## Deployment

### Vercel
- `vercel.json` with cron: `"crons": [{ "path": "/api/sync", "schedule": "0 */6 * * *" }]`
- Cron runs every 6 hours
- Protected by `CRON_SECRET` header

### Supabase
- PostgreSQL database
- Prisma connects via `DATABASE_URL` (Supabase connection string)

## Campus Configuration

| Campus | ID | Name |
|--------|-----|------|
| Khouribga | 16 | 1337 Khouribga |
| Ben Guerir | 21 | 1337 Ben Guerir |
| Tétouan/MED | 43 | 1337 Tétouan |
