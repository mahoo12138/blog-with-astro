import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const root = style({ position: 'relative', zIndex: 2 });
export const blur = style({
	margin: '0 16px', borderBottom: `1px solid ${vars.color.border}`,
	'@media': { 'screen and (max-width: 667px)': { margin: 0 } },
});
export const inner = style({ overflowX: 'auto', scrollbarWidth: 'thin', maxWidth: '100%' });
export const nav = style({ display: 'flex', gap: '20px', width: 'max-content', fontSize: '0.875rem' });
export const item = style({
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
	minHeight: '44px', padding: '10px 2px', borderBottom: '2px solid transparent',
	whiteSpace: 'nowrap', lineHeight: 1.5, fontWeight: 500, color: vars.color.textMuted,
	selectors: { '&:hover': { color: vars.color.textStrong, borderBottomColor: vars.color.borderStrong } },
});
export const active = style({ color: vars.color.textStrong, fontWeight: 600, borderBottomColor: vars.color.accentStrong });
export const disabled = style({ opacity: 0.52, cursor: 'default', pointerEvents: 'none' });
