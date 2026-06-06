import fs from "fs";
import path from "path";
import { chineseCount, readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type LaneCandidate = {
  category: string;
  currentPack: boolean;
  expansionQueue: boolean;
  file: string;
  noindex: boolean | null;
  primaryKeyword: string;
  publishBatch: number | null;
  qualityScore: number;
  safeDraft: boolean;
  searchIntent: string;
  status: string;
  title: string;
  wave1: boolean;
};

type Lane = {
  audience: string;
  demandScore: number;
  id: string;
  intentSeeds: string[];
  matchedCandidates: LaneCandidate[];
  priorityReason: string;
  priorityScore: number;
  publicCount: number;
  readyDraftCount: number;
  reviewFocus: string[];
  sourceTargets: string[];
  title: string;
  workflowAngles: string[];
};

type LaneMap = {
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
  lanes: Lane[];
  summary: {
    highPriorityLanes: number;
    lanes: number;
    lanesWithReadyDrafts: number;
    lanesWithoutPublicCoverage: number;
    totalReadyDraftMatches: number;
  };
  topLanes: Lane[];
};

type PacketItem = {
  approvalChecks: string[];
  category: string;
  currentPack: boolean;
  description: string;
  file: string;
  humanReviewCommandAfterApproval: string;
  intentSeeds: string[];
  laneAudience: string;
  laneId: string;
  lanePriorityReason: string;
  lanePriorityScore: number;
  laneTitle: string;
  noindex: boolean | null;
  primaryKeyword: string;
  publishBatch: number | null;
  publishDryRunCommandAfterApproval: string;
  qualityIssues: string[];
  qualityScore: number;
  readyForHumanReview: boolean;
  reviewFocus: string[];
  riskChecks: string[];
  safeDraft: boolean;
  searchIntent: string;
  sourceNotes: string;
  sourceTargets: string[];
  status: string;
  title: string;
  wave1: boolean;
  wordCountChinese: number;
  workflowAngles: string[];
};

const nextGapLimit = 6;

function main() {
  const laneMap = readJson<LaneMap>("content/automation/search-intent-lane-map.json");
  const currentWave = readJson<{ files: string[]; summary: { items: number; readyForHumanReview: number; unsafeItems: number; wave: number } }>(
    "content/automation/wave-approval-packet.json",
  );
  const currentWaveFiles = new Set(currentWave.files.map(normalizeFile));
  const currentWaveItems = collectCurrentWaveItems(laneMap, currentWaveFiles);
  const nextGapItems = collectNextGapItems(laneMap, currentWaveFiles, nextGapLimit);
  const allItems = [...currentWaveItems, ...nextGapItems];
  const unsafeItems = allItems.filter((item) => !item.readyForHumanReview);
  const laneIds = new Set(nextGapItems.map((item) => item.laneId));

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only human approval packet derived from the search-intent lane map. It does not change article status, noindex, or publishing state.",
      stopBefore: "Run confirm-human or publish confirm commands only after explicit human approval for each file.",
    },
    summary: {
      currentWaveItems: currentWaveItems.length,
      currentWaveReady: currentWaveItems.filter((item) => item.readyForHumanReview).length,
      nextGapItems: nextGapItems.length,
      nextGapLanes: laneIds.size,
      unsafeItems: unsafeItems.length,
      wave: currentWave.summary.wave,
    },
    sourceEvidence: {
      laneMapLanes: laneMap.summary.lanes,
      laneMapHighPriorityLanes: laneMap.summary.highPriorityLanes,
      laneMapWithoutPublicCoverage: laneMap.summary.lanesWithoutPublicCoverage,
      laneMapReadyDraftMatches: laneMap.summary.totalReadyDraftMatches,
      note: "Lane priorities are editorial signals for broad search-intent coverage, not measured keyword volume or traffic.",
    },
    currentWaveItems,
    nextGapItems,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "search-intent-approval-packet.json");
  const mdTarget = path.join(process.cwd(), "docs", "search-intent-approval-packet.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0 && nextGapItems.length === nextGapLimit, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length || nextGapItems.length !== nextGapLimit) process.exitCode = 1;
}

