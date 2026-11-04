import { getContentCatalog } from '../src/content-model/catalog.mjs';
import { validateContentLinks } from '../src/content-model/relative-links.mjs';
import { validateContentMedia } from '../src/plugins/media.mjs';
const catalog = getContentCatalog(process.cwd(), { fresh: true });
validateContentLinks(catalog);
// 图片前缀（store: / local:）单独扫一遍：glob loader 会把渲染期异常吞成一行日志，
// 只靠构建期报错会漏；这条命令在 pnpm verify 里紧挨着 build 跑。
const mediaFiles = validateContentMedia();
console.log(`✓ 内容结构与源文件链接：${catalog.columns.length} 个专栏入口，${catalog.posts.filter(e => e.kind === 'chapter').length} 篇章节，${catalog.posts.filter(e => e.kind === 'post').length} 篇独立文章，${catalog.aliases.size} 个历史跳转。`);
console.log(`✓ 图片来源前缀：${mediaFiles} 个内容文件（store: / local: 可解析，本地素材均存在）。`);
