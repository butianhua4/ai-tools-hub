import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type LaunchPack = {
  generatedAt: string;
  guardrails: {
    autoCreateArticles: boolean;
    autoEditArticles: boolean;
    autoMarkReview: boolean;
    autoPublish: boolean;
    trafficClaim: string;
  };
  items: Array<{
    cluster: string;
    commandBoundary: {
      markReviewAfterHumanApproval: string;
      publishConfirm: string;
      publishDryRunAfterReview: string;
    };
    file: string;
    gapScore: number;
    humanFactCheckChecklist: unknown[];
    readyForFirstCoverageReview: boolean;
    safeDraft: boolean;
    searchQueries: string[];
    sourceTargets: string[];
    title: string;
    triageFreshnessRisk: string | null;
    unsafeReasons: unknown[];
  }>;
  summary: {
    clustersSelected: number;
    trafficDataAvailable: boolean;
    unsafeItems: number;
    zeroPublicClusters: number;
  };
};

type SimpleReport<T> = {
  data: T | null;
  path: string;
};

type FileIssueItem = {
  file: string;
  issues?: string[];
  warningIssues?: string[];
  warnings?: string[];
};

type PublicGapPreflightItem = FileIssueItem & {
  blockingIssues: string[];
  exactSeedMatches: number;
  linksToPublicArticles: number;
  publicLinkSuggestions: unknown[];
  readyForManualReview: boolean;
  seedFamilyMatches: number;
  sourceTargets: string[];
  structuredDataReady: boolean;
  warningIssues: string[];
};

type SourceHealthFile = {
  file: string;
  reachableSources: number;
  sourceTargets: number;
  urls: string[];
};

type InternalLinkItem = {
  file: string;
  linksToPublicArticles: number;
  missingPublicLinkSuggestion: boolean;
  suggestions: unknown[];
};

type InternalLinkReport = {
  candidateItems?: InternalLinkItem[];
  items?: InternalLinkItem[];
};

type QueryMatchItem = {
  blockingIssues: string[];
  exactQueryMatches: number;
  file: string;
  matchedFamilies: number;
  readyForManualReview: boolean;
  reviewSuggestions: string[];
  warningIssues: string[];
};

type FreshnessItem = {
  file: string;
  freshnessRisk: string;
  readyForFreshnessReview: boolean;
  reachableSources: number;
  warningIssues: string[];
};

type MatrixItem = {
  blockingIssues: string[];
  cluster: string;
  commandBoundary: LaunchPack["items"][number]["commandBoundary"];
  file: string;
  gapScore: number;
  launchReady: boolean;
  readiness: {
    freshnessReady: boolean | null;
    hasPublicLinkPath: boolean;
    integrityReady: boolean;
    preflightReady: boolean;
    queryReady: boolean | null;
    schemaReady: boolean;
    snippetReady: boolean;
    sourceReady: boolean;
  };
  readinessScore: number;
  reviewActions: string[];
  searchSignals: {
    exactQueryMatches: number | null;
    exactSeedMatches: number | null;
    matchedFamilies: number | null;
    searchQueries: number;
    seedFamilyMatches: number | null;
  };
  sourceSignals: {
    launchSourceTargets: number;
    reachableSources: number | null;
    sourceTargets: number | null;
  };
  title: string;
  warningIssues: string[];
};

