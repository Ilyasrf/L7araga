import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAccessToken } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { login: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const login = params.login;
  if (!login) {
    return NextResponse.json({ error: "Missing login parameter" }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    // Fetch user details from 42 API
    const res = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw new Error(`42 API responded with status: ${res.status}`);
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
    console.error(`Failed to fetch profile for ${login}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}
