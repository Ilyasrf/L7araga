import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get("campus");
  const promo = searchParams.get("promo");
  const limit = parseInt(searchParams.get("limit") || "100");

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
}
