import fs from "fs";
import path from "path";

type ContentType =
  | "tutorial"
  | "checklist"
  | "comparison"
  | "template"
  | "case-study"
  | "troubleshooting"
  | "tool-guide"
  | "pricing-guide"
  | "roadmap";

type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

type BaseTopic = {
  title: string;
  slug: string;
  category: string;
  contentType: ContentType;
  difficulty: "beginner" | "intermediate" | "advanced";
  searchIntent: SearchIntent;
  riskLevel: "low" | "medium" | "high";
  links: string[];
  cta: string;
  angle: string;
};

const variants = [
  { title: "", slug: "", type: "tutorial" as ContentType, intent: "informational" as SearchIntent },
  { title: "新手检查清单", slug: "checklist", type: "checklist" as ContentType, intent: "informational" as SearchIntent },
  { title: "常见错误和解决步骤", slug: "mistakes", type: "troubleshooting" as ContentType, intent: "informational" as SearchIntent },
  { title: "接单前怎么判断能不能做", slug: "freelance-scope", type: "case-study" as ContentType, intent: "commercial" as SearchIntent },
];

const doubleVariants = variants.slice(0, 2);
const tripleVariants = variants.slice(0, 3);

const topics = [
  ...expand(codexBases(), variants),
  ...expand(claudeBases(), variants),
  ...expand(upworkBases(), tripleVariants),
  ...expand(freelanceBases(), tripleVariants),
  ...expand(debugBases(), variants),
  ...expand(paymentBases(), doubleVariants),
  ...expand(toolCompareBases(), doubleVariants),
  ...expand(templateBases(), doubleVariants),
].map((item, index) => {
  const id = index + 1;
  const priority = id <= 25 ? 5 : id <= 100 ? 4 : id <= 250 ? 3 : 2;
  return {
    id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    contentType: item.contentType,
    difficulty: item.difficulty,
    targetReader: `${item.category}方向的中文新手，需要谨慎、可执行、可审核的步骤`,
    searchIntent: item.searchIntent,
    primaryKeyword: item.title,
    secondaryKeywords: buildKeywords(item),
    problem: `新手搜索“${item.title}”时，通常不是缺一个概念解释，而是不知道准备哪些材料、按什么顺序验证、哪些风险不能碰。`,
    promise: `读完后可以按清单完成初步判断，知道下一步该问什么、测什么、记录什么，以及什么时候应该暂缓或找人复核。`,
    outline: [
      "直接回答这个问题",
      "适合谁和不适合谁",
      "先做风险判断",
      "新手可执行步骤",
      "可复制模板或命令",
      "常见错误",
      "推荐工具和内链",
    ],
    requiredSections: [
      "适合谁 / 不适合谁",
      "具体步骤",
      "风险提醒",
      "可复制模板或命令",
      "免责声明",
    ],
    internalLinks: item.links,
    recommendedCTA: item.cta,
    monetizationAngle: item.angle,
    riskLevel: item.riskLevel,
    priority,
    batch: Math.ceil(id / 25),
    status: "planned",
  };
});

if (topics.length !== 500) {
  throw new Error(`Expected 500 topics, got ${topics.length}`);
}

const uniqueSlugs = new Set(topics.map((item) => item.slug));
if (uniqueSlugs.size !== topics.length) {
  throw new Error(`Duplicate slugs: ${topics.length - uniqueSlugs.size}`);
}

const output = `export const contentPlan500 = ${JSON.stringify(topics, null, 2)} as const;\n`;
fs.writeFileSync(path.join(process.cwd(), "content", "content-plan-500.ts"), output, "utf8");
console.log(JSON.stringify({ topics: topics.length, batches: 20, uniqueSlugs: uniqueSlugs.size }, null, 2));

function expand(bases: BaseTopic[], variantList: typeof variants) {
  return bases.flatMap((base) =>
    variantList.map((variant) => ({
      ...base,
      title: variant.title ? `${base.title}：${variant.title}` : base.title,
      slug: variant.slug ? `${base.slug}-${variant.slug}` : base.slug,
      contentType: variant.type,
      searchIntent: variant.intent,
    })),
  );
}

function buildKeywords(item: BaseTopic) {
  const words = [item.category, "AI 接单", "新手教程"];
  if (item.title.includes("Upwork")) words.push("Upwork 新手");
  if (item.title.includes("Vercel")) words.push("Vercel 部署");
  if (item.title.includes("GitHub")) words.push("GitHub");
  if (item.title.includes("Codex")) words.push("Codex");
  if (item.title.includes("Claude")) words.push("Claude Code");
  return [...new Set(words)].slice(0, 5);
}

