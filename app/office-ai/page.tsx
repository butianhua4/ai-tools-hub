import type { Metadata } from "next";
import Link from "next/link";

const officeWorkflows = [
  {
    title: "AI 做 PPT",
    search: "PPT 大纲、汇报结构、路演页、课程课件",
    description: "先把目标、受众、页数和素材限制写清楚，再生成逐页标题、页面重点、图表建议和演讲备注。",
    href: "/tools/ppt-planner",
    steps: ["确定听众和汇报目标", "拆成 6 到 12 页结构", "每页只保留一个主信息", "人工检查数据和案例来源"],
  },
  {
    title: "AI 整理 Excel 表格",
    search: "Excel 清洗、CSV 整理、重复行、字段格式",
    description: "把混乱表格先转成可读结构，检查空值、重复行、字段类型，再决定是否继续做分析或图表。",
    href: "/tools/spreadsheet-cleaner",
    steps: ["保留原始表格备份", "统一字段名和日期格式", "标记空值和重复行", "输出前人工抽样核对"],
  },
  {
    title: "AI 写周报月报",
    search: "周报提示词、月报总结、工作复盘、项目进展",
    description: "用目标、已完成事项、阻塞问题和下周计划生成结构化周报，避免写成空泛流水账。",
    href: "/prompts",
    steps: ["列出本周事实", "按项目或指标归类", "区分成果和风险", "补上下一步负责人"],
  },
  {
    title: "AI 写邮件和通知",
    search: "邮件回复、客户通知、催办、会议邀请",
    description: "适合把口语化想法整理成清晰邮件。重点是语气、收件人关系、截止时间和需要对方采取的动作。",
    href: "/tools/industry-prompt-builder",
    steps: ["说明收件人身份", "写清背景和请求", "给出截止时间", "删除过度承诺和情绪化表达"],
  },
  {
    title: "AI 做会议纪要",
    search: "会议总结、行动项、纪要模板、待办清单",
    description: "把会议内容整理成议题、结论、分歧、行动项和截止时间，避免只生成一段漂亮摘要。",
    href: "/prompts",
    steps: ["按议题分段", "标记明确结论", "列出未决问题", "给每个行动项加负责人"],
  },
  {
    title: "AI 做运营内容",
    search: "小红书文案、公众号选题、短视频脚本、社群内容",
    description: "先定义受众、平台、转化目标和禁用表达，再生成多个角度的标题、正文和复盘指标。",
    href: "/prompts",
    steps: ["确定平台和人群", "生成多个角度", "检查平台规则", "用数据复盘而不是只看感觉"],
  },
];

const copyPrompts = [
  "请把以下工作记录整理成周报：按已完成、进行中、风险、下周计划输出，每条都要保留事实依据。",
  "请根据以下资料生成 PPT 大纲：目标受众是___，汇报目标是___，总页数是___，每页包含标题、重点、建议图表和演讲备注。",
  "请清洗以下表格字段：统一日期、金额、姓名和状态格式，标记空值、重复行和疑似异常值，不要直接删除原始数据。",
  "请把以下会议记录整理成纪要：输出议题、结论、分歧、行动项、负责人、截止时间和需要继续确认的问题。",
];

export const metadata: Metadata = {
  title: "AI 办公自动化工具：PPT、Excel、周报、邮件和会议纪要",
  description: "整理普通办公场景里常用的 AI 工作流，覆盖 AI 做 PPT、整理 Excel 表格、写周报、写邮件、会议纪要和运营内容。",
  alternates: { canonical: "/office-ai" },
  openGraph: {
    title: "AI 办公自动化工具：PPT、Excel、周报、邮件和会议纪要",
    description: "把日常办公任务拆成可执行 AI 工作流，并链接到 PPT、表格和提示词工具。",
    url: "/office-ai",
  },
};

export default function OfficeAiPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-hidden px-4 py-12">
      <section className="rounded-lg border border-gray-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium text-brand">AI 办公自动化 / PPT / Excel / 周报 / 会议纪要</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <h1 className="break-words text-3xl font-bold leading-tight text-ink md:text-5xl">AI 办公自动化工具：PPT、Excel、周报和会议纪要</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
              这里整理普通人真正会搜索的办公 AI 场景：做 PPT、整理表格、写周报、写邮件、会议纪要和运营内容。先选任务，再进入对应工具或提示词库，把结果变成能交付的版本。
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-ink">使用原则</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">AI 负责整理结构和草稿，人负责事实、数据、语气、隐私和最终责任。</p>
            <Link className="mt-4 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-white" href="/prompts">
              查看提示词库
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-ink">按办公任务选择工具</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">每个任务都给出搜索场景、处理思路和人工复核点。</p>
          </div>
          <Link className="text-sm font-medium text-brand hover:underline" href="/tools">
            查看全部工具
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {officeWorkflows.map((workflow) => (
            <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm" key={workflow.title}>
              <h3 className="text-lg font-semibold text-ink">{workflow.title}</h3>
              <p className="mt-1 text-xs leading-5 text-gray-500">{workflow.search}</p>
              <p className="mt-3 text-sm leading-6 text-gray-700">{workflow.description}</p>
              <ul className="mt-4 grid gap-2 text-sm text-gray-600">
                {workflow.steps.map((step) => (
                  <li className="rounded-md bg-gray-50 px-3 py-2" key={step}>
                    {step}
                  </li>
                ))}
              </ul>
              <Link className="mt-4 inline-flex text-sm font-medium text-brand hover:underline" href={workflow.href}>
                使用对应工具
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">可以直接改的办公提示词</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">复制前先把空位补齐，正式对外发送前再人工检查事实和语气。</p>
        <div className="mt-4 grid gap-3">
          {copyPrompts.map((prompt) => (
            <p className="rounded-md border border-gray-100 bg-gray-50 p-4 text-sm leading-7 text-gray-700" key={prompt}>
              {prompt}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand/50" href="/tools/ppt-planner">
          <h2 className="text-lg font-semibold text-ink">PPT 策划助手</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">生成逐页大纲、版式建议、视觉方向和可复制提示词。</p>
        </Link>
        <Link className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand/50" href="/tools/spreadsheet-cleaner">
          <h2 className="text-lg font-semibold text-ink">表格整理助手</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">清洗 CSV/Excel 文本，检查空值、重复行和字段类型。</p>
        </Link>
        <Link className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand/50" href="/tools/industry-prompt-builder">
          <h2 className="text-lg font-semibold text-ink">提示词生成器</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">按行业、岗位、任务和输出格式生成执行版提示词。</p>
        </Link>
      </section>
    </main>
  );
}
