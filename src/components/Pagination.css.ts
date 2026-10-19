import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const root = style({
	display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', alignItems: 'center',
	gap: '8px', margin: '24px 16px', paddingTop: '16px', borderTop: `1px solid ${vars.color.border}`,
	'@media': {
		'screen and (max-width: 667px)': { margin: '24px 0' },
		'screen and (max-width: 400px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	},
});
export const button = style({
	display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
	minHeight: '44px', padding: '8px 12px', borderRadius: vars.radius.sm,
	color: vars.color.text, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5, whiteSpace: 'nowrap',
	selectors: { '&:hover': { background: vars.color.accentSoft, color: vars.color.accentStrong } },
});
export const disabled = style({ pointerEvents: 'none', opacity: 0.45, cursor: 'not-allowed' });
export const indicator = style({
	color: vars.color.textMuted, fontFamily: vars.font.mono, fontSize: '0.75rem', textAlign: 'center',
	'@media': { 'screen and (max-width: 400px)': { gridColumn: '1 / -1', gridRow: '1', paddingBottom: '4px' } },
});
