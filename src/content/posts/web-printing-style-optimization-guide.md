---
title: 别让导出的简历排版崩掉：CSS 打印与 PDF 导出踩坑实录
date: 2025-04-06 22:48:43
categories:
- 技术教程
---

最近在重构个人简历（职业生涯的 V3 版本）。这次我想直接做成在线网页，同时利用浏览器的原生打印（`Cmd + P` / 保存为 PDF）一键生成投递用的 PDF 文档。

思路很美好，但第一次在浏览器里按下打印预览时，效果一塌糊涂：导航栏和底部版权赫然在列、精心搭配的背景色被全数吞掉、一段经历刚好被横切截断在两页纸中间……

日常写样式我们习惯了面向各种尺寸的屏幕，但“纸张”是一个完全不同的输出媒介。梳理了一遍打印优化的细节，整理出这套实用的适配清单。

## 1. 基础中的基础：隔离打印样式

通过 `@media print` 可以让样式只在打印和 PDF 导出时生效，不影响正常的网页展示：

```css
@media print {
  /* 隐藏不需要打印的屏幕端组件 */
  header,
  footer,
  nav,
  .action-buttons,
  .no-print {
    display: none !important;
  }

  body {
    background: transparent;
    color: #111;
  }
}
```

## 2. 踩坑重点：背景色和图形被浏览器过滤

很多人第一次打 PDF 都会发现：**明明写了背景色或带底色的标签，打印预览里全变成白的了。**

这是浏览器的节能默认策略（为了给用户省墨水）。如果要强制保留背景色、渐变和边框阴影，必须显式声明 `print-color-adjust`：

```css
@media print {
  * {
    -webkit-print-color-adjust: exact; /* Safari / Chromium 旧前缀 */
    print-color-adjust: exact;         /* 现代标准规范 */
  }
}
```

## 3. 控制纸张与边距：@page 规则

在屏幕上我们习惯用视口单位或响应式容器，而打印时你需要直接跟物理纸张对话。通过 `@page` 可以固定纸张尺寸和页边距：

```css
@page {
  size: A4 portrait; /* A4 竖向；横向可用 landscape */
  margin: 1.5cm 1.2cm; /* 留出合适的装订/打印物理边距 */
}
```

> **提示**：如果希望每页顶部或底部不要出现浏览器默认自带的“打印日期、页面标题和 URL”，可以在打印弹窗里关掉“页眉和页脚”，或者把 `@page` 的 margin 适当调紧。

## 4. 避免内容被腰斩：优雅分页

最影响排版专业感的，就是一张表格、一段项目经历或者一段代码刚好跨页被切成两半。

以前大家常用 `page-break-*`，但在现代 CSS 规范中，更推荐使用语义更明确的 `break-*` 属性（主流浏览器均已良好支持）：

```css
/* 避免模块内部被分页截断 */
.resume-section-item,
table,
figure,
pre {
  break-inside: avoid;
}

/* 强制在大章节前另起一页 */
.page-break-before {
  break-before: page;
}

/* 标题千万不要留在上一页页脚（孤行控制） */
h2, h3 {
  break-after: avoid;
}
```

## 5. 打印状态下的超链接处理

纸质稿或导出的静态 PDF 里，超链接没法像网页那样随手点开。如果内容包含重要外链，可以借助伪元素把目标地址打出来：

```css
@media print {
  /* 只对真正的外部链接生效，忽略 # 锚点和 JavaScript 假链接 */
  a[href^="http"]:not(.no-print-url)::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #666;
  }
}
```

如果是在简历场景，作品集或 GitHub 链接可以直接用这种方式展示，面试官看纸质版时也能知道具体地址。

## 6. 避开跨页布局的兼容性坑

尽管现代浏览器在打印时对 Flexbox 和 Grid 的支持改善了不少，但**只要涉及到跨页断开，Flex/Grid 子元素的排版依旧容易出现高度塌陷或内容重叠**。

针对需要纵向跨页的长列表，打印模式下退回传统的块级流动布局反而最稳妥：

```css
@media print {
  .two-column-layout {
    display: block !important;
  }
}
```

## 7. 调试技巧：不用每次都按 Cmd + P

频繁按打印快捷键看弹窗效率很低，Chrome / Edge 开发者工具自带打印模式模拟：

1. 按 `F12` 打开 DevTools；
2. 按 `Cmd + Shift + P`（Windows 为 `Ctrl + Shift + P`）打开命令菜单；
3. 输入 `Rendering` 并回车，打开渲染面板；
4. 找到 **Emulate CSS media type**，下拉选择 **print**。

此时页面会直接实时渲染 `@media print` 样式，修改 CSS 就能即时热更新查看效果，调完再开真实打印弹窗校准分页即可。