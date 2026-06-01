import { getAllPosts } from "../lib/blog";

const defaultBase = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-jiedan-lab.vercel.app";
const base = normalizeBase(readArg("url") || readArg("base") || defaultBase);

const checks = [
  ["/", "AI 接单实验室"],
  ["/blog", "新手教程"],
  ["/tools", "AI 工具导航"],
  ["/tools/proposal-generator", "Upwork Proposal 生成器"],
  ["/tools/error-explainer", "Codex 报错解释器"],
  ["/tools/pricing-calculator", "项目报价助手"],
  ["/templates", "模板下载"],
  ["/roadmap", "AI 接单 30 天路线图"],
  ["/sitemap.xml", "<urlset"],
  ["/robots.txt", "Sitemap"],
] as const;

async function main() {
  const pageResults = [];
  const publicPosts = getAllPosts(false);

  for (const [path, expected] of checks) {
    const url = `${base}${path}`;
    const response = await fetch(url);
    const text = await response.text();
    pageResults.push({
      path,
      status: response.status,
      ok: response.ok && text.includes(expected),
      expected,
    });
  }

  const sitemap = await fetchText("/sitemap.xml");
  const robots = await fetchText("/robots.txt");
  const home = await fetchText("/");
  const articleResults = [];
  const missingPublishedPosts = publicPosts.filter((post) => !sitemap.includes(`${base}/blog/${post.slug}`));

  for (const post of publicPosts) {
    const path = `/blog/${post.slug}`;
    const url = `${base}${path}`;
    const response = await fetch(url);
    const text = await response.text();
    articleResults.push({
      path,
      status: response.status,
      ok: response.ok && text.includes(post.title) && text.includes(`${base}${path}`),
      title: post.title,
    });
  }

  const draftLeak = sitemap.includes("codex-codex-4-31") || sitemap.includes("codex-codex-github-4-36");
  const result = {
    base,
    pages: pageResults,
    articles: {
      publicCount: publicPosts.length,
      checked: articleResults.length,
      failed: articleResults.filter((item) => !item.ok),
      missingFromSitemap: missingPublishedPosts.map((post) => post.slug),
    },
    sitemap: {
      urlCount: [...sitemap.matchAll(/<loc>/g)].length,
      usesBase: sitemap.includes(base),
      leaksDrafts: draftLeak,
    },
    robots: {
      allowsAll: robots.includes("Allow: /"),
      pointsToSitemap: robots.includes(`${base}/sitemap.xml`),
    },
    canonical: {
      home: home.includes('rel="canonical"') && home.includes(base),
      article: articleResults.every((item) => item.ok),
    },
  };

  console.log(JSON.stringify(result, null, 2));

  if (
    pageResults.some((item) => !item.ok) ||
    result.articles.failed.length > 0 ||
    result.articles.missingFromSitemap.length > 0 ||
    result.sitemap.leaksDrafts ||
    !result.sitemap.usesBase ||
    !result.robots.pointsToSitemap ||
    !result.canonical.article
  ) {
    process.exitCode = 1;
  }
}

async function fetchText(path: string) {
  const response = await fetch(`${base}${path}`);
  return response.text();
}

function normalizeBase(value: string) {
  return value.replace(/\/+$/, "");
}

function readArg(name: string) {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

void main();
