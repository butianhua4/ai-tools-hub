# SEO 复查基线（2026-06-27）

记录"消重+提质+建集群"改动**生效前**的 GSC 基线，几天后对比用，判断 15 篇是否见效。

## 关键背景
- 改动时间线：止血+消重(6/25, 669→285 noindex 215 重复页)、sitemap 重提交(6/25)、提质 11 篇报错集群(6/25-26)、提质 4 篇 API 接入集群(6/27)。
- GSC 有 2-3 天数据延迟：本基线数据截至 6/24，**尚未反映上述改动**。

## GSC 基线（ai.aporet.com，近 3 个月，数据截至 6/24）
| 指标 | 改动前(6/19) | 本基线(6/27) |
|---|---|---|
| 总点击 | 4 | **7** |
| 总曝光 | 144 | **174** |
| 平均 CTR | 2.8% | **4%** |
| 平均排名 | 17.8 | **17.1** |
| 已编入索引 | 3 (旧域名 vercel.app) | aporet "处理中" |
| Ahrefs DR / 外链 | 0 / 0 | 0 / 0 |

## 几天后复查清单（建议 6/30–7/2）
1. **GSC 索引数**：aporet「已编入索引」是否从个位数往上走（核心指标，证明消重让 Google 愿意收录）。
2. **GSC 效果**：点击/曝光/排名是否继续涨。
3. **15 篇提质页排名**：用 GSC「网页」过滤看这 15 个 slug 的曝光/排名有没有进步。
4. **集群**：报错排查 / AI 接入两个 category 的整体表现。

## 待观察的 15 篇（两个集群）
报错排查(11)：codex-codex-npm-install-4-33, codex-codex-vercel-4-37, codex-codex-github-4-36, dev-works-build-fails, port-already-in-use-fix-freelance-scope, module-not-found-debug, nextjs-hydration-error-debug-freelance-scope, npm-command-not-found-fix-mistakes, env-variable-missing-fix, git-authentication-failed-fix-mistakes, node-version-mismatch-fix
AI 接入(4)：openai-api-nextjs-route-handler-guide, gemini-api-nextjs-guide, claude-api-beginner-guide, ai-api-key-security-rotation-guide

## 判断 & 调方向
- 索引数涨 + 这些页有曝光 → 方向对，继续开新集群(对比集群 CTR 最高)。
- 索引数不动 → 可能要进一步砍页(285→~100)、补真实截图(E-E-A-T)、或搞外链。
