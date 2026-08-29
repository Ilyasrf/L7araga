# 1337 Transfer Tracker — Design Spec

## Overview

A centralized dashboard tracking Moroccan 42 students (Khouribga, Ben Guerir, MED) transferring to other 42 campuses globally. Built with Next.js, PostgreSQL (Prisma), NextAuth.js (42 OAuth), and a deep-space glassmorphism UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion |
| Animation | tsparticles (stars/galaxy background) |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js + 42 API OAuth 2.0 |

## Project Structure

```
L7araga/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard (protected)
│   │   ├── onboarding/
│   │   │   └── page.tsx          # First-login setup
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── users/route.ts    # GET all users, PATCH own profile
│   │   └── globals.css
│   ├── components/
│   │   ├── StarsBackground.tsx
│   │   ├── Navbar.tsx
│   │   ├── StudentCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── LoginButton.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── campus.ts
│   └── types/
│       └── index.ts
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String          @id @default(cuid())
  intraId        Int             @unique
  login          String          @unique
  email          String?
  image          String?
  slackLogin     String?
  originCampus   String
  targetCampus   String          @default("")
  transferStatus TransferStatus  @default(SEEKING_SWAP)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([targetCampus])
  @@index([transferStatus])
}

enum TransferStatus {
  SEEKING_SWAP
  HOST_NEEDED
  VISA_PROCESS
  APPROVED
}
```

## Authentication Flow

1. User clicks "Login with 42 Intra" on landing page
2. NextAuth redirects to `https://api.intra.42.fr/oauth/authorize`
3. User authorizes → callback to `/api/auth/callback/42`
4. Profile callback fetches `/v2/me`, extracts `login`, `image`, `slack_login`, `campus_users`
5. Auto-detects Moroccan campus from `campus_users` array (matches "Khouribga", "Ben Guerir", or "Med")
6. Creates/updates User in PostgreSQL via PrismaAdapter
7. If `targetCampus` is empty → redirect to `/onboarding` to select target + status
8. Otherwise → redirect to `/dashboard`

## UI Design System

- **Theme:** Deep Space / Futuristic Dark Mode
- **Background:** Continuous drifting stars (tsparticles, 1500 stars, speed 0.3)
- **Components:** Glassmorphism — `bg-black/20`, `backdrop-blur-md`, `border-white/10`, glow on hover
- **Typography:** Space Grotesk (Google Fonts)
- **Accent colors:** Cyan (`#06b6d4`) for primary, Purple (`#a855f7`) for secondary
- **Status badges:** Glowing pill shapes with color per status:
  - SEEKING_SWAP → cyan
  - HOST_NEEDED → amber
  - VISA_PROCESS → purple
  - APPROVED → green

## Pages

### Landing Page (`/`)
- Full-screen StarsBackground
- Centered content: headline "Track Your Journey Beyond 1337", subtext, glassmorphic login card
- Framer Motion fade-in animations

### Onboarding (`/onboarding`) — Protected
- Form to select Target Campus (dropdown of 42 campuses) and Transfer Status
- Saves to User record, redirects to dashboard

### Dashboard (`/dashboard`) — Protected
- Navbar with user avatar + logout
- FilterBar: dropdown to filter by target campus
- Responsive grid of StudentCards
- Fetches `GET /api/users` on mount

### StudentCard Component
- Profile picture, intra login, origin campus badge
- Target campus with country flag emoji
- Transfer status glowing badge
- "Reveal Contact" button → shows Slack handle from 42 profile

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | Returns all users (for dashboard grid) |
| PATCH | `/api/users` | Updates current user's targetCampus/transferStatus |

## Country Flag Mapping

A utility in `src/lib/campus.ts` mapping 42 campus names to flag emojis:
- Paris → 🇫🇷, London → 🇬🇧, Abu Dhabi → 🇦🇪, Lisbon → 🇵🇹, Berlin → 🇩🇪, etc.

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
FORTY_TWO_CLIENT_ID=...
FORTY_TWO_CLIENT_SECRET=...
```
