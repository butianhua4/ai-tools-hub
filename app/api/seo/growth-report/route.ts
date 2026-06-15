import { NextResponse } from "next/server";
import { getSeoGrowthReport } from "@/lib/seo-growth-monitor";

export const dynamic = "force-dynamic";

export function GET() {
  const report = getSeoGrowthReport();
  return NextResponse.json({
    growthStage: report.growthStage,
    totalPages: report.totalPages,
    qPages: report.qPages,
    clusterPages: report.clusterPages,
    internalLinkHealth: report.internalLinkHealth,
    orphanPages: report.orphanPages,
    seoScore: report.seoScore,
    weakPages: report.weakPages,
    growthReadinessScore: report.growthReadinessScore,
  });
}
