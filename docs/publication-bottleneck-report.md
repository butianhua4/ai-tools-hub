# Publication Bottleneck Report

Generated at: 2026-06-16T07:01:47.986Z

This report is read-only. It explains why public article growth is gated and what to review next.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Publish confirm commands included: 0
- Traffic claim: not-included
- Note: Read-only publication bottleneck report. It explains why public article growth is gated and what humans should review next.

## Summary

- approvalBacklogItems: 3
- contentIntegrityBlockingItems: 0
- contentIntegrityWarningItems: 77
- currentPublishableNow: 0
- immediateApprovalItems: 3
- immediateApprovalReadyItems: 3
- nextBatchActionItems: 33
- nextBatchWarningItems: 3
- publicArticles: 500
- publicMojibakeWarningItems: 51
- publicRefreshActionItems: 5070
- publishConfirmCommandsIncluded: 0
- reviewPreflightFailed: 0
- reviewPreflightMojibakeWarningItems: 0
- reviewPreflightPassed: 3
- reviewPreflightWarningItems: 0
- statusCounts: {"published":500,"archived":21,"draft":148}
- trafficDataAvailable: false
- unsafeItems: 0

## Bottlenecks

- No article is publishable without explicit human approval.
- 3 draft article(s) are ready for human approval before mark:review.
- 3 next-batch route item(s) still need SEO/query/freshness remediation review.
- 9 public article(s) need garbled-copy refresh before traffic work is credible.
- Traffic data is unavailable, so traffic claims remain blocked.

## Next Human Approval

| Priority | Gate | Reason | Title | File |
| ---: | --- | --- | --- | --- |
| 446 | explicit human approval required | Immediate Wave 1; projected public count after human approval is 503. | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| 439 | explicit human approval required | Immediate Wave 1; projected public count after human approval is 503. | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |
| 415 | explicit human approval required | Immediate Wave 1; projected public count after human approval is 503. | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx |

## Immediate Approval Queue

| Priority | Unsafe reasons | Title | File |
| ---: | --- | --- | --- |
| 446 | none | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| 439 | none | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |
| 415 | none | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx |

## Next Batch Warnings

| Priority | Actions | Warnings | Title | File |
| ---: | ---: | --- | --- | --- |
| 511 | 14 | search query match warning exists | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |
| 488 | 9 | no copydesk optimization brief matched<br>no freshness brief matched<br>search query match warning exists | Together AI API 怎么接入：开源模型接口、embedding 和部署边界 | content/blog/together-ai-api-beginner-guide.mdx |
| 479 | 10 | not yet matched in human approval clearance pack<br>no copydesk optimization brief matched<br>no freshness brief matched<br>search query match warning exists | Vercel AI SDK 聊天机器人怎么部署：Next.js 流式输出和上线检查 | content/blog/vercel-ai-sdk-chatbot-deploy-guide.mdx |

## Public Refresh Warnings

| Priority | Actions | Reasons | Title | File |
| ---: | ---: | --- | --- | --- |
| 240 | 13 | mojibake-public<br>seo-warning<br>short-description<br>freshness-high<br>high-priority | 第一个 Upwork 小项目怎么报价：新手范围和底价检查 | content/blog/first-upwork-project-pricing-checklist.mdx |
| 230 | 12 | mojibake-public<br>seo-warning<br>freshness-high<br>high-priority | Codex 和 GitHub 怎么配合：提交代码前检查 | content/blog/codex-github-before-commit-checklist.mdx |
| 230 | 12 | mojibake-public<br>seo-warning<br>freshness-high<br>high-priority | Codex 部署 Vercel 前检查什么：上线前清单 | content/blog/codex-vercel-deploy-preflight-checklist.mdx |
| 230 | 12 | mojibake-public<br>seo-warning<br>freshness-high<br>high-priority | Codex 和 Claude Code 怎么选：新手对比清单 | content/blog/codex-vs-claude-code-beginner-checklist.mdx |
| 210 | 13 | mojibake-public<br>short-description<br>freshness-high | Codex 怎么做第一个网页 | content/blog/build-first-webpage-with-codex.mdx |
