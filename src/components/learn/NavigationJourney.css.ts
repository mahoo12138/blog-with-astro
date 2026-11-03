import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * NavigationJourney —— 课时顶部的交互式导航时间线。
 *
 * 两栏用 auto-fit 而不是视口断点：课时正文只有 46rem，视口宽度不等于
 * 组件可用宽度；按容器自然折行才不会在侧栏展开时把两栏挤成一条缝。
 */

export const scenarioBar = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-end',
	justifyContent: 'space-between',
	gap: vars.space.md,
	marginBottom: vars.space.sm,
});

export const scenarioGroup = style({
	minWidth: 0,
});

export const scenarioHint = style({
	marginLeft: '2px',
	fontSize: '10.5px',
	color: vars.color.textMeta,
});

export const scenarioNote = style({
	margin: `0 0 ${vars.space.lg}`,
	minHeight: '3.2em',
	fontSize: '12px',
	lineHeight: 1.8,
	color: vars.color.textMeta,
});

export const layout = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
	gap: vars.space.xl,
	alignItems: 'start',
});

export const timeline = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'grid',
	gap: vars.space.md,
	minWidth: 0,
});

export const phaseGroup = style({
	minWidth: 0,
});

export const phaseLabel = style({
	display: 'flex',
	alignItems: 'center',
	gap: '7px',
	margin: `0 0 ${vars.space.xs}`,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.09em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const phaseCount = style({
	marginLeft: 'auto',
	fontWeight: 400,
	letterSpacing: 0,
	color: vars.color.textMeta,
});

export const dot = style({
	width: '7px',
	height: '7px',
	borderRadius: '50%',
	flex: 'none',
});

export const phaseDot = styleVariants({
	nav: { background: vars.color.accentStrong },
	network: { background: vars.tone.info.fg },
	parse: { background: vars.tone.warning.fg },
	render: { background: vars.tone.success.fg },
});

export const stageList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'grid',
	gap: '3px',
});

export const stageButton = style({
	display: 'grid',
	gridTemplateColumns: '24px minmax(0, 1fr) auto',
	alignItems: 'center',
	gap: '8px',
	width: '100%',
	padding: '7px 9px',
	border: '1px solid transparent',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	textAlign: 'left',
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, border-color ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&[aria-current="step"]': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accent,
			color: vars.color.accentStrong,
		},
		'&:focus-visible': {
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '2px',
		},
	},
});

export const stageIndex = style({
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	color: vars.color.textMeta,
	letterSpacing: '0.02em',
});

export const stageTitle = style({
	fontSize: '12px',
	fontWeight: 500,
	lineHeight: 1.5,
	minWidth: 0,
});

export const stageRtt = style({
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.02em',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
	selectors: {
		'&[data-skip="true"]': {
			color: vars.tone.warning.fg,
		},
	},
});

export const skipped = style({
	opacity: 0.62,
});

export const detail = style({
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceMuted,
	padding: vars.space.xl,
	minWidth: 0,
	minHeight: '100%',
	display: 'flex',
	flexDirection: 'column',
});

export const detailKicker = style({
	margin: `0 0 ${vars.space.xs}`,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
	color: vars.color.accentStrong,
});

export const detailTitle = style({
	margin: `0 0 ${vars.space.sm}`,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
	lineHeight: 1.4,
	letterSpacing: '-0.02em',
	color: vars.color.textStrong,
});

export const detailSummary = style({
	margin: `0 0 ${vars.space.md}`,
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.text,
});

export const detailText = style({
	margin: `0 0 ${vars.space.lg}`,
	fontSize: '12.5px',
	lineHeight: 1.9,
	color: vars.color.textMuted,
});

export const detailBlock = style({
	margin: `0 0 ${vars.space.md}`,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
});

export const blockLabel = style({
	display: 'block',
	marginBottom: '3px',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const blockValue = style({
	margin: 0,
	fontSize: '12px',
	lineHeight: 1.8,
	color: vars.color.text,
});

export const gotcha = style({
	margin: `0 0 ${vars.space.md}`,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.tone.warning.bg,
	border: `1px solid color-mix(in srgb, ${vars.tone.warning.fg} 24%, transparent)`,
	fontSize: '12px',
	lineHeight: 1.8,
	color: vars.color.text,
});

export const gotchaLabel = style({
	display: 'block',
	marginBottom: '3px',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.tone.warning.fg,
});

export const detailFoot = style({
	marginTop: 'auto',
	paddingTop: vars.space.md,
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: vars.space.sm,
});

export const budget = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: vars.space.md,
	marginTop: vars.space.lg,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.color.accentSoft,
});

export const budgetValue = style({
	fontFamily: vars.font.mono,
	fontSize: '1.15rem',
	fontWeight: 800,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1.2,
	color: vars.color.accentStrong,
	whiteSpace: 'nowrap',
});

export const meter = style({
	flex: '1 1 120px',
	height: '6px',
	borderRadius: vars.radius.pill,
	background: vars.color.surfaceStrong,
	overflow: 'hidden',
});

export const meterFill = style({
	display: 'block',
	height: '100%',
	borderRadius: vars.radius.pill,
	background: vars.color.accentStrong,
	transition: `width ${vars.motion.durationSlow} ${vars.motion.ease}`,
});

export const budgetText = style({
	margin: 0,
	flex: '1 1 220px',
	fontSize: '11.5px',
	lineHeight: 1.7,
	color: vars.color.textMuted,
});

export const navRow = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.sm,
	marginTop: vars.space.md,
});

export const progress = style({
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.06em',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const skipBadge = style({
	display: 'inline-flex',
	alignItems: 'center',
	padding: '3px 8px',
	borderRadius: vars.radius.pill,
	background: vars.tone.warning.bg,
	color: vars.tone.warning.fg,
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.05em',
});
