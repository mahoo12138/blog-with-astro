/**
 * 给 Markdown / MDX 的代码块套一层外壳：顶部语言名 + 复制按钮，
 * 过高的代码块底部再加一条折叠栏（展开 / 收起）。
 *
 * ## 为什么用 rehype 插件而不是别的做法
 *
 * 1. **执行时机可靠**。Astro 的 markdown 管线里 `rehypeShiki` 先跑，
 *    用户 rehypePlugins 后跑（见 @astrojs/markdown-remark/dist/index.js:
 *    `parser.use(rehypeShiki, ...)` 在 `for (const [plugin] of loadedRehypePlugins)`
 *    之前）。所以这里拿到的一定是**已经高亮完**的
 *    `<pre class="astro-code" data-language="bash">`，语言和 token 都就绪。
 *
 * 2. **构建期产出语言标签**。语言名属于语义内容，放进 HTML 就没有闪烁、
 *    没有布局抖动、关掉 JS 也能看到。复制按钮是纯交互，靠 JS 激活。
 *
 * 3. **体积**：实测全站 1324 个代码块，外壳约 175 字节/个 ≈ 230KB（未压缩）。
 *    这部分高度重复，gzip/brotli 后几乎可忽略。
 *
 * ## 刻意不做的事
 *
 * - **不把代码文本塞进 `data-copy-value` 属性**。站内已有的 Copy.astro 是这么做的，
 *   但那会让每个代码块的内容在 HTML 里存两份，对 1324 个代码块是灾难。
 *   这里改由点击时读取 `pre > code` 的 textContent。
 * - **不做行号**。会让复制行为和选中体验变复杂，且不是当前需求。
 */

/**
 * ── 超高代码块折叠 ────────────────────────────────────────────────
 *
 * 折叠高度由 `rehypeCodeBlock({ maxHeight })` 配（单位 px，见 astro.config.mjs）。
 * 超过上限的块在构建期就带上 `data-code-fold` 并渲染底部折叠栏，
 * 折叠态本身是纯 CSS（`html.has-js` 下才生效），所以：
 *
 * 1. **首屏就是折叠态**。数据与结构都在 HTML 里，不需要等 JS 建 DOM，
 *    不会出现「先整段摊开、再刷地收起来」。
 * 2. **无 JS 时完全不折叠**。裁剪规则挂在 `html.has-js` 上，脚本没跑
 *    就保持完整展开 —— 绝不留下「截断了但点不开」的死路。
 *
 * 构建期只做**估算**：真实行高会随字体、浏览器缩放、窄屏换行变化，
 * 没法在构建期算准，所以判定阈值用固定行高近似，宁肯多标几个块。
 * 运行期 public/js/code-block-fold.js 会用真实 `scrollHeight` 复核：
 * 不溢出的撤掉折叠、只有窄屏换行才溢出的补上折叠（含补建折叠栏）。
 * 多标的代价只是一次不产生绘制的属性调整。
 */

/** 语言显示名。key 一律小写；查不到时回退到首字母大写。 */
const LANGUAGE_LABELS = {
	js: 'JavaScript',
	javascript: 'JavaScript',
	jsx: 'JSX',
	react: 'React',
	ts: 'TypeScript',
	typescript: 'TypeScript',
	tsx: 'TSX',
	bash: 'Shell',
	sh: 'Shell',
	shell: 'Shell',
	zsh: 'Shell',
	console: 'Shell',
	powershell: 'PowerShell',
	ps1: 'PowerShell',
	c: 'C',
	cpp: 'C++',
	'c++': 'C++',
	csharp: 'C#',
	cs: 'C#',
	java: 'Java',
	kotlin: 'Kotlin',
	dart: 'Dart',
	python: 'Python',
	py: 'Python',
	go: 'Go',
	golang: 'Go',
	rust: 'Rust',
	rs: 'Rust',
	css: 'CSS',
	scss: 'SCSS',
	sass: 'Sass',
	less: 'Less',
	stylus: 'Stylus',
	html: 'HTML',
	xml: 'XML',
	ejs: 'EJS',
	vue: 'Vue',
	svelte: 'Svelte',
	yaml: 'YAML',
	yml: 'YAML',
	toml: 'TOML',
	ini: 'INI',
	json: 'JSON',
	json5: 'JSON5',
	jsonc: 'JSONC',
	markdown: 'Markdown',
	md: 'Markdown',
	mdx: 'MDX',
	mermaid: 'Mermaid',
	nginx: 'Nginx',
	apache: 'Apache',
	dockerfile: 'Dockerfile',
	docker: 'Dockerfile',
	makefile: 'Makefile',
	sql: 'SQL',
	graphql: 'GraphQL',
	diff: 'Diff',
	patch: 'Diff',
	env: 'Env',
	dotenv: 'Env',
	// 这些在 astro.config.mjs 的 langAlias 里被映射到 plaintext / html，
	// 但显示时用作者原本写的名字更有信息量。
	plaintext: 'Text',
	plain: 'Text',
	text: 'Text',
	txt: 'Text',
	ty: 'Text',
	error: 'Text',
};

