"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type Provider = "openai" | "anthropic" | "gemini" | "openrouter" | "mixed";
type Workload = "chat" | "rag" | "agent" | "batch" | "tool";
type DataLevel = "public" | "internal" | "customer" | "sensitive";
type Fallback = "none" | "same_provider" | "multi_provider" | "queue";

const providers: Array<[Provider, string]> = [
  ["openai", "OpenAI"],
  ["anthropic", "Claude / Anthropic"],
  ["gemini", "Gemini"],
  ["openrouter", "OpenRouter"],
  ["mixed", "多供应商"],
];

const workloads: Array<[Workload, string]> = [
  ["chat", "聊天/客服"],
  ["rag", "RAG 问答"],
  ["agent", "Agent 工具调用"],
  ["batch", "批处理"],
  ["tool", "站内工具"],
];

const dataLevels: Array<[DataLevel, string]> = [
  ["public", "公开资料"],
  ["internal", "内部资料"],
  ["customer", "客户资料"],
  ["sensitive", "合同/财务/隐私敏感"],
];

const fallbacks: Array<[Fallback, string]> = [
  ["none", "无降级"],
  ["same_provider", "同供应商小模型"],
  ["multi_provider", "跨供应商降级"],
  ["queue", "排队/异步处理"],
];

const providerAdvice: Record<Provider, { limits: string; keys: string; routing: string[] }> = {
  openai: {
    limits: "按项目/组织查看 RPM、TPM、RPD 和模型权限，生产前要确认实际限额。",
    keys: "使用项目级 key 或 service account；不要把 key 放进前端包。",
    routing: ["主模型处理高价值请求", "小模型处理分类/摘要/重写", "超限时排队或降级"],
  },
  anthropic: {
    limits: "同时关注 rate limits 和 spend limits；工作区可设置用户可配置限额。",
    keys: "按 workspace 拆分 key；日志里保留 request id，方便排错。",
    routing: ["复杂分析走高质量模型", "日常请求走均衡模型", "批处理放到异步队列"],
  },
  gemini: {
    limits: "在 AI Studio/Google Cloud 查看当前项目限额；不同模型和 tier 限额可能不同。",
    keys: "按项目隔离 key；生产环境要配置账单上限和错误告警。",
    routing: ["低延迟请求走快速模型", "大上下文请求单独限流", "预览模型要设置替代方案"],
  },
  openrouter: {
    limits: "可查询 key 的 credits/limits；免费模型和付费模型限额策略不同。",
    keys: "管理 key 与应用 key 分开；不要把 management key 给客户端。",
    routing: ["同一接口路由多个模型", "按价格/延迟/能力选择模型", "保留供应商级兜底"],
  },
  mixed: {
    limits: "每个供应商都要单独记录 RPM、TPM、余额、账单上限和状态页。",
    keys: "按供应商、环境、客户或项目拆 key；所有 key 都要可轮换。",
    routing: ["主供应商失败后切备用", "不同任务走不同模型", "统一记录成本、延迟和错误"],
  },
};

const workloadAdvice: Record<Workload, string[]> = {
  chat: ["优先控制延迟和输出长度", "高峰期启用小模型降级", "客服敏感回复保留人工审核"],
  rag: ["先检索再生成，避免把整份文档塞进上下文", "缓存检索结果和常见问答", "无引用来源时不要硬答"],
  agent: ["工具调用要分只读、草稿、写入和执行权限", "写入前保留人工确认", "记录每一步 tool call"],
  batch: ["适合异步队列、批量重试和低优先级模型", "失败可延迟重跑", "不要抢占在线请求限额"],
  tool: ["站内工具要限制单用户频率", "复制类/规划类请求可缓存", "错误提示要避免泄露 key"],
};

