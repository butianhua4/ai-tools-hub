import { getPublishedSeoPosts } from "@/lib/seo-graph";
import { getSitemapPriority } from "@/lib/sitemap-priority";
import { sitemapUrlSet } from "@/lib/sitemap-xml";

export function GET() {
  const priority = getSitemapPriority("blog");
  return sitemapUrlSet(
    getPublishedSeoPosts().map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: priority.changeFrequency,
      priority: priority.priority,
    })),
  );
}
