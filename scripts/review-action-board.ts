import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

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
  summary: { items: number; readyForHumanReview: number; unsafeItems: number; wave: number };
};

type PublishReadinessPack = {
  items: Array<{
    factCheckQueries: string[];
    file: string;
    humanDecisionChecklist: string[];
    officialSourceTargets: string[];
    riskReviewChecklist: string[];
    title: string;
  }>;
};

type PublicGapDecisionPack = {
  items: Array<{
    approvalWave: number;
    commandsAfterExplicitApproval: { markReview: string; publishDryRun: string };
    decision: string;
    file: string;
    publicLinkSuggestion: { title: string; url: string } | null;
    readyForManualReview: boolean;
    reviewPacket: { sourceTargets: string[]; warningIssues: string[] };
    riskLevel: string;
    suggestedOptimizations: string[];
    themeTitle: string;
    title: string;
  }>;
  summary: { blockingItems: number; items: number; readyItems: number; unsafeItems: number; waves: number };
};

type InternalLinks = {
  candidateItems: Array<{
    file: string;
    linksToPublicArticles: number;
    suggestions: Array<{ title: string; url: string }>;
  }>;
};

type SearchSnippets = {
  warningItems: Array<{ file: string; issues: string[]; warnings: string[] }>;
  waveItems: Array<{ file: string; issues: string[]; warnings: string[] }>;
};

type StructuredData = {
  warningItems: Array<{ file: string; issues: string[]; warnings: string[] }>;
  waveItems: Array<{ file: string; issues: string[]; warnings: string[] }>;
};

type SourceHealth = {
  files: Array<{ file: string; reachableSources: number; sourceTargets: number }>;
  summary: { filesWithoutReachableSource: number; missingUrlTargets: number };
};

type TrafficEvidence = {
  summary: { canClaimTraffic: boolean; trafficDataAvailable: boolean };
};

type ProjectStatus = {
  articles: { publicPublished: number; publishableNow: unknown[]; statusCounts: Record<string, number> };
};

type ActionTask = {
  actionItems: string[];
  blockers: string[];
  commandBoundary: {
    markReviewAfterHumanApproval: string;
    publishDryRunAfterReview: string;
    publishConfirm: "not-included";
    stopBefore: string;
  };
  file: string;
  kind: "public-gap-review" | "wave-approval";
  priority: number;
  ready: boolean;
  scope: string;
  sourceTargets: number;
  title: string;
  warnings: string[];
};

function main() {
  const waveApproval = readJson<WaveApprovalPacket>("content/automation/wave-approval-packet.json");
  const publishPack = readJson<PublishReadinessPack>("content/automation/publish-readiness-pack.json");
  const publicGap = readJson<PublicGapDecisionPack>("content/automation/public-coverage-gap-decision-pack.json");
  const internalLinks = readJson<InternalLinks>("content/automation/internal-link-opportunity-audit.json");
  const searchSnippets = readJson<SearchSnippets>("content/automation/search-snippet-readiness-audit.json");
  const structuredData = readJson<StructuredData>("content/automation/structured-data-readiness-audit.json");
  const sourceHealth = readJson<SourceHealth>("content/automation/source-target-health-audit.json");
  const traffic = readJson<TrafficEvidence>("content/automation/traffic-evidence-audit.json");
  const project = readJson<ProjectStatus>("content/automation/project-status.json");

  const publishByFile = new Map(publishPack.items.map((item) => [item.file, item]));
  const linksByFile = new Map(internalLinks.candidateItems.map((item) => [item.file, item]));
  const snippetByFile = new Map([...searchSnippets.warningItems, ...searchSnippets.waveItems].map((item) => [item.file, item]));
  const structuredByFile = new Map([...structuredData.warningItems, ...structuredData.waveItems].map((item) => [item.file, item]));
  const sourceByFile = new Map(sourceHealth.files.map((item) => [item.file, item]));

  const waveTasks = waveApproval.items.map((item, index) =>
    buildWaveTask(item, index, publishByFile.get(item.file), linksByFile.get(item.file), snippetByFile.get(item.file), structuredByFile.get(item.file), sourceByFile.get(item.file)),
  );
  const publicGapTasks = publicGap.items.map((item, index) =>
    buildPublicGapTask(item, index, linksByFile.get(item.file), snippetByFile.get(item.file), structuredByFile.get(item.file), sourceByFile.get(item.file)),
  );
  const tasks = [...waveTasks, ...publicGapTasks].sort((a, b) => b.priority - a.priority || a.file.localeCompare(b.file));
  const unsafeTasks = tasks.filter((task) => task.blockers.length > 0 || task.commandBoundary.publishConfirm !== "not-included");
  const readyTasks = tasks.filter((task) => task.ready);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only review action board. It prioritizes human review tasks and does not edit articles, mark review, or publish.",
      stopBefore: "Every mark:review command requires explicit human approval. publish --confirm commands are intentionally not included.",
    },
    publishingBoundary: {
      publicPublished: project.articles.publicPublished,
      publishableNow: project.articles.publishableNow.length,
      statusCounts: project.articles.statusCounts,
    },
    sourceHealth: sourceHealth.summary,
    trafficBoundary: {
      canClaimTraffic: traffic.summary.canClaimTraffic,
      trafficDataAvailable: traffic.summary.trafficDataAvailable,
    },
    summary: {
      publicGapReadyTasks: publicGapTasks.filter((task) => task.ready).length,
      publicGapTasks: publicGapTasks.length,
      readyTasks: readyTasks.length,
      tasks: tasks.length,
      unsafeTasks: unsafeTasks.length,
      waveReadyTasks: waveTasks.filter((task) => task.ready).length,
      waveTasks: waveTasks.length,
    },
    unsafeTasks,
    nextTasks: readyTasks.slice(0, 6),
    tasks,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "review-action-board.json");
  const mdTarget = path.join(process.cwd(), "docs", "review-action-board.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeTasks.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeTasks.length) process.exitCode = 1;
}

