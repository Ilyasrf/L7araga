# 1337 Transfer Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js dashboard tracking Moroccan 42 students transferring to global 42 campuses, with 42 OAuth, PostgreSQL, and a glassmorphism space-themed UI.

**Architecture:** Next.js 14 App Router with Prisma ORM for PostgreSQL, NextAuth.js for 42 OAuth, tsparticles for background animation, Framer Motion for UI transitions, Tailwind CSS with custom glassmorphism utilities.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, tsparticles, Prisma, NextAuth.js, PostgreSQL

## Global Constraints

- Next.js 14+ with App Router (not Pages Router)
- TypeScript strict mode
- Tailwind CSS for all styling (no CSS modules, no inline styles)
- Prisma ORM with PostgreSQL
- NextAuth.js for 42 API OAuth 2.0
- tsparticles for stars background animation
- Framer Motion for page/component animations
- Space Grotesk font from Google Fonts
- All components use glassmorphism: `bg-black/20 backdrop-blur-md border border-white/10`
- Campus detection: auto-detect Khouribga, Ben Guerir, or MED from 42 API `campus_users`
- Slack handle sourced from 42 API `slack_login` field

---

## File Map

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Database schema (User model, TransferStatus enum) |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | NextAuth config with 42 provider |
| `src/lib/campus.ts` | Campus detection, flag mapping, campus list |
| `src/types/index.ts` | TypeScript type definitions |
| `src/app/globals.css` | Tailwind directives + glassmorphism utilities |
| `src/app/layout.tsx` | Root layout (fonts, SessionProvider) |
| `src/app/page.tsx` | Landing page |
| `src/app/onboarding/page.tsx` | First-login target campus selection |
| `src/app/dashboard/page.tsx` | Dashboard with student grid |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `src/app/api/users/route.ts` | GET all users, PATCH own profile |
| `src/components/StarsBackground.tsx` | tsparticles galaxy animation |
| `src/components/LoginButton.tsx` | 42 OAuth login button |
| `src/components/Navbar.tsx` | Glassmorphic navigation bar |
| `src/components/StudentCard.tsx` | Student profile card |
| `src/components/FilterBar.tsx` | Target campus filter dropdown |
| `tailwind.config.ts` | Tailwind config with custom theme |
| `next.config.js` | Next.js config |
| `.env.example` | Environment variable template |

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `.env.example`, `tailwind.config.ts`, `postcss.config.js`

**Interfaces:**
- Produces: Runnable Next.js project with Tailwind CSS configured

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Select defaults when prompted. This creates the base project structure.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @prisma/client next-auth @auth/prisma-adapter tsparticles @tsparticles/react @tsparticles/slim framer-motion
npm install -D prisma
```

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/1337_transfer_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
FORTY_TWO_CLIENT_ID="your-42-client-id"
FORTY_TWO_CLIENT_SECRET="your-42-client-secret"
EOF
```

- [ ] **Step 4: Create `.env` from example**

```bash
cp .env.example .env
```

- [ ] **Step 5: Update `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.intra.42.fr",
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with dependencies"
```

---

### Task 2: Tailwind Config & Glassmorphism Theme

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Tailwind theme with Space Grotesk font, custom colors, glassmorphism utilities

- [ ] **Step 1: Write `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        neon: {
          cyan: "#06b6d4",
          purple: "#a855f7",
          green: "#22c55e",
          amber: "#f59e0b",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Write `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap");

@layer base {
  body {
    @apply bg-black text-white font-sans antialiased;
  }
}

