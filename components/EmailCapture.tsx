"use client";

import { useState } from "react";

export function EmailCapture() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-brand">邮箱订阅预留</p>
      <h2 className="mt-2 text-lg font-semibold text-ink">获取模板更新提醒</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        第一版不接后端，只保留订阅入口。后续可以接 Resend、Formspree 或 Supabase，用来发送新模板、审核清单和工具更新。
      </p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-md border border-gray-300 p-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
          type="email"
          placeholder="你的邮箱"
          required
        />
        <button className="rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-slate-700" type="submit">
          订阅
        </button>
      </form>
      {submitted ? (
        <p className="mt-3 rounded-md bg-green-50 p-3 text-sm leading-6 text-green-800">
          表单后端还没上线。当前请先通过联系页邮箱获取模板；这条状态用于验证后续订阅流程。
        </p>
      ) : null}
    </section>
  );
}
