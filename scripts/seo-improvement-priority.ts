import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type AuditItem = {
  canonical?: string;
  category?: string;
  currentInternalLinks?: number;
  description?: string;
  file: string;
  issues?: string[];
  primaryKeyword?: string;
  scope?: string[];
  scopes?: string[];
  slug?: string;
  status?: string;
  suggestions?: Array<{ title: string; url: string; score: number }>;
  title?: string;
  warnings?: string[];
};

type GenericAudit = {
  generatedAt: string;
  summary: Record<string, number | string | boolean>;
  blockingItems?: AuditItem[];
  candidateItems?: AuditItem[];
  recommendedItems?: AuditItem[];
  warningItems?: AuditItem[];
};

type GscProgress = {
  generatedAt: string;
  summary: {
    confirmedGscSubmitted: number;
    duplicateUrls: number;
    growthReadinessScore: number;
    growthStage: string;
    gscRemaining: number;
    indexNowSubmitted: boolean;
    indexNowUrls: number;
    internalLinkHealth: number;
    orphanPages: number;
    todayQueueUrls: number;
    topQueueUrls: number;
    weakPages: number;
  };
  queueHealth: {
    firstRemainingUrls: string[];
  };
};

type PriorityLane = {
  action: string;
  evidence: string;
  impact: "critical" | "high" | "medium";
  name: string;
  owner: "automation" | "manual-gsc" | "content-fix";
  sampleItems: Array<Record<string, unknown>>;
  status: "ready" | "watch" | "blocked";
};

const files = {
  contentIntegrity: path.join(process.cwd(), "content", "automation", "content-integrity-audit.json"),
  gscProgress: path.join(process.cwd(), "content", "automation", "gsc-submission-progress.json"),
  internalLinks: path.join(process.cwd(), "content", "automation", "internal-link-opportunity-audit.json"),
  outputJson: path.join(process.cwd(), "content", "automation", "seo-improvement-priority.json"),
  outputMarkdown: path.join(process.cwd(), "docs", "seo-improvement-priority.md"),
  snippets: path.join(process.cwd(), "content", "automation", "search-snippet-readiness-audit.json"),
  structuredData: path.join(process.cwd(), "content", "automation", "structured-data-readiness-audit.json"),
};

