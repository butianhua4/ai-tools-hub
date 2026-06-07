import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type Progress = {
  items: Array<{
    file: string;
    lane: string;
    nextManualSession: { categories: string[]; name: string; proofRequired: string[] } | null;
    openCategories: string[];
    primaryQuery: string;
    readyForHumanApprovalAfterRepair: boolean;
    routeRank: number;
    title: string;
  }>;
  summary: {
    filesTracked: number;
    openCategories: number;
    publishConfirmCommandsIncluded: number;
    routeSessions: number;
    trafficDataAvailable: boolean;
    unsafeItems: number;
  };
};

type RepairRoute = {
  routeItems: Array<{
    file: string;
    manualOnlyCommands: { markReviewAfterExplicitApproval: string; rerunAfterRepair: string[] };
    publishConfirm: "not-included";
    repairSessions: Array<{ categories: string[]; name: string; proofRequired: string[] }>;
    title: string;
    unsafeReasons: string[];
  }>;
  summary: { filesRouted: number; publishConfirmCommandsIncluded: number; routeSessions: number; trafficDataAvailable: boolean; unsafeItems: number };
};

type ApprovalRemediation = {
  items: Array<{
    file: string;
    humanChecklist: string[];
    internalLinkFixes: string[];
    remediationReasons: string[];
    searchFixes: string[];
    sourceChecks: string[];
    sourceUrlFixes: string[];
    title: string;
    unsafeReasons: string[];
  }>;
  summary: { items: number; sourceUrlFixActions: number; unsafeItems: number };
};

type SourceTargetRemediation = {
  items: Array<{
    affectedFiles: string[];
    affectedTitles: string[];
    finalUrl?: string;
    humanChecklist: string[];
    kind: "failed-url" | "redirected-url";
    manualActions: string[];
    manualFixReady: boolean;
    replacementCandidates: Array<{ reason: string; sourceType: string; title: string; url: string }>;
    replacementPlan: string[];
    status?: number;
    unsafeReasons: string[];
    url: string;
  }>;
  summary: { failedUrlItems: number; redirectedUrlItems: number; unsafeItems: number };
};

type SourceVerification = {
  items: Array<{
    factCheckQueries: string[];
    file: string;
    readyForHumanReview: boolean;
    reachableSources: number;
    riskReviewChecklist: string[];
  }>;
  summary: { items: number; itemsWithReachableSources: number; unsafeItems: number };
};

type SearchIntent = {
  items: Array<{
    file: string;
    reviewSuggestions: string[];
    searchWeaknesses: string[];
  }>;
  summary: { items: number; searchWeakItems: number; unsafeItems: number };
};

type InternalLinks = {
  items: Array<{
    file: string;
    linksToPublicArticles: number;
    suggestions: Array<{ reason: string; score: number; title: string; url: string }>;
  }>;
  summary: { items: number; itemsMissingCurrentPublicLink: number; unsafeItems: number };
};

type SessionPackItem = {
  approvalBoundary: {
    markReviewAfterExplicitApproval: string;
    publishConfirm: "not-included";
    rerunAfterRepair: string[];
    stopBefore: string;
  };
  copydeskActions: string[];
  file: string;
  internalLinkActions: string[];
  lane: string;
  nextManualSession: { categories: string[]; name: string; proofRequired: string[] };
  openCategories: string[];
  primaryQuery: string;
  readyForHumanApprovalAfterRepair: boolean;
  routeRank: number;
  searchActions: string[];
  sourceReviewActions: string[];
  sourceTargetUrlItems: SourceTargetRemediation["items"];
  sourceUrlActions: string[];
  title: string;
  unsafeReasons: string[];
};

