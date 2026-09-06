import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    });

    return NextResponse.json(holders);
  } catch (error) {
    console.error("Failed to fetch holders:", error);
    return NextResponse.json(
      { error: "Failed to fetch holders. Make sure the database is set up." },
      { status: 500 }
    );
  }
}
