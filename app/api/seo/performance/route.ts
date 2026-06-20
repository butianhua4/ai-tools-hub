import { NextResponse } from "next/server";
import { getSearchPerformanceData } from "@/lib/search-performance-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  if (process.env.NODE_ENV !== "development" && process.env.SYSTEM_STATUS_PUBLIC !== "1") {
    return NextResponse.json({ error: "SEO performance status is only available in development unless SYSTEM_STATUS_PUBLIC=1." }, { status: 404 });
  }

  return NextResponse.json(getSearchPerformanceData());
}
