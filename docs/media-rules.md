# 图片与静态资源

站内图片只有三种「来源」，靠 URL 前缀区分，写法在 Markdown、MDX、frontmatter 和组件 props 里完全一致。

| 来源         | 写法                                | 解析结果                                                       | 用在哪 |
| ------------ | ----------------------------------- | -------------------------------------------------------------- | ------ |
| 外链 external | `https://cdn.example.com/a.png`     | 原样输出                                                        | 第三方图床、别人的图 |
| 存储 store    | `store:images/posts/2026/a.webp`    | `omni-store base_url` + 逐段编码后的路径                        | **文章配图的主场** |
| 本地 local    | `local:brand/logo.svg`              | `/images/brand/logo.svg`（即 `public/images/…`）                | 站点自有图标、改动频繁的小图 |

裸相对路径（`./assets/a.png`）不在上表里，语义也没变：相对**当前内容文件**，交给 Astro 图片管线（专栏 `assets/` 走的就是这条）。

## 为什么用前缀

前缀是唯一能在所有书写位置都成立的标记：

```markdown
![](store:images/posts/2026/a.webp)      <!-- Markdown 原生语法 -->
```

```yaml
cover: store:images/covers/a.webp         # frontmatter
```

```mdx
<Img src="store:images/posts/a.webp" caption="图注" />
<Photo src="store:images/posts/a.webp" type="watermark" brand="FUJIFILM" />
```

换成一个 `source="store"` 之类的 props，Markdown 语法就用不上，frontmatter 也得另写一套。前缀在四种地方是同一个字符串，搬来搬去不用改。

## 配置

```js
// src/config/media.mjs
export const mediaConfig = {
  storeBase: process.env.MEDIA_STORE_BASE ?? '',
  localRoot: '/images',
  lazyBodyImages: true,
};
```

`storeBase` 就是 omni-store 后台「存储源 → 静态访问」发布后返回的 `base_url`：

```text
public_origin + /assets/{public_asset_id}/
https://yun.mahoo12138.cn/assets/ast-0123456789abcdef0123456789abcdef/
```

末尾斜杠会归一化，写不写都行。**它没有默认值**：没配置时所有 `store:` 引用直接构建失败，而不是悄悄生成一条断链。临时切到本地实例或预发域名时用环境变量：

```sh
MEDIA_STORE_BASE=http://127.0.0.1:8080/assets/ast-test/ pnpm dev
```

`localRoot` 是本地素材根，映射到 `public/images`。

## 编码规则

omni-store 的约定是「每个文件名段单独编码，已编码的输入不得二次编码」，解析器照做：

```text
store:images/posts/图片 一.webp   → …/images/posts/%E5%9B%BE%E7%89%87%20%E4%B8%80.webp
store:images/%E4%B8%AD%E6%96%87.webp → 原样保留（检测到 %XX 就视为已编码）
store:images/a.webp?v=2           → 路径编码，?v=2 原样保留
```

所以中文文件名可以直接写，不用自己编码；但也别把整条路径当一段塞进 `encodeURIComponent`。

## <Img> 组件

大多数时候不需要它，Markdown 原生语法就够了。需要图注、预留比例、首屏优先加载时才升级：

```mdx
<Img
  src="store:images/posts/2026/a.webp"
  alt="栈帧示意"
  caption="图 3：调用栈展开过程"
  ratio="16/9"
  priority
/>
```

- `caption`：给了才包 `<figure>`，没给就是一张裸图（正文图片的默认间距由 `.prose img` 控制）。
- `ratio`：写成 `16/9` 会在图片加载前占好位置，避免整页下移（CLS）。
- `priority`：`eager` + `fetchpriority=high`，只给首屏那张用。
- 输出的 `<img>` 带 `data-media="store|local|external"`，排查「这张图到底走了哪条路」时直接看 DOM。

`Photo`、`ImageCard`、`GalleryImage`、`Frame` 的 `src` 也吃同一套前缀；`Banner` 的 `bg`、`YoCard` 的 `bgImage`、`Poster` / `SiteCard` / `Audio` 的 `cover` 在 MDX 里同样会被改写。

### `.md` 里没有组件

组件只在 `.mdx` 里生效。`.md` 文件中的 `<Img src=… />` 会被当成原生 HTML 原样输出，`<img src="store:…">` 也不会被改写——这是 Markdown 的解析规则，不是组件没生效。`.md` 里请用 Markdown 图片语法：