function base(title: string, slug: string, category: string, contentType: ContentType, riskLevel: "low" | "medium" | "high" = "medium"): BaseTopic {
  const difficulty = riskLevel === "high" ? "intermediate" : "beginner";
  const links = category.includes("Upwork")
    ? ["/tools/proposal-generator", "/tools/pricing-calculator", "/templates"]
    : category.includes("报错")
      ? ["/tools/error-explainer", "/tools/codex", "/templates"]
      : ["/tools/proposal-generator", "/tools/error-explainer", "/templates"];
  return {
    title,
    slug,
    category,
    contentType,
    difficulty,
    searchIntent: "informational",
    riskLevel,
    links,
    cta: category.includes("模板") ? "下载相关模板" : "使用站内工具做初步判断",
    angle: "工具推荐、模板下载、人工配置和排错服务",
  };
}

function codexBases() {
  const c = "Codex 新手教程";
  return [
    base("Codex 是什么，新手第一天应该怎么用", "codex-first-day-guide", c, "tutorial", "low"),
    base("Codex 安装前需要准备哪些环境", "codex-install-prerequisites", c, "checklist", "low"),
    base("Codex 在 Windows 上安装失败怎么办", "codex-windows-install-failed", c, "troubleshooting", "medium"),
    base("Codex npm install 报错怎么排查", "codex-npm-install-errors", c, "troubleshooting", "medium"),
    base("Codex 怎么做第一个落地页", "codex-first-landing-page", c, "tutorial", "low"),
    base("Codex 修 CSS 间距和响应式问题怎么做", "codex-css-spacing-responsive", c, "troubleshooting", "low"),
    base("Codex 生成代码后怎么人工审核", "codex-review-generated-code", c, "checklist", "medium"),
    base("Codex 和 GitHub 怎么配合提交代码", "codex-github-workflow", c, "tool-guide", "medium"),
    base("Codex 和 Vercel 怎么配合部署小网站", "codex-vercel-deployment", c, "tool-guide", "medium"),
    base("Codex 接 Upwork 小单前怎么判断风险", "codex-upwork-job-risk-check", c, "checklist", "high"),
    base("Codex 修改现有网页 UI 的安全流程", "codex-edit-existing-ui", c, "tutorial", "medium"),
    base("Codex 修 bug 时如何保留回滚记录", "codex-bugfix-rollback-record", c, "checklist", "medium"),
    base("Codex 处理客户需求不清楚时怎么提问", "codex-client-requirement-questions", c, "template", "medium"),
    base("Codex 做小网站交付前检查什么", "codex-small-website-delivery-check", c, "checklist", "medium"),
    base("Codex 如何避免把密钥写进代码", "codex-avoid-secret-leak", c, "troubleshooting", "high"),
    base("Codex 改 Tailwind 页面时怎么检查移动端", "codex-tailwind-mobile-check", c, "checklist", "medium"),
    base("Codex 生成 README 后怎么检查真实性", "codex-readme-review", c, "checklist", "low"),
    base("Codex 做作品集页面怎么准备素材", "codex-portfolio-page-assets", c, "template", "low"),
    base("Codex 和 Cursor 哪个更适合新手改网页", "codex-vs-cursor-web-editing", c, "comparison", "medium"),
    base("Codex 自动化开发流程哪些步骤不能省", "codex-automation-steps-not-skip", c, "roadmap", "medium"),
  ];
}

