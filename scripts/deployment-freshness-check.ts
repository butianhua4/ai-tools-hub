import fs from "fs";
import path from "path";
import { site } from "../data/site";
import { getClusterBySlug, getQuestionName, getQuestionPath, getPublishedSeoPosts } from "../lib/seo-graph";
import { rel } from "./content-utils";

type FreshnessCheck = {
  actual?: string | number | boolean;
  detail?: string;
  expected?: string | number | boolean;
  name: string;
  ok: boolean;
  url: string;
};

const base = normalizeBase(readArg("url") || readArg("base") || site.url);
const fetchTimeoutMs = Math.max(1000, Number(readArg("fetch-timeout-ms") || 15000));
const fetchRetries = Math.max(1, Number(readArg("fetch-retries") || 3));
const outputJson = path.join(process.cwd(), "content", "automation", "deployment-freshness.json");
const outputMarkdown = path.join(process.cwd(), "docs", "deployment-freshness.md");

async function main() {
  const probePost = getPublishedSeoPosts().find((post) => post.slug === "agent-tool-permission-safety-guide") || getPublishedSeoPosts()[0];
  const aiToolsCluster = getClusterBySlug("ai-tools");
  const checks: FreshnessCheck[] = [];

  if (probePost) {
    const questionPath = getQuestionPath(probePost);
    const expectedQuestionName = getQuestionName(probePost);
    const page = await fetchPage(questionPath);
    checks.push({
      name: "q detail page uses current US-facing title",
      ok: page.title.includes(expectedQuestionName),
      url: page.url,
      expected: expectedQuestionName,
      actual: page.title,
      detail: page.error || undefined,
    });
    checks.push({
      name: "q detail page uses current US-facing H1",
      ok: page.h1 === expectedQuestionName,
      url: page.url,
      expected: expectedQuestionName,
      actual: page.h1,
      detail: page.error || undefined,
    });
    checks.push({
      name: "q detail page keeps JSON-LD graph",
      ok: page.jsonLdCount >= 4 && page.html.includes("FAQPage") && page.html.includes("BreadcrumbList"),
      url: page.url,
      expected: "FAQPage + BreadcrumbList + at least 4 JSON-LD blocks",
      actual: `${page.jsonLdCount} JSON-LD block(s)`,
      detail: page.error || undefined,
    });
  }

  if (aiToolsCluster) {
    const page = await fetchPage("/cluster/ai-tools");
    checks.push({
      name: "cluster hub uses current English title",
      ok: page.title.includes(aiToolsCluster.title),
      url: page.url,
      expected: aiToolsCluster.title,
      actual: page.title,
      detail: page.error || undefined,
    });
    checks.push({
      name: "cluster hub uses current English H1",
      ok: page.h1 === aiToolsCluster.title,
      url: page.url,
      expected: aiToolsCluster.title,
      actual: page.h1,
      detail: page.error || undefined,
    });
  }

  const qIndex = await fetchPage("/q");
  checks.push({
    name: "q index is reachable with JSON-LD",
    ok: qIndex.status === 200 && qIndex.jsonLdCount >= 4,
    url: qIndex.url,
    expected: "200 and at least 4 JSON-LD blocks",
    actual: `${qIndex.status}, ${qIndex.jsonLdCount} JSON-LD block(s)`,
    detail: qIndex.error || undefined,
  });

  const sitemap = await fetchPage("/sitemap.xml");
  const sitemapOk =
    sitemap.status === 200 &&
    sitemap.html.includes("/sitemap-q.xml") &&
    sitemap.html.includes("/sitemap-cluster.xml") &&
    sitemap.html.includes("/sitemap-blog.xml") &&
    sitemap.html.includes("/sitemap-priority.xml");
  checks.push({
    name: "main sitemap index includes q, cluster, blog, and priority sitemaps",
    ok: sitemapOk,
    url: sitemap.url,
    expected: "sitemap-q.xml, sitemap-cluster.xml, sitemap-blog.xml, sitemap-priority.xml",
    actual: `${sitemap.status}, length=${sitemap.html.length}`,
    detail: sitemap.error || undefined,
  });

  const staleItems = checks.filter((check) => !check.ok);
  const payload = {
    generatedAt: new Date().toISOString(),
    guardrails: {
      noTrafficClaims: true,
      noIndexingClaims: true,
      note: "This report checks whether production HTML matches the current SEO code expectations. It does not claim Google indexing, ranking, impressions, clicks, or revenue.",
    },
    base,
    summary: {
      ok: staleItems.length === 0,
      checks: checks.length,
      passed: checks.length - staleItems.length,
      staleItems: staleItems.length,
      productionFresh: staleItems.length === 0,
      needsVercelAttention: staleItems.length > 0,
    },
    checks,
    nextActions: staleItems.length
      ? [
          "Open the Vercel deployment linked from the GitHub commit status and inspect build/deploy logs.",
          "If Vercel shows a stuck deployment, redeploy the latest main branch or promote the newest successful deployment.",
          "Do not resubmit the latest changed q URLs in GSC until production HTML shows the current title/H1.",
        ]
      : [
          "Production HTML matches the current SEO entry metadata.",
          "Proceed with the next GSC URL Inspection batch from docs/gsc-submission-progress.md.",
        ],
  };

  fs.mkdirSync(path.dirname(outputJson), { recursive: true });
  fs.mkdirSync(path.dirname(outputMarkdown), { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(outputMarkdown, toMarkdown(payload), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: payload.summary.ok,
        productionFresh: payload.summary.productionFresh,
        staleItems: payload.summary.staleItems,
        json: rel(outputJson),
        markdown: rel(outputMarkdown),
      },
      null,
      2,
    ),
  );
  if (staleItems.length) process.exitCode = 1;
}

