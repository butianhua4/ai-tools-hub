import fs from "fs";
import path from "path";
import { readArticle, rel } from "./content-utils";
import { checkFile } from "./quality-core";

type BroadCandidate = {
  file: string;
  primaryKeyword: string;
  publishBatch: number | null;
  qualityScore: number;
  searchIntent: string;
  title: string;
};

type BroadTheme = {
  candidateDrafts: BroadCandidate[];
  gapScore: number;
  id: string;
  missingSubtopics: string[];
  publicMatches: number;
  readyDrafts: number;
  reviewFocus: string[];
  searchSeeds: string[];
  sourceTargets: string[];
  subtopics: string[];
  title: string;
};

type PlanItem = {
  approvalWave: number;
  file: string;
  gapScore: number;
  humanReviewCommandAfterApproval: string;
  missingSubtopics: string[];
  noindex: boolean;
  primaryKeyword: string;
  publicMatches: number;
  publishBatch: number | null;
  publishDryRunCommandAfterReview: string;
  qualityScore: number;
  readyForManualReview: boolean;
  reviewFocus: string[];
  safeDraft: boolean;
  searchIntent: string;
  searchSeeds: string[];
  sourceNotes: boolean;
  sourceTargets: string[];
  themeId: string;
  themeTitle: string;
  title: string;
};

const itemsPerWave = 2;

function main() {
  const broad = readJson<{
    guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean };
    summary: { themes: number; themesWithoutPublicCoverage: number };
    themes: BroadTheme[];
  }>("content/automation/broad-search-demand-map.json");
  const gapThemes = broad.themes.filter((theme) => theme.publicMatches === 0);
  const selectedFiles = new Set<string>();
  const items = gapThemes
    .map((theme) => toPlanItem(theme, selectedFiles))
    .filter((item): item is PlanItem => Boolean(item))
    .map((item, index) => ({ ...item, approvalWave: Math.floor(index / itemsPerWave) + 1 }));
  const unsafeItems = items.filter((item) => !item.readyForManualReview || !item.safeDraft || !item.noindex);
  const duplicateFiles = duplicateValues(items.map((item) => item.file));
  const waves = toWaves(items);

  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      autoEditArticles: false,
      autoMarkReview: false,
      autoPublish: false,
      note: "Read-only plan for public-coverage gaps. It selects one safe draft per broad demand theme with no public coverage and stops before human review or publishing.",
      stopBefore: "Do not run mark:review --confirm-human or publish:articles --confirm without explicit human approval.",
    },
    sourceEvidence: {
      broadDemandGuardrails: broad.guardrails,
      note: "This plan inherits broad-demand editorial signals only. It does not claim keyword volume, search ranking, clicks, impressions, or traffic.",
    },
    summary: {
      broadDemandThemes: broad.summary.themes,
      duplicateFiles: duplicateFiles.length,
      gapThemes: gapThemes.length,
      items: items.length,
      itemsPerWave,
      plannedWaves: waves.length,
      readyItems: items.filter((item) => item.readyForManualReview).length,
      unsafeItems: unsafeItems.length,
      sourceThemesWithoutPublicCoverage: broad.summary.themesWithoutPublicCoverage,
      uniqueFiles: new Set(items.map((item) => item.file)).size,
    },
    waves,
    items,
  };

  const jsonTarget = path.join(process.cwd(), "content", "automation", "public-coverage-gap-plan.json");
  const mdTarget = path.join(process.cwd(), "docs", "public-coverage-gap-plan.md");
  fs.mkdirSync(path.dirname(jsonTarget), { recursive: true });
  fs.mkdirSync(path.dirname(mdTarget), { recursive: true });
  fs.writeFileSync(jsonTarget, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdTarget, toMarkdown(payload), "utf8");
  console.log(JSON.stringify({ ok: unsafeItems.length === 0 && items.length === gapThemes.length, json: rel(jsonTarget), markdown: rel(mdTarget), summary: payload.summary }, null, 2));
  if (unsafeItems.length || items.length !== gapThemes.length) process.exitCode = 1;
}

