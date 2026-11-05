export interface FontConfig {
	name: string;
	weights: number[];
	styles: ('normal' | 'italic')[];
	preload: boolean;
}

export interface SiteFontConfig {
	fonts: FontConfig[];
	stacks: {
		body: string;
		heading: string;
		mono: string;
		serif: string;
	};
	googleFontsUrl: string;
	/** 独立设计语言页面（/love 等）按需引入；全站不受影响 */
	serifFontsUrl: string;
}

function buildGoogleFontsUrl(fonts: FontConfig[]): string {
	const families = fonts.map((font) => {
		const encoded = font.name.replace(/ /g, '+');
		if (font.styles.includes('italic')) {
			const pairs = font.styles.flatMap((style) =>
				font.weights.map((w) => `${style === 'italic' ? '1' : '0'},${w}`),
			);
			return `family=${encoded}:ital,wght@${pairs.join(';')}`;
		}
		return `family=${encoded}:wght@${font.weights.join(';')}`;
	});
	return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

/**
 * 中文正文使用**系统字体栈**，不再加载 CJK webfont。
 *
 * 2026-11 决策，理由（实测数据见 docs/perf-fix-font-2026-11-05.md）：
 *   1. Google 的中文 webfont CSS 是 642 条 unicode-range @font-face，
 *      Noto Sans SC 与 Noto Serif SC 各 339KB，压缩后各 92.7KB —— 两份就是每页 182KB，
 *      占首页总传输 288KB 的 63%。
 *   2. 分包是**渐进到达**的，`display=swap` 又没做度量对齐（size-adjust），
 *      换字体时整页文字重排：长文 CLS 稳定 0.250（实测三次复现，整块上移 40px）。
 *   3. fonts.googleapis.com 在中国大陆不可达，中文读者最坏情况是「等超时再回退系统字体」。
 *
 * 系统栈在每个平台都落到该平台最优的中文字体（PingFang SC / 微软雅黑 / Noto Sans CJK），
 * 观感与 Noto Sans SC 同属现代黑体，差异细微；换来的是 182KB → 4KB、CLS 归零、
 * 课时页 LCP 3388ms → 656ms。
 *
 * **不要**再把中文字体加回这里。若某处确实需要非系统字体（如 /love 的宋体标题），
 * 用 serifFontsUrl 在**该页面**按需引入，不要放回全局。
 */
const SYSTEM_SANS_STACK =
	'system-ui, -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';

/**
 * 衬线栈：只给 /love 这类独立设计语言的页面用。
 * 保留本机衬线兜底（Source Han Serif / Songti SC / STSong），
 * 即使 webfont 没到也不会掉成通用 serif。
 */
const SERIF_STACK =
	'"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", Georgia, serif';

export const siteFontConfig: SiteFontConfig = {
	// 全局只保留等宽字体：拉丁字形集小、无 unicode-range 分包爆炸，
	// 且不在首屏竞争 LCP（只在代码块里用）。
	fonts: [
		{
			name: 'JetBrains Mono',
			weights: [400, 500, 700],
			styles: ['normal', 'italic'],
			preload: false,
		},
	],
	stacks: {
		body: SYSTEM_SANS_STACK,
		// 标题同用无衬线（2026-10 用户定调；/love 子站按自己的设计语言另用衬线，不受此影响）
		heading: SYSTEM_SANS_STACK,
		mono: '"JetBrains Mono", "SF Mono", Consolas, Menlo, monospace',
		serif: SERIF_STACK,
	},
	googleFontsUrl: buildGoogleFontsUrl([
		{ name: 'JetBrains Mono', weights: [400, 500, 700], styles: ['normal', 'italic'], preload: false },
	]),
	serifFontsUrl: buildGoogleFontsUrl([
		{ name: 'Noto Serif SC', weights: [400, 600, 700], styles: ['normal'], preload: true },
	]),
};
