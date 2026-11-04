import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../styles/theme.css';

/**
 * ViewportRuler —— 移动端适配方案沙盘。
 *
 * 结构上用「留白 + 一块预览画布」分隔，不画分区线：画布本身已经是一条
 * 强边界，再加发丝线只会把卡面切碎。
 */

export const head = style({
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	flexWrap: 'wrap',
	gap: vars.space.md,
});

export const controls = style({
	display: 'grid',
	gap: vars.space.md,
	margin: `0 0 ${vars.space.xl}`,
	paddingTop: vars.space.lg,
	borderTop: `1px solid ${vars.color.border}`,
});

export const row = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: vars.space.sm,
	minWidth: 0,
});

export const field = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.sm,
	minWidth: 0,
});

export const fieldLabel = style({
	fontFamily: vars.font.mono,
	fontSize: '10px',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const readout = style({
	fontFamily: vars.font.mono,
	fontSize: '11.5px',
	fontWeight: 600,
	color: vars.color.textStrong,
	fontVariantNumeric: 'tabular-nums',
	whiteSpace: 'nowrap',
});

export const slider = style({
	flex: '1 1 180px',
	minWidth: '120px',
	maxWidth: '360px',
	accentColor: vars.color.accent,
	cursor: 'pointer',
});

export const stage = style({
	position: 'relative',
	display: 'block',
	margin: `0 0 ${vars.space.lg}`,
	// 内容列比 375 视口还窄时（手机阅读），画布保持真实宽度，允许横向拖动，
	// 而不是压扁预览 —— 压扁就看不到「这个视口到底放不放得下」了。
	overflowX: 'auto',
	paddingBottom: '2px',
});

export const screenWrap = style({
	position: 'relative',
	margin: '0 auto',
	overflow: 'hidden',
	borderRadius: '12px',
	background: vars.color.surfaceMuted,
	boxShadow: `0 0 0 1px ${vars.color.border}`,
});

export const screen = style({
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
	background: vars.color.surfaceMuted,
});

export const ratioTrack = style({
	position: 'relative',
	height: '6px',
	margin: `0 0 ${vars.space.lg}`,
	borderRadius: '999px',
	background: vars.color.surfaceMuted,
	overflow: 'hidden',
});

export const ratioFill = style({
	position: 'absolute',
	inset: '0 auto 0 0',
	borderRadius: '999px',
	transition: `width ${vars.motion.durationBase} ${vars.motion.ease}, background ${vars.motion.durationBase} ${vars.motion.ease}`,
});

export const statusBar = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	flex: '0 0 auto',
	height: '26px',
	padding: '0 12px',
	background: vars.color.surface,
	borderBottom: `1px solid ${vars.color.border}`,
	fontFamily: vars.font.mono,
	fontSize: '9px',
	letterSpacing: '0.04em',
	color: vars.color.textMeta,
});

export const previewCard = style({
	position: 'relative',
	flex: '0 0 auto',
	boxSizing: 'border-box',
	background: vars.color.surface,
	border: `1px solid ${vars.color.borderStrong}`,
});

export const divider = style({
	height: '1px',
	background: vars.color.border,
});

export const metrics = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
	gap: vars.space.md,
	margin: `0 0 ${vars.space.md}`,
});

export const metric = style({
	padding: `10px ${vars.space.md}`,
	borderRadius: '8px',
	background: vars.color.surfaceMuted,
	minWidth: 0,
});

export const metricLabel = style({
	display: 'block',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.07em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const metricValue = style({
	display: 'block',
	marginTop: '2px',
	fontFamily: vars.font.mono,
	fontSize: '15px',
	fontWeight: 700,
	lineHeight: 1.35,
	color: vars.color.textStrong,
	fontVariantNumeric: 'tabular-nums',
});

export const metricSub = style({
	display: 'block',
	fontSize: '10.5px',
	lineHeight: 1.5,
	color: vars.color.textMuted,
});

export const verdictList = style({
	display: 'grid',
	gap: '6px',
	margin: `0 0 ${vars.space.sm}`,
	padding: 0,
	listStyle: 'none',
});

export const verdict = style({
	display: 'flex',
	alignItems: 'flex-start',
	gap: '6px',
	fontSize: '12px',
	lineHeight: 1.75,
	color: vars.color.textMuted,
});

export const verdictWarn = style({
	color: vars.tone.warning.fg,
});

export const dot = style({
	flex: '0 0 auto',
	width: '5px',
	height: '5px',
	marginTop: '7px',
	borderRadius: '50%',
	background: 'currentColor',
});

export const footnote = style({
	margin: 0,
	fontSize: '11.5px',
	lineHeight: 1.75,
	color: vars.color.textMeta,
});

export const landscape = style({
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			marginLeft: 'calc(-1 * 8px)',
			marginRight: 'calc(-1 * 8px)',
		},
	},
});
