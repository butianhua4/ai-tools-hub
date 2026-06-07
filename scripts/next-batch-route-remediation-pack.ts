import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type CommandBoundary = {
  dryRunMarkReview?: string;
  markReviewAfterHumanApproval?: string;
  publishConfirm?: string;
  publishDryRun?: string;
};

type RouteItem = {
  actions?: string[];
  clearance?: unknown | null;
  commandBoundary?: CommandBoundary;
  file: string;
  freshness?: { freshnessRisk?: string; warningIssues?: string[] } | null;
  optimization?: { internalLink?: { title?: string; url?: string } | null; proposedDescription?: string; ready?: boolean } | null;
  priorityScore?: number;
  queryCoverage?: { queryCount?: number } | null;
  queryMatch?: { exactQueryMatches?: number; reviewSuggestions?: string[]; warningIssues?: string[] } | null;
  readyForHumanRouteReview?: boolean;
  routeWarnings?: string[];
  seoWarning?: { manualActions?: string[]; manualFixReady?: boolean; snippetWarnings?: string[]; schemaWarnings?: string[] } | null;
  sourcePack?: { officialSourceTargets?: string[]; riskReviewChecklist?: string[]; safeDraft?: boolean; status?: string } | null;
  title: string;
  unsafeReasons?: string[];
};

type NextBatchApprovalRoute = {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; trafficClaim: string };
  items?: RouteItem[];
  nextBatch: { batch: number; candidates: number; topic: string } | null;
  publishingBoundary: { currentPublicPublished: number; currentPublishableNow: number; publishConfirmCommandsIncluded: number };
  summary: {
    batchItems: number;
    itemsReadyForHumanRouteReview: number;
    publishConfirmCommandsIncluded: number;
    routeWarnings: number;
    trafficDataAvailable: boolean;
    unsafeItems: number;
  };
};

type RemediationItem = {
  actionCount: number;
  file: string;
  manualRemediationActions: string[];
  priorityScore: number;
  publishConfirm: "not-included";
  readyForRemediationReview: boolean;
  remediationKinds: string[];
  routeReady: boolean;
  routeWarnings: string[];
  title: string;
  unsafeReasons: string[];
};

function main() {
  const route = readJson<NextBatchApprovalRoute>("content/automation/next-batch-approval-route.json");
  const items = (route.items || [])
    .map(toRemediationItem)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.file.localeCompare(b.file));
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);
  const warningItems = items.filter((item) => item.routeWarnings.length > 0 || item.remediationKinds.length > 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note:
        "Read-only next batch route remediation pack. It turns route warnings into manual remediation tasks without editing articles or changing review/publish state.",
      stopBefore: "Stop before metadata edits, source edits, mark:review --confirm-human, and publish:articles --confirm.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      nextBatchApprovalRouteGeneratedAt: route.generatedAt,
      nextBatchApprovalRouteSummary: route.summary,
      trafficNote: "No measured traffic, ranking, impression, click, conversion, or revenue claim is made.",
    },
    nextBatch: route.nextBatch,
    publishingBoundary: route.publishingBoundary,
    summary: {
      actionItems: items.reduce((sum, item) => sum + item.actionCount, 0),
      batchItems: items.length,
      clearanceGapItems: items.filter((item) => item.remediationKinds.includes("clearance-gap")).length,
      copydeskGapItems: items.filter((item) => item.remediationKinds.includes("copydesk-gap")).length,
      freshnessWarningItems: items.filter((item) => item.remediationKinds.includes("freshness-warning")).length,
      itemsReadyForRemediationReview: items.filter((item) => item.readyForRemediationReview).length,
      publishConfirmCommandsIncluded: 0,
      queryWarningItems: items.filter((item) => item.remediationKinds.includes("query-warning")).length,
      routeWarnings: items.reduce((sum, item) => sum + item.routeWarnings.length, 0),
      seoWarningItems: items.filter((item) => item.remediationKinds.includes("seo-warning")).length,
      trafficDataAvailable: false,
      unsafeItems: unsafeItems.length,
      warningItems: warningItems.length,
    },
    unsafeItems,
    warningItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "next-batch-route-remediation-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "next-batch-route-remediation-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toRemediationItem(item: RouteItem): RemediationItem {
  const remediationKinds = remediationKindsFor(item);
  const unsafeReasons = unsafeReasonsFor(item);
  const actions = manualActionsFor(item, remediationKinds);
  return {
    actionCount: actions.length,
    file: item.file,
    manualRemediationActions: actions,
    priorityScore: (item.priorityScore || 0) + remediationKinds.length * 20 + (item.routeWarnings?.length || 0) * 10,
    publishConfirm: "not-included",
    readyForRemediationReview: unsafeReasons.length === 0,
    remediationKinds,
    routeReady: item.readyForHumanRouteReview === true,
    routeWarnings: item.routeWarnings || [],
    title: item.title,
    unsafeReasons,
  };
}

function remediationKindsFor(item: RouteItem) {
  const kinds: string[] = [];
  if (!item.clearance) kinds.push("clearance-gap");
  if (!item.optimization) kinds.push("copydesk-gap");
  if ((item.queryMatch?.warningIssues?.length || 0) > 0) kinds.push("query-warning");
  if (item.seoWarning) kinds.push("seo-warning");
  if ((item.freshness?.warningIssues?.length || 0) > 0) kinds.push("freshness-warning");
  if ((item.routeWarnings?.length || 0) > 0) kinds.push("route-warning");
  return dedupe(kinds);
}

