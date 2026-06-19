import { NextResponse, type NextRequest } from "next/server";

const canonicalHost = "ai.aporet.com";
const legacyHosts = new Set(["ai-jiedan-lab.vercel.app"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (!host || !legacyHosts.has(host)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = canonicalHost;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
