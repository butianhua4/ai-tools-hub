import fs from "fs";
import path from "path";
import { readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type ReviewCandidate = {
  cluster?: string;
  file: string;
  opportunityScore?: number;
};

type ReviewBatchCandidate = {
  file: string;
  opportunityScore?: number;
};

type ReviewBatch = {
  batch: number;
  candidates: ReviewBatchCandidate[];
  topic: string;
};

type RoadmapLane = {
  lane: string;
  priorityScore: number;
};

type SourcePackItem = {
  currentPack: boolean;
  factCheckQueries: string[];
  file: string;
  lane: string;
  lanePriorityScore: number;
  officialSourceTargets: string[];
  plannedBatch: boolean;
  qualityScore: number;
  riskReviewChecklist: string[];
  safeDraft: boolean;
  title: string;
};

type QueueItem = {
  approvalWave: number;
  cluster: string;
  currentPack: boolean;
  factCheckQueries: number;
  file: string;
  humanReviewCommand: string;
  internalStatus: string;
  lane: string;
  noindex: boolean;
  officialSourceTargets: number;
  plannedBatch: boolean;
  primaryKeyword: string;
  priorityScore: number;
  publishBatch: number | null;
  publishDryRunCommand: string;
  qualityScore: number;
  reviewBatch: number | null;
  reviewBatchTopic: string;
  riskReviewChecklist: number;
  safeDraft: boolean;
  searchIntent: string;
  sourcePackReady: boolean;
  title: string;
};

function main() {
  const review = readJson<{ recommendedToday: ReviewCandidate[] }>("content/automation/review-candidates.json");
  const reviewPlan = readJson<{ batches: ReviewBatch[] }>("content/automation/review-batch-plan.json");
  const roadmap = readJson<{ lanes: RoadmapLane[]; nextReviewFiles: string[]; summary: { uniqueNextReviewFiles: number } }>(
    "content/automation/review-priority-roadmap.json",
  );
  const sourcePack = readJson<{ items: SourcePackItem[] }>("content/automation/next-review-source-pack.json");
  const projectStatus = readJson<{ articles: { publicPublished: number; publishableNow: unknown[]; statusCounts: Record<string, number> } }>(
    "content/automation/project-status.json",
  );

  const reviewCandidateScores = new Map(review.recommendedToday.map((item) => [item.file, item.opportunityScore || 0]));
  const reviewCandidateClusters = new Map(review.recommendedToday.map((item) => [item.file, item.cluster || ""]));
  const planned = new Map<string, { batch: number; score: number; topic: string }>();
  for (const batch of reviewPlan.batches) {
    for (const candidate of batch.candidates) {
      planned.set(candidate.file, {
        batch: batch.batch,
        score: candidate.opportunityScore || 0,
        topic: batch.topic,
      });
    }
  }

  const laneScores = new Map(roadmap.lanes.map((lane) => [lane.lane, lane.priorityScore]));
  const sourceItems = new Map(sourcePack.items.map((item) => [item.file, item]));
  const files = [
    ...new Set([
      ...review.recommendedToday.map((item) => item.file),
      ...reviewPlan.batches.flatMap((batch) => batch.candidates.map((item) => item.file)),
      ...roadmap.nextReviewFiles,
    ]),
  ].filter((file) => sourceItems.has(file));
  const items = files
    .map((file) => toQueueItem(file, sourceItems, planned, reviewCandidateScores, reviewCandidateClusters, laneScores))
    .sort(compareQueueItems)
    .map((item, index) => ({ ...item, approvalWave: Math.floor(index / 3) + 1 }));
  const unsafeItems = items.filter((item) => !item.safeDraft || !item.sourcePackReady);
  const duplicateFiles = duplicateValues(items.map((item) => item.file));

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoMarkReview: false,
      autoPublish: false,
      note: "This queue prepares public expansion work only. It does not change article status, noindex, or publishing state.",
      stopBefore: "Run mark:review --confirm-human or publish:articles --confirm only after explicit human approval.",
    },
    publishingBoundary: {
      publicPublished: projectStatus.articles.publicPublished,
      publishableNow: projectStatus.articles.publishableNow.length,
      statusCounts: projectStatus.articles.statusCounts,
    },
    summary: {
      approvalWaves: Math.ceil(items.length / 3),
      duplicateFiles: duplicateFiles.length,
      items: items.length,
      roadmapNextReviewFiles: roadmap.summary.uniqueNextReviewFiles,
      sourcePackReadyItems: items.filter((item) => item.sourcePackReady).length,
      unsafeItems: unsafeItems.length,
    },
    approvalWaves: toApprovalWaves(items),
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "public-expansion-queue.json");
  const mdTarget = path.join(process.cwd(), "docs", "public-expansion-queue.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: true, items: items.length, waves: payload.summary.approvalWaves, json: rel(jsonTarget), markdown: rel(mdTarget) }, null, 2));
}

