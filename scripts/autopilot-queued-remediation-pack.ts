import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type CommandBoundary = {
  markReviewAfterHumanApproval: string;
  publishConfirm: "not-included";
  publishDryRunAfterReview: string;
  stopBefore?: string;
};

type QueuedPlaybookItem = {
  actionItems: string[];
  commandBoundary: CommandBoundary;
  factCheckQueries: string[];
  file: string;
  internalLinkSuggestions: Array<{ title: string; url: string }>;
  manualOnlyCommands: CommandBoundary;
  primaryKeyword: string;
  readyForHumanReview: boolean;
  riskReviewChecklist: string[];
  safeDraft: boolean;
  searchActions: string[];
  searchQueries: string[];
  sourceActions: string[];
  sourceEvidence: string[];
  sourceTargets: string[];
  sprintOrder: number;
  title: string;
  warnings?: string[];
};

type QueuedPlaybookBrief = {
  generatedAt: string;
  guardrails: {
    autoEditArticles: boolean;
    autoMarkReview: boolean;
    autoPublish: boolean;
  };
  items: QueuedPlaybookItem[];
  sourceEvidence: {
    queuedForPlaybook: number;
    sprintBoardUnsafeItems: number;
  };
  summary: {
    items: number;
    readyItems: number;
    safeDraftItems: number;
    unsafeItems: number;
  };
};

type RemediationItem = {
  commandBoundary: CommandBoundary;
  file: string;
  humanChecklist: string[];
  internalLinkFixes: string[];
  manualFixReady: boolean;
  remediationReasons: string[];
  riskChecks: string[];
  searchFixes: string[];
  sourceChecks: string[];
  sourceEvidence: string[];
  sprintOrder: number;
  title: string;
  unsafeReasons: string[];
};

function main() {
  const queued = readJson<QueuedPlaybookBrief>("content/automation/autopilot-queued-playbook-brief.json");
  const items = queued.items.map(toRemediationItem);
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only remediation pack for queued playbook items. It consolidates search, source, internal-link, and risk fixes without editing drafts.",
      stopBefore: "Use this pack during human review only. mark:review requires explicit human approval per file; publish --confirm is not included.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      queuedPlaybookGeneratedAt: queued.generatedAt,
      queuedPlaybookGuardrails: queued.guardrails,
      queuedPlaybookItems: queued.summary.items,
      queuedPlaybookReadyItems: queued.summary.readyItems,
      queuedPlaybookSafeDraftItems: queued.summary.safeDraftItems,
      queuedPlaybookUnsafeItems: queued.summary.unsafeItems,
      queuedForPlaybook: queued.sourceEvidence.queuedForPlaybook,
      sprintBoardUnsafeItems: queued.sourceEvidence.sprintBoardUnsafeItems,
    },
    summary: {
      items: items.length,
      itemsWithCommandBoundary: items.filter((item) => hasCommandBoundary(item.commandBoundary)).length,
      itemsWithInternalLinkFixes: items.filter((item) => item.internalLinkFixes.length > 0).length,
      itemsWithRemediationReasons: items.filter((item) => item.remediationReasons.length > 0).length,
      itemsWithRiskChecks: items.filter((item) => item.riskChecks.length >= 4).length,
      itemsWithSearchFixes: items.filter((item) => item.searchFixes.length > 0).length,
      itemsWithSourceChecks: items.filter((item) => item.sourceChecks.length > 0).length,
      manualFixReadyItems: items.filter((item) => item.manualFixReady).length,
      queuedItems: queued.summary.items,
      unsafeItems: unsafeItems.length,
    },
    unsafeItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "autopilot-queued-remediation-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "autopilot-queued-remediation-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toRemediationItem(item: QueuedPlaybookItem): RemediationItem {
  const commandBoundary = item.commandBoundary || item.manualOnlyCommands;
  const internalLinkFixes = dedupe([
    ...item.internalLinkSuggestions.map((link) => `Add or explicitly reject public internal link: ${link.title} (${link.url}).`),
    "Confirm the link anchor is contextual and does not interrupt the tutorial flow.",
  ]);
  const searchFixes = dedupe([
    item.primaryKeyword ? `Make the opening answer the primary keyword naturally: ${item.primaryKeyword}.` : "",
    ...item.searchActions,
    ...item.searchQueries.slice(0, 8).map((query) => `Check search query coverage: ${query}.`),
  ]);
  const sourceChecks = dedupe([
    ...item.sourceActions,
    ...item.sourceTargets.slice(0, 8).map((target) => `Verify source target: ${target}.`),
    ...item.factCheckQueries.slice(0, 6).map((query) => `Fact-check query: ${query}.`),
  ]);
  const riskChecks = dedupe([
    ...item.riskReviewChecklist,
    ...(item.warnings || []),
    "Reject unsupported traffic, ranking, revenue, benchmark, cost, latency, or stability claims.",
    "Confirm credentials, customer data, API keys, and deployment secrets are never exposed.",
  ]);
  const remediationReasons = dedupe([
    "queued sprint item has not entered the current approval remediation packet",
    internalLinkFixes.length > 0 ? "internal-link placement needs human acceptance or rejection" : "",
    searchFixes.length > 0 ? "search-intent wording needs human copy review" : "",
    sourceChecks.length > 0 ? "source and fact-check evidence needs human verification" : "",
    riskChecks.length >= 4 ? "risk-language checklist needs human sign-off" : "",
  ]);
  const unsafeReasons = [
    item.readyForHumanReview ? "" : "queued playbook item is not ready for human review",
    item.safeDraft ? "" : "queued playbook item is not a safe draft",
    hasCommandBoundary(commandBoundary) ? "" : "manual command boundary is missing or unsafe",
    internalLinkFixes.length > 0 ? "" : "no internal-link remediation action attached",
    searchFixes.length > 0 ? "" : "no search remediation action attached",
    sourceChecks.length > 0 ? "" : "no source verification action attached",
    riskChecks.length >= 4 ? "" : "risk checklist is too thin",
    item.sourceEvidence.length >= 3 ? "" : "not enough upstream source evidence reports",
  ].filter(Boolean);
  const humanChecklist = dedupe([
    ...remediationReasons.map((reason) => `Review reason: ${reason}.`),
    "Apply, rewrite, or explicitly reject each search fix before mark:review.",
    "Open source targets or run equivalent source checks before mark:review.",
    "Apply or explicitly reject the public internal-link suggestion before mark:review.",
    "Resolve risk checklist items and remove unsupported claims before mark:review.",
    `Only after explicit human approval, run: ${commandBoundary.markReviewAfterHumanApproval}`,
    "Publishing remains a separate explicit approval step.",
  ]);

  return {
    commandBoundary,
    file: item.file,
    humanChecklist,
    internalLinkFixes,
    manualFixReady: unsafeReasons.length === 0,
    remediationReasons,
    riskChecks,
    searchFixes,
    sourceChecks,
    sourceEvidence: item.sourceEvidence,
    sprintOrder: item.sprintOrder,
    title: item.title,
    unsafeReasons,
  };
}

