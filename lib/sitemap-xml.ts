import { site } from "@/data/site";

export type SitemapUrl = {
  path: string;
  lastModified?: Date | string;
  changeFrequency?: "daily" | "weekly" | "monthly";
  priority?: number;
};

export function sitemapUrlSet(urls: SitemapUrl[]) {
  const rows = urls
    .map((item) => {
      const lastModified = item.lastModified ? `<lastmod>${xmlEscape(toIsoDate(item.lastModified))}</lastmod>` : "";
      const changeFrequency = item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : "";
      const priority = typeof item.priority === "number" ? `<priority>${item.priority.toFixed(1)}</priority>` : "";
      return `<url><loc>${xmlEscape(site.url + item.path)}</loc>${lastModified}${changeFrequency}${priority}</url>`;
    })
    .join("");

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</urlset>`);
}

export function sitemapIndex(paths: string[]) {
  const now = new Date().toISOString();
  const rows = paths
    .map((path) => `<sitemap><loc>${xmlEscape(site.url + path)}</loc><lastmod>${now}</lastmod></sitemap>`)
    .join("");

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</sitemapindex>`);
}

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function toIsoDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
