import { globalStyle, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

// ExploreShell 也消费此布局类：入口页的视觉样式全部限定在 page 内。
export const pageMain = style({ width: '100%', margin: 0, padding: 0 });
export const page = style({
	minWidth: 0, margin: '0 16px', containerType: 'inline-size', containerName: 'explore-index',
	'@media': { [`screen and (max-width: ${breakpoints.mobile})`]: { margin: 0 } },
});
export const breadcrumbs = style({
	display: 'flex', alignItems: 'center', gap: '12px', minHeight: '40px',
	color: vars.color.textMuted, fontSize: '0.8125rem', lineHeight: 1.6,
});
globalStyle(`${breadcrumbs} a`, {
	display: 'inline-flex', alignItems: 'center', minHeight: '44px', color: 'inherit', borderRadius: '3px',
});
globalStyle(`${breadcrumbs} a:hover`, { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' });
export const header = style({ padding: '26px 0 34px' });
export const pageTitle = style({
	margin: 0, fontFamily: vars.font.heading, fontSize: 'clamp(2rem, 3.5vw, 2.65rem)',
	fontWeight: 650, lineHeight: 1.3, letterSpacing: '-0.025em', color: vars.color.textStrong,
});
export const introduction = style({
	margin: '14px 0 0', fontSize: '0.9375rem', lineHeight: 1.85, color: vars.color.textMuted,
	textWrap: 'pretty', overflowWrap: 'anywhere',
});
export const group = style({ padding: '24px 0 26px', borderTop: `1px solid ${vars.color.border}`, minWidth: 0 });
export const groupTitle = style({
	margin: '0 0 14px', fontFamily: vars.font.body, fontSize: '0.75rem', fontWeight: 600,
	lineHeight: 1.6, letterSpacing: '0.035em', color: vars.color.textMuted,
});
export const entries = style({
	display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 32px',
	listStyle: 'none', margin: 0, padding: 0,
	'@container': { 'explore-index (max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '8px' } },
});
export const item = style({ minWidth: 0, display: 'flex', margin: 0 });
export const entry = style({
	display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', alignItems: 'start', gap: '16px',
	width: '100%', minWidth: 0, padding: '12px 0', borderRadius: '6px', color: vars.color.textStrong,
	textDecoration: 'none', position: 'relative', isolation: 'isolate',
	'::before': {
		content: '""', position: 'absolute', inset: '0 -10px', zIndex: -1, borderRadius: '8px',
		background: vars.color.surfaceStrong, opacity: 0, transition: 'opacity 160ms ease',
	},
	selectors: {
		'&:hover': { color: vars.color.accentStrong },
		'&:hover::before': { opacity: 1 },
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '5px' },
	},
	'@container': { 'explore-index (max-width: 360px)': { gridTemplateColumns: '42px minmax(0, 1fr)', gap: '14px' } },
});
export const preview = style({ width: '48px', height: '48px', marginTop: '1px',
	'@container': { 'explore-index (max-width: 360px)': { width: '42px', height: '42px' } },
});
export const iconImage = style({ display: 'block', width: '100%', height: '100%', borderRadius: '10px', objectFit: 'contain' });
export const entryBody = style({ minWidth: 0 });
export const entryHeading = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', minWidth: 0 });
export const entryTitle = style({
	margin: 0, minWidth: 0, fontFamily: vars.font.heading, fontSize: '1.15rem', fontWeight: 650,
	lineHeight: 1.55, color: 'inherit', overflowWrap: 'anywhere', textWrap: 'pretty',
});
export const arrow = style({
	width: '16px', height: '16px', flexShrink: 0, alignSelf: 'center', color: vars.color.textMeta,
	transition: 'color 160ms ease, transform 160ms ease',
	selectors: { [`${entry}:hover &`]: { color: vars.color.accentStrong, transform: 'translateX(2px)' } },
});
export const entryDescription = style({
	margin: '6px 0 0', fontSize: '0.8125rem', lineHeight: 1.85,
	color: vars.color.textMuted, overflowWrap: 'anywhere', textWrap: 'pretty',
});
export const externalNote = style({ display: 'block', marginTop: '8px', fontSize: '0.6875rem', lineHeight: 1.7, color: vars.color.textMeta });
export const empty = style({ margin: 0, padding: '32px 0', borderTop: `1px solid ${vars.color.border}`, fontSize: '0.875rem', color: vars.color.textMuted });