function buildWaveTask(
  item: WaveApprovalPacket["items"][number],
  index: number,
  packItem: PublishReadinessPack["items"][number] | undefined,
  linkItem: InternalLinks["candidateItems"][number] | undefined,
  snippetItem: SearchSnippets["waveItems"][number] | undefined,
  structuredItem: StructuredData["waveItems"][number] | undefined,
  sourceItem: SourceHealth["files"][number] | undefined,
): ActionTask {
  const blockers = [
    item.readyForHumanReview ? "" : "wave approval item is not ready for human review",
    packItem ? "" : "missing publish readiness pack item",
    sourceItem && sourceItem.reachableSources > 0 ? "" : "missing reachable official source",
    snippetItem?.issues?.length ? "search snippet has blocking issues" : "",
    structuredItem?.issues?.length ? "structured data has blocking issues" : "",
  ].filter(Boolean);
  const warnings = [...(snippetItem?.warnings || []), ...(structuredItem?.warnings || [])];
  const suggestions = linkItem?.suggestions || [];
  return {
    actionItems: [
      "Read the article end to end and confirm the opening answer matches search intent.",
      `Open ${packItem?.officialSourceTargets.length || item.officialSourceTargets.length} official source target(s) and verify fast-changing claims.`,
      `Run through ${packItem?.riskReviewChecklist.length || item.riskReviewChecklist.length} risk review checks.`,
      suggestions[0] ? `Choose or reject public internal link suggestion: ${suggestions[0].title} (${suggestions[0].url}).` : "Confirm public internal link plan before publishing.",
      warnings.length ? "Resolve or explicitly accept snippet/structured-data warnings before mark:review." : "Confirm snippet and structured-data checks remain clean.",
    ],
    blockers,
    commandBoundary: {
      markReviewAfterHumanApproval: item.humanReviewCommand || `npm run mark:review -- --file=${item.file} --confirm-human`,
      publishDryRunAfterReview: item.publishDryRunCommand || `npm run publish:articles -- --file=${item.file}`,
      publishConfirm: "not-included",
      stopBefore: "Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.",
    },
    file: item.file,
    kind: "wave-approval",
    priority: 1000 - index * 10 + (sourceItem?.reachableSources || 0),
    ready: blockers.length === 0,
    scope: `wave-${index + 1}`,
    sourceTargets: sourceItem?.sourceTargets || item.officialSourceTargets.length,
    title: item.title,
    warnings,
  };
}

