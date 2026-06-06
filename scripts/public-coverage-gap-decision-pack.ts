import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type PublicLinkSuggestion = {
  reason: string;
  score: number;
  title: string;
  url: string;
};

type PreflightItem = {
  approvalWave: number;
  blockingIssues: string[];
  exactSeedMatches: number;
  file: string;
  linksToPublicArticles: number;
  missingSubtopics: string[];
  publicLinkSuggestions: PublicLinkSuggestion[];
  readyForManualReview: boolean;
  reviewFocus: string[];
  safeDraft: boolean;
  searchSeeds: string[];
  seedFamilyMatches: number;
  sourceTargets: string[];
  structuredDataReady: boolean;
  themeTitle: string;
  title: string;
  warningIssues: string[];
};

type Preflight = {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
  items: PreflightItem[];
  summary: {
    blockingItems: number;
    items: number;
    readyItems: number;
    warningItems: number;
    withPublicLinkSuggestions: number;
    withSeedMatches: number;
  };
};

type Decision = "blocked" | "human-review-ready" | "human-review-ready-with-optimizations";

type DecisionItem = {
  approvalWave: number;
  blockingIssues: string[];
  commandsAfterExplicitApproval: {
    markReview: string;
    publishDryRun: string;
  };
  decision: Decision;
  file: string;
  humanDecisionChecklist: string[];
  publicLinkSuggestion: PublicLinkSuggestion | null;
  readyForManualReview: boolean;
  reviewPacket: {
    missingSubtopics: string[];
    reviewFocus: string[];
    searchSeedEvidence: {
      exactSeedMatches: number;
      searchSeeds: string[];
      seedFamilyMatches: number;
    };
    sourceTargets: string[];
    warningIssues: string[];
  };
  riskLevel: "high" | "low" | "medium";
  stopBefore: string;
  suggestedOptimizations: string[];
  themeTitle: string;
  title: string;
};

async function main() {
  const preflight = readJson<Preflight>("content/automation/public-coverage-gap-preflight.json");
  const items = preflight.items.map(toDecisionItem);
  const waveSummaries = toWaveSummaries(items);
  const blockingItems = items.filter((item) => item.decision === "blocked");
  const optimizationActions = items.reduce((sum, item) => sum + item.suggestedOptimizations.length, 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only human decision pack for public coverage gap candidates. It does not edit article content, metadata, status, noindex, review state, or publishing state.",
      stopBefore: "Only use these commands after explicit human approval. Never run mark:review --confirm-human or publish:articles --confirm automatically.",
    },
    sourceEvidence: {
      preflightGeneratedAt: preflight.generatedAt,
      preflightGuardrails: preflight.guardrails,
      preflightSummary: preflight.summary,
      trafficNote: "Search seeds and link suggestions are editorial signals, not measured rankings, impressions, clicks, traffic, or income.",
    },
    summary: {
      blockingItems: blockingItems.length,
      items: items.length,
      itemsWithCommandBoundary: items.filter((item) => hasCommandBoundary(item)).length,
      itemsWithHumanChecklist: items.filter((item) => item.humanDecisionChecklist.length >= 5).length,
      itemsWithPublicLinkSuggestion: items.filter((item) => item.publicLinkSuggestion).length,
      itemsWithSourceTargets: items.filter((item) => item.reviewPacket.sourceTargets.length >= 2).length,
      itemsWithWarningRemediation: items.filter((item) => item.suggestedOptimizations.length > 0 || item.blockingIssues.length > 0).length,
      optimizationActions,
      readyItems: items.filter((item) => item.readyForManualReview).length,
      reviewReadyWithOptimizations: items.filter((item) => item.decision === "human-review-ready-with-optimizations").length,
      unsafeItems: items.filter((item) => item.riskLevel === "high").length,
      waves: waveSummaries.length,
    },
    waveSummaries,
    blockingItems,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "public-coverage-gap-decision-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "public-coverage-gap-decision-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: blockingItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (blockingItems.length) process.exitCode = 1;
}

