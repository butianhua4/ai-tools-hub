import { chineseCount, readArticle, rel } from "./content-utils";

const requiredFields = ["title", "slug", "description", "date", "category", "status", "noindex"];
const requiredSections = ["## 适合谁", "## 不适合谁", "风险提醒", "具体步骤", "免责声明"];
const bannedIncomeClaims = ["保证赚钱", "稳赚", "无风险", "自动躺赚", "一天赚", "轻松月入"];
const bannedPlatformPatterns = [
  "教你绕过平台规则",
  "如何绕过平台规则",
  "批量自动群发",
  "自动群发客户",
  "刷单教程",
  "刷单技巧",
  "建议站外付款",
  "引导站外付款",
  "诱导客户站外付款",
  "建议让客户站外付款",
  "规避审核技巧",
];
const riskyTerms = ["绕过平台规则", "自动群发", "刷单", "站外付款", "规避审核"];
const mojibakeMarkers = ["鈥", "鎺", "鏂", "绋", "銆", "锛", "€"];

export function checkFile(file: string) {
  const { data, content } = readArticle(file);
  const failedItems: string[] = [];
  const warnings: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === "") failedItems.push(`${field} missing`);
  }

  if (!Array.isArray(data.tags) || data.tags.length < 3) failedItems.push("tags less than 3");
  if (chineseCount(content) < 1200) failedItems.push("word count below 1200 Chinese chars");
  if (!/^## /m.test(content)) failedItems.push("missing H2");

  for (const section of requiredSections) {
    if (!content.includes(section)) failedItems.push(`missing ${section}`);
  }

  for (const phrase of bannedIncomeClaims) {
    if (content.includes(phrase)) failedItems.push(`banned income claim: ${phrase}`);
  }

  for (const phrase of bannedPlatformPatterns) {
    if (content.includes(phrase)) failedItems.push(`banned platform violation phrase: ${phrase}`);
  }

  for (const term of riskyTerms) {
    if (content.includes(term)) warnings.push(`mentions risky term, verify context is cautionary: ${term}`);
  }

  for (const marker of mojibakeMarkers) {
    if (content.includes(marker) || JSON.stringify(data).includes(marker)) {
      failedItems.push(`possible mojibake marker: ${marker}`);
      break;
    }
  }

  if (!/\]\(\//.test(content)) failedItems.push("missing internal link");
  if (!/CTA|联系|下载|生成器|工具导航/.test(content)) failedItems.push("missing CTA");
  if (data.status === "draft" && data.noindex !== true) failedItems.push("draft must be noindex=true");
  if (data.status !== "published" && data.noindex === false) failedItems.push("only published can noindex=false");
  if (data.status === "published" && data.noindex !== false) failedItems.push("published must be noindex=false");
  if (!data.sourceNotes) warnings.push("sourceNotes is empty");

  const paragraphs = content.split(/\n{2,}/).map((part) => part.trim()).filter((part) => part.length > 80);
  if (new Set(paragraphs).size < paragraphs.length) failedItems.push("possible duplicate paragraph");

  const qualityScore = Math.max(0, 100 - failedItems.length * 6 - warnings.length * 2);

  return {
    file: rel(file),
    qualityScore,
    failedItems,
    warnings,
    suggestions: failedItems.length
      ? ["补充缺失章节", "删除违规表达或乱码", "增加内链和清晰 CTA", "人工复核事实和平台规则"]
      : ["可以进入人工审核"],
  };
}
