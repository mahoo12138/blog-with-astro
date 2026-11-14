# 博客与专栏内容维护

## 目录约定

```text
src/content/
├── posts/                               # 独立文章
│   └── ubuntu-upgrade-ax210-wifi-bug.md
└── columns/
    ├── stm32/
    │   ├── index.md                     # 专栏入口：元数据 + 导读
    │   ├── stm32-1.md                   # 章节
    │   ├── stm32-2.md
    │   └── assets/                      # 本专栏的图片和下载资源
    └── hexo-theme-tutorial/
        ├── index.md
        ├── hexo-theme-tutorial-01.md
        └── hexo-theme-tutorial-02-part1.md
```

一个文件夹对应一个专栏。入口允许 `index.md` 或 `index.mdx`，不能同时存在。文件夹内其余 `.md` / `.mdx` 文件为章节。第一版不支持嵌套章节目录；`assets/` 不参与文章扫描。专栏文件夹使用稳定的小写 slug，建议小写英文、数字和连字符。

独立文章继续放在 `posts/`。只有入口而没有公开章节的专栏不会出现在列表中，内容文件仍可保留，以后补充章节时自动显示。

## 分类词表

独立文章与专栏入口的 `categories` 只接受四个值，按体裁 / 写作视角划分；技术主题一律写进 `tags`：

- `学习笔记` — 读书、课程、知识点整理
- `技术教程` — 可照着做的操作步骤
- `随笔杂谈` — 日常、记录、感想
- `技术思考` — 观点、思辨、行业趋势类长文

词表唯一真源是 `scripts/audit-dist.mjs` 的 `CANONICAL_CATEGORIES`，`pnpm verify` 会逐篇校验。新增分类前先确认有足够的同类文章撑起分类页；章节不写 `categories`，体裁由专栏入口统一表达。

## 标签命名

`tags` 表达主题 / 技术名，不设封闭词表，但**同一主题只能有一种写法**：标签页按
`slugifySegment(tag)` 归并，写法不同就会被拆成两个页面，内容也随之分散（`Golang` 与
`Go` 曾各占一页）。约定：

- 用官方写法：`VS Code`、`Vue.js`、`WebDAV`、`XPath`、`ADB`、`Office`、`IEEE 754`、
  `Orange Pi`、`Windows 10`、`宝塔面板`；不要写 `Vscode`、`Vuejs`、`Webdav`、`Xpath`、
  `adb`、`office`、`IEEE754`、`OrangePi`、`Win10`、`宝塔`。
- 子主题先并入上位标签，除非已攒够单独成页的内容：`CSS布局` → `CSS`、
  `链表` → `数据结构与算法`；语言统一写 `Go`（不写 `Golang`）。
- 避免过泛或有歧义的词：`实践经验`、`编码` 换成能指向具体主题的 `AI 编程`、`二维码编码`。
- 章节不写 `tags`，主题统一登记在专栏入口的 `index.md`（见「分类词表」）。
- 已废弃写法由 `scripts/audit-dist.mjs` 的 `DEPRECATED_TAGS` 拦截，`pnpm audit:dist` 会报错。

改标签名会改变 `/tags/<slug>/` 地址（空格与点会被折叠成连字符）。本项目**不为标签页
保留旧地址重定向**，改名是会被外部链接感知的操作，动手前先确认影响面。

## 新建专栏

创建 `src/content/columns/my-series/index.md`：

```markdown
---
title: 我的系列教程
description: 介绍这个系列解决的问题与阅读对象。
order: 20
categories:
  - 学习笔记
tags:
  - TypeScript
---

这里写导读、前置知识或推荐的阅读方式。

从[第一章](./introduction.md)开始阅读。
```

入口的 `order` 决定专栏之间的排序。分类与标签统一放在入口，不要重复写在章节中。入口正文不必手抄完整目录：目录页、侧栏、上一章和下一章共用自动生成的章节顺序。

创建同目录的 `introduction.md`：

```markdown
---
title: 入门与基础概念
date: 2026-10-19
order: 1
---

## 准备环境

正文从这里开始。

[返回专栏](./index.md)
```

章节必须声明正整数 `order`，同一专栏不能重复。修改顺序只需改 `order`，无需给文件名前面加数字或重命名。两篇章节交换顺序时，保存过程中的短暂重复会在开发服务器中提示；全部改好后自动恢复。

**不要手写 `columnId`。** 文件夹是专栏归属的唯一来源，加载器会为现有页面代码推导 `columnId`。也不支持用 frontmatter `slug` 再维护第二套 URL。

## Markdown 相对链接

链接按当前源文件的位置解析，构建时转换为正式网页地址。例如，在 `columns/stm32/stm32-2.md` 中：

```markdown
[上一章](./stm32-1.md)
[返回专栏](./index.md)
[指定章节](./stm32-1.md#准备环境)
[保留查询参数](./stm32-1.md?from=chapter#准备环境)
[其他专栏](../hexo-theme-tutorial/index.md)
[独立文章](../../posts/ubuntu-upgrade-ax210-wifi-bug.md)

[上一章][previous]

[previous]: ./stm32-1.md
```

