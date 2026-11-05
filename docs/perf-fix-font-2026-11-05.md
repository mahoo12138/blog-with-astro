# 字体性能修复 · P0-1 / P0-2（2026-11-05）

> 上游审查报告（`docs/perf-audit-2026-10-26.md`）在 2026-11-05 被一次 `git clean` 清掉了，
> 本文件是该报告中 P0-1 / P0-2 两项的**修复记录与复测数据**，可独立阅读。

## 问题回顾

| 项 | 现象（实测） | 根因 |
|---|---|---|
| P0-1 | Google Fonts CSS 每页 **182KB(gz)**，占首页总传输 288KB 的 63% | 三个 family 拼进同一个全局 URL；其中 Noto Serif SC（92.7KB）**全站无一处使用**（标题早已定调无衬线，它只服务 `/love` 与 gallery） |
| P0-2 | 长文 CLS **0.250**（三次复现，整块内容上移 40px），课时页 LCP **3956ms** | 中文 webfont 按 unicode-range 分片渐进到达，`display=swap` 且回退栈无 `size-adjust` 度量对齐 → 换字体时整页重排 |

对照实验（其余条件不变，仅屏蔽 `fonts.googleapis.com` / `fonts.gstatic.com`）：

```
密集长文 CLS    0.250  →  0
课时页 LCP      3388ms →  656ms   （LCP 元素从 <p>文本 变为 <a>链接）
```

结论：不是「字体差点」的问题，是**换字体那一刻整页重排**。

## 决策

中文正文改用**系统字体栈**，全站不再加载 CJK webfont。

| 候选方案 | 结论 |
|---|---|
| 保留 Noto Sans SC + 自托管分包 + `size-adjust` | 外观与稳定兼得，但产物 20–60MB、要维护 cn-font-split 链，不划算 |
| 保留 + `display=optional` | 仍付 92KB CSS；同一设备冷/热缓存两次访问字体不一致 |
| **改系统字体栈（采用）** | 182KB → 4KB、CLS 归零、无跨境依赖；代价是正文从 Noto Sans SC 变 PingFang SC |
| 保留现状 | 每篇长文必现 CLS 0.25，且大陆读者根本拿不到这个字体 |

系统栈在每个平台字段落到该平台最优中文字体（PingFang SC / 微软雅黑 / Noto Sans CJK），
与 Noto Sans SC 同属现代黑体，观感差异细微。

## 改动清单（17 文件，+102 / −60）

| 文件 | 变更 |
|---|---|
| `src/config/fonts.ts` | 全局 `fonts` 只剩 JetBrains Mono；`stacks.body/heading` 改 `system-ui` 系统栈；新增 `stacks.serif` 与 `serifFontsUrl`（Serif 单独成 URL，供按需页面使用） |
| `src/components/BaseHead.astro` | 新增 `extraFonts?: string[]` prop，输出页面级字体 `<link>`；注释改写为新策略（含「不要再把中文字体加回全局」的告警） |
| `StellarShell` / `WideShell` / `BlankShell` / `ExploreShell` | 透传 `extraFonts`（四个 shell 接口统一，避免联合类型 spread 报错） |
| `src/pages/love.astro` | `extraFonts={[siteFontConfig.serifFontsUrl]}` |
| `src/pages/gallery.astro` | 同上 |
| love 组件 10 个文件 + `love.astro`（共 19 处） | `"Noto Serif SC", serif` → 补 `"Source Han Serif SC", "Songti SC", STSong, Georgia` 本机兜底，webfont 未到时也不会掉成通用 serif |

## 复测（同口径：4G 1.6Mbps / 150ms RTT + 4× CPU、禁用缓存、390×844）

| 页面 | 指标 | 修复前 | 修复后 | 变化 |
|---|---|---|---|---|
| 首页 | 总传输 | 288KB | **114KB** | −60% |
| 首页 | CLS | 0.017 | **0.000** | 归零 |
| 首页 | LCP | 660ms | 680ms | 持平 |
| 密集代码长文 | CLS | **0.250** | **0.000** | 位移彻底消失 |
| 密集代码长文 | 总传输 | 323KB | **142KB** | −56% |
| 密集代码长文 | TBT | 262ms | 247ms | 持平（本次不动 DOM） |
| 课时页 | LCP | 3956ms | **1088ms** | −72% |
| 课时页 | FCP | 1372ms | **692ms** | −50% |
| 课时页 | 总传输 | 312KB | **132KB** | −58% |
| 普通文章 | LCP | 11732ms | **4208ms** | −64%（仍受远程封面拖累） |
| 普通文章 | 总传输 | 720KB | **539KB** | −25% |

产物断言：

```
引用 Noto+Sans+SC 的页面   0 / 320   （原先 320）
引用 Noto+Serif+SC 的页面  2 / 320   （/love、/gallery，按需）
document.fonts 实测         首页：仅 JetBrains Mono
                            /love：Noto Serif SC: loaded
```

## 验证方式

```bash
pnpm check          # 0 error
pnpm build          # 320 页 / 35s
pnpm preview --port 4321 &
THROTTLE=1 node .perf-audit/measure.mjs http://127.0.0.1:4321/
```

视觉验证：首页、文章页、`/love` 三处截图确认渲染正常，无缺字、无排版异常；
`/love` 的衬线标题仍由按需加载的 Noto Serif SC 承担。

## 仍未解决

- **P0-3 远程封面**：普通文章 LCP 仍有 4.2s，LCP 元素是 jsdelivr 上那张 415KB PNG。
  字体不再抢带宽后已从 11.7s 降到 4.2s，但要压进 1s 必须做封面本地化 + Astro 图片管线
  （98 篇 `cover:` 全为外链，`resolvePostCover` 对远程直接透传，管线完全没接）。
- **P1** 项（Shiki 内联色值、阻塞 CSS、Artalk CSS 被 hoist）未动。

## 回滚

```bash
git checkout -- src/config/fonts.ts src/components/BaseHead.astro \
  src/layouts src/pages/love.astro src/pages/gallery.astro src/components/love
```

回滚后需重新 `pnpm build`；`.perf-audit/measure.mjs` 不受影响，可用于前后对比。
