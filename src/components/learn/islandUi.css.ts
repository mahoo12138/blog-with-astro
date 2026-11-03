import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * 学苑课时 React island 的共享外壳。
 *
 * 只放两类东西：一块与正文节奏一致的卡面，以及 ghost 控件 / 小标签的统一形态。
 * 这样新加的 island 不必各写一套 padding、圆角和 hover —— 与 kl-* 套件的
 * ghostButtonCss 保持同一套视觉约定。
 */

export const root = style({
	margin: `0 0 ${vars.space.xl}`,
	minWidth: 0,
	padding: 'clamp(18px, 3vw, 28px)',
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
});

export const eyebrow = style({
	margin: 0,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.11em',
	textTransform: 'uppercase',
	color: vars.color.accentStrong,
});

export const title = style({
	margin: `${vars.space.sm} 0 0`,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
	lineHeight: 1.4,
	letterSpacing: '-0.02em',
	color: vars.color.textStrong,
});

export const lead = style({
	margin: `${vars.space.sm} 0 ${vars.space.lg}`,
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.textMuted,
});

export const groupLabel = style({
	display: 'block',
	margin: `0 0 ${vars.space.xs}`,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.09em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const segmentRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '6px',
});

export const segment = style({
	padding: '6px 12px',
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.pill,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	fontSize: '12px',
	fontWeight: 600,
	lineHeight: 1.4,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, border-color ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&[aria-pressed="true"]': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accent,
			color: vars.color.accentStrong,
		},
		'&:focus-visible': {
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '3px',
		},
	},
});

export const control = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minHeight: '32px',
	padding: '5px 12px',
	border: 'none',
	borderRadius: vars.radius.pill,
	background: 'transparent',
	color: vars.color.accentStrong,
	font: 'inherit',
	fontSize: '12px',
	fontWeight: 600,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, transform ${vars.motion.durationFast} ${vars.motion.ease}, opacity ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover:not(:disabled)': { background: vars.color.accentSoft },
		'&:active:not(:disabled)': { transform: 'scale(0.96)' },
		'&:focus-visible': {
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '3px',
		},
		'&:disabled': {
			opacity: 0.35,
			cursor: 'default',
		},
	},
});