`./stm32-1.md` 输出为 `/columns/stm32/stm32-1/`；`./index.md` 输出为 `/columns/stm32/`。不要为了适配浏览器尾斜杠而把同级源文件链接写成 `../stm32-1/`。

支持普通链接、引用式链接和 MDX 原生 `<a href="./chapter.md">` 的字面量属性。代码块、行内代码和 JavaScript 表达式不作字符串替换。动态 MDX 链接请自行使用正式网页地址，最终输出由产物审计检查。普通 Markdown 中手写的 HTML `<a>` 不做源文件转换，请使用 Markdown 链接语法或正式 URL。

`https:`、`mailto:`、协议相对地址、以 `/` 开头的站内地址，以及纯 `#锚点` / `?查询` 链接不作源文件重写。中文、空格和 URL 编码会在源文件解析与网页路径生成时分别处理。`pnpm verify` 会检查生成页面中的锚点是否真实存在。

## 图片和下载资源

```markdown
![GPIO 示意图](./assets/gpio.webp)
[实验说明](./assets/experiment.pdf)
```

文章配图有三种来源，靠 URL 前缀区分，写法在 Markdown、MDX、frontmatter 里一致（完整规则见 [图片与静态资源](./media-rules.md)）：

```text
![](https://cdn.example.com/a.png)      ← 外链，原样输出
![](store:images/posts/2026/a.webp)     ← omni-store 静态发布空间内的相对路径
![](local:brand/logo.svg)               ← public/images 下的本地素材
```

`store:` / `local:` 在构建期解析成真实地址：没配 `storeBase`、本地文件不存在、路径带 `..` 都会直接构建失败，不会产出断链。需要图注、预留比例或首屏优先加载时用 `<Img>` 组件；`Photo` / `ImageCard` / `GalleryImage` / `Frame` 的 `src` 也吃同一套前缀。

裸相对路径（上面的 `./assets/gpio.webp`）语义不变：相对**当前内容文件**，交给 Astro 原有图片管线。前端数据的 `cover` 同样接受三种前缀，也仍然接受 `image()` 的本地导入。

不要对普通 MDX `<img>` 期待自动图片优化：它的地址只有在带前缀时才会被改写，优化仍只发生在 Markdown 图片与 Astro 图片组件上。

下载链接转换到 `/content-assets/columns/<专栏>/assets/<文件>`，构建结束时输出对应文件；开发服务器提供同一路径。`assets/` 是**公开资源目录**，不要在其中放凭据或私人文件。隐藏文件、符号链接以及不在允许公开类型内的代码文件不会被作为下载资源发布。

## 草稿与错误

章节的 `draft: true` 表示该章不发布；入口的 `draft: true` 会让整个专栏及其章节不发布。已发布内容不能通过源文件链接指向草稿、草稿专栏或没有公开章节的入口。

缺少入口、双入口、重复内容 ID / URL、重复章节 `order`、遗留手写 `columnId`、缺失的源文件或本地资源都会明确报错。错误包含源文件路径；链接错误还包含行号。不要依靠“构建时只写日志但遗漏页面”的行为发布内容。

开发模式会共同刷新入口和章节集合：改标题、排序、草稿状态、链接目标，以及增删文件，都不需要为每个页面再维护一份内容缓存。错误修正后会重新加载。

## 已发布内容的兼容性

本次迁移保持全部既有文件名和公开 URL。章节集合内部 ID 现在包含专栏名，例如 `stm32/stm32-1`，但对外仍是 `/columns/stm32/stm32-1/`。不同专栏可以各有一篇 `introduction.md`，不会覆盖对方。

`src/config/legacy-post-ids.json` 记录迁移前的 77 篇章节身份，用来保留旧 `/post/<id>/` 跳转与 Artalk 评论 key。**新章节不需要加入这张迁移表**；其评论 key 会使用带专栏命名空间的身份，以避免重名碰撞。

历史章节的文件名或专栏目录改名会影响内容身份与地址。要改名或删除时，必须同时设计旧地址跳转和评论身份迁移，不要直接删掉映射来压掉校验错误。源码路径、集合 ID、公开 URL 和评论 key 是不同概念。

## 日常检查

```sh
pnpm content:check   # 目录、元数据关系与源文件相对链接
pnpm test:content    # 内容模型、相对链接、越界与冲突测试
pnpm verify          # 上述检查 + Astro 类型/构建 + 产物/链接/锚点/RSS 等审计
pnpm dev             # 本地写作预览
```

提交前运行 `pnpm verify`。它会同时覆盖相对链接和根路径链接，不再只检查以 `/` 开头的 href。

## 实现位置

`src/content-model/catalog.mjs` 定义目录身份与校验；`loader.ts` 适配 Astro 内容加载，保留 `getCollection('posts')` / `getCollection('columns')` 的现有消费接口；`relative-links.mjs` 使用 Markdown AST 转换链接；`integration.mjs` 负责开发刷新与公开资源输出。`scripts/content-output.mjs` 解析实际 HTML 并检查链接、锚点、发布页与历史跳转。图片前缀的实现在 `src/config/media.mjs` / `src/utils/media.mjs` / `src/plugins/media.mjs`，详见 [图片与静态资源](./media-rules.md)。

这次只改变作者的组织方式与内容处理链路，不改变此前的页面样式或阅读功能。
