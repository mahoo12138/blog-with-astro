import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

/** /learn 课程索引 */

export const main = style({
	width: '100%',
	minWidth: 0,
});

export const header = style({
	margin: `0 0 ${vars.space.xxl}`,
});

export const crumbs = style({
	margin: `0 0 ${vars.space.md}`,
	fontSize: '0.82rem',
	color: vars.color.textMeta,
});

globalStyle(`${crumbs} a`, {
	color: vars.color.textMuted,
});

globalStyle(`${crumbs} a:hover`, {
	color: vars.color.accent,
});

export const title = style({
	fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
	margin: `0 0 ${vars.space.sm}`,
});

export const intro = style({
	color: vars.color.textMuted,
	fontSize: '0.95rem',
	lineHeight: 1.85,
	maxWidth: '46rem',
	margin: 0,
});

export const group = style({
	margin: `0 0 ${vars.space.xxxl}`,
});

export const groupTitle = style({
	fontSize: '13px',
	fontWeight: 600,
	letterSpacing: '0.06em',
	color: vars.color.textStrong,
	margin: `0 0 ${vars.space.md}`,
	display: 'flex',
	alignItems: 'baseline',
	gap: '8px',
});

export const groupMeta = style({
	fontSize: '0.7rem',
	color: vars.color.textMeta,
	fontWeight: 400,
});

export const grid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
	gap: vars.space.lg,
});

export const card = style({
	display: 'block',
	padding: vars.space.xl,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	boxShadow: vars.shadow.card,
	color: vars.color.text,
	textDecoration: 'none',
	transition: `transform ${vars.motion.durationFast} ${vars.motion.ease}, border-color ${vars.motion.durationFast} ${vars.motion.ease}, box-shadow ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			transform: 'translateY(-3px)',
			borderColor: vars.color.accent,
			boxShadow: `0 0 0 4px ${vars.color.accentSoft}`,
		},
	},
});

export const cardTitle = style({
	fontSize: '1.05rem',
	fontFamily: vars.font.heading,
	color: vars.color.textStrong,
	margin: `0 0 ${vars.space.xs}`,
	letterSpacing: '-0.01em',
});

export const cardDesc = style({
	fontSize: '0.8125rem',
	lineHeight: 1.8,
	color: vars.color.textMuted,
	margin: `0 0 ${vars.space.md}`,
});

export const cardMeta = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '8px',
	fontSize: '0.7rem',
	color: vars.color.textMeta,
});

export const badge = style({
	fontFamily: vars.font.mono,
	fontSize: '0.65rem',
	fontWeight: 700,
	letterSpacing: '0.06em',
	padding: '2px 8px',
	borderRadius: vars.radius.pill,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
});

export const empty = style({
	color: vars.color.textMeta,
	fontSize: '0.875rem',
	padding: `${vars.space.xl} 0`,
});