```markdown
![](store:images/posts/2026/a.webp)
```

需要图注 / 比例 / 优先级就把文件改成 `.mdx`。

## 正文图片的 loading 策略

Astro 渲染 Markdown 图片时**不加任何 loading 属性**（等于全页 eager）。`rehypeImageDefaults` 会补：

- 第一张图：`loading="eager"` + `fetchpriority="high"`（它基本就是首屏那张）
- 其余：`loading="lazy"` + `decoding="async"`
- 自己写了 `loading=` 的不覆盖

不想开就改 `mediaConfig.lazyBodyImages = false`。

## 失败会在构建时炸

不会等到线上 404 才发现：

```text
[media] src/content/posts/x.md:12 local: 找不到文件 public/images/about/missing.svg
（本地素材必须放在 public 素材根下；文章配图请改用 store:）
```

`pnpm content:check`（`pnpm verify` 的第一环）会独立扫一遍 `src/content/**`：glob loader 会把渲染期异常吞成一行日志，只靠构建报错会漏。检查项：

- 前缀写错 / 路径带 `/`、`..`、`//`
- `store:` 但没配 `storeBase`
- `local:` 指向的文件在 `public/images` 下不存在

## 和 Astro 图片管线的关系

`store:` 和 `local:` 解析出来都是普通 URL，走的是裸 `<img>`：没有多尺寸 `srcset`、没有内容哈希、没有 `width/height` 自动探测。这是刻意的取舍：

- 文章配图体量大、更新少，放 omni-store，换来的是「换图不用重新构建」。
- `local:` 放 `public/` 是为了同一串地址在 frontmatter、数据文件、组件里都能用，不依赖 import 路径。
- 真要享受 Astro 优化（多尺寸 + 哈希），把文件放进 `src/assets/` 并用**相对当前文件**的路径；但这只能用在内容文件里，数据文件（`goods.yaml`、`projects.json`）用不了。

封面（`cover`）解析后如果是绝对 URL，OG / JSON-LD 会直接用同一份地址，不再二次拼接。

## 目录约定

```text
public/images/            # local: 的根
├── about/
└── brand/

omni-store（发布根 blog-assets/）
└── images/
    ├── posts/<文章 slug>/
    └── covers/
```

omni-store 侧建议一个文章一个目录，路径里带年份或分类都行——`store:` 后面写的就是相对发布根 `blog-assets/` 的完整路径。例如发布根是 `blog-assets`，文件在 `blog-assets/images/posts/a.webp`，文章里就写 `store:images/posts/a.webp`（**不要再写一遍 `blog-assets/`**）。

## 迁移既有图片

存量文章的图都挂在 jsDelivr（`cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/…`）。搬进 omni-store 时按目标目录做一次前缀替换即可，不必逐篇手改：

```sh
# 1. 先看一眼要改哪些
rg -n 'js-css-cdn/hexo-images/' src/content | head

# 2. 批量替换（macOS 的 sed 需要空备份后缀；注意源里出现过双斜杠 `//hexo-images`）
rg -l 'js-css-cdn/hexo-images/' src/content \
  | xargs sed -i '' 's#https://cdn\.jsdelivr\.net/gh/mahoo12138/js-css-cdn/*hexo-images/#store:images/#g'

# 3. 验证：前缀可解析、本地文件都存在
pnpm content:check
```

第 2 步只换前缀，前提是 omni-store 里的目录结构与原来一致；路径不同就先在 omni-store 侧批量整理，再按实际路径改。frontmatter 的 `cover` 是同一个字符串，会被同一条规则覆盖。

## 实现位置

| 文件 | 职责 |
| --- | --- |
| `src/config/media.mjs` | 唯一配置：storeBase、localRoot、lazy 开关 |
| `src/utils/media.mjs` | `resolveMedia()` 纯函数：前缀解析、逐段编码、local 存在性校验 |
| `src/plugins/media.mjs` | `remarkMedia`（改写 mdast / MDX 属性）、`rehypeImageDefaults`（loading）、`validateContentMedia`（预检） |
| `src/components/mdx/Img.astro` | 带图注 / 比例 / 优先级的图片组件 |
| `src/utils/content.ts` | `resolvePostCover()` 复用同一解析器 |
