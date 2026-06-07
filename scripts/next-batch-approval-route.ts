import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type BatchCandidate = {
  category?: string;
  cluster?: string;
  dryRunCommand?: string;
  file: string;
  opportunityReason?: string;
  opportunityScore?: number;
  publishBatch?: number;
  qualityScore?: number;
  reviewCommandAfterHumanApproval?: string;
  title: string;
};

type ManualReviewWorkbench = {
  generatedAt: string;
  guardrails: { autoMarkReview: boolean; autoPublish: boolean };
  liveSearch?: { ok?: boolean; publicCount?: number; sitemapUrlCount?: number };
  publishingBoundary: { publicPublished: number; publishableNow: number };
  reviewPlan: { nextBatch?: { batch: number; candidates: BatchCandidate[]; topic: string } };
};

type ReviewBatch = {
  batch: number;
  candidates?: BatchCandidate[];
  reviewFocus?: string[];
  searchQueries?: string[];
  topic: string;
  why?: string;
};

type ReviewBatchPlan = {
  generatedAt: string;
  totals: { plannedBatches: number; plannedCandidates: number };
  batches?: ReviewBatch[];
};

type SourcePackItem = {
  approvalChecklist?: string[];
  category?: string;
  factCheckQueries?: string[];
  file: string;
  internalLinks?: unknown[];
  lane?: string;
  lanePriorityScore?: number;
  officialSourceTargets?: string[];
  plannedBatch?: boolean;
  primaryKeyword?: string;
  qualityScore?: number;
  riskReviewChecklist?: string[];
  safeDraft?: boolean;
  searchIntent?: string;
  sourceNotesPresent?: boolean;
  status?: string;
  title: string;
  workflowAngles?: string[];
};

type ClearanceItem = {
  clearanceActions?: string[];
  commandBoundary?: {
    markReviewAfterHumanApproval?: string;
    publishConfirm?: string;
    publishDryRunAfterReview?: string;
  };
  copydeskBrief?: unknown | null;
  file: string;
  hasFailedSourceDecision?: boolean;
  readyForClearanceReview?: boolean;
  seoWarning?: unknown | null;
  sourceDecisions?: unknown[];
  title: string;
  unsafeReasons?: string[];
};

type HumanApprovalClearancePack = {
  generatedAt: string;
  summary: { publishConfirmCommandsIncluded: number; trafficDataAvailable: boolean; unsafeItems: number };
  items?: ClearanceItem[];
};

type SeoWarning = {
  file: string;
  manualActions?: string[];
  manualFixReady?: boolean;
  schemaWarnings?: string[];
  snippetWarnings?: string[];
  unsafeReasons?: string[];
};

type SeoWarningPack = {
  generatedAt: string;
  items?: SeoWarning[];
  summary: { trafficDataAvailable: boolean; unsafeItems: number };
};

type OptimizationBrief = {
  file: string;
  internalLink?: { title?: string; url?: string } | null;
  proposedDescription?: string;
  proposedOpeningAdditions?: string[];
  ready?: boolean;
  warningRemediation?: string[];
};

type ReviewOptimizationBrief = {
  generatedAt: string;
  nextBriefs?: OptimizationBrief[];
  summary: { readyBriefs: number; unsafeCommands: number };
};

type FreshnessItem = {
  file: string;
  freshnessRisk?: string;
  readyForFreshnessReview?: boolean;
  staleSensitiveChecks?: string[];
  warningIssues?: string[];
};

type ReviewFreshnessBrief = {
  generatedAt: string;
  items?: FreshnessItem[];
  summary: { blockedItems: number; readyItems: number; unsafeCommands: number };
};

type CollisionItem = {
  candidate?: { file?: string };
  file?: string;
  humanDecisionReady?: boolean;
  manualNextActions?: string[];
  warningIssues?: string[];
};

type ReviewCollisionDecisionPack = {
  generatedAt: string;
  items?: CollisionItem[];
  summary: { blockingItems: number; unsafeItems: number };
};

type QueryCoverageItem = {
  file: string;
  laneTitle?: string;
  primaryKeyword?: string;
  queryCount?: number;
  queryFamilies?: Record<string, string[]>;
  readyForManualReview?: boolean;
  wave?: number;
};

