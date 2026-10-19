import { getContentCatalog } from '../src/content-model/catalog.mjs';
import { validateContentLinks } from '../src/content-model/relative-links.mjs';
const catalog = getContentCatalog(process.cwd(), { fresh: true });
validateContentLinks(catalog);
console.log(`✓ 内容结构与源文件链接：${catalog.columns.length} 个专栏入口，${catalog.posts.filter(e => e.kind === 'chapter').length} 篇章节，${catalog.posts.filter(e => e.kind === 'post').length} 篇独立文章，${catalog.aliases.size} 个历史跳转。`);
