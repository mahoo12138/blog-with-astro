import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

const leftDrawer = 'screen and (max-width: 900px)';
const rightDrawer = 'screen and (max-width: 1180px)';
// 侧栏顶部呼吸间距：左右两栏同值，且与 mainArea 顶部 padding 共用 vars.space.xxl（2rem = 32px），
// 三列首内容块从同一条水平线起步。用 token 而不是 px，改节奏时只动 theme 一处。
// sticky 的 top 必须与 marginTop 同值 —— 否则滚动起步阶段侧栏会先位移再吸顶（见 git 历史）。
const sidebarTop = vars.space.xxl;
export const body = style({ minHeight: '100vh' });
export const shell = style({
	width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '0 24px',
	display: 'grid', gridTemplateColumns: '256px minmax(0, 736px) 256px',
	gap: '32px', alignItems: 'start',
	'@media': {
		[rightDrawer]: { gridTemplateColumns: '256px minmax(0, 736px)', maxWidth: '1080px', gap: '24px' },
		[leftDrawer]: { display: 'block', maxWidth: '784px', padding: '0 20px' },
		'screen and (max-width: 480px)': { padding: '0 16px' },
	},
});
// 显式启用且没有右栏时，使用原先右栏的空间；移动抽屉与其他页面不变。
export const wideContent = style({
	'@media': {
		'screen and (min-width: 1181px)': { gridTemplateColumns: '256px minmax(0, 1fr)' },
	},
});
export const left = style({
	gridColumn: '1', minWidth: 0, position: 'sticky', top: sidebarTop, marginTop: sidebarTop,
	'@media': { [leftDrawer]: {
		position: 'fixed', left: '12px', top: '12px', margin: 0,
		width: 'min(288px, calc(100vw - 24px))', maxHeight: 'calc(100dvh - 24px)',
		transform: 'translateX(calc(-100% - 24px))', visibility: 'hidden',
		transition: 'transform 180ms ease', zIndex: 30,
		background: vars.color.surfaceStrong, border: `1px solid ${vars.color.borderStrong}`,
		borderRadius: vars.radius.lg, boxShadow: vars.shadow.head, overflow: 'auto',
	} },
	selectors: { [`${shell}[data-leftbar-open] &`]: { transform: 'translateX(0)', visibility: 'visible' } },
});
export const mainArea = style({
	gridColumn: '2', width: '100%', minWidth: 0, margin: 0,
	// 顶部与侧栏同为 vars.space.xxl，三列首行对齐；移动端收窄为一档（vars.space.lg）。
	padding: `${vars.space.xxl} 0 ${vars.space.xxxl}`,
	'@media': { [leftDrawer]: { paddingTop: vars.space.lg } },
});
export const mainContent = style({ minWidth: 0 });
export const lead = style({ marginBottom: vars.space.xl });
export const right = style({
	gridColumn: '3', minWidth: 0, position: 'sticky', top: sidebarTop, marginTop: sidebarTop,
	'@media': { [rightDrawer]: {
		position: 'fixed', right: '12px', top: '12px', margin: 0,
		width: 'min(288px, calc(100vw - 24px))', maxHeight: 'calc(100dvh - 24px)',
		transform: 'translateX(calc(100% + 24px))', visibility: 'hidden',
		transition: 'transform 180ms ease', zIndex: 30,
		background: vars.color.surfaceStrong, border: `1px solid ${vars.color.borderStrong}`,
		borderRadius: vars.radius.lg, boxShadow: vars.shadow.head, overflow: 'auto',
	} },
	selectors: { [`${shell}[data-rightbar-open] &`]: { transform: 'translateX(0)', visibility: 'visible' } },
});
// 首页右栏与左栏同高起点：沿用基础样式（sticky top 与 marginTop 同为 sidebarTop），
// 不再做文章流起点的额外偏移 —— 偏移放 margin 会产生滚动位移（见 git 历史），
// 放 padding 又会让右栏比左栏矮一截。顶部对齐后滚动零位移，两侧栏视觉对称。
export const mainMask = style({
	position: 'fixed', inset: 0, padding: 0, border: 0, zIndex: 25,
	background: 'rgba(15, 18, 22, 0.32)', opacity: 0, visibility: 'hidden',
	pointerEvents: 'none', transition: 'opacity 180ms ease, visibility 180ms',
	selectors: {
		[`${shell}[data-leftbar-open] &`]: { opacity: 1, visibility: 'visible', pointerEvents: 'auto' },
		[`${shell}[data-rightbar-open] &`]: { opacity: 1, visibility: 'visible', pointerEvents: 'auto' },
	},
});
export const floatPanel = style({
	position: 'fixed', right: 'max(16px, env(safe-area-inset-right))',
	bottom: 'max(20px, env(safe-area-inset-bottom))', zIndex: 20,
	display: 'flex', flexDirection: 'column', gap: '1px',
	background: vars.color.surfaceStrong, border: `1px solid ${vars.color.borderStrong}`,
	borderRadius: vars.radius.md, boxShadow: vars.shadow.head,
	'@media': { 'screen and (min-width: 1181px)': { display: 'none' } },
});
export const floatButton = style({
	cursor: 'pointer', color: vars.color.textStrong, background: 'transparent', border: 0,
	width: '44px', height: '44px', padding: '10px', borderRadius: vars.radius.md,
	display: 'flex', alignItems: 'center', justifyContent: 'center',
	selectors: { '&:hover': { color: vars.color.accentStrong, background: vars.color.accentSoft } },
});
export const rightbarToggle = style({ display: 'flex' });
export const leftbarToggle = style({ display: 'none', '@media': { [leftDrawer]: { display: 'flex' } } });
export const floatIcon = style({ width: '20px', height: '20px' });
export const mobileHeader = style({
	display: 'none',
	'@media': { [leftDrawer]: {
		display: 'flex', alignItems: 'center', justifyContent: 'space-between',
		padding: '8px 16px', paddingTop: 'max(8px, env(safe-area-inset-top))',
		borderBottom: `1px solid ${vars.color.border}`, minHeight: '60px',
	} },
});
export const mobileTitle = style({ fontSize: '1rem', fontWeight: 700, color: vars.color.textStrong });
export const mobileTools = style({ display: 'flex', alignItems: 'center', gap: '4px' });
export const sidebarClose = style({
	display: 'none', cursor: 'pointer', margin: '8px 8px 0 auto', padding: '8px 12px',
	minHeight: '40px', background: 'transparent', color: vars.color.textMuted,
	border: `1px solid ${vars.color.border}`, borderRadius: vars.radius.sm, fontSize: '0.8rem',
	selectors: { '&:hover': { color: vars.color.accentStrong, borderColor: vars.color.accent } },
});
export const leftClose = style({ '@media': { [leftDrawer]: { display: 'block' } } });
export const rightClose = style({ '@media': { [rightDrawer]: { display: 'block' } } });