const COPY_LABEL = '复制';

/** 折叠栏文案。展开后由 JS 改成 COLLAPSED_LABEL 的反向值。 */
export const FOLD_LABELS = { collapsed: '展开全部', expanded: '收起' };

/**
 * 构建期判定折叠用的近似值（对应 src/layouts/BlogPost.css.ts 与
 * src/styles/codeBlock.css.ts 里代码区的真实排版）：
 *   pre > code  font-size 0.9rem → 14.4px，line-height 1.65 → 23.76px/行
 *   pre 上下 padding 各 1rem → 32px
 * 这两个数字只影响「要不要标 data-code-fold」，偏差由运行期复核兜住。
 */
const LINE_HEIGHT_PX = 24;
const CODE_PADDING_PX = 32;
/** 折叠高度的默认值。与 codeBlock.css.ts 里 `--code-fold-h` 的回退值保持一致。 */
export const DEFAULT_MAX_HEIGHT = 420;

/**
 * 取代码块的原始语言标识。
 * 优先 `data-language`（Shiki 处理后写入），回退到 `language-*` class（未高亮时）。
 */
function readLanguage(node) {
	const props = node.properties ?? {};
	if (typeof props.dataLanguage === 'string' && props.dataLanguage) return props.dataLanguage;

	const classNames = props.className;
	if (Array.isArray(classNames)) {
		for (const name of classNames) {
			if (typeof name === 'string' && name.startsWith('language-')) {
				return name.slice('language-'.length);
			}
		}
	}
	return '';
}

