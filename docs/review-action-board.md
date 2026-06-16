# Review Action Board

Generated at: 2026-06-16T07:01:26.238Z

This board is read-only. It turns review automation reports into a prioritized human task queue.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Stop before: Every mark:review command requires explicit human approval. publish --confirm commands are intentionally not included.
- Note: Read-only review action board. It prioritizes human review tasks and does not edit articles, mark review, or publish.

## Summary

- publicGapReadyTasks: 0
- publicGapTasks: 8
- readyTasks: 2
- tasks: 11
- unsafeTasks: 9
- waveReadyTasks: 2
- waveTasks: 3

## Boundaries

- Public published: 500
- Publishable now: 0
- Traffic data available: false
- Can claim traffic: false
- Source files without reachable source: 0
- Missing URL targets: 0

## Unsafe Tasks

| Ready | Priority | Kind | Scope | Sources | Warnings | Blockers | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| false | 987 | wave-approval | wave-3 | 7 | 0 | missing publish readiness pack item | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx |
| false | 800 | public-gap-review | public-gap-wave-1 | 20 | 1 | public gap item is not ready for manual review<br>public gap decision is blocked | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| false | 795 | public-gap-review | public-gap-wave-1 | 16 | 1 | public gap item is not ready for manual review<br>public gap decision is blocked | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| false | 779 | public-gap-review | public-gap-wave-2 | 22 | 5 | public gap item is not ready for manual review<br>public gap decision is blocked | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| false | 764 | public-gap-review | public-gap-wave-2 | 6 | 3 | public gap item is not ready for manual review<br>public gap decision is blocked | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| false | 750 | public-gap-review | public-gap-wave-3 | 16 | 0 | public gap item is not ready for manual review<br>public gap decision is blocked | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| false | 741 | public-gap-review | public-gap-wave-3 | 6 | 3 | public gap item is not ready for manual review<br>public gap decision is blocked | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| false | 738 | public-gap-review | public-gap-wave-4 | 24 | 2 | public gap item is not ready for manual review<br>public gap decision is blocked | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| false | 719 | public-gap-review | public-gap-wave-4 | 6 | 4 | public gap item is not ready for manual review<br>public gap decision is blocked | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## Next Tasks

| Ready | Priority | Kind | Scope | Sources | Warnings | Blockers | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| true | 1010 | wave-approval | wave-1 | 10 | 0 | none | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| true | 1002 | wave-approval | wave-2 | 12 | 1 | none | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |

## All Tasks

| Ready | Priority | Kind | Scope | Sources | Warnings | Blockers | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| true | 1010 | wave-approval | wave-1 | 10 | 0 | none | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx |
| true | 1002 | wave-approval | wave-2 | 12 | 1 | none | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx |
| false | 987 | wave-approval | wave-3 | 7 | 0 | missing publish readiness pack item | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx |
| false | 800 | public-gap-review | public-gap-wave-1 | 20 | 1 | public gap item is not ready for manual review<br>public gap decision is blocked | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| false | 795 | public-gap-review | public-gap-wave-1 | 16 | 1 | public gap item is not ready for manual review<br>public gap decision is blocked | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| false | 779 | public-gap-review | public-gap-wave-2 | 22 | 5 | public gap item is not ready for manual review<br>public gap decision is blocked | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| false | 764 | public-gap-review | public-gap-wave-2 | 6 | 3 | public gap item is not ready for manual review<br>public gap decision is blocked | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| false | 750 | public-gap-review | public-gap-wave-3 | 16 | 0 | public gap item is not ready for manual review<br>public gap decision is blocked | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| false | 741 | public-gap-review | public-gap-wave-3 | 6 | 3 | public gap item is not ready for manual review<br>public gap decision is blocked | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| false | 738 | public-gap-review | public-gap-wave-4 | 24 | 2 | public gap item is not ready for manual review<br>public gap decision is blocked | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| false | 719 | public-gap-review | public-gap-wave-4 | 6 | 4 | public gap item is not ready for manual review<br>public gap decision is blocked | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## Per-Task Actions

### RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界

- File: content/blog/vector-database-selection-for-rag-guide.mdx
- Kind: wave-approval
- Scope: wave-1
- Ready: true
- Priority: 1010

Action items:

- Read the article end to end and confirm the opening answer matches search intent.
- Open 2 official source target(s) and verify fast-changing claims.
- Run through 8 risk review checks.
- Choose or reject public internal link suggestion: Qdrant 向量数据库怎么用：RAG 新手先看集合、向量和过滤 (/blog/qdrant-vector-database-beginner-guide).
- Confirm snippet and structured-data checks remain clean.

Warnings:

- none

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/vector-database-selection-for-rag-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/vector-database-selection-for-rag-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级

- File: content/blog/vercel-ai-gateway-multi-provider-guide.mdx
- Kind: wave-approval
- Scope: wave-2
- Ready: true
- Priority: 1002

Action items:

- Read the article end to end and confirm the opening answer matches search intent.
- Open 5 official source target(s) and verify fast-changing claims.
- Run through 7 risk review checks.
- Choose or reject public internal link suggestion: 多模型 Router 怎么做降级：主模型、备用模型、成本和质量评估 (/blog/multi-model-router-fallback-guide).
- Resolve or explicitly accept snippet/structured-data warnings before mark:review.

Warnings:

- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/vercel-ai-gateway-multi-provider-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/vercel-ai-gateway-multi-provider-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索