function hasCommandBoundary(command: CommandBoundary) {
  return (
    command.markReviewAfterHumanApproval.includes("--confirm-human") &&
    !command.publishDryRunAfterReview.includes("--confirm") &&
    command.publishConfirm === "not-included"
  );
}

function dedupe(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { note: string; stopBefore: string; trafficClaim: string };
  items: RemediationItem[];
  sourceEvidence: Record<string, unknown>;
  summary: Record<string, number>;
  unsafeItems: RemediationItem[];
}) {
  const lines = [
    "# Autopilot Queued Remediation Pack",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It turns queued playbook items into manual remediation cards and keeps article edits, mark-review, and publishing human-gated.",
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
    "## Source Evidence",
    "",
    ...Object.entries(payload.sourceEvidence).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`),
    "",
    "## Unsafe Items",
    "",
    ...itemTable(payload.unsafeItems),
    "",
    "## Remediation Items",
    "",
    ...itemTable(payload.items),
    "",
    "## Per-Item Checklist",
    "",
    ...payload.items.flatMap(itemSection),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function itemTable(items: RemediationItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Order | Ready | Reasons | Search fixes | Source checks | Link fixes | Risk checks | Mark-review gated | Publish confirm | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.sprintOrder} | ${item.manualFixReady} | ${item.remediationReasons.length} | ${item.searchFixes.length} | ${item.sourceChecks.length} | ${item.internalLinkFixes.length} | ${item.riskChecks.length} | ${item.commandBoundary.markReviewAfterHumanApproval.includes("--confirm-human")} | ${item.commandBoundary.publishConfirm} | ${item.title} | ${item.file} |`,
    ),
  ];
}

function itemSection(item: RemediationItem) {
  return [
    `### ${item.sprintOrder}. ${item.title}`,
    "",
    `- File: ${item.file}`,
    `- Source evidence: ${item.sourceEvidence.join(", ") || "missing"}`,
    `- Manual mark-review command: \`${item.commandBoundary.markReviewAfterHumanApproval}\``,
    `- Publish dry-run command after review: \`${item.commandBoundary.publishDryRunAfterReview}\``,
    `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
    "",
    "Search fixes:",
    "",
    ...item.searchFixes.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Source checks:",
    "",
    ...item.sourceChecks.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Internal-link fixes:",
    "",
    ...item.internalLinkFixes.map((step) => `- ${step}`),
    "",
    "Risk checks:",
    "",
    ...item.riskChecks.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Human checklist:",
    "",
    ...item.humanChecklist.map((step) => `- ${step}`),
    "",
  ];
}

main();
