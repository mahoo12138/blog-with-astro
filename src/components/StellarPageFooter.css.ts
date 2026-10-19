import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../styles/theme.css';

// 页脚与文章列表共用水平对齐线，不使用额外底色或卡片容器。
export const root = style({
	minWidth: 0,
	margin: 'clamp(40px, 5vw, 64px) 16px 0',
	padding: '24px 0 8px',
	borderTop: `1px solid ${vars.color.border}`,
	fontFamily: vars.font.body,
	color: vars.color.textMuted,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			margin: '40px 0 0',
			paddingTop: '20px',
			paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
		},
	},
});

export const sitemap = style({
	display: 'grid',
	gap: '8px',
	minWidth: 0,
});

export const sitemapGroup = style({
	display: 'grid',
	gridTemplateColumns: '3rem minmax(0, 1fr)',
	columnGap: '16px',
	alignItems: 'start',
	minWidth: 0,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { columnGap: '12px', },
	},
});

export const groupTitle = style({
	display: 'flex',
	alignItems: 'center',
	minHeight: '32px',
	margin: 0,
	fontFamily: vars.font.body,
	fontSize: '0.75rem',
	fontWeight: 500,
	lineHeight: 1.6,
	letterSpacing: '0.04em',
	color: vars.color.textMuted,
	overflowWrap: 'anywhere',
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { minHeight: '44px', },
	},
});

export const links = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	columnGap: '20px',
	rowGap: '4px',
	minWidth: 0,
	margin: 0,
	padding: 0,
	listStyle: 'none',
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { columnGap: '16px', rowGap: 0, },
	},
});

export const item = style({ minWidth: 0, margin: 0, padding: 0 });

export const link = style({
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: '32px',
	maxWidth: '100%',
	padding: '4px 0',
	borderRadius: '2px',
	fontSize: '0.8125rem',
	fontWeight: 400,
	lineHeight: 1.6,
	color: vars.color.textMuted,
	textDecoration: 'underline',
	textDecorationColor: 'transparent',
	textDecorationThickness: '1px',
	textUnderlineOffset: '4px',
	overflowWrap: 'anywhere',
	transition: 'color 140ms ease, text-decoration-color 140ms ease',
	selectors: {
		'&:hover': { color: vars.color.accentStrong, textDecorationColor: 'currentColor' },
		'&:focus-visible': {
			color: vars.color.accentStrong,
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '3px',
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { minHeight: '44px', },
	},
});

export const text = style({
	margin: '20px 0 0',
	fontSize: '0.75rem',
	fontWeight: 400,
	lineHeight: 1.8,
	color: vars.color.textMeta,
	overflowWrap: 'anywhere',
	'@media': {
		// 给右下角侧栏按钮留出文字安全区，不截断版权和构建信息。
		[`screen and (max-width: ${breakpoints.mobile})`]: { paddingInlineEnd: '56px', textWrap: 'balance' },
	},
});
