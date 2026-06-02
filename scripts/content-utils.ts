import fs from "fs";
import path from "path";
import matter from "gray-matter";
import fg from "fast-glob";

export function parseArgs() {
  const args: Record<string, string | boolean> = {};

  for (const rawArg of process.argv.slice(2)) {
    const normalized = rawArg
      .trim()
      .replace(/^[\u2013\u2014]{1,2}/, "--")
      .replace(/^-\s*-/, "--");

    if (!normalized.startsWith("--") || normalized === "--") continue;

    const [key, ...valueParts] = normalized.slice(2).split("=");
    const value = valueParts.join("=");
    args[key] = value === "" ? true : stripWrappingQuotes(value || "true");
  }

  return args;
}

export async function articleFiles() {
  return fg(["content/blog/*.{md,mdx}"], {
    cwd: process.cwd(),
    absolute: true,
  });
}

export function readArticle(file: string) {
  const absoluteFile = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  const raw = fs.readFileSync(absoluteFile, "utf8");
  const parsed = matter(raw);

  return {
    raw,
    data: parsed.data as Record<string, any>,
    content: parsed.content,
    file: absoluteFile,
  };
}

export function writeArticle(file: string, data: Record<string, any>, content: string) {
  fs.writeFileSync(file, matter.stringify(`${content.trim()}\n`, data), "utf8");
}

export function rel(file: string) {
  return path.relative(process.cwd(), file).replace(/\\/g, "/");
}

export function chineseCount(text: string) {
  return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
}

function stripWrappingQuotes(value: string) {
  return value.replace(/^["'“”‘’](.*)["'“”‘’]$/, "$1");
}
