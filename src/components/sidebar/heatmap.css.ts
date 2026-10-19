import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const widget = style({ margin: '0 16px 28px', minWidth: 0, overflow: 'visible' });
export const headingRow = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' });
export const heading = style({ margin: 0, fontFamily: vars.font.body, fontSize: '12px', fontWeight: 600, lineHeight: 1.6, color: vars.color.textMuted });
export const period = style({ fontSize: '11px', lineHeight: 1.6, color: vars.color.textMeta, whiteSpace: 'nowrap' });
export const body = style({ overflow: 'visible' });
export const chart = style({ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '10px', overflow: 'visible' });
export const weeks = style({ display: 'flex', gap: '3px', overflow: 'visible' });
export const week = style({ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'visible' });
export const weekdays = style({ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 });
export const weekday = style({ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '16px', fontSize: '10px', lineHeight: 1, color: vars.color.textMeta });
export const cell = style({
	display: 'block', width: '16px', height: '16px', borderRadius: '3px',
	border: '1px solid transparent', overflow: 'visible',
	transition: 'border-color 150ms ease, box-shadow 150ms ease',
	selectors: {
		'&:hover': { borderColor: vars.color.accentStrong, boxShadow: `0 0 0 2px ${vars.color.accentSoft}` },
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '2px' },
	},
});
// 活跃程度仍使用五档，不再混入与站点无关的独立绿色色板。
export const level0 = style({ background: `color-mix(in srgb, ${vars.color.textStrong} 7%, ${vars.color.background})` });
export const level1 = style({ background: `color-mix(in srgb, ${vars.color.accentStrong} 25%, ${vars.color.background})` });
export const level2 = style({ background: `color-mix(in srgb, ${vars.color.accentStrong} 45%, ${vars.color.background})` });
export const level3 = style({ background: `color-mix(in srgb, ${vars.color.accentStrong} 70%, ${vars.color.background})` });
export const level4 = style({ background: vars.color.accentStrong });
// 提示固定在图表下方且保持在侧栏内部，避免向左越界后被侧栏滚动容器裁切。
export const tooltip = style({
	position: 'absolute', top: 'calc(100% + 10px)', left: 0, zIndex: 20,
	display: 'block', width: '100%', maxWidth: '224px', padding: '12px',
	border: `1px solid ${vars.color.borderStrong}`, borderRadius: '6px',
	background: vars.color.surfaceStrong, boxShadow: vars.shadow.head, color: vars.color.text,
	fontSize: '12px', lineHeight: 1.6, textAlign: 'left', whiteSpace: 'normal',
	visibility: 'hidden', opacity: 0, pointerEvents: 'none',
	transition: 'opacity 120ms ease, visibility 120ms ease',
});
export const tooltipDate = style({ display: 'block', marginBottom: '3px', fontFamily: vars.font.mono, fontSize: '11px', color: vars.color.textMuted });
export const tooltipStats = style({ display: 'block', marginBottom: '4px', color: vars.color.textStrong, fontSize: '12px', fontWeight: 600 });
export const tooltipPosts = style({ display: 'grid', gap: '3px' });
export const tooltipPost = style({ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: vars.color.text });
export const summary = style({ margin: '14px 0 0', fontSize: '12px', lineHeight: 1.85, color: vars.color.textMuted, textWrap: 'balance' });
globalStyle(`${cell}:hover ${tooltip}, ${cell}:focus-visible ${tooltip}`, { visibility: 'visible', opacity: 1 });
