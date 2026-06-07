import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type DeploymentReviewItem = {
  audience: string;
  category: string;
  commandBoundary: {
    markReviewAfterHumanApproval: string;
    publishConfirm: "not-included";
    publishDryRunAfterReview: string;
    stopBefore: string;
  };
  file: string;
  humanDecisionChecklist: string[];
  primaryKeyword: string;
  priorityScore: number;
  publicMatches: number;
  qualityScore: number;
  readyForHumanReview: boolean;
  reviewFocus: string[];
  riskChecks: string[];
  safeDraft: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  title: string;
  topic: string;
  workflowAngles: string[];
};

type DeploymentReviewPack = {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
  items: DeploymentReviewItem[];
  nextItems: DeploymentReviewItem[];
  sourceEvidence: {
    coverageGeneratedAt: string;
    officialSources: string[];
    trafficNote: string;
  };
  summary: {
    deploymentPublicArticles: number;
    duplicateFiles: number;
    items: number;
    itemsWithChecklists: number;
    itemsWithCommandBoundary: number;
    itemsWithOfficialSources: number;
    itemsWithSearchQueries: number;
    reviewReadyDeploymentDrafts: number;
    safeDraftItems: number;
    topicsCovered: number;
    topicsWithoutPublicCoverage: number;
    unsafeItems: number;
    uniqueFiles: number;
  };
};

type SprintItem = {
  actionCount: number;
  deploymentChecks: string[];
  deploymentLane: string;
  file: string;
  humanReviewActions: string[];
  implementationMode: string;
  priorityScore: number;
  publicMatches: number;
  publishConfirm: "not-included";
  readyForDeploymentSprint: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  sprintWave: number;
  title: string;
  topic: string;
  unsafeReasons: string[];
  workflowAngles: string[];
};

type SprintWave = {
  actionItems: number;
  deploymentChecks: string[];
  deploymentLanes: string[];
  files: string[];
  highPriorityItems: number;
  implementationModes: string[];
  items: number;
  readyItems: number;
  searchQueries: string[];
  sourceTargets: string[];
  unsafeItems: number;
  wave: number;
};

const ITEMS_PER_WAVE = 2;
const HIGH_PRIORITY_SCORE = 330;

