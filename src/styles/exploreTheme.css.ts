import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

/**
 * 普通 Astro CSS 与第三方弹层的稳定变量接口。
 * 只桥接全站语义 token，不在各探索页复制七套主题或猜测 vanilla-extract 哈希名。
 * 放在 :root，移动到 body 的相册预览/地图弹层也能继承。
 */
const semanticLight = {
	'--explore-success': '#166b40',
	'--explore-warning': '#875500',
	'--explore-love': '#b42349',
};
const semanticDark = {
	'--explore-success': '#8be0b0',
	'--explore-warning': '#f2cf86',
	'--explore-love': '#f9a2b7',
};

globalStyle(':root', {
	vars: {
		'--explore-bg': vars.color.background,
		'--explore-surface': vars.color.surfaceStrong,
		'--explore-surface-muted': vars.color.surfaceMuted,
		'--explore-text': vars.color.text,
		'--explore-text-strong': vars.color.textStrong,
		'--explore-text-muted': vars.color.textMuted,
		'--explore-text-meta': vars.color.textMeta,
		'--explore-border': vars.color.border,
		'--explore-border-strong': vars.color.borderStrong,
		'--explore-accent': vars.color.accent,
		'--explore-accent-strong': vars.color.accentStrong,
		'--explore-accent-soft': vars.color.accentSoft,
		'--explore-on-accent': vars.color.background,
		'--explore-accent-border': `color-mix(in srgb, ${vars.color.accent} 45%, ${vars.color.border})`,
		'--explore-grid': `color-mix(in srgb, ${vars.color.textStrong} 6%, transparent)`,
		'--explore-shadow': vars.shadow.card,
		'--explore-shadow-hover': vars.shadow.head,
		'--explore-focus': vars.shadow.focus,
		'--explore-preview': `linear-gradient(135deg, ${vars.color.accentSoft}, ${vars.color.surfaceMuted})`,
		'--explore-success-soft': `color-mix(in srgb, var(--explore-success) 10%, ${vars.color.surfaceStrong})`,
		'--explore-warning-soft': `color-mix(in srgb, var(--explore-warning) 10%, ${vars.color.surfaceStrong})`,
		...semanticLight,
	},
	'@media': { '(prefers-color-scheme: dark)': { vars: semanticDark } },
});
globalStyle(':root[data-theme="light"]', { vars: semanticLight });
globalStyle(':root[data-theme="dark"]', { vars: semanticDark });
