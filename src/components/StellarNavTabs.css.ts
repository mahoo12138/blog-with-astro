import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const root = style({ position: 'relative', zIndex: 2 });
export const blur = style({
	margin: '0 16px', borderBottom: `1px solid ${vars.color.border}`,
	'@media': { 'screen and (max-width: 667px)': { margin: 0 } },
});
export const inner = style({
	display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '100%',
});
export const nav = style({
	display: 'flex', gap: '20px', fontSize: '0.875rem',
	// 横向溢出只在 nav 内部滚动，不挤压右侧搜索框。
	flex: '1 1 auto', minWidth: 0, overflowX: 'auto', scrollbarWidth: 'thin',
});
export const item = style({
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
	minHeight: '44px', padding: '10px 2px', borderBottom: '2px solid transparent',
	whiteSpace: 'nowrap', lineHeight: 1.5, fontWeight: 500, color: vars.color.textMuted,
	selectors: { '&:hover': { color: vars.color.textStrong, borderBottomColor: vars.color.borderStrong } },
});
export const active = style({ color: vars.color.textStrong, fontWeight: 600, borderBottomColor: vars.color.accentStrong });
export const disabled = style({ opacity: 0.52, cursor: 'default', pointerEvents: 'none' });

// 站内搜索触发器：静态图标 + 文字，点击唤起搜索面板（见 StellarSearchModal）。
export const searchTrigger = style({
	flexShrink: 0,
	display: 'flex',
	alignItems: 'center',
	gap: '6px',
	height: '36px',
	margin: '4px 0',
	padding: '0 8px',
	border: 0,
	borderRadius: '8px',
	background: 'transparent',
	fontFamily: vars.font.body,
	fontSize: '0.8125rem',
	color: vars.color.textMuted,
	cursor: 'pointer',
	transition: 'background-color 150ms ease, color 150ms ease, transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
	selectors: {
		'&:hover': { background: vars.color.accentSoft, color: vars.color.textStrong },
		'&:active': { transform: 'scale(0.96)' },
		'&:focus-visible': { outline: 'none', boxShadow: vars.shadow.focus },
	},
});

export const searchTriggerIcon = style({ width: '15px', height: '15px' });

export const searchTriggerText = style({
	whiteSpace: 'nowrap',
	lineHeight: 1,
	// 窄屏只留图标。
	'@media': { 'screen and (max-width: 667px)': { display: 'none' } },
});

export const searchTriggerKbd = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '20px',
	height: '20px',
	padding: '0 5px',
	borderRadius: '6px',
	border: `1px solid ${vars.color.border}`,
	fontFamily: vars.font.body,
	fontSize: '10px',
	lineHeight: 1,
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
	selectors: {
		[`${searchTrigger}:hover &`]: { color: vars.color.textMuted },
	},
	// 窄屏只留图标。
	'@media': { 'screen and (max-width: 667px)': { display: 'none' } },
});
