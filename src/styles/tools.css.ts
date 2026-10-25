import { globalStyle, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

/**
 * 工具箱（/tools）页面样式。
 *
 * 审美约定（与全站一致）：
 *   - 区块之间用留白分隔，不画分割线；
 *   - 控件走幽灵态 —— 常态零装饰，hover / 聚焦时浮现 accentSoft 圆角淡晕；
 *   - 动效统一 vars.motion.ease（cubic-bezier(0.16, 1, 0.3, 1)），150~240ms，不弹跳。
 */

const EASE = vars.motion.ease;

export const main = style({ width: '100%', minWidth: 0 });
export const page = style({
	margin: '0 16px',
	minWidth: 0,
	'@media': { [`screen and (max-width: ${breakpoints.mobile})`]: { margin: 0 } },
});

/* ── 面包屑 / 页头（与项目页同一套节奏） ── */
export const breadcrumbs = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '12px',
	minHeight: '40px',
	color: vars.color.textMuted,
	fontSize: '0.8125rem',
	lineHeight: 1.6,
});
globalStyle(`${breadcrumbs} a`, {
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: '44px',
	color: 'inherit',
	borderRadius: '3px',
});
globalStyle(`${breadcrumbs} a:hover`, {
	color: vars.color.accentStrong,
	textDecoration: 'underline',
	textUnderlineOffset: '4px',
});

export const header = style({ padding: '26px 0 28px' });
export const title = style({
	margin: 0,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(2rem, 3.5vw, 2.65rem)',
	fontWeight: 650,
	lineHeight: 1.3,
	letterSpacing: '-0.025em',
	color: vars.color.textStrong,
});
export const introduction = style({
	margin: '14px 0 14px',
	fontSize: '0.9375rem',
	lineHeight: 1.85,
	color: vars.color.textMuted,
	textWrap: 'pretty',
});
export const overview = style({
	display: 'flex',
	alignItems: 'center',
	gap: '2px 20px',
	flexWrap: 'wrap',
});
export const snapshot = style({
	margin: 0,
	fontSize: '0.75rem',
	lineHeight: 1.8,
	color: vars.color.textMeta,
});

/* ── 工具面板 ── */
export const stage = style({ minWidth: 0 });
export const tool = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '20px',
	minWidth: 0,
});
export const toolHeader = style({ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 });
export const toolTitle = style({
	margin: 0,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.35rem, 2.4vw, 1.7rem)',
	fontWeight: 650,
	lineHeight: 1.35,
	letterSpacing: '-0.015em',
	color: vars.color.textStrong,
});
export const toolDesc = style({
	margin: 0,
	fontSize: '0.875rem',
	lineHeight: 1.9,
	color: vars.color.textMuted,
	textWrap: 'pretty',
});
export const toolMeta = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	gap: '4px 14px',
	fontSize: '0.75rem',
	lineHeight: 1.8,
	color: vars.color.textMeta,
	fontVariantNumeric: 'tabular-nums',
});

/*
 * 功能卡片。深浅两套主题下都靠 surfaceStrong + 轻阴影浮起，
 * 不用描边盒子；内部区块之间用留白，不再嵌套子卡片。
 */
export const card = style({
	minWidth: 0,
	padding: '22px 24px 24px',
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 28px rgba(0, 0, 0, 0.04)',
	'@media': { [`screen and (max-width: ${breakpoints.mobile})`]: { padding: '18px 16px 20px' } },
});
export const cardTitle = style({
	margin: '0 0 14px',
	fontFamily: vars.font.body,
	fontSize: '0.75rem',
	fontWeight: 600,
	letterSpacing: '0.12em',
	color: vars.color.textMeta,
});

/* 「现在」条：三列数值 + 复制 */
export const clockGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	gap: '16px',
	'@media': { [`screen and (max-width: ${breakpoints.tablet})`]: { gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' } },
});
export const clockItem = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '4px',
	minWidth: 0,
	padding: '12px 14px',
	borderRadius: vars.radius.md,
	background: vars.color.backgroundElevated,
	transition: `background 150ms ${EASE}`,
	selectors: { '&:hover': { background: vars.color.accentSoft } },
});
/** 标签行：标签居左、复制按钮居右，数值才能独占整行不折行 */
export const clockHead = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '8px',
	minWidth: 0,
});
export const clockLabel = style({
	fontSize: '0.6875rem',
	lineHeight: 1.6,
	color: vars.color.textMeta,
});
export const clockValue = style({
	minWidth: 0,
	// 这里的 <code> 只借等宽字体，不带全局 code 的蓝底色块
	padding: 0,
	background: 'transparent',
	fontFamily: vars.font.mono,
	fontSize: '0.9375rem',
	fontWeight: 500,
	lineHeight: 1.5,
	color: vars.color.textStrong,
	fontVariantNumeric: 'tabular-nums',
	// 13 位毫秒不允许从数字中间断行
	whiteSpace: 'nowrap',
});
export const clockNote = style({
	margin: '10px 0 0',
	fontSize: '0.75rem',
	lineHeight: 1.8,
	color: vars.color.textMeta,
});

/* ── 双向转换双列 ── */
export const convertGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: '20px',
	alignItems: 'start',
	'@media': { [`screen and (max-width: ${breakpoints.laptop})`]: { gridTemplateColumns: 'minmax(0, 1fr)' } },
});

