import fs from "fs";
import path from "path";
import { readArticle, rel } from "./content-utils";

type CommandBoundary = {
  markReviewAfterHumanApproval: string;
  publishConfirm: "not-included";
  publishDryRunAfterReview: string;
  stopBefore: string;
};

type QueueItem = {
  assignmentLane: string;
  autopilotScore: number;
  commandBoundary: CommandBoundary;
  file: string;
  readyForAssignment: boolean;
  reviewFocus: string[];
  safeDraft: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  sourceTypes: string[];
  title: string;
};

type AutopilotQueue = {
  boundaries: { canClaimTraffic: boolean; publicPublished: number; publishableNow: number; trafficDataAvailable: boolean };
  nextAssignments: QueueItem[];
  summary: { unsafeItems: number };
};

type ApprovalItem = {
  articleMeta: {
    description: string;
    humanReviewRequired: boolean;
    noindex: boolean;
    qualityScore: number | null;
    slug: string;
    status: string;
    updatedAt: string;
  };
  assignmentLane: string;
  autopilotScore: number;
  commandBoundary: CommandBoundary;
  file: string;
  headings: string[];
  readyForHumanApproval: boolean;
  reviewFocus: string[];
  searchQueries: string[];
  sourceTargets: string[];
  sourceTypes: string[];
  title: string;
};

function main() {
  const queue = readJson<AutopilotQueue>("content/automation/autopilot-review-queue.json");
  const items = queue.nextAssignments.filter((item) => item.searchQueries.length > 0).slice(0, 3).map(toApprovalItem);
  const unsafeItems = items.filter((item) => !isSafeApprovalItem(item));
  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only approval packet. It packages the top autopilot review assignments for human review and stops before status changes.",
      stopBefore: "Human must approve every mark:review command. publish --confirm commands are intentionally excluded.",
    },
    boundaries: {
      canClaimTraffic: queue.boundaries.canClaimTraffic,
      publicPublished: queue.boundaries.publicPublished,
      publishableNow: queue.boundaries.publishableNow,
      trafficDataAvailable: queue.boundaries.trafficDataAvailable,
    },
    summary: {
      items: items.length,
      queueUnsafeItems: queue.summary.unsafeItems,
      readyForHumanApproval: items.filter((item) => item.readyForHumanApproval).length,
      unsafeItems: unsafeItems.length,
      withHeadings: items.filter((item) => item.headings.length > 0).length,
      withSearchQueries: items.filter((item) => item.searchQueries.length > 0).length,
      withSourceTargets: items.filter((item) => item.sourceTargets.length > 0).length,
    },
    unsafeItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "autopilot-approval-packet.json");
  const mdTarget = path.join(process.cwd(), "docs", "autopilot-approval-packet.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toApprovalItem(item: QueueItem): ApprovalItem {
  const article = readArticle(item.file);
  const description = typeof article.data.description === "string" ? article.data.description : "";
  const slug = typeof article.data.slug === "string" ? article.data.slug : path.basename(item.file, path.extname(item.file));
  const status = String(article.data.status || "");
  const noindex = article.data.noindex === true;
  const humanReviewRequired = article.data.humanReviewRequired === true;
  const headings = extractHeadings(article.content);
  return {
    articleMeta: {
      description,
      humanReviewRequired,
      noindex,
      qualityScore: typeof article.data.qualityScore === "number" ? article.data.qualityScore : null,
      slug,
      status,
      updatedAt: typeof article.data.updatedAt === "string" ? article.data.updatedAt : "",
    },
    assignmentLane: item.assignmentLane,
    autopilotScore: item.autopilotScore,
    commandBoundary: item.commandBoundary,
    file: item.file,
    headings,
    readyForHumanApproval:
      item.readyForAssignment &&
      item.safeDraft &&
      status === "draft" &&
      noindex &&
      humanReviewRequired &&
      item.sourceTargets.length > 0 &&
      hasCommandBoundary(item.commandBoundary),
    reviewFocus: item.reviewFocus,
    searchQueries: item.searchQueries,
    sourceTargets: item.sourceTargets,
    sourceTypes: item.sourceTypes,
    title: item.title,
  };
}