type SearchQueryCoverage = {
  generatedAt: string;
  items?: QueryCoverageItem[];
  summary: { readyItems: number; unsafeItems: number };
};

type QueryMatchItem = {
  descriptionHit?: boolean;
  exactQueryMatches?: number;
  file: string;
  matchedFamilies?: number;
  readyForManualReview?: boolean;
  reviewSuggestions?: string[];
  titleHit?: boolean;
  warningIssues?: string[];
};

type SearchQueryMatch = {
  generatedAt: string;
  items?: QueryMatchItem[];
  summary: { blockingItems: number; readyItems: number };
};

type RouteItem = {
  actions: string[];
  category: string;
  clearance: ClearanceItem | null;
  cluster: string;
  commandBoundary: {
    dryRunMarkReview: string;
    markReviewAfterHumanApproval: string;
    publishConfirm: "not-included";
    publishDryRun: string;
    stopBefore: string;
  };
  file: string;
  freshness: FreshnessItem | null;
  optimization: OptimizationBrief | null;
  opportunityReason: string;
  opportunityScore: number;
  priorityScore: number;
  queryCoverage: QueryCoverageItem | null;
  queryMatch: QueryMatchItem | null;
  readyForHumanRouteReview: boolean;
  routeWarnings: string[];
  seoWarning: SeoWarning | null;
  sourcePack: SourcePackItem | null;
  title: string;
  unsafeReasons: string[];
};

