import { globalStyle, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

/* ------------------------------------------------------------------ *
 *  列表页 /lab
 * ------------------------------------------------------------------ */

export const listMain = style({
	width: '100%',
	margin: 0,
	padding: 0,
});

export const listIntro = style({
	margin: `${vars.space.lg} 0 ${vars.space.xl}`,
	color: vars.color.textMuted,
	fontSize: '0.95rem',
	lineHeight: 1.9,
});

export const grid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
	gap: vars.space.lg,
	margin: `${vars.space.lg} 0 ${vars.space.xxl}`,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gridTemplateColumns: '1fr',
		},
	},
});

export const card = style({
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	boxShadow: '0 1px 2px rgba(0, 0, 0, 0.10)',
	color: vars.color.text,
	transition: 'transform 0.18s ease, box-shadow 0.18s ease',
	selectors: {
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: vars.shadow.head,
			color: vars.color.textStrong,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: vars.shadow.focus,
		},
	},
});

/**
 * 卡片预览区。深色底是刻意的：demo 的舞台也是深色，
 * 卡片与详情页视觉上才连得上，且浅色主题下这一块黑不会显得脏
 * （代码块同理，属于「屏幕里的屏幕」）。
 */
export const preview = style({
	position: 'relative',
	aspectRatio: '16 / 9',
	background: 'linear-gradient(140deg, #101a2e 0%, #1b2a4a 55%, #24365c 100%)',
	overflow: 'hidden',
});

export const previewInner = style({
	position: 'absolute',
	inset: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
});

/** 没有 preview.astro 时的占位：几条扫描线 + 标签 */
export const previewFallback = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '100%',
	height: '100%',
	backgroundImage:
		'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)',
	color: 'rgba(226, 232, 240, 0.55)',
	fontSize: '0.8rem',
	letterSpacing: '0.08em',
});

export const previewBadge = style({
	position: 'absolute',
	right: vars.space.md,
	bottom: vars.space.md,
	padding: `2px ${vars.space.sm}`,
	borderRadius: vars.radius.pill,
	background: 'rgba(9, 14, 26, 0.62)',
	color: 'rgba(226, 232, 240, 0.92)',
	fontSize: '0.72rem',
	letterSpacing: '0.04em',
});

export const cardBody = style({
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.sm,
	padding: vars.space.lg,
});

export const cardTitle = style({
	margin: 0,
	fontSize: '1.05rem',
	fontWeight: 600,
	color: vars.color.textStrong,
});

export const cardDesc = style({
	margin: 0,
	fontSize: '0.86rem',
	lineHeight: 1.75,
	color: vars.color.textMuted,
});

export const tagRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: vars.space.xs,
	marginTop: vars.space.xs,
	listStyle: 'none',
});

export const tag = style({
	padding: `2px ${vars.space.sm}`,
	borderRadius: vars.radius.sm,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.72rem',
	lineHeight: 1.8,
});

export const cardMeta = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.sm,
	fontSize: '0.74rem',
	color: vars.color.textMeta,
});

export const wipBadge = style({
	padding: `1px ${vars.space.sm}`,
	borderRadius: vars.radius.pill,
	border: `1px solid ${vars.color.borderStrong}`,
	color: vars.color.textMuted,
	fontSize: '0.7rem',
});

/* ------------------------------------------------------------------ *
 *  详情页 /lab/[slug]
 * ------------------------------------------------------------------ */

export const detailMain = style({
	width: '100%',
	margin: 0,
	padding: 0,
});

export const crumbs = style({
	margin: `${vars.space.lg} 0 ${vars.space.md}`,
	fontSize: '0.82rem',
	color: vars.color.textMeta,
});

// vanilla-extract 的 selectors 只允许「选中自身」（必须带 & 且 & 在末尾），
// 子元素选择器一律走 globalStyle。
globalStyle(`${crumbs} a`, {
	color: vars.color.textMuted,
});
globalStyle(`${crumbs} a:hover`, {
	color: vars.color.accent,
});

export const detailTitle = style({
	margin: 0,
	fontSize: '1.6rem',
	fontWeight: 700,
	lineHeight: 1.4,
	color: vars.color.textStrong,
});

