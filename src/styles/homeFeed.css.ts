import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

export const main = style({
	width: '100%',
	margin: 0,
	padding: 0,
});

export const list = style({
	listStyle: 'none',
	margin: vars.space.lg,
	padding: 0,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			margin: `${vars.space.lg} 0`,
		},
	},
});

export const item = style({
	margin: 0,
});

export const header = style({
	position: 'relative',
	zIndex: 1,
	paddingTop: vars.space.lg,
	paddingBottom: vars.space.md,
	marginBottom: 0,
});

export const archiveMain = style({
	width: '100%',
	margin: 0,
	padding: 0,
});

export const archivePostList = style({
	margin: vars.space.lg,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			margin: `${vars.space.lg} 0`,
		},
	},
});

export const archiveSection = style({
	padding: vars.space.lg,
});

export const archiveYear = style({
	display: 'inline-block',
	fontFamily: vars.font.mono,
	fontWeight: 700,
	lineHeight: 1.2,
	margin: `0 0 0.5em`,
	position: 'relative',
	padding: '4px 0',
	fontSize: 'calc(1rem + 4px)',
	color: vars.color.textStrong,
	selectors: {
		'&:after': {
			content: '""',
			position: 'absolute',
			height: '4px',
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: -1,
			borderRadius: '4px',
			background: vars.color.accent,
		},
	},
});

export const archiveList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
});

export const archiveItem = style({
	margin: 0,
});

export const archiveLink = style({
	display: 'inline-flex',
	alignItems: 'baseline',
	margin: `${vars.space.xs} 0`,
	borderBottom: `1px dashed ${vars.color.textMeta}`,
	color: vars.color.textStrong,
	fontSize: '0.875rem',
	selectors: {
		'&:hover': {
			borderBottom: `1px solid ${vars.color.accent}`,
			color: vars.color.textStrong,
		},
	},
});

export const archiveDate = style({
	fontFamily: vars.font.mono,
	marginRight: '1em',
	fontWeight: 700,
	flexShrink: 0,
	color: vars.color.textMeta,
	selectors: {
		[`${archiveLink}:hover &`]: {
			color: vars.color.accentStrong,
		},
	},
});

export const archiveTitle = style({
	minWidth: 0,
	fontSize: '1rem',
	color: 'inherit',
});

/* ---------- 归档页下半段：专栏按系列聚合 ---------- */

export const archiveColumnSection = style({
	padding: vars.space.lg,
	marginTop: vars.space.xl,
	borderTop: `1px solid ${vars.color.border}`,
});

export const archiveColumnHeading = style({
	display: 'flex',
	alignItems: 'baseline',
	flexWrap: 'wrap',
	gap: vars.space.sm,
	margin: `0 0 ${vars.space.lg}`,
});

export const archiveColumnNote = style({
	fontSize: '0.82rem',
	color: vars.color.textMeta,
});

export const archiveColumnList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'grid',
	gap: vars.space.sm,
});

export const archiveColumnItem = style({
	margin: 0,
});

export const archiveColumnLink = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: vars.space.sm,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	textDecoration: 'none',
	color: vars.color.textStrong,
	selectors: {
		'&:hover': {
			borderColor: vars.color.accent,
			boxShadow: vars.shadow.card,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: vars.shadow.focus,
		},
	},
});

export const archiveColumnTitle = style({
	minWidth: 0,
	fontSize: '1rem',
	fontWeight: 500,
});

export const archiveColumnMeta = style({
	fontFamily: vars.font.mono,
	fontSize: '0.78rem',
	color: vars.color.textMeta,
});

export const archiveColumnDesc = style({
	flexBasis: '100%',
	margin: 0,
	fontSize: '0.82rem',
	lineHeight: 1.6,
	color: vars.color.textMuted,
});
