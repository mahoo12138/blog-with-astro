import { globalStyle, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

export const main = style({
	width: '100%',
	margin: 0,
	padding: 0,
});

export const root = style({
	margin: vars.space.lg,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			margin: `${vars.space.lg} 0`,
		},
	},
});

export const header = style({
	display: 'grid',
	gap: vars.space.lg,
	marginBottom: vars.space.lg,
	padding: vars.space.lg,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
});

export const kicker = style({
	margin: 0,
	fontSize: '0.75rem',
	fontWeight: 700,
	lineHeight: 1.2,
	textTransform: 'uppercase',
	color: vars.color.accentStrong,
});

export const title = style({
	margin: `${vars.space.xs} 0 0`,
	fontSize: 'calc(1rem + 10px)',
	fontWeight: 700,
	lineHeight: 1.2,
	letterSpacing: 0,
	color: vars.color.textStrong,
});

export const form = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	gap: vars.space.sm,
	alignItems: 'center',
});

export const input = style({
	width: '100%',
	minWidth: 0,
	height: '44px',
	padding: `0 ${vars.space.md}`,
	border: `1px solid ${vars.color.borderStrong}`,
	borderRadius: vars.radius.sm,
	background: vars.color.surfaceMuted,
	color: vars.color.textStrong,
	fontSize: '0.95rem',
	outline: 'none',
	selectors: {
		// 焦点底衬由全局输入控件规则统一给出（theme.css.ts），这里只染边框，
		// 不再叠 4px 外光晕 —— 那在视觉上就是一圈外框。
		'&:focus': {
			borderColor: vars.color.accent,
		},
		'&::placeholder': {
			color: vars.color.textMeta,
		},
	},
});

export const submit = style({
	height: '44px',
	padding: `0 ${vars.space.lg}`,
	border: 0,
	borderRadius: vars.radius.sm,
	background: vars.color.textStrong,
	color: vars.color.surfaceStrong,
	fontSize: '0.9rem',
	fontWeight: 700,
	cursor: 'pointer',
	selectors: {
		'&:hover': {
			background: vars.color.accentStrong,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: vars.shadow.focus,
		},
	},
});

export const status = style({
	margin: 0,
	fontSize: '0.875rem',
	lineHeight: 1.5,
	color: vars.color.textMuted,
});

export const results = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
});

export const empty = style({
	marginTop: vars.space.lg,
	padding: `${vars.space.xxl} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
	color: vars.color.textMuted,
	fontSize: '0.95rem',
	lineHeight: 1.6,
	textAlign: 'center',
	selectors: {
		'&[hidden]': {
			display: 'none',
		},
	},
});

export const more = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '100%',
	minHeight: '44px',
	marginTop: vars.space.lg,
	border: 0,
	borderRadius: vars.radius.sm,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.head,
	color: vars.color.textStrong,
	fontSize: '0.9rem',
	fontWeight: 700,
	cursor: 'pointer',
	selectors: {
		'&[hidden]': {
			display: 'none',
		},
		'&:hover': {
			color: vars.color.accentStrong,
		},
		'&:disabled': {
			cursor: 'wait',
			opacity: 0.7,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: vars.shadow.focus,
		},
	},
});

globalStyle('.search-result-item', {
	margin: `0 0 ${vars.space.lg}`,
});

globalStyle('.search-result-link', {
	display: 'block',
	padding: vars.space.lg,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
	color: vars.color.text,
});

globalStyle('.search-result-link:hover', {
	transform: 'translateY(-1px)',
	boxShadow: vars.shadow.head,
});

globalStyle('.search-result-title', {
	margin: `0 0 ${vars.space.xs}`,
	fontSize: 'calc(1rem + 3px)',
	fontWeight: 700,
	lineHeight: 1.35,
	letterSpacing: 0,
	color: vars.color.textStrong,
});

globalStyle('.search-result-url', {
	display: 'block',
	marginBottom: vars.space.md,
	fontSize: '0.78rem',
	lineHeight: 1.4,
	color: vars.color.textMeta,
	overflowWrap: 'anywhere',
});

globalStyle('.search-result-excerpt', {
	margin: 0,
	fontSize: '0.92rem',
	lineHeight: 1.65,
	color: vars.color.text,
});

globalStyle('.search-result-excerpt mark', {
	padding: '0.05em 0.2em',
	borderRadius: '4px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
});