function extractHeadings(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^#{2,3}\s+(.+)$/)?.[1]?.trim())
    .filter((heading): heading is string => Boolean(heading))
    .slice(0, 8);
}

function isSafeApprovalItem(item: ApprovalItem) {
  return (
    item.readyForHumanApproval &&
    item.articleMeta.status === "draft" &&
    item.articleMeta.noindex &&
    item.articleMeta.humanReviewRequired &&
    item.sourceTargets.length > 0 &&
    item.searchQueries.length > 0 &&
    item.commandBoundary.publishConfirm === "not-included" &&
    hasCommandBoundary(item.commandBoundary)
  );
}

function hasCommandBoundary(command: Partial<CommandBoundary>) {
  return (
    command.markReviewAfterHumanApproval?.includes("--confirm-human") === true &&
    command.publishDryRunAfterReview?.includes("--confirm") !== true &&
    command.publishConfirm === "not-included" &&
    command.stopBefore?.includes("explicit") === true
  );
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  boundaries: { canClaimTraffic: boolean; publicPublished: number; publishableNow: number; trafficDataAvailable: boolean };
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; stopBefore: string };
  items: ApprovalItem[];
  summary: Record<string, number>;
  unsafeItems: ApprovalItem[];
}) {
  const lines = [
    "# Autopilot Approval Packet",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This packet is read-only. It packages the top autopilot review assignments for human approval and does not change article status.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    "",
    "## Boundaries",
    "",
    `- Public published: ${payload.boundaries.publicPublished}`,
    `- Publishable now: ${payload.boundaries.publishableNow}`,
    `- Traffic data available: ${payload.boundaries.trafficDataAvailable}`,
    `- Can claim traffic: ${payload.boundaries.canClaimTraffic}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...approvalTable(payload.unsafeItems),
    "",
    "## Approval Items",
    "",
    ...approvalTable(payload.items),
    "",
    "## Item Review Notes",
    "",
    ...payload.items.flatMap(itemSection),
    "",
  ];
  return lines.join("\n");
}

function approvalTable(items: ApprovalItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Ready | Score | Lane | Status | noindex | Sources | Queries | Headings | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.readyForHumanApproval} | ${item.autopilotScore} | ${item.assignmentLane} | ${item.articleMeta.status} | ${item.articleMeta.noindex} | ${item.sourceTargets.length} | ${item.searchQueries.length} | ${item.headings.length} | ${item.title} | ${item.file} |`,
    ),
  ];
}

function itemSection(item: ApprovalItem) {
  return [
    `### ${item.title}`,
    "",
    `- File: ${item.file}`,
    `- Slug: ${item.articleMeta.slug}`,
    `- Status: ${item.articleMeta.status}`,
    `- Description: ${item.articleMeta.description || "missing"}`,
    `- Source types: ${item.sourceTypes.join(", ")}`,
    `- Quality score: ${item.articleMeta.qualityScore ?? "missing"}`,
    "",
    "Search queries:",
    "",
    ...item.searchQueries.slice(0, 10).map((query) => `- ${query}`),
    "",
    "Official source targets:",
    "",
    ...item.sourceTargets.map((source) => `- ${source}`),
    "",
    "Headings:",
    "",
    ...(item.headings.length ? item.headings.map((heading) => `- ${heading}`) : ["- missing"]),
    "",
    "Human review focus:",
    "",
    ...item.reviewFocus.map((focus) => `- ${focus}`),
    "",
    "Command boundary:",
    "",
    `- Mark review after human approval: \`${item.commandBoundary.markReviewAfterHumanApproval}\``,
    `- Publish dry-run after review: \`${item.commandBoundary.publishDryRunAfterReview}\``,
    `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
    "",
  ];
}

main();