function buildPublicGapTask(
  item: PublicGapDecisionPack["items"][number],
  index: number,
  linkItem: InternalLinks["candidateItems"][number] | undefined,
  snippetItem: SearchSnippets["warningItems"][number] | undefined,
  structuredItem: StructuredData["warningItems"][number] | undefined,
  sourceItem: SourceHealth["files"][number] | undefined,
): ActionTask {
  const blockers = [
    item.readyForManualReview ? "" : "public gap item is not ready for manual review",
    item.decision === "blocked" ? "public gap decision is blocked" : "",
    sourceItem && sourceItem.reachableSources > 0 ? "" : "missing reachable official source",
    item.commandsAfterExplicitApproval.markReview.includes("--confirm-human") ? "" : "mark review command is missing human confirmation flag",
    item.commandsAfterExplicitApproval.publishDryRun.includes("--confirm") ? "publish dry-run command must not include --confirm" : "",
  ].filter(Boolean);
  const warnings = [...item.reviewPacket.warningIssues, ...(snippetItem?.warnings || []), ...(structuredItem?.warnings || [])];
  const suggestedLink = item.publicLinkSuggestion || linkItem?.suggestions[0] || null;
  return {
    actionItems: [
      `Review theme gap: ${item.themeTitle}.`,
      `Verify ${item.reviewPacket.sourceTargets.length} source target(s) and source freshness.`,
      ...item.suggestedOptimizations.slice(0, 4),
      suggestedLink ? `Choose or reject public internal link suggestion: ${suggestedLink.title} (${suggestedLink.url}).` : "Confirm public internal link plan before publishing.",
    ],
    blockers,
    commandBoundary: {
      markReviewAfterHumanApproval: item.commandsAfterExplicitApproval.markReview,
      publishDryRunAfterReview: item.commandsAfterExplicitApproval.publishDryRun,
      publishConfirm: "not-included",
      stopBefore: "Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.",
    },
    file: item.file,
    kind: "public-gap-review",
    priority: 800 - item.approvalWave * 20 - index + (sourceItem?.reachableSources || 0),
    ready: blockers.length === 0,
    scope: `public-gap-wave-${item.approvalWave}`,
    sourceTargets: sourceItem?.sourceTargets || item.reviewPacket.sourceTargets.length,
    title: item.title,
    warnings,
  };
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  nextTasks: ActionTask[];
  publishingBoundary: { publicPublished: number; publishableNow: number; statusCounts: Record<string, number> };
  sourceHealth: SourceHealth["summary"];
  summary: Record<string, number>;
  tasks: ActionTask[];
  trafficBoundary: { canClaimTraffic: boolean; trafficDataAvailable: boolean };
  unsafeTasks: ActionTask[];
}) {
  const lines = [
    "# Review Action Board",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This board is read-only. It turns review automation reports into a prioritized human task queue.",
    "",
    "## Guardrails",
    "",
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Boundaries",
    "",
    `- Public published: ${payload.publishingBoundary.publicPublished}`,
    `- Publishable now: ${payload.publishingBoundary.publishableNow}`,
    `- Traffic data available: ${payload.trafficBoundary.trafficDataAvailable}`,
    `- Can claim traffic: ${payload.trafficBoundary.canClaimTraffic}`,
    `- Source files without reachable source: ${payload.sourceHealth.filesWithoutReachableSource}`,
    `- Missing URL targets: ${payload.sourceHealth.missingUrlTargets}`,
    "",
    "## Unsafe Tasks",
    "",
    ...taskTable(payload.unsafeTasks),
    "",
    "## Next Tasks",
    "",
    ...taskTable(payload.nextTasks),
    "",
    "## All Tasks",
    "",
    ...taskTable(payload.tasks),
    "",
    "## Per-Task Actions",
    "",
    ...payload.tasks.flatMap((task) => taskSection(task)),
    "",
  ];
  return lines.join("\n");
}

function taskTable(tasks: ActionTask[]) {
  if (!tasks.length) return ["- none"];
  return [
    "| Ready | Priority | Kind | Scope | Sources | Warnings | Blockers | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...tasks.map(
      (task) =>
        `| ${task.ready} | ${task.priority} | ${task.kind} | ${task.scope} | ${task.sourceTargets} | ${task.warnings.length} | ${task.blockers.length ? task.blockers.join("<br>") : "none"} | ${task.title} | ${task.file} |`,
    ),
  ];
}

function taskSection(task: ActionTask) {
  return [
    `### ${task.title}`,
    "",
    `- File: ${task.file}`,
    `- Kind: ${task.kind}`,
    `- Scope: ${task.scope}`,
    `- Ready: ${task.ready}`,
    `- Priority: ${task.priority}`,
    "",
    "Action items:",
    "",
    ...task.actionItems.map((item) => `- ${item}`),
    "",
    "Warnings:",
    "",
    ...(task.warnings.length ? task.warnings.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Command boundary:",
    "",
    `- Mark review after human approval: \`${task.commandBoundary.markReviewAfterHumanApproval}\``,
    `- Publish dry-run after review: \`${task.commandBoundary.publishDryRunAfterReview}\``,
    `- Publish confirm: ${task.commandBoundary.publishConfirm}`,
    `- Stop before: ${task.commandBoundary.stopBefore}`,
    "",
  ];
}

main();
