import { style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../styles/theme.css';

/**
 * 学苑演示套件（/learn 索引 + 课时页）。
 *
 * 三层结构，全部 fixed、默认 pointer-events: none —— 页面原有的浏览与操作不受影响：
 *   torch  手电筒遮罩（box-shadow 大扩散做挖孔，transform 跟手，帧内零重排）
 *   ink    墨迹层（只有画笔画图形时才接管指针，Esc / 再点一次工具即退出）
 *   trail  指针拖尾（canvas 2D，一次性绘制，pointer-events 恒为 none）
 *   rail   右侧贴边工具栏（唯一的可交互层）
 *
 * 颜色桥接：canvas 只能吃具体色值，主题色由 .astro 以 --pk-* 内联变量下发，
 * 脚本读 computedStyle 得到当前主题的真值（明暗切换自动跟随）。
 */

const EASE = vars.motion.ease;

const TOOLTIP = {
	position: 'absolute',
	right: 'calc(100% + 10px)',
	top: '50%',
	// 文案走 data-tip（VE 模块只能导出纯值，不能导出工厂函数）
	content: 'attr(data-tip)',
	padding: '4px 9px',
	borderRadius: vars.radius.sm,
	background: vars.color.textStrong,
	color: vars.color.background,
	fontFamily: vars.font.body,
	fontSize: '11px',
	fontWeight: 500,
	lineHeight: 1.5,
	letterSpacing: '0.01em',
	whiteSpace: 'nowrap',
	opacity: 0,
	transform: 'translateY(-50%) translateX(4px)',
	pointerEvents: 'none',
	transition: `opacity ${vars.motion.durationFast} ${EASE}, transform ${vars.motion.durationFast} ${EASE}`,
} as const;

const TOOLTIP_ON = {
	opacity: 1,
	transform: 'translateY(-50%)',
} as const;

export const root = style({
	position: 'fixed',
	inset: 0,
	zIndex: 800,
	pointerEvents: 'none',
	color: vars.color.text,
	// 分层（同一个 fixed 祖先内自成层叠上下文）
	isolation: 'isolate',
});

/* ── 拖尾画布 ── */
export const trail = style({
	position: 'fixed',
	inset: 0,
	zIndex: 3,
	display: 'block',
	width: '100%',
	height: '100%',
	pointerEvents: 'none',
});

/* ── 墨迹画布 ── */
export const ink = style({
	position: 'fixed',
	inset: 0,
	zIndex: 2,
	display: 'block',
	width: '100%',
	height: '100%',
	pointerEvents: 'none',
	cursor: 'crosshair',
	touchAction: 'none',
	selectors: {
		[`${root}[data-draw="true"] &`]: {
			pointerEvents: 'auto',
		},
	},
});

/* ── 手电筒：大扩散 box-shadow 挖出一个光孔，整体靠 transform 跟手 ── */
export const torch = style({
	position: 'fixed',
	top: 0,
	left: 0,
	zIndex: 1,
	width: 'clamp(260px, 26vw, 380px)',
	aspectRatio: '1',
	borderRadius: '50%',
	pointerEvents: 'none',
	opacity: 0,
	transform: 'translate3d(-9999px, -9999px, 0)',
	boxShadow: '0 0 0 100vmax rgba(9, 14, 22, 0.6)',
	border: '1px solid rgba(255, 246, 224, 0.22)',
	background:
		'radial-gradient(circle, rgba(255, 247, 227, 0.12) 0%, rgba(255, 247, 227, 0.06) 58%, rgba(255, 247, 227, 0) 76%)',
	transition: `opacity ${vars.motion.durationBase} ${EASE}`,
	willChange: 'transform',
	selectors: {
		[`${root}[data-torch="true"] &`]: {
			opacity: 1,
		},
	},
});

/* ── 贴边工具栏 ── */
export const rail = style({
	position: 'fixed',
	top: '50%',
	right: 0,
	zIndex: 4,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '2px',
	padding: '6px 6px 8px',
	borderRadius: `${vars.radius.lg} 0 0 ${vars.radius.lg}`,
	background: vars.color.surface,
	boxShadow: vars.shadow.float,
	backdropFilter: 'saturate(160%) blur(14px)',
	WebkitBackdropFilter: 'saturate(160%) blur(14px)',
	pointerEvents: 'auto',
	transform: 'translate(0, -50%)',
	transition: `transform ${vars.motion.durationSlow} ${EASE}, opacity ${vars.motion.durationBase} ${EASE}`,
	'@media': {
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			display: 'none',
		},
	},
	selectors: {
		// 取消固定：贴到边缘只剩一道可悬停的窄边，鼠标靠近即滑回
		[`${root}[data-pinned="false"] &`]: {
			transform: 'translate(calc(100% - 20px), -50%)',
			opacity: 0.55,
		},
		[`${root}[data-pinned="false"] &:hover, ${root}[data-pinned="false"] &:focus-within`]: {
			transform: 'translate(0, -50%)',
			opacity: 1,
		},
	},
});

