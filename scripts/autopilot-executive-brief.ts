import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type ProjectStatus = {
  articles: {
    publicPublished: number;
    publishableNow: unknown[];
    statusCounts: Record<string, number>;
  };
};

type WorkflowAudit = {
  summary: {
    failed: number;
    forbiddenWorkflowCommands: number;
    manualDispatchEnabled: boolean;
    reportArtifactEnabled: boolean;
    scheduleCount: number;
  };
};

type TrafficEvidence = {
  summary: {
    failedChecks: number;
    measuredTrafficSources: number;
    trafficDataAvailable: boolean;
  };
};

type PublicSurfaceInventory = {
  summary: {
    broadClustersWithoutPublicCoverage: number;
    liveMissingFromSitemap: number;
    publicArticles: number;
    unsafeItems: number;
  };
};

type HumanApprovalQueue = {
  immediateItems: Array<{
    file: string;
    humanChecklist?: string[];
    priorityScore: number;
    publicImpact?: string;
    title: string;
    unsafeReasons?: string[];
  }>;
  summary: {
    backlogItems: number;
    immediateApprovalItems: number;
    immediateApprovalReadyItems: number;
    items: number;
    publishConfirmCommandsIncluded: number;
    unsafeItems: number;
  };
};

type NextBatchApprovalRoute = {
  items: Array<{
    file: string;
    priorityScore: number;
    routeWarnings?: string[];
    title: string;
  }>;
  summary: {
    batchItems: number;
    currentPublicPublished: number;
    currentPublishableNow: number;
    itemsReadyForHumanRouteReview: number;
    publishConfirmCommandsIncluded: number;
    routeWarnings: number;
    unsafeItems: number;
  };
};

type SprintSummary = {
  summary: Record<string, boolean | number>;
};

type ExecutiveAction = {
  action: string;
  file?: string;
  humanGate: string;
  priority: number;
  reason: string;
  title: string;
};

function main() {
  const project = readJson<ProjectStatus>("content/automation/project-status.json");
  const workflow = readJson<WorkflowAudit>("content/automation/project-automation-workflow-audit.json");
  const traffic = readJson<TrafficEvidence>("content/automation/traffic-evidence-audit.json");
  const surface = readJson<PublicSurfaceInventory>("content/automation/public-surface-inventory.json");
  const approvalQueue = readJson<HumanApprovalQueue>("content/automation/human-approval-execution-queue.json");
  const nextBatchRoute = readJson<NextBatchApprovalRoute>("content/automation/next-batch-approval-route.json");
  const internalLinks = readJson<SprintSummary>("content/automation/internal-link-sprint-board.json");
  const publicRefresh = readJson<SprintSummary>("content/automation/public-refresh-sprint-board.json");
  const deploymentSprint = readJson<SprintSummary>("content/automation/ai-deployment-sprint-board.json");
  const memorySprint = readJson<SprintSummary>("content/automation/memory-rag-sprint-board.json");
  const promptSprint = readJson<SprintSummary>("content/automation/popular-prompt-sprint-board.json");

  const topApprovalActions = approvalQueue.immediateItems.slice(0, 3).map(toApprovalAction);
  const routeWarnings = (nextBatchRoute.items || [])
    .filter((item) => (item.routeWarnings?.length || 0) > 0)
    .slice(0, 3)
    .map((item) => ({
      file: item.file,
      priorityScore: item.priorityScore,
      title: item.title,
      warnings: item.routeWarnings || [],
    }));
  const boardActions = [
    boardAction("Internal links", "Use docs/internal-link-sprint-board.md to add one contextual public link per candidate during manual review.", internalLinks.summary),
    boardAction("Public refresh", "Use docs/public-refresh-sprint-board.md to refresh existing public articles without claiming traffic.", publicRefresh.summary),
    boardAction("AI deployment", "Use docs/ai-deployment-sprint-board.md to prioritize deployment, Agent, model-serving, and API tutorial candidates.", deploymentSprint.summary),
    boardAction("Memory/RAG", "Use docs/memory-rag-sprint-board.md to prioritize RAG, knowledge base, vector search, memory, evaluation, and privacy lanes.", memorySprint.summary),
    boardAction("Popular prompts", "Use docs/popular-prompt-sprint-board.md to prioritize high-demand prompt playbook lanes.", promptSprint.summary),
  ];
  const unsafeReasons = unsafeReasonsFor({ approvalQueue, nextBatchRoute, project, surface, traffic, workflow });

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only executive autopilot brief. It compresses the current automation reports into the next human-gated execution priorities.",
      stopBefore: "Stop before article edits, mark:review, publish dry-run, or publish confirm until a human approves exact files and changes.",
      trafficClaim: "not-included",
    },
    summary: {
      approvalBacklogItems: approvalQueue.summary.backlogItems,
      automationRunsPerDay: workflow.summary.scheduleCount,
      boardActionItems: boardActions.length,
      broadClustersWithoutPublicCoverage: surface.summary.broadClustersWithoutPublicCoverage,
      currentPublishableNow: nextBatchRoute.summary.currentPublishableNow,
      forbiddenWorkflowCommands: workflow.summary.forbiddenWorkflowCommands,
      immediateApprovalItems: approvalQueue.summary.immediateApprovalItems,
      immediateApprovalReadyItems: approvalQueue.summary.immediateApprovalReadyItems,
      publicArticles: project.articles.publicPublished,
      publishConfirmCommandsIncluded: approvalQueue.summary.publishConfirmCommandsIncluded + nextBatchRoute.summary.publishConfirmCommandsIncluded,
      routeWarningItems: routeWarnings.length,
      trafficDataAvailable: traffic.summary.trafficDataAvailable,
      unsafeItems: unsafeReasons.length,
    },
    unsafeReasons,
    topApprovalActions,
    routeWarnings,
    boardActions,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "autopilot-executive-brief.json");
  const mdTarget = path.join(process.cwd(), "docs", "autopilot-executive-brief.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeReasons.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeReasons.length) process.exitCode = 1;
}