function collectCurrentWaveItems(laneMap: LaneMap, currentWaveFiles: Set<string>) {
  const byFile = new Map<string, PacketItem>();

  for (const lane of laneMap.lanes) {
    for (const candidate of lane.matchedCandidates) {
      if (!currentWaveFiles.has(normalizeFile(candidate.file))) continue;
      if (byFile.has(candidate.file)) continue;
      byFile.set(candidate.file, toPacketItem(candidate, lane));
    }
  }

  return [...byFile.values()].sort((a, b) => Number(b.currentPack) - Number(a.currentPack) || b.lanePriorityScore - a.lanePriorityScore);
}

function collectNextGapItems(laneMap: LaneMap, currentWaveFiles: Set<string>, limit: number) {
  const selected = new Map<string, PacketItem>();
  const publicGapLanes = laneMap.lanes
    .filter((lane) => lane.publicCount === 0 && lane.readyDraftCount > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  for (const lane of publicGapLanes) {
    const candidates = lane.matchedCandidates
      .filter((candidate) => candidate.safeDraft && !candidate.wave1 && !currentWaveFiles.has(normalizeFile(candidate.file)))
      .sort((a, b) => sortCandidate(a, b));

    for (const candidate of candidates.slice(0, 2)) {
      if (selected.size >= limit) break;
      if (selected.has(candidate.file)) continue;
      selected.set(candidate.file, toPacketItem(candidate, lane));
    }

    if (selected.size >= limit) break;
  }

  return [...selected.values()].sort((a, b) => b.lanePriorityScore - a.lanePriorityScore || b.qualityScore - a.qualityScore);
}

function toPacketItem(candidate: LaneCandidate, lane: Lane): PacketItem {
  const article = readArticle(candidate.file);
  const quality = checkFile(article.file);
  const data = article.data;
  const sourceNotes = stringValue(data.sourceNotes);
  const status = stringValue(data.status);
  const noindex = typeof data.noindex === "boolean" ? data.noindex : null;
  const safeDraft = status === "draft" && noindex === true && data.humanReviewRequired === true && sourceNotes.length > 0 && quality.failedItems.length === 0;
  const readyForHumanReview = safeDraft && candidate.safeDraft && lane.sourceTargets.length >= 2 && lane.reviewFocus.length >= 3;

  return {
    approvalChecks: [
      `Article remains draft: ${status === "draft"}`,
      `Article remains noindex: ${noindex === true}`,
      `Human review flag is present: ${data.humanReviewRequired === true}`,
      `Source notes are present: ${sourceNotes.length > 0}`,
      `Quality check passed: ${quality.failedItems.length === 0}`,
      "Reviewer verifies official sources before any status change.",
      "Reviewer confirms the article answers one broad search intent without unsupported traffic or income claims.",
    ],
    category: stringValue(data.category),
    currentPack: candidate.currentPack,
    description: stringValue(data.description),
    file: rel(article.file),
    humanReviewCommandAfterApproval: `npm run mark:review -- --file=${rel(article.file)} --confirm-human`,
    intentSeeds: lane.intentSeeds,
    laneAudience: lane.audience,
    laneId: lane.id,
    lanePriorityReason: lane.priorityReason,
    lanePriorityScore: lane.priorityScore,
    laneTitle: lane.title,
    noindex,
    primaryKeyword: stringValue(data.primaryKeyword),
    publishBatch: typeof data.publishBatch === "number" ? data.publishBatch : null,
    publishDryRunCommandAfterApproval: `npm run publish:articles -- --file=${rel(article.file)}`,
    qualityIssues: quality.failedItems,
    qualityScore: quality.qualityScore,
    readyForHumanReview,
    reviewFocus: lane.reviewFocus,
    riskChecks: riskChecksForLane(lane.id),
    safeDraft,
    searchIntent: stringValue(data.searchIntent),
    sourceNotes,
    sourceTargets: lane.sourceTargets,
    status,
    title: stringValue(data.title),
    wave1: candidate.wave1,
    wordCountChinese: chineseCount(article.content),
    workflowAngles: lane.workflowAngles,
  };
}

function riskChecksForLane(laneId: string) {
  const common = [
    "No measured traffic, ranking, income, approval, or client acquisition claim is made without evidence.",
    "No API key, private customer data, credential, or bypass instruction is included.",
    "Fast-changing model names, quotas, pricing, limits, and platform features are checked against official docs.",
  ];
  const laneSpecific: Record<string, string[]> = {
    "agent-deployment-tools": ["Agent permissions, tool allowlists, human approval, logs, and rollback boundaries are explicit."],
    "rag-knowledge-memory": ["Retrieval quality, citations, memory retention, privacy, and hallucination risks are explicit."],
    "llm-deployment-serving": ["GPU, memory, serving, concurrency, cold-start, and cost tradeoffs are framed as checks, not guarantees."],
    "local-open-models": ["Local deployment privacy and cost claims are qualified and hardware assumptions are visible."],
    "nocode-ai-automation": ["Webhook auth, connector permissions, retries, manual fallback, and platform policy boundaries are explicit."],
    "industry-prompt-library": ["Prompt templates include input context, output criteria, human review rules, and adaptation notes."],
    "business-ai-workflows": ["Department workflows identify approval owner, sensitive decisions, and human handoff points."],
  };

  return [...common, ...(laneSpecific[laneId] || ["Article-specific operational and safety boundaries are explicit."])];
}

function sortCandidate(a: LaneCandidate, b: LaneCandidate) {
  return Number(b.expansionQueue) - Number(a.expansionQueue) ||
    Number(b.currentPack) - Number(a.currentPack) ||
    b.qualityScore - a.qualityScore ||
    (b.publishBatch || 0) - (a.publishBatch || 0);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFile(file: string) {
  return file.replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  currentWaveItems: PacketItem[];
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  nextGapItems: PacketItem[];
  sourceEvidence: Record<string, number | string>;
  summary: Record<string, number>;
}) {
  const lines = [
    "# Search Intent Approval Packet",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This packet is read-only. It turns the broad search-intent lane map into a focused human approval queue. It does not mark review, publish, or change noindex.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
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
    "## Current Wave Items",
    "",
    ...table(payload.currentWaveItems),
    "",
    "## Next Gap Items",
    "",
    ...table(payload.nextGapItems),
    "",
  ];

  lines.push(...detailSection("Current Wave Detail", payload.currentWaveItems));
  lines.push(...detailSection("Next Gap Detail", payload.nextGapItems));
  return lines.join("\n");
}

function table(items: PacketItem[]) {
  if (!items.length) return ["- none"];

  return [
    "| Ready | Wave 1 | Current pack | Lane score | Quality | Batch | Lane | Primary keyword | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map((item) => (
      `| ${item.readyForHumanReview} | ${item.wave1} | ${item.currentPack} | ${item.lanePriorityScore} | ${item.qualityScore} | ${item.publishBatch ?? ""} | ${item.laneTitle} | ${item.primaryKeyword} | ${item.title} | ${item.file} |`
    )),
  ];
}

