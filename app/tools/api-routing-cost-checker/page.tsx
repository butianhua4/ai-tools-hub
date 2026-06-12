import type { Metadata } from "next";
import { ApiRoutingCostCheckerClient } from "@/components/ApiRoutingCostCheckerClient";
import { ToolCTA } from "@/components/ToolCTA";

export const metadata: Metadata = {
  title: "AI API 接入、限流与成本路由检查器",
  description: "输入供应商、工作负载、请求量、tokens、重试率、缓存命中率、预算和限额，生成 AI API 路由、限流、成本、密钥和日志检查方案。",
  alternates: { canonical: "/tools/api-routing-cost-checker" },
  openGraph: {
    title: "AI API 接入、限流与成本路由检查器",
    description: "规划 OpenAI、Claude、Gemini、OpenRouter 或多供应商 API 接入，检查 RPM、TPM、预算、降级、缓存、key 安全和日志脱敏。",
    url: "/tools/api-routing-cost-checker",
  },
};

export default function ApiRoutingCostCheckerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-hidden px-4 py-12">
      <section className="rounded-lg border border-gray-200 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium text-brand">AI API / Rate Limit / 成本路由 / Key 安全</p>
        <h1 className="mt-2 break-words text-3xl font-bold text-ink">AI API 接入、限流与成本路由检查器</h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          输入供应商、工作负载、请求量、tokens、重试率、缓存命中率、预算和当前限额，粗估 API 成本和峰值 TPM，生成路由、限流、降级、密钥安全和日志脱敏方案。适合 SaaS、站内工具、RAG、Agent 和批处理上线前评审。
        </p>
      </section>
      <ApiRoutingCostCheckerClient />
      <p className="mt-8 rounded-lg border bg-white p-4 text-sm leading-6 text-gray-600">
        提醒：本工具只做规划和粗估，不读取你的真实 API key，也不代表供应商实时价格或限额。正式上线前，请以供应商控制台、官方文档和真实压测为准。
      </p>
      <div className="mt-8">
        <ToolCTA title="API 路由检查后下一步" />
      </div>
    </main>
  );
}
