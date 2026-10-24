import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';
import { siteFontConfig } from '../config/fonts';

export const breakpoints = {
	mobile: '667px',
	tablet: '768px',
	laptop: '1180px',
} as const;

export const vars = createGlobalTheme(':root', {
	color: {
		accent: '#476b92',
		accentStrong: '#365b81',
		accentSoft: 'rgba(71, 107, 146, 0.08)',
		background: '#fafafa',
		backgroundElevated: '#f4f4f5',
		surface: '#ffffff',
		surfaceStrong: '#ffffff',
		surfaceMuted: '#fafafa',
		textStrong: '#202327',
		text: '#373b41',
		textMuted: '#606770',
		textMeta: '#69717b',
		border: '#e8e9eb',
		borderStrong: '#d7dadd',
		codeBackground: 'rgba(33, 150, 243, 0.10)',
		codeText: 'rgba(13, 35, 64, 0.92)',
	},
	space: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '0.75rem',
		lg: '1rem',
		xl: '1.5rem',
		xxl: '2rem',
		xxxl: '3rem',
		xxxxl: '4rem',
		section: '6rem',
	},
	radius: {
		sm: '6px',
		md: '10px',
		lg: '14px',
		xl: '20px',
		pill: '999px',
	},
	shadow: {
		head: '0 2px 12px rgba(0, 0, 0, 0.035)',
		card: '0 1px 3px rgba(0, 0, 0, 0.025)',
		focus: '0 0 0 4px rgba(33, 150, 243, 0.18)',
		float: '0 18px 55px rgba(27, 44, 69, 0.08)',
	},
	// 动效统一缓动与时长三档（150–240ms、不回弹）。
	// 与 tools.css.ts 的 EASE 注释同源，新代码一律引用本组，不再各写常量。
	motion: {
		ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
		durationFast: '150ms',
		durationBase: '200ms',
		durationSlow: '240ms',
	},
	// 语义色调（callout / 状态徽标 / 教学强调）。bg 一律低透明度 halo，
	// 近白底上禁止再叠近白填充 —— 反馈元素必须与底色拉开明度差。
	tone: {
		info: {
			fg: '#2457d6',
			bg: 'color-mix(in srgb, #2457d6 10%, transparent)',
		},
		success: {
			fg: '#0d7f76',
			bg: 'color-mix(in srgb, #0d7f76 10%, transparent)',
		},
		warning: {
			fg: '#b4690e',
			bg: 'color-mix(in srgb, #b4690e 10%, transparent)',
		},
		danger: {
			fg: '#c23a4b',
			bg: 'color-mix(in srgb, #c23a4b 10%, transparent)',
		},
	},
	layout: {
		content: '46rem',
		listing: '60rem',
		shell: '72rem',
		header: '4.5rem',
	},
	font: {
		body: siteFontConfig.stacks.body,
		heading: siteFontConfig.stacks.heading,
		mono: siteFontConfig.stacks.mono,
	},
});

const lightThemeVars = {
	[vars.color.accent]: '#476b92',
	[vars.color.accentStrong]: '#365b81',
	[vars.color.accentSoft]: 'rgba(71, 107, 146, 0.08)',
	[vars.color.background]: '#fafafa',
	[vars.color.backgroundElevated]: '#f4f4f5',
	[vars.color.surface]: '#ffffff',
	[vars.color.surfaceStrong]: '#ffffff',
	[vars.color.surfaceMuted]: '#fafafa',
	[vars.color.textStrong]: '#202327',
	[vars.color.text]: '#373b41',
	[vars.color.textMuted]: '#606770',
	[vars.color.textMeta]: '#69717b',
	[vars.color.border]: '#e8e9eb',
	[vars.color.borderStrong]: '#d7dadd',
	[vars.color.codeBackground]: 'rgba(33, 150, 243, 0.10)',
	[vars.color.codeText]: 'rgba(13, 35, 64, 0.92)',
	[vars.shadow.head]: '0 2px 12px rgba(0, 0, 0, 0.035)',
	[vars.shadow.card]: '0 1px 3px rgba(0, 0, 0, 0.025)',
	[vars.shadow.focus]: '0 0 0 4px rgba(33, 150, 243, 0.18)',
	[vars.shadow.float]: '0 18px 55px rgba(27, 44, 69, 0.08)',
	[vars.tone.info.fg]: '#2457d6',
	[vars.tone.info.bg]: 'color-mix(in srgb, #2457d6 10%, transparent)',
	[vars.tone.success.fg]: '#0d7f76',
	[vars.tone.success.bg]: 'color-mix(in srgb, #0d7f76 10%, transparent)',
	[vars.tone.warning.fg]: '#b4690e',
	[vars.tone.warning.bg]: 'color-mix(in srgb, #b4690e 10%, transparent)',
	[vars.tone.danger.fg]: '#c23a4b',
	[vars.tone.danger.bg]: 'color-mix(in srgb, #c23a4b 10%, transparent)',
};

