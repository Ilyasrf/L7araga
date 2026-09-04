import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/sync";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiUser = Record<string, any>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = parseInt(searchParams.get("campus") || "16");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.intra.42.fr/v2/campus/${campusId}/users?per_page=3&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json({ error: `API ${response.status}: ${body}` });
    }

    const users: ApiUser[] = await response.json();

    const debug = users.map((u) => ({
      id: u.id,
      login: u.login,
      displayname: u.displayname,
      campus_users_raw: u.campus_users,
      has_campus_users: !!u.campus_users,
      keys: Object.keys(u),
    }));

    return NextResponse.json({
      campusId,
      count: users.length,
      users: debug,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
