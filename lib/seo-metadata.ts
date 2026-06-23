import { site } from "@/data/site";

export const defaultOgImages = [
  {
    url: site.ogImage,
    width: 1200,
    height: 630,
    alt: `${site.englishName} search guide`,
  },
];

const minimumDescriptionLength = 150;
const maximumDescriptionLength = 160;
const fallbackSuffix =
  " Includes practical steps, risk checks, related questions, and deeper AI deployment or automation guidance for search-driven builders.";
const maximumTitleLength = 68;

// 截断到 Google SERP 显示上限(~160字符)的词边界,避免描述在搜索结果被中途截断影响点击率
function capDescription(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maximumDescriptionLength) return clean;
  const cut = clean.slice(0, maximumDescriptionLength);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 120 ? cut.slice(0, lastSpace) : cut;
  return trimmed.replace(/[\s,.;:–-]+$/, "").trimEnd();
}

export function seoDescription(description: string, context?: string) {
  const clean = description.trim();
  if (clean.length >= minimumDescriptionLength) return capDescription(clean);

  const extra = context?.trim() || fallbackSuffix;
  const combined = `${clean} ${extra}`.replace(/\s+/g, " ").trim();
  const result = combined.length >= minimumDescriptionLength ? combined : `${combined}${fallbackSuffix}`;
  return capDescription(result);
}

export function seoTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= maximumTitleLength) return clean;
  return `${clean.slice(0, maximumTitleLength - 1).trimEnd()}...`;
}

export function questionSeoTitle(questionName: string) {
  const suffix = hasFixIntent(questionName) ? "Fix Guide, Steps & Risks" : "Quick Answer, Steps & Risks";
  return seoTitle(`${questionName} | ${suffix}`);
}

export function questionSeoDescription(questionName: string, clusterTitle: string) {
  return seoDescription(
    `Solve ${questionName}: get the quick answer, step-by-step checks, commands when available, risk notes, related ${clusterTitle} questions, and the full deep guide.`,
    `Built for high-intent searchers who need practical AI deployment, automation, coding, or troubleshooting guidance before changing a real project.`,
  );
}

function hasFixIntent(input: string) {
  return /\b(error|failed|fail|fix|debug|troubleshoot|exception|timeout|rate limit)\b/i.test(input) || /报错|失败|修复|排查|错误|限流|超时/.test(input);
}
