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
