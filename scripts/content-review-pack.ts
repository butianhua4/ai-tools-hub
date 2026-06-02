import fs from "fs";
import path from "path";
import { contentPlan500 } from "../content/content-plan-500";
import { articleFiles, parseArgs, readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type ReviewCandidate = {
  batch: number;
  category: string;
  content: string;
  contentType: string;
  difficulty: string;
  file: string;
  headings: string[];
  priority: number;
  qualityScore: number;
  searchIntent: string;
  slug: string;
  sourceNotes: string;
  status: string;
  title: string;
  warnings: string[];
};

async function main() {
  const args = parseArgs();
  const limit = Math.min(Number(args.limit || 3), 5);
  const planBySlug = new Map<string, (typeof contentPlan500)[number]>(contentPlan500.map((item) => [item.slug, item]));
  const files = await articleFiles();
  const candidates: ReviewCandidate[] = [];

  for (const file of files) {
    const article = readArticle(file);
    const slug = String(article.data.slug || "");
    const plan = planBySlug.get(slug);
    if (!plan) continue;
    if (article.data.status !== "draft") continue;
    if (args.batch && plan.batch !== Number(args.batch)) continue;
    if (args.category && plan.category !== String(args.category)) continue;
    if (args.priority && plan.priority !== Number(args.priority)) continue;

    const result = checkFile(file);
    if (result.failedItems.length || result.qualityScore < Number(args.minScore || 80)) continue;

    candidates.push({
      batch: plan.batch,
      category: plan.category,
      content: article.content,
      contentType: plan.contentType,
      difficulty: plan.difficulty,
      file: rel(file),
      headings: extractHeadings(article.content),
      priority: plan.priority,
      qualityScore: result.qualityScore,
      searchIntent: plan.searchIntent,
      slug,
      sourceNotes: String(article.data.sourceNotes || ""),
      status: String(article.data.status || "unknown"),
      title: String(article.data.title || plan.title),
      warnings: result.warnings,
    });
  }

  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
    if (a.batch !== b.batch) return a.batch - b.batch;
    return a.slug.localeCompare(b.slug);
  });

  const selected = candidates.slice(0, limit);
  const output = toMarkdown(selected, {
    batch: args.batch ? Number(args.batch) : null,
    category: args.category ? String(args.category) : null,
    priority: args.priority ? Number(args.priority) : null,
    minScore: Number(args.minScore || 80),
  });
  const target = path.join(process.cwd(), String(args.write || "docs/review-pack.md"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${output.trim()}\n`, "utf8");
  console.log(`wrote ${path.relative(process.cwd(), target).replace(/\\/g, "/")}`);
}

function extractHeadings(content: string) {
  return content
    .split(/\r?\n/)
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/, "").trim())
    .slice(0, 18);
}

function excerpt(content: string) {
  return content
    .replace(/^# .+$/m, "")
    .replace(/```[\s\S]*?```/g, "[代码或模板片段已省略，审核时请打开原文查看]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
}

function toMarkdown(
  items: ReviewCandidate[],
  filters: { batch: number | null; category: string | null; priority: number | null; minScore: number },
) {
  const lines = [
    "# 人工审核包",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "这份文档用于人工快速抽查候选草稿。它不会改变文章状态，也不会发布文章。",
    "",
    "## 筛选条件",
    "",
    `- Batch：${filters.batch ?? "全部"}`,
    `- 分类：${filters.category ?? "全部"}`,
    `- 优先级：${filters.priority ?? "全部"}`,
    `- 最低质量分：${filters.minScore}`,
    `- 本次文章数：${items.length}`,
    "",
    "## 审核动作",
    "",
    "1. 打开每篇文章文件，检查事实、原创角度、平台规则和风险提醒。",
    "2. 如果只是格式合格但内容空泛，不要进入 review。",
    "3. 只有人工确认通过后，才运行 `npm run mark:review -- --file=content/blog/xxx.mdx --confirm-human`。",
    "4. review 后仍保持 noindex=true；真正发布还需要单独 dry run 和 `publish:articles --confirm`。",
  ];

  items.forEach((item, index) => {
    lines.push(
      "",
      `## ${index + 1}. ${item.title}`,
      "",
      `- 文件：${item.file}`,
      `- Slug：${item.slug}`,
      `- Batch：${item.batch}`,
      `- 分类：${item.category}`,
      `- 类型：${item.contentType}`,
      `- 难度：${item.difficulty}`,
      `- 搜索意图：${item.searchIntent}`,
      `- 优先级：${item.priority}`,
      `- 质量分：${item.qualityScore}`,
      `- 当前状态：${item.status}`,
      `- 来源备注：${item.sourceNotes || "缺失，发布前必须补充"}`,
      "",
      "### 章节结构",
      "",
      ...item.headings.map((heading) => `- ${heading}`),
      "",
      "### 开头节选",
      "",
      excerpt(item.content),
      "",
      "### 风险提示",
      "",
      item.warnings.length ? item.warnings.map((warning) => `- ${warning}`).join("\n") : "- 暂无脚本风险提示，但仍需人工检查。",
      "",
      "### 人工审核结论",
      "",
      "- [ ] 有明确原创角度",
      "- [ ] 步骤可执行，不只是空话",
      "- [ ] 没有收入保证或夸张承诺",
      "- [ ] 没有鼓励绕过平台规则",
      "- [ ] sourceNotes 足够支撑事实",
      "- [ ] CTA 克制且与页面相关",
      "- [ ] 可以进入 review",
    );
  });

  return lines.join("\n");
}

void main();
