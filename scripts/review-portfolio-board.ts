import fs from "fs";
import path from "path";
import { readArticle, rel } from "./content-utils";

type WaveApprovalPacket = {
  items: Array<{
    file: string;
    humanReviewCommand?: string;
    officialSourceTargets: string[];
    publishDryRunCommand?: string;
    readyForHumanReview: boolean;
    riskReviewChecklist: string[];
    title: string;
  }>;
};

type PublicGapDecisionPack = {
  items: Array<{
    commandsAfterExplicitApproval: { markReview: string; publishDryRun: string };
    decision: string;
    file: string;
    readyForManualReview: boolean;
    reviewPacket: { searchSeedEvidence?: { searchSeeds?: string[] }; sourceTargets: string[] };
    suggestedOptimizations: string[];
    themeTitle: string;
    title: string;
  }>;
};

type ReviewPackItem = {
  commandBoundary: {
    markReviewAfterHumanApproval: string;
    publishConfirm: "not-included";
    publishDryRunAfterReview: string;
    stopBefore: string;
  };
  file: string;
  humanDecisionChecklist: string[];
  priorityScore: number;
  readyForHumanReview: boolean;
  riskChecks: string[];
  safeDraft: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  title: string;
};

type ReviewPack = {
  items: ReviewPackItem[];
};

type ProjectStatus = {
  articles: { publicPublished: number; publishableNow: unknown[]; statusCounts: Record<string, number> };
};

type TrafficEvidence = {
  summary: { canClaimTraffic: boolean; trafficDataAvailable: boolean };
};

type SourceCandidate = {
  commandBoundary: ReviewPackItem["commandBoundary"];
  file: string;
  priorityScore: number;
  ready: boolean;
  reviewChecklistCount: number;
  searchQueries: string[];
  sourceTargets: string[];
  sourceType: "deployment" | "prompt" | "public-gap" | "wave";
  title: string;
};

type PortfolioItem = {
  commandBoundary: ReviewPackItem["commandBoundary"];
  file: string;
  humanActionPlan: string[];
  priorityScore: number;
  readyForHumanReview: boolean;
  reviewChecklistCount: number;
  safeDraft: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  sourceTypes: SourceCandidate["sourceType"][];
  status: string;
  title: string;
};

function main() {
  const wave = readJson<WaveApprovalPacket>("content/automation/wave-approval-packet.json");
  const publicGap = readJson<PublicGapDecisionPack>("content/automation/public-coverage-gap-decision-pack.json");
  const deployment = readJson<ReviewPack>("content/automation/ai-deployment-review-pack.json");
  const prompt = readJson<ReviewPack>("content/automation/industry-prompt-review-pack.json");
  const project = readJson<ProjectStatus>("content/automation/project-status.json");
  const traffic = readJson<TrafficEvidence>("content/automation/traffic-evidence-audit.json");

  const sourceCandidates = [
    ...wave.items.map(fromWave),
    ...publicGap.items.map(fromPublicGap),
    ...deployment.items.map((item) => fromReviewPack(item, "deployment")),
    ...prompt.items.map((item) => fromReviewPack(item, "prompt")),
  ];
  const items = toPortfolioItems(sourceCandidates);
  const unsafeItems = items.filter((item) => !isSafeItem(item));
  const duplicateMentions = sourceCandidates.length - items.length;
  const multiSourceItems = items.filter((item) => item.sourceTypes.length > 1);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only review portfolio board. It deduplicates Wave, public-gap, deployment, and industry-prompt review candidates and does not edit, mark review, or publish.",
      stopBefore: "Every mark:review command requires explicit human approval. publish --confirm commands are intentionally not included.",
    },
    publishingBoundary: {
      publicPublished: project.articles.publicPublished,
      publishableNow: project.articles.publishableNow.length,
      statusCounts: project.articles.statusCounts,
    },
    trafficBoundary: {
      canClaimTraffic: traffic.summary.canClaimTraffic,
      trafficDataAvailable: traffic.summary.trafficDataAvailable,
    },
    sourceCounts: {
      deployment: deployment.items.length,
      prompt: prompt.items.length,
      publicGap: publicGap.items.length,
      wave: wave.items.length,
    },
    summary: {
      duplicateMentions,
      items: items.length,
      itemsWithCommandBoundary: items.filter(hasCommandBoundary).length,
      itemsWithMultipleSources: multiSourceItems.length,
      itemsWithSearchQueries: items.filter((item) => item.searchQueries.length > 0).length,
      itemsWithSourceTargets: items.filter((item) => item.sourceTargets.length > 0).length,
      readyItems: items.filter((item) => item.readyForHumanReview).length,
      safeDraftItems: items.filter((item) => item.safeDraft).length,
      sourceCandidates: sourceCandidates.length,
      unsafeItems: unsafeItems.length,
    },
    unsafeItems,
    multiSourceItems,
    nextItems: items.slice(0, 8),
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "review-portfolio-board.json");
  const mdTarget = path.join(process.cwd(), "docs", "review-portfolio-board.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function fromWave(item: WaveApprovalPacket["items"][number]): SourceCandidate {
  return {
    commandBoundary: {
      markReviewAfterHumanApproval: item.humanReviewCommand || `npm run mark:review -- --file=${item.file} --confirm-human`,
      publishDryRunAfterReview: item.publishDryRunCommand || `npm run publish:articles -- --file=${item.file}`,
      publishConfirm: "not-included",
      stopBefore: "Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.",
    },
    file: item.file,
    priorityScore: 1200,
    ready: item.readyForHumanReview,
    reviewChecklistCount: item.riskReviewChecklist.length,
    searchQueries: [],
    sourceTargets: item.officialSourceTargets,
    sourceType: "wave",
    title: item.title,
  };
}

