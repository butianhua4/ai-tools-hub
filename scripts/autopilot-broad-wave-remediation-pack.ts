import fs from "fs";
import path from "path";
import { rel } from "./content-utils";

type CommandBoundary = {
  markReviewAfterHumanApproval: string;
  publishConfirm: "not-included";
  publishDryRunAfterReview: string;
};

type PublicLinkSuggestion = {
  reason?: string;
  score?: number;
  title: string;
  url: string;
};

type OptimizationItem = {
  actionChecklist: string[];
  articleSignals: {
    descriptionLength: number;
    h2Count: number;
    titleLength: number;
  };
  cluster: string;
  commandBoundary: CommandBoundary;
  file: string;
  publicLinkSuggestion: PublicLinkSuggestion | null;
  readyForHumanOptimizationReview: boolean;
  safeDraft: boolean;
  searchQueries: string[];
  sourceTargets: string[];
  title: string;
  unsafeReasons: string[];
  warningRemediation: string[];
  wave: number;
};

type BroadWaveOptimization = {
  generatedAt: string;
  guardrails: {
    autoEditArticles: boolean;
    autoMarkReview: boolean;
    autoPublish: boolean;
    trafficClaim: string;
  };
  items: OptimizationItem[];
  summary: {
    items: number;
    readyItems: number;
    safeDraftItems: number;
    unsafeItems: number;
    waveItems: number;
    waves: number;
  };
};

type PublicSurfaceInventory = {
  publicItems: Array<{
    category: string;
    slug: string;
    tags: string[];
    title: string;
  }>;
  summary: {
    publicArticles: number;
    trafficDataAvailable: boolean;
  };
};

type RemediationItem = {
  commandBoundary: CommandBoundary;
  file: string;
  humanChecklist: string[];
  internalLinkFixes: string[];
  manualFixReady: boolean;
  publicLinkPlan: string[];
  remediationReasons: string[];
  riskChecks: string[];
  searchFixes: string[];
  sourceChecks: string[];
  title: string;
  unsafeReasons: string[];
  warningFixes: string[];
  wave: number;
};