function main() {
  const launchPack = readJson<LaunchPack>("content/automation/broad-first-coverage-launch-pack.json");
  const publicGapPreflight = readOptional<{ items: PublicGapPreflightItem[] }>("content/automation/public-coverage-gap-preflight.json");
  const sourceHealth = readOptional<{ files: SourceHealthFile[] }>("content/automation/source-target-health-audit.json");
  const snippets = readOptional<{ blockingItems: FileIssueItem[]; warningItems: FileIssueItem[] }>("content/automation/search-snippet-readiness-audit.json");
  const structuredData = readOptional<{ blockingItems: FileIssueItem[]; warningItems: FileIssueItem[] }>("content/automation/structured-data-readiness-audit.json");
  const internalLinks = readOptional<InternalLinkReport>("content/automation/internal-link-opportunity-audit.json");
  const queryMatch = readOptional<{ items: QueryMatchItem[] }>("content/automation/search-query-match-audit.json");
  const freshness = readOptional<{ items: FreshnessItem[] }>("content/automation/review-freshness-brief.json");
  const integrity = readOptional<{ blockingItems: FileIssueItem[] }>("content/automation/content-integrity-audit.json");

  const items = launchPack.items.map((item) =>
    toMatrixItem(item, {
      freshness,
      integrity,
      internalLinks,
      publicGapPreflight,
      queryMatch,
      snippets,
      sourceHealth,
      structuredData,
    }),
  );
  const blockingItems = items.filter((item) => item.blockingIssues.length > 0);
  const warningItems = items.filter((item) => item.warningIssues.length > 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoCreateArticles: false,
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only readiness matrix for first-coverage launch candidates. It cross-checks existing automation reports and never edits articles or changes review/publish state.",
      stopBefore: "Stop before mark:review and publish. Human approval is required for every file.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      launchPackGeneratedAt: launchPack.generatedAt,
      launchPackGuardrails: launchPack.guardrails,
      launchPackSummary: launchPack.summary,
      reportsUsed: [
        publicGapPreflight.path,
        sourceHealth.path,
        snippets.path,
        structuredData.path,
        internalLinks.path,
        queryMatch.path,
        freshness.path,
        integrity.path,
      ],
      trafficNote: "This matrix does not use measured traffic, rankings, impressions, clicks, or revenue data.",
    },
    summary: {
      blockingItems: blockingItems.length,
      commandBoundaries: items.filter(hasSafeCommandBoundary).length,
      firstCoverageItems: items.length,
      freshnessReadyItems: items.filter((item) => item.readiness.freshnessReady !== false).length,
      integrityReadyItems: items.filter((item) => item.readiness.integrityReady).length,
      itemsWithPublicLinkPath: items.filter((item) => item.readiness.hasPublicLinkPath).length,
      launchPackItems: launchPack.summary.clustersSelected,
      preflightReadyItems: items.filter((item) => item.readiness.preflightReady).length,
      queryReadyItems: items.filter((item) => item.readiness.queryReady !== false).length,
      schemaReadyItems: items.filter((item) => item.readiness.schemaReady).length,
      snippetReadyItems: items.filter((item) => item.readiness.snippetReady).length,
      sourceReadyItems: items.filter((item) => item.readiness.sourceReady).length,
      trafficDataAvailable: launchPack.summary.trafficDataAvailable,
      uniqueFiles: new Set(items.map((item) => item.file)).size,
      unsafeItems: items.filter((item) => !item.launchReady || !hasSafeCommandBoundary(item)).length,
      warningItems: warningItems.length,
      zeroPublicClusters: launchPack.summary.zeroPublicClusters,
    },
    blockingItems,
    warningItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "broad-first-coverage-readiness-matrix.json");
  const mdTarget = path.join(process.cwd(), "docs", "broad-first-coverage-readiness-matrix.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: payload.summary.unsafeItems === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (payload.summary.unsafeItems > 0) process.exitCode = 1;
}

