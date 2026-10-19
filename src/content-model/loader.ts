import { glob, type Loader } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contentPatterns, describeSource, getContentCatalog } from './catalog.mjs';
import { validateContentLinks } from './relative-links.mjs';

/** Keep the public `posts` collection; only the filesystem source/identity changes. */
export function localContentLoader(kind: 'posts' | 'columns'): Loader {
  const delegate = glob({
    base: './src/content',
    pattern: contentPatterns[kind],
    generateId: ({ entry }) => {
      const source = describeSource(entry);
      if (!source) throw new Error(`Unsupported content source: ${entry}`);
      return source.id;
    },
  });
  return {
    name: `local-${kind}-v1`,
    async load(context) {
      const root = fileURLToPath(context.config.root);
      const catalog = getContentCatalog(root);
      validateContentLinks(catalog);
      await delegate.load({
        ...context,
        watcher: undefined, // Integration refreshes both collections together on content changes.
        // Linked target publication/path changes must also invalidate cached rendered Markdown.
        generateDigest: data => context.generateDigest({ version: catalog.version, data }),
        parseData: async props => {
          const file = props.filePath ? path.resolve(props.filePath) : '';
          const entry = getContentCatalog(root).byFile.get(file);
          if (!entry) throw new Error(`Missing content identity: ${file}`);
          const data = { ...props.data, columnId: entry.columnId, draft: !entry.published };
          return context.parseData({ ...props, data });
        },
      });
      for (const entry of context.store.values()) {
        if (entry.filePath?.endsWith('.md') && !entry.rendered) throw new Error(`Markdown failed to render: ${entry.filePath}`);
      }
    },
  };
}
