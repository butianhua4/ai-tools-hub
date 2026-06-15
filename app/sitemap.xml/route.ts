import { sitemapIndex } from "@/lib/sitemap-xml";

export function GET() {
  return sitemapIndex(["/sitemap-blog.xml", "/sitemap-q.xml", "/sitemap-cluster.xml", "/sitemap-static.xml"]);
}
