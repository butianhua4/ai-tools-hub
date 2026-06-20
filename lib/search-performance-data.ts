import fs from "fs";
import path from "path";
import { site } from "@/data/site";

export type SearchPerformancePage = {
  path: string;
  url: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  position: number | null;
  source: "gsc" | "bing";
};

export type SearchPerformanceData = {
  generatedAt: string;
  canonicalDomain: string;
  imports: {
    gsc: ImportStatus;
    bing: ImportStatus;
    ahrefs: ImportStatus;
    cloudflare: ImportStatus;
  };
  totals: {
    indexedPages: number | null;
    impressions: number | null;
    clicks: number | null;
    averagePosition: number | null;
    cloudflareVisits: number | null;
    ahrefsHealthScore: number | null;
  };
  pages: SearchPerformancePage[];
  notes: string[];
};

type ImportStatus = {
  connected: boolean;
  file: string;
  rows: number;
  updatedAt: string | null;
  message: string;
};

type CsvRow = Record<string, string>;

const root = process.cwd();
const performanceDir = projectPath("content", "automation", "platform-data");
const gscCsv = path.join(performanceDir, "gsc-performance.csv");
const bingCsv = path.join(performanceDir, "bing-performance.csv");
const ahrefsJson = path.join(performanceDir, "ahrefs-site-audit.json");
const cloudflareJson = path.join(performanceDir, "cloudflare-web-analytics.json");

export function getSearchPerformanceData(): SearchPerformanceData {
  const gscRows = readCsv(gscCsv);
  const bingRows = readCsv(bingCsv);
  const gscPages = gscRows.map((row) => toPerformancePage(row, "gsc")).filter((page): page is SearchPerformancePage => Boolean(page));
  const bingPages = bingRows.map((row) => toPerformancePage(row, "bing")).filter((page): page is SearchPerformancePage => Boolean(page));
  const pages = mergePages([...gscPages, ...bingPages]);
  const cloudflare = readJson<{ visits?: number; pageViews?: number; uniques?: number }>(cloudflareJson);
  const ahrefs = readJson<{ healthScore?: number; crawledPages?: number; errors?: number; warnings?: number }>(ahrefsJson);

  return {
    generatedAt: new Date().toISOString(),
    canonicalDomain: site.url,
    imports: {
      gsc: statusFor(gscCsv, gscRows.length, "Export Search Console Performance as CSV to enable impressions/clicks."),
      bing: statusFor(bingCsv, bingRows.length, "Export Bing Webmaster performance as CSV to enable Bing clicks/impressions."),
      ahrefs: statusFor(ahrefsJson, ahrefs ? 1 : 0, "Paste Ahrefs Webmaster Tools audit summary JSON to enable health score."),
      cloudflare: statusFor(cloudflareJson, cloudflare ? 1 : 0, "Paste Cloudflare Web Analytics summary JSON to enable visit counts."),
    },
    totals: {
      indexedPages: null,
      impressions: sumNullable(pages.map((page) => page.impressions)),
      clicks: sumNullable(pages.map((page) => page.clicks)),
      averagePosition: weightedAveragePosition(pages),
      cloudflareVisits: toNullableNumber(cloudflare?.visits ?? cloudflare?.pageViews ?? cloudflare?.uniques),
      ahrefsHealthScore: toNullableNumber(ahrefs?.healthScore),
    },
    pages,
    notes: [
      "This module never invents traffic. Missing exports stay null.",
      "Supported CSV headers include URL/Page/Top pages, Clicks, Impressions, CTR, and Position/Average position.",
      `Canonical domain expected in imports: ${site.url}`,
    ],
  };
}

function toPerformancePage(row: CsvRow, source: "gsc" | "bing") {
  const url = firstValue(row, ["url", "page", "pages", "top pages", "landing page", "page url"]);
  const normalizedPath = normalizePath(url);
  if (!normalizedPath) return null;

  const clicks = toNumber(firstValue(row, ["clicks", "click"]));
  const impressions = toNumber(firstValue(row, ["impressions", "impression"]));
  const ctr = toRatio(firstValue(row, ["ctr", "average ctr"]));
  const position = toNullableNumber(firstValue(row, ["position", "avg position", "average position", "avg. position"]));

  return {
    path: normalizedPath,
    url: absoluteUrl(normalizedPath),
    clicks,
    impressions,
    ctr,
    position,
    source,
  };
}

function mergePages(pages: SearchPerformancePage[]) {
  const map = new Map<string, SearchPerformancePage>();
  for (const page of pages) {
    const existing = map.get(page.path);
    if (!existing) {
      map.set(page.path, page);
      continue;
    }
    const clicks = existing.clicks + page.clicks;
    const impressions = existing.impressions + page.impressions;
    map.set(page.path, {
      ...existing,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : null,
      position: existing.position ?? page.position,
      source: existing.source,
    });
  }
  return [...map.values()].sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks).slice(0, 500);
}

function readCsv(file: string): CsvRow[] {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((item) => item.trim().toLowerCase());
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()])) as CsvRow,
  );
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((items) => items.some(Boolean));
}

function readJson<T>(file: string): T | null {
  try {
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : null;
  } catch {
    return null;
  }
}

function statusFor(file: string, rows: number, missingMessage: string): ImportStatus {
  const exists = fs.existsSync(file);
  return {
    connected: exists && rows > 0,
    file: path.relative(root, file).replace(/\\/g, "/"),
    rows,
    updatedAt: exists ? fs.statSync(file).mtime.toISOString() : null,
    message: exists && rows > 0 ? "Real export detected and imported." : missingMessage,
  };
}

function firstValue(row: CsvRow, names: string[]) {
  for (const name of names) {
    const value = row[name.toLowerCase()];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

function normalizePath(value: string) {
  if (!value) return "";
  const trimmed = value.trim();
  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, site.url);
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") || "/" : "";
  }
}

function absoluteUrl(pagePath: string) {
  return `${site.url}${pagePath === "/" ? "" : pagePath}`;
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[%,$\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRatio(value: string) {
  if (!value) return null;
  const parsed = toNumber(value);
  if (!Number.isFinite(parsed)) return null;
  return value.includes("%") ? parsed / 100 : parsed;
}

function sumNullable(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

function weightedAveragePosition(pages: SearchPerformancePage[]) {
  const weighted = pages.filter((page) => page.position !== null && page.impressions > 0);
  const denominator = weighted.reduce((sum, page) => sum + page.impressions, 0);
  if (!denominator) return null;
  return Number((weighted.reduce((sum, page) => sum + (page.position || 0) * page.impressions, 0) / denominator).toFixed(2));
}

function projectPath(...parts: string[]) {
  return path.join(/* turbopackIgnore: true */ root, ...parts);
}
