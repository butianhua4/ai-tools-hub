import type { Metadata } from "next";
import Link from "next/link";
import {
  getBlogPath,
  getClusterPath,
  getHighPotentialQuestionPosts,
  getPostsForCluster,
  getQuestionPath,
  seoClusters,
} from "@/lib/seo-graph";

export const metadata: Metadata = {
  title: "AI 问题入口：Codex、部署、Agent、RAG、提示词和办公自动化",
  description: "按主题整理 AI 工具指南的高频问题入口，覆盖 Codex、Upwork、Vercel、GitHub、Node.js 报错、AI 工具、Agent、RAG、提示词和办公自动化。",
  alternates: { canonical: "/q" },
  openGraph: {
    title: "AI 问题入口",
    description: "从具体问题进入教程和工具，比直接翻文章更快。",
    url: "/q",
  },
};

export default function QuestionsIndexPage() {
  const priorityQuestions = getHighPotentialQuestionPosts(36);
  const highPotentialQuestions = getHighPotentialQuestionPosts(80);
  const clusterCards = seoClusters.map((cluster) => ({
    cluster,
    count: getPostsForCluster(cluster.slug).length,
    topQuestions: highPotentialQuestions.filter((post) => getQuestionPath(post).startsWith(`/q/${cluster.slug}/`)).slice(0, 4),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl overflow-hidden px-4 py-12">
      <section className="rounded-lg border border-gray-200 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium text-brand">Question Layer / SEO 入口层</p>
        <h1 className="mt-2 break-words text-3xl font-bold text-ink md:text-5xl">AI 问题入口：先解决具体问题，再进入深度教程</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
          这里把站内高频问题按主题集中展示，方便用户和搜索引擎从“怎么做、为什么失败、如何配置、用什么工具”这类具体问题进入。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link className="rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white" href="/tools">
            先看工具
          </Link>
          <Link className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-ink" href="/blog">
            进入教程库
          </Link>
          <Link className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-ink" href="/templates">
            下载模板
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-ink">按主题进入问题</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">每个主题页都会继续链接到 q 页面、cluster 中心页和深度文章，形成可抓取的闭环。</p>
          </div>
          <Link className="text-sm font-medium text-brand hover:underline" href="/sitemap-q.xml">
            查看 q sitemap
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clusterCards.map(({ cluster, count, topQuestions }) => (
            <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm" key={cluster.slug}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{cluster.shortTitle}</h3>
                  <p className="mt-1 text-sm text-gray-500">{count} 个问题入口</p>
                </div>
                <Link className="shrink-0 text-sm font-medium text-brand hover:underline" href={`/q/${cluster.slug}`}>
                  进入
                </Link>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{cluster.description}</p>
              <div className="mt-4 grid gap-2">
                {topQuestions.map((post) => (
                  <Link className="rounded-md bg-gray-50 px-3 py-2 text-sm leading-6 text-ink hover:text-brand" href={getQuestionPath(post)} key={post.slug}>
                    {post.title}
                  </Link>
                ))}
              </div>
              <Link className="mt-4 inline-flex text-sm font-medium text-brand hover:underline" href={getClusterPath(cluster.slug)}>
                查看主题中心
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-ink">优先抓取问题</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">这些问题由真实文章字段排序，优先覆盖报错、部署、Agent、提示词、办公自动化和项目交付。</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {priorityQuestions.map((post) => (
              <Link className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm font-medium leading-6 text-ink transition hover:border-brand/50 hover:bg-white" href={getQuestionPath(post)} key={post.slug}>
                {post.title}
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-ink">深度教程回流</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">q 页面负责承接搜索意图，深度文章负责完整解释和风险边界。</p>
          <div className="mt-4 grid gap-3">
            {priorityQuestions.slice(0, 10).map((post) => (
              <Link className="rounded-md border border-gray-100 p-3 transition hover:border-brand/50" href={getBlogPath(post)} key={post.slug}>
                <span className="block text-sm font-semibold leading-6 text-ink">{post.title}</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">{post.category}</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