function main() {
  const workbench = readJson<ManualReviewWorkbench>("content/automation/manual-review-workbench.json");
  const reviewBatchPlan = readJson<ReviewBatchPlan>("content/automation/review-batch-plan.json");
  const sourcePack = readJson<{ generatedAt: string; items?: SourcePackItem[]; summary: { unsafeItems: number } }>(
    "content/automation/next-review-source-pack.json",
  );
  const clearancePack = readJson<HumanApprovalClearancePack>("content/automation/human-approval-clearance-pack.json");
  const seoWarningPack = readJson<SeoWarningPack>("content/automation/seo-warning-remediation-pack.json");
  const optimizationBrief = readJson<ReviewOptimizationBrief>("content/automation/review-optimization-brief.json");
  const freshnessBrief = readJson<ReviewFreshnessBrief>("content/automation/review-freshness-brief.json");
  const collisionPack = readJson<ReviewCollisionDecisionPack>("content/automation/review-collision-decision-pack.json");
  const queryCoverage = readJson<SearchQueryCoverage>("content/automation/search-query-coverage.json");
  const queryMatch = readJson<SearchQueryMatch>("content/automation/search-query-match-audit.json");

  const nextBatch = workbench.reviewPlan.nextBatch;
  const plannedBatch = reviewBatchPlan.batches?.find((batch) => batch.batch === nextBatch?.batch) || null;
  const sourceByFile = byFile(sourcePack.items || []);
  const clearanceByFile = byFile(clearancePack.items || []);
  const seoByFile = byFile(seoWarningPack.items || []);
  const optimizationByFile = byFile(optimizationBrief.nextBriefs || []);
  const freshnessByFile = byFile(freshnessBrief.items || []);
  const collisionByFile = new Map<string, CollisionItem[]>();
  for (const item of collisionPack.items || []) {
    const file = item.candidate?.file || item.file;
    if (file) collisionByFile.set(file, [...(collisionByFile.get(file) || []), item]);
  }
  const queryCoverageByFile = byFile(queryCoverage.items || []);
  const queryMatchByFile = byFile(queryMatch.items || []);

  const routeItems = (nextBatch?.candidates || []).map((candidate) =>
    toRouteItem(candidate, {
      clearance: clearanceByFile.get(candidate.file) || null,
      collisionItems: collisionByFile.get(candidate.file) || [],
      freshness: freshnessByFile.get(candidate.file) || null,
      optimization: optimizationByFile.get(candidate.file) || null,
      plannedBatch,
      queryCoverage: queryCoverageByFile.get(candidate.file) || null,
      queryMatch: queryMatchByFile.get(candidate.file) || null,
      seoWarning: seoByFile.get(candidate.file) || null,
      sourcePack: sourceByFile.get(candidate.file) || null,
    }),
  );
  const unsafeItems = routeItems.filter((item) => item.unsafeReasons.length > 0);
  const routeWarnings = routeItems.reduce((sum, item) => sum + item.routeWarnings.length, 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note:
        "Read-only next batch approval route. It turns the manual review workbench next batch into per-article approval steps without changing status, noindex, or publishing state.",
      stopBefore: "Stop before source edits, metadata edits, mark:review --confirm-human, and publish:articles --confirm.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      clearanceGeneratedAt: clearancePack.generatedAt,
      clearanceSummary: clearancePack.summary,
      collisionGeneratedAt: collisionPack.generatedAt,
      collisionSummary: collisionPack.summary,
      freshnessGeneratedAt: freshnessBrief.generatedAt,
      freshnessSummary: freshnessBrief.summary,
      nextReviewSourcePackGeneratedAt: sourcePack.generatedAt,
      nextReviewSourcePackSummary: sourcePack.summary,
      optimizationGeneratedAt: optimizationBrief.generatedAt,
      optimizationSummary: optimizationBrief.summary,
      queryCoverageGeneratedAt: queryCoverage.generatedAt,
      queryCoverageSummary: queryCoverage.summary,
      queryMatchGeneratedAt: queryMatch.generatedAt,
      queryMatchSummary: queryMatch.summary,
      reviewBatchPlanGeneratedAt: reviewBatchPlan.generatedAt,
      reviewBatchPlanTotals: reviewBatchPlan.totals,
      workbenchGeneratedAt: workbench.generatedAt,
      trafficNote: "No measured traffic, ranking, impression, click, conversion, or revenue claim is made.",
    },
    publishingBoundary: {
      currentPublicPublished: workbench.publishingBoundary.publicPublished,
      currentPublishableNow: workbench.publishingBoundary.publishableNow,
      publishConfirmCommandsIncluded: 0,
    },
    nextBatch: nextBatch
      ? {
          batch: nextBatch.batch,
          candidates: nextBatch.candidates.length,
          topic: nextBatch.topic,
          plannedBatchTopic: plannedBatch?.topic || null,
        }
      : null,
    summary: {
      actionItems: routeItems.reduce((sum, item) => sum + item.actions.length, 0),
      batchItems: routeItems.length,
      clearanceMatchedItems: routeItems.filter((item) => item.clearance).length,
      commandBoundaries: routeItems.filter(
        (item) =>
          item.commandBoundary.markReviewAfterHumanApproval.includes("--confirm-human") &&
          !item.commandBoundary.publishDryRun.includes("--confirm") &&
          item.commandBoundary.publishConfirm === "not-included",
      ).length,
      copydeskMatchedItems: routeItems.filter((item) => item.optimization).length,
      currentPublicPublished: workbench.publishingBoundary.publicPublished,
      currentPublishableNow: workbench.publishingBoundary.publishableNow,
      freshnessMatchedItems: routeItems.filter((item) => item.freshness).length,
      itemsReadyForHumanRouteReview: routeItems.filter((item) => item.readyForHumanRouteReview).length,
      plannedBatchCandidates: plannedBatch?.candidates?.length || 0,
      publishConfirmCommandsIncluded: 0,
      queryCoverageMatchedItems: routeItems.filter((item) => item.queryCoverage).length,
      queryMatchWarningItems: routeItems.filter((item) => (item.queryMatch?.warningIssues?.length || 0) > 0).length,
      routeWarnings,
      seoWarningItems: routeItems.filter((item) => item.seoWarning).length,
      sourcePackMatchedItems: routeItems.filter((item) => item.sourcePack).length,
      trafficDataAvailable: false,
      unsafeItems: unsafeItems.length,
    },
    unsafeItems,
    items: routeItems,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "next-batch-approval-route.json");
  const mdTarget = path.join(process.cwd(), "docs", "next-batch-approval-route.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toRouteItem(
  candidate: BatchCandidate,
  context: {
      clearance: ClearanceItem | null;
      collisionItems: CollisionItem[];
      freshness: FreshnessItem | null;
      optimization: OptimizationBrief | null;
      plannedBatch: ReviewBatch | null;
      queryCoverage: QueryCoverageItem | null;
      queryMatch: QueryMatchItem | null;
      seoWarning: SeoWarning | null;
      sourcePack: SourcePackItem | null;
  },
): RouteItem {
  const routeWarnings = routeWarningsFor(context);
  const unsafeReasons = unsafeReasonsFor(candidate, context);
  const dryRunMarkReview = candidate.dryRunCommand || `npm run mark:review -- --file=${candidate.file}`;
  const markReviewAfterHumanApproval =
    candidate.reviewCommandAfterHumanApproval || `npm run mark:review -- --file=${candidate.file} --confirm-human`;
  const publishDryRun = context.clearance?.commandBoundary?.publishDryRunAfterReview || `npm run publish:articles -- --file=${candidate.file}`;
  return {
    actions: actionsFor(candidate, context, routeWarnings),
    category: candidate.category || context.sourcePack?.category || "uncategorized",
    clearance: context.clearance,
    cluster: candidate.cluster || context.sourcePack?.lane || "unclustered",
    commandBoundary: {
      dryRunMarkReview,
      markReviewAfterHumanApproval,
      publishConfirm: "not-included",
      publishDryRun: publishDryRun.replace(/\s+--confirm\b/g, ""),
      stopBefore: "A human must approve exact content/source/metadata changes and then explicitly approve mark:review --confirm-human.",
    },
    file: candidate.file,
    freshness: context.freshness,
    optimization: context.optimization,
    opportunityReason: candidate.opportunityReason || "",
    opportunityScore: candidate.opportunityScore || 0,
    priorityScore: priorityScoreFor(candidate, context, routeWarnings),
    queryCoverage: context.queryCoverage,
    queryMatch: context.queryMatch,
    readyForHumanRouteReview: unsafeReasons.length === 0,
    routeWarnings,
    seoWarning: context.seoWarning,
    sourcePack: context.sourcePack,
    title: candidate.title,
    unsafeReasons,
  };
}