function detailSection(title: string, items: PacketItem[]) {
  const lines = [`## ${title}`, ""];

  for (const [index, item] of items.entries()) {
    lines.push(
      `### ${index + 1}. ${item.title}`,
      "",
      `- File: ${item.file}`,
      `- Lane: ${item.laneTitle}`,
      `- Audience: ${item.laneAudience}`,
      `- Priority reason: ${item.lanePriorityReason}`,
      `- Description: ${item.description}`,
      `- Source notes: ${item.sourceNotes}`,
      `- Chinese chars: ${item.wordCountChinese}`,
      "",
      "Intent seeds:",
      "",
      ...item.intentSeeds.map((seed) => `- ${seed}`),
      "",
      "Review focus:",
      "",
      ...item.reviewFocus.map((focus) => `- ${focus}`),
      "",
      "Source targets:",
      "",
      ...item.sourceTargets.map((source) => `- ${source}`),
      "",
      "Risk checks:",
      "",
      ...item.riskChecks.map((check) => `- ${check}`),
      "",
      "Approval checks:",
      "",
      ...item.approvalChecks.map((check) => `- ${check}`),
      "",
      "Commands after explicit human approval:",
      "",
      "```bash",
      item.humanReviewCommandAfterApproval,
      item.publishDryRunCommandAfterApproval,
      "```",
      "",
    );
  }

  return lines;
}

main();
