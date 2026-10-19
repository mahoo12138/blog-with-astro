#!/usr/bin/env node
/**
 * 构建产物体检脚本：对 dist/ 做正面断言，把「改坏了也不会报错、只会悄悄退化」的约定固定下来。
 *
 * 目前 11 组断言：
 *   1. 站内链接可达性（扫描 dist HTML 内部 href，断言目标存在）
 *   2. 图片体积预算（单文件不超过 200KB）
 *   3. dist 总量预算
 *   4. 关键隐私/收录断言（love 页不出现在索引与 sitemap）
 *   5. 无障碍断言（每页都存在 skip-link 与 #main-content 落点、有且仅有一个 h1）
 *   6. 代码块增强断言（每个代码块都套了外壳、页面引入了复制脚本、复制脚本带 ClientRouter 续期）
 *   7. 专栏分流断言（章节旧地址只能是跳转桩页、桩页跳转目标必须存在、博客流最多一条专栏链接、
 *      桩页不得进入搜索索引、RSS 只含独立文章）
 *   8. 内容卫生断言（分类词表口径、文件名不可见字符、已发布空正文）
 *   9. 模板泄漏断言（`{expr}` 不得作为字面文本出现在 HTML 里）
 *  10. 数学渲染断言（标了 mathjax 的必须渲染出 KaTeX；没标的不得出现 KaTeX）
 *  11. 报告
 *
 * 每加一条断言都应做**有效性自检**：人为制造一次违规、确认审计真的报错，再还原。
 * 否则很容易写出「永远通过」的假护栏（本项目已实测过若干次这种自检）。
 *
 * 用法: node scripts/audit-dist.mjs [--budget-mb=15] [--image-kb=200] [--dist=./dist]
 * 退出码非 0 表示有断言失败，可直接用于 CI。整体验证走 `pnpm verify`。
 *
 * `--dist` 用于**护栏有效性自检**：把审计指向一份合成的产物目录，
 * 人为制造一次违规，确认审计真的报错（本项目已实测过若干次这种自检）。
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContentCatalog } from '../src/content-model/catalog.mjs';
import { auditContentOutput } from './content-output.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [k, v] = arg.replace(/^--/, '').split('=');
		return [k, v];
	}),
);

// 默认仍是真实产物目录；`--dist` 只服务于护栏自检，不影响 src/ 的读取
const dist = path.resolve(root, args.dist ?? 'dist');
/**
 * 体积预算。
 *
 * dist 总量的主要构成是文章 HTML（约 250 页 / 约 15MB），
 * 而其中大头是 Shiki 为每个 token 内联的 light+dark 双份色值。
 * 这个量级由「代码块密集的教程文章有多少」决定，不是配置能压下去的，
 * 所以预算按实测基线设成「不许继续恶化」的护栏，而不是理想值。
 *
 * - TOTAL_BUDGET_MB：实测基线约 18.4MB（2026-09），留少量余量作为回归护栏
 * - IMAGE_BUDGET_KB：单张图片硬上限，这才是真正能靠工程手段守住的线
 *
 * 注意：页面数会随内容变化（分类/标签增删、文章草稿化都会改变页数），
 * 所以这里只按体积设护栏，**不要**把具体页数写死成断言。
 */
const BUDGET_MB = Number(args['budget-mb'] ?? 19);
const IMAGE_KB = Number(args['image-kb'] ?? 200);

if (!existsSync(dist)) {
	console.error('✗ dist/ 不存在，请先运行 pnpm build');
	process.exit(1);
}

/** 递归收集文件 */
async function walk(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await walk(full)));
		else out.push(full);
	}
	return out;
}

const files = await walk(dist);
const failures = [];
const warnings = [];

/* ---------- 1. 体积统计 ---------- */
let totalBytes = 0;
const byExt = new Map();
const oversizedImages = [];

for (const file of files) {
	const info = await stat(file);
	totalBytes += info.size;
	const ext = path.extname(file).toLowerCase();
	const bucket = byExt.get(ext) ?? { count: 0, bytes: 0 };
	bucket.count += 1;
	bucket.bytes += info.size;
	byExt.set(ext, bucket);

	if (['.png', '.jpg', '.jpeg'].includes(ext) && info.size > IMAGE_KB * 1024) {
		oversizedImages.push({ file: path.relative(dist, file), size: info.size });
	}
}