function claudeBases() {
  const c = "Claude Code 新手教程";
  return [
    base("Claude Code 是什么，新手适合用来做什么", "claude-code-beginner-use-cases", c, "tutorial", "low"),
    base("Claude Code 安装前需要准备什么", "claude-code-install-prerequisites", c, "checklist", "low"),
    base("Claude Code 常用命令怎么理解", "claude-code-common-commands", c, "tool-guide", "low"),
    base("Claude Code 修 bug 前怎么描述问题", "claude-code-bug-prompt", c, "template", "medium"),
    base("Claude Code 做小项目怎么拆任务", "claude-code-small-project-tasks", c, "roadmap", "medium"),
    base("Claude Code 和 Codex 哪个适合网页修改", "claude-code-vs-codex-web-editing", c, "comparison", "medium"),
    base("Claude Code 报错看不懂怎么排查", "claude-code-error-debug", c, "troubleshooting", "medium"),
    base("Claude Code 自动化哪些事情需要人工确认", "claude-code-automation-human-review", c, "checklist", "medium"),
    base("Claude Code 适合接哪些低风险小单", "claude-code-low-risk-freelance-jobs", c, "case-study", "medium"),
    base("Claude Code 新手最容易踩哪些坑", "claude-code-beginner-mistakes", c, "troubleshooting", "medium"),
    base("Claude Code 改 Next.js 页面怎么检查", "claude-code-nextjs-page-check", c, "checklist", "medium"),
    base("Claude Code 生成 Proposal 草稿怎么复核", "claude-code-proposal-review", c, "checklist", "medium"),
    base("Claude Code 和 GitHub 配合怎么避免乱改文件", "claude-code-github-file-scope", c, "tool-guide", "medium"),
    base("Claude Code 处理客户英文需求怎么提问", "claude-code-client-questions", c, "template", "medium"),
    base("Claude Code 做交付说明应该写什么", "claude-code-delivery-note", c, "template", "low"),
  ];
}

function upworkBases() {
  const c = "Upwork 新手";
  return [
    base("Upwork 新手注册前要准备哪些资料", "upwork-account-prep", c, "checklist", "medium"),
    base("Upwork 个人简介怎么写才真实可信", "upwork-profile-honest-summary", c, "template", "medium"),
    base("Upwork Proposal 开头怎么写不空泛", "upwork-proposal-opening", c, "template", "medium"),
    base("Upwork 第一个项目报价怎么保守估算", "upwork-first-project-pricing", c, "pricing-guide", "medium"),
    base("Upwork 客户需求太短怎么提问", "upwork-short-job-post-questions", c, "template", "medium"),
    base("Upwork 哪些小网站任务适合 AI 新手", "upwork-small-website-jobs-ai-beginner", c, "case-study", "medium"),
    base("Upwork 免费测试项目怎么判断风险", "upwork-free-test-risk", c, "checklist", "high"),
    base("Upwork 站外沟通要求怎么处理", "upwork-off-platform-communication-risk", c, "checklist", "high"),
    base("Upwork 小单交付前要确认什么", "upwork-small-job-delivery-check", c, "checklist", "medium"),
    base("Upwork 如何积累第一个真实评价", "upwork-first-review-ethical", c, "roadmap", "medium"),
    base("Upwork 作品集没有案例怎么办", "upwork-portfolio-without-client-work", c, "tutorial", "medium"),
    base("Upwork 英文回复客户怎么写更稳妥", "upwork-english-client-reply", c, "template", "medium"),
    base("Upwork 客户需求分析怎么做", "upwork-client-requirement-analysis", c, "checklist", "medium"),
    base("Upwork 低预算加急项目要不要投", "upwork-low-budget-urgent-risk", c, "case-study", "high"),
    base("Upwork 固定价和小时价怎么选", "upwork-fixed-vs-hourly-pricing", c, "comparison", "medium"),
    base("Upwork Proposal 里哪些承诺不能写", "upwork-proposal-promises-to-avoid", c, "checklist", "high"),
    base("Upwork 新手如何筛掉高风险客户", "upwork-filter-risky-clients", c, "checklist", "high"),
    base("Upwork 网站修改单怎么估工时", "upwork-website-edit-estimate-hours", c, "pricing-guide", "medium"),
    base("Upwork Bug 修复单怎么写交付边界", "upwork-bugfix-scope-boundary", c, "template", "medium"),
    base("Upwork AI 工具配置单怎么判断能不能做", "upwork-ai-tool-setup-scope", c, "case-study", "medium"),
    base("Upwork 数据整理项目有哪些隐私风险", "upwork-data-cleaning-privacy-risk", c, "checklist", "high"),
    base("Upwork 客户要求快速上线怎么沟通", "upwork-fast-delivery-communication", c, "template", "medium"),
    base("Upwork 新手每天投几个项目更合理", "upwork-daily-proposal-rhythm", c, "roadmap", "medium"),
    base("Upwork 被忽略后怎么复盘 Proposal", "upwork-proposal-review-after-no-reply", c, "checklist", "low"),
    base("Upwork 小项目完成后怎么写交付说明", "upwork-delivery-note-template", c, "template", "low"),
    base("Upwork 客户改需求怎么处理", "upwork-scope-change-response", c, "template", "medium"),
    base("Upwork 新手如何避免虚假包装", "upwork-avoid-fake-portfolio", c, "checklist", "high"),
    base("Upwork 和 Fiverr 新手接单节奏有什么不同", "upwork-vs-fiverr-beginner-rhythm", c, "comparison", "medium"),
    base("Upwork 项目开始前要保存哪些记录", "upwork-before-start-records", c, "checklist", "medium"),
    base("Upwork 客户迟迟不确认怎么办", "upwork-client-no-confirmation", c, "template", "medium"),
  ];
}

