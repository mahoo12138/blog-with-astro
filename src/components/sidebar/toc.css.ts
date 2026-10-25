import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

// 目录是阅读导航，不是选项卡。仅用一条细轨道与当前章节标记表达位置。
export const widget = style({
	minWidth: 0, margin: '8px 12px 28px 16px', padding: 0,
	color: vars.color.textMuted,
});
export const header = style({
	display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
	minHeight: '40px', margin: '0 0 10px', padding: '4px 0',
	listStyle: 'none', cursor: 'pointer', borderRadius: '3px',
	selectors: {
		'&:hover': { color: vars.color.textStrong },
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '3px' },
	},
	'@media': { '(pointer: coarse)': { minHeight: '44px' } },
});
globalStyle(`${header}::-webkit-details-marker`, { display: 'none' });
export const title = style({ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.6, color: 'inherit' });
export const chevron = style({
	width: '14px', height: '14px', flexShrink: 0,
	transition: 'transform 150ms ease',
	selectors: { [`${widget}[open] &`]: { transform: 'rotate(90deg)' } },
});
export const viewport = style({
	minWidth: 0, maxHeight: 'min(62dvh, 560px)', padding: '3px 6px 3px 3px', marginLeft: '-3px',
	overflowY: 'auto', overflowX: 'hidden', overscrollBehaviorY: 'contain',
	scrollbarWidth: 'thin', scrollbarColor: `${vars.color.borderStrong} transparent`,
	scrollPaddingBlock: '16px',
	'@media': { 'screen and (max-width: 1180px)': { maxHeight: 'calc(100dvh - 180px)' } },
});
export const list = style({
	minWidth: 0, margin: 0, padding: 0, listStyle: 'none', borderLeft: `1px solid ${vars.color.border}`,
});
export const item = style({
	minWidth: 0, margin: 0, padding: 0, listStyle: 'none',
	selectors: { '&[data-toc-level="0"]:not(:first-child)': { marginTop: '8px' } },
});
export const link = style({
	display: 'flex', alignItems: 'center', position: 'relative', minWidth: 0,
	minHeight: '32px', padding: '5px 4px 5px calc(14px + var(--toc-level, 0) * 10px)',
	fontFamily: vars.font.body, fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.65,
	color: vars.color.textMuted, textDecoration: 'none', borderRadius: '0 3px 3px 0',
	transition: 'color 150ms ease',
	selectors: {
		'&:hover': { color: vars.color.textStrong, textDecoration: 'underline', textUnderlineOffset: '4px' },
		'&[aria-current="location"]': { color: vars.color.accentStrong },
		'&[aria-current="location"]::before': {
			content: '""', position: 'absolute', left: '-1px', top: '50%', width: '2px', height: '18px',
			borderRadius: '2px', background: vars.color.accentStrong, transform: 'translateY(-50%)',
		},
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '1px' },
		[`${item}[data-toc-level="0"] &`]: { fontWeight: 500 },
	},
	'@media': { '(pointer: coarse)': { minHeight: '44px', paddingBlock: '10px' } },
});
export const text = style({ minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'normal' });

// 左栏专用：贴齐 sidebarRows 的 16px 文本基线（侧栏 inner 已有内边距，不再叠加），
// 且取消 viewport 的定高 —— 左栏本身就是滚动容器，避免「侧栏 + 目录」双滚动条，
// 让目录随侧栏一并滚动、一次看全。右栏仍沿用上面的定高视口。
export const widgetLeft = style({ margin: '8px 0 24px' });
export const viewportLeft = style({ maxHeight: 'none' });
