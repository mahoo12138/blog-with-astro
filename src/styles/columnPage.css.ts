import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

export const main = style({
	width: '100%', maxWidth: '100%', margin: '0 auto', padding: 0,
});

export const article = style({
	display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 0, minWidth: 0,
});

// 专栏入口以排版而非横幅区分层级；与正文使用同一条左右对齐线。
export const header = style({
	minWidth: 0,
	margin: '0 16px',
	padding: '4px 0 24px',
	borderBottom: `1px solid ${vars.color.border}`,
	color: vars.color.textStrong,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { margin: 0, padding: '0 0 20px' },
	},
});

export const breadcrumbs = style({ marginBottom: '24px' });
export const breadcrumbList = style({
	display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
	listStyle: 'none', margin: 0, padding: 0,
	fontSize: '0.8125rem', lineHeight: 1.6, color: vars.color.textMuted,
});
export const breadcrumbLink = style({
	display: 'inline-flex', alignItems: 'center', minHeight: '32px',
	color: vars.color.textMuted, textDecoration: 'none', borderRadius: '3px',
	transition: 'color 150ms ease',
	selectors: {
		'&:hover': { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' },
	},
	'@media': { [`screen and (max-width: ${breakpoints.mobile})`]: { minHeight: '44px' } },
});
export const breadcrumbSeparator = style({ color: vars.color.textMeta });

export const title = style({
	margin: 0, minWidth: 0,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.85rem, 3.1vw, 2.35rem)',
	fontWeight: 650, lineHeight: 1.4, letterSpacing: '-0.025em',
	color: vars.color.textStrong, textWrap: 'balance', overflowWrap: 'anywhere',
});
export const description = style({
	margin: '14px 0 0', maxWidth: '56ch',
	fontSize: '0.9375rem', lineHeight: 1.85, color: vars.color.textMuted,
	textWrap: 'pretty', overflowWrap: 'anywhere',
});

export const headerBottom = style({
	display: 'flex', alignItems: 'center', justifyContent: 'space-between',
	flexWrap: 'wrap', gap: '12px 24px', marginTop: '24px',
});
export const chapterCount = style({
	margin: 0, fontSize: '0.8125rem', lineHeight: 1.7, color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});
export const countNumber = style({
	fontFamily: vars.font.mono, fontSize: '0.875rem', fontWeight: 500,
	color: vars.color.textStrong, fontVariantNumeric: 'tabular-nums',
});
export const actions = style({
	display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 16px',
});
// 这一行的两个入口是同一组导航词，不是一个「主按钮 + 次按钮」对：
// 共用一个色、同一套间距、同一套 hover / 聚焦反馈，不做视觉分级。
// 语义只由文字和箭头方向承担 —— ↓ 跳到页内目录，→ 离页进入第一章。
// hover 用文字下划线承接，与面包屑 / 正文链接同一套排版语言；
// 不叠淡晕底衬：底衬是输入框那类控件的反馈，贴在文字上会重新读成按钮。
const actionBase = style({
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
	minHeight: '44px', padding: '8px 0',
	fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5,
	whiteSpace: 'nowrap', textDecoration: 'none', borderRadius: '6px',
	color: vars.color.textMuted,
	transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1), text-decoration-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
	selectors: {
		'&:hover': { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' },
		'&:focus-visible': {
			color: vars.color.accentStrong,
			textDecoration: 'underline',
			textUnderlineOffset: '4px',
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '3px',
		},
	},
});
export const directoryLink = actionBase;
export const readLink = actionBase;
export const actionIcon = style({ width: '15px', height: '15px', flexShrink: 0 });