function toDecisionItem(item: PreflightItem): DecisionItem {
  const decision = decisionFor(item);
  const publicLinkSuggestion = item.publicLinkSuggestions[0] || null;
  const warningIssues = item.warningIssues || [];
  return {
    approvalWave: item.approvalWave,
    blockingIssues: item.blockingIssues,
    commandsAfterExplicitApproval: {
      markReview: `npm run mark:review -- --file=${item.file} --confirm-human`,
      publishDryRun: `npm run publish:articles -- --file=${item.file}`,
    },
    decision,
    file: item.file,
    humanDecisionChecklist: [
      "Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.",
      "Verify source targets and remove or rewrite any unsupported claims.",
      "Decide whether the warning issues must be fixed before mark:review.",
      "Choose one public internal link suggestion or document why no link should be added.",
      "Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.",
      "Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.",
    ],
    publicLinkSuggestion,
    readyForManualReview: item.readyForManualReview,
    reviewPacket: {
      missingSubtopics: item.missingSubtopics,
      reviewFocus: item.reviewFocus,
      searchSeedEvidence: {
        exactSeedMatches: item.exactSeedMatches,
        searchSeeds: item.searchSeeds,
        seedFamilyMatches: item.seedFamilyMatches,
      },
      sourceTargets: item.sourceTargets,
      warningIssues,
    },
    riskLevel: riskLevelFor(item),
    stopBefore: "Stop before mark:review and stop before publish. Both require explicit human approval.",
    suggestedOptimizations: optimizationActionsFor(item, publicLinkSuggestion),
    themeTitle: item.themeTitle,
    title: item.title,
  };
}

function decisionFor(item: PreflightItem): Decision {
  if (item.blockingIssues.length > 0 || !item.readyForManualReview || !item.safeDraft || !item.structuredDataReady) return "blocked";
  if (item.warningIssues.length > 0) return "human-review-ready-with-optimizations";
  return "human-review-ready";
}

function riskLevelFor(item: PreflightItem): DecisionItem["riskLevel"] {
  if (item.blockingIssues.length > 0 || !item.readyForManualReview || !item.safeDraft || !item.structuredDataReady) return "high";
  if (item.warningIssues.length >= 3 || item.linksToPublicArticles === 0 || item.exactSeedMatches === 0) return "medium";
  return "low";
}

function optimizationActionsFor(item: PreflightItem, publicLinkSuggestion: PublicLinkSuggestion | null) {
  const actions = new Set<string>();
  for (const warning of item.warningIssues) {
    if (warning.includes("no exact search-seed phrase")) {
      actions.add("During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.");
    } else if (warning.includes("few search-seed token families")) {
      actions.add("Add or approve one concrete subsection that matches the target search intent without keyword stuffing.");
    } else if (warning.includes("no links to published articles")) {
      actions.add(
        publicLinkSuggestion
          ? `Review the suggested public internal link before publishing: ${publicLinkSuggestion.title} (${publicLinkSuggestion.url}).`
          : "Add one relevant public internal link before publishing or document why the article should remain unlinked.",
      );
    } else if (warning.includes("missing subtopics")) {
      actions.add("Decide whether missing subtopics belong in this article or should become separate follow-up drafts.");
    } else if (warning.includes("primary keyword")) {
      actions.add("Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.");
    } else if (warning.includes("description")) {
      actions.add("Tighten the meta description so it states the search intent, audience, and outcome clearly.");
    } else if (warning.includes("title")) {
      actions.add("Review title length and clarity before mark:review.");
    } else {
      actions.add(`Resolve or explicitly accept warning during human review: ${warning}.`);
    }
  }
  if (!actions.size && item.blockingIssues.length > 0) actions.add("Resolve all blocking issues before any review or publishing command.");
  return [...actions];
}

function hasCommandBoundary(item: DecisionItem) {
  return (
    item.stopBefore.includes("explicit human approval") &&
    item.commandsAfterExplicitApproval.markReview.includes("--confirm-human") &&
    !item.commandsAfterExplicitApproval.publishDryRun.includes("--confirm")
  );
}

