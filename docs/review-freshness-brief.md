# Review Freshness Brief

Generated at: 2026-06-16T07:01:30.569Z

This report is read-only. It converts freshness risk into human fact-check tasks for current review candidates.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Stop before: Do not mark review until a human confirms fast-changing claims against official sources. Publishing still requires separate explicit approval.
- Note: Read-only freshness brief for current review candidates. It turns freshness risk into human fact-check tasks and does not verify or rewrite facts automatically.

## Source Evidence

- Action board ready tasks: 2
- Unique action files: 2
- Content freshness generated at: 2026-06-16T07:01:30.091Z
- Source health summary: {"checkedUrls":38,"broadFirstCoverageFiles":8,"currentReviewFiles":3,"failedUrls":1,"filesCovered":24,"filesWithReachableSource":24,"filesWithoutReachableSource":0,"missingUrlTargets":0,"nextSourcePackFiles":15,"okUrls":37,"publicGapDecisionFiles":8,"redirectedUrls":17,"sourceReferences":202,"uniqueUrls":38}

## Summary

- blockedItems: 0
- highRiskItems: 2
- items: 2
- itemsWithOfficialSources: 2
- itemsWithReachableSources: 2
- readyItems: 2
- unsafeCommands: 0

## Blocked Items

- none

## High Risk Items

| Ready | Risk | Updated | Sources | Checks | Scope | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- |
| true | high | 2026-06-12 | 10/10 | 12 | action-board, current-review | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| true | high | 2026-06-06 | 12/12 | 12 | action-board, current-review | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |

## All Items

| Ready | Risk | Updated | Sources | Checks | Scope | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- |
| true | high | 2026-06-12 | 10/10 | 12 | action-board, current-review | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| true | high | 2026-06-06 | 12/12 | 12 | action-board, current-review | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |

## Per-Candidate Freshness Checklist

### RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界

- File: content/blog/vector-database-selection-for-rag-guide.mdx
- Freshness risk: high
- Updated at: 2026-06-12
- Reachable sources: 10/10

Risk reasons:

- fast-changing technical term: agent
- fast-changing technical term: rag
- fast-changing technical term: 部署
- fast-changing technical term: 模型
- fast-changing technical term: 知识库
- review-sensitive term: 提示词
- review-sensitive term: 工具
- review-sensitive term: 客服

Official source targets:

- OpenAI retrieval docs: https://platform.openai.com/docs/guides/retrieval
- OpenAI prompt engineering guide: https://platform.openai.com/docs/guides/prompt-engineering
- https://platform.openai.com/docs/guides/retrieval
- https://platform.openai.com/docs/guides/prompt-engineering
- https://python.langchain.com/docs
- https://docs.llamaindex.ai
- https://huggingface.co/docs
- https://platform.openai.com/docs
- https://platform.openai.com/docs/guides/agents
- https://ai-sdk.dev/docs

Freshness checks:

- RAG 向量数据库怎么选 官方文档 最新
- RAG 向量数据库怎么选 official docs latest
- RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 事实核对
- AI 基建 平台限制 官方文档
- Confirm current official guidance for agent.
- Confirm current official guidance for rag.
- Confirm current official guidance for 部署.
- Confirm current official guidance for 模型.
- Confirm current official guidance for 知识库.
- Confirm current official guidance for 提示词.
- Confirm current official guidance for 工具.
- Confirm current official guidance for 客服.

Human review checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Open official source targets and verify current product names, APIs, limits, pricing-sensitive wording, and workflow boundaries.
- Rewrite or remove any unsupported claim before mark:review.
- Confirm no traffic, ranking, revenue, client acquisition, or guaranteed result claim was introduced.
- Only after human approval, run mark:review manually; publishing still requires separate explicit approval.

### Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级

- File: content/blog/vercel-ai-gateway-multi-provider-guide.mdx
- Freshness risk: high
- Updated at: 2026-06-06
- Reachable sources: 12/12

Risk reasons:

- fast-changing technical term: api
- fast-changing technical term: agent
- fast-changing technical term: claude
- fast-changing technical term: gemini
- fast-changing technical term: openai
- fast-changing technical term: vercel
- fast-changing technical term: 部署
- fast-changing technical term: 大模型
- review-sensitive term: 提示词
- review-sensitive term: 工具
- review-sensitive term: 客服

Official source targets:

- OpenAI docs: https://platform.openai.com/docs
- Vercel AI SDK docs: https://ai-sdk.dev/docs
- Anthropic docs: https://docs.anthropic.com
- Google AI docs: https://ai.google.dev/docs
- OpenAI prompt engineering guide: https://platform.openai.com/docs/guides/prompt-engineering
- https://platform.openai.com/docs
- https://ai-sdk.dev/docs
- https://docs.anthropic.com
- https://ai.google.dev/docs
- https://platform.openai.com/docs/guides/prompt-engineering
- https://platform.openai.com/docs/guides/agents
- https://platform.openai.com/docs/guides/retrieval

Freshness checks:

- Vercel AI Gateway 多模型 官方文档 最新
- Vercel AI Gateway 多模型 official docs latest
- Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 事实核对
- AI 部署 平台限制 官方文档
- Confirm current official guidance for api.
- Confirm current official guidance for agent.
- Confirm current official guidance for claude.
- Confirm current official guidance for gemini.
- Confirm current official guidance for openai.
- Confirm current official guidance for vercel.
- Confirm current official guidance for 部署.
- Confirm current official guidance for 大模型.

Human review checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Open official source targets and verify current product names, APIs, limits, pricing-sensitive wording, and workflow boundaries.
- Rewrite or remove any unsupported claim before mark:review.
- Confirm no traffic, ranking, revenue, client acquisition, or guaranteed result claim was introduced.
- Only after human approval, run mark:review manually; publishing still requires separate explicit approval.

