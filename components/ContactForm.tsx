"use client";

import { useMemo, useState } from "react";
import { site } from "@/data/site";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [goal, setGoal] = useState("");
  const [website, setWebsite] = useState(""); // 蜜罐：真人不会填

  const summary = useMemo(
    () =>
      [
        "咨询信息草稿",
        `姓名：${name || "待填写"}`,
        `邮箱：${email || "待填写"}`,
        `遇到的问题：${problem || "待填写"}`,
        `想做什么：${goal || "待填写"}`,
        "",
        "建议补充：操作系统、工具名称、完整报错、项目链接或截图、已经尝试过的步骤、希望交付的结果。",
      ].join("\n"),
    [email, goal, name, problem],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, problem, goal, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      setErrorMsg(data.error || "发送失败，请稍后重试或手动发邮件。");
      setStatus("error");
    } catch {
      setErrorMsg("网络异常，请稍后重试或手动发邮件。");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-green-700">提交成功</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">已收到你的咨询</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          消息已发送，我会尽快通过你填写的邮箱回复（一般 1–2 个工作日）。如长时间未收到，也可直接邮件联系{" "}
          <a className="font-medium text-brand hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          。
        </p>
        <button
          className="mt-4 w-fit rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
          onClick={() => {
            setStatus("idle");
            setName("");
            setEmail("");
            setProblem("");
            setGoal("");
          }}
        >
          再提交一条
        </button>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-brand">联系表单</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">描述你的问题</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          填写后直接提交，我会收到邮件并尽快回复你填写的邮箱。也可随时邮件联系{" "}
          <a className="font-medium text-brand hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          （备用 {site.backupEmail}）。
        </p>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            姓名
            <input
              className="mt-2 w-full rounded-md border border-gray-300 p-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="怎么称呼你"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            邮箱
            <input
              className="mt-2 w-full rounded-md border border-gray-300 p-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="用于后续联系"
            />
          </label>
        </div>
        {/* 蜜罐字段：对真人隐藏，机器人易填 */}
        <div className="hidden" aria-hidden="true">
          <label>
            网站
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>
        <label className="text-sm font-medium text-ink">
          你遇到的问题
          <textarea
            className="mt-2 h-28 w-full rounded-md border border-gray-300 p-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            required
            placeholder="例如：Vercel 部署失败、GitHub 推送失败、Upwork 客户需求看不懂"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          你想做什么
          <textarea
            className="mt-2 h-28 w-full rounded-md border border-gray-300 p-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            required
            placeholder="例如：想部署一个小网站、想检查 Proposal、想判断一个项目是否适合新手"
          />
        </label>
        <button
          className="w-fit rounded-md bg-brand px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "发送中…" : "提交咨询"}
        </button>
      </form>

      {status === "error" ? (
        <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-semibold">{errorMsg}</p>
          <p className="mt-1">
            可把下面草稿复制后发送到{" "}
            <a className="underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            ：
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-white p-3 text-xs leading-5 text-gray-700">{summary}</pre>
        </div>
      ) : null}
    </section>
  );
}
