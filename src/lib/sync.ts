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
  16: "Khouribga",
  21: "Benguerir",
  43: "Tetouan",
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
  const url = `https://api.intra.42.fr/v2/campus/${campusId}/users?per_page=100&page=${page}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

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

async function findParisIntersections(
  userIds: number[],
  token: string
): Promise<Set<number>> {
  const parisIds = new Set<number>();
  const chunkSize = 100; // max allowed by 42 API for filtering
  
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const url = `https://api.intra.42.fr/v2/campus/1/users?filter[id]=${chunk.join(',')}&per_page=100`;
    
    let retries = 3;
    while (retries > 0) {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || "2";
        await new Promise((r) => setTimeout(r, parseInt(retryAfter) * 1000));
        retries--;
        continue;
      }
      if (!response.ok) {
        throw new Error(`API ${response.status} when filtering Paris intersection`);
      }
      const users = await response.json();
      for (const u of users) {
        parisIds.add(u.id);
      }
      break; 
    }
    // slight sleep to respect 2 req/s rate limit across iterations
    await new Promise((r) => setTimeout(r, 600)); 
  }
  return parisIds;
}

async function upsertHolders(
  holders: Holder42[],
  campusId: number,
  transferredIds: Set<number>
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;
  const campusName = CAMPUS_NAMES[campusId] || `Campus ${campusId}`;

  for (const holder of holders) {
    try {
      // Filter out students who haven't transferred to Paris
      if (!transferredIds.has(holder.id)) {
        skipped++;
        // Delete them from DB if they were previously synced but left/no longer transferred
        await prisma.achievementHolder.deleteMany({
          where: { intraId: holder.id },
        });
        continue;
      }

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

  console.log(`Campus ${campusId}: ${synced} synced, ${skipped} non-transferred skipped`);
  return { synced, errors };
}

const CAMPUS_MAX_PAGES: Record<number, number> = {
  16: 60,
  21: 50,
  43: 30,
};

export interface SyncResult {
  campusId: number;
  synced: number;
  errors: string[];
}

export async function runSync(campusIds: number[]): Promise<{
  success: boolean;
  synced: number;
  errors: string[];
  campuses: SyncResult[];
}> {
  const token = await getAccessToken();
  const campusUsersMap = new Map<number, Holder42[]>();
  const allUserIds: number[] = [];

  // 1. Fetch all users from requested Moroccan campuses
  for (const campusId of campusIds) {
    const maxPages = CAMPUS_MAX_PAGES[campusId] || 10;
    const users = await fetchAllCampusUsers(campusId, token, maxPages);
    campusUsersMap.set(campusId, users);
    users.forEach(u => allUserIds.push(u.id));
    console.log(`Campus ${campusId}: ${users.length} total users fetched`);
  }

  // 2. Find which of these users also belong to Paris
  console.log(`Checking ${allUserIds.length} Moroccan students against Paris campus...`);
  const transferredIds = await findParisIntersections(allUserIds, token);
  console.log(`Found ${transferredIds.size} transferred students!`);

  // 3. Upsert transferred users and clean up others
  const allResults: SyncResult[] = [];
  let totalSynced = 0;
  const allErrors: string[] = [];

  for (const campusId of campusIds) {
    const users = campusUsersMap.get(campusId) || [];
    const result = await upsertHolders(users, campusId, transferredIds);
    totalSynced += result.synced;
    allErrors.push(...result.errors);
    allResults.push({ campusId, ...result });
  }

  return {
    success: allErrors.length === 0 || totalSynced > 0,
    synced: totalSynced,
    errors: allErrors,
    campuses: allResults
  };
}