/** 收起/展开：grid-template-rows 1fr→0fr，任意内容高度都能连续收拢 */
export const body = style({
	display: 'grid',
	gridTemplateRows: '1fr',
	transition: `grid-template-rows ${vars.motion.durationSlow} ${EASE}, opacity ${vars.motion.durationFast} ${EASE}`,
	selectors: {
		[`${root}[data-open="false"] &`]: {
			gridTemplateRows: '0fr',
			opacity: 0,
			pointerEvents: 'none',
		},
	},
});

export const bodyInner = style({
	minHeight: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	// 不裁切：tooltip 要能溢出到工具栏左侧
	overflow: 'visible',
});

export const group = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
});

export const collapse = style({
	position: 'relative',
	display: 'grid',
	placeItems: 'center',
	width: '38px',
	height: '24px',
	margin: 0,
	padding: 0,
	border: 0,
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.textMeta,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${EASE}, color ${vars.motion.durationFast} ${EASE}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&::after': TOOLTIP,
		'&:hover::after, &:focus-visible::after': TOOLTIP_ON,
	},
});

export const chevron = style({
	width: '16px',
	height: '16px',
	transition: `transform ${vars.motion.durationSlow} ${EASE}`,
	selectors: {
		[`${root}[data-open="false"] &`]: {
			transform: 'rotate(180deg)',
		},
	},
});

export const tool = style({
	position: 'relative',
	display: 'grid',
	placeItems: 'center',
	width: '38px',
	height: '38px',
	margin: 0,
	padding: 0,
	border: 0,
	borderRadius: '9px',
	background: 'transparent',
	color: vars.color.text,
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${EASE}, color ${vars.motion.durationFast} ${EASE}, transform ${vars.motion.durationFast} ${EASE}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&:active': {
			transform: 'scale(0.94)',
		},
		'&[aria-pressed="true"]': {
			background: vars.color.accentStrong,
			color: vars.color.surface,
			boxShadow: `0 4px 12px ${vars.color.accentSoft}`,
		},
		'&[aria-pressed="true"]:hover': {
			background: vars.color.accentStrong,
			color: vars.color.surface,
		},
		'&[data-disabled="true"]': {
			opacity: 0.4,
			cursor: 'default',
		},
		'&::after': TOOLTIP,
		'&:hover::after, &:focus-visible::after': TOOLTIP_ON,
		// 无 data-tip 的按钮（图形，说明由子菜单承载）不渲染空提示块
		'&:not([data-tip])::after': { display: 'none' },
	},
});

export const icon = style({
	width: '19px',
	height: '19px',
	display: 'block',
});

/** 分组之间的呼吸（留白，不画线） */
export const spacer = style({
	height: '8px',
});

/** 子菜单宿主：图形 / 颜色 / 粗细三个按钮各带一个 flyout */
export const flyoutHost = style({
	position: 'relative',
	display: 'grid',
});

/**
 * 子菜单底座。展开条件挂在 root 的 `data-flyout` 上，**不用** `:hover`：
 * 指针横穿按钮与菜单之间的空档时 :hover 会失效，而菜单的 pointer-events 又由
 * :hover 决定，于是指针落到菜单上也算「没命中」，菜单当场消失（只能点击钉住）。
 * 改由脚本维护 open 状态 + 220ms 宽限，同一时刻只允许一个子菜单展开。
 */
