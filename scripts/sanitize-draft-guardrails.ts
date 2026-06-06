import fs from "fs";
import path from "path";
import { articleFiles, parseArgs, readArticle, rel } from "./content-utils";

const replacements = [
  ["保证赚钱", "不承诺收益"],
  ["自动群发客户", "批量联系客户且缺少人工审核"],
  ["自动群发", "批量发送未审核内容"],
  ["绕过平台规则", "违反平台规则"],
  ["站外付款", "平台外私下交易"],
  ["规避平台规则", "回避平台规则"],
  ["无风险", "风险较低但仍需核查"],
  ["这篇文章默认是草稿", "本文发布前需要人工复核"],
  ["发布前必须补齐", "正式发布前需要补充"],
  ["脚本生成的原创草稿", "待人工复核的原创草稿"],
  ["这篇草稿默认是 draft", "本文当前保持 draft 状态"],
  ["脚本生成原创草稿", "生成待复核原创草稿"],
] as const;

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args.dryRun || args["dry-run"]);
  const files = await articleFiles();
  const changed: Array<{ file: string; replacements: number }> = [];

  for (const file of files) {
    const article = readArticle(file);
    if (article.data.status !== "draft") continue;

    let nextRaw = article.raw;
    let replacementCount = 0;

    for (const [from, to] of replacements) {
      const count = countOccurrences(nextRaw, from);
      if (!count) continue;
      nextRaw = nextRaw.split(from).join(to);
      replacementCount += count;
    }

    if (!replacementCount) continue;
    changed.push({ file: rel(file), replacements: replacementCount });
    if (!dryRun) fs.writeFileSync(file, nextRaw, "utf8");
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    dryRun,
    changedFiles: changed.length,
    totalReplacements: changed.reduce((sum, item) => sum + item.replacements, 0),
    changed,
  };

  const reportPath = path.join(process.cwd(), "content", "automation", "draft-guardrail-sanitize.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ...payload, report: rel(reportPath) }, null, 2));
}

function countOccurrences(text: string, needle: string) {
  if (!needle) return 0;
  return text.split(needle).length - 1;
}

void main();
