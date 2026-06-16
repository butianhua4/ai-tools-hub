# Public Coverage Gap Decision Pack

Generated at: 2026-06-16T07:01:22.553Z

This report is read-only. It turns public coverage gap preflight warnings into human review decisions and explicit command boundaries.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Stop before: Only use these commands after explicit human approval. Never run mark:review --confirm-human or publish:articles --confirm automatically.
- Note: Read-only human decision pack for public coverage gap candidates. It does not edit article content, metadata, status, noindex, review state, or publishing state.

## Source Evidence

- Preflight generated at: 2026-06-16T07:01:22.084Z
- Traffic note: Search seeds and link suggestions are editorial signals, not measured rankings, impressions, clicks, traffic, or income.
- Preflight summary: {"blockingItems":8,"broadFirstCoverageItems":8,"broadFirstCoveragePreflightItems":8,"items":8,"planItems":0,"planReadyItems":0,"planUnsafeItems":0,"planWaves":0,"readyItems":0,"structuredDataReadyItems":8,"uniqueFiles":8,"warningItems":7,"withPublicLinkSuggestions":8,"withSeedMatches":7}

## Summary

- blockingItems: 8
- items: 8
- itemsWithCommandBoundary: 8
- itemsWithHumanChecklist: 8
- itemsWithPublicLinkSuggestion: 8
- itemsWithSourceTargets: 8
- itemsWithWarningRemediation: 8
- optimizationActions: 14
- readyItems: 0
- reviewReadyWithOptimizations: 0
- unsafeItems: 8
- waves: 4

## Wave Decisions

| Wave | Ready | Blocking | Optimization actions | Themes | Files |
| --- | --- | --- | --- | --- | --- |
| 1 | 0/2 | 2 | 2 | 开源大模型部署：Ollama、vLLM、TGI、RunPod<br>Agent 部署、工具调用和生产安全 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx<br>content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | 0/2 | 2 | 5 | Agent 记忆：短期记忆、长期记忆、RAG、Postgres<br>RAG、知识库、向量数据库和引用溯源 | content/blog/n8n-ai-agent-rag-memory-guide.mdx<br>content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | 0/2 | 2 | 3 | 全行业 AI 提示词和工作流模板<br>Dify、n8n、Coze、Flowise、MCP 自动化部署 | content/blog/industry-ai-prompts-template-library-2026.mdx<br>content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | 0/2 | 2 | 4 | AI API 接入、限流、成本和多模型路由<br>LLM 观测、评测、日志和上线后质量 | content/blog/ai-api-key-security-rotation-guide.mdx<br>content/blog/agent-tool-permission-safety-guide.mdx |

## Blocking Items

| Wave | Decision | Risk | Sources | Seeds | Link suggestion | Actions | Theme | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | blocked | high | 10 | 0/5 | /blog/local-llm-vram-not-enough-guide | 1 | 开源大模型部署：Ollama、vLLM、TGI、RunPod | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| 1 | blocked | high | 8 | 0/5 | /blog/codex-edit-existing-ui-freelance-scope | 1 | Agent 部署、工具调用和生产安全 | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | blocked | high | 3 | 0/5 | /blog/ai-agent-memory-rag-design-guide | 2 | Agent 记忆：短期记忆、长期记忆、RAG、Postgres | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| 2 | blocked | high | 11 | 0/5 | /blog/n8n-ai-agent-rag-memory-guide | 3 | RAG、知识库、向量数据库和引用溯源 | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | blocked | high | 8 | 1/6 | /blog/sales-ai-prompts-guide | 1 | 全行业 AI 提示词和工作流模板 | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| 3 | blocked | high | 3 | 0/5 | /blog/agent-human-review-loop-guide | 2 | Dify、n8n、Coze、Flowise、MCP 自动化部署 | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | blocked | high | 12 | 1/5 | /blog/dify-workflow-error-handling-guide | 1 | AI API 接入、限流、成本和多模型路由 | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| 4 | blocked | high | 3 | 0/1 | /blog/mcp-server-deployment-security-checklist | 3 | LLM 观测、评测、日志和上线后质量 | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## All Decision Items

