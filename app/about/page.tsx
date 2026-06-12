export const metadata = {
  title: "关于我",
  description: "AI 工具指南记录 AI 工具教程、部署、提示词、办公自动化和人工审核式内容生产，不包装成专家，不承诺暴富。",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">关于我</h1>
      <div className="mt-6 space-y-5 leading-8 text-gray-700">
        <p>AI 工具指南不是课程包装站，也不承诺任何收入结果。它记录的是如何用 Codex、Claude Code、ChatGPT、GitHub、Vercel、Upwork、Fiverr 等工具，整理真实教程、工具入口、模板和数字产品。</p>
        <p>本站更关注真实流程：如何选择工具，如何写不过度承诺的提示词和 Proposal，如何排查报错，如何部署项目，如何把模板和工具变成可复用资产。</p>
        <p>长期目标是建立工具、模板和内容组成的被动收入系统，而不是依赖大量人工服务。所有内容都需要人工审核，AI 只做辅助。</p>
      </div>
    </main>
  );
}