- File: content/blog/supabase-pgvector-rag-guide.mdx
- Kind: wave-approval
- Scope: wave-3
- Ready: false
- Priority: 987

Action items:

- Read the article end to end and confirm the opening answer matches search intent.
- Open 7 official source target(s) and verify fast-changing claims.
- Run through 5 risk review checks.
- Confirm public internal link plan before publishing.
- Confirm snippet and structured-data checks remain clean.

Warnings:

- none

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/supabase-pgvector-rag-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/supabase-pgvector-rag-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查

- File: content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-1
- Ready: false
- Priority: 800

Action items:

- Review theme gap: 开源大模型部署：Ollama、vLLM、TGI、RunPod.
- Verify 10 source target(s) and source freshness.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Choose or reject public internal link suggestion: 本地部署大模型显存不够怎么办：量化、上下文、并发和换模型 (/blog/local-llm-vram-not-enough-guide).

Warnings:

- no exact search-seed phrase appears in title, description, or body

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查

- File: content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-1
- Ready: false
- Priority: 795

Action items:

- Review theme gap: Agent 部署、工具调用和生产安全.
- Verify 8 source target(s) and source freshness.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Choose or reject public internal link suggestion: Codex 修改现有网页 UI 使用前怎么判断是否适合 (/blog/codex-edit-existing-ui-freelance-scope).

Warnings:

- no exact search-seed phrase appears in title, description, or body

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检

- File: content/blog/ai-model-selection-customer-service-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-2
- Ready: false
- Priority: 779

Action items:

- Review theme gap: RAG、知识库、向量数据库和引用溯源.
- Verify 11 source target(s) and source freshness.
- Tighten the meta description so it states the search intent, audience, and outcome clearly.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Choose or reject public internal link suggestion: n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 (/blog/n8n-ai-agent-rag-memory-guide).

Warnings:

- description may be thin for search snippets
- primary keyword is not an exact title substring
- no exact search-seed phrase appears in title, description, or body
- description may be thin for search snippets
- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/ai-model-selection-customer-service-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/ai-model-selection-customer-service-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储

- File: content/blog/n8n-ai-agent-rag-memory-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-2
- Ready: false
- Priority: 764

Action items:

- Review theme gap: Agent 记忆：短期记忆、长期记忆、RAG、Postgres.
- Verify 3 source target(s) and source freshness.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Choose or reject public internal link suggestion: AI Agent 记忆和 RAG 怎么设计：短期记忆、长期记忆、引用来源和隐私边界 (/blog/ai-agent-memory-rag-design-guide).

Warnings:

- primary keyword is not an exact title substring
- no exact search-seed phrase appears in title, description, or body
- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/n8n-ai-agent-rag-memory-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/n8n-ai-agent-rag-memory-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用

- File: content/blog/industry-ai-prompts-template-library-2026.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-3
- Ready: false
- Priority: 750

Action items:

- Review theme gap: 全行业 AI 提示词和工作流模板.
- Verify 8 source target(s) and source freshness.
- Resolve all blocking issues before any review or publishing command.
- Choose or reject public internal link suggestion: 销售 AI 提示词模板：客户画像、跟进话术、异议处理和会议纪要 (/blog/sales-ai-prompts-guide).

Warnings:

- none

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/industry-ai-prompts-template-library-2026.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/industry-ai-prompts-template-library-2026.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单

- File: content/blog/mcp-server-deployment-security-checklist.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-3
- Ready: false
- Priority: 741

Action items:

- Review theme gap: Dify、n8n、Coze、Flowise、MCP 自动化部署.
- Verify 3 source target(s) and source freshness.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Choose or reject public internal link suggestion: Agent 人工审核流程怎么设计：什么时候自动，什么时候必须人确认 (/blog/agent-human-review-loop-guide).

Warnings:

- primary keyword is not an exact title substring
- no exact search-seed phrase appears in title, description, or body
- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/mcp-server-deployment-security-checklist.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/mcp-server-deployment-security-checklist.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急

- File: content/blog/ai-api-key-security-rotation-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-4
- Ready: false
- Priority: 738

Action items:

- Review theme gap: AI API 接入、限流、成本和多模型路由.
- Verify 12 source target(s) and source freshness.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- Choose or reject public internal link suggestion: Dify 工作流怎么做错误处理：变量、分支、重试和人工兜底 (/blog/dify-workflow-error-handling-guide).

Warnings:

- primary keyword is not an exact title substring
- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/ai-api-key-security-rotation-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/ai-api-key-security-rotation-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

### Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志

- File: content/blog/agent-tool-permission-safety-guide.mdx
- Kind: public-gap-review
- Scope: public-gap-wave-4
- Ready: false
- Priority: 719

Action items:

- Review theme gap: LLM 观测、评测、日志和上线后质量.
- Verify 3 source target(s) and source freshness.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Add or approve one concrete subsection that matches the target search intent without keyword stuffing.
- Choose or reject public internal link suggestion: MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 (/blog/mcp-server-deployment-security-checklist).

Warnings:

- primary keyword is not an exact title substring
- no exact search-seed phrase appears in title, description, or body
- few search-seed token families appear in article text
- primary keyword is not an exact title substring

Command boundary:

- Mark review after human approval: `npm run mark:review -- --file=content/blog/agent-tool-permission-safety-guide.mdx --confirm-human`
- Publish dry-run after review: `npm run publish:articles -- --file=content/blog/agent-tool-permission-safety-guide.mdx`
- Publish confirm: not-included
- Stop before: Do not run mark:review until explicit human approval; do not publish without a separate explicit approval.