/** 语言标识 → 展示名。查不到就首字母大写，保持可读。 */
function formatLanguage(raw) {
	const key = raw.toLowerCase();
	const mapped = LANGUAGE_LABELS[key];
	if (mapped) return mapped;
	if (!raw) return 'Text';
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function isCodeBlock(node) {
	const props = node.properties ?? {};
	if (typeof props.dataLanguage === 'string') return true;
	const classNames = props.className;
	if (!Array.isArray(classNames)) return false;
	return classNames.some(
		(name) => typeof name === 'string' && (name === 'astro-code' || name.startsWith('language-')),
	);
}

/**
 * 包一层外壳：
 *   <div class="code-block">
 *     <div class="code-block__bar">
 *       <span class="code-block__lang">Shell</span>
 *       <button class="code-block__copy" data-code-copy aria-label="复制 Shell 代码">复制</button>
 *     </div>
 *     <pre …>…</pre>
 *   </div>
 *
 * 用 div 而不是 figure/figcaption：这一栏是 UI 装饰而非「描述内容的图注」，
 * 用 figcaption 会被当成 figure 的可访问名，反而干扰朗读。
 *
 * 顶部栏带 data-pagefind-ignore：这一栏是界面元素，不是文章正文。
 * 不排除的话，全站 1326 个「复制」按钮会把「复制」变成每篇技术文章的
 * 搜索命中词，语言名 likewise —— 搜 JavaScript 会命中所有贴了 JS 示例的文章。
 */
/**
 * 把 Shiki 写在 pre 行内样式里的主题色提升到外壳上。
 *
 * Shiki 双主题输出形如 `style="background-color:#fff;--shiki-dark-bg:#24292e"`，
 * 自定义属性只向下继承 —— 父级 .code-block 读不到子级 pre 上的
 * --shiki-dark-bg，`var(--shiki-dark-bg, …)` 会永远走回退值。提升到外壳后，
 * 外壳底色才能真正跟随文章所用的 Shiki 主题（明暗切换同色不割裂）。
 */
function hoistShikiThemeVars(pre) {
	const style = pre?.properties?.style;
	if (typeof style !== 'string' || !style) return '';
	const out = [];
	const lightBg = /(?:^|;)\s*background-color\s*:\s*([^;]+)/i.exec(style);
	if (lightBg) out.push(`--shiki-light-bg:${lightBg[1].trim()}`);
	const darkBg = /(?:^|;)\s*--shiki-dark-bg\s*:\s*([^;]+)/i.exec(style);
	if (darkBg) out.push(`--shiki-dark-bg:${darkBg[1].trim()}`);
	return out.join(';');
}

/** 收集 hast 里的纯文本（只在统计行数时用，量级很小）。 */
function collectText(node) {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(collectText).join('');
}

/**
 * 逻辑行数 = Shiki 输出的 `.line` 个数。
 * 没走高亮（或高亮失败）时没有 .line 包装，退回数文本里的换行。
 */
function countCodeLines(pre) {
	const code = (pre.children ?? []).find(
		(child) => child.type === 'element' && child.tagName === 'code',
	);
	if (!code) return 0;

	let lines = 0;
	for (const child of code.children ?? []) {
		const classNames = child?.properties?.className;
		if (Array.isArray(classNames) && classNames.includes('line')) lines += 1;
	}
	if (lines > 0) return lines;
	return collectText(code).split('\n').length;
}

/**
 * 底部折叠栏。
 *
 * 用 `<button>` 而不是 div + click：键盘 Tab / Enter / 空格天然可用，
 * aria-expanded 让读屏软件知道当前是展开还是收起。
 * 整条宽度可点（样式侧 flex + width:100%），比一个小按钮好按得多。
 *
 * 带 data-pagefind-ignore：和顶部栏同理，这是界面元素不是正文，
 * 否则「展开全部」会进入全站搜索索引、变成每篇技术文章的高频命中词。
 */
function foldFooterNode() {
	return {
		type: 'element',
		tagName: 'button',
		properties: {
			className: ['code-block__fold'],
			type: 'button',
			'data-code-fold-toggle': '',
			'data-pagefind-ignore': '',
			'aria-expanded': 'false',
		},
		children: [
			{
				type: 'element',
				tagName: 'span',
				properties: { className: ['code-block__fold-label'] },
				children: [{ type: 'text', value: FOLD_LABELS.collapsed }],
			},
		],
	};
}

function wrapCodeBlock(pre, languageLabel, { maxHeight = DEFAULT_MAX_HEIGHT } = {}) {
	const shikiVars = hoistShikiThemeVars(pre);
	const foldable = countCodeLines(pre) * LINE_HEIGHT_PX + CODE_PADDING_PX > maxHeight;
	const style = [
		shikiVars,
		// 折叠高度随块下发：站点可在 astro.config 里改一处，全站生效，
		// 不必为每个块单独维护；样式表里的同值回退只兜非构建期生成的块。
		foldable ? `--code-fold-h:${maxHeight}px` : '',
	]
		.filter(Boolean)
		.join(';');

	return {
		type: 'element',
		tagName: 'div',
		properties: {
			className: ['code-block'],
			...(foldable ? { 'data-code-fold': '' } : {}),
			...(style ? { style } : {}),
		},
		children: [
			{
				type: 'element',
				tagName: 'div',
				properties: { className: ['code-block__bar'], 'data-pagefind-ignore': '' },
				children: [
					{
						type: 'element',
						tagName: 'span',
						properties: { className: ['code-block__lang'] },
						children: [{ type: 'text', value: languageLabel }],
					},
					{
						type: 'element',
						tagName: 'button',
						properties: {
							className: ['code-block__copy'],
							type: 'button',
							// 不要写成 data-copy-value：那会把整段代码再存一份到 HTML
							'data-code-copy': '',
							'aria-label': `复制 ${languageLabel} 代码`,
						},
						children: [{ type: 'text', value: COPY_LABEL }],
					},
				],
			},
			pre,
			...(foldable ? [foldFooterNode()] : []),
		],
	};
}

function transform(node, options) {
	const children = node?.children;
	if (!Array.isArray(children)) return;

	for (let i = 0; i < children.length; i += 1) {
		const child = children[i];
		if (!child) continue;

		// 命中代码块就替换，不再往下递归（pre 内部只有 code/span）
		if (child.type === 'element' && child.tagName === 'pre' && isCodeBlock(child)) {
			children[i] = wrapCodeBlock(child, formatLanguage(readLanguage(child)), options);
			continue;
		}
		// 递归条件是「有 children 数组」而不是 type === 'element'：
		// MDX 里 <div class="…"> 等 JSX 包裹在 hast 里是 mdxJsxFlowElement，
		// 只认 element 会把嵌在 JSX 结构里的代码块整棵跳过。
		if (Array.isArray(child.children)) transform(child, options);
	}
}

/**
 * rehype 插件：为代码块添加语言标签、复制按钮与超高折叠栏。
 * 用法：astro.config.mjs → markdown.rehypePlugins: [rehypeCodeBlock]
 *
 * @param {{ maxHeight?: number }} [options]
 *   `maxHeight`：代码区最大高度（px），超出即折叠。默认 420。
 *   这不是硬上限，而是「折叠态的高度」——展开后代码完整显示。
 */
export function rehypeCodeBlock(options = {}) {
	const maxHeight =
		Number.isFinite(options?.maxHeight) && options.maxHeight > 0
			? Math.round(options.maxHeight)
			: DEFAULT_MAX_HEIGHT;

	return function (tree) {
		transform(tree, { maxHeight });
	};
}
export default rehypeCodeBlock;
