import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const widget = style({
	margin: '0 16px 24px', padding: '22px 0 0', minWidth: 0,
	borderTop: `1px solid ${vars.color.border}`, color: vars.color.text,
});
export const heading = style({
	margin: '0 0 12px', fontFamily: vars.font.body, fontSize: '12px',
	fontWeight: 600, lineHeight: 1.6, color: vars.color.textMuted,
});
export const facts = style({ margin: 0 });
export const row = style({
	display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'baseline',
	gap: '6px 12px', padding: '5px 0', minWidth: 0, fontSize: '12px', lineHeight: 1.65,
});
export const rowLabel = style({ color: vars.color.textMuted, whiteSpace: 'nowrap' });
export const rowValue = style({
	display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px',
	minWidth: 0, margin: 0, color: vars.color.textStrong, fontWeight: 500,
	textAlign: 'right', overflowWrap: 'anywhere',
});
export const platformIcon = style({ width: '14px', height: '14px', objectFit: 'contain', flexShrink: 0 });
export const folderIcon = style({ width: '13px', height: '13px', color: vars.color.textMuted, flexShrink: 0 });
export const details = style({ marginTop: '12px', borderTop: `1px solid ${vars.color.border}` });
export const toggleRow = style({
	display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px',
	padding: '10px 0', listStyle: 'none', cursor: 'pointer', borderRadius: '3px',
	fontSize: '12px', lineHeight: 1.6, color: vars.color.textMuted,
	selectors: {
		'&:hover': { color: vars.color.accentStrong },
		'&:focus-visible': { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '3px' },
	},
});
globalStyle(`${toggleRow}::-webkit-details-marker`, { display: 'none' });
export const detailCount = style({ marginLeft: 'auto', fontSize: '11px', color: vars.color.textMeta, fontVariantNumeric: 'tabular-nums' });
export const toggleIcon = style({
	width: '13px', height: '13px', transition: 'transform 150ms ease',
	selectors: { [`${details}[open] &`]: { transform: 'rotate(90deg)' } },
});
export const versionList = style({ margin: '0 0 2px', padding: '0 0 6px' });
export const versionRow = style({
	display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'baseline', gap: '10px',
	padding: '5px 0', minWidth: 0, fontSize: '11px', lineHeight: 1.6,
});
export const versionLabel = style({ color: vars.color.textMuted });
export const versionValue = style({
	margin: 0, fontFamily: vars.font.mono, fontSize: '11px', fontWeight: 400,
	color: vars.color.textStrong, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
});
