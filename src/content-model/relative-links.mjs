import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { assertLocalFile, getContentCatalog } from './catalog.mjs';

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#|\?)/i;
const IMAGE = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

/** Resolve against a source FILE, never the current browser URL. Query/hash remain opaque. */
export function resolveContentLink(href, source, catalog, { image = false } = {}) {
  if (!href || EXTERNAL.test(href)) return href;
  const match = /^([^?#]*)([\s\S]*)$/.exec(href);
  const [, encoded, suffix] = match;
  let decoded;
  try { decoded = decodeURIComponent(encoded); } catch { throw new Error(`链接编码无效：${href}`); }
  if (decoded.includes('\\') || decoded.includes('\0')) throw new Error(`无效的相对路径：${href}`);
  const file = path.resolve(path.dirname(source.file), decoded);
  const target = catalog.byFile.get(file);
  if (/\.mdx?$/i.test(decoded)) {
    if (image) throw new Error(`图片不能指向 Markdown：${href}`);
    if (!target) throw new Error(`Markdown 目标未登记或不存在：${href}`);
    if (source.published && !target.published) throw new Error(`已发布内容不能链接草稿或空专栏：${href}`);
    return target.route + suffix;
  }
  const actual = assertLocalFile(file, catalog);
  if (image && IMAGE.test(file)) return href; // Astro owns source-relative image optimization.
  const resource = catalog.resources.find(r => path.resolve(r.file) === actual);
  if (!resource) throw new Error(`下载资源请放入内容的 assets/ 目录：${href}`);
  return resource.route + suffix;
}

export function transformContentLinks(tree, source, catalog, file) {
  const imageDefinitions = new Set(), linkDefinitions = new Set();
  const scan = node => {
    if (node.type === 'imageReference') imageDefinitions.add(node.identifier);
    if (node.type === 'linkReference') linkDefinitions.add(node.identifier);
    node.children?.forEach(scan);
  };
  scan(tree);
  const rewrite = (href, node, image = false) => {
    try { return resolveContentLink(href, source, catalog, { image }); }
    catch (error) {
      const message = `[content-link] ${source.relative}:${node.position?.start?.line ?? '?'} ${error.message}`;
      if (file?.fail) file.fail(message, node);
      throw new Error(message);
    }
  };
  const visit = node => {
    // Never touch code, inlineCode, strings in JS expressions, or arbitrary component props.
    if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
      const isImage = node.type === 'image' || (node.type === 'definition' && imageDefinitions.has(node.identifier) && !linkDefinitions.has(node.identifier));
      node.url = rewrite(node.url, node, isImage);
    } else if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      for (const attribute of node.attributes ?? []) {
        if (attribute.type !== 'mdxJsxAttribute' || typeof attribute.value !== 'string') continue;
        if (node.name === 'a' && attribute.name === 'href') attribute.value = rewrite(attribute.value, node);
        // Literal JSX <img> bypasses Astro's Markdown image collector; use the public asset URL.
        if (node.name === 'img' && attribute.name === 'src') attribute.value = rewrite(attribute.value, node);
      }
    }
    node.children?.forEach(visit);
  };
  visit(tree);
}

export function remarkContentLinks({ root = process.cwd() } = {}) {
  return (tree, file) => {
    if (!file.path) return;
    const catalog = getContentCatalog(root);
    const source = catalog.byFile.get(path.resolve(file.path));
    if (source) transformContentLinks(tree, source, catalog, file);
  };
}

/** A separate preflight prevents Astro glob's render-error logging from silently dropping links. */
export function validateContentLinks(catalog) {
  const plain = unified().use(remarkParse);
  const mdx = unified().use(remarkParse).use(remarkMdx);
  for (const source of catalog.entries) {
    const content = parseFrontmatter(source.raw, { frontmatter: 'empty-with-lines' }).content;
    const tree = (source.file.endsWith('.mdx') ? mdx : plain).parse(content);
    transformContentLinks(tree, source, catalog);
  }
}
