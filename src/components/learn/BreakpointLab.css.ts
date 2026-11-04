import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * BreakpointLab —— 同一个卡片组件，放在「视口够宽但容器很窄」的位置。
 *
 * @media 问的是视口，所以它不会响应容器的收缩；@container 问的是最近一个
 * container-type 祖先，所以它会。这个 demo 把两种卡片叠在同一个可变宽度的
 * 容器里，差别一眼可见，不需要解释。
 */

const cardBase = {
	display: 'flex',
	gap: '10px',
	padding: '12px',
	borderRadius: '8px',
	background: vars.color.surface,
	border: `1px solid ${vars.color.border}`,
	minWidth: 0,
} as const;

export const controls = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: vars.space.sm,
	margin: `0 0 ${vars.space.lg}`,
});

export const slider = style({
	flex: '1 1 180px',
	minWidth: '120px',
	maxWidth: '380px',
	accentColor: vars.color.accent,
	cursor: 'pointer',
});

export const stage = style({
	display: 'flex',
	justifyContent: 'center',
	margin: `0 0 ${vars.space.md}`,
});

export const hostFrame = style({
	maxWidth: '100%',
	padding: '14px',
	borderRadius: '10px',
	background: vars.color.surfaceMuted,
	transition: `width ${vars.motion.durationFast} ${vars.motion.ease}`,
});

export const hostHead = style({
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: '8px',
	marginBottom: '12px',
	fontFamily: vars.font.mono,
	fontSize: '10px',
	letterSpacing: '0.05em',
	color: vars.color.textMeta,
});

export const cqHost = style({
	containerType: 'inline-size',
	marginBottom: '18px',
});

export const cqCard = style({
	...cardBase,
	flexDirection: 'column',
	alignItems: 'stretch',
	'@container': {
		'(min-width: 460px)': {
			flexDirection: 'row',
			alignItems: 'center',
		},
	},
});

export const mqHost = style({
	overflow: 'hidden',
});

export const mqCard = style({
	...cardBase,
	flexDirection: 'column',
	alignItems: 'stretch',
	'@media': {
		'screen and (min-width: 640px)': {
			flexDirection: 'row',
			alignItems: 'center',
			minWidth: '380px',
		},
	},
});

export const tag = style({
	display: 'block',
	marginBottom: '6px',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const avatar = style({
	flex: '0 0 auto',
	width: '32px',
	height: '32px',
	borderRadius: '7px',
	background: `color-mix(in srgb, ${vars.color.accent} 16%, transparent)`,
});

export const cardBody = style({
	display: 'flex',
	flex: '1 1 auto',
	flexDirection: 'column',
	gap: '2px',
	minWidth: 0,
});

export const cardTitle = style({
	fontSize: '12.5px',
	fontWeight: 700,
	lineHeight: 1.5,
	color: vars.color.textStrong,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const cardMeta = style({
	fontSize: '11px',
	lineHeight: 1.5,
	color: vars.color.textMuted,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const cardAction = style({
	flex: '0 0 auto',
	alignSelf: 'stretch',
	padding: '5px 10px',
	borderRadius: '6px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '11.5px',
	fontWeight: 600,
	textAlign: 'center',
});

export const stateRow = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
	gap: vars.space.md,
	margin: `0 0 ${vars.space.md}`,
});

export const stateItem = style({
	padding: `10px ${vars.space.md}`,
	borderRadius: '8px',
	background: vars.color.surfaceMuted,
	minWidth: 0,
});

export const stateLabel = style({
	display: 'block',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.07em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

export const stateValue = style({
	display: 'block',
	marginTop: '2px',
	fontFamily: vars.font.mono,
	fontSize: '14px',
	fontWeight: 700,
	color: vars.color.textStrong,
});

export const note = style({
	margin: 0,
	fontSize: '12px',
	lineHeight: 1.8,
	color: vars.color.textMuted,
});

export const noteWarn = style({
	color: vars.tone.warning.fg,
});