function toApprovalAction(item: HumanApprovalQueue["immediateItems"][number]): ExecutiveAction {
  return {
    action: "Human reviewer verifies sources, SEO warnings, internal link path, and risk language; stop before mark:review until approval.",
    file: item.file,
    humanGate: "explicit human approval required",
    priority: item.priorityScore,
    reason: item.publicImpact || "Immediate approval queue item.",
    title: item.title,
  };
}

function boardAction(title: string, action: string, summary: Record<string, boolean | number>) {
  return {
    action,
    publishConfirm: "not-included",
    summary,
    title,
  };
}

function unsafeReasonsFor(input: {
  approvalQueue: HumanApprovalQueue;
  nextBatchRoute: NextBatchApprovalRoute;
  project: ProjectStatus;
  surface: PublicSurfaceInventory;
  traffic: TrafficEvidence;
  workflow: WorkflowAudit;
}) {
  const reasons: string[] = [];
  if (input.workflow.summary.failed > 0) reasons.push("project automation workflow audit has failed checks");
  if (input.workflow.summary.forbiddenWorkflowCommands > 0) reasons.push("workflow contains review or publish commands");
  if (input.workflow.summary.scheduleCount < 4) reasons.push("project automation schedule is below four runs per day");
  if (!input.workflow.summary.manualDispatchEnabled) reasons.push("workflow dispatch is not enabled");
  if (!input.workflow.summary.reportArtifactEnabled) reasons.push("project automation artifact is not enabled");
  if (input.traffic.summary.failedChecks > 0) reasons.push("traffic evidence audit has failed checks");
  if (input.traffic.summary.measuredTrafficSources > 0 && !input.traffic.summary.trafficDataAvailable) reasons.push("traffic source summary is inconsistent");
  if (input.surface.summary.unsafeItems > 0) reasons.push("public surface inventory has unsafe items");
  if (input.surface.summary.liveMissingFromSitemap > 0) reasons.push("live public articles are missing from sitemap");
  if (input.project.articles.publishableNow.length > 0) reasons.push("project has publishable items, but this brief must stop before publish");
  if (input.approvalQueue.summary.unsafeItems > 0) reasons.push("human approval queue has unsafe items");
  if (input.approvalQueue.summary.immediateApprovalReadyItems !== input.approvalQueue.summary.immediateApprovalItems) reasons.push("not all immediate approval items are ready");
  if (input.approvalQueue.summary.publishConfirmCommandsIncluded > 0) reasons.push("approval queue includes publish confirm commands");
  if (input.nextBatchRoute.summary.unsafeItems > 0) reasons.push("next batch route has unsafe items");
  if (input.nextBatchRoute.summary.publishConfirmCommandsIncluded > 0) reasons.push("next batch route includes publish confirm commands");
  return reasons;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  boardActions: Array<{ action: string; publishConfirm: string; summary: Record<string, boolean | number>; title: string }>;
  generatedAt: string;
  guardrails: Record<string, boolean | string>;
  routeWarnings: Array<{ file: string; priorityScore: number; title: string; warnings: string[] }>;
  summary: Record<string, boolean | number>;
  topApprovalActions: ExecutiveAction[];
  unsafeReasons: string[];
}) {
  const lines = [
    "# Autopilot Executive Brief",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It compresses the current automation reports into the next human-gated execution priorities.",
    "",
    "## Guardrails",
    "",
    ...Object.entries(payload.guardrails).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Unsafe Reasons",
    "",
    ...(payload.unsafeReasons.length ? payload.unsafeReasons.map((reason) => `- ${reason}`) : ["- none"]),
    "",
    "## Top Human Approval Actions",
    "",
    "| Priority | Human gate | Title | File | Action | Reason |",
    "| ---: | --- | --- | --- | --- | --- |",
    ...payload.topApprovalActions.map((item) => `| ${item.priority} | ${item.humanGate} | ${item.title} | ${item.file} | ${item.action} | ${item.reason} |`),
    "",
    "## Route Warnings To Clear",
    "",
    ...(payload.routeWarnings.length
      ? [
          "| Priority | Title | File | Warnings |",
          "| ---: | --- | --- | --- |",
          ...payload.routeWarnings.map((item) => `| ${item.priorityScore} | ${item.title} | ${item.file} | ${item.warnings.join("<br>")} |`),
        ]
      : ["- none"]),
    "",
    "## Board Actions",
    "",
    "| Board | Publish confirm | Action | Key summary |",
    "| --- | --- | --- | --- |",
    ...payload.boardActions.map((item) => `| ${item.title} | ${item.publishConfirm} | ${item.action} | ${summarySnippet(item.summary)} |`),
    "",
  ];
  return lines.join("\n");
}

function summarySnippet(summary: Record<string, boolean | number>) {
  return Object.entries(summary)
    .slice(0, 8)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

main();
