// 内容资产盘点:扫 content/blog/*.mdx,按主题聚类 + 厚度分布,产出"保留/合并/砍"决策依据
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BLOG = "content/blog";
const THIN = 500;   // <500词视为薄页(合并候选)
const files = readdirSync(BLOG).filter((f) => f.endsWith(".mdx"));

// 主题归类(按 slug 前缀/关键词)
function topicOf(slug) {
  if (/^codex/.test(slug)) return "codex";
  if (/(vs|compare|comparison)/.test(slug)) return "对比(vs)";
  if (/(error|mistake|fix|fail|troubleshoot|debug)/.test(slug)) return "报错排查";
  if (/(checklist|template)/.test(slug)) return "清单/模板";
  if (/(deploy|vercel|docker|nvidia|gpu|install)/.test(slug)) return "部署/环境";
  if (/(agent|rag|langgraph|dify|llm|prompt|claude)/.test(slug)) return "Agent/RAG/LLM";
  if (/(upwork|freelance|client|proposal|gumroad|stripe|paddle)/.test(slug)) return "接单/变现";
  return "其他";
}

const wc = (t) => (t.replace(/[#>*`\-\[\]()_!|]/g, " ").match(/[\p{L}\p{N}]+/gu) || []).length;

const rows = files.map((f) => {
  const raw = readFileSync(join(BLOG, f), "utf8");
  const body = raw.replace(/^---[\s\S]*?---/, "");
  const words = wc(body);
  return { slug: f.replace(/\.mdx$/, ""), topic: topicOf(f), words, thin: words < THIN };
});

const groups = {};
for (const r of rows) {
  (groups[r.topic] ??= []).push(r);
}

console.log(`总 blog 文章: ${rows.length}`);
console.log(`薄页(<${THIN}词): ${rows.filter((r) => r.thin).length}  (${Math.round((rows.filter((r) => r.thin).length / rows.length) * 100)}%)`);
const allWords = rows.map((r) => r.words).sort((a, b) => a - b);
console.log(`字数中位数: ${allWords[Math.floor(allWords.length / 2)]}  最小: ${allWords[0]}  最大: ${allWords[allWords.length - 1]}`);
console.log("\n主题 | 篇数 | 薄页数 | 中位字数 | 合并后建议保留");
console.log("---|---|---|---|---");
const order = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
for (const [topic, list] of order) {
  const med = list.map((r) => r.words).sort((a, b) => a - b)[Math.floor(list.length / 2)];
  const thinN = list.filter((r) => r.thin).length;
  // 建议保留 = 该主题压缩成 1 pillar + 若干深子页(粗略:每主题保留 ~15-20%,最少5)
  const keep = Math.max(5, Math.round(list.length * 0.15));
  console.log(`${topic} | ${list.length} | ${thinN} | ${med} | ${keep}`);
}
const totalKeep = order.reduce((s, [, l]) => s + Math.max(5, Math.round(l.length * 0.15)), 0);
console.log(`\n>>> 建议:${rows.length} 篇 blog → 收缩到约 ${totalKeep} 篇精页(其余合并进 pillar 或 noindex)`);