function main() {
  const contentIntegrity = readJson<GenericAudit>(files.contentIntegrity);
  const snippets = readJson<GenericAudit>(files.snippets);
  const structuredData = readJson<GenericAudit>(files.structuredData);
  const internalLinks = readJson<GenericAudit>(files.internalLinks);
  const gscProgress = readJson<GscProgress>(files.gscProgress);

  const publicMojibakeItems = (contentIntegrity.warningItems ?? [])
    .filter((item) => item.status === "published" || item.scope?.includes("public"))
    .slice(0, 20);
  const publicSnippetItems = (snippets.warningItems ?? [])
    .filter((item) => item.status === "published" || item.scope?.includes("public"))
    .slice(0, 20);
  const publicSchemaItems = (structuredData.warningItems ?? [])
    .filter((item) => item.status === "published" || item.scope?.includes("public"))
    .slice(0, 20);
  const internalLinkItems = uniqueByFile([
    ...(internalLinks.recommendedItems ?? []),
    ...(internalLinks.candidateItems ?? []),
  ]).slice(0, 20);

  const lanes: PriorityLane[] = [
    buildGscLane(gscProgress),
    buildMojibakeLane(contentIntegrity, publicMojibakeItems),
    buildSnippetLane(snippets, publicSnippetItems),
    buildSchemaLane(structuredData, publicSchemaItems),
    buildInternalLinkLane(internalLinks, internalLinkItems),
  ];

  const nextSevenActions = [
    "Do not expand beyond the current top 500 queue until crawl/indexing movement is visible in GSC.",
    "Keep the top queue focused on q and cluster pages; use blog pages as depth targets, not the first manual request priority.",
    "Repair public mojibake warnings first because broken titles/descriptions reduce trust and CTR even when indexed.",
    "Rewrite snippet warnings for pages already in the GSC top 500 queue before touching lower-priority pages.",
    "Normalize structured-data contentType values so schema warnings stay non-blocking and consistent.",
    "Apply the internal-link opportunity suggestions to draft/recommended pages before publishing them.",
    "Record real manual GSC progress in content/automation/gsc-manual-progress.json after URL Inspection submissions.",
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      noFakeTrafficClaims: true,
      readOnlyAnalysis: true,
      note: "This report consolidates existing audits and queues. It does not generate new content or claim indexing, impressions, clicks, or income.",
    },
    summary: {
      growthStage: gscProgress.summary.growthStage,
      growthReadinessScore: gscProgress.summary.growthReadinessScore,
      confirmedGscSubmitted: gscProgress.summary.confirmedGscSubmitted,
      gscRemaining: gscProgress.summary.gscRemaining,
      topQueueUrls: gscProgress.summary.topQueueUrls,
      indexNowSubmitted: gscProgress.summary.indexNowSubmitted,
      indexNowUrls: gscProgress.summary.indexNowUrls,
      blockingItems:
        Number(contentIntegrity.summary.blockingItems ?? 0) +
        Number(snippets.summary.blockingItems ?? 0) +
        Number(structuredData.summary.blockingItems ?? 0),
      publicMojibakeWarningItems: Number(contentIntegrity.summary.publicMojibakeWarningItems ?? 0),
      snippetWarningItems: Number(snippets.summary.warningItems ?? 0),
      schemaWarningItems: Number(structuredData.summary.warningItems ?? 0),
      internalLinkCandidateItems: Number(internalLinks.summary.candidateItems ?? 0),
      internalLinkRecommendedItems: Number(internalLinks.summary.recommendedItems ?? 0),
      orphanPages: gscProgress.summary.orphanPages,
      weakPages: gscProgress.summary.weakPages,
    },
    priorityLanes: lanes,
    nextSevenActions,
  };

  fs.mkdirSync(path.dirname(files.outputJson), { recursive: true });
  fs.mkdirSync(path.dirname(files.outputMarkdown), { recursive: true });
  fs.writeFileSync(files.outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(files.outputMarkdown, toMarkdown(report), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        json: rel(files.outputJson),
        markdown: rel(files.outputMarkdown),
        growthStage: report.summary.growthStage,
        blockingItems: report.summary.blockingItems,
        publicMojibakeWarningItems: report.summary.publicMojibakeWarningItems,
        snippetWarningItems: report.summary.snippetWarningItems,
        schemaWarningItems: report.summary.schemaWarningItems,
        internalLinkCandidateItems: report.summary.internalLinkCandidateItems,
      },
      null,
      2,
    ),
  );
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) throw new Error(`Missing ${rel(file)}. Run the related audit first.`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function buildGscLane(gscProgress: GscProgress): PriorityLane {
  return {
    name: "GSC manual indexing queue",
    impact: "critical",
    status: gscProgress.summary.confirmedGscSubmitted > 0 ? "watch" : "ready",
    owner: "manual-gsc",
    evidence: `${gscProgress.summary.topQueueUrls} URLs prepared, ${gscProgress.summary.confirmedGscSubmitted} confirmed submitted, ${gscProgress.summary.gscRemaining} remaining.`,
    action:
      "Continue manual URL Inspection requests from the priority queue, then update the local confirmed count so progress stays auditable.",
    sampleItems: gscProgress.queueHealth.firstRemainingUrls.slice(0, 10).map((url, index) => ({
      rank: index + 1,
      url,
    })),
  };
}

function buildMojibakeLane(audit: GenericAudit, items: AuditItem[]): PriorityLane {
  return {
    name: "Public mojibake and encoding repair",
    impact: "critical",
    status: items.length > 0 ? "ready" : "watch",
    owner: "content-fix",
    evidence: `${audit.summary.publicMojibakeWarningItems ?? 0} public pages have possible mojibake warnings.`,
    action: "Repair titles/descriptions/body text for public pages with encoding damage before expanding new content.",
    sampleItems: items.map(compactItem),
  };
}

function buildSnippetLane(audit: GenericAudit, items: AuditItem[]): PriorityLane {
  return {
    name: "Search snippet CTR repair",
    impact: "high",
    status: items.length > 0 ? "ready" : "watch",
    owner: "content-fix",
    evidence: `${audit.summary.warningItems ?? 0} pages have snippet warnings, mostly title/keyword alignment.`,
    action: "Prioritize title and description rewrites for pages in the GSC top queue and pages with future impressions.",
    sampleItems: items.map(compactItem),
  };
}

function buildSchemaLane(audit: GenericAudit, items: AuditItem[]): PriorityLane {
  return {
    name: "Structured data normalization",
    impact: "medium",
    status: items.length > 0 ? "ready" : "watch",
    owner: "automation",
    evidence: `${audit.summary.warningItems ?? 0} pages have schema warnings; current count is non-blocking.`,
    action: "Normalize uncommon contentType values and keep JSON-LD consistent across q, cluster, and blog pages.",
    sampleItems: items.map(compactItem),
  };
}

function buildInternalLinkLane(audit: GenericAudit, items: AuditItem[]): PriorityLane {
  return {
    name: "Internal-link opportunity queue",
    impact: "high",
    status: Number(audit.summary.candidateItems ?? 0) > 0 ? "ready" : "watch",
    owner: "automation",
    evidence: `${audit.summary.candidateItems ?? 0} candidate items and ${audit.summary.recommendedItems ?? 0} recommended items have link suggestions.`,
    action: "Apply suggested public links to candidates before publishing and keep every new page above the internal-link floor.",
    sampleItems: items.map((item) => ({
      ...compactItem(item),
      currentInternalLinks: item.currentInternalLinks,
      suggestions: item.suggestions?.slice(0, 3).map((suggestion) => ({
        title: suggestion.title,
        url: suggestion.url,
        score: suggestion.score,
      })),
    })),
  };
}

function compactItem(item: AuditItem) {
  return {
    file: item.file,
    title: item.title,
    status: item.status,
    slug: item.slug,
    category: item.category,
    primaryKeyword: item.primaryKeyword,
    warnings: item.warnings?.slice(0, 3) ?? [],
  };
}

function uniqueByFile(items: AuditItem[]) {
  const seen = new Set<string>();
  const uniqueItems: AuditItem[] = [];
  for (const item of items) {
    if (seen.has(item.file)) continue;
    seen.add(item.file);
    uniqueItems.push(item);
  }
  return uniqueItems;
}

function toMarkdown(report: {
  generatedAt: string;
  guardrails: { noFakeTrafficClaims: boolean; note: string; readOnlyAnalysis: boolean };
  nextSevenActions: string[];
  priorityLanes: PriorityLane[];
  summary: Record<string, number | string | boolean>;
}) {
  const lines = [
    "# SEO Improvement Priority",
    "",
    `Generated at: ${report.generatedAt}`,
    "",
    "## Guardrails",
    "",
    `- No fake traffic claims: ${report.guardrails.noFakeTrafficClaims}`,
    `- Read-only analysis: ${report.guardrails.readOnlyAnalysis}`,
    `- Note: ${report.guardrails.note}`,
    "",
    "## Summary",
    "",
    ...Object.entries(report.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Priority Lanes",
    "",
  ];

  for (const [index, lane] of report.priorityLanes.entries()) {
    lines.push(
      `### ${index + 1}. ${lane.name}`,
      "",
      `- Impact: ${lane.impact}`,
      `- Status: ${lane.status}`,
      `- Owner: ${lane.owner}`,
      `- Evidence: ${lane.evidence}`,
      `- Action: ${lane.action}`,
      "",
      "| File/URL | Title | Warnings |",
      "| --- | --- | --- |",
    );

    if (lane.sampleItems.length === 0) {
      lines.push("| none | none | none |");
    } else {
      for (const item of lane.sampleItems.slice(0, 10)) {
        const fileOrUrl = String(item.file ?? item.url ?? "");
        const title = String(item.title ?? "");
        const warnings = Array.isArray(item.warnings) ? item.warnings.join("; ") : "";
        lines.push(`| ${escapeMd(fileOrUrl)} | ${escapeMd(title)} | ${escapeMd(warnings)} |`);
      }
    }
    lines.push("");
  }

  lines.push("## Next Seven Actions", "");
  for (const action of report.nextSevenActions) lines.push(`- ${action}`);
  lines.push("");
  return lines.join("\n");
}

function escapeMd(value: string) {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

main();