function fromPublicGap(item: PublicGapDecisionPack["items"][number]): SourceCandidate {
  return {
    commandBoundary: {
      markReviewAfterHumanApproval: item.commandsAfterExplicitApproval.markReview,
      publishDryRunAfterReview: item.commandsAfterExplicitApproval.publishDryRun,
      publishConfirm: "not-included",
      stopBefore: "Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.",
    },
    file: item.file,
    priorityScore: item.decision === "human-review-ready-with-optimizations" ? 900 : 850,
    ready: item.readyForManualReview,
    reviewChecklistCount: item.suggestedOptimizations.length,
    searchQueries: item.reviewPacket.searchSeedEvidence?.searchSeeds || [],
    sourceTargets: item.reviewPacket.sourceTargets,
    sourceType: "public-gap",
    title: item.title,
  };
}

function fromReviewPack(item: ReviewPackItem, sourceType: "deployment" | "prompt"): SourceCandidate {
  return {
    commandBoundary: item.commandBoundary,
    file: item.file,
    priorityScore: item.priorityScore,
    ready: item.readyForHumanReview && item.safeDraft,
    reviewChecklistCount: item.humanDecisionChecklist.length + item.riskChecks.length,
    searchQueries: item.searchQueries,
    sourceTargets: item.sourceTargets,
    sourceType,
    title: item.title,
  };
}

