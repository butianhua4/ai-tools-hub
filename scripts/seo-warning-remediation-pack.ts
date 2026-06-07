import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type WarningItem = {
  description?: string;
  file: string;
  issues?: string[];
  primaryKeyword?: string;
  scope?: string[];
  slug?: string;
  status?: string;
  title?: string;
  warnings?: string[];
};

type SnippetAudit = {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
  summary: { blockingItems: number; warningItems: number };
  warningItems: WarningItem[];
};

type StructuredDataAudit = {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
  summary: { blockingItems: number; warningItems: number };
  warningItems: WarningItem[];
};

type RemediationItem = {
  commandBoundary: {
    markReviewAfterHumanApproval: string;
    publishConfirm: string;
    publishDryRunAfterReview: string;
  };
  file: string;
  humanChecklist: string[];
  manualActions: string[];
  manualFixReady: boolean;
  primaryKeyword?: string;
  priority: number;
  scope: string[];
  schemaWarnings: string[];
  snippetWarnings: string[];
  status: string;
  stopBefore: string;
  title: string;
  unsafeReasons: string[];
};

type Payload = {
  generatedAt: string;
  guardrails: {
    autoEditArticles: boolean;
    autoMarkReview: boolean;
    autoPublish: boolean;
    note: string;
    stopBefore: string;
    trafficClaim: string;
  };
  items: RemediationItem[];
  sourceEvidence: {
    searchSnippetAuditGeneratedAt: string;
    searchSnippetSummary: SnippetAudit["summary"];
    structuredDataAuditGeneratedAt: string;
    structuredDataSummary: StructuredDataAudit["summary"];
  };
  summary: {
    blockingItems: number;
    draftItems: number;
    humanGatedItems: number;
    items: number;
    itemsWithHumanChecklist: number;
    itemsWithManualActions: number;
    publicItems: number;
    recommendedItems: number;
    schemaWarningItems: number;
    snippetWarningItems: number;
    trafficDataAvailable: boolean;
    unsafeItems: number;
    warningItems: number;
    waveItems: number;
  };
  unsafeItems: RemediationItem[];
};

function main() {
  const snippets = readJson<SnippetAudit>("content/automation/search-snippet-readiness-audit.json");
  const structured = readJson<StructuredDataAudit>("content/automation/structured-data-readiness-audit.json");
  const items = buildItems(snippets, structured).sort((a, b) => b.priority - a.priority || a.file.localeCompare(b.file));
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);
  const payload: Payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only SEO warning remediation pack. It turns snippet and structured-data warnings into manual review actions without editing articles.",
      stopBefore: "Use this pack during human review only. Article edits, mark:review, and publishing require explicit human approval.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      searchSnippetAuditGeneratedAt: snippets.generatedAt,
      searchSnippetSummary: snippets.summary,
      structuredDataAuditGeneratedAt: structured.generatedAt,
      structuredDataSummary: structured.summary,
    },
    summary: {
      blockingItems: snippets.summary.blockingItems + structured.summary.blockingItems,
      draftItems: items.filter((item) => item.status !== "published").length,
      humanGatedItems: items.filter((item) => item.stopBefore.toLowerCase().includes("human")).length,
      items: items.length,
      itemsWithHumanChecklist: items.filter((item) => item.humanChecklist.length >= 5).length,
      itemsWithManualActions: items.filter((item) => item.manualActions.length >= 3).length,
      publicItems: items.filter((item) => item.status === "published").length,
      recommendedItems: items.filter((item) => item.scope.includes("recommended")).length,
      schemaWarningItems: structured.warningItems.length,
      snippetWarningItems: snippets.warningItems.length,
      trafficDataAvailable: false,
      unsafeItems: unsafeItems.length,
      warningItems: items.length,
      waveItems: items.filter((item) => item.scope.some((scope) => scope.startsWith("wave"))).length,
    },
    unsafeItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "seo-warning-remediation-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "seo-warning-remediation-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function buildItems(snippets: SnippetAudit, structured: StructuredDataAudit) {
  const byFile = new Map<string, { schema?: WarningItem; snippet?: WarningItem }>();
  for (const item of snippets.warningItems) byFile.set(item.file, { ...(byFile.get(item.file) || {}), snippet: item });
  for (const item of structured.warningItems) byFile.set(item.file, { ...(byFile.get(item.file) || {}), schema: item });
  return [...byFile.entries()].map(([file, entry]) => toRemediationItem(file, entry.snippet, entry.schema));
}

