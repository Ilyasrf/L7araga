import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds on Vercel

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campusIdParam = searchParams.get("campus");
  const campusIds = campusIdParam ? [parseInt(campusIdParam)] : [16, 21, 43];

  let result;
  try {
    result = await runSync(campusIds);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
  });
}