const totalMb = totalBytes / 1024 / 1024;
if (totalMb > BUDGET_MB) {
	failures.push(`dist 总量 ${totalMb.toFixed(1)}MB 超过预算 ${BUDGET_MB}MB`);
}
if (oversizedImages.length) {
	for (const { file, size } of oversizedImages) {
		failures.push(`图片超出预算 ${IMAGE_KB}KB: ${file} (${(size / 1024).toFixed(0)}KB) — 建议走 Astro 图片管线`);
	}
}

/* ---------- 2. 站内链接可达性 ---------- */
const htmlFiles = files.filter((f) => f.endsWith('.html'));
/** 把一个站内 URL 解析为期望存在的 dist 路径集合 */
function candidateTargets(urlPath) {
	const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
	const trimmed = clean.replace(/^\/+/, '');
	if (trimmed === '') return [path.join(dist, 'index.html')];
	const base = path.join(dist, trimmed);
	return [
		path.join(base, 'index.html'), // 目录式路由 /foo/ -> foo/index.html
		base,                          // 精确文件 /rss.xml, /favicon.svg
		`${base}.html`,                // 无扩展名的 page -> page.html
	];
}

/**
 * 剥离 <pre>...</pre>（含内部 <code>）后再扫描链接。
 * 代码块里的 href="..." 是文章正文的代码示例（例如教程里贴的 Hexo 配置片段），
 * 不是真实导航链接，扫描时必须排除，否则会产生大量误报。
 */
function stripCodeBlocks(html) {
	return html.replace(/<pre\b[\s\S]*?<\/pre>/gi, '');
}

const seen = new Set();
const brokenLinks = new Map();

// 只扫描页面自身的内部链接。跳过 pagefind（其内部片段含相对路径噪音）。
const skipDirs = ['pagefind'];

