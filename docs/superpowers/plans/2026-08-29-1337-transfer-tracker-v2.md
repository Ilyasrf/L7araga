# 1337 Transfer Tracker v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the 1337 Transfer Tracker from a user-OAuth dashboard to a public achievement holders dashboard with automated 42 API sync via Client Credentials flow.

**Architecture:** Remove NextAuth entirely. Add 42 API Client Credentials sync endpoint. Redesign dashboard for public viewing with campus/promo filters. Deploy on Vercel + Supabase.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, tsparticles, Prisma, Supabase PostgreSQL, Vercel Cron

## Global Constraints

- Next.js 14+ with App Router
- TypeScript strict mode
- Tailwind CSS for all styling
- Prisma ORM with Supabase PostgreSQL
- 42 API Client Credentials Flow for data sync
- tsparticles for stars background animation
- Framer Motion for page animations
- Space Grotesk font from Google Fonts
- Glassmorphism: `bg-black/20 backdrop-blur-md border border-white/10`
- No user authentication required — dashboard is public
- Vercel Cron for scheduled sync (every 6 hours)
- Supabase for database hosting only

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `prisma/schema.prisma` | Modify | Replace User model with AchievementHolder |
| `src/lib/sync.ts` | Create | 42 API client credentials + sync logic |
| `src/lib/campus.ts` | Modify | Update campus IDs (16, 21, 43) |
| `src/app/api/holders/route.ts` | Create | Public GET endpoint for holders |
| `src/app/api/sync/route.ts` | Create | Cron-protected sync endpoint |
| `src/types/index.ts` | Replace | New types for AchievementHolder |
| `src/app/page.tsx` | Modify | Redirect to /dashboard |
| `src/app/layout.tsx` | Modify | Remove SessionProvider |
| `src/app/dashboard/page.tsx` | Modify | Complete redesign |
| `src/components/FilterBar.tsx` | Modify | Campus/promo/count filters |
| `src/components/StudentCard.tsx` | Modify | Compact avatar + name |
| `vercel.json` | Create | Cron configuration |
| `.env.example` | Modify | New env vars |
| `package.json` | Modify | Remove next-auth deps |
| `src/lib/auth.ts` | Delete | No more NextAuth |
| `src/app/api/auth/[...nextauth]/route.ts` | Delete | No more NextAuth |
| `src/components/LoginButton.tsx` | Delete | No login needed |
| `src/components/Navbar.tsx` | Delete | No user session |
| `src/app/onboarding/page.tsx` | Delete | No onboarding |
| `src/app/api/users/route.ts` | Delete | Replaced by holders |
| `src/components/Providers.tsx` | Delete | No SessionProvider |

---

### Task 1: Remove Old Auth Files & Dependencies

**Files:**
- Delete: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/components/LoginButton.tsx`, `src/components/Navbar.tsx`, `src/app/onboarding/page.tsx`, `src/app/api/users/route.ts`, `src/components/Providers.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: Clean project without NextAuth dependencies

- [ ] **Step 1: Delete old auth files**

```bash
rm -f src/lib/auth.ts
rm -f src/app/api/auth/\[...nextauth\]/route.ts
rm -f src/components/LoginButton.tsx
rm -f src/components/Navbar.tsx
rm -f src/app/onboarding/page.tsx
rm -f src/app/api/users/route.ts
rm -f src/components/Providers.tsx
rm -rf src/app/api/auth
```

- [ ] **Step 2: Remove NextAuth dependencies from package.json**

Remove these lines from `package.json` dependencies:
```json
"@auth/prisma-adapter": "^2.11.3",
"next-auth": "^4.24.15",
```

- [ ] **Step 3: Install updated dependencies**

```bash
npm install
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build should fail due to missing imports in layout.tsx and other files. This is expected — we'll fix those in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove NextAuth and old auth files"
```

---

### Task 2: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: AchievementHolder model, no more User model or TransferStatus enum

- [ ] **Step 1: Replace prisma/schema.prisma**

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

- [ ] **Step 2: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "refactor: replace User model with AchievementHolder"
```

---

### Task 3: Update Campus Utilities

**Files:**
- Modify: `src/lib/campus.ts`

**Interfaces:**
- Produces: `MOROCCAN_CAMPUSES` with IDs, `CAMPUS_MAP`, `detectCampusId`

- [ ] **Step 1: Replace src/lib/campus.ts**

```typescript
export interface CampusInfo {
  id: number;
  name: string;
  displayName: string;
}

export const MOROCCAN_CAMPUSES: CampusInfo[] = [
  { id: 43, name: "Med", displayName: "Tétouan" },
  { id: 16, name: "Khouribga", displayName: "Khouribga" },
  { id: 21, name: "Ben Guerir", displayName: "Ben Guerir" },
];

