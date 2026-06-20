import { site } from "@/data/site";
import { getQuestionOptimizationList } from "@/lib/q-optimization-list";

export type EnglishExpansionLane = {
  lane: string;
  reason: string;
  sourceCount: number;
  seedPaths: string[];
  englishQueries: string[];
  suggestedEntryPaths: string[];
};

export type EnglishExpansionItem = {
  sourcePath: string;
  sourceUrl: string;
  sourceCategory: string;
  sourceCluster: string;
  sourceSlug: string;
  proposedEnglishTitle: string;
  proposedEnglishSlug: string;
  proposedPath: string;
  intent: string;
  targetQueries: string[];
  publishGate: "human_review_required";
  actions: string[];
};

export type EnglishExpansionPlan = {
  generatedAt: string;
  strategy: {
    targetMarket: string;
    source: string;
    status: "planning_only";
    publishGate: "human_review_required";
    noBulkTranslation: true;
    notes: string[];
  };
  totalItems: number;
  lanes: EnglishExpansionLane[];
  items: EnglishExpansionItem[];
};

export type EnglishQDraftFramework = {
  generatedAt: string;
  sourcePlanGeneratedAt: string;
  status: "draft_framework_only";
  publishGate: "human_review_required";
  pageTemplate: Array<{ section: string; purpose: string; requirements: string[] }>;
  internalLinkRules: string[];
  drafts: Array<{
    proposedPath: string;
    title: string;
    sourcePath: string;
    intent: string;
    openingAnswer: string;
    requiredSections: string[];
    targetQueries: string[];
    linkTargets: {
      cluster: string;
      sourceDeepArticle: string;
      relatedQ: string[];
    };
  }>;
};

const laneRules: Array<{ lane: string; reason: string; pattern: RegExp; queryPrefix: string }> = [
  {
    lane: "Agent deployment",
    reason: "Agent deployment, tool-calling, and workflow failures are concrete US/global builder searches.",
    pattern: /agent|tool-call|tool-calling|workflow|mcp|sdk/i,
    queryPrefix: "agent deployment",
  },
  {
    lane: "RAG and memory",
    reason: "RAG memory and retrieval problems create high-intent implementation searches.",
    pattern: /rag|memory|retrieval|vector|postgres|database/i,
    queryPrefix: "rag memory",
  },
  {
    lane: "Vercel deployment failures",
    reason: "Vercel and Next.js deployment errors are urgent problem searches with clear solutions.",
    pattern: /vercel|next-js|nextjs|deployment|deploy|env|production|serverless/i,
    queryPrefix: "vercel deployment",
  },
  {
    lane: "GitHub Actions failures",
    reason: "CI failures, workflow errors, and repository automation issues are easy to diagnose from exact queries.",
    pattern: /github|\bgit\b|git-|actions?|commit|\brepo\b|repository|\bci\b|ci\/cd|yaml/i,
    queryPrefix: "github actions",
  },
  {
    lane: "API key and rate limits",
    reason: "API key, quota, rate limit, and authentication failures are commercially valuable troubleshooting traffic.",
    pattern: /api|key|rate|limit|quota|auth|token|secret|401|403|429/i,
    queryPrefix: "api key rate limit",
  },
  {
    lane: "Node.js build errors",
    reason: "Node.js, npm, TypeScript, module, and build errors are stable evergreen search demand.",
    pattern: /node|npm|pnpm|yarn|typescript|module|build|error|failed|port|tailwind/i,
    queryPrefix: "node.js build error",
  },
  {
    lane: "Codex workflows",
    reason: "Codex setup, code review, and project automation queries match the site's existing topical authority.",
    pattern: /codex|code-review|code|automation|project/i,
    queryPrefix: "codex workflow",
  },
];

