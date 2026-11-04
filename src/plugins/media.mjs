import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { mediaConfig } from '../config/media.mjs';
import { classifyMediaUrl, isMediaRef, resolveMedia } from '../utils/media.mjs';

/**
 * 图片来源前缀的构建期落地。
 *
 * 分两段，各管一件事：
 *
 *   1. remarkMedia（mdast）—— 把 `store:` / `local:` 换成真实地址。
 *      Markdown 原生 `![]()`、引用式图片、MDX 里**字面写**的 `<img src>`，
 *      以及组件的图片 props（`src` / `cover` / `bg` / `bgImage`）都在这一层处理；
 *      组件内部还会再调一次 resolveMedia（对已解析的绝对地址是幂等的），
 *      两条路走同一个解析器，结果一致。
 *
 *   2. rehypeImageDefaults（hast）—— 给正文图片补 loading/decoding。
 *      Astro 渲染 Markdown 图片时不加任何 loading 属性，等于全页 eager（实测
 *      dist 里 `![](…)` 就是裸 `<img src>`）。这里补上 lazy/async，
 *      并把第一张标成 eager + fetchpriority=high：它基本就是首屏那张。
 *      显式写了 loading 的不覆盖。
 */

const CONTENT_FILE = /\.mdx?$/i;
/**
 * 组件上表达「这是一张图」的属性名。
 * 只收这几个固定含义的：src / cover / bg / bgImage（对应 Photo、ImageCard、Poster、
 * SiteCard、Audio、Banner、YoCard 等）。别把 icon、logo 这类可能被当作图标名的加进来。
 */
const MEDIA_ATTRIBUTES = new Set(['src', 'cover', 'bg', 'bgImage']);

/**
 * 改写一棵 mdast。
 *
 * @param {import('mdast').Root} tree
 * @param {{ file?: { path?: string }, root?: string, storeBase?: string, localRoot?: string }} [context]
 */
export function transformMediaTree(tree, context = {}) {
	const { file, root, storeBase, localRoot } = context;
	const imageDefinitions = new Set();
	const linkDefinitions = new Set();

	// 引用式图片 `![a][ref]` 的目标写在 definition 上，得先知道哪些 identifier 只服务图片。
	scan(tree);
	function scan(node) {
		if (node.type === 'imageReference') imageDefinitions.add(node.identifier);
		if (node.type === 'linkReference') linkDefinitions.add(node.identifier);
		for (const child of node.children ?? []) scan(child);
	}

	const rewrite = (value, node) => {
		if (typeof value !== 'string' || !isMediaRef(value)) return value;
		try {
			return resolveMedia(value, { root, storeBase, localRoot }).src;
		} catch (error) {
			const where = `${label(file)}:${node.position?.start?.line ?? '?'}`;
			const message = `[media] ${where} ${error.message}`;
			// 与 relative-links 一致：既挂到 vfile（渲染期能带出文件位置），也抛出（预检期直接中断）。
			file?.fail?.(message, node);
			throw new Error(message);
		}
	};

	visit(tree);
	function visit(node) {
		if (node.type === 'image') {
			node.url = rewrite(node.url, node);
		} else if (node.type === 'definition') {
			const onlyImage = imageDefinitions.has(node.identifier) && !linkDefinitions.has(node.identifier);
			if (onlyImage) node.url = rewrite(node.url, node);
		} else if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
			// MDX 里字面写的图片属性：`<img src>` 与组件的图片 props。
			// 组件内部仍会各自调 resolveMedia（对已解析的绝对地址是幂等的），
			// 这里提前改写是为了让「组件从 .astro 数据里拿到的 cover」也能带前缀。
			//
			// 例外是 <Img>：它就是「解析 + 打来源标记」的那一层，改写后组件只能看到
			// 一条绝对地址，data-media 会一律退化成 external。让它自己解析。
			if (typeof node.name === 'string' && node.name !== 'Img') {
				for (const attribute of node.attributes ?? []) {
					if (attribute.type !== 'mdxJsxAttribute' || typeof attribute.value !== 'string') continue;
					if (!MEDIA_ATTRIBUTES.has(attribute.name)) continue;
					if (node.name === 'a' || node.name === 'Link') continue;
					attribute.value = rewrite(attribute.value, node);
				}
			}
		}
		for (const child of node.children ?? []) visit(child);
	}
}

/** remark 插件：把前缀交给 resolveMedia 落地。 */
export function remarkMedia(options = {}) {
	return (tree, file) => {
		transformMediaTree(tree, {
			file,
			root: options.root,
			storeBase: options.storeBase,
			localRoot: options.localRoot,
		});
	};
}

/** rehype 插件：给正文图片补 loading/decoding/fetchpriority。 */
export function rehypeImageDefaults(options = {}) {
	const enabled = options.enabled ?? mediaConfig.lazyBodyImages;
	return (tree) => {
		if (!enabled) return;
		let seen = 0;
		walk(tree);
		function walk(node) {
			if (node.type === 'element' && node.tagName === 'img') apply(node);
			for (const child of node.children ?? []) walk(child);
		}
		function apply(node) {
			const properties = (node.properties ??= {});
			const first = seen === 0;
			seen += 1;
			if (properties.loading === undefined) properties.loading = first ? 'eager' : 'lazy';
			if (properties.decoding === undefined) properties.decoding = 'async';
			// fetchpriority 只对首图有意义：抬高 LCP，其余保持浏览器默认。
			if (first && properties.fetchPriority === undefined) properties.fetchPriority = 'high';
			// 前缀在这之前已经被换成真实地址了，来源只能按 base 反查；留着方便在 DOM 里确认走了哪条路。
			if (properties.dataMedia === undefined) {
				properties.dataMedia = classifyMediaUrl(/** @type {string} */ (properties.src), {
					storeBase: options.storeBase,
					localRoot: options.localRoot,
				});
			}
		}
	};
}

/**
 * 预检：扫一遍内容目录，把前缀写错 / 本地文件缺失在构建前就报出来。
 *
 * glob loader 会把渲染期异常吞成一行日志（relative-links 吃过这个亏），
 * 所以校验必须独立跑一遍，不能只依赖渲染。
 *
 * @param {string} [dir] 内容根目录（默认 src/content）
 * @param {{ root?: string }} [options]
 * @returns {number} 校验过的文件数
 */
export function validateContentMedia(dir = 'src/content', options = {}) {
	const files = walkFiles(path.resolve(dir));
	const plain = unified().use(remarkParse);
	const mdx = unified().use(remarkParse).use(remarkMdx);
	for (const file of files) {
		const content = parseFrontmatter(readFileSync(file, 'utf8'), { frontmatter: 'empty-with-lines' }).content;
		const tree = (file.endsWith('.mdx') ? mdx : plain).parse(content);
		transformMediaTree(tree, { file: { path: file }, root: options.root });
	}
	return files.length;
}

function label(file) {
	if (!file?.path) return '<unknown>';
	return path.relative(process.cwd(), file.path) || file.path;
}

function walkFiles(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
			walkFiles(full, out);
		} else if (CONTENT_FILE.test(entry.name)) {
			out.push(full);
		}
	}
	return out;
}
