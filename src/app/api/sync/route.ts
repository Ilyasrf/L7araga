import { NextResponse } from "next/server";
import { syncCampus } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Temporarily removed auth check so you can trigger it from your browser
  // if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get("campus");

  const campusIds = campusId ? [parseInt(campusId)] : [16, 21, 43];
  const allResults: { campusId: number; synced: number; errors: string[] }[] = [];

  for (const id of campusIds) {
    try {
      const result = await syncCampus(id);
      allResults.push({ campusId: id, ...result });
    } catch (error) {
      allResults.push({
        campusId: id,
        synced: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  const totalSynced = allResults.reduce((sum, r) => sum + r.synced, 0);
  const allErrors = allResults.flatMap((r) => r.errors);

  return NextResponse.json({
    success: allErrors.length === 0 || totalSynced > 0,
    synced: totalSynced,
    errors: allErrors,
    campuses: allResults,
    timestamp: new Date().toISOString(),
  });
}