function freelanceBases() {
  const c = "AI 自由职业路线";
  return [
    base("不会编程怎么开始 AI 接单练习", "no-code-ai-freelance-start", c, "roadmap", "medium"),
    base("AI 接单新手 7 天准备什么", "ai-freelance-first-7-days", c, "roadmap", "low"),
    base("AI 辅助交付和完全自动交付有什么区别", "ai-assisted-vs-automated-delivery", c, "comparison", "medium"),
    base("AI 自动化接单有哪些合规风险", "ai-freelance-automation-compliance-risk", c, "checklist", "high"),
    base("AI 工具组合怎么从免费开始", "ai-tools-stack-free-start", c, "tool-guide", "low"),
    base("新手 30 天 AI 接单计划怎么执行", "ai-freelance-30-day-execution", c, "roadmap", "low"),
    base("小项目训练应该选哪些题目", "ai-small-project-practice-topics", c, "checklist", "low"),
    base("第一个作品集案例怎么做才真实", "first-portfolio-case-realistic", c, "tutorial", "medium"),
    base("AI 接单技能提升路线怎么排", "ai-freelance-skill-roadmap", c, "roadmap", "medium"),
    base("从零到第一单之前要完成哪些准备", "before-first-ai-freelance-job", c, "checklist", "medium"),
    base("不会写代码怎么交付一个小网站", "deliver-small-website-with-ai-no-code", c, "tutorial", "medium"),
    base("AI 接单为什么需要人工复核", "why-ai-freelance-needs-human-review", c, "checklist", "medium"),
    base("新手如何记录每天的接单练习", "daily-ai-freelance-practice-log", c, "template", "low"),
    base("AI 接单失败后怎么复盘", "ai-freelance-failure-review", c, "checklist", "low"),
    base("AI 新手如何判断自己能不能接项目", "ai-beginner-project-fit-check", c, "checklist", "medium"),
    base("AI 接单常见误区有哪些", "ai-freelance-common-misconceptions", c, "troubleshooting", "medium"),
    base("AI 工具输出不稳定怎么降低风险", "ai-output-unstable-risk-control", c, "checklist", "medium"),
    base("自由职业新手怎么和客户确认范围", "freelance-beginner-scope-confirmation", c, "template", "medium"),
    base("AI 接单服务页文案怎么写真实", "ai-freelance-service-page-copy", c, "template", "medium"),
    base("没有客户时怎么做练习项目", "practice-projects-before-clients", c, "tutorial", "low"),
  ];
}

function debugBases() {
  const c = "报错解决";
  return [
    base("npm command not found 怎么解决", "npm-command-not-found-fix", c, "troubleshooting", "low"),
    base("Node 版本不匹配怎么排查", "node-version-mismatch-fix", c, "troubleshooting", "medium"),
    base("module not found 报错怎么定位文件", "module-not-found-debug", c, "troubleshooting", "medium"),
    base("permission denied 报错新手怎么处理", "permission-denied-fix", c, "troubleshooting", "medium"),
    base("git authentication failed 怎么解决", "git-authentication-failed-fix", c, "troubleshooting", "medium"),
    base("failed to push some refs 怎么排查", "failed-to-push-some-refs-fix", c, "troubleshooting", "medium"),
    base("Vercel build failed 常见原因有哪些", "vercel-build-failed-causes", c, "troubleshooting", "medium"),
    base("dependency conflict 依赖冲突怎么处理", "dependency-conflict-fix", c, "troubleshooting", "medium"),
    base("环境变量 missing 怎么排查", "env-variable-missing-fix", c, "troubleshooting", "high"),
    base("port already in use 怎么释放端口", "port-already-in-use-fix", c, "troubleshooting", "low"),
    base("TypeScript error 看不懂怎么办", "typescript-error-beginner-debug", c, "troubleshooting", "medium"),
    base("ESLint error 要不要直接关闭", "eslint-error-should-not-disable", c, "troubleshooting", "medium"),
    base("Next.js hydration error 怎么排查", "nextjs-hydration-error-debug", c, "troubleshooting", "medium"),
    base("Tailwind 样式不生效怎么检查", "tailwind-styles-not-working", c, "troubleshooting", "low"),
    base("API Key 无效或缺失怎么处理", "api-key-invalid-or-missing", c, "troubleshooting", "high"),
    base("GitHub Actions build 失败怎么看日志", "github-actions-build-log-debug", c, "troubleshooting", "medium"),
    base("Vercel 404 部署成功但页面打不开怎么办", "vercel-404-after-deploy", c, "troubleshooting", "medium"),
    base("npm run dev 能跑但 build 失败怎么办", "dev-works-build-fails", c, "troubleshooting", "medium"),
    base("Windows 路径和权限导致安装失败怎么办", "windows-path-permission-install-fix", c, "troubleshooting", "medium"),
    base("package lock 冲突怎么安全处理", "package-lock-conflict-fix", c, "troubleshooting", "medium"),
  ];
}

