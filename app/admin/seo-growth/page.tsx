import Link from "next/link";
import { notFound } from "next/navigation";
import { getInternalLinkOptimizationReport } from "@/lib/internal-link-optimizer";
import { getSeoGrowthReport, type SeoGrowthPage as SeoGrowthPageItem } from "@/lib/seo-growth-monitor";
import { getSitemapPriority } from "@/lib/sitemap-priority";

export const dynamic = "force-dynamic";

export default function SeoGrowthPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const report = getSeoGrowthReport();
  const optimizer = getInternalLinkOptimizationReport();
  const qPriority = getSitemapPriority("q");
  const clusterPriority = getSitemapPriority("cluster");
  const blogPriority = getSitemapPriority("blog");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Admin / SEO Growth</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-ink">SEO Growth Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">当前阶段：{report.growthStage} · 增长准备度：{report.growthReadinessScore}/100 · SEO Score：{report.seoScore}/100</p>
          </div>
          <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white" href="/admin/seo-graph">
            查看 SEO Graph
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-6">
          <Metric label="Total Pages" value={report.totalPages} />
          <Metric label="Q Pages" value={report.qPages} />
          <Metric label="Blog Pages" value={report.blogPages} />
          <Metric label="Cluster" value={report.clusterPages} />
          <Metric label="Orphan" value={report.orphanPages} />
          <Metric label="Weak" value={report.weakPages} />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel title="SEO 增长趋势面板">
          <div className="space-y-3 text-sm">
            <Row label="pages 增长基线" value={report.pageTrend.totalPages} />
            <Row label="q pages 增长基线" value={report.pageTrend.qPages} />
            <Row label="cluster 增长基线" value={report.pageTrend.clusterPages} />
            <p className="rounded-md bg-gray-50 p-3 leading-6 text-gray-600">{report.pageTrend.note}</p>
          </div>
        </Panel>

        <Panel title="Sitemap 提交优先级">
          <div className="space-y-3 text-sm">
            <Row label="/q pages" value={`${qPriority.priority.toFixed(1)} / ${qPriority.changeFrequency}`} />
            <Row label="/cluster pages" value={`${clusterPriority.priority.toFixed(1)} / ${clusterPriority.changeFrequency}`} />
            <Row label="/blog pages" value={`${blogPriority.priority.toFixed(1)} / ${blogPriority.changeFrequency}`} />
          </div>
        </Panel>

        <Panel title="流量启动检测">
          <div className="space-y-3 text-sm">
            <Row label="GSC connected" value={report.gsc.connected ? "yes" : "reserved"} />
            <Row label="crawl events" value={report.signals.crawlEvents} />
            <Row label="rising pages" value={report.signals.risingPages.length} />
            <Row label="potential pages" value={report.signals.potentialPages.length} />
            <p className="rounded-md bg-gray-50 p-3 leading-6 text-gray-600">{report.signals.evidence}</p>
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <PageList title={`A级页面（${report.pageGrades.a.length}+）`} pages={report.pageGrades.a} />
        <PageList title={`B级页面（${report.pageGrades.b.length}+）`} pages={report.pageGrades.b} />
        <PageList title={`C级页面（${report.pageGrades.c.length}）`} pages={report.pageGrades.c} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Internal Link 自优化规则">
          <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(optimizer, null, 2)}
          </pre>
        </Panel>
        <Panel title="可能先开始有流量的页面">
          <PageTable pages={report.signals.potentialPages.slice(0, 20)} />
        </Panel>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-3 py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function PageList({ pages, title }: { pages: SeoGrowthPageItem[]; title: string }) {
  return (
    <Panel title={title}>
      {pages.length ? <PageTable pages={pages.slice(0, 20)} /> : <p className="text-sm text-gray-500">暂无页面。</p>}
    </Panel>
  );
}

function PageTable({ pages }: { pages: Array<Pick<SeoGrowthPageItem, "path" | "title" | "type" | "incoming" | "outgoing"> & { gradeReason?: string }> }) {
  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <div className="rounded-md border border-gray-200 p-3 text-sm" key={page.path}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{page.type}</span>
            <Link className="font-medium text-brand hover:underline" href={page.path}>
              {page.path}
            </Link>
          </div>
          <p className="mt-1 leading-6 text-gray-700">{page.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            in {page.incoming} / out {page.outgoing}
            {page.gradeReason ? ` · ${page.gradeReason}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