function main() {
  const reviewPack = readJson<DeploymentReviewPack>("content/automation/ai-deployment-review-pack.json");
  const items = reviewPack.items
    .map(toSprintItem)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.file.localeCompare(b.file))
    .map((item, index) => ({ ...item, sprintWave: Math.floor(index / ITEMS_PER_WAVE) + 1 }));
  const waves = buildWaves(items);
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoCreateArticles: false,
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note:
        "Read-only AI deployment sprint board. It groups model deployment, Agent, RAG, memory, API, workflow, and infrastructure candidates into manual review waves.",
      stopBefore: "Stop before article creation, article edits, mark:review, publish dry-run, or publish confirm until a human approves exact files and changes.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      deploymentReviewGeneratedAt: reviewPack.generatedAt,
      deploymentReviewSummary: reviewPack.summary,
      officialSources: reviewPack.sourceEvidence.officialSources,
      trafficNote: "Search queries are planning seeds only; no traffic, ranking, impression, click, conversion, revenue, benchmark, latency, or cost claim is made.",
    },
    summary: {
      actionItems: items.reduce((sum, item) => sum + item.actionCount, 0),
      agentItems: items.filter((item) => item.deploymentLane === "agent-deployment").length,
      apiIntegrationItems: items.filter((item) => item.deploymentLane === "api-integration").length,
      automationPlatformItems: items.filter((item) => item.deploymentLane === "workflow-automation").length,
      deploymentPublicArticles: reviewPack.summary.deploymentPublicArticles,
      highPriorityItems: items.filter((item) => item.priorityScore >= HIGH_PRIORITY_SCORE).length,
      implementationModes: new Set(items.map((item) => item.implementationMode)).size,
      items: items.length,
      itemsPerWave: ITEMS_PER_WAVE,
      lanes: new Set(items.map((item) => item.deploymentLane)).size,
      localModelItems: items.filter((item) => item.deploymentLane === "local-model-serving").length,
      memoryItems: items.filter((item) => item.deploymentLane === "rag-memory").length,
      modelServingItems: items.filter((item) => item.deploymentLane === "model-serving").length,
      publishConfirmCommandsIncluded: 0,
      readyForDeploymentSprint: items.filter((item) => item.readyForDeploymentSprint).length,
      reviewPackItems: reviewPack.summary.items,
      searchQueries: new Set(items.flatMap((item) => item.searchQueries)).size,
      sourceTargets: new Set(items.flatMap((item) => item.sourceTargets)).size,
      topicsWithoutPublicCoverage: reviewPack.summary.topicsWithoutPublicCoverage,
      trafficDataAvailable: false,
      unsafeItems: unsafeItems.length,
      waves: waves.length,
    },
    unsafeItems,
    waves,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "ai-deployment-sprint-board.json");
  const mdTarget = path.join(process.cwd(), "docs", "ai-deployment-sprint-board.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toSprintItem(item: DeploymentReviewItem): SprintItem {
  const deploymentLane = deploymentLaneFor(item);
  const implementationMode = implementationModeFor(item, deploymentLane);
  const deploymentChecks = deploymentChecksFor(item, deploymentLane);
  const humanReviewActions = humanReviewActionsFor(item, deploymentLane);
  const unsafeReasons = unsafeReasonsFor(item, deploymentChecks, humanReviewActions);

  return {
    actionCount: deploymentChecks.length + humanReviewActions.length,
    deploymentChecks,
    deploymentLane,
    file: item.file,
    humanReviewActions,
    implementationMode,
    priorityScore: item.priorityScore,
    publicMatches: item.publicMatches,
    publishConfirm: "not-included",
    readyForDeploymentSprint: unsafeReasons.length === 0,
    searchQueries: item.searchQueries,
    sourceTargets: item.sourceTargets,
    sprintWave: 0,
    title: item.title,
    topic: item.topic,
    unsafeReasons,
    workflowAngles: item.workflowAngles,
  };
}

function unsafeReasonsFor(item: DeploymentReviewItem, deploymentChecks: string[], humanReviewActions: string[]) {
  const reasons: string[] = [];
  if (!item.safeDraft) reasons.push("candidate is not a safe draft");
  if (!item.readyForHumanReview) reasons.push("candidate is not ready for human review");
  if (item.commandBoundary.publishConfirm !== "not-included") reasons.push("publish confirm command is included");
  if (!item.commandBoundary.markReviewAfterHumanApproval.includes("--confirm-human")) reasons.push("mark review command is missing confirm-human boundary");
  if (item.commandBoundary.publishDryRunAfterReview.includes("--confirm")) reasons.push("publish dry-run includes confirm");
  if (!item.commandBoundary.stopBefore.includes("explicit human approval")) reasons.push("command boundary does not stop before explicit human approval");
  if (item.searchQueries.length < 3) reasons.push("too few deployment search queries");
  if (item.sourceTargets.length < 2) reasons.push("too few official source targets");
  if (item.humanDecisionChecklist.length < 7) reasons.push("human decision checklist is too short");
  if (item.riskChecks.length < 6) reasons.push("risk checks are too short");
  if (deploymentChecks.length < 6) reasons.push("deployment checks are too short");
  if (humanReviewActions.length < 6) reasons.push("human review actions are too short");
  return dedupe(reasons);
}

function deploymentLaneFor(item: DeploymentReviewItem) {
  const haystack = [item.file, item.category, item.primaryKeyword, item.topic, item.title, ...item.searchQueries, ...item.workflowAngles].join(" ").toLowerCase();
  if (matches(haystack, ["ollama", "open webui", "local", "llama"])) return "local-model-serving";
  if (matches(haystack, ["dify", "n8n", "pipeline", "automation"])) return "workflow-automation";
  if (matches(haystack, ["vllm", "serving", "gpu", "hugging face", "inference"])) return "model-serving";
  if (matches(haystack, ["mcp", "observability", "security", "server"])) return "deployment-ops";
  if (matches(haystack, ["rag", "memory", "knowledge", "retrieval", "vector"])) return "rag-memory";
  if (matches(haystack, ["agent", "tool", "workflow", "multi-step"])) return "agent-deployment";
  if (matches(haystack, ["api", "sdk", "endpoint", "key"])) return "api-integration";
  return "deployment-ops";
}

