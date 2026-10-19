import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

const SERIF_STACK = '"Cormorant Garamond", "Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif';

/* ----------------------------- Page shell ----------------------------- */

export const pageRoot = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '2.5rem',
	margin: `${vars.space.lg} 0 ${vars.space.xxxl}`,
	fontFamily: SERIF_STACK,
	color: vars.color.textStrong,
});

/* ------------------------------- Header ------------------------------- */

export const header = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	alignItems: 'end',
	gap: vars.space.xl,
	padding: `${vars.space.sm} 0 ${vars.space.lg}`,
	borderBottom: `1px solid ${vars.color.textStrong}`,
	'@media': {
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			gridTemplateColumns: '1fr',
			gap: vars.space.md,
		},
	},
});

export const kicker = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.6em',
	margin: 0,
	fontFamily: vars.font.body,
	fontSize: '11px',
	fontWeight: 700,
	lineHeight: 1,
	letterSpacing: '0.32em',
	textTransform: 'uppercase',
	color: vars.color.textMuted,
	'::before': {
		content: '""',
		display: 'inline-block',
		width: '28px',
		height: '1px',
		background: 'currentColor',
	},
});

export const title = style({
	margin: '0.4rem 0 0',
	fontFamily: SERIF_STACK,
	fontSize: 'clamp(2.4rem, 5.2vw, 3.6rem)',
	fontWeight: 500,
	lineHeight: 1.05,
	letterSpacing: '-0.01em',
	fontStyle: 'italic',
	color: vars.color.textStrong,
});

export const description = style({
	maxWidth: '36rem',
	margin: '0.85rem 0 0',
	fontFamily: vars.font.body,
	fontSize: '13.5px',
	lineHeight: 1.75,
	color: vars.color.textMuted,
	letterSpacing: '0.01em',
});

export const meta = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
	gap: '0.2rem',
	'@media': {
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			alignItems: 'flex-start',
			flexDirection: 'row',
			gap: '0.6rem',
		},
	},
});

export const metaCount = style({
	fontFamily: SERIF_STACK,
	fontSize: '2.8rem',
	fontWeight: 500,
	fontStyle: 'italic',
	lineHeight: 1,
	letterSpacing: '-0.02em',
	color: vars.color.textStrong,
});

export const metaLabel = style({
	fontFamily: vars.font.body,
	fontSize: '10px',
	fontWeight: 700,
	lineHeight: 1,
	letterSpacing: '0.32em',
	textTransform: 'uppercase',
	color: vars.color.textMuted,
});

/* --------------------------- Justified grid --------------------------- */

/*
 * 每张图设置 flex-grow: ratio 与 flex-basis: ratio * baseH，
 * 同时 height: baseH。浏览器在 flex-wrap 时会自然按行排版，
 * 同一行内的图被按比例拉伸至等宽，等高排版让视觉秩序统一。
 */

export const masonry = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '8px',
});

const fadeUp = keyframes({
	from: { opacity: 0, transform: 'translateY(8px)' },
	to: { opacity: 1, transform: 'translateY(0)' },
});