for (const file of htmlFiles) {
	const rel = path.relative(dist, file);
	if (skipDirs.some((d) => rel.startsWith(d))) continue;

	const html = stripCodeBlocks(await readFile(file, 'utf8'));
	const hrefRe = /href="([^"]+)"/g;
	let m;
	while ((m = hrefRe.exec(html))) {
		const href = m[1];
		// 只检查站内绝对路径
		if (!href.startsWith('/') || href.startsWith('//')) continue;
		// 跳过含模板语法 / HTML 残留的伪链接
		if (/\$\{|\{\{|<\/?span/i.test(href)) continue;
		// 跳过静态资源与常见非页面资源
		if (/^\/(_astro|pagefind|fonts)\//.test(href)) continue;
		if (/\.(css|js|mjs|json|xml|xsl|svg|ico|png|jpe?g|webp|avif|woff2?|ttf|mp3|mp4|txt|pdf)$/i.test(href)) {
			// 这些仍然要求存在，但用精确匹配
			const target = path.join(dist, decodeURIComponent(href.split('?')[0].replace(/^\/+/, '')));
			if (!existsSync(target)) {
				const key = `${href}`;
				if (!brokenLinks.has(key)) brokenLinks.set(key, { href, from: rel });
			}
			continue;
		}

		const key = href;
		if (seen.has(`${rel}::${key}`)) continue;
		seen.add(`${rel}::${key}`);

		const ok = candidateTargets(href).some((t) => existsSync(t));
		if (!ok && !brokenLinks.has(key)) {
			brokenLinks.set(key, { href, from: rel });
		}
	}
}

if (brokenLinks.size) {
	failures.push(`发现 ${brokenLinks.size} 条站内死链:`);
	for (const { href, from } of [...brokenLinks.values()].slice(0, 20)) {
		failures.push(`    ${href}  ←  ${from}`);
	}
}

/* ---------- 3. 隐私 / 收录断言 ---------- */
const loveHtml = path.join(dist, 'love', 'index.html');
if (existsSync(loveHtml)) {
	const love = await readFile(loveHtml, 'utf8');
	if (!/name="robots"\s+content="noindex/.test(love)) {
		failures.push('/love/ 缺少 robots noindex');
	}
	if (!/data-pagefind-ignore/.test(love)) {
		failures.push('/love/ 缺少 data-pagefind-ignore（私人内容会被站内搜索检索）');
	}
}

const sitemapFiles = files.filter((f) => /sitemap-\d+\.xml$/.test(f));
if (sitemapFiles.length) {
	const all = (await Promise.all(sitemapFiles.map((f) => readFile(f, 'utf8')))).join('');
	for (const path_ of ['/love/', '/search/', '/mdx-components/', '/privacy/', '/terms/']) {
		if (all.includes(`<loc>https://mahoo12138.cn${path_}</loc>`)) {
			failures.push(`sitemap 仍包含功能页: ${path_}`);
		}
	}
}

/* ---------- 4. 无障碍断言 ---------- */
/**
 * skip-link 属于「加了但容易在后续改版里悄悄丢掉」的那类修复：
 * 没有任何视觉反馈，一旦被删掉谁也不会发现。
 * 这里对每个 HTML 页面断言两件事：
 *   a) 存在指向 #main-content 的跳转链接
 *   b) 文档里确实有 id="main-content" 的落点（否则锚点会静默失效）
 * 404 等无 Shell 的页面不在此列，所以只检查同时出现 <main 的页面。
 */
const skipLinkPages = [];
for (const file of htmlFiles) {
	const rel = path.relative(dist, file);
	if (skipDirs.some((d) => rel.startsWith(d))) continue;
	const html = await readFile(file, 'utf8');
	// 只对使用了 Shell（含 <main>）的页面生效
	if (!/<main\b/i.test(html)) continue;
	const hasLink = /href="#main-content"/.test(html);
	const hasAnchor = /id="main-content"/.test(html);
	if (!hasLink || !hasAnchor) {
		skipLinkPages.push(`${rel}${!hasLink ? ' 缺 skip-link' : ''}${!hasAnchor ? ' 缺 #main-content' : ''}`);
	}
}
if (skipLinkPages.length) {
	failures.push(`skip-link 断言失败 ${skipLinkPages.length} 页:`);
	for (const p of skipLinkPages.slice(0, 10)) failures.push(`    ${p}`);
}

/* ---------- 5. 标题大纲断言 ---------- */
/**
 * 每个渲染了 <main> 的页面都应有且仅有一个 <h1>。
 * 无 h1 → 读屏无法定位页面主题（axe: page-has-heading-one）；
 * 多个 h1 → 大纲出现多个根节点，同样破坏导航。
 * 多个 h1 通常来自 Markdown 正文里手写的 `# 标题`。
 *
 * 例外：/post/ 是 301 跳转桩页，不含 <main>，天然不参与此断言。
 */
const noH1 = [];
const multiH1 = [];
for (const file of htmlFiles) {
	const rel = path.relative(dist, file);
	if (skipDirs.some((d) => rel.startsWith(d))) continue;
	const html = stripCodeBlocks(await readFile(file, 'utf8'));
	if (!/<main\b/i.test(html)) continue;
	const count = (html.match(/<h1[\s>]/gi) ?? []).length;
	if (count === 0) noH1.push(rel);
	else if (count > 1) multiH1.push(`${rel} (${count} 个)`);
}
if (noH1.length) {
	failures.push(`以下页面缺少 <h1>（共 ${noH1.length} 页）:`);
	for (const p of noH1.slice(0, 10)) failures.push(`    ${p}`);
}
if (multiH1.length) {
	failures.push(`以下页面有多个 <h1>（共 ${multiH1.length} 页，通常是正文手写了 \`# 标题\`）:`);
	for (const p of multiH1.slice(0, 10)) failures.push(`    ${p}`);
}

/* ---------- 6. 代码块增强断言 ---------- */
/**
 * rehype-code-block 插件给每个代码块套外壳（语言标签 + 复制按钮）。
 * 它是靠 astro.config.mjs 的 markdown.rehypePlugins 接进来的，
 * 一旦被误删，页面不会报错、只会「悄悄变回没有语言名的裸代码块」，
 * 所以这里断言两条：
 *   a) 每个 pre.astro-code 都被 .code-block 包住（插件确实跑了）
 *   b) 每个有代码块的页面都引用了复制脚本（否则按钮点了没反应）
 */
const unwrapped = [];
const missingScript = [];
for (const file of htmlFiles) {
	const rel = path.relative(dist, file);
	if (skipDirs.some((d) => rel.startsWith(d))) continue;
	const html = await readFile(file, 'utf8');
	const preCount = (html.match(/<pre class="astro-code/g) ?? []).length;
	if (preCount === 0) continue;

	const wrapperCount = (html.match(/<div class="code-block">/g) ?? []).length;
	if (wrapperCount !== preCount) {
		unwrapped.push(`${rel}（pre ${preCount} 个 / 外壳 ${wrapperCount} 个）`);
	}
	if (!html.includes('/js/code-copy.js')) {
		missingScript.push(rel);
	}
}
if (unwrapped.length) {
	failures.push(`代码块未套外壳（rehype-code-block 可能未被加载）${unwrapped.length} 页:`);
	for (const p of unwrapped.slice(0, 10)) failures.push(`    ${p}`);
}
if (missingScript.length) {
	failures.push(`有代码块但未引入 /js/code-copy.js ${missingScript.length} 页:`);
	for (const p of missingScript.slice(0, 10)) failures.push(`    ${p}`);
}

/**
 * c) 复制按钮的显示由 `<html class="has-js">` 控制，而 ClientRouter 换页时
 *    Astro 会把当前 <html> 的属性**逐个删掉**再套用新文档的
 *    （node_modules/astro/dist/transitions/swap-functions.js 的 swapRootAttributes），
 *    新文档的 <html> 是 `<html lang="zh-CN">`、从不带 has-js。
 *
 *    于是 code-copy.js 里那段 `astro:before-swap` 续期逻辑就成了按钮的命门：
 *    少了它，整页刷新一切正常、从首页/归档点进文章按钮却凭空消失 ——
 *    这正是本项目踩过的坑，而且纯静态断言看不出画面差异，只能靠源码特征守住。
 */
const copyScriptPath = path.join(dist, 'js', 'code-copy.js');
if (!existsSync(copyScriptPath)) {
	failures.push('产物缺少 js/code-copy.js（复制按钮的行为脚本）');
} else if (!(await readFile(copyScriptPath, 'utf8')).includes('astro:before-swap')) {
	failures.push(
		'js/code-copy.js 缺少 astro:before-swap 续期：ClientRouter 切页会清空 <html> 的 class，复制按钮会在客户端跳转后消失',
	);
}

/* ---------- 7. 专栏分流断言 ---------- */
/**
 * 博客与专栏分流之后，有三条约束是「改坏了也不会报错、只会悄悄退化」的：
 *
 *   a) 专栏章节的旧地址 /post/<id>/ 必须只是跳转桩页（不含 <main>）。
 *      如果哪天有人把渲染逻辑加回去，新旧两个地址就会同时存在，
 *      变成重复内容 —— 而且页面看起来完全正常。
 *
 *   b) 这些桩页的**跳转目标必须真实存在**。桩页本身没有任何内容，
 *      它指向哪里就是它存在的全部意义；目标一旦失效，旧链接就被静默送进 404，
 *      而桩页看起来完全正常 —— 页面检查、链接检查都抓不到。
 *
 *   c) 博客流第一页最多只能有一条指向专栏章节的链接（即「专栏最新更新」展示位）。
 *      这是用户提的核心诉求：学习某个主题会连续写十几篇笔记，
 *      一旦有人把专栏章节重新混进博客流，首页立刻被同一个系列刷屏。
 *
 *   d) 跳转桩页不得进入搜索索引（见下方对应注释）。
 *
 *   e) **RSS 只能包含独立文章**，不得出现专栏章节。
 *      与 c 是同一诉求的另一面：博客流被刷屏读者还能滚走，RSS 被刷屏则会把
 *      十几条同系列条目直接推进订阅器。而且 rss.xml 是纯文本产物，
 *      页面检查与链接检查都覆盖不到它 —— 只能在这里正面断言。
 */
const sourceCatalog = getContentCatalog(root);
const columnChapterIds = [...sourceCatalog.aliases.keys()].map(route => decodeURIComponent(route.slice('/post/'.length, -1)));

const stubsThatRender = [];
const brokenRedirects = [];
for (const id of columnChapterIds) {
	const stub = path.join(dist, 'post', id, 'index.html');
	if (!existsSync(stub)) continue;

	const html = await readFile(stub, 'utf8');
	if (/<main\b/i.test(html)) {
		stubsThatRender.push(id);
		continue;
	}

	/*
	 * 桩页的全部价值就在跳转目标上：目标不存在，等于把旧链接直接送进 404。
	 * 而这类问题「改坏了也不报错」—— 桩页本身完全正常，只是指向了一个不存在的地址，
	 * 页面检查、链接检查都发现不了（桩页里的链接是从 dist 反查不到的）。
	 * 所以必须正面校验跳转目标是否存在。
	 */
	const target = /http-equiv="refresh"\s+content="0;url=([^"]+)"/.exec(html)?.[1];
	if (!target) {
		brokenRedirects.push(`/post/${id}/ → 缺少 refresh 跳转目标`);
		continue;
	}
	const segments = target.replace(/^\/|\/$/g, '').split('/');
	if (!existsSync(path.join(dist, ...segments, 'index.html'))) {
		brokenRedirects.push(`/post/${id}/ → ${target}（目标页面不存在）`);
	}
}
if (stubsThatRender.length) {
	failures.push(`专栏章节的旧地址仍在渲染正文（应为跳转桩页）${stubsThatRender.length} 个:`);
	for (const p of stubsThatRender.slice(0, 10)) failures.push(`    /post/${p}/`);
}
if (brokenRedirects.length) {
	failures.push(`专栏章节的旧地址跳转到了不存在的页面 ${brokenRedirects.length} 个:`);
	for (const p of brokenRedirects.slice(0, 10)) failures.push(`    ${p}`);
}

const blogFeedFirstPage = path.join(dist, 'posts', 'index.html');
if (existsSync(blogFeedFirstPage)) {
	const html = await readFile(blogFeedFirstPage, 'utf8');
	const chapterLinks = new Set(
		[...html.matchAll(/href="\/columns\/[^/"]+\/[^/"]+\/"/g)].map((m) => m[0]),
	);
	if (chapterLinks.size > 1) {
		failures.push(
			`博客流第一页出现 ${chapterLinks.size} 条专栏章节链接（最多允许 1 条「专栏最新更新」展示位）`,
		);
		for (const link of [...chapterLinks].slice(0, 10)) failures.push(`    ${link}`);
	}
}

/**
 * c) 跳转桩页**不得进入搜索索引**。
 *
 * 桩页带 `noindex`，Pagefind 会因此跳过它们（实测 300 页 → 索引 218 页，
 * 78 个桩页全部不在索引里）。但这条**依赖桩页保持 noindex** —— 一旦有人去掉它，
 * 桩页就会以空内容进索引：用户搜到一堆点进去只会被弹走的空结果。
 * 这类退化不会让构建失败，链接检查也发现不了（桩页里的链接本身是有效的）。
 *
 * 判定：用 Pagefind 自己的元数据（pagefind-entry.json 的 page_count）与非桩页数比较。
 * 桩页若被索引，page_count 会逼近 HTML 总数从而超过非桩页数。
 * **刻意不断言「等于非桩页数 − 常数」** —— 那个常数（实测为 4，是被 data-pagefind-ignore
 * 或集成默认排除的页面）会随站点结构漂移，写成等式属于脆弱断言。
 */
const pagefindEntry = path.join(dist, 'pagefind', 'pagefind-entry.json');
if (existsSync(pagefindEntry)) {
	const entry = JSON.parse(await readFile(pagefindEntry, 'utf8'));
	const pageCount = Object.values(entry.languages ?? {})[0]?.page_count ?? 0;

	let realPages = 0;
	for (const file of htmlFiles) {
		// 桩页判据与上面一致：看头部有没有 meta refresh
		const head = (await readFile(file, 'utf8')).slice(0, 600);
		if (!head.includes('http-equiv="refresh"')) realPages += 1;
	}

	if (pageCount > realPages) {
		failures.push(
			`搜索索引包含 ${pageCount} 页，超过非桩页数 ${realPages} —— 跳转桩页疑似被索引（桩页应保持 noindex）`,
		);
	}
}

/**
 * e) RSS 只能包含独立文章。
 *
 * 判据一：RSS 里的 <link> 不得命中章节 id（那正是 /post/<id>/ 桩页地址）。
 * 判据二：条数必须等于「已发布的独立文章数」—— 少了说明有文章被静默漏掉，
 *        而 RSS 少几篇没有任何页面会表现出来。
 */
const rssPath = path.join(dist, 'rss.xml');
if (existsSync(rssPath)) {
	const rss = await readFile(rssPath, 'utf8');
	// 第一条 <link> 是频道自身地址，其余才是条目
	const itemLinks = [...rss.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]).slice(1);
	const chapterSet = new Set(columnChapterIds);
	const leaked = itemLinks.filter((link) => chapterSet.has(link.replace(/\/+$/, '').split('/').pop()));

	if (leaked.length) {
		failures.push(`RSS 里出现专栏章节 ${leaked.length} 条（RSS 只应包含独立文章）:`);
		for (const link of leaked.slice(0, 10)) failures.push(`    ${link}`);
	}

	const publishedStandalone = sourceCatalog.posts.filter(entry => entry.kind === 'post' && entry.published).length;
	if (itemLinks.length !== publishedStandalone) {
		failures.push(
			`RSS 条目数 ${itemLinks.length} 与已发布独立文章数 ${publishedStandalone} 不一致（少了说明有文章被静默漏掉）`,
		);
	}
}

/* ---------- 8. 内容卫生断言 ---------- */
/**
 * 四条「改坏了不报错、只会悄悄退化」的内容约定，都是实际踩过的坑：
 *
 *   a) 分类词表只能有约定的三种，且必须按**文章体裁**划分。
 *      历史上有 7 种，其中 5 种只有 1–3 篇，还有「前端」这种按主题划分的误用
 *      （主题应该走 tags —— `前端` 作为标签本来就有近 20 篇）。
 *      分类一乱，分类页就退化成一堆零星条目。专栏的分类同样受此约束。
 *
 *   b) 文章文件名不得含不可见字符。曾出现结尾带零宽空格 (U+200B) 的文件：
 *      Astro 的 glob loader 会把 id 里的零宽空格剥掉，所以线上 URL 完全正常，
 *      但文件名本身在编辑器 / 终端里看不出任何问题，极易误改。
 *
 *   c) 已发布的文章正文不能为空。曾有两篇只有 frontmatter 的空白页长期挂在线上。
 *      正文为空的占位文章应标 `draft: true`，而不是发布出去。
 *
 *   d) **专栏章节不得自带 tags / categories** —— 体裁与主题由专栏统一表达，
 *      章节上重复标一遍是冗余的，也会让标签页被同一个系列的十几张卡铺满。
 *      这条约束很容易在「新写一章时顺手把标签抄上去」时被破坏，而且不会报错，
 *      只会让标签页悄悄退化回刷屏状态。
 */
const CANONICAL_CATEGORIES = new Set(['学习笔记', '技术教程', '随笔杂谈']);
const INVISIBLE_CHARS = /[\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u2064\ufeff]/;

const offVocabCategories = [];
const invisibleFilenames = [];
const emptyPublishedPosts = [];
const chaptersWithTaxonomy = [];

/**
 * 解析 frontmatter 里的列表字段，兼容三种实际存在的写法：
 *   categories: [A, B]     行内数组
 *   categories: A          单值
 *   categories:\n- A\n- B  块式列表（本项目主要写法，注意 `categories: ` 后面可能带尾随空格）
 */
function parseFrontmatterList(frontmatter, key) {
	const out = [];
	let collecting = false;
	for (const line of frontmatter.split(/\r?\n/)) {
		const head = new RegExp(`^${key}\\s*:`).exec(line);
		if (head) {
			collecting = true;
			const rest = line.slice(head[0].length).trim();
			if (rest.startsWith('[')) {
				return rest
					.replace(/^\[|\]$/g, '')
					.split(',')
					.map((item) => item.trim().replace(/^["']|["']$/g, ''))
					.filter(Boolean);
			}
			if (rest) out.push(rest);
			continue;
		}
		if (!collecting) continue;
		const item = /^\s*-\s*(.+?)\s*$/.exec(line);
		if (item) out.push(item[1].trim().replace(/^["']|["']$/g, ''));
		else if (line.trim() === '' || line.trim().startsWith('#')) continue;
		else collecting = false;
	}
	return out;
}

{
	for (const entry of sourceCatalog.posts) {
		const name = entry.relative;

		if (INVISIBLE_CHARS.test(name)) invisibleFilenames.push(name);

		const source = await readFile(entry.file, 'utf8');
		// 容忍 frontmatter 后没有换行（实测 front-end-2.md / fronted-interview.md 就是这样）
		const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
		if (!match) continue;
		const [, frontmatter, body] = match;

		for (const category of parseFrontmatterList(frontmatter, 'categories')) {
			if (!CANONICAL_CATEGORIES.has(category)) offVocabCategories.push(`${name} → ${category}`);
		}

		if (!/^draft:\s*true\b/m.test(frontmatter) && body.trim() === '') {
			emptyPublishedPosts.push(name);
		}

		// d) 章节不得自带 tags / categories
		if (entry.kind === 'chapter') {
			const own = [...parseFrontmatterList(frontmatter, 'tags'), ...parseFrontmatterList(frontmatter, 'categories')];
			if (own.length) chaptersWithTaxonomy.push(`${name} → ${own.join(' / ')}`);
		}
	}
}

// 专栏自身的分类同样受词表约束（章节的分类已收上来，这里才是唯一来源）
{
	for (const entry of sourceCatalog.columns) {
		const name = entry.relative;
		const source = await readFile(entry.file, 'utf8');
		const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
		if (!match) continue;
		for (const category of parseFrontmatterList(match[1], 'categories')) {
			if (!CANONICAL_CATEGORIES.has(category)) offVocabCategories.push(`columns/${name} → ${category}`);
		}
	}
}

if (offVocabCategories.length) {
	failures.push(
		`出现约定外的分类 ${offVocabCategories.length} 处（只允许 ${[...CANONICAL_CATEGORIES].join(' / ')}，主题请走 tags）:`,
	);
	for (const item of offVocabCategories.slice(0, 10)) failures.push(`    ${item}`);
}
if (invisibleFilenames.length) {
	failures.push(`文章文件名含不可见字符 ${invisibleFilenames.length} 个:`);
	for (const name of invisibleFilenames.slice(0, 10)) failures.push(`    ${JSON.stringify(name)}`);
}
if (emptyPublishedPosts.length) {
	failures.push(
		`已发布但正文为空的文章 ${emptyPublishedPosts.length} 篇（应标 draft: true 或补上正文）:`,
	);
	for (const name of emptyPublishedPosts.slice(0, 10)) failures.push(`    ${name}`);
}
if (chaptersWithTaxonomy.length) {
	failures.push(
		`专栏章节自带 tags / categories ${chaptersWithTaxonomy.length} 处（应登记在专栏上，章节归属由目录推导）:`,
	);
	for (const item of chaptersWithTaxonomy.slice(0, 10)) failures.push(`    ${item}`);
}

/* ---------- 9. 模板泄漏断言 ---------- */
/**
 * Astro 模板里的 `{expr && <tag />}` 若被当成字面文本输出，说明
 * 该文件的模板解析被破坏了。这类问题不报错、不警告，只是页面元数据
 * 静默失效（noindex 丢失、og:type 丢失），必须靠断言兜住。
 *
 * 触发过一次真实事故：在 BaseHead.astro 的 <noscript> 里放了
 * 带 is:inline 的 <style>，导致同一文件后续所有 `{...}` 表达式
 * 全部漏成文本，236 个页面全中。
 */
const leaked = [];
for (const file of htmlFiles) {
	const rel = path.relative(dist, file);
	if (skipDirs.some((d) => rel.startsWith(d))) continue;
	const html = await readFile(file, 'utf8');
	// 模板表达式原样出现在 HTML 里就是泄漏。这几个是 BaseHead 里实际用到的。
	if (/\bnoindex && <meta/.test(html) || /type === 'article' && /.test(html)) {
		leaked.push(rel);
	}
}
if (leaked.length) {
	failures.push(`模板表达式泄漏为字面文本（模板解析被破坏）${leaked.length} 页:`);
	for (const p of leaked.slice(0, 10)) failures.push(`    ${p}`);
}

/* ---------- 10. 数学渲染断言 ---------- */
/**
 * 数学公式**只能**靠 frontmatter 的 `mathjax: true` 开启：remark-math 是处理器级
 * 插件（无法按文档挂载），所以「不渲染」是由 src/plugins/remark-math-gate.mjs
 * 在解析之后把数学节点还原成原文实现的。
 *
 * 这两条断言守的是一次**真实事故**（2026-09-17）：astro.config.mjs 里的
 * whenMathjax 包装器用裸调用触发 remark-math 的 attacher、丢了 `this`，
 * 导致 remark-math **从未注册成功** —— 全站公式静默失效（`$$…$$` 原样漏进 HTML），
 * 而页面照常 200、构建照常成功，只有一行被 glob loader 吞掉的 ERROR。
 * 没有任何既有断言能发现它，所以补上：
 *
 *   a) 标了 mathjax 且正文确实含公式的文章，页面必须渲染出 KaTeX
 *   b) 没标 mathjax 的文章不得出现 KaTeX（守住 gate，防止哪天被顺手摘掉）
 *
 * 判据 `hasMathDelimiter` 已用当前内容自检：22 篇标了 mathjax 的文章里，
 * 它**精确命中**真正含公式的 6 篇（51mcu-2 / 51mcu-6 / dsa-1 / stm32-3 / stm32-4 / stm32-8），
 * 不会把 `markdown.md` 那种「正文里要展示 $$ 字面示例」的文章误判进来。
 */
const KATEX_TAG = /class="katex/;

/** 取 frontmatter 里的单值字段（去引号） */
function frontmatterScalar(frontmatter, key) {
	const m = new RegExp(`^${key}\\s*:\\s*(.+?)\\s*$`, 'm').exec(frontmatter);
	return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : undefined;
}

/** 正文是否含数学分隔符：块级 `$$`，或行内 `$…$`（贴近 micromark：开闭两侧不能是空白） */
function hasMathDelimiter(body) {
	return /\$\$/.test(body) || /\$[^\s$][^$\n]*[^\s$]\$/.test(body);
}

const mathNotRendered = [];
const mathLeaked = [];
let mathChecked = 0;
{
	for (const entry of sourceCatalog.posts) {
		const name = entry.relative;
		const source = await readFile(entry.file, 'utf8');
		const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
		if (!match) continue;
		const [, frontmatter, body] = match;
		if (!hasMathDelimiter(body)) continue;

		const flagged = /^mathjax:\s*true\b/m.test(frontmatter);
		const target = path.join(dist, decodeURIComponent(entry.route.slice(1)), 'index.html');
		const pages = entry.published && existsSync(target) ? [target] : [];
		// 页面本身缺失由第 1 组链接断言负责，这里不重复报
		if (!pages.length) continue;

		const where = pages.map((p) => path.relative(dist, p)).join(' / ');
		const rendered = (await Promise.all(pages.map((p) => readFile(p, 'utf8')))).some((html) =>
			KATEX_TAG.test(html),
		);
		if (flagged && !rendered) mathNotRendered.push(`${name}（${where}）`);
		if (!flagged && rendered) mathLeaked.push(`${name}（${where}）`);
		if (flagged) mathChecked += 1;
	}
}
if (mathNotRendered.length) {
	failures.push(
		`标了 mathjax 的文章未渲染出公式 ${mathNotRendered.length} 篇（remark-math / rehype-katex 可能未生效）:`,
	);
	for (const p of mathNotRendered.slice(0, 10)) failures.push(`    ${p}`);
}
if (mathLeaked.length) {
	failures.push(
		`未标 mathjax 的文章却渲染出了公式 ${mathLeaked.length} 篇（remark-math-gate 可能被摘掉）:`,
	);
	for (const p of mathLeaked.slice(0, 10)) failures.push(`    ${p}`);
}

/* Source-relative links and fragments use a real HTML parser, including the cases skipped above. */
const contentOutput = auditContentOutput(dist, sourceCatalog);
failures.push(...contentOutput.failures);

/* ---------- 11. 报告 ---------- */
const fmt = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
console.log('📦 构建产物体检');
console.log(`   文件数: ${files.length}`);
console.log(`   总大小: ${fmt(totalBytes)} (预算 ${BUDGET_MB} MB)`);
console.log('   分类型:');
for (const [ext, { count, bytes }] of [...byExt.entries()].sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 8)) {
	console.log(`     ${(ext || '(no ext)').padEnd(8)} ${String(count).padStart(4)} 个  ${fmt(bytes)}`);
}
console.log(`   站内链接: 检查 ${seen.size} 条；完整链接/锚点审计 ${contentOutput.linkCount} 条`);
console.log(`   专栏章节: ${columnChapterIds.length} 个（旧地址均为跳转桩页）`);
console.log(`   数学公式: 校验 ${mathChecked} 篇（标了 mathjax 且正文含公式）`);

if (warnings.length) {
	console.log('\n⚠️  警告:');
	warnings.forEach((w) => console.log(`   ${w}`));
}

if (failures.length) {
	console.log('\n✗ 断言失败:');
	failures.forEach((f) => console.log(`   ${f}`));
	process.exit(1);
}

console.log('\n✓ 全部断言通过');
