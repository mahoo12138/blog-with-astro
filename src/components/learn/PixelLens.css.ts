import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../styles/theme.css';

/**
 * PixelLens —— 把 1 CSS 像素拆成物理像素格。
 *
 * 网格线是语义正确的：它画的就是像素边界，不是装饰性分割线。
 */

export const layout = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr)',
	gap: vars.space.xl,
	alignItems: 'start',
	margin: `0 0 ${vars.space.lg}`,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gridTemplateColumns: 'minmax(0, 1fr)',
		},
	},
});

export const lensPane = style({
	minWidth: 0,
});

export const lensCaption = style({
	display: 'block',
	margin: `0 0 ${vars.space.sm}`,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.07em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const grid = style({
	display: 'grid',
	gap: '1px',
	padding: '1px',
	background: vars.color.borderStrong,
	borderRadius: '5px',
	overflow: 'hidden',
	width: 'fit-content',
});

export const cell = style({
	width: '15px',
	height: '15px',
	background: vars.color.surface,
});

export const covered = style({
	background: `color-mix(in srgb, ${vars.color.accent} 58%, transparent)`,
});

export const axis = style({
	display: 'flex',
	gap: vars.space.md,
	marginTop: vars.space.sm,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	lineHeight: 1.6,
	color: vars.color.textMeta,
});

export const note = style({
	margin: 0,
	fontSize: '12.5px',
	lineHeight: 1.85,
	color: vars.color.textMuted,
});

export const noteStrong = style({
	margin: `0 0 6px`,
	fontSize: '13px',
	fontWeight: 700,
	lineHeight: 1.6,
	color: vars.color.textStrong,
});

export const swatchList = style({
	display: 'grid',
	gap: '2px',
	margin: `0 0 ${vars.space.md}`,
});

export const swatchRow = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(72px, auto) minmax(0, 1fr) minmax(64px, auto)',
	alignItems: 'center',
	gap: vars.space.md,
	width: '100%',
	padding: '9px 10px',
	border: 'none',
	borderRadius: '7px',
	background: 'transparent',
	color: 'inherit',
	font: 'inherit',
	textAlign: 'left',
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': { background: vars.color.accentSoft },
		'&[aria-pressed="true"]': { background: vars.color.accentSoft },
		'&:focus-visible': {
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '2px',
		},
	},
});

export const swatchName = style({
	fontFamily: vars.font.mono,
	fontSize: '11px',
	fontWeight: 600,
	color: vars.color.textStrong,
	whiteSpace: 'nowrap',
});

export const swatchValue = style({
	justifySelf: 'end',
	fontFamily: vars.font.mono,
	fontSize: '10.5px',
	color: vars.color.textMeta,
	fontVariantNumeric: 'tabular-nums',
	whiteSpace: 'nowrap',
});

export const swatch = style({
	position: 'relative',
	height: '18px',
	borderRadius: '4px',
	background: vars.color.surfaceMuted,
	overflow: 'hidden',
});

export const line = style({
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	background: vars.color.accentStrong,
});

export const noteBlock = style({
	padding: `${vars.space.md} 0 0`,
});

export const footRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.sm,
});

export const hint = style({
	margin: 0,
	fontSize: '11.5px',
	lineHeight: 1.7,
	color: vars.color.textMeta,
});

export const tiny = style({
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gridTemplateColumns: 'minmax(0, 1fr)',
		},
	},
});
