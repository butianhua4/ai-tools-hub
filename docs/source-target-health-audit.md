# Source Target Health Audit

Generated at: 2026-06-16T07:01:24.801Z

This report is read-only. It verifies official source URLs used by review and public-gap candidates before any human approval step.

## Guardrails

- Auto edit articles: false
- Auto mark review: false
- Auto publish: false
- Timeout ms: 6000
- Note: Read-only source target health audit. It checks source URLs for human fact review and does not edit articles, status, noindex, review, or publishing state.

## Summary

- checkedUrls: 38
- broadFirstCoverageFiles: 8
- currentReviewFiles: 3
- failedUrls: 1
- filesCovered: 24
- filesWithReachableSource: 24
- filesWithoutReachableSource: 0
- missingUrlTargets: 0
- nextSourcePackFiles: 15
- okUrls: 37
- publicGapDecisionFiles: 8
- redirectedUrls: 17
- sourceReferences: 202
- uniqueUrls: 38

## Files Without Reachable Source

- none

## Failed URL Checks

| OK | Status | URL | Final URL | References | Error |
| --- | --- | --- | --- | --- | --- |
| false |  | https://ai-prompts-pro.com/blog/ai-prompt-templates-business |  | 2 | TypeError |

## Redirected URLs

| OK | Status | URL | Final URL | References | Error |
| --- | --- | --- | --- | --- | --- |
| true | 200 | https://ai-sdk.dev/docs | https://ai-sdk.dev/docs/introduction | 27 |  |
| true | 200 | https://ai.google.dev/docs | https://ai.google.dev/gemini-api/docs?hl=ru | 4 |  |
| true | 200 | https://docs.anthropic.com | https://platform.claude.com/docs/en/home | 13 |  |
| true | 200 | https://docs.anthropic.com/ | https://platform.claude.com/docs/en/home | 2 |  |
| true | 200 | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | 2 |  |
| true | 200 | https://docs.dify.ai | https://docs.dify.ai/en/use-dify/getting-started/introduction | 2 |  |
| true | 200 | https://docs.dify.ai/ | https://docs.dify.ai/en/use-dify/getting-started/introduction | 2 |  |
| true | 200 | https://docs.helicone.ai/ | https://docs.helicone.ai/getting-started/quick-start | 2 |  |
| true | 200 | https://docs.llamaindex.ai | https://developers.llamaindex.ai/python/framework/ | 4 |  |
| true | 200 | https://docs.ragas.io/ | https://docs.ragas.io/en/stable/ | 2 |  |
| true | 200 | https://docs.vllm.ai | https://docs.vllm.ai/en/latest/ | 4 |  |
| true | 200 | https://modelcontextprotocol.io/docs | https://modelcontextprotocol.io/docs/getting-started/intro | 2 |  |
| true | 200 | https://platform.openai.com/docs | https://developers.openai.com/api/docs | 27 |  |
| true | 200 | https://platform.openai.com/docs/guides/agents | https://developers.openai.com/api/docs/guides/agents | 13 |  |
| true | 200 | https://platform.openai.com/docs/guides/prompt-engineering | https://developers.openai.com/api/docs/guides/prompt-engineering | 23 |  |
| true | 200 | https://platform.openai.com/docs/guides/retrieval | https://developers.openai.com/api/docs/guides/retrieval | 17 |  |
| true | 200 | https://python.langchain.com/docs | https://docs.langchain.com/oss/python/langchain/overview | 8 |  |

## File Coverage

