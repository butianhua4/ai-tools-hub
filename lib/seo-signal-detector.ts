import fs from "fs";
import path from "path";
import { getSeoGraph, type SeoGraph, type SeoNode } from "@/lib/seo-graph";

export type SeoSignalPage = {
  path: string;
  title: string;
  type: SeoNode["type"];
  clusterSlug: SeoNode["clusterSlug"];
  incoming: number;
  outgoing: number;
  crawlEvents: number;
  impressions: number | null;
  clicks: number | null;
};

export type SeoSignalReport = {
  gscConnected: false;
  evidence: string;
  risingPages: SeoSignalPage[];
  deadPages: SeoSignalPage[];
  potentialPages: SeoSignalPage[];
  crawlEvents: number;
};

export function detectSeoSignals(graph: SeoGraph = getSeoGraph()): SeoSignalReport {
  const crawlCounts = readCrawlCounts();

  const pages = graph.nodes.map((node) => toSignalPage(node, crawlCounts.get(node.path) || 0));
  const risingPages = pages
    .filter((page) => page.crawlEvents > 0)
    .sort((a, b) => b.crawlEvents - a.crawlEvents || b.incoming - a.incoming)
    .slice(0, 20);
  const deadPages = graph.orphanPages.concat(graph.weakPages).map((node) => toSignalPage(node, crawlCounts.get(node.path) || 0));
  const potentialPages = pages
    .filter((page) => page.type === "q" || page.type === "cluster" || page.incoming >= 8)
    .sort((a, b) => scorePotential(b) - scorePotential(a))
    .slice(0, 30);

  return {
    gscConnected: false,
    evidence: "Search Console data is reserved and not connected yet. Crawl frequency only reads real crawl events from logs/system.log.",
    risingPages,
    deadPages,
    potentialPages,
    crawlEvents: Array.from(crawlCounts.values()).reduce((sum, count) => sum + count, 0),
  };
}

function toSignalPage(node: SeoNode, crawlEvents: number): SeoSignalPage {
  return {
    path: node.path,
    title: node.title,
    type: node.type,
    clusterSlug: node.clusterSlug,
    incoming: node.incoming.length,
    outgoing: node.outgoing.length,
    crawlEvents,
    impressions: null,
    clicks: null,
  };
}

function scorePotential(page: SeoSignalPage) {
  const typeScore = page.type === "cluster" ? 40 : page.type === "q" ? 30 : 10;
  return typeScore + page.incoming * 2 + page.outgoing;
}

function readCrawlCounts() {
  const counts = new Map<string, number>();
  const logFile = path.join(process.cwd(), "logs", "system.log");
  if (!fs.existsSync(logFile)) return counts;

  const lines = fs.readFileSync(logFile, "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as { event?: string; message?: string; path?: string; url?: string };
      const text = [entry.event, entry.message].filter(Boolean).join(" ").toLowerCase();
      if (!text.includes("crawl")) continue;
      const pagePath = normalizePath(entry.path || entry.url || extractPath(entry.message || ""));
      if (!pagePath) continue;
      counts.set(pagePath, (counts.get(pagePath) || 0) + 1);
    } catch {
      continue;
    }
  }
  return counts;
}

function extractPath(value: string) {
  const match = value.match(/\/(?:q|blog|cluster)\/[a-z0-9][^\s"'<>]*/i);
  return match?.[0] || "";
}

function normalizePath(value: string) {
  if (!value) return "";
  try {
    if (value.startsWith("http")) return new URL(value).pathname.replace(/\/$/, "") || "/";
  } catch {
    return "";
  }
  return value.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
}