function main() {
  const progress = readJson<Progress>("content/automation/human-approval-repair-progress.json");
  const route = readJson<RepairRoute>("content/automation/human-approval-repair-route.json");
  const remediation = readJson<ApprovalRemediation>("content/automation/autopilot-approval-remediation-pack.json");
  const sourceTargets = readJson<SourceTargetRemediation>("content/automation/source-target-remediation-pack.json");
  const sourceVerification = readJson<SourceVerification>("content/automation/autopilot-source-verification-brief.json");
  const searchIntent = readJson<SearchIntent>("content/automation/autopilot-search-intent-brief.json");
  const internalLinks = readJson<InternalLinks>("content/automation/autopilot-internal-link-brief.json");

  const routeByFile = byFile(route.routeItems);
  const remediationByFile = byFile(remediation.items);
  const sourceVerificationByFile = byFile(sourceVerification.items);
  const searchByFile = byFile(searchIntent.items);
  const internalByFile = byFile(internalLinks.items);

  const items = progress.items
    .filter((item) => item.nextManualSession && item.openCategories.length > 0)
    .map((item) =>
      buildSessionItem(
        item,
        routeByFile.get(item.file),
        remediationByFile.get(item.file),
        sourceTargets.items.filter((sourceItem) => sourceItem.affectedFiles.includes(item.file)),
        sourceVerificationByFile.get(item.file),
        searchByFile.get(item.file),
        internalByFile.get(item.file),
      ),
    )
    .sort((a, b) => b.routeRank - a.routeRank || b.sourceUrlActions.length - a.sourceUrlActions.length);
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only repair session pack. It turns the current repair progress into concrete manual repair sessions without editing drafts or changing article state.",
      stopBefore: "Use the pack to perform manual source/search/link/copydesk repair. Mark review only after explicit human approval per file.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      internalLinkItems: internalLinks.summary.items,
      internalLinkUnsafeItems: internalLinks.summary.unsafeItems,
      progressFilesTracked: progress.summary.filesTracked,
      progressOpenCategories: progress.summary.openCategories,
      progressUnsafeItems: progress.summary.unsafeItems,
      remediationItems: remediation.summary.items,
      remediationSourceUrlFixActions: remediation.summary.sourceUrlFixActions,
      remediationUnsafeItems: remediation.summary.unsafeItems,
      routeFiles: route.summary.filesRouted,
      routeSessions: route.summary.routeSessions,
      routeUnsafeItems: route.summary.unsafeItems,
      searchIntentItems: searchIntent.summary.items,
      searchIntentUnsafeItems: searchIntent.summary.unsafeItems,
      sourceTargetFailedUrlItems: sourceTargets.summary.failedUrlItems,
      sourceTargetRedirectedUrlItems: sourceTargets.summary.redirectedUrlItems,
      sourceTargetUnsafeItems: sourceTargets.summary.unsafeItems,
      sourceVerificationItems: sourceVerification.summary.items,
      sourceVerificationUnsafeItems: sourceVerification.summary.unsafeItems,
    },
    summary: {
      copydeskActions: items.reduce((sum, item) => sum + item.copydeskActions.length, 0),
      filesWithNextSession: items.length,
      internalLinkActions: items.reduce((sum, item) => sum + item.internalLinkActions.length, 0),
      publishConfirmCommandsIncluded: 0,
      readyForHumanApprovalAfterRepair: items.filter((item) => item.readyForHumanApprovalAfterRepair).length,
      searchActions: items.reduce((sum, item) => sum + item.searchActions.length, 0),
      sessionActions: items.reduce(
        (sum, item) => sum + item.sourceUrlActions.length + item.sourceReviewActions.length + item.searchActions.length + item.internalLinkActions.length + item.copydeskActions.length,
        0,
      ),
      sourceReviewActions: items.reduce((sum, item) => sum + item.sourceReviewActions.length, 0),
      sourceTargetUrlItems: items.reduce((sum, item) => sum + item.sourceTargetUrlItems.length, 0),
      sourceUrlActions: items.reduce((sum, item) => sum + item.sourceUrlActions.length, 0),
      trafficDataAvailable: progress.summary.trafficDataAvailable,
      unsafeItems: unsafeItems.length,
    },
    unsafeItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "human-approval-repair-session-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "human-approval-repair-session-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function buildSessionItem(
  progress: Progress["items"][number],
  route: RepairRoute["routeItems"][number] | undefined,
  remediation: ApprovalRemediation["items"][number] | undefined,
  sourceTargetUrlItems: SourceTargetRemediation["items"],
  sourceVerification: SourceVerification["items"][number] | undefined,
  searchIntent: SearchIntent["items"][number] | undefined,
  internalLinks: InternalLinks["items"][number] | undefined,
): SessionPackItem {
  const session = progress.nextManualSession || { categories: progress.openCategories, name: "manual repair follow-up", proofRequired: [] };
  const active = new Set(session.categories);
  const sourceUrlActions = active.has("source-url") ? dedupe([...(remediation?.sourceUrlFixes || []), ...sourceTargetUrlItems.flatMap((item) => item.manualActions), ...sourceTargetUrlItems.flatMap((item) => item.replacementPlan)]) : [];
  const sourceReviewActions = active.has("source-review")
    ? dedupe([
        ...(remediation?.sourceChecks || []),
        ...(sourceVerification?.riskReviewChecklist || []).slice(0, 8),
        ...(sourceVerification?.factCheckQueries || []).slice(0, 8).map((query) => `Fact-check query: ${query}`),
      ])
    : [];
  const searchActions = active.has("search-intent") ? dedupe([...(remediation?.searchFixes || []), ...(searchIntent?.searchWeaknesses || []).map((weakness) => `Resolve search weakness: ${weakness}.`), ...(searchIntent?.reviewSuggestions || [])]) : [];
  const internalLinkActions = active.has("internal-link") ? dedupe([...(remediation?.internalLinkFixes || []), ...(internalLinks?.suggestions || []).slice(0, 5).map((suggestion) => `Review public link suggestion: ${suggestion.title} (${suggestion.url}) - ${suggestion.reason}.`)]) : [];
  const copydeskActions = active.has("copydesk")
    ? dedupe([...(remediation?.humanChecklist || []).filter((action) => action.toLowerCase().includes("copydesk") || action.toLowerCase().includes("warning")), ...(remediation?.remediationReasons || []).filter((reason) => reason.toLowerCase().includes("copydesk") || reason.toLowerCase().includes("warning")).map((reason) => `Resolve or explicitly accept: ${reason}.`)])
    : [];
  const unsafeReasons = [
    route ? "" : "route item is missing",
    route?.publishConfirm === "not-included" ? "" : "route includes publish confirmation",
    route?.manualOnlyCommands.markReviewAfterExplicitApproval.includes("--confirm-human") ? "" : "manual mark-review command lacks --confirm-human",
    route?.unsafeReasons.length === 0 ? "" : `route has unsafe reasons: ${route?.unsafeReasons.join("; ")}`,
    session.categories.length > 0 ? "" : "next manual session has no categories",
    sourceUrlActions.length + sourceReviewActions.length + searchActions.length + internalLinkActions.length + copydeskActions.length > 0 ? "" : "next manual session has no concrete actions",
  ].filter(Boolean);

  return {
    approvalBoundary: {
      markReviewAfterExplicitApproval: route?.manualOnlyCommands.markReviewAfterExplicitApproval || "missing",
      publishConfirm: "not-included",
      rerunAfterRepair: route?.manualOnlyCommands.rerunAfterRepair || [],
      stopBefore: "Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.",
    },
    copydeskActions,
    file: progress.file,
    internalLinkActions,
    lane: progress.lane,
    nextManualSession: session,
    openCategories: progress.openCategories,
    primaryQuery: progress.primaryQuery,
    readyForHumanApprovalAfterRepair: progress.readyForHumanApprovalAfterRepair,
    routeRank: progress.routeRank,
    searchActions,
    sourceReviewActions,
    sourceTargetUrlItems,
    sourceUrlActions,
    title: progress.title,
    unsafeReasons,
  };
}