function toMatrixItem(
  launchItem: LaunchPack["items"][number],
  reports: {
    freshness: SimpleReport<{ items: FreshnessItem[] }>;
    integrity: SimpleReport<{ blockingItems: FileIssueItem[] }>;
    internalLinks: SimpleReport<InternalLinkReport>;
    publicGapPreflight: SimpleReport<{ items: PublicGapPreflightItem[] }>;
    queryMatch: SimpleReport<{ items: QueryMatchItem[] }>;
    snippets: SimpleReport<{ blockingItems: FileIssueItem[]; warningItems: FileIssueItem[] }>;
    sourceHealth: SimpleReport<{ files: SourceHealthFile[] }>;
    structuredData: SimpleReport<{ blockingItems: FileIssueItem[]; warningItems: FileIssueItem[] }>;
  },
): MatrixItem {
  const file = normalizeFile(launchItem.file);
  const preflight = findByFile(reports.publicGapPreflight.data?.items, file);
  const source = findByFile(reports.sourceHealth.data?.files, file);
  const internalLinkItems = reports.internalLinks.data?.candidateItems || reports.internalLinks.data?.items || [];
  const link = findByFile(internalLinkItems, file);
  const query = findByFile(reports.queryMatch.data?.items, file);
  const fresh = findByFile(reports.freshness.data?.items, file);
  const snippetBlocking = findByFile(reports.snippets.data?.blockingItems, file);
  const snippetWarning = findByFile(reports.snippets.data?.warningItems, file);
  const schemaBlocking = findByFile(reports.structuredData.data?.blockingItems, file);
  const schemaWarning = findByFile(reports.structuredData.data?.warningItems, file);
  const integrityBlocking = findByFile(reports.integrity.data?.blockingItems, file);

  const readiness = {
    freshnessReady: fresh ? fresh.readyForFreshnessReview && fresh.reachableSources > 0 : null,
    hasPublicLinkPath: Boolean(link && !link.missingPublicLinkSuggestion && link.suggestions.length > 0),
    integrityReady: !integrityBlocking,
    preflightReady: Boolean(preflight?.readyForManualReview && preflight.structuredDataReady && preflight.blockingIssues.length === 0),
    queryReady: query ? query.readyForManualReview && query.blockingIssues.length === 0 : null,
    schemaReady: !schemaBlocking,
    snippetReady: !snippetBlocking,
    sourceReady: Boolean(source && source.sourceTargets > 0 && source.reachableSources > 0),
  };

  const blockingIssues = [
    ...launchItem.unsafeReasons.map(String),
    ...(preflight?.blockingIssues || []),
    ...(snippetBlocking?.issues || []),
    ...(schemaBlocking?.issues || []),
    ...(integrityBlocking?.issues || []),
    ...(query?.blockingIssues || []),
  ].filter(Boolean);

  const warningIssues = [
    ...(preflight?.warningIssues || []),
    ...(snippetWarning?.warnings || []),
    ...(schemaWarning?.warnings || []),
    ...(query?.warningIssues || []),
    ...(fresh?.warningIssues || []),
    preflight && preflight.linksToPublicArticles === 0 ? "candidate has no current links to public articles; use suggested public link during review" : "",
    readiness.sourceReady ? "" : "source-health report does not show a reachable source for this file; verify launch-pack source targets manually",
    readiness.hasPublicLinkPath ? "" : "no public internal-link suggestion found in the internal-link audit; add or document one during review",
    readiness.freshnessReady === false ? "freshness review is not ready" : "",
    preflight ? "" : "no public-gap preflight record; rely on launch-pack checks and run targeted preflight before approval",
    query ? "" : "no search-query-match record; rely on launch search queries and public-gap seed evidence",
    fresh ? "" : "no review-freshness record; rely on launch fact-check checklist",
  ].filter(Boolean);

  return {
    blockingIssues,
    cluster: launchItem.cluster,
    commandBoundary: launchItem.commandBoundary,
    file,
    gapScore: launchItem.gapScore,
    launchReady: launchItem.readyForFirstCoverageReview && launchItem.safeDraft && launchItem.unsafeReasons.length === 0,
    readiness,
    readinessScore: readinessScore(readiness, blockingIssues, warningIssues),
    reviewActions: reviewActionsFor({ fresh, launchItem, link, preflight, query, schemaWarning, snippetWarning, source, warningIssues }),
    searchSignals: {
      exactQueryMatches: query?.exactQueryMatches ?? null,
      exactSeedMatches: preflight?.exactSeedMatches ?? null,
      matchedFamilies: query?.matchedFamilies ?? null,
      searchQueries: launchItem.searchQueries.length,
      seedFamilyMatches: preflight?.seedFamilyMatches ?? null,
    },
    sourceSignals: {
      launchSourceTargets: launchItem.sourceTargets.length,
      reachableSources: source?.reachableSources ?? null,
      sourceTargets: source?.sourceTargets ?? null,
    },
    title: launchItem.title,
    warningIssues: [...new Set(warningIssues)],
  };
}

function reviewActionsFor(context: {
  fresh: FreshnessItem | undefined;
  launchItem: LaunchPack["items"][number];
  link: InternalLinkItem | undefined;
  preflight: PublicGapPreflightItem | undefined;
  query: QueryMatchItem | undefined;
  schemaWarning: FileIssueItem | undefined;
  snippetWarning: FileIssueItem | undefined;
  source: SourceHealthFile | undefined;
  warningIssues: string[];
}) {
  const actions = new Set<string>([
    "Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.",
    "Open the source targets and verify current product names, APIs, commands, limits, and version-sensitive claims.",
    "Remove unsupported traffic, ranking, revenue, cost-saving, latency, or reliability claims.",
    "Run mark:review only after explicit human approval; do not publish with --confirm from this matrix.",
  ]);
  if (!context.source || context.source.reachableSources === 0) actions.add("Add or replace official source targets before manual approval.");
  if (context.link?.suggestions?.length) actions.add("Choose one suggested public internal link during review or document why it should remain unlinked.");
  if (context.preflight?.exactSeedMatches === 0) actions.add("Decide whether title, description, or opening copy should naturally include one search-seed phrase.");
  if (context.query && context.query.exactQueryMatches === 0) actions.add("Improve exact query alignment without keyword stuffing.");
  if (context.snippetWarning?.warnings?.length) actions.add("Review snippet warnings for title, description, slug, and primary keyword alignment.");
  if (context.schemaWarning?.warnings?.length) actions.add("Review structured-data warnings before mark:review.");
  if (!context.fresh) actions.add("Use launch-pack freshness checklist because no separate freshness record exists for this file.");
  for (const warning of context.warningIssues.slice(0, 6)) actions.add(`Resolve or explicitly accept warning: ${warning}.`);
  for (const checklist of context.launchItem.humanFactCheckChecklist.slice(0, 4)) actions.add(String(checklist));
  return [...actions];
}

