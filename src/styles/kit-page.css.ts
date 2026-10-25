import { style, globalStyle } from '@vanilla-extract/css';
import { vars, breakpoints } from './theme.css';

/**
 * /kit 展示页样式 —— 设计语言活文档。
 * 页面自身就是范式的示范：ghost 控件、accentSoft 反馈、留白分隔。
 */

export const main = style({
	width: '100%',
	minWidth: 0,
});

export const intro = style({
	color: vars.color.textMuted,
	fontSize: '0.95rem',
	margin: `0 0 ${vars.space.xxl}`,
});

export const section = style({
	margin: `0 0 ${vars.space.xxxl}`,
	scrollMarginTop: '80px',
});

export const sectionTitle = style({
	fontSize: '1.35rem',
	margin: `0 0 ${vars.space.xs}`,
});

export const sectionNote = style({
	margin: `0 0 ${vars.space.lg}`,
	color: vars.color.textMuted,
	fontSize: '0.8125rem',
	lineHeight: 1.7,
});

/** token 演示网格 */
export const swatchGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
	gap: vars.space.md,
	margin: `0 0 ${vars.space.lg}`,
});

export const swatch = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '6px',
	padding: vars.space.md,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	fontSize: '0.75rem',
	lineHeight: 1.5,
});

export const swatchChip = style({
	height: '44px',
	borderRadius: vars.radius.sm,
	border: `1px solid ${vars.color.border}`,
});

export const swatchName = style({
	fontFamily: vars.font.mono,
	fontSize: '0.7rem',
	color: vars.color.textStrong,
	overflowWrap: 'anywhere',
});

export const swatchValue = style({
	fontFamily: vars.font.mono,
	fontSize: '0.65rem',
	color: vars.color.textMeta,
	overflowWrap: 'anywhere',
});

/** 字阶演示 */
export const typeRow = style({
	display: 'flex',
	alignItems: 'baseline',
	gap: vars.space.lg,
	padding: `${vars.space.sm} 0`,
	borderBottom: `1px solid ${vars.color.border}`,
	':last-child': { borderBottom: 'none' },
});

export const typeMeta = style({
	flex: '0 0 8.5rem',
	fontFamily: vars.font.mono,
	fontSize: '0.7rem',
	color: vars.color.textMeta,
});

/** 间距条 */
export const spaceRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.md,
	padding: '4px 0',
});

export const spaceBar = style({
	height: '12px',
	borderRadius: vars.radius.sm,
	background: vars.color.accentSoft,
	border: `1px solid ${vars.color.accent}`,
});

export const spaceLabel = style({
	fontFamily: vars.font.mono,
	fontSize: '0.7rem',
	color: vars.color.textMeta,
	minWidth: '6.5rem',
});

/** 范式演示卡 */
export const paradigmGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
	gap: vars.space.lg,
});

export const paradigmCard = style({
	padding: vars.space.xl,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	boxShadow: vars.shadow.card,
});

export const paradigmLabel = style({
	fontSize: '0.7rem',
	fontWeight: 600,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
	margin: `0 0 ${vars.space.md}`,
});

/** ghost 控件示范（与 tools 审美一致） */
export const ghostButton = style({
	border: 'none',
	background: 'transparent',
	color: vars.color.accentStrong,
	fontFamily: vars.font.body,
	fontSize: '0.8125rem',
	fontWeight: 600,
	padding: '6px 12px',
	borderRadius: vars.radius.pill,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}, transform ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&:active': {
			transform: 'scale(0.96)',
		},
	},
});

export const ghostInput = style({
	border: 'none',
	background: 'transparent',
	color: vars.color.text,
	fontFamily: vars.font.body,
	fontSize: '0.8125rem',
	padding: '8px 12px',
	borderRadius: vars.radius.md,
	width: '100%',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&::placeholder': {
			color: vars.color.textMeta,
		},
		'&:hover, &:focus': {
			background: vars.color.accentSoft,
			outline: 'none',
		},
		'&:focus-visible': {
			outline: `2px solid ${vars.color.accentStrong}`,
			outlineOffset: '2px',
		},
	},
});

