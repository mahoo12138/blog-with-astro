// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { getContentCatalog } from './src/content-model/catalog.mjs';
import { remarkContentLinks } from './src/content-model/relative-links.mjs';
import { contentStructure } from './src/content-model/integration.mjs';
import { defineConfig } from 'astro/config';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { rehypeCodeBlock } from './src/plugins/rehype-code-block.mjs';
import { remarkMathGate } from './src/plugins/remark-math-gate.mjs';

// 数学公式只在 frontmatter 标了 mathjax: true 的文章里渲染。
//
// ⚠️ 这里**不能**再用「按 frontmatter 条件挂载插件」的写法（曾经有一个 whenMathjax 包装器）。
// remark-math 是处理器级 attacher：它把 $…$ 语法注册到 processor 上且不返回 transformer，
// 无法按文档启用。那个包装器用裸调用触发了 attacher，丢了 this，导致 remark-math 抛
// `Cannot read properties of undefined (reading 'data')`——异常被 glob loader 吞成一行
// `[ERROR] [glob-loader]`，同时**数学渲染全站静默失效**。
//
// 正确做法：语法无条件注册（remarkMath），再由 remarkMathGate 在解析之后按 frontmatter
// 决定保留还是把数学节点还原成原文。详见 src/plugins/remark-math-gate.mjs 顶部注释。

// Derive aliases lazily from the same content graph as the loaders.
// Filesystem relocation must not change existing canonical routes or index old redirect pages.

// 不参与搜索引擎收录的功能页 / 私人页（与页面上的 robots noindex 保持一致）
const SITEMAP_EXCLUDE = [/\/search\/?$/, /\/mdx-components\/?$/, /\/love\/?$/, /\/privacy\/?$/, /\/terms\/?$/];

/** @param {string} page */
function sitemapFilter(page) {
	const pathname = new URL(page).pathname;
	if (SITEMAP_EXCLUDE.some((pattern) => pattern.test(pathname))) {
		return false;
	}
	return !getContentCatalog().aliases.has(pathname.replace(/\/?$/, '/'));
}

// https://astro.build/config
export default defineConfig({
	output: 'static',
	site: 'https://mahoo12138.cn',
	integrations: [
		contentStructure(),
		mdx(),
		react(),
		sitemap({
			filter: sitemapFilter,
		}),
		pagefind(),
	],
	markdown: {
		// remarkMath 无条件挂载（语法必须始终注册，见文件顶部说明）；
		// remarkMathGate 负责把「非 mathjax 文章」的数学节点还原回原文。
		remarkPlugins: [remarkMath, remarkMathGate, remarkContentLinks],
		// rehypeCodeBlock 给代码块套外壳（语言标签 + 复制按钮 + 超高折叠栏）。
		// 它无条件执行，且依赖 Shiki 已跑完 —— Astro 的管线里 rehypeShiki
		// 本就在用户 rehypePlugins 之前，所以拿到的是带 data-language 的高亮结果。
		// 详见 src/plugins/rehype-code-block.mjs 顶部注释。
		//
		// maxHeight 是折叠后代码区的高度上限（px）：超过它就默认收起，
		// 底部出现「展开全部 / 收起」折叠栏。想全站放宽或收紧改这一处即可；
		// 改了记得同步 src/styles/codeBlock.css.ts 里 --code-fold-h 的回退值
		// （只有运行期才生成的折叠块会用到它，正常渲染的块由内联变量覆盖）。
		//
		// rehypeKatex 可以无条件挂载：经过 remarkMathGate 之后，只有 mathjax: true
		// 的文章里还存在数学节点，其余文章已经没有可渲染的数学节点了。
		rehypePlugins: [rehypeKatex, [rehypeCodeBlock, { maxHeight: 420 }]],
		shikiConfig: {
			// 双主题（light + dark）时 Shiki 会为每个 token 输出
			//   style="color:#xxx;--shiki-dark:#yyy"
			// 即每个 token 内联两份颜色。这是代码块密集页面 HTML 偏大的主因，
			// 但它同时是「零 JS、无闪烁、跟随 data-theme」的最省事方案。
			//
			// 实测过 themes + defaultColor:false（纯 css-variables 模式）：token 变成
			//   style="--shiki-light:#xxx;--shiki-dark:#yyy;--shiki-light-bg:...;--shiki-dark-bg:..."
			// 每个 token 要带 4 个变量名，比双色值更长，页面上反而增大 ~10%（565KB → 619KB）。
			//
			// 真正能显著缩小体积的做法是「按需高亮 + 单主题」，代价是暗色模式代码配色不再独立。
			// 这里选择保留双主题：体积换体验，且 HTML 已在 gzip 后大幅收敛。
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
			langAlias: {
				C: 'c',
				Kotlin: 'kotlin',
				ejs: 'html',
				env: 'dotenv',
				error: 'plaintext',
				react: 'jsx',
				ty: 'plaintext',
			},
			wrap: true,
		},
	},
	// 生产构建（build/preview/check）使用短 class identifier 减小 HTML/CSS 体积；
	// 开发（dev）保留 debug identifier 便于在 DOM 里定位样式来源。
	// 注：astro.config 在命令解析前求值，这里通过 argv 区分 dev 与其余命令。
	vite: {
		plugins: [vanillaExtractPlugin({ identifiers: process.argv[2] === 'dev' ? 'debug' : 'short' })],
	},
});