function main() {
  const optimization = readJson<BroadWaveOptimization>("content/automation/autopilot-broad-wave-optimization.json");
  const publicSurface = readJson<PublicSurfaceInventory>("content/automation/public-surface-inventory.json");
  const publicLinks = publicSurface.publicItems.map((item) => ({
    title: item.title,
    url: `/blog/${item.slug}`,
  }));
  const items = optimization.items.map((item) => toRemediationItem(item, publicLinks));
  const unsafeItems = items.filter((item) => item.unsafeReasons.length > 0);
  const waves = [...new Set(items.map((item) => item.wave))].sort((a, b) => a - b);
  const waveSummaries = waves.map((wave) => {
    const waveItems = items.filter((item) => item.wave === wave);
    return {
      items: waveItems.length,
      manualFixReadyItems: waveItems.filter((item) => item.manualFixReady).length,
      missingSpecificLinkSuggestionItems: waveItems.filter((item) => item.publicLinkPlan.some((step) => step.includes("No specific public link suggestion"))).length,
      unsafeItems: waveItems.filter((item) => item.unsafeReasons.length > 0).length,
      wave,
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only remediation pack for broad AI publish waves. It consolidates SEO, source, internal-link, warning, and risk fixes without editing drafts.",
      stopBefore: "Use this pack during human review only. mark:review requires explicit human approval per file; publish --confirm is not included.",
      trafficClaim: "not-included",
    },
    sourceEvidence: {
      broadWaveOptimizationGeneratedAt: optimization.generatedAt,
      broadWaveOptimizationGuardrails: optimization.guardrails,
      broadWaveOptimizationItems: optimization.summary.items,
      broadWaveOptimizationReadyItems: optimization.summary.readyItems,
      broadWaveOptimizationSafeDraftItems: optimization.summary.safeDraftItems,
      broadWaveOptimizationUnsafeItems: optimization.summary.unsafeItems,
      publicArticles: publicSurface.summary.publicArticles,
      trafficDataAvailable: publicSurface.summary.trafficDataAvailable,
    },
    summary: {
      items: items.length,
      itemsWithCommandBoundary: items.filter((item) => hasCommandBoundary(item.commandBoundary)).length,
      itemsWithInternalLinkFixes: items.filter((item) => item.internalLinkFixes.length > 0).length,
      itemsWithPublicLinkPlan: items.filter((item) => item.publicLinkPlan.length > 0).length,
      itemsWithRemediationReasons: items.filter((item) => item.remediationReasons.length > 0).length,
      itemsWithRiskChecks: items.filter((item) => item.riskChecks.length >= 4).length,
      itemsWithSearchFixes: items.filter((item) => item.searchFixes.length > 0).length,
      itemsWithSourceChecks: items.filter((item) => item.sourceChecks.length > 0).length,
      itemsWithWarningFixes: items.filter((item) => item.warningFixes.length > 0).length,
      manualFixReadyItems: items.filter((item) => item.manualFixReady).length,
      missingSpecificLinkSuggestionItems: items.filter((item) => item.publicLinkPlan.some((step) => step.includes("No specific public link suggestion"))).length,
      unsafeItems: unsafeItems.length,
      waveItems: optimization.summary.waveItems,
      waves: waveSummaries.length,
      wavesReady: waveSummaries.filter((wave) => wave.manualFixReadyItems === wave.items && wave.unsafeItems === 0).length,
    },
    unsafeItems,
    waveSummaries,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "autopilot-broad-wave-remediation-pack.json");
  const mdTarget = path.join(process.cwd(), "docs", "autopilot-broad-wave-remediation-pack.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length) process.exitCode = 1;
}

function toRemediationItem(item: OptimizationItem, publicLinks: Array<{ title: string; url: string }>): RemediationItem {
  const specificPublicLink = item.publicLinkSuggestion ? `Use suggested public link: ${item.publicLinkSuggestion.title} (${item.publicLinkSuggestion.url}).` : "";
  const fallbackLinks = publicLinks.slice(0, 3).map((link) => `Fallback public link candidate: ${link.title} (${link.url}).`);
  const publicLinkPlan = dedupe([
    item.publicLinkSuggestion ? specificPublicLink : "No specific public link suggestion exists; human reviewer must choose a relevant published article or explicitly reject public linking for this draft.",
    ...(item.publicLinkSuggestion ? [] : fallbackLinks),
  ]);
  const internalLinkFixes = dedupe([
    ...publicLinkPlan,
    "Place the internal link contextually near a setup, deployment, pricing, security, or troubleshooting step.",
    "Do not add a public link if it weakens the article or points to an unrelated beginner topic.",
  ]);
  const searchFixes = dedupe([
    ...item.actionChecklist.filter((step) => /search|query|title|description|opening|first paragraph|H2/i.test(step)),
    ...item.searchQueries.map((query) => `Confirm article naturally answers search query: ${query}.`),
  ]);
  const sourceChecks = dedupe([
    ...item.sourceTargets.map((target) => `Verify implementation-sensitive claims against source: ${target}.`),
    "Confirm every fast-changing model, SDK, API, deployment, pricing, and version claim against current official sources.",
  ]);
  const warningFixes = dedupe(item.warningRemediation);
  const riskChecks = dedupe([
    ...item.actionChecklist.filter((step) => /traffic|ranking|revenue|benchmark|cost|latency|stability|privacy|rollback|logging|failure|risk|human review/i.test(step)),
    ...warningFixes,
    "Reject unsupported traffic, ranking, revenue, benchmark, cost, latency, or stability claims.",
    "Keep human review, rollback, logging, cost, privacy, and failure-handling boundaries explicit.",
  ]);
  const remediationReasons = dedupe([
    "broad AI wave item needs human remediation before approval",
    item.publicLinkSuggestion ? "specific public internal-link suggestion needs human acceptance or rejection" : "missing specific public internal-link suggestion needs human choice",
    warningFixes.length > 0 ? "warning remediation needs human sign-off" : "",
    searchFixes.length > 0 ? "search-intent wording needs human copy review" : "",
    sourceChecks.length > 0 ? "source evidence needs human verification" : "",
  ]);
  const unsafeReasons = [
    item.readyForHumanOptimizationReview ? "" : "broad wave optimization item is not ready",
    item.safeDraft ? "" : "item is not a safe draft",
    hasCommandBoundary(item.commandBoundary) ? "" : "manual command boundary is missing or unsafe",
    internalLinkFixes.length > 0 ? "" : "no internal-link remediation action attached",
    publicLinkPlan.length > 0 ? "" : "no public-link plan attached",
    searchFixes.length > 0 ? "" : "no search remediation action attached",
    sourceChecks.length > 0 ? "" : "no source verification action attached",
    riskChecks.length >= 4 ? "" : "risk checklist is too thin",
    item.unsafeReasons.length === 0 ? "" : "upstream optimization item has unsafe reasons",
  ].filter(Boolean);
  const humanChecklist = dedupe([
    ...remediationReasons.map((reason) => `Review reason: ${reason}.`),
    "Apply, rewrite, or explicitly reject search and snippet fixes before mark:review.",
    "Open source targets or run equivalent source checks before mark:review.",
    "Choose, apply, or explicitly reject the public internal-link plan before mark:review.",
    "Resolve warning and risk checks before mark:review.",
    `Only after explicit human approval, run: ${item.commandBoundary.markReviewAfterHumanApproval}`,
    "Publishing remains a separate explicit approval step.",
  ]);

  return {
    commandBoundary: item.commandBoundary,
    file: item.file,
    humanChecklist,
    internalLinkFixes,
    manualFixReady: unsafeReasons.length === 0,
    publicLinkPlan,
    remediationReasons,
    riskChecks,
    searchFixes,
    sourceChecks,
    title: item.title,
    unsafeReasons,
    warningFixes,
    wave: item.wave,
  };
}

function hasCommandBoundary(command: CommandBoundary) {
  return (
    command.markReviewAfterHumanApproval.includes("--confirm-human") &&
    !command.publishDryRunAfterReview.includes("--confirm") &&
    command.publishConfirm === "not-included"
  );
}

function dedupe(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { note: string; stopBefore: string; trafficClaim: string };
  items: RemediationItem[];
  sourceEvidence: Record<string, unknown>;
  summary: Record<string, number>;
  unsafeItems: RemediationItem[];
  waveSummaries: Array<{ items: number; manualFixReadyItems: number; missingSpecificLinkSuggestionItems: number; unsafeItems: number; wave: number }>;
}) {
  const lines = [
    "# Autopilot Broad Wave Remediation Pack",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It turns broad AI publish-wave optimization items into manual remediation cards and keeps article edits, mark-review, and publishing human-gated.",
    "",
    "## Guardrails",
    "",
    `- ${payload.guardrails.note}`,
    `- ${payload.guardrails.stopBefore}`,
    `- Traffic claim: ${payload.guardrails.trafficClaim}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Source Evidence",
    "",
    ...Object.entries(payload.sourceEvidence).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`),
    "",
    "## Wave Readiness",
    "",
    "| Wave | Ready | Missing specific link suggestion | Unsafe | Items |",
    "| --- | --- | --- | --- | --- |",
    ...payload.waveSummaries.map((wave) => `| ${wave.wave} | ${wave.manualFixReadyItems}/${wave.items} | ${wave.missingSpecificLinkSuggestionItems} | ${wave.unsafeItems} | ${wave.items} |`),
    "",
    "## Unsafe Items",
    "",
    ...itemTable(payload.unsafeItems),
    "",
    "## Remediation Items",
    "",
    ...itemTable(payload.items),
    "",
    "## Per-Item Checklist",
    "",
    ...payload.items.flatMap(itemSection),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function itemTable(items: RemediationItem[]) {
  if (!items.length) return ["- none"];
  return [
    "| Wave | Ready | Reasons | Search fixes | Source checks | Link fixes | Link plan | Warnings | Risk checks | Mark-review gated | Publish confirm | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...items.map(
      (item) =>
        `| ${item.wave} | ${item.manualFixReady} | ${item.remediationReasons.length} | ${item.searchFixes.length} | ${item.sourceChecks.length} | ${item.internalLinkFixes.length} | ${item.publicLinkPlan.length} | ${item.warningFixes.length} | ${item.riskChecks.length} | ${item.commandBoundary.markReviewAfterHumanApproval.includes("--confirm-human")} | ${item.commandBoundary.publishConfirm} | ${item.title} | ${item.file} |`,
    ),
  ];
}

function itemSection(item: RemediationItem) {
  return [
    `### Wave ${item.wave}. ${item.title}`,
    "",
    `- File: ${item.file}`,
    `- Manual mark-review command: \`${item.commandBoundary.markReviewAfterHumanApproval}\``,
    `- Publish dry-run command after review: \`${item.commandBoundary.publishDryRunAfterReview}\``,
    `- Publish confirm: ${item.commandBoundary.publishConfirm}`,
    "",
    "Public-link plan:",
    "",
    ...item.publicLinkPlan.map((step) => `- ${step}`),
    "",
    "Search fixes:",
    "",
    ...item.searchFixes.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Source checks:",
    "",
    ...item.sourceChecks.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Warning fixes:",
    "",
    ...(item.warningFixes.length ? item.warningFixes.map((step) => `- ${step}`) : ["- none"]),
    "",
    "Risk checks:",
    "",
    ...item.riskChecks.slice(0, 10).map((step) => `- ${step}`),
    "",
    "Human checklist:",
    "",
    ...item.humanChecklist.map((step) => `- ${step}`),
    "",
  ];
}

main();
