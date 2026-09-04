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
    const body = await response.text();
    throw new Error(`Failed to get access token: ${response.status} - ${body}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
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

async function fetchCampusUsers(campusId: number, token: string): Promise<Holder42[]> {
  const response = await fetch(
    `https://api.intra.42.fr/v2/campus/${campusId}/users?per_page=100&page=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed for campus ${campusId}: ${response.status} - ${body}`);
  }

  return response.json();
}

async function upsertHolders(holders: Holder42[]): Promise<{ synced: number; errors: string[] }> {
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

export async function syncCampus(campusId: number): Promise<{ synced: number; errors: string[] }> {
  const token = await getAccessToken();

  const campusUsers = await fetchCampusUsers(campusId, token);

  console.log(`Campus ${campusId}: ${campusUsers.length} users fetched`);

  return upsertHolders(campusUsers);
}

export async function syncHolders(): Promise<{ synced: number; errors: string[] }> {
  const campusIds = [16, 21, 55];
  const allErrors: string[] = [];
  let totalSynced = 0;

  for (const campusId of campusIds) {
    const result = await syncCampus(campusId);
    totalSynced += result.synced;
    allErrors.push(...result.errors);
  }

  return { synced: totalSynced, errors: allErrors };
}
