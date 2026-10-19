import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';

export function inspectHtml(html) {
  const tree = fromHtml(html), links = [], resources = [], ids = new Set();
  const visit = node => {
    if (node.type === 'element') {
      const p = node.properties ?? {};
      if (p.id) ids.add(String(p.id));
      if (node.tagName === 'a' && p.name) ids.add(String(p.name));
      if (['pre', 'code', 'script', 'style', 'template'].includes(node.tagName)) return;
      if (['a', 'link'].includes(node.tagName) && typeof p.href === 'string') links.push(p.href);
      if (['img', 'source', 'video', 'audio'].includes(node.tagName) && typeof p.src === 'string' && p.src) resources.push(p.src);
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return { links, resources, ids };
}
function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const file = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(file) : [file];
  });
}

/** Check all actual internal links, not just hrefs starting with '/'. Never inspect code examples. */
export function auditContentOutput(dist, catalog, site = 'https://mahoo12138.cn') {
  const failures = [], parsed = new Map();
  let linkCount = 0;
  const parse = file => {
    if (!parsed.has(file)) parsed.set(file, inspectHtml(readFileSync(file, 'utf8')));
    return parsed.get(file);
  };
  const targetFile = pathname => {
    const target = path.resolve(dist, '.' + decodeURIComponent(pathname));
    if (target !== path.resolve(dist) && !target.startsWith(path.resolve(dist) + path.sep)) return undefined;
    return [path.join(target, 'index.html'), target, target + '.html'].find(f => existsSync(f) && statSync(f).isFile());
  };
  for (const file of filesUnder(dist).filter(f => f.endsWith('.html') && !f.includes(`${path.sep}pagefind${path.sep}`))) {
    const rel = path.relative(dist, file).split(path.sep).join('/');
    const current = '/' + rel.replace(/index\.html$/, '');
    const document = parse(file);
    for (const href of [...document.links, ...document.resources]) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) && !href.startsWith(site + '/')) continue;
      try {
        const target = new URL(href, site + current);
        if (target.origin !== new URL(site).origin) continue;
        linkCount++;
        const resolved = targetFile(target.pathname);
        if (!resolved) { failures.push(`死链 ${href} ← ${rel}`); continue; }
        if (/\.mdx?$/i.test(target.pathname)) failures.push(`未转换的源文件链接 ${href} ← ${rel}`);
        if (target.hash && resolved.endsWith('.html')) {
          const anchor = decodeURIComponent(target.hash.slice(1));
          if (anchor && !parse(resolved).ids.has(anchor)) failures.push(`锚点不存在 ${href} ← ${rel}`);
        }
      } catch (error) { failures.push(`无效链接 ${href} ← ${rel}: ${error.message}`); }
    }
  }
  for (const entry of catalog.entries.filter(e => e.published)) {
    if (!targetFile(entry.route)) failures.push(`已发布源文件没有对应页面：${entry.relative} → ${entry.route}`);
  }
  for (const [oldRoute, route] of catalog.aliases) {
    const old = targetFile(oldRoute);
    if (!old) { failures.push(`历史地址缺少跳转页：${oldRoute}`); continue; }
    const html = readFileSync(old, 'utf8');
    if (!html.includes(`0;url=${route}`)) failures.push(`历史跳转目标变化：${oldRoute} → ${route}`);
    if (!/name="robots"[^>]*content="noindex/.test(html)) failures.push(`历史跳转缺少 noindex：${oldRoute}`);
  }
  return { linkCount, failures: [...new Set(failures)] };
}
