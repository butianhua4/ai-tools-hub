// 扫全站内链坏链:建立"存在路径"集合,检测所有 mdx 里指向不存在页面的内部链接
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// 1) 收集存在的 blog slug
const blogSlugs = new Set(readdirSync("content/blog").filter(f => f.endsWith(".mdx")).map(f => "/blog/" + f.replace(/\.mdx$/, "")));

// 2) 静态路由(app 目录里的固定页)
const staticRoutes = new Set();
function walkApp(dir, base = "") {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("[") || e.name.startsWith("(") || e.name === "api") continue;
    const route = base + "/" + e.name;
    try { if (readdirSync(join(dir, e.name)).some(f => /^page\.(tsx|ts|jsx|js|mdx)$/.test(f))) staticRoutes.add(route); } catch {}
    walkApp(join(dir, e.name), route);
  }
}
walkApp("app");
staticRoutes.add("/");

const exists = (p) => {
  const path = p.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  if (blogSlugs.has(path) || staticRoutes.has(path)) return true;
  // 动态前缀(/q /tools /cluster /category /tag /docs)——这些有数据兜底,先视为可能存在(只查blog/静态确定坏的)
  if (/^\/(q|tools|cluster|category|tag|docs|en)(\/|$)/.test(path)) return true;
  return false;
};

// 3) 扫 mdx 内链
const broken = [];
const linkRe = /\]\((\/[^)\s]+)\)|href=["'](\/[^"'\s]+)["']/g;
for (const f of readdirSync("content/blog").filter(f => f.endsWith(".mdx"))) {
  const raw = readFileSync(join("content/blog", f), "utf8");
  let m;
  while ((m = linkRe.exec(raw))) {
    const link = (m[1] || m[2]);
    if (!link.startsWith("/")) continue;
    if (/^\/(blog)\//.test(link) && !exists(link)) broken.push({ from: f, to: link });
  }
}

console.log("存在的 blog 页:", blogSlugs.size, " 静态路由:", staticRoutes.size);
console.log("坏内链(指向不存在的 /blog 页):", broken.length);
const byTo = {};
for (const b of broken) (byTo[b.to] ??= []).push(b.from);
for (const [to, froms] of Object.entries(byTo).sort((a,b)=>b[1].length-a[1].length))
  console.log(`  ✗ ${to}  ← 被 ${froms.length} 处引用 (例: ${froms[0]})`);