export const CAMPUS_MAP: Record<number, CampusInfo> = Object.fromEntries(
  MOROCCAN_CAMPUSES.map((c) => [c.id, c])
);

export const CAMPUS_NAMES = MOROCCAN_CAMPUSES.map((c) => c.displayName);

export function detectCampusId(campusName: string): number | null {
  const campus = MOROCCAN_CAMPUSES.find(
    (c) => c.name === campusName || c.displayName === campusName
  );
  return campus?.id ?? null;
}

export function getCampusDisplayName(campusName: string): string {
  const campus = MOROCCAN_CAMPUSES.find(
    (c) => c.name === campusName || c.displayName === campusName
  );
  return campus?.displayName ?? campusName;
}

export function getCampusFlag(campusName: string): string {
  const flags: Record<string, string> = {
    Khouribga: "🇲🇦",
    "Ben Guerir": "🇲🇦",
    Tétouan: "🇲🇦",
    Med: "🇲🇦",
  };
  return flags[campusName] || "🌍";
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/campus.ts
git commit -m "refactor: update campus utilities with IDs"
```

---

### Task 4: Create TypeScript Types

**Files:**
- Replace: `src/types/index.ts`

**Interfaces:**
- Produces: `AchievementHolderType`, `HolderFilters`

- [ ] **Step 1: Replace src/types/index.ts**

```typescript
export interface AchievementHolderType {
  id: string;
  intraId: number;
  login: string;
  displayName: string | null;
  imageUrl: string | null;
  campusName: string;
  campusId: number;
  promo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HolderFilters {
  campus?: string;
  promo?: string;
  limit?: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  timestamp: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor: add new TypeScript types for AchievementHolder"
```

---

### Task 5: Create 42 API Sync Library

**Files:**
- Create: `src/lib/sync.ts`

**Interfaces:**
- Produces: `getAccessToken()`, `fetchHolders()`, `syncHolders()`

- [ ] **Step 1: Create src/lib/sync.ts**

```typescript
import prisma from "./prisma";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface Holder42 {
  id: number;
  login: string;
  displayname: string;
  image?: { link?: string };
  campus_users?: Array<{
    campus?: { id?: number; name?: string };
    is_primary?: boolean;
  }>;
  pools?: Array<{
    pool_month?: string;
    pool_year?: number;
  }>;
}

let cachedToken: { token: string; expires: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.FORTY_TWO_CLIENT_ID!,
      client_secret: process.env.FORTY_TWO_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

async function fetchPaginated<T>(url: string, token: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}page=${page}&per_page=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: T[] = await response.json();
    results.push(...data);

    const totalPages = parseInt(response.headers.get("x-total") || "1");
    hasMore = page < totalPages;
    page++;
  }

  return results;
}

export async function fetchHolders(): Promise<Holder42[]> {
  const token = await getAccessToken();
  const syncMode = process.env.SYNC_MODE || "campus";

  if (syncMode === "achievement") {
    const achievementId = process.env.ACHIEVEMENT_ID;
    if (!achievementId) {
      throw new Error("ACHIEVEMENT_ID required when SYNC_MODE=achievement");
    }
    return fetchPaginated<Holder42>(
      `https://api.intra.42.fr/v2/achievements/${achievementId}/users`,
      token
    );
  }

  // Campus-based: fetch users from Moroccan campuses with secondary campus
  const holders: Holder42[] = [];
  const campusIds = [16, 21, 43];

  for (const campusId of campusIds) {
    const campusUsers = await fetchPaginated<Holder42>(
      `https://api.intra.42.fr/v2/campus/${campusId}/users?filter[active]=true`,
      token
    );

    for (const user of campusUsers) {
      const hasSecondaryCampus = user.campus_users?.some(
        (cu) => cu.campus?.id !== campusId
      );
      if (hasSecondaryCampus) {
        holders.push(user);
      }
    }
  }

  return holders;
}

function extractPromo(user: Holder42): string | null {
  if (user.pools && user.pools.length > 0) {
    const latestPool = user.pools[0];
    if (latestPool.pool_year) {
      return latestPool.pool_year.toString();
    }
  }
  return null;
}

function extractCampus(user: Holder42): { name: string; id: number } {
  const primary = user.campus_users?.find((cu) => cu.is_primary);
  if (primary?.campus) {
    return {
      name: primary.campus.name || "Unknown",
      id: primary.campus.id || 0,
    };
  }
  return { name: "Unknown", id: 0 };
}

export async function syncHolders(): Promise<{
  synced: number;
  errors: string[];
}> {
  const holders = await fetchHolders();
  const errors: string[] = [];
  let synced = 0;

  for (const holder of holders) {
    try {
      const campus = extractCampus(holder);
      const promo = extractPromo(holder);

      await prisma.achievementHolder.upsert({
        where: { intraId: holder.id },
        update: {
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName: campus.name,
          campusId: campus.id,
          promo,
        },
        create: {
          intraId: holder.id,
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName: campus.name,
          campusId: campus.id,
          promo,
        },
      });
      synced++;
    } catch (error) {
      errors.push(`Failed to sync ${holder.login}: ${error}`);
    }
  }

  return { synced, errors };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/sync.ts
git commit -m "feat: add 42 API client credentials sync library"
```

---

### Task 6: Create Holders API Route

**Files:**
- Create: `src/app/api/holders/route.ts`

**Interfaces:**
- Consumes: Prisma client
- Produces: `GET /api/holders` public endpoint

- [ ] **Step 1: Create src/app/api/holders/route.ts**

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get("campus");
  const promo = searchParams.get("promo");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};

  if (campus && campus !== "All") {
    where.campusName = campus;
  }

  if (promo && promo !== "All") {
    where.promo = promo;
  }

  const holders = await prisma.achievementHolder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(holders);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/holders/route.ts
git commit -m "feat: add public holders API endpoint"
```

---

### Task 7: Create Sync API Route

**Files:**
- Create: `src/app/api/sync/route.ts`

**Interfaces:**
- Consumes: `syncHolders` from `src/lib/sync.ts`
- Produces: `GET /api/sync` cron-protected endpoint

- [ ] **Step 1: Create src/app/api/sync/route.ts**

```typescript
import { NextResponse } from "next/server";
import { syncHolders } from "@/lib/sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncHolders();
    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/sync/route.ts
git commit -m "feat: add cron-protected sync endpoint"
```

---

### Task 8: Update Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Space Grotesk font
- Produces: Root layout without SessionProvider

- [ ] **Step 1: Replace src/app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "1337 Transfer Tracker",
  description:
    "Moroccan 42 students who've traveled to global 42 campuses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "refactor: remove SessionProvider from root layout"
```

---

### Task 9: Update Landing Page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: Simple redirect to /dashboard

- [ ] **Step 1: Replace src/app/page.tsx**

```typescript
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: redirect landing page to dashboard"
```

---

### Task 10: Create New StudentCard Component

**Files:**
- Replace: `src/components/StudentCard.tsx`

**Interfaces:**
- Consumes: `AchievementHolderType`
- Produces: Compact card with avatar + name + login

- [ ] **Step 1: Replace src/components/StudentCard.tsx**

```typescript
"use client";

import Image from "next/image";
import type { AchievementHolderType } from "@/types";

interface StudentCardProps {
  holder: AchievementHolderType;
}

export default function StudentCard({ holder }: StudentCardProps) {
  return (
    <div className="glass-card flex items-center gap-4">
      {holder.imageUrl ? (
        <Image
          src={holder.imageUrl}
          alt={holder.login}
          width={48}
          height={48}
          className="rounded-full border-2 border-white/10"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white/60">
          {(holder.displayName || holder.login)[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">
          {holder.displayName || holder.login}
        </h3>
        <p className="text-sm text-neon-cyan truncate">@{holder.login}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StudentCard.tsx
git commit -m "refactor: redesign student card to compact layout"
```

---

### Task 11: Create New FilterBar Component

**Files:**
- Replace: `src/components/FilterBar.tsx`

**Interfaces:**
- Consumes: campus list, promo list
- Produces: Filter controls with campus, promo, count, refresh

- [ ] **Step 1: Replace src/components/FilterBar.tsx**

```typescript
"use client";

import { MOROCCAN_CAMPUSES } from "@/lib/campus";

interface FilterBarProps {
  selectedCampus: string;
  selectedPromo: string;
  selectedLimit: number;
  onCampusChange: (campus: string) => void;
  onPromoChange: (promo: string) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  promos: string[];
  totalCount: number;
}

export default function FilterBar({
  selectedCampus,
  selectedPromo,
  selectedLimit,
  onCampusChange,
  onPromoChange,
  onLimitChange,
  onRefresh,
  isRefreshing,
  promos,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => onCampusChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="All" className="bg-black">All Campuses</option>
          {MOROCCAN_CAMPUSES.map((campus) => (
            <option key={campus.id} value={campus.displayName} className="bg-black">
              {campus.displayName}
            </option>
          ))}
        </select>

        <select
          value={selectedPromo}
          onChange={(e) => onPromoChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="All" className="bg-black">All Promos</option>
          {promos.map((promo) => (
            <option key={promo} value={promo} className="bg-black">
              {promo}
            </option>
          ))}
        </select>

        <select
          value={selectedLimit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="glass-input text-sm"
        >
          <option value={25} className="bg-black">Show 25</option>
          <option value={50} className="bg-black">Show 50</option>
          <option value={100} className="bg-black">Show 100</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="glass-button text-sm disabled:opacity-50"
        >
          {isRefreshing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      <p className="text-sm text-white/60 ml-auto">
        {totalCount} student{totalCount !== 1 ? "s" : ""}
        {selectedCampus !== "All" ? ` at ${selectedCampus}` : ""}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "refactor: redesign filter bar with campus/promo/count"
```

---

### Task 12: Redesign Dashboard Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `StudentCard`, `FilterBar`, `StarsBackground`, `AchievementHolderType`
- Produces: Public dashboard with filters and student grid

- [ ] **Step 1: Replace src/app/dashboard/page.tsx**

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StarsBackground from "@/components/StarsBackground";
import FilterBar from "@/components/FilterBar";
import StudentCard from "@/components/StudentCard";
import type { AchievementHolderType } from "@/types";

export default function DashboardPage() {
  const [holders, setHolders] = useState<AchievementHolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterCampus, setFilterCampus] = useState("All");
  const [filterPromo, setFilterPromo] = useState("All");
  const [filterLimit, setFilterLimit] = useState(50);

  const [promos, setPromos] = useState<string[]>([]);

  const fetchHolders = async () => {
    const params = new URLSearchParams();
    if (filterCampus !== "All") params.set("campus", filterCampus);
    if (filterPromo !== "All") params.set("promo", filterPromo);
    params.set("limit", filterLimit.toString());

    const res = await fetch(`/api/holders?${params.toString()}`);
    const data = await res.json();
    setHolders(data);
    setLoading(false);

    // Extract unique promos for filter
    const uniquePromos = [...new Set(data.map((h: AchievementHolderType) => h.promo).filter(Boolean))] as string[];
    setPromos(uniquePromos.sort().reverse());
  };

  useEffect(() => {
    fetchHolders();
  }, [filterCampus, filterPromo, filterLimit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/sync");
      await fetchHolders();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <StarsBackground />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-white/60">Loading students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <StarsBackground />

      <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="neon-text">Achievement</span> Holders
          </h1>
          <p className="text-white/60">
            Moroccan students who&apos;ve traveled to 42 Paris this year
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <FilterBar
            selectedCampus={filterCampus}
            selectedPromo={filterPromo}
            selectedLimit={filterLimit}
            onCampusChange={setFilterCampus}
            onPromoChange={setFilterPromo}
            onLimitChange={setFilterLimit}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            promos={promos}
            totalCount={holders.length}
          />
        </motion.div>

        {holders.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-white/60 text-lg">
              No students found matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holders.map((holder, index) => (
              <motion.div
                key={holder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
              >
                <StudentCard holder={holder} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "refactor: redesign dashboard as public achievement holders view"
```

---

### Task 13: Update Environment Variables

**Files:**
- Modify: `.env.example`

**Interfaces:**
- Produces: Updated env var template

- [ ] **Step 1: Replace .env.example**

```
DATABASE_URL="postgresql://user:password@localhost:5432/1337_transfer_tracker"
FORTY_TWO_CLIENT_ID="your-42-client-id"
FORTY_TWO_CLIENT_SECRET="your-42-client-secret"
CRON_SECRET="your-cron-secret"
SYNC_MODE="campus"
ACHIEVEMENT_ID=""
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "refactor: update environment variables for v2"
```

---

### Task 14: Create Vercel Configuration

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Produces: Cron job configuration

- [ ] **Step 1: Create vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel cron configuration for sync"
```

---

### Task 15: Final Build Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Clean build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build passes with no errors.

- [ ] **Step 2: Verify no lint errors**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore: final build verification and cleanup"
```

---

## Self-Review

**1. Spec coverage:**
- Public dashboard ✅ (Task 12)
- 42 API Client Credentials sync ✅ (Task 5)
- Cron job ✅ (Task 14)
- Supabase PostgreSQL ✅ (Task 2, schema)
- Campus/promo filters ✅ (Task 11)
- Compact student cards ✅ (Task 10)
- Remove NextAuth ✅ (Task 1)
- Remove login/onboarding ✅ (Tasks 1, 9)

**2. Placeholder scan:** No TBDs, TODOs, or vague steps found.

**3. Type consistency:** `AchievementHolderType` is consistent across all tasks. Function signatures match between producers and consumers.

All clear — plan is complete.