function paymentBases() {
  const c = "收款工具";
  return [
    base("Payoneer 适合新手自由职业收款吗", "payoneer-freelancer-beginner", c, "tool-guide", "medium"),
    base("Wise 收款和换汇适合什么情况", "wise-freelancer-use-cases", c, "tool-guide", "medium"),
    base("PayPal 收款有哪些常见限制", "paypal-freelancer-limits", c, "tool-guide", "medium"),
    base("Stripe 适合卖模板还是服务", "stripe-templates-vs-services", c, "comparison", "medium"),
    base("Gumroad 卖模板前要准备什么", "gumroad-template-selling-prep", c, "checklist", "medium"),
    base("Lemon Squeezy 适合数字产品吗", "lemon-squeezy-digital-products", c, "tool-guide", "medium"),
    base("Paddle 和 Stripe 有什么区别", "paddle-vs-stripe-beginner", c, "comparison", "medium"),
    base("银行卡绑定收款平台要注意什么", "bank-card-payment-platform-risk", c, "checklist", "high"),
    base("海外收款手续费怎么估算", "international-payment-fee-estimate", c, "pricing-guide", "medium"),
    base("平台内收款和站外收款怎么区分", "platform-payment-vs-direct-payment", c, "checklist", "high"),
    base("订阅支付失败怎么和客户沟通", "subscription-payment-failed-message", c, "template", "medium"),
    base("收款账户资料不一致有什么风险", "payment-account-info-mismatch-risk", c, "checklist", "high"),
    base("自由职业第一笔收款前要确认什么", "first-freelance-payment-check", c, "checklist", "medium"),
    base("Payoneer Wise PayPal 怎么选择", "payoneer-wise-paypal-choose", c, "comparison", "medium"),
    base("模板下载站什么时候接付费平台", "template-site-payment-platform-timing", c, "roadmap", "medium"),
    base("人工服务先用什么方式收款更稳妥", "service-payment-method-beginner", c, "checklist", "medium"),
    base("联盟链接收入和服务收入有什么区别", "affiliate-vs-service-income", c, "comparison", "low"),
    base("广告收入要等到什么时候再接", "ads-income-when-to-start", c, "roadmap", "low"),
    base("收款页面需要写哪些免责声明", "payment-page-disclaimer", c, "template", "medium"),
    base("数字模板退款规则怎么写更清楚", "digital-template-refund-policy", c, "template", "medium"),
  ];
}

