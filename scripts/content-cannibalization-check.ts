import fs from "fs";
import path from "path";
import { articleFiles, readArticle, rel } from "./content-utils";

type ArticleSummary = {
  category: string;
  file: string;
  noindex: boolean;
  primaryKeyword: string;
  searchIntent: string;
  slug: string;
  status: string;
  title: string;
};

type Conflict = {
  files: string[];
  groupKey: string;
  publishedCount: number;
  reason: string;
  reviewBatchOverlap: string[];
  statuses: Record<string, number>;
  titles: string[];
};

const stopWords = new Set(["the", "and", "for", "with", "guide", "checklist", "mistakes", "怎么", "什么", "如何", "教程", "清单", "指南"]);

async function main() {
  const articles = (await articleFiles()).map(toSummary);
  const reviewPlanFiles = loadReviewPlanFiles();
  const keywordConflicts = groupedConflicts(articles, (article) => normalizeKey(article.primaryKeyword), "same primary keyword", reviewPlanFiles);
  const titleStemConflicts = groupedConflicts(articles, (article) => titleStem(article.title), "similar title stem", reviewPlanFiles);
  const slugStemConflicts = groupedConflicts(articles, (article) => slugStem(article.slug), "similar slug stem", reviewPlanFiles);
  const conflicts = dedupeConflicts([...keywordConflicts, ...titleStemConflicts, ...slugStemConflicts]).sort(compareConflict);
  const reviewBatchConflicts = conflicts.filter((conflict) => conflict.reviewBatchOverlap.length > 1);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoPublish: false,
      note: "This is a warning report for manual review. It does not change article status or block drafts by itself.",
    },
    summary: {
      articleCount: articles.length,
      conflicts: conflicts.length,
      keywordConflicts: keywordConflicts.length,
      reviewBatchConflicts: reviewBatchConflicts.length,
      slugStemConflicts: slugStemConflicts.length,
      titleStemConflicts: titleStemConflicts.length,
    },
    reviewBatchConflicts,
    conflicts: conflicts.slice(0, 80),
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "content-cannibalization.json");
  const mdTarget = path.join(process.cwd(), "docs", "content-cannibalization.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: true, conflicts: conflicts.length, reviewBatchConflicts: reviewBatchConflicts.length, json: rel(jsonTarget), markdown: rel(mdTarget) }, null, 2));
}

function toSummary(file: string): ArticleSummary {
  const article = readArticle(file);
  return {
    category: String(article.data.category || ""),
    file: rel(file),
    noindex: article.data.noindex === true,
    primaryKeyword: String(article.data.primaryKeyword || ""),
    searchIntent: String(article.data.searchIntent || ""),
    slug: String(article.data.slug || ""),
    status: String(article.data.status || ""),
    title: String(article.data.title || ""),
  };
}

function groupedConflicts(articles: ArticleSummary[], getKey: (article: ArticleSummary) => string, reason: string, reviewPlanFiles: Set<string>) {
  const groups = new Map<string, ArticleSummary[]>();
  for (const article of articles) {
    const key = getKey(article);
    if (!key) continue;
    const items = groups.get(key) || [];
    items.push(article);
    groups.set(key, items);
  }

  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([groupKey, items]) => toConflict(groupKey, items, reason, reviewPlanFiles));
}

function toConflict(groupKey: string, items: ArticleSummary[], reason: string, reviewPlanFiles: Set<string>): Conflict {
  const statuses: Record<string, number> = {};
  for (const item of items) statuses[item.status] = (statuses[item.status] || 0) + 1;

  return {
    files: items.map((item) => item.file).sort(),
    groupKey,
    publishedCount: items.filter((item) => item.status === "published").length,
    reason,
    reviewBatchOverlap: items.filter((item) => reviewPlanFiles.has(item.file)).map((item) => item.file).sort(),
    statuses,
    titles: items.map((item) => item.title).sort(),
  };
}

function dedupeConflicts(conflicts: Conflict[]) {
  const seen = new Set<string>();
  const deduped: Conflict[] = [];
  for (const conflict of conflicts) {
    const key = `${conflict.reason}:${conflict.files.join("|")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(conflict);
  }
  return deduped;
}

function compareConflict(a: Conflict, b: Conflict) {
  if (b.reviewBatchOverlap.length !== a.reviewBatchOverlap.length) return b.reviewBatchOverlap.length - a.reviewBatchOverlap.length;
  if (b.publishedCount !== a.publishedCount) return b.publishedCount - a.publishedCount;
  if (b.files.length !== a.files.length) return b.files.length - a.files.length;
  return a.groupKey.localeCompare(b.groupKey);
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function titleStem(title: string) {
  const tokens = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter((token) => token.length >= 2 && !stopWords.has(token));
  return tokens.slice(0, 5).join(" ");
}

function slugStem(slug: string) {
  return slug
    .toLowerCase()
    .split(/[-_]+/)
    .filter((token) => token.length >= 3 && !stopWords.has(token))
    .slice(0, 5)
    .join("-");
}

function loadReviewPlanFiles() {
  const target = path.join(process.cwd(), "content", "automation", "review-batch-plan.json");
  if (!fs.existsSync(target)) return new Set<string>();
  const payload = JSON.parse(fs.readFileSync(target, "utf8")) as { batches?: Array<{ candidates?: Array<{ file: string }> }> };
  return new Set((payload.batches || []).flatMap((batch) => batch.candidates || []).map((candidate) => candidate.file));
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoPublish: boolean; note: string };
  summary: { articleCount: number; conflicts: number; keywordConflicts: number; reviewBatchConflicts: number; slugStemConflicts: number; titleStemConflicts: number };
  reviewBatchConflicts: Conflict[];
  conflicts: Conflict[];
}) {
  const lines = [
    "# Content Cannibalization Check",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This warning report helps manual reviewers avoid publishing multiple articles that compete for the same search intent.",
    "",
    "## Guardrails",
    "",
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    `- Articles checked: ${payload.summary.articleCount}`,
    `- Conflicts: ${payload.summary.conflicts}`,
    `- Keyword conflicts: ${payload.summary.keywordConflicts}`,
    `- Title-stem conflicts: ${payload.summary.titleStemConflicts}`,
    `- Slug-stem conflicts: ${payload.summary.slugStemConflicts}`,
    `- Review batch conflicts: ${payload.summary.reviewBatchConflicts}`,
    "",
    "## Review Batch Conflicts",
    "",
    "| Reason | Group | Overlap | Files |",
    "| --- | --- | --- | --- |",
    ...payload.reviewBatchConflicts.map((item) => `| ${item.reason} | ${item.groupKey} | ${item.reviewBatchOverlap.length} | ${item.reviewBatchOverlap.join("<br>")} |`),
    "",
    "## Top Conflicts",
    "",
    "| Reason | Group | Published | Statuses | Files |",
    "| --- | --- | --- | --- | --- |",
    ...payload.conflicts.map((item) => `| ${item.reason} | ${item.groupKey} | ${item.publishedCount} | ${JSON.stringify(item.statuses)} | ${item.files.join("<br>")} |`),
    "",
  ];

  return lines.join("\n");
}

void main();