function implementationModeFor(item: DeploymentReviewItem, lane: string) {
  const haystack = [item.file, item.category, item.topic, item.title].join(" ").toLowerCase();
  if (matches(haystack, ["vercel", "sdk"])) return "managed-web-runtime";
  if (matches(haystack, ["dify", "n8n"])) return "low-code-workflow";
  if (matches(haystack, ["ollama", "open webui", "local"])) return "local-runtime";
  if (matches(haystack, ["vllm", "gpu", "hugging face"])) return "model-serving-runtime";
  if (lane === "rag-memory") return "retrieval-memory-system";
  if (lane === "api-integration") return "api-service-integration";
  return "manual-deployment-review";
}

function deploymentChecksFor(item: DeploymentReviewItem, lane: string) {
  const checks = [
    "Verify current official docs before touching model names, SDK imports, endpoints, commands, or deployment settings.",
    "Confirm secret handling keeps API keys, tokens, and credentials out of client-side code and screenshots.",
    "Require a smoke test, rollback path, log location, and failure triage checklist before review approval.",
    "Keep status=draft, noindex=true, and humanReviewRequired=true until explicit approval.",
    "Do not include publish confirm commands in any generated handoff.",
    "Do not claim traffic, ranking, revenue, latency, benchmark, cost savings, or uptime without measured evidence.",
  ];
  if (lane === "agent-deployment") checks.push("Confirm tool allowlists, permission boundaries, human approval steps, retries, and audit logs are explicit.");
  if (lane === "rag-memory") checks.push("Confirm chunking, retrieval, citation, privacy, memory retention, and hallucination review boundaries are explicit.");
  if (lane === "local-model-serving") checks.push("Confirm local runtime, model download, hardware, storage, and network exposure warnings are explicit.");
  if (lane === "model-serving") checks.push("Confirm serving runtime, queueing, GPU/resource limits, monitoring, scaling, and fallback behavior are explicit.");
  if (lane === "workflow-automation") checks.push("Confirm workflow branching, retries, fallback, manual handoff, and error handling are explicit.");
  if (lane === "api-integration") checks.push("Confirm rate limits, auth, environment variables, request/response validation, and error handling are explicit.");
  return dedupe(checks);
}

function humanReviewActionsFor(item: DeploymentReviewItem, lane: string) {
  return dedupe([
    "Read the candidate as a tutorial, not a product claim; remove any unsupported certainty.",
    "Check that the title, intro, FAQ, and examples answer broad deployment search intent.",
    "Use official docs as fact-check sources before any mark:review action.",
    "Add or verify a beginner-facing failure path for common install, key, runtime, and deployment errors.",
    "Map the article to one dominant deployment lane so it does not cannibalize adjacent Agent/RAG/model topics.",
    "Leave mark:review and publish actions to explicit human approval only.",
    `Review lane-specific risk boundary for ${lane}.`,
    `Use source targets: ${item.sourceTargets.slice(0, 3).join(", ")}.`,
  ]);
}

function buildWaves(items: SprintItem[]) {
  const waves: SprintWave[] = [];
  for (let index = 0; index < items.length; index += ITEMS_PER_WAVE) {
    const waveItems = items.slice(index, index + ITEMS_PER_WAVE);
    waves.push({
      actionItems: waveItems.reduce((sum, item) => sum + item.actionCount, 0),
      deploymentChecks: dedupe(waveItems.flatMap((item) => item.deploymentChecks)).slice(0, 12),
      deploymentLanes: dedupe(waveItems.map((item) => item.deploymentLane)),
      files: waveItems.map((item) => item.file),
      highPriorityItems: waveItems.filter((item) => item.priorityScore >= HIGH_PRIORITY_SCORE).length,
      implementationModes: dedupe(waveItems.map((item) => item.implementationMode)),
      items: waveItems.length,
      readyItems: waveItems.filter((item) => item.readyForDeploymentSprint).length,
      searchQueries: dedupe(waveItems.flatMap((item) => item.searchQueries)).slice(0, 16),
      sourceTargets: dedupe(waveItems.flatMap((item) => item.sourceTargets)).slice(0, 10),
      unsafeItems: waveItems.filter((item) => item.unsafeReasons.length > 0).length,
      wave: waves.length + 1,
    });
  }
  return waves;
}