export const flyout = style({
	position: 'absolute',
	right: 'calc(100% + 8px)',
	top: '50%',
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	padding: '5px',
	borderRadius: vars.radius.md,
	background: vars.color.surface,
	boxShadow: vars.shadow.float,
	opacity: 0,
	// 关闭态：整体朝工具栏方向退回并微缩，配合淡出 —— 不是「啪」地消失
	transform: 'translate(8px, -50%) scale(0.97)',
	transformOrigin: 'right center',
	visibility: 'hidden',
	pointerEvents: 'none',
	// 退出用 durationSlow（240ms，比进入慢一档），visibility 延到动画结束才切成 hidden
	transition: `opacity ${vars.motion.durationSlow} ${EASE}, transform ${vars.motion.durationSlow} ${EASE}, visibility 0s ${vars.motion.durationSlow}`,
});

const flyoutOpen = {
	opacity: 1,
	transform: 'translate(0, -50%) scale(1)',
	visibility: 'visible',
	pointerEvents: 'auto',
	// 进入比退出快一档：悬停反馈要跟手
	transition: `opacity ${vars.motion.durationFast} ${EASE}, transform ${vars.motion.durationFast} ${EASE}, visibility 0s`,
} as const;

export const flyoutShape = style([
	flyout,
	{
		minWidth: '104px',
		selectors: { [`${root}[data-flyout="shape"] &`]: flyoutOpen },
	},
]);

export const flyoutColor = style([
	flyout,
	{
		selectors: { [`${root}[data-flyout="color"] &`]: flyoutOpen },
	},
]);

export const flyoutWidth = style([
	flyout,
	{
		minWidth: '116px',
		selectors: { [`${root}[data-flyout="width"] &`]: flyoutOpen },
	},
]);

export const flyoutItem = style({
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	width: '100%',
	margin: 0,
	padding: '5px 8px',
	border: 0,
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.textMuted,
	fontFamily: vars.font.body,
	fontSize: '12px',
	lineHeight: 1.6,
	textAlign: 'left',
	cursor: 'pointer',
	transition: `background ${vars.motion.durationFast} ${EASE}, color ${vars.motion.durationFast} ${EASE}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&[aria-pressed="true"]': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
			fontWeight: 600,
		},
	},
});

export const flyoutIcon = style({
	width: '15px',
	height: '15px',
	flex: '0 0 auto',
});

/* ── 线条颜色 / 粗细 ── */

/** 触发按钮上的当前色点 */
export const inkDot = style({
	width: '16px',
	height: '16px',
	borderRadius: '50%',
	background: vars.color.accentStrong,
	boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
	transition: `background ${vars.motion.durationFast} ${EASE}`,
});

/** 色板：3 列圆点 */
export const swatchGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, 22px)',
	gap: '8px',
	padding: '5px 6px',
});

export const swatch = style({
	width: '22px',
	height: '22px',
	margin: 0,
	padding: 0,
	border: 0,
	borderRadius: '50%',
	cursor: 'pointer',
	boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
	transition: `box-shadow ${vars.motion.durationFast} ${EASE}, transform ${vars.motion.durationFast} ${EASE}`,
	selectors: {
		'&:hover': {
			transform: 'scale(1.1)',
		},
		'&[aria-pressed="true"]': {
			boxShadow: `0 0 0 2px ${vars.color.surface}, 0 0 0 3.5px ${vars.color.accentStrong}`,
		},
	},
});

/** 粗细选项里的线段（高度由行内样式给出） */
export const widthBar = style({
	display: 'block',
	width: '26px',
	borderRadius: '999px',
	background: 'currentColor',
});

/** 粗细按钮上的线段：高度 = 当前线宽，不打开菜单也看得出当前粗细 */
export const triggerBar = style({
	display: 'block',
	width: '20px',
	borderRadius: '999px',
	background: 'currentColor',
	transition: `height ${vars.motion.durationFast} ${EASE}`,
});