function toPortfolioItems(candidates: SourceCandidate[]) {
  const byFile = new Map<string, SourceCandidate[]>();
  for (const candidate of candidates) {
    const current = byFile.get(candidate.file) || [];
    current.push(candidate);
    byFile.set(candidate.file, current);
  }

  return [...byFile.entries()]
    .map(([file, fileCandidates]) => {
      const article = readArticle(file);
      const best = fileCandidates.sort((a, b) => b.priorityScore - a.priorityScore)[0];
      const sourceTypes = [...new Set(fileCandidates.map((candidate) => candidate.sourceType))].sort() as SourceCandidate["sourceType"][];
      const sourceTargets = unique(fileCandidates.flatMap((candidate) => candidate.sourceTargets));
      const searchQueries = unique(fileCandidates.flatMap((candidate) => candidate.searchQueries));
      const safeDraft = article.data.status === "draft" && article.data.noindex === true && article.data.humanReviewRequired === true;
      const item: PortfolioItem = {
        commandBoundary: best.commandBoundary,
        file,
        humanActionPlan: [
          `Review source lanes together: ${sourceTypes.join(", ")}.`,
          `Verify ${sourceTargets.length} official source target(s) before any approval.`,
          searchQueries.length ? `Check search intent against ${Math.min(searchQueries.length, 6)} query seed(s).` : "Confirm search intent from the source review packet.",
          "Resolve or explicitly accept snippet, structured-data, freshness, and cannibalization warnings before mark:review.",
          "Confirm no traffic, ranking, revenue, benchmark, or stability claim is unsupported.",
          "Run mark:review only after explicit human approval; publishing requires a separate explicit approval.",
        ],
        priorityScore: Math.max(...fileCandidates.map((candidate) => candidate.priorityScore)) + sourceTypes.length * 25,
        readyForHumanReview: safeDraft && fileCandidates.every((candidate) => candidate.ready) && hasCommandBoundary(best) && sourceTargets.length > 0,
        reviewChecklistCount: fileCandidates.reduce((sum, candidate) => sum + candidate.reviewChecklistCount, 0),
        safeDraft,
        searchQueries,
        sourceTargets,
        sourceTypes,
        status: String(article.data.status || ""),
        title: best.title,
      };
      return item;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || a.file.localeCompare(b.file));
}

function isSafeItem(item: PortfolioItem) {
  return item.readyForHumanReview && item.safeDraft && hasCommandBoundary(item) && item.sourceTargets.length > 0 && item.commandBoundary.publishConfirm === "not-included";
}

function hasCommandBoundary(item: { commandBoundary?: Partial<ReviewPackItem["commandBoundary"]> }) {
  return (
    item.commandBoundary?.markReviewAfterHumanApproval?.includes("--confirm-human") === true &&
    item.commandBoundary?.publishDryRunAfterReview?.includes("--confirm") !== true &&
    item.commandBoundary?.publishConfirm === "not-included" &&
    item.commandBoundary?.stopBefore?.includes("explicit human approval") === true
  );
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  items: PortfolioItem[];
  multiSourceItems: PortfolioItem[];
  nextItems: PortfolioItem[];
  publishingBoundary: { publicPublished: number; publishableNow: number; statusCounts: Record<string, number> };
  sourceCounts: Record<string, number>;
  summary: Record<string, number>;
  trafficBoundary: { canClaimTraffic: boolean; trafficDataAvailable: boolean };
  unsafeItems: PortfolioItem[];
}) {
  const lines = [
    "# Review Portfolio Board",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It deduplicates review candidates across Wave, public-gap, deployment, and industry-prompt packs.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    "",
    "## Boundaries",
    "",
    `- Public published: ${payload.publishingBoundary.publicPublished}`,
    `- Publishable now: ${payload.publishingBoundary.publishableNow}`,
    `- Traffic data available: ${payload.trafficBoundary.trafficDataAvailable}`,
    `- Can claim traffic: ${payload.trafficBoundary.canClaimTraffic}`,
    "",
    "## Source Counts",
    "",
    ...Object.entries(payload.sourceCounts).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...itemTable(payload.unsafeItems),
    "",
    "## Multi-Source Items",
    "",
    ...itemTable(payload.multiSourceItems),
    "",
    "## Next Items",
    "",
    ...itemTable(payload.nextItems),
    "",
    "## All Items",
    "",
    ...itemTable(payload.items),
    "",
    "## Per-Item Action Plans",
    "",
    ...payload.items.flatMap(itemSection),
    "",
  ];
  return lines.join("\n");
}

function itemTable(items: PortfolioItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Ready | Safe | Score | Sources | Official refs | Queries | Checklists | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.readyForHumanReview} | ${item.safeDraft} | ${item.priorityScore} | ${item.sourceTypes.join(", ")} | ${item.sourceTargets.length} | ${item.searchQueries.length} | ${item.reviewChecklistCount} | ${item.title} | ${item.file} |`,
    ),
  ];
}

function itemSection(item: PortfolioItem) {
  return [
    `### ${item.title}`,
    "",
    `- File: ${item.file}`,
    `- Source types: ${item.sourceTypes.join(", ")}`,
    `- Ready for human review: ${item.readyForHumanReview}`,
    `- Status: ${item.status}`,
    "",
    "Human action plan:",
    "",
    ...item.humanActionPlan.map((action) => `- ${action}`),
    "",
    "Command boundary:",
    "",
    `- Mark review after human approval: \`${item.commandBoundary.markReviewAfterHumanApproval}\``,
    `- Publish dry-run after review: \`${item.commandBoundary.publishDryRunAfterReview}\``,
    `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
    "",
  ];
}

main();
