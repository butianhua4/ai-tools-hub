import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/data/site";

export const runtime = "nodejs";

// 收件人：默认发到站点主邮箱，可用 env 覆盖
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || site.email;
// 发件人：未验证域名时用 Resend 测试发件域 onboarding@resend.dev（可发到账号本人邮箱）；
// 验证 ai.aporet.com 后改成 noreply@ai.aporet.com 即可。
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "AI Tools Guide <onboarding@resend.dev>";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求格式错误" }, { status: 400 });
  }

  // 蜜罐：机器人通常会填这个隐藏字段，填了就当成功静默丢弃
  if (clip(body.website, 100)) {
    return NextResponse.json({ ok: true });
  }

  const name = clip(body.name, 100);
  const email = clip(body.email, 200);
  const problem = clip(body.problem, 4000);
  const goal = clip(body.goal, 4000);

  if (!name || !email || !problem) {
    return NextResponse.json({ ok: false, error: "请填写姓名、邮箱和问题描述" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "邮箱格式不正确" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // 后端未配置 key：返回 503，前端据此降级为“保存草稿手动发邮件”
    return NextResponse.json(
      { ok: false, error: "表单后端尚未配置，请先把草稿保存并手动发送邮件。", fallback: true },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const subject = `[ai.aporet.com 咨询] ${name}`;
  const html = [
    `<h2>新的联系表单咨询</h2>`,
    `<p><strong>姓名：</strong>${esc(name)}</p>`,
    `<p><strong>邮箱：</strong>${esc(email)}</p>`,
    `<p><strong>遇到的问题：</strong><br>${esc(problem)}</p>`,
    `<p><strong>想做什么：</strong><br>${esc(goal) || "（未填写）"}</p>`,
    `<hr><p style="color:#888;font-size:12px">来自 ${site.url}/contact，直接回复本邮件即可联系访客。</p>`,
  ].join("");

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject,
      html,
    });
    if (error) {
      console.error("[contact] resend error:", error);
      return NextResponse.json({ ok: false, error: "邮件发送失败，请稍后重试或手动发邮件。", fallback: true }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send exception:", err);
    return NextResponse.json({ ok: false, error: "邮件发送失败，请稍后重试或手动发邮件。", fallback: true }, { status: 502 });
  }
}
