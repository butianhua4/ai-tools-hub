import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import {
  getBlogPath,
  getClusterBySlug,
  getClusterPath,
  getHighPotentialQuestionPosts,
  getPostsForCluster,
  getQuestionPath,
  type SeoClusterSlug,
  seoClusters,
} from "@/lib/seo-graph";

export function generateStaticParams() {
  return seoClusters.map((cluster) => ({ category: cluster.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cluster = getClusterBySlug(category);
  if (!cluster) return {};

  const title = `${cluster.shortTitle} 问题入口`;
  const description = `整理 ${cluster.shortTitle} 主题下的高频问题入口，链接到 q 页面、主题中心和深度教程。`;

  return {
    title,
    description,
    alternates: { canonical: `${site.url}/q/${cluster.slug}` },
    openGraph: {
      title,
      description,
      url: `${site.url}/q/${cluster.slug}`,
    },
  };
}

export default async function QuestionCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cluster = getClusterBySlug(category);
  if (!cluster) notFound();

  const allPosts = getPostsForCluster(cluster.slug as SeoClusterSlug);
  const priorityPosts = getHighPotentialQuestionPosts(160).filter((post) => getQuestionPath(post).startsWith(`/q/${cluster.slug}/`));
  const remainingPosts = allPosts.filter((post) => !priorityPosts.some((item) => item.slug === post.slug)).sort((a, b) => a.slug.localeCompare(b.slug));
  const posts = [...priorityPosts, ...remainingPosts];

  return (
    <main className="mx-auto w-full max-w-6xl overflow-hidden px-4 py-12">
      <section className="rounded-lg border border-gray-200 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Link className="font-medium text-brand" href="/q">
            AI 问题入口
          </Link>
          <span>/</span>
          <Link className="font-medium text-brand" href={getClusterPath(cluster.slug)}>
            {cluster.shortTitle} 主题中心
          </Link>
        </div>
        <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-ink md:text-5xl">{cluster.shortTitle} 问题入口</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">{cluster.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link className="rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white" href={getClusterPath(cluster.slug)}>
            查看主题中心
          </Link>
          <Link className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-ink" href="/blog">
            查看教程库
          </Link>
          <Link className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-ink" href="/tools">
            查看工具导航
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-ink">该主题下的全部问题</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">优先展示高潜力问题，其余问题继续保留为可点击入口，避免 q 页面只存在于 sitemap 里。</p>
          </div>
          <p className="text-sm text-gray-500">共 {posts.length} 个问题</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand/50 hover:shadow-md"
              href={getQuestionPath(post)}
              key={post.slug}
            >
              <h3 className="break-words text-base font-semibold leading-6 text-ink">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">深度教程入口</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">如果 q 页只能回答快速路径，可以继续进入对应 blog 深度文章。</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {posts.slice(0, 12).map((post) => (
            <Link className="rounded-md border border-gray-100 bg-gray-50 p-3 transition hover:border-brand/50 hover:bg-white" href={getBlogPath(post)} key={post.slug}>
              <span className="block text-sm font-semibold leading-6 text-ink">{post.title}</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">{post.category}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