function toQueueItem(
  file: string,
  sourceItems: Map<string, SourcePackItem>,
  planned: Map<string, { batch: number; score: number; topic: string }>,
  reviewCandidateScores: Map<string, number>,
  reviewCandidateClusters: Map<string, string>,
  laneScores: Map<string, number>,
): QueueItem {
  const article = readArticle(file);
  const data = article.data;
  const quality = checkFile(article.file);
  const source = sourceItems.get(file);
  const plannedItem = planned.get(file);
  const sourcePackReady = Boolean(
    source &&
      source.officialSourceTargets.length > 0 &&
      source.factCheckQueries.length > 0 &&
      source.riskReviewChecklist.length > 0 &&
      source.safeDraft,
  );
  const safeDraft = data.status === "draft" && data.noindex === true && data.humanReviewRequired === true;
  const priorityScore =
    (source?.lanePriorityScore || laneScores.get(source?.lane || "") || 0) +
    (reviewCandidateScores.get(file) || plannedItem?.score || 0) +
    quality.qualityScore +
    (source?.currentPack ? 30 : 0) +
    (source?.plannedBatch || plannedItem ? 20 : 0) +
    (sourcePackReady ? 25 : 0);

  return {
    approvalWave: 0,
    cluster: reviewCandidateClusters.get(file) || source?.lane || "roadmap",
    currentPack: source?.currentPack === true,
    factCheckQueries: source?.factCheckQueries.length || 0,
    file: rel(article.file),
    humanReviewCommand: `npm run mark:review -- --file=${rel(article.file)} --confirm-human`,
    internalStatus: String(data.status || ""),
    lane: source?.lane || "unmatched",
    noindex: data.noindex === true,
    officialSourceTargets: source?.officialSourceTargets.length || 0,
    plannedBatch: source?.plannedBatch === true || Boolean(plannedItem),
    primaryKeyword: String(data.primaryKeyword || ""),
    priorityScore,
    publishBatch: typeof data.publishBatch === "number" ? data.publishBatch : null,
    publishDryRunCommand: `npm run publish:articles -- --file=${rel(article.file)}`,
    qualityScore: quality.qualityScore,
    reviewBatch: plannedItem?.batch ?? null,
    reviewBatchTopic: plannedItem?.topic || "",
    riskReviewChecklist: source?.riskReviewChecklist.length || 0,
    safeDraft,
    searchIntent: String(data.searchIntent || ""),
    sourcePackReady,
    title: String(data.title || source?.title || ""),
  };
}

function compareQueueItems(a: QueueItem, b: QueueItem) {
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  if (b.currentPack !== a.currentPack) return Number(b.currentPack) - Number(a.currentPack);
  if (b.plannedBatch !== a.plannedBatch) return Number(b.plannedBatch) - Number(a.plannedBatch);
  return a.file.localeCompare(b.file);
}

function toApprovalWaves(items: QueueItem[]) {
  const waves: Array<{ files: string[]; items: QueueItem[]; wave: number }> = [];
  for (const item of items) {
    const wave = item.approvalWave;
    let bucket = waves.find((entry) => entry.wave === wave);
    if (!bucket) {
      bucket = { files: [], items: [], wave };
      waves.push(bucket);
    }
    bucket.files.push(item.file);
    bucket.items.push(item);
  }
  return waves;
}

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  approvalWaves: Array<{ files: string[]; items: QueueItem[]; wave: number }>;
  generatedAt: string;
  guardrails: { autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  publishingBoundary: { publicPublished: number; publishableNow: number; statusCounts: Record<string, number> };
  summary: Record<string, number>;
  items: QueueItem[];
}) {
  const lines = [
    "# Public Expansion Queue",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This queue is read-only. It ranks drafts for manual approval waves so public coverage can expand without bypassing review.",
    "",
    "## Guardrails",
    "",
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Publishing Boundary",
    "",
    `- Public published: ${payload.publishingBoundary.publicPublished}`,
    `- Publishable now: ${payload.publishingBoundary.publishableNow}`,
    `- Status counts: ${JSON.stringify(payload.publishingBoundary.statusCounts)}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Approval Waves",
    "",
  ];

  for (const wave of payload.approvalWaves) {
    lines.push(
      `### Wave ${wave.wave}`,
      "",
      "| Score | Pack | Planned | Sources | Queries | Risk | Title | File |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...wave.items.map(
        (item) =>
          `| ${item.priorityScore} | ${item.sourcePackReady} | ${item.plannedBatch} | ${item.officialSourceTargets} | ${item.factCheckQueries} | ${item.riskReviewChecklist} | ${item.title} | ${item.file} |`,
      ),
      "",
      "Human approval commands:",
      "",
      "```bash",
      ...wave.items.map((item) => item.humanReviewCommand),
      "```",
      "",
      "Publish dry-run commands after review status exists:",
      "",
      "```bash",
      ...wave.items.map((item) => item.publishDryRunCommand),
      "```",
      "",
    );
  }

  lines.push(
    "## Full Queue",
    "",
    "| Wave | Score | Safe | Source pack | Current | Planned | Batch | Keyword | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...payload.items.map(
      (item) =>
        `| ${item.approvalWave} | ${item.priorityScore} | ${item.safeDraft} | ${item.sourcePackReady} | ${item.currentPack} | ${item.plannedBatch} | ${item.publishBatch ?? ""} | ${item.primaryKeyword} | ${item.title} | ${item.file} |`,
    ),
    "",
  );

  return lines.join("\n");
}

main();
