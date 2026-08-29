# 1337 Transfer Tracker v2 — Hosting Guide

## Prerequisites

- [Node.js 18+](https://nodejs.org/) installed
- [GitHub account](https://github.com/)
- [Vercel account](https://vercel.com/) (free tier works)
- [Supabase account](https://supabase.com/) (free tier works)
- [42 API application](https://profile.intra.42.fr/oauth/applications) (registered with `client_credentials` grant type)

## Step 1: Set Up Supabase (PostgreSQL Database)

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Note your **Database URL** from Settings → Database → Connection string → URI
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Step 2: Set Up 42 API Application

1. Go to [42 API Applications](https://profile.intra.42.fr/oauth/applications)
2. Create a new application:
   - **Name:** `1337 Transfer Tracker`
   - **Redirect URI:** `http://localhost:3000` (not used but required)
   - **Scopes:** `public`
3. Note your **Client ID (UID)** and **Client Secret**
4. ⚠️ **Important:** The 42 API must allow `client_credentials` grant type for your application. If not available, you may need to contact 42 support or use a different approach.

## Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "feat: initial v2 release"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/L7araga.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `L7araga` repository
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. Add **Environment Variables** (click "Add" for each):

   | Name | Value | Notes |
   |------|-------|-------|
   | `DATABASE_URL` | `postgresql://...` | From Supabase Step 1 |
   | `FORTY_TWO_CLIENT_ID` | `your-client-id` | From 42 API Step 2 |
   | `FORTY_TWO_CLIENT_SECRET` | `your-client-secret` | From 42 API Step 2 |
   | `CRON_SECRET` | `generate-random-string` | Run: `openssl rand -base64 32` |
   | `SYNC_MODE` | `campus` | or `achievement` |
   | `ACHIEVEMENT_ID` | `""` | Only if SYNC_MODE=achievement |

6. Click **"Deploy"**

## Step 5: Initialize Database Schema

After first deploy, you need to push the Prisma schema to Supabase:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull env vars locally
vercel env pull .env.local

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Step 6: Configure Vercel Cron

The `vercel.json` file already configures a cron job that runs every 6 hours. Vercel automatically enables this after deployment.

To trigger a manual sync, visit:
```
https://your-project.vercel.app/api/sync
```

With the header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

## Step 7: Verify Deployment

1. Visit `https://your-project.vercel.app` — should redirect to `/dashboard`
2. Visit `https://your-project.vercel.app/dashboard` — should show the achievement holders grid
3. Visit `https://your-project.vercel.app/api/holders` — should return JSON data

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase) |
| `FORTY_TWO_CLIENT_ID` | ✅ | 42 API application UID |
| `FORTY_TWO_CLIENT_SECRET` | ✅ | 42 API application SECRET |
| `CRON_SECRET` | ✅ | Secret for Vercel Cron authentication |
| `SYNC_MODE` | ✅ | `campus` or `achievement` |
| `ACHIEVEMENT_ID` | ⚠️ | Required if SYNC_MODE=achievement |

## Troubleshooting

### Build fails with "Module not found"
- Run `npm install` locally and commit `package-lock.json`

### Sync returns "Unauthorized"
- Check that `CRON_SECRET` is set in Vercel environment variables
- Ensure the `Authorization: Bearer <secret>` header is correct

### No data showing on dashboard
- Check `/api/sync` endpoint (with auth header) to trigger a sync
- Verify `DATABASE_URL` is correct
- Check Prisma schema is pushed: `npx prisma db push`

### 42 API errors
- Verify your 42 application has `client_credentials` grant type enabled
- Check that `FORTY_TWO_CLIENT_ID` and `FORTY_TWO_CLIENT_SECRET` are correct
- Ensure the 42 API is accessible from your deployment region

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

## Security Notes

- Never commit `.env` files to git
- `CRON_SECRET` should be a strong random string (32+ characters)
- The sync endpoint is protected by `CRON_SECRET` — keep it secret
- The holders endpoint is public (no auth required) — this is by design
- Supabase database is only accessible via the connection string — keep it secret

## Cost

- **Vercel:** Free tier includes 100GB bandwidth, 1000 build minutes/month
- **Supabase:** Free tier includes 500MB database, 50,000 monthly active users
- **42 API:** Free (no rate limits for application credentials)
