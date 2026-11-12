import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * NavigationJourney —— 一次导航的交互时间线。
 *
 * 只保留一张详情卡：场景切换 + 卡片头部的上一站 / 下一站，
 * 每站的完整说明直接平铺。节点列表与悬停浮层已删除。
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

/** 卡片本体：只负责边框、圆角与底色，内部排版交给 detail。 */
export const card = style({
	minWidth: 0,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceMuted,
});

export const detail = style({
	minWidth: 0,
	padding: `${vars.space.lg} ${vars.space.xl}`,
	display: 'flex',
	flexDirection: 'column',
	'@media': {
		'(max-width: 720px)': {
			padding: `${vars.space.md} ${vars.space.lg} ${vars.space.lg}`,
		},
	},
});

export const detailHead = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: vars.space.md,
	flex: 'none',
});

export const detailHeading = style({
	minWidth: 0,
	flex: '1 1 200px',
});

export const detailBody = style({
	minHeight: 0,
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
	margin: 0,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
	lineHeight: 1.4,
	letterSpacing: '-0.02em',
	color: vars.color.textStrong,
});

export const detailSummary = style({
	margin: `${vars.space.md} 0`,
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

/** 卡片头部的线性导航，替代原来的 12 个节点。 */
export const navRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.sm,
	flex: 'none',
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
	marginBottom: vars.space.sm,
	padding: '3px 8px',
	borderRadius: vars.radius.pill,
	background: vars.tone.warning.bg,
	color: vars.tone.warning.fg,
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.05em',
});

export const interviewDetails = style({
	display: 'grid',
	gap: vars.space.sm,
	marginBottom: vars.space.md,
});

export const dataFlow = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
	gap: vars.space.sm,
});

export const factGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
	gap: vars.space.sm,
});

export const flowNode = style({
	minWidth: 0,
	padding: vars.space.md,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
});

export const interviewPoint = style({
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: vars.radius.md,
	background: vars.color.accentSoft,
});

export const interviewLabel = style({
	display: 'block',
	marginBottom: '3px',
	fontFamily: vars.font.mono,
	fontSize: '9.5px',
	fontWeight: 700,
	letterSpacing: '0.08em',
	color: vars.color.accentStrong,
});
