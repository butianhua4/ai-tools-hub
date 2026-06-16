# Human Approval Clearance Pack

Generated at: 2026-06-16T07:01:45.068Z

This report is read-only. It consolidates the source, SEO, copydesk, and link checks needed before a human reviewer approves any mark:review action.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Stop before: Stop before source edits, metadata edits, mark:review, and publish. Every change requires human approval.
- Traffic claim: not-included
- Note: Read-only human approval clearance pack. It consolidates source, SEO, copydesk, and link issues before a human reviewer decides whether to run mark:review.

## Publishing Boundary

- Current public published: 500
- Current publishable now: 0
- Projected public after immediate human approval: 503
- Publish confirm commands included: 0

## Summary

- approvalItems: 6
- backlogItems: 3
- clearanceActions: 40
- copydeskBriefItems: 2
- failedSourceDecisionItems: 0
- immediateItems: 3
- itemsReadyForClearanceReview: 6
- massSearchThemeItems: 5
- popularPromptLaneItems: 4
- publishConfirmCommandsIncluded: 0
- seoWarningItems: 1
- sourceDecisionItems: 0
- trafficDataAvailable: false
- unsafeItems: 0

## Unsafe Items

- none

## Clearance Items

| Immediate | Ready | Priority | Source decisions | Failed source | SEO | Copydesk | Popular lanes | Mass themes | Title | File |
| --- | --- | ---: | ---: | --- | --- | --- | ---: | ---: | --- | --- |
| true | true | 446 | 0 | false | false | true | 0 | 1 | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| true | true | 439 | 0 | false | true | true | 2 | 1 | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |
| true | true | 415 | 0 | false | false | false | 0 | 1 | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx |
| false | true | 50 | 0 | false | false | false | 2 | 1 | Together AI API 怎么接入：开源模型接口、embedding 和部署边界 | content/blog/together-ai-api-beginner-guide.mdx |
| false | true | 54 | 0 | false | false | false | 1 | 2 | TensorRT-LLM 怎么入门：NVIDIA GPU 推理优化先看模型和验收 | content/blog/tensorrt-llm-beginner-guide.mdx |
| false | true | 38 | 0 | false | false | false | 1 | 0 | Vercel build failed 排查清单：从日志到重新部署 | content/blog/vercel-build-failed-causes-checklist.mdx |

## Item Actions

### RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界

- File: content/blog/vector-database-selection-for-rag-guide.mdx
- Immediate: true
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: false
- Copydesk brief: true
- Popular prompt lanes: 0
- Mass search themes: 1

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- Review public internal link suggestion: Qdrant 向量数据库怎么用：RAG 新手先看集合、向量和过滤 (/blog/qdrant-vector-database-beginner-guide).
- Review proposed meta description from copydesk brief before approval.
- Check that mass-search theme framing is covered without stuffing keywords.
- Run mark:review only after explicit human approval; publish confirm remains excluded.

### Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级

- File: content/blog/vercel-ai-gateway-multi-provider-guide.mdx
- Immediate: true
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: true
- Copydesk brief: true
- Popular prompt lanes: 2
- Mass search themes: 1

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- SEO: Check whether the title can naturally include the exact primary keyword: Vercel AI Gateway 多模型.
- SEO: If exact-match wording makes the title stiff or misleading, explicitly accept the warning and keep the more natural title.
- SEO: Confirm the H1/title/description still answer the same search intent after any metadata change.
- Review public internal link suggestion: 多模型 Router 怎么做降级：主模型、备用模型、成本和质量评估 (/blog/multi-model-router-fallback-guide).
- Review proposed meta description from copydesk brief before approval.
- Check that popular prompt lane framing stays broad enough for real search demand.
- Check that mass-search theme framing is covered without stuffing keywords.
- Run mark:review only after explicit human approval; publish confirm remains excluded.

### Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索

- File: content/blog/supabase-pgvector-rag-guide.mdx
- Immediate: true
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: false
- Copydesk brief: false
- Popular prompt lanes: 0
- Mass search themes: 1

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- Check that mass-search theme framing is covered without stuffing keywords.
- Run mark:review only after explicit human approval; publish confirm remains excluded.

### Together AI API 怎么接入：开源模型接口、embedding 和部署边界

- File: content/blog/together-ai-api-beginner-guide.mdx
- Immediate: false
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: false
- Copydesk brief: false
- Popular prompt lanes: 2
- Mass search themes: 1

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- Check that popular prompt lane framing stays broad enough for real search demand.
- Check that mass-search theme framing is covered without stuffing keywords.
- Run mark:review only after explicit human approval; publish confirm remains excluded.

### TensorRT-LLM 怎么入门：NVIDIA GPU 推理优化先看模型和验收

- File: content/blog/tensorrt-llm-beginner-guide.mdx
- Immediate: false
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: false
- Copydesk brief: false
- Popular prompt lanes: 1
- Mass search themes: 2

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- Check that popular prompt lane framing stays broad enough for real search demand.
- Check that mass-search theme framing is covered without stuffing keywords.
- Run mark:review only after explicit human approval; publish confirm remains excluded.

### Vercel build failed 排查清单：从日志到重新部署

- File: content/blog/vercel-build-failed-causes-checklist.mdx
- Immediate: false
- Ready for clearance review: true
- Source decisions: 0
- Failed source decision: false
- SEO warning: false
- Copydesk brief: false
- Popular prompt lanes: 1
- Mass search themes: 0

- Confirm the draft still answers one clear search intent.
- Verify source-backed claims before any status change.
- Keep status=draft, noindex=true, and humanReviewRequired=true until approval.
- Check that popular prompt lane framing stays broad enough for real search demand.
- Run mark:review only after explicit human approval; publish confirm remains excluded.