function actionsFor(
  candidate: BatchCandidate,
  context: {
    clearance: ClearanceItem | null;
    collisionItems: CollisionItem[];
    freshness: FreshnessItem | null;
    optimization: OptimizationBrief | null;
    plannedBatch: ReviewBatch | null;
    queryCoverage: QueryCoverageItem | null;
    queryMatch: QueryMatchItem | null;
    seoWarning: SeoWarning | null;
    sourcePack: SourcePackItem | null;
  },
  routeWarnings: string[],
) {
  const actions = [
    "Confirm the article still targets the next batch topic before any status change.",
    "Verify the opening section answers the likely user search query directly.",
    "Keep the article draft, noindex, and humanReviewRequired until approval.",
  ];
  if (context.sourcePack?.officialSourceTargets?.length) {
    actions.push(`Verify official sources before review: ${context.sourcePack.officialSourceTargets.slice(0, 3).join(" | ")}.`);
  }
  if (context.sourcePack?.factCheckQueries?.length) {
    actions.push(`Run manual fact checks for: ${context.sourcePack.factCheckQueries.slice(0, 3).join(" | ")}.`);
  }
  if (context.queryCoverage?.queryCount) {
    actions.push(`Use ${context.queryCoverage.queryCount} query variants to check title, description, headings, and first-screen answer fit.`);
  }
  if ((context.queryMatch?.warningIssues?.length || 0) > 0) {
    actions.push(`Search wording warnings: ${context.queryMatch?.warningIssues?.slice(0, 3).join("; ")}.`);
  }
  if (context.seoWarning?.manualActions?.length) {
    actions.push(`SEO manual actions: ${context.seoWarning.manualActions.slice(0, 3).join(" | ")}.`);
  }
  if (context.optimization?.proposedDescription) actions.push("Review copydesk meta description proposal before approving the draft.");
  if (context.optimization?.internalLink?.url) {
    actions.push(`Review public internal link path: ${context.optimization.internalLink.title || context.optimization.internalLink.url}.`);
  }
  if (context.freshness?.staleSensitiveChecks?.length) {
    actions.push(`Freshness checks: ${context.freshness.staleSensitiveChecks.slice(0, 3).join(" | ")}.`);
  }
  if (context.collisionItems.length) {
    actions.push("Review collision decision notes so this draft does not duplicate an existing queued article.");
  }
  if (routeWarnings.length) actions.push(`Resolve route warnings before approval: ${routeWarnings.slice(0, 3).join("; ")}.`);
  actions.push(`After human approval only: npm run mark:review -- --file=${candidate.file} --confirm-human`);
  actions.push(`After review state only, dry-run publish without confirm: npm run publish:articles -- --file=${candidate.file}`);
  actions.push("Do not run publish:articles --confirm from this route.");
  return dedupe(actions);
}