const darkThemeVars = {
	[vars.color.accent]: '#9ab5d3',
	[vars.color.accentStrong]: '#b7cde6',
	[vars.color.accentSoft]: 'rgba(154, 181, 211, 0.12)',
	[vars.color.background]: '#151719',
	[vars.color.backgroundElevated]: '#202326',
	[vars.color.surface]: '#1c1f22',
	[vars.color.surfaceStrong]: '#1c1f22',
	[vars.color.surfaceMuted]: '#202326',
	[vars.color.textStrong]: 'rgba(241, 245, 249, 0.96)',
	[vars.color.text]: 'rgba(241, 245, 249, 0.82)',
	[vars.color.textMuted]: '#b0b6be',
	[vars.color.textMeta]: '#a1a8b2',
	[vars.color.border]: 'rgba(148, 163, 184, 0.16)',
	[vars.color.borderStrong]: 'rgba(148, 163, 184, 0.24)',
	[vars.color.codeBackground]: 'rgba(126, 203, 255, 0.12)',
	[vars.color.codeText]: 'rgba(224, 242, 254, 0.96)',
	[vars.shadow.head]: '0 2px 12px rgba(0, 0, 0, 0.12)',
	[vars.shadow.card]: '0 1px 3px rgba(0, 0, 0, 0.10)',
	[vars.shadow.focus]: '0 0 0 4px rgba(126, 203, 255, 0.22)',
	[vars.shadow.float]: '0 18px 55px rgba(0, 0, 0, 0.45)',
	[vars.tone.info.fg]: '#8fb3f0',
	[vars.tone.info.bg]: 'color-mix(in srgb, #8fb3f0 14%, transparent)',
	[vars.tone.success.fg]: '#5fc4b4',
	[vars.tone.success.bg]: 'color-mix(in srgb, #5fc4b4 14%, transparent)',
	[vars.tone.warning.fg]: '#e0b070',
	[vars.tone.warning.bg]: 'color-mix(in srgb, #e0b070 14%, transparent)',
	[vars.tone.danger.fg]: '#e8949f',
	[vars.tone.danger.bg]: 'color-mix(in srgb, #e8949f 14%, transparent)',
};

globalStyle(':root', {
	colorScheme: 'light dark',
	'@media': {
		'(prefers-color-scheme: dark)': {
			vars: darkThemeVars,
		},
	},
});

globalStyle(':root[data-theme="light"]', {
	colorScheme: 'light',
	vars: lightThemeVars,
});

globalStyle(':root[data-theme="dark"]', {
	colorScheme: 'dark',
	vars: darkThemeVars,
});

