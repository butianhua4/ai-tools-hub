# Autonomous SEO Operating Loop

Generated for the AI Tools Guide / SEO Growth Engine project.

This document defines the default operating loop for Codex work on `https://ai.aporet.com`.
It is intentionally evidence-first: do not claim traffic, indexing, ranking, or revenue unless the relevant platform data confirms it.

## Operating Principle

Every work cycle follows this sequence:

1. Measure the real system.
2. Classify the bottleneck.
3. Apply the smallest useful fix.
4. Verify production.
5. Push or submit the right surfaces.
6. Record the next queue.

No cycle should stop after analysis if there is a safe next action available.

## Cycle A: Hourly SEO Health Loop

Run or inspect:

```bash
npm run seo:autopilot-loop -- --url=https://ai.aporet.com
npm run live:check -- --url=https://ai.aporet.com
npm run deploy:freshness -- --url=https://ai.aporet.com
npm run searchability:check
npm run seo:check
```

Decision rules:

- If production pages, sitemap, robots, canonicals, or public article availability fail, fix code first.
- If live checks pass but GSC/Bing are delayed, keep submitting priority URLs and do not rewrite the site.
- If warnings are only report-only, record them and continue to the next growth task.

## Cycle B: Daily Indexing Push Loop

Run:

```bash
npm run search-console:indexing-priority
npm run seo:growth-daily-ops
npm run indexnow:readiness
```

Platform actions:

- Google Search Console: submit `https://ai.aporet.com/sitemap.xml`, then request indexing for the top priority URLs from `docs/gsc-url-inspection-today.txt`.
- Bing Webmaster Tools: submit `https://ai.aporet.com/sitemap.xml`, then use URL Submission for the highest-priority q and cluster pages.
- IndexNow: keep the generated 500 URL readiness list fresh for Bing-compatible discovery.

Priority order:

1. `/en`
2. `/cluster/*`
3. High-intent `/q/*` pages
4. Supporting `/blog/*` pages

## Cycle C: Growth Quality Loop

Run:

```bash
npm run seo:improvement-priority
npm run content:internal-links
npm run seo:snippets
npm run seo:schema
```

Decision rules:

- Fix public blocking issues immediately.
- Fix snippet warnings before generating more content.
- Keep orphan pages at `0`.
- Keep weak pages at `0`.
- Keep internal link health at `100`.
- Draft-only mojibake or metadata damage is queued for repair before publication, not treated as a live SEO outage.

## Cycle D: Platform Monitoring Loop

Check these platforms in order:

1. Google Search Console: indexed pages, impressions, clicks, queries, coverage reasons.
2. Bing Webmaster Tools: sitemap status, URL submission status, IndexNow, keyword research.
3. Google Analytics 4: active users, landing pages, engagement, events.
4. Microsoft Clarity: recordings, heatmaps, rage clicks, dead clicks, scroll depth.
5. Ahrefs Webmaster Tools: site audit, broken links, redirects, indexability, backlinks.
6. Cloudflare Web Analytics: lightweight visit confirmation and geography.
7. Vercel/GitHub Actions: deployment freshness and automation failures.

Decision rules:

- Search Console/Bing answer discovery and indexing.
- GA4/Clarity answer user behavior after entry.
- Ahrefs answers technical SEO and external authority.
- Vercel/GitHub answer deployment and automation reliability.

## Cycle E: Content Growth Loop

Do not create bulk pages unless the structure is healthy.

When structure is healthy, prioritize high-search-intent problem pages:

- Codex installation and runtime errors
- Vercel deployment failures
- GitHub Actions failures
- API key, quota, and rate limit errors
- Agent deployment and tool-calling issues
- RAG memory, vector database, and retrieval failures
- Node.js, npm, dependency, and build errors

Avoid generic AI tool introductions unless they support a specific query cluster.

## Stop Conditions

Only stop for user input when:

- A platform requires an SMS, email, payment, identity, or ownership verification that Codex cannot complete safely.
- A destructive DNS/domain action is required.
- A third-party platform blocks automation with a captcha or policy prompt.
- A business decision is required, such as buying a paid plan or changing the primary domain.

Everything else should continue through the next measurable cycle.

## Current Baseline

Latest verified baseline:

- Growth stage: warming
- Total SEO content pages: 1006
- Q pages: 500
- Blog pages: 500
- Cluster pages: 6
- Orphan pages: 0
- Weak pages: 0
- Internal link health: 100
- Growth readiness score: 100
- Live production search surface: PASS
- Sitemap index: PASS
- Robots: PASS
- Draft leakage: none