function priorityScoreFor(
  candidate: BatchCandidate,
  context: {
    clearance: ClearanceItem | null;
    collisionItems: CollisionItem[];
    freshness: FreshnessItem | null;
    optimization: OptimizationBrief | null;
    queryCoverage: QueryCoverageItem | null;
    queryMatch: QueryMatchItem | null;
    seoWarning: SeoWarning | null;
    sourcePack: SourcePackItem | null;
  },
  routeWarnings: string[],
) {
  return (
    100 +
    (candidate.opportunityScore || 0) +
    (context.sourcePack?.lanePriorityScore || 0) +
    (context.queryCoverage?.queryCount || 0) +
    (context.clearance ? 30 : 0) +
    (context.optimization ? 15 : 0) +
    (context.seoWarning ? 10 : 0) -
    routeWarnings.length * 8 -
    context.collisionItems.length * 5
  );
}

function routeWarningsFor(context: {
  clearance: ClearanceItem | null;
  collisionItems: CollisionItem[];
  freshness: FreshnessItem | null;
  optimization: OptimizationBrief | null;
  queryCoverage: QueryCoverageItem | null;
  queryMatch: QueryMatchItem | null;
  seoWarning: SeoWarning | null;
  sourcePack: SourcePackItem | null;
}) {
  const warnings: string[] = [];
  if (!context.clearance) warnings.push("not yet matched in human approval clearance pack");
  if (!context.optimization) warnings.push("no copydesk optimization brief matched");
  if (!context.freshness) warnings.push("no freshness brief matched");
  if ((context.queryMatch?.warningIssues?.length || 0) > 0) warnings.push("search query match warning exists");
  if (context.seoWarning && context.seoWarning.manualFixReady !== true) warnings.push("SEO warning is not marked manual-fix-ready");
  if (context.collisionItems.length) warnings.push("collision decision item exists");
  return dedupe(warnings);
}

function unsafeReasonsFor(
  candidate: BatchCandidate,
  context: {
    clearance: ClearanceItem | null;
    collisionItems: CollisionItem[];
    freshness: FreshnessItem | null;
    plannedBatch: ReviewBatch | null;
    queryCoverage: QueryCoverageItem | null;
    queryMatch: QueryMatchItem | null;
    seoWarning: SeoWarning | null;
    sourcePack: SourcePackItem | null;
  },
) {
  const reasons: string[] = [];
  if (!context.plannedBatch?.candidates?.some((item) => item.file === candidate.file)) reasons.push("candidate is not in the matching planned review batch");
  if (!context.sourcePack) reasons.push("missing next review source pack item");
  if (context.sourcePack && context.sourcePack.safeDraft !== true) reasons.push("source pack item is not a safe draft");
  if (context.sourcePack && context.sourcePack.status !== "draft") reasons.push(`source pack status is ${context.sourcePack.status}, expected draft`);
  if ((context.sourcePack?.qualityScore || candidate.qualityScore || 0) < 100) reasons.push("qualityScore below 100");
  if ((context.sourcePack?.officialSourceTargets?.length || 0) === 0) reasons.push("missing official source targets");
  if ((context.sourcePack?.factCheckQueries?.length || 0) === 0) reasons.push("missing fact-check queries");
  if ((context.sourcePack?.riskReviewChecklist?.length || 0) === 0) reasons.push("missing risk review checklist");
  if (context.clearance && context.clearance.readyForClearanceReview !== true) reasons.push("clearance pack item is not ready");
  if ((context.clearance?.unsafeReasons?.length || 0) > 0) reasons.push("clearance pack unsafe reasons exist");
  if ((context.seoWarning?.unsafeReasons?.length || 0) > 0) reasons.push("SEO warning unsafe reasons exist");
  if (context.freshness && context.freshness.readyForFreshnessReview !== true) reasons.push("freshness item is not ready");
  if (context.queryCoverage && context.queryCoverage.readyForManualReview !== true) reasons.push("query coverage item is not ready");
  if (context.queryMatch && context.queryMatch.readyForManualReview !== true) reasons.push("query match item is not ready");
  if (context.collisionItems.some((item) => item.humanDecisionReady !== true)) reasons.push("collision decision item is not human-decision-ready");
  if (!candidate.reviewCommandAfterHumanApproval?.includes("--confirm-human")) reasons.push("human approval review command missing --confirm-human");
  if (candidate.dryRunCommand?.includes("--confirm-human")) reasons.push("dry-run mark review command includes --confirm-human");
  return dedupe(reasons);
}

