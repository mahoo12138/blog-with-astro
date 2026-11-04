import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { classifyMediaUrl, isMediaRef, resolveMedia } from '../../src/utils/media.mjs';
import { rehypeImageDefaults, transformMediaTree } from '../../src/plugins/media.mjs';

const STORE = 'https://files.test/assets/ast-0123456789abcdef0123456789abcdef/';
const opts = { storeBase: STORE, localRoot: '/images', root: os.tmpdir() };

function images(tree) {
	const out = [];
	const walk = (node) => {
		if (node.type === 'image') out.push(node);
		for (const child of node.children ?? []) walk(child);
	};
	walk(tree);
	return out;
}

function jsx(tree) {
	const out = [];
	const walk = (node) => {
		if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') out.push(node);
		for (const child of node.children ?? []) walk(child);
	};
	walk(tree);
	return out;
}

test('unprefixed sources pass through with a truthful kind', () => {
	const cases = [
		['https://cdn.test/a.png', 'external'],
		['//cdn.test/a.png', 'external'],
		// /images 就是 localRoot，站内绝对路径写在这里同样算本地素材
		['/images/a.png', 'local'],
		['/favicon.svg', 'public'],
		['./a.png', 'relative'],
		['../assets/a.png', 'relative'],
	];
	for (const [src, kind] of cases) assert.deepEqual(resolveMedia(src, opts), { src, kind });
});

test('store: joins the published base and encodes each path segment separately', () => {
	const base = { ...opts, storeBase: 'https://files.test/assets/ast-x' }; // 末尾斜杠缺省也要能归一化
	assert.equal(
		resolveMedia('store:images/posts/2026/图片 一.webp', base).src,
		'https://files.test/assets/ast-x/images/posts/2026/%E5%9B%BE%E7%89%87%20%E4%B8%80.webp',
	);
	// 整条路径不能被当成一段编码：斜杠必须保留
	assert.equal(resolveMedia('store:a/b/c.webp', base).src, 'https://files.test/assets/ast-x/a/b/c.webp');
});

test('store: never double-encodes and keeps query/hash suffixes', () => {
	assert.equal(
		resolveMedia('store:images/%E4%B8%AD%E6%96%87.webp', opts).src,
		`${STORE}images/%E4%B8%AD%E6%96%87.webp`,
	);
	assert.equal(resolveMedia('store:images/a.webp?v=2', opts).src, `${STORE}images/a.webp?v=2`);
	assert.equal(resolveMedia('store:images/a.webp#top', opts).src, `${STORE}images/a.webp#top`);
});

test('store: complains about a missing base instead of emitting a broken link', () => {
	assert.throws(
		() => resolveMedia('store:images/a.webp', { ...opts, storeBase: '' }),
		/store: 引用需要先配置 omni-store 静态发布地址/,
	);
});

test('malformed refs fail closed', () => {
	const bad = [
		['store:', /缺少路径/],
		['store:/abs.webp', /不要以 \/ 开头/],
		['store:../escape.webp', /不能包含 \. 或 \.\./],
		['store:a//b.webp', /空的路径段/],
		['store:https://cdn.test/a.webp', /只写相对路径/],
		['local:', /缺少路径/],
	];
	for (const [src, pattern] of bad) assert.throws(() => resolveMedia(src, opts), pattern, src);
	assert.equal(isMediaRef('https://cdn.test/a.png'), false);
	assert.equal(isMediaRef('store:a.webp'), true);
});

test('local: maps into the public asset root and verifies the file exists', (t) => {
	const root = mkdtempSync(path.join(os.tmpdir(), 'astro-media-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	mkdirSync(path.join(root, 'public/images/brand'), { recursive: true });
	writeFileSync(path.join(root, 'public/images/brand/logo.svg'), '<svg/>');

	const cases = { ...opts, root };
	assert.deepEqual(resolveMedia('local:brand/logo.svg', cases), { src: '/images/brand/logo.svg', kind: 'local' });
	assert.throws(() => resolveMedia('local:brand/missing.svg', cases), /找不到文件 public\/images\/brand\/missing\.svg/);
	// 校验可以关掉（预览/外部素材场景）
	assert.equal(resolveMedia('local:brand/missing.svg', { ...cases, verify: false }).src, '/images/brand/missing.svg');
});

test('classifyMediaUrl recovers the source from an already-resolved URL', () => {
	assert.equal(classifyMediaUrl(`${STORE}images/a.webp`, opts), 'store');
	assert.equal(classifyMediaUrl('/images/a.webp', opts), 'local');
	assert.equal(classifyMediaUrl('https://cdn.test/a.png', opts), 'external');
});

test('remark transform rewrites images, reference definitions and MDX image props', async () => {
	const { unified } = await import('unified');
	const remarkParse = (await import('remark-parse')).default;
	const remarkMdx = (await import('remark-mdx')).default;

	const md = unified()
		.use(remarkParse)
		.parse('![](store:images/a.webp)\n\n![ref][r]\n\n[r]: store:images/b.webp');
	transformMediaTree(md, { storeBase: STORE, root: os.tmpdir() });
	assert.deepEqual(
		images(md).map((node) => node.url),
		[`${STORE}images/a.webp`],
	);
	// 引用式图片的目标挂在 definition 上，不是 image 节点
	assert.equal(md.children.find((node) => node.type === 'definition').url, `${STORE}images/b.webp`);

	const mdx = unified()
		.use(remarkParse)
		.use(remarkMdx)
		.parse(
			[
				'<img src="store:images/c.webp" />',
				'<Photo src="store:images/d.webp" />',
				'<Img src="store:images/e.webp" />',
				'<a href="store:images/f.webp">链接不是图片</a>',
			].join('\n\n'),
		);
	transformMediaTree(mdx, { storeBase: STORE, root: os.tmpdir() });
	const [image, photo, img, anchor] = jsx(mdx);
	assert.equal(image.attributes[0].value, `${STORE}images/c.webp`);
	assert.equal(photo.attributes[0].value, `${STORE}images/d.webp`);
	// <Img> 自己解析：留原始前缀，才能给出准确的 data-media
	assert.equal(img.attributes[0].value, 'store:images/e.webp');
	assert.equal(anchor.attributes[0].value, 'store:images/f.webp');
});

test('rehype defaults keep the first body image eager and classify the source', () => {
	const element = (properties) => ({ type: 'element', tagName: 'img', properties, children: [] });
	const tree = {
		type: 'root',
		children: [
			element({ src: `${STORE}images/a.webp` }),
			element({ src: '/images/b.webp' }),
			element({ src: 'https://cdn.test/c.png', loading: 'eager' }),
		],
	};
	rehypeImageDefaults({ enabled: true, storeBase: STORE })(tree);
	const [first, second, third] = tree.children;
	assert.equal(first.properties.loading, 'eager');
	assert.equal(first.properties.fetchPriority, 'high');
	assert.equal(first.properties.dataMedia, 'store');
	assert.equal(second.properties.loading, 'lazy');
	assert.equal(second.properties.decoding, 'async');
	assert.equal(second.properties.dataMedia, 'local');
	// 显式 loading 不被覆盖，且只有首图抬优先级
	assert.equal(third.properties.loading, 'eager');
	assert.equal(third.properties.fetchPriority, undefined);
});
