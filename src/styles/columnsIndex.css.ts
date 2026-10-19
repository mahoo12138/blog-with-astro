import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

// 专栏目录沿用站点 token；不依赖随机封面或为每个专题硬编码一套色板。
export const pageMain = style({ width: '100%', minWidth: 0, margin: 0, padding: 0 });
export const navigation = style({ paddingTop: vars.space.lg, paddingBottom: vars.space.md });
export const catalog = style({
	margin: '0 16px', minWidth: 0, containerType: 'inline-size', containerName: 'columns',
	'@media': { 'screen and (max-width: 667px)': { margin: 0 } },
});
export const header = style({
	display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px',
	padding: '28px 0 32px',
	'@container': { 'columns (max-width: 480px)': { alignItems: 'flex-start', flexDirection: 'column', gap: '16px', padding: '22px 0 26px' } },
});
export const title = style({
	margin: '0 0 10px', fontFamily: vars.font.heading, fontSize: 'clamp(1.9rem, 3.2vw, 2.35rem)',
	fontWeight: 650, lineHeight: 1.25, letterSpacing: '-0.03em', color: vars.color.textStrong,
});
export const description = style({ margin: 0, fontSize: '0.875rem', lineHeight: 1.8, color: vars.color.textMuted, textWrap: 'pretty' });
export const summary = style({
	display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0,
	margin: '0 0 2px', paddingLeft: '24px', borderLeft: `1px solid ${vars.color.border}`,
	fontSize: '0.75rem', lineHeight: 1.6, color: vars.color.textMuted,
	'@container': { 'columns (max-width: 480px)': { flexDirection: 'row', alignItems: 'baseline', gap: '20px', paddingLeft: 0, borderLeft: 0 } },
});
globalStyle(`${summary} strong`, { marginRight: '3px', fontFamily: vars.font.mono, fontSize: '0.875rem', fontWeight: 600, color: vars.color.textStrong });
export const grid = style({
	display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px',
	listStyle: 'none', margin: 0, padding: 0,
	'@container': { 'columns (max-width: 580px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' } },
});
export const item = style({ minWidth: 0, display: 'flex', margin: 0 });

export const card = style({
	position: 'relative', isolation: 'isolate', display: 'flex', flexDirection: 'column',
	width: '100%', minWidth: 0, padding: '24px 24px 12px',
	border: `1px solid ${vars.color.border}`, borderRadius: '12px',
	background: vars.color.surfaceStrong, color: vars.color.text,
	transition: 'border-color 160ms ease, box-shadow 160ms ease',
	selectors: {
		'&::before': { content: '""', position: 'absolute', top: '24px', left: '-1px', width: '2px', height: '30px', background: vars.color.accentStrong, borderRadius: '0 2px 2px 0' },
		'&:hover': { borderColor: vars.color.borderStrong, boxShadow: vars.shadow.head },
		'&:focus-within': { borderColor: vars.color.accentStrong },
	},
	'@container': { 'columns (max-width: 360px)': { padding: '20px 20px 10px' } },
});
export const cardMeta = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '22px' });
export const number = style({
	display: 'flex', alignItems: 'center', gap: '10px', fontFamily: vars.font.mono,
	fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 500, color: vars.color.textMeta,
	'::after': { content: '""', display: 'block', width: '22px', height: '1px', background: vars.color.borderStrong },
});
export const count = style({ fontSize: '0.75rem', lineHeight: 1.4, color: vars.color.textMuted, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' });
export const icon = style({ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 0 12px' });
export const cardTitle = style({
	margin: '0 0 12px', minWidth: 0, fontFamily: vars.font.heading, fontSize: '1.3rem',
	fontWeight: 650, lineHeight: 1.5, letterSpacing: '-0.015em', color: vars.color.textStrong,
	textWrap: 'pretty', overflowWrap: 'anywhere',
});
// 目录链接覆盖整张卡片；首篇入口独立置于上层，避免嵌套链接。
export const overviewLink = style({
	color: 'inherit', textDecoration: 'none',
	selectors: {
		'&::after': { content: '""', position: 'absolute', inset: 0, borderRadius: '12px' },
		'&:hover': { color: vars.color.accentStrong },
		'&:focus-visible': { outline: 'none' },
		'&:focus-visible::after': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '3px' },
	},
});
export const cardDescription = style({ margin: '0 0 24px', fontSize: '0.83rem', lineHeight: 1.85, color: vars.color.textMuted, overflowWrap: 'anywhere', textWrap: 'pretty' });
export const cardFooter = style({
	display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px',
	marginTop: 'auto', paddingTop: '8px', borderTop: `1px solid ${vars.color.border}`,
	// 窄屏避开页面右下角既有的悬浮导航按钮，阅读入口始终可点。
	'@media': { 'screen and (max-width: 900px)': { paddingRight: '40px' } },
});
export const overviewHint = style({ fontSize: '0.75rem', lineHeight: 1.5, color: vars.color.textMeta });
export const readLink = style({
	position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '7px',
	minHeight: '44px', padding: '8px 0 8px 8px', borderRadius: '4px',
	color: vars.color.accentStrong, fontSize: '0.78rem', fontWeight: 550, lineHeight: 1.5,
	textDecoration: 'none',
	selectors: { '&:hover': { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' } },
});
export const arrow = style({ width: '16px', height: '16px', flexShrink: 0, transition: 'transform 160ms ease', selectors: { [`${readLink}:hover &`]: { transform: 'translateX(2px)' } } });
export const empty = style({
	padding: '48px 24px', margin: 0, borderTop: `1px solid ${vars.color.border}`,
	borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textMuted,
	fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.8,
});