function matches(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoCreateArticles: boolean; autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string; trafficClaim: string };
  items: SprintItem[];
  summary: Record<string, boolean | number>;
  unsafeItems: SprintItem[];
  waves: SprintWave[];
}) {
  const lines = [
    "# AI Deployment Sprint Board",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It groups model deployment, Agent, RAG, memory, API, workflow, and infrastructure candidates into manual review waves.",
    "",
    "## Guardrails",
    "",
    `- Auto create articles: ${payload.guardrails.autoCreateArticles}`,
    `- Auto edit articles: ${payload.guardrails.autoEditArticles}`,
    `- Auto mark review: ${payload.guardrails.autoMarkReview}`,
    `- Auto publish: ${payload.guardrails.autoPublish}`,
    `- Stop before: ${payload.guardrails.stopBefore}`,
    `- Traffic claim: ${payload.guardrails.trafficClaim}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Items",
    "",
    ...(payload.unsafeItems.length ? payload.unsafeItems.map((item) => `- ${item.file}: ${item.unsafeReasons.join("; ")}`) : ["- none"]),
    "",
    "## Waves",
    "",
    "| Wave | Ready | High priority | Actions | Lanes | Modes | Files | Search queries |",
    "| ---: | ---: | ---: | ---: | --- | --- | --- | --- |",
    ...payload.waves.map(
      (wave) =>
        `| ${wave.wave} | ${wave.readyItems}/${wave.items} | ${wave.highPriorityItems} | ${wave.actionItems} | ${wave.deploymentLanes.join(", ")} | ${wave.implementationModes.join(", ")} | ${wave.files.join("<br>")} | ${wave.searchQueries.slice(0, 5).join("<br>") || "none"} |`,
    ),
    "",
    "## Sprint Items",
    "",
    "| Wave | Ready | Score | Lane | Mode | Public | Actions | Queries | Sources | Title | File |",
    "| ---: | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |",
    ...payload.items.map(
      (item) =>
        `| ${item.sprintWave} | ${item.readyForDeploymentSprint} | ${item.priorityScore} | ${item.deploymentLane} | ${item.implementationMode} | ${item.publicMatches} | ${item.actionCount} | ${item.searchQueries.length} | ${item.sourceTargets.length} | ${item.title} | ${item.file} |`,
    ),
    "",
    "## Item Review Actions",
    "",
  ];

  for (const item of payload.items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- File: ${item.file}`);
    lines.push(`- Wave: ${item.sprintWave}`);
    lines.push(`- Lane: ${item.deploymentLane}`);
    lines.push(`- Implementation mode: ${item.implementationMode}`);
    lines.push(`- Ready for deployment sprint: ${item.readyForDeploymentSprint}`);
    lines.push(`- Publish confirm: ${item.publishConfirm}`);
    lines.push("");
    lines.push("Deployment checks:");
    lines.push(...item.deploymentChecks.map((check) => `- ${check}`));
    lines.push("");
    lines.push("Human review actions:");
    lines.push(...item.humanReviewActions.map((action) => `- ${action}`));
    lines.push("");
    lines.push("Search queries:");
    lines.push(...item.searchQueries.map((query) => `- ${query}`));
    lines.push("");
    lines.push("Source targets:");
    lines.push(...item.sourceTargets.map((source) => `- ${source}`));
    lines.push("");
  }

  while (lines[lines.length - 1] === "") lines.pop();
  return `${lines.join("\n")}\n`;
}

main();