/* 输入行：幽灵态输入框（无边框），hover/聚焦浮现 accentSoft 淡晕 */
export const fieldLabel = style({
	display: 'block',
	margin: '0 0 8px',
	fontSize: '0.75rem',
	fontWeight: 500,
	lineHeight: 1.7,
	color: vars.color.textMuted,
});
export const fieldRow = style({
	display: 'flex',
	alignItems: 'stretch',
	gap: '10px',
	'@media': { [`screen and (max-width: ${breakpoints.mobile})`]: { flexDirection: 'column' } },
});
export const input = style({
	flex: '1 1 auto',
	minWidth: 0,
	minHeight: '44px',
	padding: '8px 14px',
	border: 0,
	borderRadius: vars.radius.md,
	appearance: 'none',
	background: vars.color.backgroundElevated,
	color: vars.color.textStrong,
	fontFamily: vars.font.mono,
	fontSize: '0.875rem',
	lineHeight: 1.6,
	fontVariantNumeric: 'tabular-nums',
	transition: `background 150ms ${EASE}, box-shadow 150ms ${EASE}`,
	selectors: {
		'&::placeholder': { color: vars.color.textMeta, fontFamily: vars.font.body },
		'&:hover': { background: vars.color.accentSoft },
		// 聚焦反馈用色彩淡晕 + 全站统一 focus ring，不画描边盒子
		'&:focus': { background: vars.color.accentSoft },
	},
});

/** 复制按钮：图标 + 短文案，幽灵态 */
export const copyButton = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '5px',
	flexShrink: 0,
	minHeight: '32px',
	padding: '2px 10px',
	border: 0,
	borderRadius: vars.radius.pill,
	background: 'transparent',
	color: vars.color.textMeta,
	fontFamily: vars.font.body,
	fontSize: '0.75rem',
	lineHeight: 1.6,
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	transition: `background 150ms ${EASE}, color 150ms ${EASE}, transform 150ms ${EASE}`,
	selectors: {
		'&:hover': { background: vars.color.accentSoft, color: vars.color.accentStrong },
		'&:active': { transform: 'scale(0.96)' },
		'&[data-copied="true"]': { background: vars.color.accentSoft, color: vars.color.accentStrong },
	},
});
globalStyle(`${copyButton} svg`, { width: '13px', height: '13px', flexShrink: 0 });

/** 「使用当前时间」主操作：accentSoft 底 + accent 文字，同样无描边 */
export const actionButton = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '6px',
	flexShrink: 0,
	minHeight: '44px',
	padding: '8px 16px',
	border: 0,
	borderRadius: vars.radius.md,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontFamily: vars.font.body,
	fontSize: '0.8125rem',
	fontWeight: 500,
	lineHeight: 1.6,
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	transition: `background 150ms ${EASE}, transform 150ms ${EASE}`,
	selectors: {
		'&:hover': { background: 'rgba(71, 107, 146, 0.14)' },
		'&:active': { transform: 'scale(0.97)' },
	},
});

export const hint = style({
	margin: '8px 0 0',
	fontSize: '0.75rem',
	lineHeight: 1.8,
	color: vars.color.textMeta,
});
export const error = style({
	margin: '10px 0 0',
	fontSize: '0.75rem',
	lineHeight: 1.8,
	color: '#b3261e',
	'@media': { '(prefers-color-scheme: dark)': { color: '#f2b8b5' } },
});

/* ── 结果行：标签在上、数值 + 复制一行，行间留白不画线 ── */
export const results = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '10px',
	margin: '16px 0 0',
});
// display:flex 会压过 [hidden] 的 UA display:none（搜索弹层踩过的同款坑），
// 关闭态必须显式声明，否则「空态提示 + 结果区」会同时占位。
globalStyle(`${results}[hidden]`, { display: 'none' });
export const resultRow = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	alignItems: 'center',
	gap: '2px 12px',
	minHeight: '40px',
	padding: '6px 8px',
	margin: '0 -8px',
	borderRadius: vars.radius.sm,
	transition: `background 150ms ${EASE}`,
	selectors: {
		'&:hover': { background: vars.color.accentSoft },
	},
});
export const resultLabel = style({
	gridColumn: '1 / -1',
	fontSize: '0.75rem',
	lineHeight: 1.7,
	color: vars.color.textMeta,
});
export const resultValue = style({
	minWidth: 0,
	// 同 clockValue：只要等宽，不要全局 code 色块
	padding: 0,
	background: 'transparent',
	fontFamily: vars.font.mono,
	fontSize: '0.8125rem',
	lineHeight: 1.7,
	color: vars.color.textStrong,
	fontVariantNumeric: 'tabular-nums',
	whiteSpace: 'nowrap',
	overflowX: 'auto',
	overflowY: 'hidden',
});
// 子元素选择器只能走 globalStyle（VE 的 style({selectors}) 不允许）。
globalStyle(`${resultRow} button`, {
	opacity: 0.55,
	transition: `opacity 150ms ${EASE}`,
});
globalStyle(`${resultRow}:hover button`, { opacity: 1 });

export const empty = style({
	margin: '16px 0 0',
	fontSize: '0.8125rem',
	lineHeight: 1.9,
	color: vars.color.textMeta,
});
export const sourceNote = style({
	margin: '22px 0 0',
	padding: '22px 0 0',
	fontSize: '0.75rem',
	lineHeight: 1.9,
	color: vars.color.textMeta,
	textWrap: 'pretty',
});
