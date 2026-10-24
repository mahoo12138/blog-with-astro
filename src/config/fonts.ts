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
	};
	googleFontsUrl: string;
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

export const siteFontConfig: SiteFontConfig = {
	fonts: [
		{
			name: 'Noto Sans SC',
			weights: [400, 500, 700],
			styles: ['normal'],
			preload: true,
		},
		{
			name: 'Noto Serif SC',
			weights: [400, 600, 700],
			styles: ['normal'],
			preload: true,
		},
		{
			name: 'JetBrains Mono',
			weights: [400, 500, 700],
			styles: ['normal', 'italic'],
			preload: false,
		},
	],
	stacks: {
		body: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
		// 标题同用无衬线（2026-10 用户定调；/love 子站按自己的设计语言另用衬线，不受此影响）
		heading: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
		mono: '"JetBrains Mono", Consolas, Menlo, monospace',
	},
	googleFontsUrl: buildGoogleFontsUrl([
		{ name: 'Noto Sans SC', weights: [400, 500, 700], styles: ['normal'], preload: true },
		{ name: 'Noto Serif SC', weights: [400, 600, 700], styles: ['normal'], preload: true },
		{ name: 'JetBrains Mono', weights: [400, 500, 700], styles: ['normal', 'italic'], preload: false },
	]),
};
