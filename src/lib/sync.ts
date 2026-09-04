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
  pool_month?: string;
  pool_year?: number;
}

const CAMPUS_NAMES: Record<number, string> = {
  1: "Paris",
  16: "Khouribga",
  21: "Benguerir",
  55: "Tetouan",
};

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
  if (user.pool_year) {
    return user.pool_year.toString();
  }
  return null;
}

async function fetchPage(
  campusId: number,
  page: number,
  token: string
): Promise<Holder42[]> {
  const response = await fetch(
    `https://api.intra.42.fr/v2/campus/${campusId}/users?per_page=100&page=${page}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || "2";
    await new Promise((r) => setTimeout(r, parseInt(retryAfter) * 1000));
    return fetchPage(campusId, page, token);
  }

  if (!response.ok) {
    throw new Error(`API ${response.status} for campus ${campusId} page ${page}`);
  }

  return response.json();
}

async function fetchAllCampusUsers(
  campusId: number,
  token: string,
  maxPages: number
): Promise<Holder42[]> {
  const allUsers: Holder42[] = [];
  const CONCURRENCY = 5;

  for (let batch = 0; batch < maxPages; batch += CONCURRENCY) {
    const pages = Array.from(
      { length: Math.min(CONCURRENCY, maxPages - batch) },
      (_, i) => batch + i + 1
    );

    const results = await Promise.all(
      pages.map((p) => fetchPage(campusId, p, token))
    );

    for (const pageUsers of results) {
      allUsers.push(...pageUsers);
      if (pageUsers.length < 100) return allUsers;
    }

    if (batch + CONCURRENCY < maxPages) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return allUsers;
}

async function upsertHolders(
  holders: Holder42[],
  campusId: number
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  const campusName = CAMPUS_NAMES[campusId] || `Campus ${campusId}`;

  for (const holder of holders) {
    try {
      const promo = extractPromo(holder);

      await prisma.achievementHolder.upsert({
        where: { intraId: holder.id },
        update: {
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName,
          campusId,
          promo,
        },
        create: {
          intraId: holder.id,
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName,
          campusId,
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

const CAMPUS_MAX_PAGES: Record<number, number> = {
  16: 60,
  21: 50,
  55: 15,
};

export async function syncCampus(
  campusId: number,
  maxPages?: number
): Promise<{ synced: number; errors: string[] }> {
  const token = await getAccessToken();
  const pages = maxPages || CAMPUS_MAX_PAGES[campusId] || 10;

  const campusUsers = await fetchAllCampusUsers(campusId, token, pages);

  console.log(`Campus ${campusId}: ${campusUsers.length} users fetched`);

  return upsertHolders(campusUsers, campusId);
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
