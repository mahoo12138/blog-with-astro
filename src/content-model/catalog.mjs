import { readdirSync, readFileSync, statSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { slug as slugify } from 'github-slugger';

const MARKDOWN = /\.mdx?$/i;
const PUBLIC_ASSET = /\.(?:avif|gif|ico|jpe?g|png|svg|webp|pdf|txt|csv|json|zip|mp3|mp4|webm|ogg|wav|woff2?)$/i;
const INVISIBLE = /[\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u2064\ufeff]/;
const cache = new Map();
export const contentPatterns = {
  posts: ['posts/**/*.{md,mdx}', 'columns/*/*.{md,mdx}', '!columns/*/index.{md,mdx}', '!**/assets/**'],
  columns: ['columns/*/index.{md,mdx}'],
};
const url = (...segments) => '/' + segments.map(encodeURIComponent).join('/') + '/';
const fail = (file, message) => { throw new Error(`[content] ${file}: ${message}`); };

/** Pure mapping: source location, collection identity and public route are deliberately separate. */
export function describeSource(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  if (!MARKDOWN.test(relative) || parts.includes('assets')) return undefined;
  if (parts.some(p => INVISIBLE.test(p) || p.startsWith('.'))) fail(relative, '文件名含隐藏或不可见字符');
  const stem = parts.at(-1).replace(MARKDOWN, '');
  const slug = slugify(stem.normalize('NFC'));
  if (!slug || ['index'].includes(slug) && stem !== 'index') fail(relative, '无效或保留的文件名');
  if (parts[0] === 'columns') {
    if (parts.length !== 3) fail(relative, '专栏采用 columns/<专栏>/index.md 与同目录章节，不支持嵌套章节');
    const columnId = parts[1];
    if (slugify(columnId) !== columnId || columnId.normalize('NFKC') !== columnId || !/^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u.test(columnId)) fail(relative, '专栏文件夹请使用稳定的小写 slug');
    if (stem === 'index') return { kind: 'column', id: columnId, columnId, slug: columnId, route: url('columns', columnId) };
    return { kind: 'chapter', id: `${columnId}/${slug}`, columnId, slug, route: url('columns', columnId, slug) };
  }
  if (parts[0] === 'posts') {
    const id = [...parts.slice(1, -1).map(p => slugify(p)), slug].join('/');
    if (id === 'index') fail(relative, 'posts/index.md 与旧列表跳转入口冲突');
    return { kind: 'post', id, slug: id, route: url('post', ...id.split('/')) };
  }
  return undefined;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const item of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
    if (item.name.startsWith('.')) continue;
    const file = path.join(dir, item.name);
    if (item.isSymbolicLink()) fail(file, '内容目录不接受符号链接');
    if (item.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

/** Builds/validates the filesystem graph. Shared by loaders, remark, redirects, sitemap and audits. */
export function getContentCatalog(root = process.cwd(), { fresh = false, legacyIds } = {}) {
  root = realpathSync(path.resolve(root));
  const base = path.join(root, 'src/content');
  const files = [...walk(path.join(base, 'posts')), ...walk(path.join(base, 'columns'))];
  const legacyPath = path.join(root, 'src/config/legacy-post-ids.json');
  const legacy = legacyIds ?? (existsSync(legacyPath) ? JSON.parse(readFileSync(legacyPath, 'utf8')) : {});
  const fingerprint = files.map(f => { const s = statSync(f); return `${f}:${s.size}:${s.mtimeMs}:${s.ctimeMs}`; }).join('|') + JSON.stringify(legacy);
  if (!fresh && cache.get(root)?.fingerprint === fingerprint) return cache.get(root).catalog;
  const entries = [], resources = [], byFile = new Map(), byId = new Map(), byRoute = new Map();
  for (const file of files) {
    const relative = path.relative(base, file).split(path.sep).join('/');
    const source = describeSource(relative);
    if (!source) {
      if (relative.split('/').includes('assets') && PUBLIC_ASSET.test(file)) {
        resources.push({ file, route: '/content-assets/' + relative.split('/').map(encodeURIComponent).join('/') });
      }
      continue;
    }
    const raw = readFileSync(file, 'utf8');
    if (!/^---\r?\n/.test(raw)) fail(relative, '缺少 frontmatter');
    const { frontmatter: data, content: body } = parseFrontmatter(raw);
    if ('columnId' in data) fail(relative, '删除手写 columnId；专栏归属由文件夹推导');
    if ('slug' in data) fail(relative, '文件名决定 URL；请勿在 frontmatter 中另设 slug');
    const entry = { ...source, file, relative, raw, data, body, published: data.draft !== true };
    const key = `${entry.kind === 'column' ? 'columns' : 'posts'}:${entry.id}`;
    if (byId.has(key)) fail(relative, `内容 ID 冲突：${key}，另一文件为 ${byId.get(key).relative}`);
    if (byRoute.has(entry.route)) fail(relative, `URL 冲突：${entry.route}`);
    byId.set(key, entry); byFile.set(path.resolve(file), entry); byRoute.set(entry.route, entry); entries.push(entry);
  }
  const columns = entries.filter(e => e.kind === 'column');
  const columnMap = new Map(columns.map(e => [e.id, e]));
  const orders = new Map();
  for (const entry of entries.filter(e => e.kind === 'chapter')) {
    const parent = columnMap.get(entry.columnId);
    if (!parent) fail(entry.relative, '专栏缺少唯一的 index.md / index.mdx');
    entry.published &&= parent.published;
    if (!Number.isInteger(entry.data.order) || entry.data.order < 1) fail(entry.relative, '章节必须声明正整数 order');
    const orderKey = `${entry.columnId}:${entry.data.order}`;
    if (orders.has(orderKey)) fail(entry.relative, `章节 order 重复：${entry.data.order}，另一文件为 ${orders.get(orderKey)}`);
    orders.set(orderKey, entry.relative);
    if ((entry.data.tags?.length ?? 0) || (entry.data.categories?.length ?? 0)) fail(entry.relative, '分类与标签请写在专栏 index.md 中');
  }
  // Empty indexes stay editable, but do not create unreachable public entries.
  for (const column of columns) column.published &&= entries.some(e => e.kind === 'chapter' && e.columnId === column.id && e.published);
  const aliases = new Map();
  for (const [id, oldId] of Object.entries(legacy)) {
    const target = byId.get(`posts:${id}`);
    if (!target || target.kind !== 'chapter') fail(legacyPath, `历史章节 ${id} 不存在；迁移时请同步身份映射`);
    const oldRoute = url('post', ...oldId.split('/'));
    if (aliases.has(oldRoute) || byRoute.has(oldRoute)) fail(legacyPath, `历史跳转地址冲突：${oldRoute}`);
    if (target.published) aliases.set(oldRoute, target.route);
  }
  const catalog = { root, base, entries, columns, posts: entries.filter(e => e.kind !== 'column'), byFile, byId, byRoute, resources, aliases,
    version: createHash('sha256').update(fingerprint).digest('hex') };
  cache.set(root, { fingerprint, catalog });
  return catalog;
}

export function assertLocalFile(file, catalog) {
  if (!existsSync(file) || !statSync(file).isFile()) fail(file, '相对链接目标不存在或不是文件');
  const actual = realpathSync(file);
  const rel = path.relative(catalog.root, actual);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some(p => p.startsWith('.'))) fail(file, '相对资源不得逃逸项目或访问隐藏文件');
  return actual;
}