// 非博客默认主题：把原始 TinyShip 变量映射到现有的语义 token。
// 保留原始 OKLCH 色值、字体与布局；仅派生阅读链接/弱文字的对比色，
// 避免把原主题中用于按钮填充的亮色直接用于小号正文链接。
globalStyle(':root[data-color-scheme]', {
	vars: {
		[vars.color.background]: 'var(--background)',
		[vars.color.backgroundElevated]: 'var(--muted)',
		[vars.color.surface]: 'var(--card)',
		[vars.color.surfaceStrong]: 'var(--card)',
		[vars.color.surfaceMuted]: 'var(--muted)',
		[vars.color.textStrong]: 'var(--foreground)',
		[vars.color.text]: 'var(--foreground)',
		[vars.color.textMuted]: 'color-mix(in srgb, var(--muted-foreground) 40%, var(--foreground))',
		[vars.color.textMeta]: 'color-mix(in srgb, var(--muted-foreground) 40%, var(--foreground))',
		[vars.color.accent]: 'color-mix(in srgb, var(--primary) 40%, var(--foreground))',
		[vars.color.accentStrong]: 'color-mix(in srgb, var(--primary) 40%, var(--foreground))',
		[vars.color.accentSoft]: 'var(--accent)',
		[vars.color.border]: 'var(--border)',
		[vars.color.borderStrong]: 'color-mix(in srgb, var(--border) 70%, var(--foreground))',
		[vars.color.codeBackground]: 'var(--muted)',
		[vars.color.codeText]: 'var(--foreground)',
		[vars.shadow.focus]: '0 0 0 3px color-mix(in srgb, var(--ring) 25%, transparent)',
	},
});

// 背景统一引用主题 token，显式主题与系统主题不再产生两套底色。

globalStyle('*', {
	boxSizing: 'border-box',
});

globalStyle('html', {
	backgroundColor: vars.color.background,
	scrollBehavior: 'smooth',
	scrollbarGutter: 'stable',
	scrollbarWidth: 'thin',
	scrollbarColor: `${vars.color.borderStrong} transparent`,
});

globalStyle('body', {
	margin: 0,
	minHeight: '100vh',
	fontFamily: vars.font.body,
	fontSize: '18px',
	lineHeight: 1.8,
	color: vars.color.text,
	textAlign: 'left',
	textRendering: 'optimizeLegibility',
	wordBreak: 'normal',
	overflowWrap: 'break-word',
	background: vars.color.background,
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: vars.color.background,
		},
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			fontSize: '17px',
		},
	},
});

globalStyle(':root[data-theme="light"] body', {
	background: vars.color.background,
});

globalStyle(':root[data-theme="dark"] body', {
	background: vars.color.background,
});


globalStyle('h1, h2, h3, h4, h5, h6', {
	margin: `0 0 ${vars.space.md}`,
	color: vars.color.textStrong,
	lineHeight: 1.1,
	letterSpacing: '-0.025em',
	fontFamily: vars.font.heading,
});

globalStyle('h1', {
	fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
});

globalStyle('h2', {
	fontSize: 'clamp(2rem, 4vw, 3.1rem)',
});

globalStyle('h3', {
	fontSize: 'clamp(1.45rem, 3vw, 2rem)',
});

globalStyle('h4', {
	fontSize: '1.25rem',
});

globalStyle('h5', {
	fontSize: '1.1rem',
});

globalStyle('strong, b', {
	fontWeight: 700,
	color: vars.color.textStrong,
});

globalStyle('a', {
	color: vars.color.accentStrong,
	textDecoration: 'none',
	textUnderlineOffset: '0.18em',
	transition: 'color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
});

globalStyle('a:hover', {
	color: vars.color.accent,
});

globalStyle(':where(a, button, input, textarea, select, summary, [tabindex]):focus-visible', {
	outline: `2px solid ${vars.color.accentStrong}`,
	outlineOffset: '3px',
});
globalStyle(':where(h1, h2, h3, h4, h5, h6, [id])', { scrollMarginTop: '80px' });
globalStyle('html', { '@media': { '(prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' } } });
globalStyle('*, *::before, *::after', {
	'@media': { '(prefers-reduced-motion: reduce)': {
		animationDuration: '0.01ms !important', animationIterationCount: '1 !important',
		// 直接禁用过渡；极小的非零时长仍会延迟子元素继承 visibility，影响立即聚焦。
		transitionDuration: '0s !important', transitionDelay: '0s !important', scrollBehavior: 'auto',
	} },
});