@layer components {
  .glass {
    @apply bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl;
  }

  .glass-hover {
    @apply glass transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-neon-cyan/10;
  }

  .glass-card {
    @apply glass p-6 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-neon-cyan/10;
  }

  .glass-input {
    @apply bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all;
  }

  .glass-button {
    @apply bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/30 hover:scale-105 active:scale-95;
  }

  .neon-text {
    @apply text-neon-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.5)];
  }

  .status-badge {
    @apply px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider;
  }

  .status-seeking-swap {
    @apply status-badge bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 animate-glow-pulse;
  }

  .status-host-needed {
    @apply status-badge bg-neon-amber/20 text-neon-amber border border-neon-amber/30;
  }

  .status-visa-process {
    @apply status-badge bg-neon-purple/20 text-neon-purple border border-neon-purple/30;
  }

  .status-approved {
    @apply status-badge bg-neon-green/20 text-neon-green border border-neon-green/30;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add glassmorphism theme and Tailwind config"
```

---

### Task 3: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Interfaces:**
- Produces: Prisma client singleton, User model, TransferStatus enum

- [ ] **Step 1: Write `prisma/schema.prisma`**

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

- [ ] **Step 2: Write `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma Client generated successfully.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts
git commit -m "feat: add Prisma schema and client singleton"
```

---

### Task 4: Campus Utilities

**Files:**
- Create: `src/lib/campus.ts`

**Interfaces:**
- Produces: `detectOriginCampus(campusUsers)`, `getCampusFlag(campusName)`, `CAMPUSES` list, `CAMPUS_FLAGS` map

- [ ] **Step 1: Write `src/lib/campus.ts`**

```typescript
export const MOROCCAN_CAMPUSES = ["Khouribga", "Ben Guerir", "Med"] as const;

export type MoroccanCampus = (typeof MOROCCAN_CAMPUSES)[number];

export const CAMPUS_FLAGS: Record<string, string> = {
  Paris: "🇫🇷",
  London: "🇬🇧",
  "Abu Dhabi": "🇦🇪",
  Lisbon: "🇵🇹",
  Berlin: "🇩🇪",
  Barcelona: "🇪🇸",
  Amsterdam: "🇳🇱",
  Helsinki: "🇫🇮",
  Tokyo: "🇯🇵",
  Seoul: "🇰🇷",
  "San Francisco": "🇺🇸",
  "New York": "🇺🇸",
  Toronto: "🇨🇦",
  Montreal: "🇨🇦",
  "São Paulo": "🇧🇷",
  Mumbai: "🇮🇳",
  Singapore: "🇸🇬",
  Shanghai: "🇨🇳",
  Beijing: "🇨🇳",
  Jerusalem: "🇮🇱",
  Cairo: "🇪🇬",
  Amman: "🇯🇴",
  Casablanca: "🇲🇦",
  Lausanne: "🇨🇭",
  Milan: "🇮🇹",
  Warsaw: "🇵🇱",
  Prague: "🇨🇿",
  Lyon: "🇫🇷",
  Brussels: "🇧🇪",
  Madrid: "🇪🇸",
  Cologne: "🇩🇪",
  Munich: "🇩🇪",
  Vienna: "🇦🇹",
  Oslo: "🇳🇴",
  Stockholm: "🇸🇪",
  Copenhagen: "🇩🇰",
  Dublin: "🇮🇪",
  Bucharest: "🇷🇴",
  Budapest: "🇭🇺",
  Ljubljana: "🇸🇮",
  Malaga: "🇪🇸",
};

export const CAMPUSES = Object.keys(CAMPUS_FLAGS).sort();

export function detectOriginCampus(
  campusUsers: Array<{ campus?: { name?: string } }>
): MoroccanCampus | "Unknown" {
  const campusNames = campusUsers
    .map((cu) => cu.campus?.name)
    .filter(Boolean);

  for (const name of campusNames) {
    if (name === "Khouribga") return "Khouribga";
    if (name === "Ben Guerir") return "Ben Guerir";
    if (name === "Med") return "MED";
  }

  return "Unknown";
}

export function getCampusFlag(campusName: string): string {
  return CAMPUS_FLAGS[campusName] || "🌍";
}

export function getOriginCampusColor(campus: string): string {
  switch (campus) {
    case "Khouribga":
      return "text-neon-cyan";
    case "Ben Guerir":
      return "text-neon-purple";
    case "MED":
      return "text-neon-green";
    default:
      return "text-white/60";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/campus.ts
git commit -m "feat: add campus detection, flag mapping, and utilities"
```

---

### Task 5: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `UserType`, `TransferStatusType`, `SessionUser` types

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export type TransferStatusType =
  | "SEEKING_SWAP"
  | "HOST_NEEDED"
  | "VISA_PROCESS"
  | "APPROVED";

export interface UserType {
  id: string;
  intraId: number;
  login: string;
  email?: string | null;
  image?: string | null;
  slackLogin?: string | null;
  originCampus: string;
  targetCampus: string;
  transferStatus: TransferStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  intraId: number;
  login: string;
  email?: string | null;
  image?: string | null;
  originCampus: string;
  targetCampus: string;
  transferStatus: TransferStatusType;
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatusType, string> = {
  SEEKING_SWAP: "Seeking Swap",
  HOST_NEEDED: "Host Needed",
  VISA_PROCESS: "Visa Process",
  APPROVED: "Approved",
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 6: NextAuth Configuration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

**Interfaces:**
- Consumes: `detectOriginCampus` from `src/lib/campus.ts`, Prisma client
- Produces: NextAuth handler, auth options

- [ ] **Step 1: Write `src/lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { detectOriginCampus } from "./campus";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    {
      id: "forty-two",
      name: "42 Intra",
      type: "oauth",
      authorization: {
        params: {
          scope: "public",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/forty-two`,
        },
      },
      token: "https://api.intra.42.fr/oauth/token",
      userinfo: "https://api.intra.42.fr/v2/me",
      clientId: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      checks: "state",
      profile(profile: any) {
        const originCampus = detectOriginCampus(profile.campus_users || []);

        return {
          id: profile.id.toString(),
          intraId: profile.id,
          login: profile.login,
          email: profile.email,
          image: profile.image?.link || null,
          slackLogin: profile.slack_login || null,
          originCampus,
          targetCampus: "",
          transferStatus: "SEEKING_SWAP",
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.intraId = (user as any).intraId;
        token.originCampus = (user as any).originCampus;
        token.targetCampus = (user as any).targetCampus;
        token.transferStatus = (user as any).transferStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).intraId = token.intraId;
        (session.user as any).originCampus = token.originCampus;
        (session.user as any).targetCampus = token.targetCampus;
        (session.user as any).transferStatus = token.transferStatus;
      }
      return session;
    },
    async signIn({ user }) {
      const intraId = (user as any).intraId;
      if (!intraId) return false;

      const existingUser = await prisma.user.findUnique({
        where: { intraId },
      });

      if (existingUser) {
        return true;
      }

      await prisma.user.create({
        data: {
          intraId,
          login: user.login || (user as any).name || "unknown",
          email: user.email,
          image: user.image,
          slackLogin: (user as any).slackLogin || null,
          originCampus: (user as any).originCampus || "Unknown",
          targetCampus: (user as any).targetCampus || "",
          transferStatus: "SEEKING_SWAP",
        },
      });

      return true;
    },
  },
};
```

- [ ] **Step 2: Write `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/\[...nextauth\]/route.ts
git commit -m "feat: add NextAuth with 42 OAuth provider"
```

---

### Task 7: StarsBackground Component

**Files:**
- Create: `src/components/StarsBackground.tsx`

**Interfaces:**
- Consumes: `@tsparticles/react`, `@tsparticles/slim`
- Produces: Full-screen animated stars background

- [ ] **Step 1: Write `src/components/StarsBackground.tsx`**

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/slim";

export default function StarsBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      fpsLimit: 60,
      particles: {
        number: {
          value: 1500,
          density: {
            enable: true,
          },
        },
        color: {
          value: ["#ffffff", "#06b6d4", "#a855f7"],
        },
        shape: {
          type: "star",
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
          },
        },
        size: {
          value: { min: 0.5, max: 2 },
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none" as const,
          outModes: {
            default: "out" as const,
          },
        },
        twinkle: {
          enable: true,
          density: 5,
          speed: {
            min: 0.5,
            max: 1,
          },
        },
      },
      detectRetina: true,
      background: {
        color: "transparent",
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 -z-10">
      <Particles id="tsparticles" options={options} className="w-full h-full" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StarsBackground.tsx
git commit -m "feat: add tsparticles stars background component"
```

---

### Task 8: LoginButton Component

**Files:**
- Create: `src/components/LoginButton.tsx`

**Interfaces:**
- Consumes: `next-auth/react` `signIn`
- Produces: Glassmorphic login button

- [ ] **Step 1: Write `src/components/LoginButton.tsx`**

```typescript
"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("forty-two", { callbackUrl: "/dashboard" })}
      className="glass-button w-full flex items-center justify-center gap-3"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
        <path d="M8 8l4 4-4 4M12 8l4 4-4 4" />
      </svg>
      Login with 42 Intra
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LoginButton.tsx
git commit -m "feat: add 42 OAuth login button component"
```

---

### Task 9: Landing Page

**Files:**
- Create: `src/app/page.tsx`

**Interfaces:**
- Consumes: `StarsBackground`, `LoginButton`
- Produces: Full-screen landing page with stars and login

- [ ] **Step 1: Write `src/app/page.tsx`**

```typescript
import StarsBackground from "@/components/StarsBackground";
import LoginButton from "@/components/LoginButton";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarsBackground />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="neon-text">Track Your Journey</span>
          <br />
          <span className="text-white/90">Beyond 1337</span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-lg mx-auto">
          Connect with Moroccan students in the transfer process to 42 campuses
          worldwide.
        </p>

        <div className="glass p-8 max-w-md mx-auto">
          <LoginButton />
          <p className="text-xs text-white/30 mt-4">
            Secured via 42 Intra authentication
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with stars background and login"
```

---

### Task 10: Root Layout & Session Provider

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Providers.tsx`

**Interfaces:**
- Consumes: NextAuth SessionProvider
- Produces: Root layout with fonts and session wrapper

- [ ] **Step 1: Write `src/components/Providers.tsx`**

```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Write `src/app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "1337 Transfer Tracker",
  description:
    "Track Moroccan 42 students transferring to global 42 campuses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/components/Providers.tsx
git commit -m "feat: add root layout with Space Grotesk font and SessionProvider"
```

---

### Task 11: Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`

**Interfaces:**
- Consumes: `next-auth/react` `useSession`, `signOut`
- Produces: Glassmorphic navigation bar with user info

- [ ] **Step 1: Write `src/components/Navbar.tsx`**

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold neon-text">1337</span>
            <span className="text-sm text-white/60">Transfer Tracker</span>
          </div>

          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-white/20"
                  />
                )}
                <span className="text-sm text-white/80">
                  {(session.user as any).login || session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add glassmorphic navbar with user info"
```

---

### Task 12: Onboarding Page

**Files:**
- Create: `src/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: `useSession`, `CAMPUSES` from `src/lib/campus.ts`, `TRANSFER_STATUS_LABELS`
- Produces: Onboarding form for target campus and transfer status selection

- [ ] **Step 1: Write `src/app/onboarding/page.tsx`**

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CAMPUSES, getCampusFlag } from "@/lib/campus";
import { TRANSFER_STATUS_LABELS } from "@/types";
import type { TransferStatusType } from "@/types";
import StarsBackground from "@/components/StarsBackground";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [targetCampus, setTargetCampus] = useState("");
  const [transferStatus, setTransferStatus] =
    useState<TransferStatusType>("SEEKING_SWAP");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (
      status === "authenticated" &&
      (session?.user as any)?.targetCampus
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCampus) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCampus, transferStatus }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <StarsBackground />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="glass p-8">
          <h1 className="text-2xl font-bold mb-2 neon-text">
            Complete Your Profile
          </h1>
          <p className="text-white/60 mb-8">
            Select your target campus and current transfer status.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-white/80 mb-2">
                Target Campus
              </label>
              <select
                value={targetCampus}
                onChange={(e) => setTargetCampus(e.target.value)}
                className="glass-input w-full"
                required
              >
                <option value="" className="bg-black">
                  Select a campus...
                </option>
                {CAMPUSES.map((campus) => (
                  <option key={campus} value={campus} className="bg-black">
                    {getCampusFlag(campus)} {campus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-2">
                Transfer Status
              </label>
              <select
                value={transferStatus}
                onChange={(e) =>
                  setTransferStatus(e.target.value as TransferStatusType)
                }
                className="glass-input w-full"
              >
                {Object.entries(TRANSFER_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-black">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !targetCampus}
              className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: add onboarding page for target campus selection"
```

---

### Task 13: API Routes (Users)

**Files:**
- Create: `src/app/api/users/route.ts`

**Interfaces:**
- Consumes: `getServerSession`, Prisma client
- Produces: GET `/api/users` (all users), PATCH `/api/users` (update own profile)

- [ ] **Step 1: Write `src/app/api/users/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      targetCampus: { not: "" },
    },
    select: {
      id: true,
      intraId: true,
      login: true,
      image: true,
      slackLogin: true,
      originCampus: true,
      targetCampus: true,
      transferStatus: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { targetCampus, transferStatus } = body;

  const intraId = (session.user as any).intraId;

  const updated = await prisma.user.update({
    where: { intraId },
    data: {
      ...(targetCampus !== undefined && { targetCampus }),
      ...(transferStatus !== undefined && { transferStatus }),
    },
    select: {
      id: true,
      intraId: true,
      login: true,
      image: true,
      slackLogin: true,
      originCampus: true,
      targetCampus: true,
      transferStatus: true,
    },
  });

  return NextResponse.json(updated);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/users/route.ts
git commit -m "feat: add users API routes (GET all, PATCH own profile)"
```

---

### Task 14: StudentCard Component

**Files:**
- Create: `src/components/StudentCard.tsx`

**Interfaces:**
- Consumes: `UserType`, `getCampusFlag`, `getOriginCampusColor`, `TRANSFER_STATUS_LABELS`
- Produces: Glassmorphic student profile card with contact reveal

- [ ] **Step 1: Write `src/components/StudentCard.tsx`**

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import { getCampusFlag, getOriginCampusColor } from "@/lib/campus";
import { TRANSFER_STATUS_LABELS } from "@/types";
import type { UserType, TransferStatusType } from "@/types";

function getStatusClasses(status: TransferStatusType): string {
  switch (status) {
    case "SEEKING_SWAP":
      return "status-seeking-swap";
    case "HOST_NEEDED":
      return "status-host-needed";
    case "VISA_PROCESS":
      return "status-visa-process";
    case "APPROVED":
      return "status-approved";
    default:
      return "";
  }
}

interface StudentCardProps {
  user: UserType;
}

export default function StudentCard({ user }: StudentCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="glass-card group">
      <div className="flex items-start gap-4 mb-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.login}
            width={56}
            height={56}
            className="rounded-full border-2 border-white/10 group-hover:border-neon-cyan/30 transition-colors"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/60">
            {user.login[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{user.login}</h3>
          <p
            className={`text-sm ${getOriginCampusColor(user.originCampus)}`}
          >
            {user.originCampus}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCampusFlag(user.targetCampus)}</span>
          <span className="text-sm text-white/70">{user.targetCampus}</span>
        </div>
        <span className={getStatusClasses(user.transferStatus)}>
          {TRANSFER_STATUS_LABELS[user.transferStatus]}
        </span>
      </div>

      <div className="border-t border-white/5 pt-3">
        {!showContact ? (
          <button
            onClick={() => setShowContact(true)}
            className="text-xs text-white/40 hover:text-neon-cyan transition-colors"
          >
            Reveal Contact
          </button>
        ) : (
          <div className="text-xs">
            <span className="text-white/40">Slack: </span>
            <span className="text-neon-cyan font-mono">
              {user.slackLogin || "Not available"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StudentCard.tsx
git commit -m "feat: add student card component with contact reveal"
```

---

### Task 15: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.tsx`

**Interfaces:**
- Consumes: `CAMPUSES`, `getCampusFlag`
- Produces: Filter dropdown for target campus

- [ ] **Step 1: Write `src/components/FilterBar.tsx`**

```typescript
"use client";

import { CAMPUSES, getCampusFlag } from "@/lib/campus";

interface FilterBarProps {
  selectedCampus: string;
  onCampusChange: (campus: string) => void;
}

export default function FilterBar({
  selectedCampus,
  onCampusChange,
}: FilterBarProps) {
  return (
    <div className="glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <label className="text-sm text-white/60 whitespace-nowrap">
        Filter by Target Campus:
      </label>
      <select
        value={selectedCampus}
        onChange={(e) => onCampusChange(e.target.value)}
        className="glass-input w-full sm:w-auto"
      >
        <option value="" className="bg-black">
          All Campuses
        </option>
        {CAMPUSES.map((campus) => (
          <option key={campus} value={campus} className="bg-black">
            {getCampusFlag(campus)} {campus}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat: add filter bar component for target campus"
```

---

### Task 16: Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `useSession`, `Navbar`, `FilterBar`, `StudentCard`, `StarsBackground`, `UserType`
- Produces: Protected dashboard with student grid and filtering

- [ ] **Step 1: Write `src/app/dashboard/page.tsx`**

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import StarsBackground from "@/components/StarsBackground";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import StudentCard from "@/components/StudentCard";
import type { UserType } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filterCampus, setFilterCampus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (
      status === "authenticated" &&
      !(session?.user as any)?.targetCampus
    ) {
      router.push("/onboarding");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, [status]);

  const filteredUsers = filterCampus
    ? users.filter((u) => u.targetCampus === filterCampus)
    : users;

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen">
        <StarsBackground />
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-white/60">Loading students...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <StarsBackground />
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="neon-text">Transfer</span> Dashboard
          </h1>
          <p className="text-white/60">
            {filteredUsers.length} student
            {filteredUsers.length !== 1 ? "s" : ""} tracking their journey
          </p>
        </div>

        <div className="mb-6">
          <FilterBar
            selectedCampus={filterCampus}
            onCampusChange={setFilterCampus}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-white/60 text-lg">
              No students found matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <StudentCard key={user.id} user={user} />
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
git commit -m "feat: add dashboard page with student grid and filtering"
```

---

## Self-Review

**1. Spec coverage:**
- Landing page with stars + login ✅ (Task 9)
- 42 OAuth with campus auto-detection ✅ (Task 6)
- Onboarding for target campus + status ✅ (Task 12)
- Dashboard with student cards + filtering ✅ (Task 16)
- Prisma schema ✅ (Task 3)
- Glassmorphism theme ✅ (Task 2)
- tsparticles background ✅ (Task 7)
- Contact reveal ✅ (Task 14)
- API routes ✅ (Task 13)
- Country flags ✅ (Task 4)
- Navbar ✅ (Task 11)

**2. Placeholder scan:** No TBDs, TODOs, or vague steps found.

**3. Type consistency:** `UserType`, `TransferStatusType`, `SessionUser` types are consistent across all tasks. Function signatures match between producers and consumers.

All clear — plan is complete.