function byFile<T extends { file: string }>(items: T[]) {
  return new Map(items.map((item) => [item.file, item]));
}

function dedupe(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string; trafficClaim: string };
  items: SessionPackItem[];
  sourceEvidence: Record<string, number>;
  summary: Record<string, number | boolean>;
  unsafeItems: SessionPackItem[];
}) {
  return [
    "# Human Approval Repair Session Pack",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It packages the next manual repair session for each routed file and stops before article edits, mark:review, or publishing.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Traffic claim: ${payload.guardrails.trafficClaim}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Source Evidence",
    "",
    ...Object.entries(payload.sourceEvidence).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...sessionTable(payload.unsafeItems),
    "",
    "## Next Sessions",
    "",
    ...sessionTable(payload.items),
    "",
    "## Session Details",
    "",
    ...payload.items.flatMap(sessionSection),
    "",
  ].join("\n");
}

function sessionTable(items: SessionPackItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Rank | Session | Open categories | Source URL actions | Source URL items | Search actions | Link actions | Copydesk actions | Title | File |",
    "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.routeRank} | ${item.nextManualSession.name} | ${item.openCategories.join(", ") || "none"} | ${item.sourceUrlActions.length} | ${item.sourceTargetUrlItems.length} | ${item.searchActions.length} | ${item.internalLinkActions.length} | ${item.copydeskActions.length} | ${escapeMd(item.title)} | ${item.file} |`,
    ),
  ];
}

function sessionSection(item: SessionPackItem) {
  return [
    `### ${escapeMd(item.title)}`,
    "",
    `- File: ${item.file}`,
    `- Session: ${item.nextManualSession.name}`,
    `- Categories: ${item.nextManualSession.categories.join(", ")}`,
    `- Open categories: ${item.openCategories.join(", ")}`,
    `- Mark review after explicit approval: \`${item.approvalBoundary.markReviewAfterExplicitApproval}\``,
    `- Stop before: ${item.approvalBoundary.stopBefore}`,
    "",
    "Source URL actions:",
    "",
    ...listOrNone(item.sourceUrlActions),
    "",
    "Source target URL items:",
    "",
    ...(item.sourceTargetUrlItems.length
      ? item.sourceTargetUrlItems.map((source) => `- [${source.kind}] ${source.url}${source.finalUrl ? ` -> ${source.finalUrl}` : ""}; replacements=${source.replacementCandidates.length}`)
      : ["- none"]),
    "",
    "Source review actions:",
    "",
    ...listOrNone(item.sourceReviewActions),
    "",
    "Search actions:",
    "",
    ...listOrNone(item.searchActions),
    "",
    "Internal-link actions:",
    "",
    ...listOrNone(item.internalLinkActions),
    "",
    "Copydesk actions:",
    "",
    ...listOrNone(item.copydeskActions),
    "",
    "Proof required:",
    "",
    ...listOrNone(item.nextManualSession.proofRequired),
    "",
  ];
}

function listOrNone(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`) : ["- none"];
}

function escapeMd(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

main();