function toWaveSummaries(items: DecisionItem[]) {
  const waves = [...new Set(items.map((item) => item.approvalWave))].sort((a, b) => a - b);
  return waves.map((wave) => {
    const waveItems = items.filter((item) => item.approvalWave === wave);
    return {
      blockingItems: waveItems.filter((item) => item.decision === "blocked").length,
      files: waveItems.map((item) => item.file),
      optimizationActions: waveItems.reduce((sum, item) => sum + item.suggestedOptimizations.length, 0),
      readyItems: waveItems.filter((item) => item.readyForManualReview).length,
      themes: waveItems.map((item) => item.themeTitle),
      wave,
    };
  });
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  blockingItems: DecisionItem[];
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  items: DecisionItem[];
  sourceEvidence: Record<string, unknown>;
  summary: Record<string, number>;
  waveSummaries: Array<{ blockingItems: number; files: string[]; optimizationActions: number; readyItems: number; themes: string[]; wave: number }>;
}) {
  const lines = [
    "# Public Coverage Gap Decision Pack",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It turns public coverage gap preflight warnings into human review decisions and explicit command boundaries.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Source Evidence",
    "",
    `- Preflight generated at: ${payload.sourceEvidence.preflightGeneratedAt}`,
    `- Traffic note: ${payload.sourceEvidence.trafficNote}`,
    `- Preflight summary: ${JSON.stringify(payload.sourceEvidence.preflightSummary)}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Wave Decisions",
    "",
    "| Wave | Ready | Blocking | Optimization actions | Themes | Files |",
    "| --- | --- | --- | --- | --- | --- |",
    ...payload.waveSummaries.map(
      (item) => `| ${item.wave} | ${item.readyItems}/${item.files.length} | ${item.blockingItems} | ${item.optimizationActions} | ${item.themes.join("<br>")} | ${item.files.join("<br>")} |`,
    ),
    "",
    "## Blocking Items",
    "",
    ...decisionTable(payload.blockingItems),
    "",
    "## All Decision Items",
    "",
    ...decisionTable(payload.items),
    "",
    "## Per-Item Review Packets",
    "",
    ...payload.items.flatMap((item) => itemSection(item)),
    "",
  ];

  return lines.join("\n");
}

function decisionTable(items: DecisionItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Wave | Decision | Risk | Sources | Seeds | Link suggestion | Actions | Theme | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.approvalWave} | ${item.decision} | ${item.riskLevel} | ${item.reviewPacket.sourceTargets.length} | ${item.reviewPacket.searchSeedEvidence.exactSeedMatches}/${item.reviewPacket.searchSeedEvidence.seedFamilyMatches} | ${item.publicLinkSuggestion ? item.publicLinkSuggestion.url : "missing"} | ${item.suggestedOptimizations.length} | ${item.themeTitle} | ${item.title} | ${item.file} |`,
    ),
  ];
}

function itemSection(item: DecisionItem) {
  return [
    `### ${item.title}`,
    "",
    `- File: ${item.file}`,
    `- Theme: ${item.themeTitle}`,
    `- Wave: ${item.approvalWave}`,
    `- Decision: ${item.decision}`,
    `- Risk level: ${item.riskLevel}`,
    `- Stop before: ${item.stopBefore}`,
    `- Public link suggestion: ${item.publicLinkSuggestion ? `${item.publicLinkSuggestion.title} (${item.publicLinkSuggestion.url})` : "missing"}`,
    "",
    "Review focus:",
    "",
    ...item.reviewPacket.reviewFocus.map((entry) => `- ${entry}`),
    "",
    "Source targets:",
    "",
    ...item.reviewPacket.sourceTargets.map((entry) => `- ${entry}`),
    "",
    "Suggested optimizations:",
    "",
    ...(item.suggestedOptimizations.length ? item.suggestedOptimizations.map((entry) => `- ${entry}`) : ["- none"]),
    "",
    "Human decision checklist:",
    "",
    ...item.humanDecisionChecklist.map((entry) => `- ${entry}`),
    "",
    "Commands after explicit approval:",
    "",
    `- Mark review: \`${item.commandsAfterExplicitApproval.markReview}\``,
    `- Publish dry-run: \`${item.commandsAfterExplicitApproval.publishDryRun}\``,
    "",
  ];
}

void main();
