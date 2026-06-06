import fs from "fs";
import path from "path";
import { articleFiles, parseArgs, readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type Candidate = {
  category: string;
  dryRunCommand: string;
  file: string;
  noindex: boolean;
  publishBatch: number | null;
  qualityScore: number;
  reason: string;
  reviewCommand: string;
  slug: string;
  sourceNotes: boolean;
  status: string;
  title: string;
};

const blockedPattern =
  /保证赚钱|自动群发客户|自动群发|绕过平台规则|站外付款|规避平台规则|无风险|这篇文章默认是草稿|发布前必须补齐|脚本生成的原创草稿|这篇草稿默认是 draft|脚本生成原创草稿/;

async function main() {
  const args = parseArgs();
  const limit = Math.min(Number(args.limit || 20), 50);
  const minScore = Number(args.minScore || 100);
  const files = await articleFiles();
  const candidates: Candidate[] = [];
  const rejected: Record<string, number> = {};

  for (const file of files) {
    const article = readArticle(file);
    const status = String(article.data.status || "unknown");
    const raw = article.raw;
    const result = checkFile(file);
    const rejectReason = getRejectReason(article, result.failedItems, result.qualityScore, raw, status, minScore);

    if (rejectReason) {
      rejected[rejectReason] = (rejected[rejectReason] || 0) + 1;
      continue;
    }

    candidates.push({
      category: String(article.data.category || ""),
      dryRunCommand: `npm run mark:review -- --file=${rel(file)}`,
      file: rel(file),
      noindex: article.data.noindex === true,
      publishBatch: typeof article.data.publishBatch === "number" ? article.data.publishBatch : null,
      qualityScore: result.qualityScore,
      reason: getCandidateReason(article),
      reviewCommand: `npm run mark:review -- --file=${rel(file)} --confirm-human`,
      slug: String(article.data.slug || ""),
      sourceNotes: Boolean(article.data.sourceNotes),
      status,
      title: String(article.data.title || ""),
    });
  }

  candidates.sort((a, b) => {
    if ((b.publishBatch || 0) !== (a.publishBatch || 0)) return (b.publishBatch || 0) - (a.publishBatch || 0);
    if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
    return a.slug.localeCompare(b.slug);
  });

  const selected = candidates.slice(0, limit);
  const recommendedToday = selected.slice(0, 3);
  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoPublish: false,
      nextHumanAction: "Open each candidate, verify facts and risk language, then run mark:review with --confirm-human for approved files.",
      publishLimitRecommendation: "After review, publish only 1-3 articles per batch.",
    },
    filters: {
      limit,
      minScore,
      requiredStatus: "draft",
      requiredNoindex: true,
      requiredSourceNotes: true,
      blockedPattern: blockedPattern.source,
    },
    counts: {
      candidates: candidates.length,
      returned: selected.length,
      rejected,
    },
    recommendedToday,
    candidates: selected,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "review-candidates.json");
  const mdTarget = path.join(process.cwd(), "docs", "review-automation.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({
    ok: true,
    candidates: candidates.length,
    returned: selected.length,
    json: rel(jsonTarget),
    markdown: rel(mdTarget),
  }, null, 2));
}

function getRejectReason(
  article: ReturnType<typeof readArticle>,
  failedItems: string[],
  qualityScore: number,
  raw: string,
  status: string,
  minScore: number,
) {
  if (status !== "draft") return `status:${status}`;
  if (article.data.noindex !== true) return "not-noindex";
  if (!article.data.sourceNotes) return "missing-sourceNotes";
  if (blockedPattern.test(raw)) return "blocked-pattern";
  if (failedItems.length) return "quality-failed";
  if (qualityScore < minScore) return "score-below-threshold";
  return "";
}

function getCandidateReason(article: ReturnType<typeof readArticle>) {
  const category = String(article.data.category || "");
  const batch = typeof article.data.publishBatch === "number" ? `batch ${article.data.publishBatch}` : "unplanned batch";
  return `${batch}; ${category}; quality passed; needs human fact/risk review before mark:review`;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoPublish: boolean; nextHumanAction: string; publishLimitRecommendation: string };
  counts: { candidates: number; returned: number; rejected: Record<string, number> };
  recommendedToday: Candidate[];
  candidates: Candidate[];
}) {
  const lines = [
    "# Review Automation Queue",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This automation does not publish articles. It only ranks safe-looking draft candidates for human review.",
    "",
    "## Guardrails",
    "",
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Next human action: ${payload.guardrails.nextHumanAction}`,
    `- Publish limit: ${payload.guardrails.publishLimitRecommendation}`,
    "",
    "## Counts",
    "",
    `- Candidates: ${payload.counts.candidates}`,
    `- Returned: ${payload.counts.returned}`,
    "",
    "## Rejected",
    "",
    ...Object.entries(payload.counts.rejected)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([reason, count]) => `- ${reason}: ${count}`),
    "",
    "## Recommended Today",
    "",
    "Review these first. Keep publishing to a small manual batch after fact/risk checks.",
    "",
    "| # | Score | Batch | Category | Title | File |",
    "| --- | --- | --- | --- | --- | --- |",
    ...payload.recommendedToday.map((item, index) => (
      `| ${index + 1} | ${item.qualityScore} | ${item.publishBatch ?? ""} | ${item.category} | ${item.title} | ${item.file} |`
    )),
    "",
    "Dry-run commands:",
    "",
    "```bash",
    ...payload.recommendedToday.map((item) => item.dryRunCommand),
    "```",
    "",
    "After manual approval:",
    "",
    "```bash",
    ...payload.recommendedToday.map((item) => item.reviewCommand),
    "```",
    "",
    "## Recommended Review Order",
    "",
    "| # | Score | Batch | Category | Title | File |",
    "| --- | --- | --- | --- | --- | --- |",
    ...payload.candidates.map((item, index) => (
      `| ${index + 1} | ${item.qualityScore} | ${item.publishBatch ?? ""} | ${item.category} | ${item.title} | ${item.file} |`
    )),
    "",
    "## Commands",
    "",
    "Dry-run one candidate before marking review:",
    "",
    "```bash",
    "npm run mark:review -- --file=content/blog/example.mdx",
    "```",
    "",
    "After manual approval:",
    "",
    "```bash",
    "npm run mark:review -- --file=content/blog/example.mdx --confirm-human",
    "npm run publish:articles -- --file=content/blog/example.mdx",
    "npm run publish:articles -- --file=content/blog/example.mdx --confirm",
    "```",
    "",
  ];

  return lines.join("\n");
}

void main();