function readinessScore(readiness: MatrixItem["readiness"], blockingIssues: string[], warningIssues: string[]) {
  const values = Object.values(readiness);
  const ready = values.filter((value) => value !== false).length;
  return Math.max(0, ready * 10 - blockingIssues.length * 20 - warningIssues.length * 2);
}

function hasSafeCommandBoundary(item: { commandBoundary: LaunchPack["items"][number]["commandBoundary"] }) {
  return item.commandBoundary.markReviewAfterHumanApproval.includes("--confirm-human") && !item.commandBoundary.publishDryRunAfterReview.includes("--confirm") && item.commandBoundary.publishConfirm === "not-included";
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { note: string; stopBefore: string; trafficClaim: string };
  summary: Record<string, number | boolean>;
  blockingItems: MatrixItem[];
  warningItems: MatrixItem[];
  items: MatrixItem[];
}) {
  return [
    "# Broad First Coverage Readiness Matrix",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "## Guardrails",
    "",
    `- ${payload.guardrails.note}`,
    `- ${payload.guardrails.stopBefore}`,
    `- Traffic claim: ${payload.guardrails.trafficClaim}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Blocking Items",
    "",
    ...(payload.blockingItems.length ? payload.blockingItems.map((item) => `- ${item.file}: ${item.blockingIssues.join("; ")}`) : ["- none"]),
    "",
    "## Matrix",
    "",
    "| Score | Preflight | Source | Snippet | Schema | Link | Query | Freshness | Warnings | Cluster | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...payload.items.map(
      (item) =>
        `| ${item.readinessScore} | ${item.readiness.preflightReady} | ${item.readiness.sourceReady} | ${item.readiness.snippetReady} | ${item.readiness.schemaReady} | ${item.readiness.hasPublicLinkPath} | ${item.readiness.queryReady ?? "n/a"} | ${item.readiness.freshnessReady ?? "n/a"} | ${item.warningIssues.length} | ${item.cluster} | ${item.title} | ${item.file} |`,
    ),
    "",
    "## Review Actions",
    "",
    ...payload.items.flatMap((item) => [
      `### ${item.cluster}`,
      "",
      `- File: ${item.file}`,
      `- Title: ${item.title}`,
      `- Readiness score: ${item.readinessScore}`,
      `- Search signals: launchQueries=${item.searchSignals.searchQueries}, exactSeedMatches=${item.searchSignals.exactSeedMatches ?? "n/a"}, seedFamilies=${item.searchSignals.seedFamilyMatches ?? "n/a"}, exactQueryMatches=${item.searchSignals.exactQueryMatches ?? "n/a"}, queryFamilies=${item.searchSignals.matchedFamilies ?? "n/a"}`,
      `- Source signals: launchTargets=${item.sourceSignals.launchSourceTargets}, reportTargets=${item.sourceSignals.sourceTargets ?? "n/a"}, reachable=${item.sourceSignals.reachableSources ?? "n/a"}`,
      `- Mark review boundary: \`${item.commandBoundary.markReviewAfterHumanApproval}\``,
      `- Publish dry-run boundary: \`${item.commandBoundary.publishDryRunAfterReview}\``,
      "",
      "Actions:",
      "",
      ...item.reviewActions.map((action) => `- ${action}`),
      "",
      "Warnings:",
      "",
      ...(item.warningIssues.length ? item.warningIssues.map((warning) => `- ${warning}`) : ["- none"]),
      "",
    ]),
  ].join("\n");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function readOptional<T>(relativePath: string): SimpleReport<T> {
  const target = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(target)) return { data: null, path: relativePath };
  return { data: readJson<T>(relativePath), path: relativePath };
}

function findByFile<T extends { file: string }>(items: T[] | undefined, file: string) {
  return items?.find((item) => normalizeFile(item.file) === file);
}

function normalizeFile(file: string) {
  return file.replace(/\\/g, "/");
}

main();
