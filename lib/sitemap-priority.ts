import type { SeoPageType } from "@/lib/seo-graph";

export type SitemapPriorityRule = {
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

export function getSitemapPriority(type: SeoPageType): SitemapPriorityRule {
  if (type === "q") return { changeFrequency: "daily", priority: 1.0 };
  if (type === "cluster") return { changeFrequency: "weekly", priority: 0.9 };
  return { changeFrequency: "monthly", priority: 0.6 };
}

export function getSitemapPriorityByPath(path: string): SitemapPriorityRule {
  if (path.startsWith("/q/")) return getSitemapPriority("q");
  if (path.startsWith("/cluster/")) return getSitemapPriority("cluster");
  return getSitemapPriority("blog");
}
