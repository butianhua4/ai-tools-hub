import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">AI 工具指南</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-gray-700">
          用 AI 工具完成办公自动化、提示词、部署、RAG 和项目交付判断。
        </p>
        <p className="mt-3 max-w-3xl text-gray-600">
          面向中文用户整理可搜索、可执行、可人工复核的 AI 工具教程和模板。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-md bg-brand px-5 py-3 text-white" href="/tools/proposal-generator">免费生成 Proposal</Link>
          <Link className="rounded-md border px-5 py-3" href="/tools/error-explainer">解释报错</Link>
          <Link className="rounded-md border px-5 py-3" href="/templates">下载模板包</Link>
        </div>
      </div>
    </section>
  );
}