| Wave | Decision | Risk | Sources | Seeds | Link suggestion | Actions | Theme | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | blocked | high | 10 | 0/5 | /blog/local-llm-vram-not-enough-guide | 1 | 开源大模型部署：Ollama、vLLM、TGI、RunPod | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| 1 | blocked | high | 8 | 0/5 | /blog/codex-edit-existing-ui-freelance-scope | 1 | Agent 部署、工具调用和生产安全 | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | blocked | high | 3 | 0/5 | /blog/ai-agent-memory-rag-design-guide | 2 | Agent 记忆：短期记忆、长期记忆、RAG、Postgres | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| 2 | blocked | high | 11 | 0/5 | /blog/n8n-ai-agent-rag-memory-guide | 3 | RAG、知识库、向量数据库和引用溯源 | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | blocked | high | 8 | 1/6 | /blog/sales-ai-prompts-guide | 1 | 全行业 AI 提示词和工作流模板 | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| 3 | blocked | high | 3 | 0/5 | /blog/agent-human-review-loop-guide | 2 | Dify、n8n、Coze、Flowise、MCP 自动化部署 | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | blocked | high | 12 | 1/5 | /blog/dify-workflow-error-handling-guide | 1 | AI API 接入、限流、成本和多模型路由 | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| 4 | blocked | high | 3 | 0/1 | /blog/mcp-server-deployment-security-checklist | 3 | LLM 观测、评测、日志和上线后质量 | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## Per-Item Review Packets

### 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查

- File: content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx
- Theme: 开源大模型部署：Ollama、vLLM、TGI、RunPod
- Wave: 1
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: 本地部署大模型显存不够怎么办：量化、上下文、并发和换模型 (/blog/local-llm-vram-not-enough-guide)

Review focus:

- 核对部署命令、模型名称、GPU/显存要求、API 路径和版本差异
- 不要承诺本地部署一定更省钱或更稳定
- 必须包含 smoke check、回滚、日志、限流和成本边界

Source targets:

- https://platform.openai.com/docs
- https://platform.openai.com/docs/guides/prompt-engineering
- https://ai-sdk.dev/docs
- https://platform.openai.com/docs/guides/agents
- https://docs.vllm.ai
- https://huggingface.co/docs
- https://platform.openai.com/docs/guides/retrieval
- https://docs.runpod.io/serverless/vllm/get-started
- https://www.runpod.io/articles/guides/deploy-vllm-runpod-docker
- https://www.spheron.network/blog/llm-deployment-guide/

Suggested optimizations:

- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx`

### AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查

- File: content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx
- Theme: Agent 部署、工具调用和生产安全
- Wave: 1
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: Codex 修改现有网页 UI 使用前怎么判断是否适合 (/blog/codex-edit-existing-ui-freelance-scope)

Review focus:

- 不要写成全自动替人完成高风险业务
- 明确工具权限、人工确认、日志和失败处理
- 核对 SDK/API 的当前名称和部署方式

Source targets:

- https://ai-sdk.dev/docs
- https://platform.openai.com/docs/guides/agents
- https://python.langchain.com/docs
- https://platform.openai.com/docs
- https://platform.openai.com/docs/guides/retrieval
- https://platform.openai.com/docs/guides/prompt-engineering
- https://openai.github.io/openai-agents-python/
- https://langchain-ai.github.io/langgraph/

Suggested optimizations:

- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx`

### n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储

- File: content/blog/n8n-ai-agent-rag-memory-guide.mdx
- Theme: Agent 记忆：短期记忆、长期记忆、RAG、Postgres
- Wave: 2
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: AI Agent 记忆和 RAG 怎么设计：短期记忆、长期记忆、引用来源和隐私边界 (/blog/ai-agent-memory-rag-design-guide)

Review focus:

- 区分知识库 RAG 和用户记忆
- 必须有隐私、删除、去重、引用和人工纠错边界
- 避免宣称记忆层能自动解决幻觉

Source targets:

- https://arxiv.org/abs/2604.20598
- https://www.reddit.com/r/Rag/comments/1qjvqd4/vector_dbs_arent_memory_learned_this_the_hard_way/
- https://docs.agenticgokit.com/tutorials/getting-started/memory-and-rag

Suggested optimizations:

- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/n8n-ai-agent-rag-memory-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/n8n-ai-agent-rag-memory-guide.mdx`

### 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检

- File: content/blog/ai-model-selection-customer-service-guide.mdx
- Theme: RAG、知识库、向量数据库和引用溯源
- Wave: 2
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 (/blog/n8n-ai-agent-rag-memory-guide)

Review focus:

- 把 RAG、微调、提示词模板区分清楚
- 必须写明引用、来源、权限和失败兜底
- 不要把 demo 成功写成生产质量保证

Source targets:

- https://platform.openai.com/docs
- https://ai-sdk.dev/docs
- https://platform.openai.com/docs/guides/retrieval
- https://platform.openai.com/docs/guides/prompt-engineering
- https://python.langchain.com/docs
- https://docs.llamaindex.ai
- https://huggingface.co/docs
- https://www.reddit.com/r/Rag/comments/1t9v93f/is_anyone_still_running_pure_vector_rag_in/
- https://arxiv.org/abs/2603.10700
- https://www.pinecone.io/learn/retrieval-augmented-generation/
- https://platform.openai.com/docs/guides/agents

Suggested optimizations:

- Tighten the meta description so it states the search intent, audience, and outcome clearly.
- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/ai-model-selection-customer-service-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/ai-model-selection-customer-service-guide.mdx`