export function ApiRoutingCostCheckerClient() {
  const [provider, setProvider] = useState<Provider>("mixed");
  const [workload, setWorkload] = useState<Workload>("agent");
  const [dataLevel, setDataLevel] = useState<DataLevel>("customer");
  const [fallback, setFallback] = useState<Fallback>("multi_provider");
  const [requestsPerDay, setRequestsPerDay] = useState(3000);
  const [peakRpm, setPeakRpm] = useState(80);
  const [avgInputTokens, setAvgInputTokens] = useState(1200);
  const [avgOutputTokens, setAvgOutputTokens] = useState(600);
  const [retryRate, setRetryRate] = useState(8);
  const [cacheHitRate, setCacheHitRate] = useState(25);
  const [inputUsd, setInputUsd] = useState(0.5);
  const [outputUsd, setOutputUsd] = useState(1.5);
  const [monthlyBudgetUsd, setMonthlyBudgetUsd] = useState(300);
  const [rpmLimit, setRpmLimit] = useState(120);
  const [tpmLimit, setTpmLimit] = useState(120000);

  const plan = useMemo(
    () =>
      buildPlan({
        avgInputTokens,
        avgOutputTokens,
        cacheHitRate,
        dataLevel,
        fallback,
        inputUsd,
        monthlyBudgetUsd,
        outputUsd,
        peakRpm,
        provider,
        requestsPerDay,
        retryRate,
        rpmLimit,
        tpmLimit,
        workload,
      }),
    [
      avgInputTokens,
      avgOutputTokens,
      cacheHitRate,
      dataLevel,
      fallback,
      inputUsd,
      monthlyBudgetUsd,
      outputUsd,
      peakRpm,
      provider,
      requestsPerDay,
      retryRate,
      rpmLimit,
      tpmLimit,
      workload,
    ],
  );

  return (
    <>
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="供应商" onChange={(value) => setProvider(value as Provider)} options={providers} value={provider} />
            <Select label="工作负载" onChange={(value) => setWorkload(value as Workload)} options={workloads} value={workload} />
            <Select label="数据敏感度" onChange={(value) => setDataLevel(value as DataLevel)} options={dataLevels} value={dataLevel} />
            <Select label="降级策略" onChange={(value) => setFallback(value as Fallback)} options={fallbacks} value={fallback} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <NumberInput label="每日请求数" min={1} onChange={setRequestsPerDay} step={100} value={requestsPerDay} />
            <NumberInput label="峰值 RPM" min={1} onChange={setPeakRpm} step={10} value={peakRpm} />
            <NumberInput label="RPM 限额" min={1} onChange={setRpmLimit} step={10} value={rpmLimit} />
            <NumberInput label="平均输入 tokens" min={1} onChange={setAvgInputTokens} step={100} value={avgInputTokens} />
            <NumberInput label="平均输出 tokens" min={1} onChange={setAvgOutputTokens} step={50} value={avgOutputTokens} />
            <NumberInput label="TPM 限额" min={1} onChange={setTpmLimit} step={10000} value={tpmLimit} />
            <NumberInput label="重试率 %" min={0} onChange={setRetryRate} step={1} value={retryRate} />
            <NumberInput label="缓存命中率 %" min={0} onChange={setCacheHitRate} step={5} value={cacheHitRate} />
            <NumberInput label="月预算 $" min={0} onChange={setMonthlyBudgetUsd} step={50} value={monthlyBudgetUsd} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <NumberInput label="输入 $/百万 tokens" min={0} onChange={setInputUsd} step={0.1} value={inputUsd} />
            <NumberInput label="输出 $/百万 tokens" min={0} onChange={setOutputUsd} step={0.1} value={outputUsd} />
          </div>
        </div>

        <aside className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">路由检查</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">限流、成本、key 安全和降级策略要一起算，不要等线上 429 或账单爆了再补。</p>
            </div>
            <CopyButton label="复制方案" text={plan.fullText} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <Info label="月成本粗估" value={`$${plan.monthlyCostUsd.toFixed(2)}`} />
            <Info label="峰值 TPM 需求" value={Math.ceil(plan.peakTpmNeeded).toLocaleString()} />
            <Info label="限流结论" value={plan.rateLimitConclusion} />
            <Info label="预算结论" value={plan.budgetConclusion} />
          </dl>
        </aside>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PlanPanel title="路由策略" items={plan.routingPlan} copyText={plan.routingPlan.join("\n")} />
        <PlanPanel title="限流与重试" items={plan.rateLimitPlan} copyText={plan.rateLimitPlan.join("\n")} />
        <PlanPanel title="密钥与日志" items={plan.securityPlan} copyText={plan.securityPlan.join("\n")} />
      </section>

      <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">可复制 API 接入方案</h2>
            <p className="mt-1 text-sm leading-6 text-gray-700">适合放进技术方案、PRD、客户报价说明或上线评审。</p>
          </div>
          <CopyButton label="复制全部" text={plan.fullText} />
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-gray-800">{plan.fullText}</pre>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">上线前检查清单</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-gray-700 md:grid-cols-2">
          {[
            "上线前到供应商控制台确认真实 RPM、TPM、RPD、预算和模型权限。",
            "所有 API key 只放服务端环境变量，不进入前端、不写日志、不放截图。",
            "429、5xx、超时和余额不足要分开处理，不要无脑立即重试。",
            "缓存命中、输出长度、模型降级和异步队列通常比换供应商更先省钱。",
            "客户资料、合同、财务和隐私内容要脱敏，并保留人工审核节点。",
            "记录 request id、模型、tokens、成本、延迟和错误码，但不要记录完整敏感输入。",
          ].map((item) => (
            <li className="rounded-md bg-gray-50 p-3" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function buildPlan({
  avgInputTokens,
  avgOutputTokens,
  cacheHitRate,
  dataLevel,
  fallback,
  inputUsd,
  monthlyBudgetUsd,
  outputUsd,
  peakRpm,
  provider,
  requestsPerDay,
  retryRate,
  rpmLimit,
  tpmLimit,
  workload,
}: {
  avgInputTokens: number;
  avgOutputTokens: number;
  cacheHitRate: number;
  dataLevel: DataLevel;
  fallback: Fallback;
  inputUsd: number;
  monthlyBudgetUsd: number;
  outputUsd: number;
  peakRpm: number;
  provider: Provider;
  requestsPerDay: number;
  retryRate: number;
  rpmLimit: number;
  tpmLimit: number;
  workload: Workload;
}) {
  const effectiveRequests = requestsPerDay * (1 - clamp(cacheHitRate) / 100) * (1 + Math.max(0, retryRate) / 100);
  const dailyInputMillion = (effectiveRequests * avgInputTokens) / 1_000_000;
  const dailyOutputMillion = (effectiveRequests * avgOutputTokens) / 1_000_000;
  const monthlyCostUsd = (dailyInputMillion * inputUsd + dailyOutputMillion * outputUsd) * 30;
  const peakTpmNeeded = peakRpm * (avgInputTokens + avgOutputTokens) * (1 + Math.max(0, retryRate) / 100);
  const rateLimitOk = peakRpm <= rpmLimit && peakTpmNeeded <= tpmLimit;
  const budgetOk = monthlyBudgetUsd <= 0 ? true : monthlyCostUsd <= monthlyBudgetUsd;
  const sensitive = dataLevel === "customer" || dataLevel === "sensitive";
  const advice = providerAdvice[provider];

  const rateLimitConclusion = rateLimitOk
    ? "当前输入的峰值请求在 RPM/TPM 限额内，仍需按供应商控制台复核。"
    : "当前峰值可能超限，需要排队、缓存、降级或申请更高限额。";
  const budgetConclusion = budgetOk ? "当前粗估未超过月预算。" : "当前粗估超过月预算，需要降模型、限输出、加缓存或改异步。";

  const routingPlan = [
    `供应商：${labelFor(providers, provider)}。${advice.limits}`,
    `工作负载：${labelFor(workloads, workload)}。${workloadAdvice[workload].join(" ")}`,
    fallback === "multi_provider"
      ? "建议保留跨供应商降级，但要统一响应格式、错误码、日志和成本统计。"
      : fallback === "same_provider"
        ? "建议同供应商内配置主模型和小模型，失败或超预算时降级。"
        : fallback === "queue"
          ? "建议峰值请求进入队列，在线请求只处理高优先级任务。"
          : "当前没有降级方案，生产上线风险偏高。",
    sensitive ? "敏感数据：默认脱敏、最小化输入，不把原文写入日志。" : "低敏数据：仍需记录来源、用途和用户授权范围。",
  ];

  const rateLimitPlan = [
    `峰值 RPM 需求：${peakRpm}，配置限额：${rpmLimit}。`,
    `峰值 TPM 需求：${Math.ceil(peakTpmNeeded).toLocaleString()}，配置限额：${tpmLimit.toLocaleString()}。`,
    `缓存命中率：${cacheHitRate}%；重试率：${retryRate}%；有效日请求约 ${Math.ceil(effectiveRequests).toLocaleString()}。`,
    "429 使用指数退避和抖动；5xx 可短暂重试；余额不足或权限错误不要重试。",
    "批处理、总结、离线评测放到低优先级队列，不要挤占在线客服/Agent 请求。",
  ];

  const securityPlan = [
    advice.keys,
    "环境变量建议：AI_PROVIDER、PRIMARY_MODEL、FALLBACK_MODEL、API_TIMEOUT_MS、MAX_OUTPUT_TOKENS、MONTHLY_BUDGET_USD。",
    "日志建议：记录 request id、用户 id 哈希、模型、tokens、成本、延迟、错误码和路由结果。",
    "脱敏建议：不要记录完整 prompt、客户原文、身份证、电话、地址、合同金额和 API key。",
    "轮换建议：按环境拆 key，泄露后可单独撤销；生产 key 不给本地调试和前端页面。",
  ];

  const fullText = [
    "# AI API 接入、限流与成本路由检查",
    "",
    "## 输入参数",
    `- 供应商：${labelFor(providers, provider)}`,
    `- 工作负载：${labelFor(workloads, workload)}`,
    `- 数据敏感度：${labelFor(dataLevels, dataLevel)}`,
    `- 每日请求：${requestsPerDay}`,
    `- 峰值 RPM：${peakRpm}`,
    `- 平均输入/输出 tokens：${avgInputTokens}/${avgOutputTokens}`,
    `- 缓存命中率：${cacheHitRate}%`,
    `- 重试率：${retryRate}%`,
    "",
    "## 成本与限流粗估",
    `- 月成本粗估：$${monthlyCostUsd.toFixed(2)}`,
    `- 峰值 TPM 需求：${Math.ceil(peakTpmNeeded).toLocaleString()}`,
    `- 限流结论：${rateLimitConclusion}`,
    `- 预算结论：${budgetConclusion}`,
    "- 注意：价格和限额必须以供应商控制台和官方文档当日数据为准。",
    "",
    "## 路由策略",
    ...routingPlan.map((item) => `- ${item}`),
    "",
    "## 限流与重试",
    ...rateLimitPlan.map((item) => `- ${item}`),
    "",
    "## 密钥、日志与隐私",
    ...securityPlan.map((item) => `- ${item}`),
  ].join("\n");

  return { budgetConclusion, fullText, monthlyCostUsd, peakTpmNeeded, rateLimitConclusion, rateLimitPlan, routingPlan, securityPlan };
}

function PlanPanel({ copyText, items, title }: { copyText: string; items: string[]; title: string }) {
  return (
    <article className="min-w-0 rounded-lg border border-blue-100 bg-blue-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <CopyButton label="复制" text={copyText} />
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
        {items.map((item) => (
          <li className="rounded-md bg-white p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function NumberInput({
  label,
  min,
  onChange,
  step = 1,
  value,
}: {
  label: string;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800">
      {label}
      <select
        className="mt-2 w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-6 text-gray-900">{value}</dd>
    </div>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function labelFor<T extends string>(options: Array<[T, string]>, value: T) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value;
}
