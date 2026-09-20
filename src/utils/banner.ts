import type { ImageMetadata } from 'astro';

/**
 * 文章页头（banner）的色相派生。
 *
 * 文章没有封面图时，页头仍需是一块有性格的底，而不是一块灰。
 * 色相由文章身份（postId）**确定性**派生：
 * - 同一篇文章在任何设备、明暗主题、任何一次构建下都是同一个色相；
 * - 不同文章彼此错开，124 篇看起来像一个系列而不是一张图重复 124 次。
 *
 * 刻意**不用** `hash % 360`：那会撞出大片浑浊的黄绿与刺眼的品红。
 * 改成从一组调好的邻近色对里取——每一对都验证过压暗后仍能与白字保持对比度。
 */
const HUE_PAIRS: readonly [number, number][] = [
	[214, 268], // 靛蓝 → 紫
	[196, 232], // 青 → 天蓝
	[254, 300], // 品蓝 → 紫罗兰
	[158, 196], // 松绿 → 青
	[282, 326], // 紫 → 品红
	[20, 44], // 落日橙 → 琥珀
	[176, 212], // 蓝绿 → 天青
	[232, 262], // 钴蓝 → 蓝紫
	[342, 18], // 绯红 → 朱
	[128, 168], // 苔绿 → 湖绿
];

export interface BannerTint {
	/** 主色相：占据画面上方的光晕 */
	hueA: number;
	/** 副色相：压在下方的深色底 */
	hueB: number;
	/** 直接可塞进 style 的字符串：`--banner-hue-a: 214; --banner-hue-b: 268;` */
	style: string;
}

function hashString(value: string) {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash * 31 + value.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

export function bannerTint(seed: string): BannerTint {
	const [hueA, hueB] = HUE_PAIRS[hashString(seed) % HUE_PAIRS.length];
	return {
		hueA,
		hueB,
		style: `--banner-hue-a: ${hueA}; --banner-hue-b: ${hueB};`,
	};
}

/** 页头图片：远程 URL 走原样，本地资源由 astro:assets 处理。 */
export type BannerImageSource = ImageMetadata | string;
