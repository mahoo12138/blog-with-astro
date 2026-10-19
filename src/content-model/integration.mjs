import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContentCatalog } from './catalog.mjs';
import { validateContentLinks } from './relative-links.mjs';

/** Export only explicitly public asset types from assets/; never publish Markdown/frontmatter. */
/** @returns {import('astro').AstroIntegration} */
export function contentStructure() {
  let root;
  return { name: 'local-content-structure', hooks: {
    'astro:config:done': ({ config }) => { root = fileURLToPath(config.root); },
    'astro:build:start': () => { validateContentLinks(getContentCatalog(root, { fresh: true })); },
    'astro:server:setup': ({ server, refreshContent, logger }) => {
      let timer, running = false, dirty = false, closed = false, error;
      const refresh = async () => {
        if (running || closed) return;
        running = true;
        try {
          while (dirty && !closed) {
            dirty = false;
            validateContentLinks(getContentCatalog(root, { fresh: true }));
            if (!refreshContent) throw new Error('此 Astro 版本未提供内容刷新接口，请重启 dev server');
            await refreshContent({ loaders: ['local-posts-v1', 'local-columns-v1'] });
          }
          error = undefined;
          server.ws.send({ type: 'full-reload' });
        } catch (cause) {
          error = cause;
          logger.error(cause.message);
          server.ws.send({ type: 'error', err: { message: cause.message, stack: cause.stack ?? '' } });
        } finally {
          running = false;
          if (dirty && !closed) { clearTimeout(timer); timer = setTimeout(refresh, 120); }
        }
      };
      const onChange = (_event, file) => {
        const relative = path.relative(root, file).split(path.sep).join('/');
        if (!relative.startsWith('src/content/posts/') && !relative.startsWith('src/content/columns/') && relative !== 'src/config/legacy-post-ids.json') return;
        dirty = true;
        clearTimeout(timer);
        timer = setTimeout(refresh, 120);
      };
      server.watcher.add([path.join(root, 'src/content'), path.join(root, 'src/config/legacy-post-ids.json')]);
      server.watcher.on('all', onChange);
      server.httpServer?.once('close', () => { closed = true; clearTimeout(timer); server.watcher.off('all', onChange); });
      server.middlewares.use((req, res, next) => {
        if (error && /^\/(?:columns|post|posts)(?:\/|$)/.test(req.url ?? '')) {
          res.statusCode = 500; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end(error.message); return;
        }
        next();
      });
      server.middlewares.use('/content-assets', async (req, res, next) => {
        const catalog = getContentCatalog(root);
        const pathname = new URL('/content-assets' + (req.url ?? '/'), 'http://local').pathname;
        const asset = catalog.resources.find(r => r.route === pathname);
        if (!asset) return next();
        try {
          const types = { '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
          res.setHeader('Content-Type', types[path.extname(asset.file)] ?? 'application/octet-stream');
          res.setHeader('X-Content-Type-Options', 'nosniff'); res.end(await readFile(asset.file));
        } catch { next(); }
      });
    },
    'astro:build:done': async ({ dir }) => {
      const out = fileURLToPath(dir);
      for (const resource of getContentCatalog(root).resources) {
        const target = path.join(out, decodeURIComponent(resource.route.slice(1)));
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(resource.file, target);
      }
    },
  } };
}