export const detailDesc = style({
	margin: `${vars.space.sm} 0 ${vars.space.lg}`,
	fontSize: '0.95rem',
	lineHeight: 1.9,
	color: vars.color.textMuted,
});

export const detailMeta = style([cardMeta, { marginBottom: vars.space.md }]);

export const notes = style({
	margin: `${vars.space.xl} 0 0`,
	padding: vars.space.lg,
	borderRadius: vars.radius.md,
	background: vars.color.surface,
	border: `1px solid ${vars.color.border}`,
	fontSize: '0.86rem',
	lineHeight: 1.9,
	color: vars.color.textMuted,
});

globalStyle(`${notes} h2`, {
	margin: `0 0 ${vars.space.sm}`,
	fontSize: '0.9rem',
	fontWeight: 600,
	color: vars.color.textStrong,
});

globalStyle(`${notes} li`, {
	marginLeft: vars.space.lg,
});

export const neighborNav = style({
	display: 'flex',
	justifyContent: 'space-between',
	gap: vars.space.md,
	margin: `${vars.space.xl} 0 ${vars.space.xxl}`,
	fontSize: '0.86rem',
});

/* ------------------------------------------------------------------ *
 *  舞台 LabStage：所有 demo 共用的外壳
 * ------------------------------------------------------------------ */

export const stage = style({
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	margin: `${vars.space.lg} 0`,
	borderRadius: vars.radius.md,
	overflow: 'hidden',
	border: `1px solid ${vars.color.border}`,
	background: '#0b1220',
	boxShadow: vars.shadow.card,
	// 供 canvas demo 读取的取色口（runtime.readCssVar）
	vars: {
		'--lab-stage-bg': '#0b1220',
		'--lab-stage-ink': '#e2e8f0',
		'--lab-stage-muted': 'rgba(226, 232, 240, 0.42)',
		'--lab-stage-accent': '#7ecbff',
		'--lab-stage-accent-2': '#ffb86b',
	},
	selectors: {
		// 全屏时铺满，并把画布交还给 demo（ResizeObserver 会收到新尺寸）
		'&:fullscreen': {
			borderRadius: 0,
			border: 'none',
			justifyContent: 'center',
		},
	},
});

export const stageBar = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.md,
	padding: `${vars.space.sm} ${vars.space.md}`,
	background: 'rgba(255, 255, 255, 0.04)',
	borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
});

export const stageLabel = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.sm,
	fontSize: '0.76rem',
	color: 'var(--lab-stage-muted, rgba(226, 232, 240, 0.42))',
	letterSpacing: '0.04em',
});

export const stageDot = style({
	width: '8px',
	height: '8px',
	borderRadius: '50%',
	background: 'var(--lab-stage-accent, #7ecbff)',
	boxShadow: '0 0 8px var(--lab-stage-accent, #7ecbff)',
});

export const stageActions = style({
	display: 'flex',
	gap: vars.space.xs,
});

export const stageButton = style({
	padding: `3px ${vars.space.md}`,
	border: '1px solid rgba(255, 255, 255, 0.14)',
	borderRadius: vars.radius.pill,
	background: 'rgba(255, 255, 255, 0.06)',
	color: 'rgba(226, 232, 240, 0.86)',
	fontSize: '0.74rem',
	fontFamily: 'inherit',
	cursor: 'pointer',
	transition: 'background 0.15s ease, color 0.15s ease',
	selectors: {
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.14)',
			color: '#fff',
		},
		'&:focus-visible': {
			outline: '2px solid var(--lab-stage-accent, #7ecbff)',
			outlineOffset: '2px',
		},
	},
});

export const stageBody = style({
	position: 'relative',
	width: '100%',
	aspectRatio: '16 / 9',
	minHeight: '320px',
	selectors: {
		// 全屏时舞台铺满视口，不再受 16:9 约束
		[`${stage}:fullscreen &`]: {
			flex: 1,
			aspectRatio: 'auto',
		},
	},
});

/* demo 内部通用：铺满舞台的 canvas */
globalStyle('[data-lab-canvas]', {
	display: 'block',
	width: '100%',
	height: '100%',
	touchAction: 'none',
});
