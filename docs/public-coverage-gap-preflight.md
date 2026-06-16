# Public Coverage Gap Preflight

Generated at: 2026-06-16T07:01:22.084Z

This report is read-only. It checks the public coverage gap plan candidates before any human review or publishing action.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Stop before: Use findings during human review. Do not run mark:review --confirm-human or publish:articles --confirm without explicit human approval.
- Note: Read-only preflight for the public coverage gap plan. It does not edit metadata, links, status, noindex, review, or publishing state.

## Source Evidence

- Note: Search seeds are editorial review prompts, not measured keyword volume, rankings, clicks, impressions, or traffic.
- Gap plan guardrails: {"autoEditArticles":false,"autoMarkReview":false,"autoPublish":false,"note":"Read-only plan for public-coverage gaps. It selects one safe draft per broad demand theme with no public coverage and stops before human review or publishing.","stopBefore":"Do not run mark:review --confirm-human or publish:articles --confirm without explicit human approval."}
- Broad first coverage guardrails: {"autoCreateArticles":false,"autoEditArticles":false,"autoMarkReview":false,"autoPublish":false,"note":"Read-only first coverage launch pack. It selects one unique human-review candidate for each broad AI cluster with zero public coverage and never edits articles or changes review/publish state.","stopBefore":"Stop before mark:review and publish. Human approval is required for every selected file.","trafficClaim":"not-included"}
- Broad first coverage summary: {"clustersSelected":8,"commandBoundaries":8,"firstCoverageTarget":8,"humanReviewRequiredItems":8,"itemsWithContentAngles":8,"itemsWithFactCheckChecklist":8,"itemsWithReviewFocus":8,"itemsWithSearchQueries":8,"itemsWithSourceTargets":8,"publicArticlesBeforeLaunch":15,"safeDraftItems":8,"trafficDataAvailable":false,"uniqueFiles":8,"unsafeItems":0,"zeroPublicClusters":8}

## Summary

- blockingItems: 8
- broadFirstCoverageItems: 8
- broadFirstCoveragePreflightItems: 8
- items: 8
- planItems: 0
- planReadyItems: 0
- planUnsafeItems: 0
- planWaves: 0
- readyItems: 0
- structuredDataReadyItems: 8
- uniqueFiles: 8
- warningItems: 7
- withPublicLinkSuggestions: 8
- withSeedMatches: 7

## Wave Summary

| Wave | Ready | Blocking | Warning | Themes | Files |
| --- | --- | --- | --- | --- | --- |
| 1 | 0/2 | 2 | 2 | 开源大模型部署：Ollama、vLLM、TGI、RunPod<br>Agent 部署、工具调用和生产安全 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx<br>content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | 0/2 | 2 | 2 | Agent 记忆：短期记忆、长期记忆、RAG、Postgres<br>RAG、知识库、向量数据库和引用溯源 | content/blog/n8n-ai-agent-rag-memory-guide.mdx<br>content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | 0/2 | 2 | 1 | 全行业 AI 提示词和工作流模板<br>Dify、n8n、Coze、Flowise、MCP 自动化部署 | content/blog/industry-ai-prompts-template-library-2026.mdx<br>content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | 0/2 | 2 | 2 | AI API 接入、限流、成本和多模型路由<br>LLM 观测、评测、日志和上线后质量 | content/blog/ai-api-key-security-rotation-guide.mdx<br>content/blog/agent-tool-permission-safety-guide.mdx |

## Blocking Items