function toRemediationItem(file: string, snippet: WarningItem | undefined, schema: WarningItem | undefined): RemediationItem {
  const source = snippet || schema;
  const status = source?.status || "unknown";
  const scope = dedupe([...(snippet?.scope || []), ...(schema?.scope || [])]);
  const snippetWarnings = snippet?.warnings || [];
  const schemaWarnings = schema?.warnings || [];
  const manualActions = dedupe([
    ...snippetWarnings.flatMap((warning) => actionForSnippetWarning(warning, source?.primaryKeyword)),
    ...schemaWarnings.flatMap(actionForSchemaWarning),
    status === "published" ? "For published pages, make only deliberate SEO metadata edits and confirm the canonical URL remains stable." : "",
    status !== "published" ? "For draft/review pages, keep status, noindex, and humanReviewRequired unchanged until explicit approval." : "",
  ]);
  const stopBefore =
    status === "published"
      ? "Stop before human approval if a public page title, description, slug, canonical, or structured-data field would change."
      : "Stop before human approval before changing draft metadata, mark:review, or publishing.";
  const humanChecklist = dedupe([
    `Review file: ${file}.`,
    `Review status: ${status}.`,
    source?.primaryKeyword ? `Confirm primary keyword intent: ${source.primaryKeyword}.` : "",
    ...snippetWarnings.map((warning) => `Snippet warning: ${warning}.`),
    ...schemaWarnings.map((warning) => `Structured-data warning: ${warning}.`),
    ...manualActions,
    "Do not mark review or publish from this remediation pack.",
  ]);
  const commandBoundary = {
    markReviewAfterHumanApproval: status === "published" ? "not-applicable-public-page" : `npm run mark:review -- --file=${file} --confirm-human`,
    publishConfirm: "not-included",
    publishDryRunAfterReview: status === "published" ? "not-applicable-public-page" : "npm run publish:articles -- --dry-run",
  };
  const unsafeReasons = [
    file ? "" : "file is missing",
    status ? "" : "status is missing",
    snippetWarnings.length + schemaWarnings.length > 0 ? "" : "no SEO warnings attached",
    manualActions.length >= 3 ? "" : "manual action list is too thin",
    humanChecklist.length >= 5 ? "" : "human checklist is too thin",
    stopBefore.toLowerCase().includes("human") ? "" : "human-gated stop boundary is missing",
    commandBoundary.publishConfirm === "not-included" ? "" : "publish confirm must stay excluded",
  ].filter(Boolean);

  return {
    commandBoundary,
    file,
    humanChecklist,
    manualActions,
    manualFixReady: unsafeReasons.length === 0,
    primaryKeyword: source?.primaryKeyword,
    priority: priorityFor(status, scope, snippetWarnings, schemaWarnings),
    scope,
    schemaWarnings,
    snippetWarnings,
    status,
    stopBefore,
    title: source?.title || file,
    unsafeReasons,
  };
}

function actionForSnippetWarning(warning: string, primaryKeyword?: string) {
  if (warning.includes("primary keyword")) {
    return [
      primaryKeyword ? `Check whether the title can naturally include the exact primary keyword: ${primaryKeyword}.` : "Check whether the title can naturally include the exact primary keyword.",
      "If exact-match wording makes the title stiff or misleading, explicitly accept the warning and keep the more natural title.",
      "Confirm the H1/title/description still answer the same search intent after any metadata change.",
    ];
  }
  if (warning.includes("description")) {
    return [
      "Expand the meta description with the user problem, outcome, and one concrete workflow term.",
      "Keep the description reviewer-friendly and avoid unsupported traffic, ranking, or conversion claims.",
      "Confirm description length remains suitable for search snippets after editing.",
    ];
  }
  return [`Review snippet warning manually: ${warning}.`, "Decide whether to rewrite metadata or explicitly accept the warning.", "Confirm no indexing boundary changes are needed."];
}

