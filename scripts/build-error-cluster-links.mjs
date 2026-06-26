// 建"报错排查"集群内链:统一11篇category + 正文插入精准互链块(关键词锚文本)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CAT = "Node.js 报错与工程问题";
const BLOG = "content/blog";

// 11篇:slug -> 锚文本(关键词)
const P = {
  "codex-codex-npm-install-4-33": "npm install 报错怎么解决",
  "codex-codex-vercel-4-37": "Vercel 部署失败怎么办",
  "codex-codex-github-4-36": "git push 报错怎么解决",
  "dev-works-build-fails": "npm run dev 能跑但 build 失败",
  "port-already-in-use-fix-freelance-scope": "端口被占用 EADDRINUSE 怎么解决",
  "module-not-found-debug": "Cannot find module 报错怎么解决",
  "nextjs-hydration-error-debug-freelance-scope": "Next.js Hydration failed 怎么解决",
  "npm-command-not-found-fix-mistakes": "npm command not found 怎么解决",
  "env-variable-missing-fix": ".env 环境变量不生效怎么解决",
  "git-authentication-failed-fix-mistakes": "git authentication failed 怎么解决",
  "node-version-mismatch-fix": "Node 版本不匹配怎么解决",
};

// 每篇 -> 最相关的3-4个兄弟(精准簇)
const REL = {
  "codex-codex-npm-install-4-33": ["module-not-found-debug", "dev-works-build-fails", "node-version-mismatch-fix", "npm-command-not-found-fix-mistakes"],
  "codex-codex-vercel-4-37": ["dev-works-build-fails", "env-variable-missing-fix", "node-version-mismatch-fix"],
  "codex-codex-github-4-36": ["git-authentication-failed-fix-mistakes", "dev-works-build-fails"],
  "dev-works-build-fails": ["codex-codex-npm-install-4-33", "module-not-found-debug", "env-variable-missing-fix", "node-version-mismatch-fix"],
  "port-already-in-use-fix-freelance-scope": ["dev-works-build-fails", "module-not-found-debug", "npm-command-not-found-fix-mistakes"],
  "module-not-found-debug": ["codex-codex-npm-install-4-33", "dev-works-build-fails", "node-version-mismatch-fix"],
  "nextjs-hydration-error-debug-freelance-scope": ["dev-works-build-fails", "module-not-found-debug", "env-variable-missing-fix"],
  "npm-command-not-found-fix-mistakes": ["node-version-mismatch-fix", "codex-codex-npm-install-4-33", "module-not-found-debug"],
  "env-variable-missing-fix": ["codex-codex-vercel-4-37", "dev-works-build-fails", "codex-codex-npm-install-4-33"],
  "git-authentication-failed-fix-mistakes": ["codex-codex-github-4-36", "npm-command-not-found-fix-mistakes"],
  "node-version-mismatch-fix": ["codex-codex-npm-install-4-33", "dev-works-build-fails", "npm-command-not-found-fix-mistakes"],
};

let changed = 0;
for (const slug of Object.keys(P)) {
  const path = join(BLOG, slug + ".mdx");
  let raw = readFileSync(path, "utf8");

  // 1) 统一 category
  raw = raw.replace(/^category:.*$/m, `category: ${CAT}`);

  // 2) 插入"相关报错排查"块(幂等:已存在则替换)
  const links = (REL[slug] || []).filter((s) => P[s]).map((s) => `- [${P[s]}](/blog/${s})`).join("\n");
  const block = `## 相关报错排查\n\n同一套排查思路的常见报错，建议一起看：\n\n${links}\n\n`;
  if (raw.includes("## 相关报错排查")) {
    raw = raw.replace(/## 相关报错排查[\s\S]*?(?=\n## )/, block);
  } else {
    // 插到"## 免责声明"之前
    raw = raw.replace(/\n## 免责声明/, `\n${block}## 免责声明`);
  }
  writeFileSync(path, raw);
  changed++;
}
console.log(`已处理 ${changed} 篇:统一 category=「${CAT}」+ 插入精准互链块`);
