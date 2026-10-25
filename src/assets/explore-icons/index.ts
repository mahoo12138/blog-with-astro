import type { ImageMetadata } from 'astro';
// SVG 是矢量、体积极小（< 1KB），无需过图片管线，保持 ?url 直接引用。
import bookmarkIcon from './bookmark.svg?url';
import clothesIcon from './clothes.svg?url';
import goodsIcon from './goods.svg?url';
import phoneIcon from './phone.svg?url';
import photoIcon from './photo.svg?url';
import travelIcon from './travel.svg?url';
import projectsIcon from './projects.svg?url';
import toolsIcon from './tools.svg?url';
import labIcon from './lab.svg?url';
import learnIcon from './learn.svg?url';
// PNG 是位图且源文件很大（love.png 499KB / memos.png 311KB），
// 必须走 Astro 图片管线输出小尺寸 webp，否则每张卡片都要拉原图。
import loveIcon from './love.png';
import memosIcon from './memos.png';

/**
 * 探索页图标资源。
 * - 值为 ImageMetadata（本地位图）：调用方必须用 <Image> 渲染，由管线负责压缩与尺寸。
 * - 值为 string（SVG url）：用原生 <img> 即可。
 */
export const exploreIconImages = {
	bookmark: bookmarkIcon,
	clothes: clothesIcon,
	goods: goodsIcon,
	phone: phoneIcon,
	photo: photoIcon,
	travel: travelIcon,
	projects: projectsIcon,
	tools: toolsIcon,
	lab: labIcon,
	learn: learnIcon,
	love: loveIcon,
	memos: memosIcon,
} as const satisfies Record<string, string | ImageMetadata>;

export type ExploreIconImageKey = keyof typeof exploreIconImages;

/** 运行期判别：本地位图会带 width/height/format 元信息，SVG url 是纯字符串。 */
export function isImageMetadata(value: string | ImageMetadata): value is ImageMetadata {
	return typeof value !== 'string';
}