function actionForSchemaWarning(warning: string) {
  if (warning.includes("contentType")) {
    return [
      "Confirm the contentType value matches the actual article format and category.",
      "If the value is intentionally uncommon, document that decision during human review.",
      "If the value is accidental, replace it with the closest established content type before approval.",
    ];
  }
  if (warning.includes("description")) {
    return [
      "Review whether the description is too long or too thin for JSON-LD reuse.",
      "Keep JSON-LD headline and description aligned with visible page metadata.",
      "Confirm the structured-data preview stays valid after any metadata edit.",
    ];
  }
  return [`Review structured-data warning manually: ${warning}.`, "Decide whether to rewrite metadata or explicitly accept the warning.", "Confirm JSON-LD preview remains valid."];
}

function priorityFor(status: string, scope: string[], snippetWarnings: string[], schemaWarnings: string[]) {
  let score = 0;
  if (status === "published") score += 50;
  if (scope.includes("recommended")) score += 40;
  if (scope.some((item) => item.startsWith("wave"))) score += 30;
  score += snippetWarnings.length * 8;
  score += schemaWarnings.length * 5;
  return score;
}

function toMarkdown(data: Payload) {
  const lines = [
    "# SEO Warning Remediation Pack",
    "",
    `Generated at: ${data.generatedAt}`,
    "",
    "This pack is read-only. It turns search snippet and structured-data warnings into human-review actions without editing articles, marking review, publishing, or claiming traffic.",
    "",
    "## Summary",
    "",
    `- Items: ${data.summary.items}`,
    `- Public items: ${data.summary.publicItems}`,
    `- Draft items: ${data.summary.draftItems}`,
    `- Recommended items: ${data.summary.recommendedItems}`,
    `- Wave items: ${data.summary.waveItems}`,
    `- Snippet warning items: ${data.summary.snippetWarningItems}`,
    `- Schema warning items: ${data.summary.schemaWarningItems}`,
    `- Blocking items: ${data.summary.blockingItems}`,
    `- Manual-fix-ready items: ${data.items.filter((item) => item.manualFixReady).length}`,
    `- Unsafe items: ${data.summary.unsafeItems}`,
    "",
    "## Items",
    "",
    "| Priority | Ready | Status | Scope | Snippet warnings | Schema warnings | Title | File |",
    "| ---: | --- | --- | --- | ---: | ---: | --- | --- |",
    ...data.items.map((item) => `| ${item.priority} | ${item.manualFixReady} | ${item.status} | ${item.scope.join(", ")} | ${item.snippetWarnings.length} | ${item.schemaWarnings.length} | ${item.title} | ${item.file} |`),
    "",
    "## Manual Actions",
    "",
    ...data.items.flatMap((item) => [
      `### ${item.title}`,
      "",
      `- File: ${item.file}`,
      `- Status: ${item.status}`,
      `- Stop before: ${item.stopBefore}`,
      `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
      "",
      "Warnings:",
      "",
      ...(item.snippetWarnings.length ? item.snippetWarnings.map((warning) => `- Snippet: ${warning}`) : []),
      ...(item.schemaWarnings.length ? item.schemaWarnings.map((warning) => `- Structured data: ${warning}`) : []),
      "",
      "Actions:",
      "",
      ...item.manualActions.map((action) => `- ${action}`),
      "",
      "Human checklist:",
      "",
      ...item.humanChecklist.map((check) => `- ${check}`),
      "",
    ]),
  ];
  return `${lines.join("\n")}\n`;
}

function readJson<T>(relativePath: string): T {
  const target = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(target)) throw new Error(`Missing required report: ${relativePath}`);
  return JSON.parse(fs.readFileSync(target, "utf8").replace(/^\uFEFF/, "")) as T;
}

function dedupe(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

main();
