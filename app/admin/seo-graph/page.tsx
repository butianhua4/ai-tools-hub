import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoGraph } from "@/lib/seo-graph";

export const dynamic = "force-dynamic";

export default function SeoGraphPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const graph = getSeoGraph();
  const summary = {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    clusters: graph.hubPages.length,
    orphanPages: graph.orphanPages.length,
    weakPages: graph.weakPages.length,
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand">Admin / SEO Graph</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">SEO 连接图</h1>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {Object.entries(summary).map(([key, value]) => (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4" key={key}>
              <div className="text-xs uppercase text-gray-500">{key}</div>
              <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Cluster 结构">
          <div className="space-y-4">
            {graph.clusters.map(({ cluster, posts, questions }) => (
              <details className="rounded-md border border-gray-200 p-4" key={cluster.slug} open>
                <summary className="cursor-pointer font-semibold text-ink">
                  {cluster.shortTitle}：{posts.length} 篇 Blog / {questions.length} 个 Q
                </summary>
                <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
{`/cluster/${cluster.slug}
  -> /q/${cluster.slug}/[slug]
  -> /blog/[slug]
  -> /cluster/${cluster.slug}`}
                </pre>
              </details>
            ))}
          </div>
        </Panel>

        <Panel title="Top Hub Pages">
          <Table
            rows={graph.hubPages.map((node) => ({
              path: node.path,
              title: node.title,
              links: node.outgoing.length,
              incoming: node.incoming.length,
            }))}
          />
        </Panel>

        <Panel title="Orphan Pages">
          {graph.orphanPages.length ? (
            <Table
              rows={graph.orphanPages.map((node) => ({
                path: node.path,
                title: node.title,
                links: node.outgoing.length,
                incoming: node.incoming.length,
              }))}
            />
          ) : (
            <p className="text-sm text-gray-600">当前 SEO 网络没有孤立页面。</p>
          )}
        </Panel>

        <Panel title="Weak Pages">
          {graph.weakPages.length ? (
            <div className="space-y-3">
              {graph.weakPages.slice(0, 50).map((node) => (
                <div className="rounded-md border border-gray-200 p-3 text-sm" key={node.path}>
                  <Link className="font-medium text-brand hover:underline" href={node.path}>
                    {node.path}
                  </Link>
                  <p className="mt-1 text-gray-700">{node.title}</p>
                  <p className="mt-1 text-gray-500">原因：{node.reasons.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">所有 SEO 网络页面已满足内链规则。</p>
          )}
        </Panel>
      </section>
    </main>
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

function Table({ rows }: { rows: Array<{ path: string; title: string; links: number; incoming: number }> }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-gray-500">
          <tr>
            <th className="border-b py-2 pr-3">Page</th>
            <th className="border-b py-2 pr-3">Links</th>
            <th className="border-b py-2 pr-3">Incoming</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row) => (
            <tr key={row.path}>
              <td className="border-b py-2 pr-3">
                <Link className="font-medium text-brand hover:underline" href={row.path}>
                  {row.path}
                </Link>
                <div className="mt-1 text-xs text-gray-500">{row.title}</div>
              </td>
              <td className="border-b py-2 pr-3">{row.links}</td>
              <td className="border-b py-2 pr-3">{row.incoming}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
