import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  try {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get("campus");
    const promo = searchParams.get("promo");
    const rawLimit = parseInt(searchParams.get("limit") || "1000");
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 1000 : rawLimit, 1), 5000);

    const where: Record<string, unknown> = {};

    if (campus && campus !== "All") {
      where.campusName = campus;
    }

    if (promo && promo !== "All") {
      where.promo = promo;
    }

    const holders = await prisma.achievementHolder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      // OWASP A02: Explicitly whitelist fields to avoid exposing sensitive internal data
      select: {
        intraId: true,
        login: true,
        displayName: true,
        imageUrl: true,
        campusName: true,
        destinationCampusName: true,
        promo: true,
      }
    });

    return NextResponse.json(holders);
  } catch (error) {
    // Sanitize the error (OWASP A02)
    console.error("Failed to fetch holders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
