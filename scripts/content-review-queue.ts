import fs from "fs";
import path from "path";
import { contentPlan500 } from "../content/content-plan-500";
import { articleFiles, parseArgs, readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type QueueItem = {
  batch: number;
  category: string;
  contentType: string;
  difficulty: string;
  failedItems: string[];
  file: string;
  priority: number;
  qualityScore: number;
  searchIntent: string;
  slug: string;
  status: string;
  title: string;
  warnings: string[];
};

async function main() {
  const args = parseArgs();
  const limit = Math.min(Number(args.limit || 25), 50);
  const format = String(args.format || "json");
  const status = String(args.status || "draft");
  const planBySlug = new Map<string, (typeof contentPlan500)[number]>(contentPlan500.map((item) => [item.slug, item]));
  const files = await articleFiles();
  const queue: QueueItem[] = [];

  for (const file of files) {
    const article = readArticle(file);
    const slug = String(article.data.slug || "");
    const plan = planBySlug.get(slug);
    if (!plan) continue;
    if (article.data.status !== status) continue;
    if (args.batch && plan.batch !== Number(args.batch)) continue;
    if (args.category && plan.category !== String(args.category)) continue;
    if (args.priority && plan.priority !== Number(args.priority)) continue;

    const result = checkFile(file);
    queue.push({
      batch: plan.batch,
      category: plan.category,
      contentType: plan.contentType,
      difficulty: plan.difficulty,
      failedItems: result.failedItems,
      file: rel(file),
      priority: plan.priority,
      qualityScore: result.qualityScore,
      searchIntent: plan.searchIntent,
      slug,
      status: String(article.data.status || "unknown"),
      title: String(article.data.title || plan.title),
      warnings: result.warnings,
    });
  }

  queue.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
    if (a.batch !== b.batch) return a.batch - b.batch;
    return a.slug.localeCompare(b.slug);
  });

  const selected = queue.slice(0, limit);
  const summary = {
    generatedAt: new Date().toISOString(),
    filters: {
      batch: args.batch ? Number(args.batch) : null,
      category: args.category ? String(args.category) : null,
      priority: args.priority ? Number(args.priority) : null,
      status,
    },
    totalMatches: queue.length,
    returned: selected.length,
    byBatch: countBy(queue.map((item) => `batch-${item.batch}`)),
    byCategory: countBy(queue.map((item) => item.category)),
    items: selected,
  };

  const output = format === "md" ? toMarkdown(summary) : JSON.stringify(summary, null, 2);
  if (args.write) {
    const target = path.join(process.cwd(), String(args.write));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${output.trim()}\n`, "utf8");
    console.log(`wrote ${path.relative(process.cwd(), target).replace(/\\/g, "/")}`);
  } else {
    console.log(output);
  }
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function toMarkdown(summary: {
  generatedAt: string;
  filters: Record<string, string | number | null>;
  totalMatches: number;
  returned: number;
  byBatch: Record<string, number>;
  byCategory: Record<string, number>;
  items: QueueItem[];
}) {
  const lines = [
    "# 内容人工审核队列",
    "",
    `生成时间：${summary.generatedAt}`,
    "",
    "这份队列只用于人工审核前的排序参考，不会自动发布文章。所有 draft 仍然保持 noindex=true，必须人工检查后才能进入 review。",
    "",
    "## 当前筛选",
    "",
    `- 状态：${summary.filters.status}`,
    `- Batch：${summary.filters.batch ?? "全部"}`,
    `- 分类：${summary.filters.category ?? "全部"}`,
    `- 优先级：${summary.filters.priority ?? "全部"}`,
    `- 匹配数量：${summary.totalMatches}`,
    `- 本次返回：${summary.returned}`,
    "",
    "## 建议审核顺序",
    "",
    "| 顺序 | Batch | 优先级 | 分数 | 分类 | 标题 | 文件 |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...summary.items.map((item, index) => (
      `| ${index + 1} | ${item.batch} | ${item.priority} | ${item.qualityScore} | ${item.category} | ${item.title} | ${item.file} |`
    )),
    "",
    "## 审核时必须看",
    "",
    "- 是否有真实原创角度，而不是通用空话。",
    "- 是否包含适合谁、不适合谁、具体步骤和风险提醒。",
    "- 是否没有收入保证、刷单、绕平台规则、站外付款引导等违规表达。",
    "- 是否需要补充真实操作截图、来源备注或平台规则备注。",
    "- 是否适合放入当前发布节奏；即使分数高，也不要一次性发布很多篇。",
  ];

  const itemsWithWarnings = summary.items.filter((item) => item.warnings.length || item.failedItems.length);
  if (itemsWithWarnings.length) {
    lines.push("", "## 需要复核的提示", "");
    for (const item of itemsWithWarnings) {
      lines.push(`- ${item.slug}: ${[...item.failedItems, ...item.warnings].join("; ")}`);
    }
  }

  return lines.join("\n");
}

void main();
