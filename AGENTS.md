# Project notes

## 学苑 / learn

- 新课时只需在 `src/content/lessons/` 放 `<slug>.mdx`：`/learn/[slug]` 由 glob loader 自动生成路由；`domain` 决定索引分组，`order` 是全局排序并决定 prev/next（跨 domain 也会相连）。
- `LessonLayout` 已全局装载 `src/kit/index`，课时里可直接用 `kl-*` / `kl-glossary`，不需要 import；结构化数据放 `<script type="application/json">` 子节点。
- 含 React island 的课时不要启用 frontmatter `terms`：`kl-term-annotate` 会改写 island 的 SSR 文本，存在水合不匹配风险；改用显式 `<kl-term>` 或 `kl-glossary`。

## 学苑互动岛

- 课时互动件放 `src/components/learn/*.tsx`，共享 `islandUi.css.ts` 的卡面与 ghost 控件；样式写同名 `*.css.ts`（vanilla-extract），颜色只取 `vars`。
- 正文列宽约 46rem：岛内多栏用 `repeat(auto-fit, minmax(...))` 按容器折行，别按视口断点；宽表/甘特图用 `overflow-x: auto` 兜底。

## MDX 内容

- `<Formula>` 或 raw HTML 表格里的裸 URL 会被 autolink，直引号会被 smartypants 弯引号化；需要原样代码时用 `expr={...}` 或 JSX 表达式 `{'...'}`。
- `Tabs` 的非激活 pane 靠 `height: 0 + overflow: hidden` 隐藏，仍留在 DOM / 无障碍树里；验证切换要看 `.tab.active` 或 pane 高度，不要用可见文本判断。

## 图片与静态资源

- 三种来源靠 URL **前缀**区分，唯一真源是 `src/config/media.mjs` + `src/utils/media.mjs`：完整外链 / `store:<相对发布根>`（omni-store 静态发布空间）/ `local:<相对素材根>`（`public/images`）。裸相对路径仍是「相对当前内容文件」，交给 Astro 管线，不要和前三种混用。详见 `docs/media-rules.md`。
- 任何新图片来源都必须走 `resolveMedia()`，不要手拼 base URL：它负责逐段编码（已编码的输入不二次编码）、拒绝 `..`、校验 local 文件真实存在。`store:` 没配 `storeBase` 会直接构建失败。
- `remarkMedia` 改写 mdast 图片与 MDX 的 `<img src>` / 组件图片 props（`src`、`cover`、`bg`、`bgImage`），**唯独 `<Img>` 例外**（它自己解析并负责 `data-media` 标记，提前改写会让标记退化成 external）。`rehypeImageDefaults` 补 `loading`：首图 eager + `fetchpriority=high`，其余 lazy。
- `pnpm content:check` 会独立扫一遍前缀，别只依赖构建期报错（glob loader 会把渲染异常吞成一行日志）。

## 开发与验证

- 新增内容后，已运行的 `astro dev` 可能对新页面返回 `UnknownContentCollectionError`，重启即恢复；以 `pnpm build` 或新 dev server 为准。
- 同一 checkout 同时跑多个 Astro dev 会共享 `node_modules/.vite`，容易出现 504 `Outdated Optimize Dep`；干净验证用 `pnpm build && pnpm preview`。
- 生产构建使用 vanilla-extract 的 short class id，浏览器断言应查 `aria-*` / 语义节点，不要依赖 dev 里的类名子串。
- `pnpm verify` 末尾的 `audit:dist` 有 22MB 总量 / 200KB 单图预算；`local:` 只放站点自有小图（图标、logo），文章配图一律走 `store:`。大图仍走 Astro 图片管线，不要靠 `public/` 绕过预算。