export function getEnglishExpansionPlan(limit = 50): EnglishExpansionPlan {
  const optimizationList = getQuestionOptimizationList(limit);
  const items = optimizationList.items.map((item): EnglishExpansionItem => {
    const sourceSlug = item.path.split("/").filter(Boolean).at(-1) || item.path;
    const lane = detectLane(`${item.path} ${item.category} ${item.cluster} ${item.primaryKeyword} ${item.searchIntent}`);
    const titleBase = titleFromSlug(sourceSlug);
    const proposedEnglishTitle = improveEnglishTitle(titleBase, item.searchIntent);
    const proposedEnglishSlug = slugify(proposedEnglishTitle);
    const proposedPath = `/en/q/${clusterSlugFromPath(item.path)}/${proposedEnglishSlug}`;

    return {
      sourcePath: item.path,
      sourceUrl: item.url,
      sourceCategory: item.category,
      sourceCluster: item.cluster,
      sourceSlug,
      proposedEnglishTitle,
      proposedEnglishSlug,
      proposedPath,
      intent: normalizeIntent(item.searchIntent, sourceSlug),
      targetQueries: buildTargetQueries(lane.queryPrefix, titleBase, sourceSlug),
      publishGate: "human_review_required",
      actions: [
        "Rewrite from the source structure for US/global readers; do not publish a direct machine translation.",
        "Start with the exact problem, quick fix, commands, and risk warning above the fold.",
        "Link to the matching cluster hub, three related English q entries, and the original deep article.",
        "Publish only after live URL, canonical, sitemap, and internal-link checks pass.",
      ],
    };
  });

  const lanes = laneRules.map((rule) => {
    const laneItems = items.filter((item) => detectLane(`${item.sourcePath} ${item.sourceCategory} ${item.sourceCluster} ${item.proposedEnglishTitle}`).lane === rule.lane);
    return {
      lane: rule.lane,
      reason: rule.reason,
      sourceCount: laneItems.length,
      seedPaths: laneItems.slice(0, 8).map((item) => item.sourcePath),
      englishQueries: laneItems.slice(0, 5).flatMap((item) => item.targetQueries.slice(0, 1)),
      suggestedEntryPaths: laneItems.slice(0, 8).map((item) => item.proposedPath),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    strategy: {
      targetMarket: "United States and global English-speaking developers/operators",
      source: "Existing published q/blog/cluster graph and top q optimization list",
      status: "planning_only",
      publishGate: "human_review_required",
      noBulkTranslation: true,
      notes: [
        "This file is a launch queue, not published content.",
        "The site should prioritize problem-first English pages before generic AI tool introductions.",
        "Use the custom domain canonical base when publishing: " + site.url,
        "Search Console and Bing should receive only reviewed URLs, not the full queue at once.",
      ],
    },
    totalItems: items.length,
    lanes: lanes.sort((a, b) => b.sourceCount - a.sourceCount || a.lane.localeCompare(b.lane)),
    items,
  };
}

export function getEnglishQDraftFramework(limit = 30): EnglishQDraftFramework {
  const plan = getEnglishExpansionPlan(Math.max(limit, 50));
  const drafts = plan.items.slice(0, limit).map((item, index) => {
    const related = plan.items
      .filter((candidate) => candidate.sourcePath !== item.sourcePath && candidate.sourceCategory === item.sourceCategory)
      .slice(0, 3)
      .map((candidate) => candidate.proposedPath);

    return {
      proposedPath: item.proposedPath,
      title: item.proposedEnglishTitle,
      sourcePath: item.sourcePath,
      intent: item.intent,
      openingAnswer: buildOpeningAnswer(item.proposedEnglishTitle, item.intent),
      requiredSections: [
        "What this problem means",
        "Quick fix",
        "Step-by-step solution",
        "Commands or code",
        "Risks and verification",
        "Related problems",
      ],
      targetQueries: item.targetQueries,
      linkTargets: {
        cluster: `/cluster/${clusterSlugFromPath(item.sourcePath)}`,
        sourceDeepArticle: `/blog/${item.sourceSlug}`,
        relatedQ: related.length ? related : plan.items.slice(index + 1, index + 4).map((candidate) => candidate.proposedPath),
      },
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    sourcePlanGeneratedAt: plan.generatedAt,
    status: "draft_framework_only",
    publishGate: "human_review_required",
    pageTemplate: [
      {
        section: "What this problem means",
        purpose: "Match the searcher's exact question before adding context.",
        requirements: ["Use one direct sentence.", "Avoid brand hype.", "Mention the affected tool or platform when present."],
      },
      {
        section: "Quick fix",
        purpose: "Give the fastest safe action for urgent searchers.",
        requirements: ["Keep it above the fold.", "Use bullets or numbered steps.", "State when the fix does not apply."],
      },
      {
        section: "Step-by-step solution",
        purpose: "Convert a quick answer into a complete troubleshooting path.",
        requirements: ["Use short steps.", "Include checks before destructive actions.", "Keep commands copyable."],
      },
      {
        section: "Risks and verification",
        purpose: "Reduce bad fixes and improve trust.",
        requirements: ["Add rollback notes.", "Add production cautions.", "End with a verification command or visible success condition."],
      },
      {
        section: "Related problems",
        purpose: "Strengthen the Q -> Blog -> Cluster -> Q loop.",
        requirements: ["Link one cluster hub.", "Link one deep source article.", "Link three related English q pages when they exist."],
      },
    ],
    internalLinkRules: [
      "Every English q page links to one cluster hub.",
      "Every English q page links to one deep blog source article.",
      "Every English q page links to three related English q pages before sitemap submission.",
      "No English q page enters sitemap until reviewed and linked.",
    ],
    drafts,
  };
}

function detectLane(text: string) {
  return laneRules.find((rule) => rule.pattern.test(text)) || {
    lane: "AI tools operations",
    reason: "General AI tooling pages can support the site, but should stay behind concrete problem pages.",
    pattern: /./,
    queryPrefix: "ai tools workflow",
  };
}

function clusterSlugFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[1] || "ai-tools";
}

function normalizeIntent(searchIntent: string, sourceSlug: string) {
  const text = `${searchIntent} ${sourceSlug}`.toLowerCase();
  if (/error|failed|fix|debug|troubleshoot|401|403|429/.test(text)) return "error";
  if (/compare|vs|alternative|best/.test(text)) return "comparison";
  if (/checklist/.test(text)) return "checklist";
  if (/pricing|proposal|rate|client|quote/.test(text)) return "commercial";
  return "guide";
}

function improveEnglishTitle(titleBase: string, searchIntent: string) {
  const intent = normalizeIntent(searchIntent, titleBase);
  const cleanBase = titleBase.replace(/\s+Fix$/i, "").replace(/\s+Guide$/i, "").replace(/\s+Checklist$/i, "");
  if (intent === "error") return `How to Fix ${cleanBase}`;
  if (intent === "checklist") return `${cleanBase} Checklist`;
  if (intent === "comparison") return `${titleBase}: Comparison and Decision Guide`;
  if (intent === "commercial") return `${titleBase}: Pricing and Delivery Guide`;
  return `${titleBase}: Step-by-Step Guide`;
}

function buildTargetQueries(prefix: string, titleBase: string, sourceSlug: string) {
  const normalized = titleBase.toLowerCase();
  const compact = sourceSlug.replace(/-/g, " ");
  return Array.from(
    new Set([
      `how to fix ${normalized}`,
      `${prefix} ${compact}`,
      `${normalized} step by step`,
      `${normalized} checklist`,
      `${normalized} best practice`,
    ]),
  ).slice(0, 5);
}

function buildOpeningAnswer(title: string, intent: string) {
  if (intent === "error") return `${title} usually means the setup, credentials, dependency, or deployment environment is inconsistent. Start by reproducing the error, checking the exact failing step, and applying the smallest reversible fix.`;
  if (intent === "checklist") return `${title} is a pre-launch checklist for reducing production risk before searchers ship the workflow. Use it to verify configuration, links, logs, and rollback paths.`;
  if (intent === "comparison") return `${title} should help the reader choose based on constraints, not popularity. Compare the tools by deployment fit, cost, maintenance, and failure modes.`;
  return `${title} should answer the exact task first, then show the practical steps, commands, risks, and related fixes needed to complete it.`;
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(formatToken)
    .join(" ");
}

function formatToken(token: string) {
  const upper = new Set(["ai", "api", "rag", "llm", "seo", "sdk", "mcp", "gsc", "faq", "ci", "cd", "ui", "ux", "ppt", "pdf", "json", "yaml", "env", "npm"]);
  if (upper.has(token)) return token.toUpperCase();
  if (token === "js") return "JS";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