export const tile = style({
	position: 'relative',
	height: '240px',
	overflow: 'hidden',
	borderRadius: '6px',
	cursor: 'zoom-in',
	background: vars.color.backgroundElevated,
	border: 'none',
	margin: 0,
	animation: `${fadeUp} 520ms ease both`,
	transition: 'transform 320ms cubic-bezier(0.2, 0.7, 0.2, 1)',
	selectors: {
		'&:hover': {
			transform: 'translateY(-2px)',
			zIndex: 2,
		},
		'&::after': {
			content: '""',
			position: 'absolute',
			inset: 0,
			background: 'linear-gradient(180deg, transparent 50%, rgba(15, 20, 30, 0.55))',
			opacity: 0,
			transition: 'opacity 280ms ease',
			pointerEvents: 'none',
		},
		'&:hover::after': {
			opacity: 1,
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.laptop})`]: { height: '210px' },
		[`screen and (max-width: ${breakpoints.tablet})`]: { height: '180px' },
		[`screen and (max-width: ${breakpoints.mobile})`]: { height: '140px' },
	},
});

export const image = style({
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	transition: 'transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
	selectors: {
		[`${tile}:hover &`]: {
			transform: 'scale(1.04)',
		},
	},
});

export const tileIndex = style({
	position: 'absolute',
	top: '10px',
	left: '12px',
	zIndex: 3,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 600,
	letterSpacing: '0.18em',
	color: 'rgba(255, 255, 255, 0.95)',
	mixBlendMode: 'difference',
	opacity: 0.9,
	pointerEvents: 'none',
});

export const tileCaption = style({
	position: 'absolute',
	left: '12px',
	right: '12px',
	bottom: '10px',
	zIndex: 3,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-end',
	gap: vars.space.sm,
	color: 'rgba(255, 255, 255, 0.94)',
	opacity: 0,
	transform: 'translateY(4px)',
	transition: 'opacity 280ms ease, transform 280ms ease',
	pointerEvents: 'none',
	selectors: {
		[`${tile}:hover &`]: {
			opacity: 1,
			transform: 'translateY(0)',
		},
	},
});

export const tileCaptionDate = style({
	fontFamily: vars.font.mono,
	fontSize: '10px',
	letterSpacing: '0.18em',
	textTransform: 'uppercase',
});

export const tileCaptionDims = style({
	fontFamily: vars.font.mono,
	fontSize: '10px',
	letterSpacing: '0.16em',
	opacity: 0.78,
});

/* Spacer 防止末行最后一个图被过度拉伸 */
export const spacer = style({
	flexGrow: 10,
	height: 0,
});

/* --------------------------- Empty / error --------------------------- */

export const empty = style({
	padding: `${vars.space.xxl} ${vars.space.xl}`,
	border: `1px dashed ${vars.color.borderStrong}`,
	textAlign: 'center',
	color: vars.color.textMuted,
	fontFamily: vars.font.body,
	fontSize: '14px',
	lineHeight: 1.7,
	letterSpacing: '0.02em',
});

export const errorBox = style([
	empty,
	{
		borderStyle: 'solid',
		borderColor: vars.color.accent,
		color: vars.color.text,
	},
]);

/* ------------------------------ Lightbox ------------------------------ */

export const lightbox = style({
	position: 'fixed',
	inset: 0,
	zIndex: 999,
	display: 'none',
	alignItems: 'center',
	justifyContent: 'center',
	padding: vars.space.xl,
	background: `color-mix(in srgb, ${vars.color.background} 96%, transparent)`,
	backdropFilter: 'blur(8px)',
	selectors: {
		'&[data-open="true"]': {
			display: 'flex',
		},
	},
});

export const lightboxImage = style({
	maxWidth: 'min(88vw, 1400px)',
	maxHeight: '82vh',
	objectFit: 'contain',
	boxShadow: vars.shadow.head,
	transition: 'opacity 180ms ease',
	selectors: {
		'&[data-loading="true"]': {
			opacity: 0.3,
		},
	},
});

const lightboxBtnBase = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: `1px solid ${vars.color.borderStrong}`,
	background: vars.color.surfaceStrong,
	color: vars.color.textStrong,
	cursor: 'pointer',
	transition: 'background 180ms ease, border-color 180ms ease, transform 180ms ease',
} as const;

export const lightboxClose = style({
	...lightboxBtnBase,
	position: 'absolute',
	top: vars.space.lg,
	right: vars.space.lg,
	width: '44px',
	height: '44px',
	fontSize: '18px',
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accentStrong,
		},
	},
});

export const lightboxPrev = style({
	...lightboxBtnBase,
	position: 'absolute',
	left: vars.space.lg,
	top: '50%',
	transform: 'translateY(-50%)',
	width: '52px',
	height: '52px',
	fontSize: '24px',
	fontWeight: 300,
	lineHeight: 1,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accentStrong,
			transform: 'translateY(-50%) translateX(-2px)',
		},
		'&:disabled': {
			opacity: 0.25,
			cursor: 'not-allowed',
			transform: 'translateY(-50%)',
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			left: '8px',
			width: '40px',
			height: '40px',
			fontSize: '20px',
		},
	},
});

export const lightboxNext = style({
	...lightboxBtnBase,
	position: 'absolute',
	right: vars.space.lg,
	top: '50%',
	transform: 'translateY(-50%)',
	width: '52px',
	height: '52px',
	fontSize: '24px',
	fontWeight: 300,
	lineHeight: 1,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accentStrong,
			transform: 'translateY(-50%) translateX(2px)',
		},
		'&:disabled': {
			opacity: 0.25,
			cursor: 'not-allowed',
			transform: 'translateY(-50%)',
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			right: '8px',
			width: '40px',
			height: '40px',
			fontSize: '20px',
		},
	},
});

export const lightboxInfo = style({
	position: 'absolute',
	bottom: vars.space.lg,
	left: '50%',
	transform: 'translateX(-50%)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '4px',
	pointerEvents: 'none',
	textAlign: 'center',
});

export const lightboxCounter = style({
	fontFamily: vars.font.mono,
	fontSize: '11px',
	fontWeight: 600,
	letterSpacing: '0.24em',
	textTransform: 'uppercase',
	color: vars.color.textMuted,
});

export const lightboxCaption = style({
	fontFamily: vars.font.mono,
	fontSize: '11px',
	letterSpacing: '0.12em',
	color: vars.color.textMuted,
});

/* 防止全局标题样式覆盖 h1 字体 */
globalStyle(`${title}`, {
	fontFamily: SERIF_STACK,
});