globalStyle('::view-transition-old(root), ::view-transition-new(root)', {
	'@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
});

globalStyle('p, ul, ol, blockquote, pre, table', {
	margin: `0 0 ${vars.space.xl}`,
});

globalStyle('ul, ol', {
	paddingInlineStart: vars.space.xl,
});

globalStyle('textarea, input, button', {
	font: 'inherit',
});

globalStyle('table', {
	width: '100%',
	borderCollapse: 'collapse',
	fontSize: '0.95rem',
});

globalStyle('th, td', {
	padding: `${vars.space.sm} ${vars.space.md}`,
	borderBottom: `1px solid ${vars.color.border}`,
	textAlign: 'left',
});

globalStyle('img', {
	maxWidth: '100%',
	height: 'auto',
	display: 'block',
	borderRadius: vars.radius.md,
});

globalStyle('code', {
	padding: '0.15em 0.4em',
	borderRadius: vars.radius.sm,
	backgroundColor: vars.color.codeBackground,
	color: vars.color.codeText,
	fontFamily: vars.font.mono,
	fontSize: '0.875em',
});

globalStyle('pre', {
	padding: vars.space.xl,
	borderRadius: vars.radius.md,
	border: `1px solid ${vars.color.borderStrong}`,
	overflowX: 'auto',
	whiteSpace: 'pre-wrap',
	overflowWrap: 'anywhere',
	backgroundColor: vars.color.surfaceStrong,
	boxShadow: 'none',
	color: vars.color.codeText,
});

globalStyle('pre > code', {
	all: 'unset',
	fontFamily: vars.font.mono,
	color: vars.color.codeText,
	fontSize: '0.9rem',
	lineHeight: 1.65,
});

globalStyle(':root:not([data-theme="light"]) .astro-code, :root:not([data-theme="light"]) .astro-code span', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			backgroundColor: 'var(--shiki-dark-bg) !important',
			color: 'var(--shiki-dark) !important',
			fontStyle: 'var(--shiki-dark-font-style) !important',
			fontWeight: 'var(--shiki-dark-font-weight) !important',
			textDecoration: 'var(--shiki-dark-text-decoration) !important',
		},
	},
});

globalStyle(':root[data-theme="dark"] .astro-code, :root[data-theme="dark"] .astro-code span', {
	backgroundColor: 'var(--shiki-dark-bg) !important',
	color: 'var(--shiki-dark) !important',
	fontStyle: 'var(--shiki-dark-font-style) !important',
	fontWeight: 'var(--shiki-dark-font-weight) !important',
	textDecoration: 'var(--shiki-dark-text-decoration) !important',
});

globalStyle('blockquote', {
	margin: `0 0 ${vars.space.xxl}`,
	padding: `${vars.space.sm} ${vars.space.lg}`,
	borderLeft: `4px solid ${vars.color.accent}`,
	borderRadius: `0 ${vars.radius.lg} ${vars.radius.lg} 0`,
	backgroundColor: vars.color.surfaceMuted,
	color: vars.color.text,
});

globalStyle('hr', {
	border: 'none',
	borderTop: `1px solid ${vars.color.border}`,
	margin: `${vars.space.xxl} 0`,
});

globalStyle('::selection', {
	backgroundColor: vars.color.accentSoft,
	color: vars.color.textStrong,
});

/* ── 滚动条 (Webkit) ── */
globalStyle('::-webkit-scrollbar', {
	width: '6px',
	height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
	background: 'transparent',
});

globalStyle('::-webkit-scrollbar-thumb', {
	background: vars.color.borderStrong,
	borderRadius: vars.radius.pill,
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
	background: vars.color.textMeta,
});

globalStyle('.sr-only', {
	border: 0,
	padding: 0,
	margin: 0,
	position: 'absolute',
	height: '1px',
	width: '1px',
	overflow: 'hidden',
	clip: 'rect(1px, 1px, 1px, 1px)',
	clipPath: 'inset(50%)',
	whiteSpace: 'nowrap',
});