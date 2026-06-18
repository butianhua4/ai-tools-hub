import { getPublishedSeoPosts, getQuestionPath, seoClusters } from "@/lib/seo-graph";
import { getSitemapPriority } from "@/lib/sitemap-priority";
import { sitemapUrlSet, type SitemapUrl } from "@/lib/sitemap-xml";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const priority = getSitemapPriority("q");
  const entries: SitemapUrl[] = [
    {
      path: "/q",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: priority.priority,
    },
    ...seoClusters.map(
      (cluster): SitemapUrl => ({
        path: `/q/${cluster.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }),
    ),
    ...getPublishedSeoPosts().map(
      (post): SitemapUrl => ({
        path: getQuestionPath(post),
        lastModified: post.updatedAt,
        changeFrequency: priority.changeFrequency,
        priority: priority.priority,
      }),
    ),
  ];

  return sitemapUrlSet(entries);
}
