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
  "staff?"?: boolean;
  kind?: string;
}

interface CampusUser {
  id: number;
  user_id: number;
  campus_id: number;
  is_primary: boolean;
}

const CAMPUS_NAMES: Record<number, string> = {
  16: "Khouribga",
  21: "Benguerir",
  55: "Tétouan",
  75: "Rabat",
};

const MOROCCAN_CAMPUS_IDS = [16, 21, 55, 75];

const CAMPUS_MAX_PAGES: Record<number, number> = {
  16: 60,
  21: 50,
  55: 30,
  75: 10,
};

let cachedToken: { token: string; expires: number } | null = null;
let allGlobalCampuses: Record<number, string> | null = null;

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

async function fetchAllGlobalCampuses(token: string): Promise<Record<number, string>> {
  if (allGlobalCampuses) return allGlobalCampuses;
  
  const map: Record<number, string> = {};
  const response = await fetch("https://api.intra.42.fr/v2/campus?per_page=100", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.ok) {
    const data = await response.json();
    for (const c of data) {
      map[c.id] = c.name;
    }
  }
  allGlobalCampuses = map;
  return map;
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
      // Filter out staff and admin users
      const students = pageUsers.filter((u) => !u["staff?"] && u.kind !== "admin");
      allUsers.push(...students);
      if (pageUsers.length < 100) return allUsers;
    }

    if (batch + CONCURRENCY < maxPages) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return allUsers;
}

// Returns a Map of user_id -> their destination (non-Moroccan) campus ID
async function findGlobalTransfers(
  userIds: number[],
  token: string
): Promise<Map<number, number>> {
  const transferMap = new Map<number, number>();
  const chunkSize = 100;
  
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    let page = 1;
    while (true) {
      const url = `https://api.intra.42.fr/v2/campus_users?filter[user_id]=${chunk.join(',')}&per_page=100&page=${page}`;
      let retries = 3;
      let success = false;
      let campusUsers: CampusUser[] = [];
      
      while (retries > 0) {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "2";
          await new Promise((r) => setTimeout(r, parseInt(retryAfter) * 1000));
          retries--;
          continue;
        }
        if (!response.ok) {
          throw new Error(`API ${response.status} when filtering campus_users`);
        }
        
        campusUsers = await response.json();
        success = true;
        break; 
      }

      if (!success) throw new Error("Failed to fetch campus_users after retries");

      // Group campus_users by user_id
      const userCampuses = new Map<number, number[]>();
      for (const cu of campusUsers) {
        if (!userCampuses.has(cu.user_id)) {
          userCampuses.set(cu.user_id, []);
        }
        userCampuses.get(cu.user_id)!.push(cu.campus_id);
      }
      
      // Check which users have a non-Moroccan campus
      for (const [userId, campuses] of Array.from(userCampuses.entries())) {
        const foreignCampuses = campuses.filter((id: number) => !MOROCCAN_CAMPUS_IDS.includes(id));
        if (foreignCampuses.length > 0) {
          // They transferred! Just take the first foreign campus as their destination
          transferMap.set(userId, foreignCampuses[0]);
        }
      }

      if (campusUsers.length < 100) {
        break; // No more pages for this chunk
      }
      page++;
      await new Promise((r) => setTimeout(r, 600)); // sleep between pages
    }
    
    // slight sleep to respect 2 req/s rate limit between chunks
    await new Promise((r) => setTimeout(r, 600)); 
  }
  return transferMap;
}

async function upsertHolders(
  holders: Holder42[],
  campusId: number,
  transfers: Map<number, number>,
  globalCampusesMap: Record<number, string>
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;
  const campusName = CAMPUS_NAMES[campusId] || `Campus ${campusId}`;

  for (const holder of holders) {
    try {
      const destCampusId = transfers.get(holder.id);
      if (!destCampusId) {
        skipped++;
        // Delete them from DB if they were previously synced but lost transfer status
        await prisma.achievementHolder.deleteMany({
          where: { intraId: holder.id },
        });
        continue;
      }

      const promo = extractPromo(holder);
      const destCampusName = globalCampusesMap[destCampusId] || `Campus ${destCampusId}`;

      await prisma.achievementHolder.upsert({
        where: { intraId: holder.id },
        update: {
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName,
          campusId,
          destinationCampusId: destCampusId,
          destinationCampusName: destCampusName,
          promo,
        },
        create: {
          intraId: holder.id,
          login: holder.login,
          displayName: holder.displayname,
          imageUrl: holder.image?.link || null,
          campusName,
          campusId,
          destinationCampusId: destCampusId,
          destinationCampusName: destCampusName,
          promo,
        },
      });
      synced++;
    } catch (error) {
      errors.push(`Failed to sync ${holder.login}: ${error}`);
    }
  }

  console.log(`Campus ${campusId}: ${synced} synced, ${skipped} skipped`);
  return { synced, errors };
}

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
  const globalCampusesMap = await fetchAllGlobalCampuses(token);
  
  const campusUsersMap = new Map<number, Holder42[]>();
  const allUserIds: number[] = [];

  // 1. Fetch all users from requested Moroccan campuses
  for (const campusId of campusIds) {
    const maxPages = CAMPUS_MAX_PAGES[campusId] || 10;
    const users = await fetchAllCampusUsers(campusId, token, maxPages);
    campusUsersMap.set(campusId, users);
    users.forEach(u => allUserIds.push(u.id));
    console.log(`Campus ${campusId}: ${users.length} total valid users fetched`);
  }

  // 2. Find globally transferred users
  console.log(`Checking ${allUserIds.length} Moroccan students for global transfers...`);
  const transfers = await findGlobalTransfers(allUserIds, token);
  console.log(`Found ${transfers.size} globally transferred students!`);

  // 3. Upsert transferred users and clean up others
  const allResults: SyncResult[] = [];
  let totalSynced = 0;
  const allErrors: string[] = [];

  for (const campusId of campusIds) {
    const users = campusUsersMap.get(campusId) || [];
    const result = await upsertHolders(users, campusId, transfers, globalCampusesMap);
    totalSynced += result.synced;
    allErrors.push(...result.errors);
    allResults.push({ campusId, ...result });
  }

  // 4. Final DB Cleanup: delete any records in DB that are not in the current transfers map
  // This removes staff/admin or students who lost transfer status entirely
  const validIntraIds = Array.from(transfers.keys());
  try {
    const deleteResult = await prisma.achievementHolder.deleteMany({
      where: {
        intraId: { notIn: validIntraIds }
      }
    });
    console.log(`Cleaned up ${deleteResult.count} stale records from database.`);
  } catch (error) {
    console.error("Failed to clean up stale records:", error);
    allErrors.push(`Cleanup error: ${error}`);
  }

  return {
    success: allErrors.length === 0 || totalSynced > 0,
    synced: totalSynced,
    errors: allErrors,
    campuses: allResults
  };
}