function manualActionsFor(item: RouteItem, remediationKinds: string[]) {
  const actions = [
    "Keep status=draft, noindex=true, and humanReviewRequired=true while remediating this route.",
    "Use the route report as planning evidence only; do not run mark:review or publish from this pack.",
  ];
  if (remediationKinds.includes("clearance-gap")) {
    actions.push("Check why this file is not matched in the human approval clearance pack, then decide whether it should enter the next approval queue or remain queued.");
  }
  if (remediationKinds.includes("copydesk-gap")) {
    actions.push("Create or manually review copydesk guidance for title, meta description, opening answer, and public internal link before approval.");
  }
  if (item.optimization?.proposedDescription) actions.push("Review the existing proposed meta description and accept, rewrite, or reject it explicitly.");
  if (item.optimization?.internalLink?.url) {
    actions.push(`Review the suggested public internal link: ${item.optimization.internalLink.title || item.optimization.internalLink.url} (${item.optimization.internalLink.url}).`);
  }
  if (remediationKinds.includes("query-warning")) {
    actions.push(`Resolve or explicitly accept search wording warnings: ${(item.queryMatch?.warningIssues || []).slice(0, 3).join("; ")}.`);
    actions.push("Check whether the exact query can appear naturally in title, description, a heading, or the opening paragraph without keyword stuffing.");
  }
  if (item.seoWarning) {
    for (const action of (item.seoWarning.manualActions || []).slice(0, 4)) actions.push(`SEO remediation: ${action}`);
  }
  if (remediationKinds.includes("freshness-warning")) {
    actions.push("Re-open official sources for fast-changing tool, model, API, pricing, limit, and deployment claims before approval.");
  }
  if ((item.sourcePack?.officialSourceTargets?.length || 0) > 0) {
    actions.push(`Verify at least the first official source targets: ${item.sourcePack?.officialSourceTargets?.slice(0, 3).join(" | ")}.`);
  }
  actions.push(`After explicit human approval only: ${item.commandBoundary?.markReviewAfterHumanApproval || `npm run mark:review -- --file=${item.file} --confirm-human`}`);
  actions.push(`After review state only, publish dry-run without confirm: ${item.commandBoundary?.publishDryRun || `npm run publish:articles -- --file=${item.file}`}`);
  actions.push("Do not run publish:articles --confirm from this remediation pack.");
  return dedupe(actions);
}

function unsafeReasonsFor(item: RouteItem) {
  const reasons = [...(item.unsafeReasons || [])];
  if (item.readyForHumanRouteReview !== true) reasons.push("route item is not ready for human route review");
  if (item.commandBoundary?.publishConfirm !== "not-included") reasons.push("publish confirm command is included");
  if (item.commandBoundary?.publishDryRun?.includes("--confirm")) reasons.push("publish dry-run command includes --confirm");
  if (!item.commandBoundary?.markReviewAfterHumanApproval?.includes("--confirm-human")) reasons.push("mark review command is missing --confirm-human boundary");
  if ((item.sourcePack?.safeDraft ?? true) !== true) reasons.push("source pack item is not a safe draft");
  if (item.sourcePack?.status && item.sourcePack.status !== "draft") reasons.push(`source pack status is ${item.sourcePack.status}, expected draft`);
  return dedupe(reasons);
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string; trafficClaim: string };
  items: RemediationItem[];
  nextBatch: NextBatchApprovalRoute["nextBatch"];
  publishingBoundary: NextBatchApprovalRoute["publishingBoundary"];
  summary: Record<string, boolean | number>;
  unsafeItems: RemediationItem[];
  warningItems: RemediationItem[];
}) {
  const lines = [
    "# Next Batch Route Remediation Pack",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It converts next-batch route warnings into manual remediation tasks without editing articles or changing review/publish state.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Traffic claim: ${payload.guardrails.trafficClaim}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Publishing Boundary",
    "",
    `- Current public published: ${payload.publishingBoundary.currentPublicPublished}`,
    `- Current publishable now: ${payload.publishingBoundary.currentPublishableNow}`,
    `- Publish confirm commands included: ${payload.publishingBoundary.publishConfirmCommandsIncluded}`,
    "",
    "## Next Batch",
    "",
    payload.nextBatch ? `- Batch ${payload.nextBatch.batch}: ${payload.nextBatch.topic} (${payload.nextBatch.candidates} candidates)` : "- missing",
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...(payload.unsafeItems.length ? payload.unsafeItems.map((item) => `- ${item.file}: ${item.unsafeReasons.join("; ")}`) : ["- none"]),
    "",
    "## Warning Items",
    "",
    "| Ready | Score | Actions | Kinds | Warnings | Publish confirm | Title | File |",
    "| --- | ---: | ---: | --- | ---: | --- | --- | --- |",
    ...payload.warningItems.map(
      (item) =>
        `| ${item.readyForRemediationReview} | ${item.priorityScore} | ${item.actionCount} | ${item.remediationKinds.join(", ") || "none"} | ${item.routeWarnings.length} | ${item.publishConfirm} | ${item.title} | ${item.file} |`,
    ),
    "",
    "## Item Actions",
    "",
    ...payload.items.flatMap((item) => [
      `### ${item.title}`,
      "",
      `- File: ${item.file}`,
      `- Ready for remediation review: ${item.readyForRemediationReview}`,
      `- Route ready: ${item.routeReady}`,
      `- Remediation kinds: ${item.remediationKinds.join(", ") || "none"}`,
      `- Route warnings: ${item.routeWarnings.length ? item.routeWarnings.join("; ") : "none"}`,
      `- Publish confirm: ${item.publishConfirm}`,
      "",
      ...item.manualRemediationActions.map((action) => `- ${action}`),
      "",
    ]),
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}

main();
