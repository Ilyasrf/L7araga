import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/sync";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiUser = Record<string, any>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = parseInt(searchParams.get("campus") || "16");
  const action = searchParams.get("action") || "campus_users";

  try {
    const token = await getAccessToken();

    if (action === "campus_users") {
      const response = await fetch(
        `https://api.intra.42.fr/v2/campus_users?campus_id=${campusId}&per_page=3&page=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const body = await response.text();
        return NextResponse.json({ error: `API ${response.status}: ${body}` });
      }
      const data: ApiUser[] = await response.json();
      return NextResponse.json({ action, campusId, count: data.length, data });
    }

    if (action === "single_user") {
      const userId = searchParams.get("userId") || "aoussat";
      const response = await fetch(
        `https://api.intra.42.fr/v2/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const body = await response.text();
        return NextResponse.json({ error: `API ${response.status}: ${body}` });
      }
      const data: ApiUser = await response.json();
      return NextResponse.json({
        action,
        userId,
        campus_users: data.campus_users,
        has_campus_users: !!data.campus_users,
        keys: Object.keys(data),
      });
    }

    if (action === "single_user_campus") {
      const userId = searchParams.get("userId") || "aoussat";
      const response = await fetch(
        `https://api.intra.42.fr/v2/users/${userId}/campus_users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const body = await response.text();
        return NextResponse.json({ error: `API ${response.status}: ${body}` });
      }
      const data: ApiUser[] = await response.json();
      return NextResponse.json({ action, userId, count: data.length, data });
    }

    return NextResponse.json({ error: "Unknown action" });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
