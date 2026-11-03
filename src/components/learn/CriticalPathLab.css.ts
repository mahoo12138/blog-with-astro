import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * CriticalPathLab —— 渲染阻塞模型。
 *
 * 甘特图用绝对定位的 bar 表示相对时间区间；颜色一律取语义 tone，
 * 不用写死 hex。横轴刻度与轨道共用同一套左右内边距，保证刻度对齐。
 */

export const controls = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
	gap: vars.space.md,
	marginBottom: vars.space.lg,
});

export const controlGroup = style({
	minWidth: 0,
	padding: vars.space.md,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceMuted,
});

export const gantt = style({
	padding: vars.space.lg,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.md,
	background: vars.color.backgroundElevated,
	minWidth: 0,
});

export const ganttScroll = style({
	overflowX: 'auto',
	// 窄屏时保留最小可读宽度，右缘渐隐提示还有内容。
	'@media': {
		'(max-width: 560px)': {
			maskImage: 'linear-gradient(to right, #000 92%, transparent)',
			WebkitMaskImage: 'linear-gradient(to right, #000 92%, transparent)',
		},
	},
});

export const ganttInner = style({
	minWidth: '470px',
});

export const row = style({
	display: 'grid',
	gridTemplateColumns: '86px minmax(0, 1fr)',
	alignItems: 'center',
	gap: '8px',
	padding: '3px 0',
});

export const rowLabel = style({
	fontFamily: vars.font.mono,
	fontSize: '10.5px',
	lineHeight: 1.4,
	color: vars.color.textMuted,
	whiteSpace: 'nowrap',
});

export const track = style({
	position: 'relative',
	height: '20px',
	borderRadius: '4px',
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	overflow: 'hidden',
});

export const bar = style({
	position: 'absolute',
	top: '3px',
	height: '12px',
	borderRadius: '3px',
	minWidth: '2px',
	transition: `left ${vars.motion.durationSlow} ${vars.motion.ease}, width ${vars.motion.durationSlow} ${vars.motion.ease}, background ${vars.motion.durationBase} ${vars.motion.ease}`,
});

export const barKind = styleVariants({
	html: { background: vars.color.accent },
	css: { background: vars.tone.info.fg },
	js: { background: vars.tone.warning.fg },
	image: { background: vars.tone.success.fg },
	font: { background: vars.color.textMeta },
	block: { background: vars.tone.danger.fg },
	fontBlock: { background: vars.tone.danger.fg, opacity: 0.72 },
});

export const axis = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(5, 1fr)',
	marginLeft: '94px',
	marginTop: '5px',
	fontFamily: vars.font.mono,
	fontSize: '9px',
	fontVariantNumeric: 'tabular-nums',
	color: vars.color.textMeta,
});

export const axisTick = style({
	selectors: {
		'&:last-child': { textAlign: 'right' },
		'&:first-child': { textAlign: 'left' },
		'&:not(:first-child):not(:last-child)': { textAlign: 'center' },
	},
});

export const milestones = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '6px 14px',
	marginTop: vars.space.sm,
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontVariantNumeric: 'tabular-nums',
	color: vars.color.textMeta,
});

export const milestoneStrong = style({
	fontWeight: 800,
	color: vars.color.textStrong,
});

export const legend = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '6px 14px',
	marginTop: vars.space.md,
	fontSize: '10.5px',
	color: vars.color.textMeta,
});

export const legendDot = style({
	display: 'inline-block',
	width: '8px',
	height: '8px',
	marginRight: '4px',
	borderRadius: '2px',
	verticalAlign: 'baseline',
});

export const summary = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
	gap: vars.space.sm,
	marginTop: vars.space.lg,
});

export const metric = style({
	padding: vars.space.md,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	minWidth: 0,
});

export const metricLabel = style({
	display: 'block',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.05em',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const metricValue = style({
	display: 'block',
	marginTop: '2px',
	fontFamily: vars.font.mono,
	fontSize: '1.1rem',
	fontWeight: 800,
	fontVariantNumeric: 'tabular-nums',
	color: vars.color.textStrong,
	lineHeight: 1.3,
});

export const metricHint = style({
	display: 'block',
	marginTop: '1px',
	fontSize: '10px',
	color: vars.color.textMeta,
});

export const insight = style({
	margin: `${vars.space.md} 0 0`,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.color.accentSoft,
	fontSize: '12.5px',
	lineHeight: 1.85,
	color: vars.color.text,
});

export const modelNote = style({
	margin: `${vars.space.sm} 0 0`,
	fontSize: '11px',
	lineHeight: 1.75,
	color: vars.color.textMeta,
});
