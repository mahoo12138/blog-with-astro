/**
 * 给 Markdown / MDX 的代码块套一层外壳：顶部显示语言名 + 复制按钮。
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

function wrapCodeBlock(pre, languageLabel) {
	const shikiVars = hoistShikiThemeVars(pre);
	return {
		type: 'element',
		tagName: 'div',
		properties: { className: ['code-block'], ...(shikiVars ? { style: shikiVars } : {}) },
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
		],
	};
}

function transform(node) {
	const children = node?.children;
	if (!Array.isArray(children)) return;

	for (let i = 0; i < children.length; i += 1) {
		const child = children[i];
		if (!child) continue;

		// 命中代码块就替换，不再往下递归（pre 内部只有 code/span）
		if (child.type === 'element' && child.tagName === 'pre' && isCodeBlock(child)) {
			children[i] = wrapCodeBlock(child, formatLanguage(readLanguage(child)));
			continue;
		}
		// 递归条件是「有 children 数组」而不是 type === 'element'：
		// MDX 里 <div class="…"> 等 JSX 包裹在 hast 里是 mdxJsxFlowElement，
		// 只认 element 会把嵌在 JSX 结构里的代码块整棵跳过。
		if (Array.isArray(child.children)) transform(child);
	}
}

/**
 * rehype 插件：为代码块添加语言标签与复制按钮。
 * 用法：astro.config.mjs → markdown.rehypePlugins: [rehypeCodeBlock]
 */
export function rehypeCodeBlock() {
	return function (tree) {
		transform(tree);
	};
}

export default rehypeCodeBlock;