async function fetchPage(relativePath: string) {
  const url = `${base}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
  let lastError = "";

  for (let attempt = 1; attempt <= fetchRetries; attempt += 1) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);
      const response = await fetch(url, { signal: controller.signal });
      const html = await response.text();
      return {
        error: "",
        h1: stripTags(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)),
        html,
        jsonLdCount: (html.match(/application\/ld\+json/g) || []).length,
        status: response.status,
        title: stripTags(match(html, /<title>([\s\S]*?)<\/title>/i)),
        url,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < fetchRetries) await delay(750 * attempt);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  return {
    error: lastError,
    h1: "",
    html: "",
    jsonLdCount: 0,
    status: 0,
    title: "",
    url,
  };
}

function toMarkdown(payload: {
  base: string;
  checks: FreshnessCheck[];
  generatedAt: string;
  guardrails: { noTrafficClaims: boolean; noIndexingClaims: boolean; note: string };
  nextActions: string[];
  summary: Record<string, boolean | number>;
}) {
  return [
    "# Deployment Freshness",
    "",
    `Generated at: ${payload.generatedAt}`,
    "",
    "This report checks whether production HTML matches the current SEO code expectations.",
    "",
    "## Guardrails",
    "",
    `- No traffic claims: ${payload.guardrails.noTrafficClaims}`,
    `- No indexing claims: ${payload.guardrails.noIndexingClaims}`,
    `- Note: ${payload.guardrails.note}`,
    "",
    "## Summary",
    "",
    `- Base: ${payload.base}`,
    ...Object.entries(payload.summary).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Checks",
    "",
    "| Check | Status | Expected | Actual | URL |",
    "| --- | --- | --- | --- | --- |",
    ...payload.checks.map((check) => `| ${check.name} | ${check.ok ? "PASS" : "FAIL"} | ${escapeCell(check.expected)} | ${escapeCell(check.actual)} | ${check.url} |`),
    "",
    "## Next Actions",
    "",
    ...payload.nextActions.map((action) => `- ${action}`),
    "",
  ].join("\n");
}

function match(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1]?.trim() || "";
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function escapeCell(value: unknown) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function normalizeBase(value: string) {
  return value.replace(/\/+$/, "");
}

function readArg(name: string) {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void main();
