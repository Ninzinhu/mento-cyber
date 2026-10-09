import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latest = await adminDb()
      .collection("newsSyncRuns")
      .orderBy("finishedAt", "desc")
      .limit(1)
      .get();
    const data = latest.docs[0]?.data();
    if (!data) return NextResponse.json({ status: "unknown" }, { status: 503 });
    const finishedAt = data.finishedAt?.toDate?.();
    const stale =
      !finishedAt || Date.now() - finishedAt.getTime() > 36 * 60 * 60 * 1000;
    return NextResponse.json(
      {
        status: stale || Number(data.failureCount || 0) > 6 ? "degraded" : "ok",
        importedCount: Number(data.importedCount || 0),
        failureCount: Number(data.failureCount || 0),
        finishedAt: finishedAt?.toISOString() || null,
      },
      { status: stale ? 503 : 200 },
    );
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