function toolCompareBases() {
  const c = "工具导航";
  return [
    base("Codex 和 Claude Code 新手怎么选", "codex-vs-claude-code-beginner", c, "comparison", "medium"),
    base("Cursor 和 Codex 改网页有什么区别", "cursor-vs-codex-web-editing", c, "comparison", "medium"),
    base("Vercel 和 Netlify 部署小网站怎么选", "vercel-vs-netlify-small-site", c, "comparison", "low"),
    base("Wise 和 Payoneer 收款怎么选", "wise-vs-payoneer-freelancer", c, "comparison", "medium"),
    base("PayPal 和 Payoneer 哪个适合新手", "paypal-vs-payoneer-beginner", c, "comparison", "medium"),
    base("Upwork 和 Fiverr 哪个适合 AI 新手", "upwork-vs-fiverr-ai-beginner", c, "comparison", "medium"),
    base("ChatGPT 和 Claude 写 Proposal 哪个更稳", "chatgpt-vs-claude-proposal", c, "comparison", "low"),
    base("Make 和 Zapier 自动化怎么选", "make-vs-zapier-automation", c, "comparison", "medium"),
    base("Notion 管理接单流程怎么用", "notion-freelance-workflow", c, "tool-guide", "low"),
    base("Canva 做作品集封面要注意什么", "canva-portfolio-cover-tips", c, "tool-guide", "low"),
    base("Google Search Console 新站怎么用", "google-search-console-new-site", c, "tool-guide", "low"),
    base("Google Analytics 什么时候再接入", "google-analytics-when-to-add", c, "roadmap", "low"),
    base("GitHub 和 Vercel 为什么适合新手建站", "github-vercel-beginner-site", c, "tool-guide", "low"),
    base("Cloudflare 和 Namecheap 域名怎么选", "cloudflare-vs-namecheap-domain", c, "comparison", "medium"),
    base("ChatGPT Codex Claude Code 怎么分工", "chatgpt-codex-claude-workflow", c, "tool-guide", "medium"),
    base("SEO 工具新手先用哪些免费功能", "free-seo-tools-beginner", c, "tool-guide", "low"),
    base("AI 写代码工具推荐前要看哪些风险", "ai-coding-tools-risk-check", c, "checklist", "medium"),
    base("自由职业平台工具栈怎么搭配", "freelance-platform-tool-stack", c, "tool-guide", "medium"),
    base("模板下载站需要哪些基础工具", "template-download-site-tools", c, "tool-guide", "low"),
    base("新手不要一开始购买哪些工具", "tools-not-to-buy-first", c, "checklist", "low"),
  ];
}

function templateBases() {
  const c = "模板和清单";
  return [
    base("Upwork Proposal 新手模板怎么改", "upwork-proposal-template-edit", c, "template", "medium"),
    base("Upwork 客户问题清单怎么使用", "upwork-client-question-checklist", c, "checklist", "medium"),
    base("自由职业报价单模板怎么填写", "freelance-quote-template-fill", c, "pricing-guide", "medium"),
    base("项目交付检查清单应该包含什么", "project-delivery-checklist-items", c, "checklist", "medium"),
    base("客户需求沟通表怎么问才清楚", "client-requirement-form-questions", c, "template", "medium"),
    base("AI 接单每日执行表怎么安排", "ai-freelance-daily-planner", c, "template", "low"),
    base("Codex 项目启动检查表怎么用", "codex-project-start-checklist", c, "checklist", "low"),
    base("Vercel 部署检查表怎么写", "vercel-deploy-checklist-template", c, "checklist", "medium"),
    base("GitHub 常用命令表新手怎么记", "github-command-cheatsheet-beginner", c, "template", "low"),
    base("作品集页面文案模板怎么写真实", "portfolio-page-copy-template", c, "template", "medium"),
    base("英文客户回复模板怎么避免夸大", "english-client-reply-template-honest", c, "template", "medium"),
    base("项目复盘模板怎么记录问题", "project-retrospective-template", c, "template", "low"),
    base("Bug 修复交付说明模板怎么写", "bugfix-delivery-note-template", c, "template", "medium"),
    base("网站修改需求确认模板怎么用", "website-edit-scope-template", c, "template", "medium"),
    base("AI 工具配置服务清单怎么写", "ai-tool-setup-service-checklist", c, "checklist", "medium"),
    base("报价邮件模板怎么表达不确定范围", "quote-email-uncertain-scope", c, "template", "medium"),
    base("客户验收清单怎么减少返工", "client-acceptance-checklist", c, "checklist", "medium"),
    base("接单前风险评估表怎么填", "pre-project-risk-assessment-template", c, "checklist", "high"),
    base("模板下载页 CTA 文案怎么写", "template-download-cta-copy", c, "template", "low"),
    base("服务咨询表单问题怎么设计", "service-inquiry-form-questions", c, "template", "medium"),
    base("新手练习项目记录表怎么用", "practice-project-log-template", c, "template", "low"),
    base("AI 生成内容人工审核表怎么设计", "ai-content-human-review-template", c, "checklist", "medium"),
    base("Upwork 投标复盘表怎么记录", "upwork-proposal-review-sheet", c, "template", "low"),
    base("小网站上线检查 SOP 怎么写", "small-site-launch-sop", c, "checklist", "medium"),
    base("自由职业每周复盘模板怎么用", "freelance-weekly-review-template", c, "template", "low"),
  ];
}
