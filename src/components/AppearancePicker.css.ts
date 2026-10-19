import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const trigger = style({
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
	minHeight: '36px', padding: '6px 10px', border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.sm, background: vars.color.surface, color: vars.color.textMuted,
	fontSize: '0.78rem', lineHeight: 1.3, cursor: 'pointer',
	selectors: { '&:hover': { color: vars.color.accentStrong, borderColor: vars.color.borderStrong }, '&:disabled': { opacity: 0.5, cursor: 'default' } },
});
export const triggerCompact = style({ width: '40px', height: '40px', padding: '8px', borderColor: 'transparent', background: 'transparent' });
// 侧栏工具与 RSS、明暗切换共用同样的轻量图标语言；其他入口不受影响。
export const triggerToolbar = style({
	width: '40px', height: '40px', minHeight: '40px', padding: '10px', border: 0,
	borderRadius: '6px', background: 'transparent', color: vars.color.textMuted,
	selectors: {
		'&:hover': { color: vars.color.accentStrong, background: vars.color.accentSoft },
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '2px' },
	},
	'@media': { '(pointer: coarse)': { width: '44px', height: '44px' } },
});
globalStyle(`${trigger} svg`, { width: '18px', height: '18px', flexShrink: 0 });

export const dialog = style({
	width: 'min(480px, calc(100vw - 32px))', maxHeight: 'calc(100dvh - 32px)',
	margin: 'auto', padding: '24px', overflowY: 'auto', overscrollBehavior: 'contain',
	border: `1px solid ${vars.color.borderStrong}`, borderRadius: '14px',
	background: vars.color.surfaceStrong, color: vars.color.text, boxShadow: '0 20px 70px rgba(0, 0, 0, 0.18)',
	'@media': { '(max-width: 420px)': { padding: '20px' } },
});
globalStyle(`${dialog}::backdrop`, { background: 'rgba(15, 18, 22, 0.35)' });
export const header = style({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '4px' });
export const title = style({ fontFamily: vars.font.body, fontSize: '1.15rem', fontWeight: 650, lineHeight: 1.5, margin: 0, letterSpacing: 0 });
export const subtitle = style({ color: vars.color.textMuted, fontSize: '0.82rem', margin: '0 0 22px', lineHeight: 1.7 });
export const closeButton = style({
	width: '36px', height: '36px', display: 'grid', placeItems: 'center', flexShrink: 0,
	border: 0, background: 'transparent', color: vars.color.textMuted, borderRadius: '6px', cursor: 'pointer',
	selectors: { '&:hover': { background: vars.color.surfaceMuted, color: vars.color.textStrong } },
});
globalStyle(`${closeButton} svg`, { width: '18px', height: '18px' });
export const fieldset = style({ border: 0, padding: 0, margin: '0 0 22px', minWidth: 0 });
export const legend = style({ padding: 0, marginBottom: '10px', fontSize: '0.82rem', fontWeight: 600, color: vars.color.textStrong });
export const modes = style({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px' });
export const schemes = style({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' });
export const option = style({
	position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0,
	minHeight: '44px', padding: '10px', border: `1px solid ${vars.color.border}`, borderRadius: '8px', cursor: 'pointer',
	background: vars.color.surfaceStrong, color: vars.color.text, fontSize: '0.8rem', lineHeight: 1.5,
	transition: 'border-color 120ms ease, background-color 120ms ease',
	selectors: {
		'&:hover': { borderColor: vars.color.borderStrong },
		'&[data-selected="true"]': { background: vars.color.accentSoft, borderColor: vars.color.accentStrong },
		'&:has(:focus-visible)': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '3px' },
	},
});
export const schemeOption = style({ display: 'grid', gridTemplateColumns: '14px minmax(0, 1fr)', alignContent: 'start', alignItems: 'start', padding: '12px', minHeight: '96px' });
export const defaultOption = style({ gridColumn: '1 / -1', minHeight: '76px' });
export const radio = style({ margin: 0, width: '14px', height: '14px', flexShrink: 0, accentColor: vars.color.accentStrong, cursor: 'pointer' });
globalStyle(`${schemeOption} ${radio}`, { marginTop: '3px' });
export const label = style({ fontSize: '0.8rem', fontWeight: 600, minWidth: 0, color: vars.color.textStrong });
export const description = style({ display: 'block', color: vars.color.textMuted, fontSize: '0.72rem', fontWeight: 400 });
export const swatches = style({ display: 'flex', gridColumn: '2', alignItems: 'center', gap: '4px', width: '100%', marginTop: '2px' });
export const swatch = style({ width: '18px', height: '18px', border: '1px solid rgba(128, 128, 128, 0.3)', borderRadius: '50%', background: 'var(--swatch-light)' });
globalStyle(`:root[data-theme="dark"] ${swatch}`, { background: 'var(--swatch-dark)' });
globalStyle(`:root:not([data-theme="light"]) ${swatch}`, { '@media': { '(prefers-color-scheme: dark)': { background: 'var(--swatch-dark)' } } });
export const footer = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '14px', borderTop: `1px solid ${vars.color.border}` });
export const reset = style({ background: 'transparent', border: 0, borderRadius: '6px', padding: '8px 0', color: vars.color.accentStrong, fontSize: '0.8rem', cursor: 'pointer', minHeight: '40px' });
export const status = style({ margin: 0, color: vars.color.textMuted, fontSize: '0.72rem', lineHeight: 1.6, flex: '1 1 190px', textAlign: 'right' });