function toPlanItem(theme: BroadTheme, selectedFiles: Set<string>): PlanItem | null {
  const candidate = theme.candidateDrafts.find((item) => !selectedFiles.has(normalizeFile(item.file))) || theme.candidateDrafts[0];
  if (!candidate) return null;
  selectedFiles.add(normalizeFile(candidate.file));
  const article = readArticle(candidate.file);
  const data = article.data;
  const quality = checkFile(article.file);
  const file = rel(article.file);
  const safeDraft = data.status === "draft" && data.noindex === true && data.humanReviewRequired === true;
  const sourceNotes = Boolean(data.sourceNotes);
  const readyForManualReview =
    safeDraft &&
    sourceNotes &&
    quality.failedItems.length === 0 &&
    theme.sourceTargets.length >= 2 &&
    theme.reviewFocus.length >= 3 &&
    theme.searchSeeds.length >= 4;

  return {
    approvalWave: 0,
    file,
    gapScore: theme.gapScore,
    humanReviewCommandAfterApproval: `npm run mark:review -- --file=${file} --confirm-human`,
    missingSubtopics: theme.missingSubtopics,
    noindex: data.noindex === true,
    primaryKeyword: String(data.primaryKeyword || candidate.primaryKeyword || ""),
    publicMatches: theme.publicMatches,
    publishBatch: typeof data.publishBatch === "number" ? data.publishBatch : candidate.publishBatch,
    publishDryRunCommandAfterReview: `npm run publish:articles -- --file=${file}`,
    qualityScore: quality.qualityScore,
    readyForManualReview,
    reviewFocus: theme.reviewFocus,
    safeDraft,
    searchIntent: String(data.searchIntent || candidate.searchIntent || ""),
    searchSeeds: theme.searchSeeds,
    sourceNotes,
    sourceTargets: theme.sourceTargets,
    themeId: theme.id,
    themeTitle: theme.title,
    title: String(data.title || candidate.title || ""),
  };
}

function toWaves(items: PlanItem[]) {
  return items
    .reduce<Array<{ files: string[]; focus: string; items: PlanItem[]; readyItems: number; themes: string[]; wave: number }>>((waves, item) => {
      let wave = waves.find((entry) => entry.wave === item.approvalWave);
      if (!wave) {
        wave = { files: [], focus: "", items: [], readyItems: 0, themes: [], wave: item.approvalWave };
        waves.push(wave);
      }
      wave.files.push(item.file);
      wave.items.push(item);
      wave.readyItems = wave.items.filter((candidate) => candidate.readyForManualReview).length;
      wave.themes = [...new Set(wave.items.map((candidate) => candidate.themeTitle))];
      wave.focus = wave.themes.join(" + ");
      return waves;
    }, []);
}

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function normalizeFile(file: string) {
  return file.replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(/^\uFEFF/, "")) as T;
}

function toMarkdown(payload: {
  generatedAt: string;
  guardrails: { autoEditArticles: boolean; autoMarkReview: boolean; autoPublish: boolean; note: string; stopBefore: string };
  items: PlanItem[];
  sourceEvidence: { broadDemandGuardrails: unknown; note: string };
  summary: Record<string, number>;
  waves: Array<{ files: string[]; focus: string; items: PlanItem[]; readyItems: number; themes: string[]; wave: number }>;
}) {
  const lines = [
    "# Public Coverage Gap Plan",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report is read-only. It converts broad search-demand themes with no public coverage into a manual review wave plan.",
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
    `- Note: ${payload.sourceEvidence.note}`,
    `- Broad demand guardrails: ${JSON.stringify(payload.sourceEvidence.broadDemandGuardrails)}`,
    "",
    "## Summary",
    "",
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Waves",
    "",
  ];

  for (const wave of payload.waves) {
    lines.push(
      `### Wave ${wave.wave}: ${wave.focus}`,
      "",
      `- Ready items: ${wave.readyItems}/${wave.items.length}`,
      "",
      "| Ready | Score | Public | Missing subtopics | Theme | Primary keyword | Title | File |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...wave.items.map(
        (item) =>
          `| ${item.readyForManualReview} | ${item.gapScore} | ${item.publicMatches} | ${item.missingSubtopics.join(", ") || "none"} | ${item.themeTitle} | ${item.primaryKeyword} | ${item.title} | ${item.file} |`,
      ),
      "",
      "Human approval commands after explicit approval:",
      "",
      "```bash",
      ...wave.items.map((item) => item.humanReviewCommandAfterApproval),
      "```",
      "",
      "Publish dry-run commands after review status exists:",
      "",
      "```bash",
      ...wave.items.map((item) => item.publishDryRunCommandAfterReview),
      "```",
      "",
    );
  }

  lines.push(
    "## Full Plan",
    "",
    "| Wave | Ready | Safe | Noindex | Sources | Seeds | Focus | Theme | Title | File |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...payload.items.map(
      (item) =>
        `| ${item.approvalWave} | ${item.readyForManualReview} | ${item.safeDraft} | ${item.noindex} | ${item.sourceTargets.length} | ${item.searchSeeds.length} | ${item.reviewFocus.length} | ${item.themeTitle} | ${item.title} | ${item.file} |`,
    ),
    "",
  );

  return lines.join("\n");
}

main();