/** sidebar row 示范（行规范照抄 sidebarRows.css.ts） */
export const rowDemo = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
});

export const rowDemoItem = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '8px',
	padding: '6px 16px',
	borderRadius: '6px',
	fontSize: '13px',
	lineHeight: 1.55,
	color: vars.color.text,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
	},
});

export const rowDemoMeta = style({
	fontSize: '0.7rem',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

/** tone callout 示范 */
export const toneDemo = style({
	padding: '12px 15px',
	borderRadius: `0 ${vars.radius.md} ${vars.radius.md} 0`,
	fontSize: '0.8125rem',
	lineHeight: 1.75,
	margin: `0 0 ${vars.space.sm}`,
});

globalStyle(`${toneDemo} strong`, {
	fontWeight: 600,
});

/** 动效演示块 */
export const motionDemo = style({
	width: '56px',
	height: '56px',
	borderRadius: vars.radius.md,
	background: vars.color.accentSoft,
	border: `1px solid ${vars.color.accent}`,
	transition: `transform ${vars.motion.durationBase} ${vars.motion.ease}, background ${vars.motion.durationBase} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			transform: 'translateX(24px)',
			background: vars.color.accent,
		},
	},
});

/** Do / Don't */
export const ruleGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
	gap: vars.space.lg,
});

export const ruleCol = style({
	padding: vars.space.xl,
	borderRadius: vars.radius.lg,
	fontSize: '0.8125rem',
	lineHeight: 1.9,
});

export const ruleDo = style({
	background: vars.tone.success.bg,
	color: vars.color.text,
});

export const ruleDont = style({
	background: vars.tone.danger.bg,
	color: vars.color.text,
});

export const ruleHead = style({
	fontSize: '0.75rem',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	margin: `0 0 ${vars.space.sm}`,
});

globalStyle(`${ruleDo} ${ruleHead}`, { color: vars.tone.success.fg });
globalStyle(`${ruleDont} ${ruleHead}`, { color: vars.tone.danger.fg });

/** 组件演示占位/容器 */
export const compDemo = style({
	padding: vars.space.xl,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	margin: `0 0 ${vars.space.lg}`,
});

export const compTable = style({
	width: '100%',
	fontSize: '0.8125rem',
	margin: `0 0 ${vars.space.xl}`,
});

globalStyle(`${compTable} th`, {
	fontSize: '0.7rem',
	textTransform: 'uppercase',
	letterSpacing: '0.06em',
	color: vars.color.textMeta,
	borderBottom: `1px solid ${vars.color.border}`,
});

globalStyle(`${compTable} td`, {
	fontFamily: vars.font.mono,
	fontSize: '0.75rem',
	color: vars.color.text,
	borderBottom: `1px solid ${vars.color.border}`,
});

export const codeSample = style({
	fontFamily: vars.font.mono,
	fontSize: '0.75rem',
	lineHeight: 1.7,
	overflowX: 'auto',
	whiteSpace: 'pre-wrap',
	overflowWrap: 'anywhere',
});

export const gridTwo = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	gap: vars.space.lg,
});

export const smallMeta = style({
	fontSize: '0.75rem',
	color: vars.color.textMeta,
	margin: `0 0 ${vars.space.md}`,
});

export const chipRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '6px',
	margin: `0 0 ${vars.space.md}`,
});

export const chip = style({
	fontSize: '0.7rem',
	fontFamily: vars.font.mono,
	padding: '3px 9px',
	borderRadius: vars.radius.pill,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
});

export const heroDarkDemo = style({
	background: '#101a2b',
	color: '#fff',
	borderRadius: vars.radius.xl,
	padding: vars.space.xxl,
	boxShadow: vars.shadow.float,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			padding: vars.space.xl,
		},
	},
});

export const heroDarkTitle = style({
	fontSize: '1.5rem',
	letterSpacing: '-0.02em',
	margin: `0 0 ${vars.space.sm}`,
	color: '#fff',
	fontFamily: vars.font.heading,
});

export const heroDarkLead = style({
	color: '#c0ccdb',
	fontSize: '0.875rem',
	lineHeight: 1.8,
	margin: 0,
});
