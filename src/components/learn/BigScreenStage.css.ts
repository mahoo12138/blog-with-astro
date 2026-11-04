import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * BigScreenStage —— 1920×1080 大屏看板在三种适配策略下的真实后果。
 *
 * 屏幕内容固定用「深色数据大屏」配色，不跟随站点主题：这里模拟的是一块
 * 电视墙，不是页面 UI。深底 + 青色高亮在任何主题下都保持同一观感。
 */

export const controls = style({
	display: 'grid',
	gap: vars.space.md,
	margin: `0 0 ${vars.space.lg}`,
});

export const stage = style({
	display: 'flex',
	justifyContent: 'center',
	margin: `0 0 ${vars.space.md}`,
});

export const screen = style({
	position: 'relative',
	width: '100%',
	overflow: 'hidden',
	borderRadius: '10px',
	background: '#0b1622',
	boxShadow:
		'0 0 0 1px rgba(120, 160, 200, 0.26), inset 0 0 70px rgba(60, 140, 200, 0.10)',
	containerType: 'size',
});

/** 等比缩放时的黑边：斜纹是「没有内容」的通用记号，不是装饰。 */
export const letterbox = style({
	backgroundImage:
		'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.045) 0 6px, transparent 6px 12px)',
});

export const dash = style({
	position: 'absolute',
	display: 'flex',
	flexDirection: 'column',
	// 不透明底色：黑边（斜纹）只出现在 dash 覆盖不到的区域，语义才对。
	background: '#0b1622',
	color: '#e8f1fb',
});

export const dashScale = style({
	top: '50%',
	left: '50%',
	width: '1920px',
	height: '1080px',
	padding: '48px',
	gap: '24px',
	fontSize: '40px',
});

export const dashFill = style({
	inset: 0,
	padding: '3% 2.6%',
	gap: '1.4%',
	fontSize: '20px',
});

export const dashFluid = style({
	inset: 0,
	padding: '3% 2.6%',
	gap: 'clamp(4px, 1.1cqw, 24px)',
	fontSize: 'clamp(8px, 2.1cqw, 40px)',
});

export const header = style({
	display: 'flex',
	flex: '0 0 auto',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: '12px',
});

export const dashTitle = style({
	fontWeight: 700,
	letterSpacing: '0.05em',
	lineHeight: 1.3,
});

export const dashMeta = style({
	flex: '0 0 auto',
	fontFamily: vars.font.mono,
	fontSize: '0.46em',
	letterSpacing: '0.04em',
	color: '#7d95ae',
});

export const kpis = style({
	display: 'grid',
	flex: '0 0 22%',
	gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
	gap: '1.2%',
	minHeight: 0,
});

export const kpi = style({
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	gap: '0.1em',
	padding: '0.5em 0.85em',
	border: '1px solid rgba(120, 170, 220, 0.20)',
	borderRadius: '8px',
	background: 'rgba(90, 150, 210, 0.10)',
	minWidth: 0,
	overflow: 'hidden',
});

export const kpiLabel = style({
	fontSize: '0.42em',
	letterSpacing: '0.06em',
	color: '#90a8c0',
	whiteSpace: 'nowrap',
});

export const kpiValue = style({
	fontFamily: vars.font.mono,
	fontSize: '0.92em',
	fontWeight: 700,
	lineHeight: 1.2,
	color: '#7ee3f0',
	fontVariantNumeric: 'tabular-nums',
	whiteSpace: 'nowrap',
});

export const charts = style({
	display: 'grid',
	flex: '1 1 auto',
	gridTemplateColumns: '1.55fr 1fr',
	gap: '1.2%',
	minHeight: 0,
});

export const pane = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '0.35em',
	padding: '0.6em 0.8em',
	border: '1px solid rgba(120, 170, 220, 0.16)',
	borderRadius: '8px',
	background: 'rgba(20, 45, 70, 0.45)',
	minWidth: 0,
	minHeight: 0,
});

export const paneLabel = style({
	fontSize: '0.42em',
	letterSpacing: '0.06em',
	color: '#90a8c0',
	flex: '0 0 auto',
});

export const bars = style({
	display: 'flex',
	flex: '1 1 auto',
	alignItems: 'flex-end',
	gap: '0.42em',
	minHeight: 0,
	paddingTop: '0.3em',
});

export const bar = style({
	flex: '1 1 0',
	minHeight: '3px',
	borderRadius: '2px 2px 0 0',
	background: 'linear-gradient(180deg, #6fdcea, #2a6f8c)',
});

export const ringWrap = style({
	display: 'flex',
	flex: '1 1 auto',
	alignItems: 'center',
	justifyContent: 'center',
	minHeight: 0,
	gap: '0.6em',
});

export const ring = style({
	width: '58%',
	aspectRatio: '1 / 1',
	borderRadius: '50%',
	border: '0.5em solid rgba(77, 208, 225, 0.22)',
	borderTopColor: '#4dd0e1',
	borderRightColor: '#4dd0e1',
	transform: 'rotate(45deg)',
});

/** 拉伸模式下用百分比宽高：同一段代码，圆环被拉成椭圆。 */
export const ringFill = style({
	width: '30%',
	height: '72%',
	aspectRatio: 'auto',
});

export const metrics = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(126px, 1fr))',
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
	fontSize: '14px',
	fontWeight: 700,
	lineHeight: 1.4,
	color: vars.color.textStrong,
	fontVariantNumeric: 'tabular-nums',
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