| Reachable | Sources | Scopes | Title | File | URLs |
| --- | --- | --- | --- | --- | --- |
| 6 | 6 | broad-first-coverage, public-gap-decision | Agent 调工具怎么做权限控制：白名单、审批、沙箱和日志 | content/blog/agent-tool-permission-safety-guide.mdx | https://www.promptfoo.dev/docs/intro/<br>https://docs.ragas.io/<br>https://docs.helicone.ai/<br>https://www.promptfoo.dev/docs/intro/<br>https://docs.ragas.io/<br>https://docs.helicone.ai/ |
| 16 | 16 | broad-first-coverage, public-gap-decision | AI Agent 部署怎么做：用 Vercel AI SDK 理解工具调用、多步执行和上线检查 | content/blog/ai-agent-deployment-vercel-ai-sdk-guide.mdx | https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/agents<br>https://python.langchain.com/docs<br>https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://openai.github.io/openai-agents-python/<br>https://langchain-ai.github.io/langgraph/<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/agents<br>https://python.langchain.com/docs<br>https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://openai.github.io/openai-agents-python/<br>https://langchain-ai.github.io/langgraph/ |
| 24 | 24 | broad-first-coverage, public-gap-decision | AI API Key 怎么安全管理：环境变量、权限、轮换、泄露应急 | content/blog/ai-api-key-security-rotation-guide.mdx | https://platform.openai.com/docs/guides/agents<br>https://platform.openai.com/docs/guides/retrieval<br>https://python.langchain.com/docs<br>https://platform.openai.com/docs<br>https://docs.anthropic.com<br>https://ai-sdk.dev/docs<br>https://ai.google.dev/docs<br>https://docs.dify.ai<br>https://docs.n8n.io<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://docs.anthropic.com/<br>https://vercel.com/docs/ai-gateway<br>https://platform.openai.com/docs/guides/agents<br>https://platform.openai.com/docs/guides/retrieval<br>https://python.langchain.com/docs<br>https://platform.openai.com/docs<br>https://docs.anthropic.com<br>https://ai-sdk.dev/docs<br>https://ai.google.dev/docs<br>https://docs.dify.ai<br>https://docs.n8n.io<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://docs.anthropic.com/<br>https://vercel.com/docs/ai-gateway |
| 22 | 22 | broad-first-coverage, public-gap-decision | 客服 AI 该选什么模型：速度、成本、知识库、转人工和质检 | content/blog/ai-model-selection-customer-service-guide.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://python.langchain.com/docs<br>https://docs.llamaindex.ai<br>https://huggingface.co/docs<br>https://www.reddit.com/r/Rag/comments/1t9v93f/is_anyone_still_running_pure_vector_rag_in/<br>https://arxiv.org/abs/2603.10700<br>https://www.pinecone.io/learn/retrieval-augmented-generation/<br>https://platform.openai.com/docs/guides/agents<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://python.langchain.com/docs<br>https://docs.llamaindex.ai<br>https://huggingface.co/docs<br>https://www.reddit.com/r/Rag/comments/1t9v93f/is_anyone_still_running_pure_vector_rag_in/<br>https://arxiv.org/abs/2603.10700<br>https://www.pinecone.io/learn/retrieval-augmented-generation/<br>https://platform.openai.com/docs/guides/agents |
| 14 | 16 | broad-first-coverage, public-gap-decision | 全行业 AI 提示词模板库怎么做：销售、运营、客服、HR、财务和教育都能用 | content/blog/industry-ai-prompts-template-library-2026.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://ai-prompts-pro.com/blog/ai-prompt-templates-business<br>https://sensara.io/prompts/<br>https://www.mrprompts.ai/learn/ai-prompts-for-sales<br>https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://ai-prompts-pro.com/blog/ai-prompt-templates-business<br>https://sensara.io/prompts/<br>https://www.mrprompts.ai/learn/ai-prompts-for-sales |
| 20 | 20 | broad-first-coverage, public-gap-decision | 大模型部署怎么选：Hugging Face Inference Endpoints、API、私有化和成本检查 | content/blog/llm-deployment-huggingface-inference-endpoints-guide.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/agents<br>https://docs.vllm.ai<br>https://huggingface.co/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://docs.runpod.io/serverless/vllm/get-started<br>https://www.runpod.io/articles/guides/deploy-vllm-runpod-docker<br>https://www.spheron.network/blog/llm-deployment-guide/<br>https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/agents<br>https://docs.vllm.ai<br>https://huggingface.co/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://docs.runpod.io/serverless/vllm/get-started<br>https://www.runpod.io/articles/guides/deploy-vllm-runpod-docker<br>https://www.spheron.network/blog/llm-deployment-guide/ |
| 6 | 6 | broad-first-coverage, public-gap-decision | MCP Server 怎么部署才安全：本地、远程、权限、日志和工具白名单 | content/blog/mcp-server-deployment-security-checklist.mdx | https://docs.dify.ai/<br>https://docs.n8n.io/<br>https://modelcontextprotocol.io/docs<br>https://docs.dify.ai/<br>https://docs.n8n.io/<br>https://modelcontextprotocol.io/docs |
| 6 | 6 | broad-first-coverage, public-gap-decision | n8n AI Agent 怎么接知识库和记忆：RAG、上下文和状态存储 | content/blog/n8n-ai-agent-rag-memory-guide.mdx | https://arxiv.org/abs/2604.20598<br>https://www.reddit.com/r/Rag/comments/1qjvqd4/vector_dbs_arent_memory_learned_this_the_hard_way/<br>https://docs.agenticgokit.com/tutorials/getting-started/memory-and-rag<br>https://arxiv.org/abs/2604.20598<br>https://www.reddit.com/r/Rag/comments/1qjvqd4/vector_dbs_arent_memory_learned_this_the_hard_way/<br>https://docs.agenticgokit.com/tutorials/getting-started/memory-and-rag |
| 3 | 3 | next-source-pack | 订阅支付失败怎么和客户沟通 | content/blog/subscription-payment-failed-message.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs |
| 7 | 7 | next-source-pack | Supabase pgvector 做 RAG 怎么开始：Postgres 里的向量检索 | content/blog/supabase-pgvector-rag-guide.mdx | https://platform.openai.com/docs/guides/retrieval<br>https://python.langchain.com/docs<br>https://docs.llamaindex.ai<br>https://huggingface.co/docs<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.langchain.com |
| 5 | 5 | next-source-pack | TensorRT-LLM 怎么入门：NVIDIA GPU 推理优化先看模型和验收 | content/blog/tensorrt-llm-beginner-guide.mdx | https://docs.vllm.ai<br>https://huggingface.co/docs<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.ollama.com |
| 4 | 4 | next-source-pack | Together AI API 怎么接入：开源模型接口、embedding 和部署边界 | content/blog/together-ai-api-beginner-guide.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/retrieval |
| 3 | 3 | current-review | AI 工具新手不应该先买哪些工具 | content/blog/tools-not-to-buy-first.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com |
| 10 | 10 | current-review, next-source-pack | RAG 向量数据库怎么选：pgvector、Qdrant、Milvus 先看项目边界 | content/blog/vector-database-selection-for-rag-guide.mdx | https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://platform.openai.com/docs/guides/retrieval<br>https://python.langchain.com/docs<br>https://docs.llamaindex.ai<br>https://huggingface.co/docs<br>https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/agents<br>https://ai-sdk.dev/docs<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 3 | 3 | next-source-pack | Vercel 部署后 404 检查清单：逐页验收更稳 | content/blog/vercel-404-after-deploy-checklist.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs |
| 4 | 4 | next-source-pack | Vercel 404 部署成功但页面打不开怎么办：使用前怎么判断是否适合 | content/blog/vercel-404-after-deploy-freelance-scope.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com |
| 3 | 3 | next-source-pack | Vercel 部署成功但页面 404：新手排查顺序 | content/blog/vercel-404-after-deploy.mdx | https://platform.openai.com/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://ai-sdk.dev/docs |
| 12 | 12 | current-review, next-source-pack | Vercel AI Gateway 怎么做多模型接入：OpenAI、Claude、Gemini 和降级 | content/blog/vercel-ai-gateway-multi-provider-guide.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://ai.google.dev/docs<br>https://platform.openai.com/docs/guides/prompt-engineering<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/agents<br>https://ai.google.dev/docs<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 5 | 5 | next-source-pack | Vercel AI SDK 聊天机器人怎么部署：Next.js 流式输出和上线检查 | content/blog/vercel-ai-sdk-chatbot-deploy-guide.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/retrieval<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 4 | 4 | next-source-pack | Vercel 部署检查表怎么写：给新手的上线模板 | content/blog/vercel-deploy-checklist-template.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 7 | 7 | next-source-pack | vLLM 部署适合什么场景：新手先看推理服务边界 | content/blog/vllm-deployment-beginner-guide.mdx | https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/agents<br>https://docs.ollama.com<br>https://docs.vllm.ai<br>https://platform.openai.com/docs/guides/retrieval |
| 6 | 6 | next-source-pack | Windows 路径和权限导致安装失败怎么办：新手检查清单 | content/blog/windows-path-permission-install-fix-checklist.mdx | https://platform.openai.com/docs/guides/agents<br>https://docs.n8n.io<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 6 | 6 | next-source-pack | Windows 路径和权限导致安装失败怎么办：使用前怎么判断是否适合 | content/blog/windows-path-permission-install-fix-freelance-scope.mdx | https://platform.openai.com/docs/guides/agents<br>https://docs.n8n.io<br>https://platform.openai.com/docs<br>https://ai-sdk.dev/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/prompt-engineering |
| 4 | 4 | next-source-pack | Windows 路径和权限导致安装失败怎么办 | content/blog/windows-path-permission-install-fix.mdx | https://ai-sdk.dev/docs<br>https://platform.openai.com/docs<br>https://docs.anthropic.com<br>https://platform.openai.com/docs/guides/prompt-engineering |

