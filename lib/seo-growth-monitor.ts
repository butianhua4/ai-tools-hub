import { getInternalLinkOptimizationReport } from "@/lib/internal-link-optimizer";
import { detectSeoSignals } from "@/lib/seo-signal-detector";
import { getSeoGraph, type SeoGraph, type SeoNode } from "@/lib/seo-graph";

export type SeoGrowthStage = "cold_start" | "warming" | "growing" | "active";

export type SeoGrowthReport = {
  growthStage: SeoGrowthStage;
  generatedAt: string;
  totalPages: number;
  qPages: number;
  blogPages: number;
  clusterPages: number;
  indexedPages: number | null;
  impressions: number | null;
  clicks: number | null;
  orphanPages: number;
  weakPages: number;
  internalLinkHealth: number;
  seoScore: number;
  growthReadinessScore: number;
  pageTrend: {
    totalPages: number;
    qPages: number;
    clusterPages: number;
    note: string;
  };
  pageGrades: {
    a: SeoGrowthPage[];
    b: SeoGrowthPage[];
    c: SeoGrowthPage[];
  };
  signals: ReturnType<typeof detectSeoSignals>;
  gsc: {
    connected: false;
    indexedPages: null;
    impressions: null;
    clicks: null;
    note: string;
  };
};

export type SeoGrowthPage = {
  path: string;
  title: string;
  type: SeoNode["type"];
  clusterSlug: SeoNode["clusterSlug"];
  incoming: number;
  outgoing: number;
  gradeReason: string;
};

export function getSeoGrowthReport(graph: SeoGraph = getSeoGraph()): SeoGrowthReport {
  const qPages = graph.nodes.filter((node) => node.type === "q");
  const blogPages = graph.nodes.filter((node) => node.type === "blog");
  const clusterPages = graph.nodes.filter((node) => node.type === "cluster");
  const optimizer = getInternalLinkOptimizationReport(graph);
  const signals = detectSeoSignals(graph);
  const growthReadinessScore = getGrowthReadinessScore({
    qPages: qPages.length,
    clusterPages: clusterPages.length,
    orphanPages: graph.orphanPages.length,
    internalLinksComplete: graph.orphanPages.length === 0 && graph.weakPages.length === 0,
  });
  const seoScore = Math.round((growthReadinessScore + optimizer.health) / 2);

  return {
    growthStage: detectGrowthStage({ growthReadinessScore, crawlEvents: signals.crawlEvents, impressions: null, clicks: null }),
    generatedAt: new Date().toISOString(),
    totalPages: graph.nodes.length,
    qPages: qPages.length,
    blogPages: blogPages.length,
    clusterPages: clusterPages.length,
    indexedPages: null,
    impressions: null,
    clicks: null,
    orphanPages: graph.orphanPages.length,
    weakPages: graph.weakPages.length,
    internalLinkHealth: optimizer.health,
    seoScore,
    growthReadinessScore,
    pageTrend: {
      totalPages: graph.nodes.length,
      qPages: qPages.length,
      clusterPages: clusterPages.length,
      note: "No historical storage is connected yet; this panel shows the current growth baseline.",
    },
    pageGrades: gradePages(graph.nodes),
    signals,
    gsc: {
      connected: false,
      indexedPages: null,
      impressions: null,
      clicks: null,
      note: "Search Console API/export is reserved. Values stay null until real GSC data is connected.",
    },
  };
}

export function getGrowthReadinessScore(input: { qPages: number; clusterPages: number; orphanPages: number; internalLinksComplete: boolean }) {
  return (input.qPages > 300 ? 30 : 0) + (input.clusterPages > 5 ? 20 : 0) + (input.orphanPages === 0 ? 20 : 0) + (input.internalLinksComplete ? 30 : 0);
}

function detectGrowthStage(input: { growthReadinessScore: number; crawlEvents: number; impressions: number | null; clicks: number | null }): SeoGrowthStage {
  if ((input.clicks || 0) > 0) return "active";
  if ((input.impressions || 0) > 0) return "growing";
  if (input.growthReadinessScore >= 80 || input.crawlEvents > 0) return "warming";
  return "cold_start";
}

function gradePages(nodes: SeoNode[]) {
  const a: SeoGrowthPage[] = [];
  const b: SeoGrowthPage[] = [];
  const c: SeoGrowthPage[] = [];

  for (const node of nodes) {
    const page = toGrowthPage(node);
    if (node.incoming.length === 0 || node.outgoing.length < 3) {
      c.push({ ...page, gradeReason: "orphan or links < 3" });
    } else if (node.type === "cluster" || node.type === "q" || node.outgoing.length > 8) {
      a.push({ ...page, gradeReason: node.type === "cluster" ? "cluster hub" : node.type === "q" ? "q traffic entry" : "internal links > 8" });
    } else {
      b.push({ ...page, gradeReason: "structured page with internal links" });
    }
  }

  return {
    a: a.sort(sortGrowthPages).slice(0, 50),
    b: b.sort(sortGrowthPages).slice(0, 50),
    c: c.sort(sortGrowthPages).slice(0, 50),
  };
}

function toGrowthPage(node: SeoNode): SeoGrowthPage {
  return {
    path: node.path,
    title: node.title,
    type: node.type,
    clusterSlug: node.clusterSlug,
    incoming: node.incoming.length,
    outgoing: node.outgoing.length,
    gradeReason: "",
  };
}

function sortGrowthPages(a: SeoGrowthPage, b: SeoGrowthPage) {
  return b.incoming + b.outgoing - (a.incoming + a.outgoing) || a.path.localeCompare(b.path);
}