function byFile<T extends { file: string }>(items: T[]) {
  return new Map(items.map((item) => [item.file, item]));
}

function dedupe(items: string[]) {
  return Array.from(new Set(items));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string; trafficClaim: string };
  items: RouteItem[];
  nextBatch: { batch: number; candidates: number; plannedBatchTopic: string | null; topic: string } | null;
  publishingBoundary: { currentPublicPublished: number; currentPublishableNow: number; publishConfirmCommandsIncluded: number };
  summary: Record<string, boolean | number>;
  unsafeItems: RouteItem[];
}) {
  const lines = [
    "# Next Batch Approval Route",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It converts the manual review workbench next batch into per-article approval routes without editing articles or changing publishing state.",
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
    payload.nextBatch
      ? `- Batch ${payload.nextBatch.batch}: ${payload.nextBatch.topic} (${payload.nextBatch.candidates} candidates)`
      : "- missing",
    payload.nextBatch?.plannedBatchTopic ? `- Planned batch topic: ${payload.nextBatch.plannedBatchTopic}` : "- Planned batch topic: missing",
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...(payload.unsafeItems.length ? payload.unsafeItems.map((item) => `- ${item.file}: ${item.unsafeReasons.join("; ")}`) : ["- none"]),
    "",
    "## Route Items",
    "",
    "| Ready | Score | Actions | Warnings | Sources | Queries | SEO | Freshness | Copydesk | Title | File |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |",
    ...payload.items.map(
      (item) =>
        `| ${item.readyForHumanRouteReview} | ${item.priorityScore} | ${item.actions.length} | ${item.routeWarnings.length} | ${item.sourcePack?.officialSourceTargets?.length || 0} | ${item.queryCoverage?.queryCount || 0} | ${Boolean(item.seoWarning)} | ${item.freshness?.freshnessRisk || "none"} | ${Boolean(item.optimization)} | ${item.title} | ${item.file} |`,
    ),
    "",
    "## Item Actions",
    "",
    ...payload.items.flatMap((item) => [
      `### ${item.title}`,
      "",
      `- File: ${item.file}`,
      `- Ready for human route review: ${item.readyForHumanRouteReview}`,
      `- Priority score: ${item.priorityScore}`,
      `- Cluster: ${item.cluster}`,
      `- Category: ${item.category}`,
      `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
      `- Dry-run mark review: ${item.commandBoundary.dryRunMarkReview}`,
      `- Human approval mark review: ${item.commandBoundary.markReviewAfterHumanApproval}`,
      `- Publish dry-run: ${item.commandBoundary.publishDryRun}`,
      `- Route warnings: ${item.routeWarnings.length ? item.routeWarnings.join("; ") : "none"}`,
      "",
      ...item.actions.map((action) => `- ${action}`),
      "",
    ]),
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}

main();