## All URL Checks

| OK | Status | URL | Final URL | References | Error |
| --- | --- | --- | --- | --- | --- |
| false |  | https://ai-prompts-pro.com/blog/ai-prompt-templates-business |  | 2 | TypeError |
| true | 200 | https://ai-sdk.dev/docs | https://ai-sdk.dev/docs/introduction | 27 |  |
| true | 200 | https://ai.google.dev/docs | https://ai.google.dev/gemini-api/docs?hl=ru | 4 |  |
| true | 200 | https://arxiv.org/abs/2603.10700 | https://arxiv.org/abs/2603.10700 | 2 |  |
| true | 200 | https://arxiv.org/abs/2604.20598 | https://arxiv.org/abs/2604.20598 | 2 |  |
| true | 200 | https://docs.agenticgokit.com/tutorials/getting-started/memory-and-rag | https://docs.agenticgokit.com/tutorials/getting-started/memory-and-rag | 2 |  |
| true | 200 | https://docs.anthropic.com | https://platform.claude.com/docs/en/home | 13 |  |
| true | 200 | https://docs.anthropic.com/ | https://platform.claude.com/docs/en/home | 2 |  |
| true | 200 | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | 2 |  |
| true | 200 | https://docs.dify.ai | https://docs.dify.ai/en/use-dify/getting-started/introduction | 2 |  |
| true | 200 | https://docs.dify.ai/ | https://docs.dify.ai/en/use-dify/getting-started/introduction | 2 |  |
| true | 200 | https://docs.helicone.ai/ | https://docs.helicone.ai/getting-started/quick-start | 2 |  |
| true | 200 | https://docs.langchain.com | https://docs.langchain.com/ | 1 |  |
| true | 200 | https://docs.llamaindex.ai | https://developers.llamaindex.ai/python/framework/ | 4 |  |
| true | 200 | https://docs.n8n.io | https://docs.n8n.io/ | 4 |  |
| true | 200 | https://docs.n8n.io/ | https://docs.n8n.io/ | 2 |  |
| true | 200 | https://docs.ollama.com | https://docs.ollama.com/ | 2 |  |
| true | 200 | https://docs.ragas.io/ | https://docs.ragas.io/en/stable/ | 2 |  |
| true | 200 | https://docs.runpod.io/serverless/vllm/get-started | https://docs.runpod.io/serverless/vllm/get-started | 2 |  |
| true | 200 | https://docs.vllm.ai | https://docs.vllm.ai/en/latest/ | 4 |  |
| true | 200 | https://huggingface.co/docs | https://huggingface.co/docs | 7 |  |
| true | 200 | https://langchain-ai.github.io/langgraph/ | https://langchain-ai.github.io/langgraph/ | 2 |  |
| true | 200 | https://modelcontextprotocol.io/docs | https://modelcontextprotocol.io/docs/getting-started/intro | 2 |  |
| true | 200 | https://openai.github.io/openai-agents-python/ | https://openai.github.io/openai-agents-python/ | 2 |  |
| true | 200 | https://platform.openai.com/docs | https://developers.openai.com/api/docs | 27 |  |
| true | 200 | https://platform.openai.com/docs/guides/agents | https://developers.openai.com/api/docs/guides/agents | 13 |  |
| true | 200 | https://platform.openai.com/docs/guides/prompt-engineering | https://developers.openai.com/api/docs/guides/prompt-engineering | 23 |  |
| true | 200 | https://platform.openai.com/docs/guides/retrieval | https://developers.openai.com/api/docs/guides/retrieval | 17 |  |
| true | 200 | https://python.langchain.com/docs | https://docs.langchain.com/oss/python/langchain/overview | 8 |  |
| true | 200 | https://sensara.io/prompts/ | https://sensara.io/prompts/ | 2 |  |
| true | 200 | https://vercel.com/docs/ai-gateway | https://vercel.com/docs/ai-gateway | 2 |  |
| true | 200 | https://www.mrprompts.ai/learn/ai-prompts-for-sales | https://www.mrprompts.ai/learn/ai-prompts-for-sales | 2 |  |
| true | 200 | https://www.pinecone.io/learn/retrieval-augmented-generation/ | https://www.pinecone.io/learn/retrieval-augmented-generation/ | 2 |  |
| true | 200 | https://www.promptfoo.dev/docs/intro/ | https://www.promptfoo.dev/docs/intro/ | 2 |  |
| true | 403 | https://www.reddit.com/r/Rag/comments/1qjvqd4/vector_dbs_arent_memory_learned_this_the_hard_way/ | https://www.reddit.com/r/Rag/comments/1qjvqd4/vector_dbs_arent_memory_learned_this_the_hard_way/ | 2 |  |
| true | 403 | https://www.reddit.com/r/Rag/comments/1t9v93f/is_anyone_still_running_pure_vector_rag_in/ | https://www.reddit.com/r/Rag/comments/1t9v93f/is_anyone_still_running_pure_vector_rag_in/ | 2 |  |
| true | 200 | https://www.runpod.io/articles/guides/deploy-vllm-runpod-docker | https://www.runpod.io/articles/guides/deploy-vllm-runpod-docker | 2 |  |
| true | 200 | https://www.spheron.network/blog/llm-deployment-guide/ | https://www.spheron.network/blog/llm-deployment-guide/ | 2 |  |
