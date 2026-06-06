import fs from "fs";
import path from "path";
import { readArticle, rel } from "./content-utils";

type ArticleSummary = {
  category: string;
  file: string;
  primaryKeyword: string;
  reviewContext: string[];
  riskLevel: "high" | "medium" | "low";
  riskReasons: string[];
  status: string;
  title: string;
  updatedAt: string;
};

const highRiskTerms = [
  "api",
  "agent",
  "claude",
  "dify",
  "gemini",
  "key",
  "mcp",
  "model",
  "n8n",
  "ollama",
  "openai",
  "rag",
  "rate limit",
  "vercel",
  "vllm",
  "webhook",
  "部署",
  "大模型",
  "模型",
  "知识库",
  "限流",
];

const mediumRiskTerms = ["prompt", "提示词", "工具", "报价", "客服", "运营", "销售", "自动化", "workflow"];

function main() {
  const articles = articleFilesSync().map(toSummary);
  const currentPackFiles = loadFileSet("content/automation/publish-readiness-pack.json", (payload) => asArray(payload.items));
  const plannedFiles = loadFileSet("content/automation/review-batch-plan.json", (payload) =>
    asArray(payload.batches).flatMap((batch) => (isCandidateBatch(batch) ? asArray(batch.candidates) : [])),
  );
  const items = articles
    .filter((article) => article.riskLevel !== "low" || article.reviewContext.length > 0)
    .sort(compareFreshnessRisk);

  const currentReviewItems = items.filter((item) => currentPackFiles.has(item.file));
  const plannedReviewItems = items.filter((item) => plannedFiles.has(item.file));
  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoPublish: false,
      note: "This report flags freshness risk for manual review. It does not verify live facts, claim traffic, or change article status.",
    },
    summary: {
      articlesChecked: articles.length,
      currentReviewItems: currentReviewItems.length,
      highRisk: items.filter((item) => item.riskLevel === "high").length,
      items: items.length,
      mediumRisk: items.filter((item) => item.riskLevel === "medium").length,
      plannedReviewItems: plannedReviewItems.length,
    },
    currentReviewItems,
    plannedReviewItems,
    items: items.slice(0, 120),
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "content-freshness.json");
  const mdTarget = path.join(process.cwd(), "docs", "content-freshness.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: true, currentReviewItems: currentReviewItems.length, highRisk: payload.summary.highRisk, json: rel(jsonTarget), markdown: rel(mdTarget) }, null, 2));
}

function articleFilesSync() {
  const dir = path.join(process.cwd(), "content", "blog");
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
}

function toSummary(file: string): ArticleSummary {
  const article = readArticle(file);
  const text = `${article.data.title || ""} ${article.data.category || ""} ${article.data.primaryKeyword || ""} ${article.content}`.toLowerCase();
  const highMatches = highRiskTerms.filter((term) => text.includes(term.toLowerCase()));
  const mediumMatches = mediumRiskTerms.filter((term) => text.includes(term.toLowerCase()));
  const riskLevel = highMatches.length ? "high" : mediumMatches.length ? "medium" : "low";
  const riskReasons = [
    ...highMatches.slice(0, 8).map((term) => `fast-changing technical term: ${term}`),
    ...mediumMatches.slice(0, 5).map((term) => `review-sensitive term: ${term}`),
  ];

  return {
    category: String(article.data.category || ""),
    file: rel(file),
    primaryKeyword: String(article.data.primaryKeyword || ""),
    reviewContext: [],
    riskLevel,
    riskReasons,
    status: String(article.data.status || ""),
    title: String(article.data.title || ""),
    updatedAt: String(article.data.updatedAt || ""),
  };
}

function loadFileSet(relativePath: string, pickItems: (payload: Record<string, unknown>) => unknown[]) {
  const target = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(target)) return new Set<string>();
  const payload = JSON.parse(fs.readFileSync(target, "utf8").replace(/^\uFEFF/, "")) as Record<string, unknown>;
  const files = pickItems(payload)
    .map((item) => (isFileItem(item) ? item.file : ""))
    .filter((file: unknown): file is string => typeof file === "string");
  return new Set(files);
}

function isFileItem(value: unknown): value is { file: string } {
  return typeof value === "object" && value !== null && "file" in value && typeof (value as { file?: unknown }).file === "string";
}

function isCandidateBatch(value: unknown): value is { candidates?: unknown[] } {
  return typeof value === "object" && value !== null && "candidates" in value;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function compareFreshnessRisk(a: ArticleSummary, b: ArticleSummary) {
  const riskOrder = { high: 2, medium: 1, low: 0 };
  if (riskOrder[b.riskLevel] !== riskOrder[a.riskLevel]) return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  if (b.updatedAt !== a.updatedAt) return a.updatedAt.localeCompare(b.updatedAt);
  return a.file.localeCompare(b.file);
}

function toMarkdown(payload: {
  currentReviewItems: ArticleSummary[];
  generatedAt: string;
  guardrails: { autoPublish: boolean; note: string };
  items: ArticleSummary[];
  plannedReviewItems: ArticleSummary[];
  summary: { articlesChecked: number; currentReviewItems: number; highRisk: number; items: number; mediumRisk: number; plannedReviewItems: number };
}) {
  const lines = [
    "# Content Freshness Check",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report flags fast-changing content for manual fact review. It does not verify facts or publish anything.",
    "",
    "## Guardrails",
    "",
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    `- Articles checked: ${payload.summary.articlesChecked}`,
    `- Items flagged: ${payload.summary.items}`,
    `- High risk: ${payload.summary.highRisk}`,
    `- Medium risk: ${payload.summary.mediumRisk}`,
    `- Current review items: ${payload.summary.currentReviewItems}`,
    `- Planned review items: ${payload.summary.plannedReviewItems}`,
    "",
    "## Current Review Items",
    "",
    "| Risk | Updated | Category | Keyword | Title | File | Reasons |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...payload.currentReviewItems.map(toRow),
    "",
    "## Planned Review Items",
    "",
    "| Risk | Updated | Category | Keyword | Title | File | Reasons |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...payload.plannedReviewItems.map(toRow),
    "",
    "## Top Freshness Risks",
    "",
    "| Risk | Updated | Category | Keyword | Title | File | Reasons |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...payload.items.map(toRow),
    "",
  ];

  return lines.join("\n");
}

function toRow(item: ArticleSummary) {
  return `| ${item.riskLevel} | ${item.updatedAt} | ${item.category} | ${item.primaryKeyword} | ${item.title} | ${item.file} | ${item.riskReasons.slice(0, 5).join("; ")} |`;
}

main();