| Wave | Scope | Ready | Score | Quality | Snippet | Links | Seeds | Structured | Blocking | Warnings | Theme | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | broad-first-coverage | false | 321 | 100 | 54/65 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | 开源大模型部署：Ollama、vLLM、TGI、RunPod | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| 1 | broad-first-coverage | false | 317 | 100 | 47/69 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | Agent 部署、工具调用和生产安全 | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | broad-first-coverage | false | 315 | 100 | 35/59 | 4/5 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Agent 记忆：短期记忆、长期记忆、RAG、Postgres | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| 2 | broad-first-coverage | false | 313 | 100 | 29/52 | 3/4 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | description may be thin for search snippets<br>primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | RAG、知识库、向量数据库和引用溯源 | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | broad-first-coverage | false | 311 | 100 | 37/67 | 2/6 + 5 suggestions | 1/6 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | none | 全行业 AI 提示词和工作流模板 | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| 3 | broad-first-coverage | false | 307 | 100 | 36/58 | 2/3 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Dify、n8n、Coze、Flowise、MCP 自动化部署 | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | broad-first-coverage | false | 293 | 100 | 33/59 | 2/3 + 5 suggestions | 1/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring | AI API 接入、限流、成本和多模型路由 | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| 4 | broad-first-coverage | false | 287 | 100 | 29/58 | 2/3 + 5 suggestions | 0/1 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body<br>few search-seed token families appear in article text | LLM 观测、评测、日志和上线后质量 | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## Warning Items

| Wave | Scope | Ready | Score | Quality | Snippet | Links | Seeds | Structured | Blocking | Warnings | Theme | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | broad-first-coverage | false | 321 | 100 | 54/65 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | 开源大模型部署：Ollama、vLLM、TGI、RunPod | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| 1 | broad-first-coverage | false | 317 | 100 | 47/69 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | Agent 部署、工具调用和生产安全 | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | broad-first-coverage | false | 315 | 100 | 35/59 | 4/5 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Agent 记忆：短期记忆、长期记忆、RAG、Postgres | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| 2 | broad-first-coverage | false | 313 | 100 | 29/52 | 3/4 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | description may be thin for search snippets<br>primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | RAG、知识库、向量数据库和引用溯源 | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | broad-first-coverage | false | 307 | 100 | 36/58 | 2/3 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Dify、n8n、Coze、Flowise、MCP 自动化部署 | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | broad-first-coverage | false | 293 | 100 | 33/59 | 2/3 + 5 suggestions | 1/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring | AI API 接入、限流、成本和多模型路由 | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| 4 | broad-first-coverage | false | 287 | 100 | 29/58 | 2/3 + 5 suggestions | 0/1 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body<br>few search-seed token families appear in article text | LLM 观测、评测、日志和上线后质量 | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |

## All Items

| Wave | Scope | Ready | Score | Quality | Snippet | Links | Seeds | Structured | Blocking | Warnings | Theme | Title | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | broad-first-coverage | false | 321 | 100 | 54/65 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | 开源大模型部署：Ollama、vLLM、TGI、RunPod | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx |
| 1 | broad-first-coverage | false | 317 | 100 | 47/69 | 2/6 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | no exact search-seed phrase appears in title, description, or body | Agent 部署、工具调用和生产安全 | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx |
| 2 | broad-first-coverage | false | 315 | 100 | 35/59 | 4/5 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Agent 记忆：短期记忆、长期记忆、RAG、Postgres | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx |
| 2 | broad-first-coverage | false | 313 | 100 | 29/52 | 3/4 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | description may be thin for search snippets<br>primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | RAG、知识库、向量数据库和引用溯源 | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx |
| 3 | broad-first-coverage | false | 311 | 100 | 37/67 | 2/6 + 5 suggestions | 1/6 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | none | 全行业 AI 提示词和工作流模板 | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx |
| 3 | broad-first-coverage | false | 307 | 100 | 36/58 | 2/3 + 5 suggestions | 0/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body | Dify、n8n、Coze、Flowise、MCP 自动化部署 | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx |
| 4 | broad-first-coverage | false | 293 | 100 | 33/59 | 2/3 + 5 suggestions | 1/5 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring | AI API 接入、限流、成本和多模型路由 | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx |
| 4 | broad-first-coverage | false | 287 | 100 | 29/58 | 2/3 + 5 suggestions | 0/1 | true | candidate must remain draft, noindex, and humanReviewRequired<br>gap candidate must not be indexable before approval | primary keyword is not an exact title substring<br>no exact search-seed phrase appears in title, description, or body<br>few search-seed token families appear in article text | LLM 观测、评测、日志和上线后质量 | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx |
