const INDEXNOW_KEY = "4d7b5e9c9f2a4c7c8e7d2a6b3c1f0a9e";

export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
