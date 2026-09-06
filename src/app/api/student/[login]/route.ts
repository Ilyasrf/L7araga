import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAccessToken } from "@/lib/sync";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique users per minute
});

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { login: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting (using session email as token, or IP if available)
  const userToken = session.user?.email || "anonymous";
  try {
    await limiter.check(20, userToken); // 20 requests per minute per user
  } catch {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const login = params.login;
  if (!login) {
    return NextResponse.json({ error: "Missing login parameter" }, { status: 400 });
  }

  // Input Validation (OWASP A03)
  if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
    return NextResponse.json({ error: "Invalid login format" }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();

    // Fetch user details from 42 API
    const res = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      // Log the actual error for debugging, but don't leak it to the client
      console.error(`Upstream 42 API error: status ${res.status}`);
      throw new Error(`Upstream API failed`);
    }

    const userData = await res.json();
    
    // Extract relevant data
    const cursus = userData.cursus_users?.find((c: { cursus_id: number }) => c.cursus_id === 21) || userData.cursus_users?.[0];

    const profileData = {
      login: userData.login,
      email: userData.email || null,
      displayName: userData.displayname,
      imageUrl: userData.image?.link || null,
      wallet: userData.wallet,
      correctionPoints: userData.correction_point,
      poolMonth: userData.pool_month,
      poolYear: userData.pool_year,
      location: userData.location,
      active: userData["active?"],
      kind: userData.kind,
      level: cursus?.level || 0,
      grade: cursus?.grade || "N/A",
      cursusName: cursus?.cursus?.name || "N/A",
    };

    return NextResponse.json(profileData);
  } catch (error) {
    // Sanitize the error (OWASP A02)
    console.error(`Failed to fetch profile for ${login}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