### 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用

- File: content/blog/industry-ai-prompts-template-library-2026.mdx
- Theme: 全行业 AI 提示词和工作流模板
- Wave: 3
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: 销售 AI 提示词模板：客户画像、跟进话术、异议处理和会议纪要 (/blog/sales-ai-prompts-guide)

Review focus:

- 避免空泛万能提示词，必须给输入字段、输出结构和质检标准
- 高风险行业必须保留专业判断和人工复核
- 不要承诺转化率、收入或法律/医疗结果

Source targets:

- https://platform.openai.com/docs
- https://platform.openai.com/docs/guides/prompt-engineering
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- https://ai-sdk.dev/docs
- https://platform.openai.com/docs/guides/retrieval
- https://ai-prompts-pro.com/blog/ai-prompt-templates-business
- https://sensara.io/prompts/
- https://www.mrprompts.ai/learn/ai-prompts-for-sales

Suggested optimizations:

- Resolve all blocking issues before any review or publishing command.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/industry-ai-prompts-template-library-2026.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/industry-ai-prompts-template-library-2026.mdx`

### MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单

- File: content/blog/mcp-server-deployment-security-checklist.mdx
- Theme: Dify、n8n、Coze、Flowise、MCP 自动化部署
- Wave: 3
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: Agent 人工审核流程怎么设计：什么时候自动，什么时候必须人确认 (/blog/agent-human-review-loop-guide)

Review focus:

- 核对平台连接器、webhook、权限和部署限制
- 避免鼓励群发、绕过平台规则或抓取隐私数据
- 写清楚人工审批和客户验收边界

Source targets:

- https://docs.dify.ai/
- https://docs.n8n.io/
- https://modelcontextprotocol.io/docs

Suggested optimizations:

- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/mcp-server-deployment-security-checklist.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/mcp-server-deployment-security-checklist.mdx`

### AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急

- File: content/blog/ai-api-key-security-rotation-guide.mdx
- Theme: AI API 接入、限流、成本和多模型路由
- Wave: 4
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: Dify 工作流怎么做错误处理：变量、分支、重试和人工兜底 (/blog/dify-workflow-error-handling-guide)

Review focus:

- 核对 SDK 名称、API endpoint、限流概念和错误码
- 必须强调密钥安全、服务端代理和日志脱敏
- 不要虚构价格或模型能力

Source targets:

- https://platform.openai.com/docs/guides/agents
- https://platform.openai.com/docs/guides/retrieval
- https://python.langchain.com/docs
- https://platform.openai.com/docs
- https://docs.anthropic.com
- https://ai-sdk.dev/docs
- https://ai.google.dev/docs
- https://docs.dify.ai
- https://docs.n8n.io
- https://platform.openai.com/docs/guides/prompt-engineering
- https://docs.anthropic.com/
- https://vercel.com/docs/ai-gateway

Suggested optimizations:

- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/ai-api-key-security-rotation-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/ai-api-key-security-rotation-guide.mdx`

### Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志

- File: content/blog/agent-tool-permission-safety-guide.mdx
- Theme: LLM 观测、评测、日志和上线后质量
- Wave: 4
- Decision: blocked
- Risk level: high
- Stop before: Stop before mark:review and stop before publish. Both require explicit human approval.
- Public link suggestion: MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 (/blog/mcp-server-deployment-security-checklist)

Review focus:

- 不要把评测分数写成绝对质量保证
- 明确日志隐私、数据脱敏和留存边界
- 给出人工抽检和回滚流程

Source targets:

- https://www.promptfoo.dev/docs/intro/
- https://docs.ragas.io/
- https://docs.helicone.ai/

Suggested optimizations:

- Check whether the title should include the primary keyword naturally, or whether the current wording better matches intent.
- During human review, decide whether the title, description, or opening section should naturally include one search-seed variant.
- Add or approve one concrete subsection that matches the target search intent without keyword stuffing.

Human decision checklist:

- Confirm the article is still draft, noindex, and humanReviewRequired before any approval action.
- Verify source targets and remove or rewrite any unsupported claims.
- Decide whether the warning issues must be fixed before mark:review.
- Choose one public internal link suggestion or document why no link should be added.
- Confirm the article does not claim measured traffic, rankings, impressions, clicks, revenue, or income.
- Only after human approval, run the mark:review command manually; publishing still requires a separate explicit approval.

Commands after explicit approval:

- Mark review: `npm run mark:review -- --file=content/blog/agent-tool-permission-safety-guide.mdx --confirm-human`
- Publish dry-run: `npm run publish:articles -- --file=content/blog/agent-tool-permission-safety-guide.mdx`

