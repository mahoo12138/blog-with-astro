import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../styles/theme.css';

/**
 * 评论区样式 —— 颜色 / 字体 / 间距 / 圆角 / 动效一律取自 theme.css.ts。
 *
 * 明暗与七套配色主题由 :root 上的 vars 自动切换，这里**不写任何暗色分支**，
 * 也不新增全局主题变量；组件只消费现有 token，因此对既有样式零侵入。
 *
 * 视觉约定（与站点一致）：
 * - 一级结构用留白分区，不画横线；标题行下不再垫第二条线。
 * - 输入框是幽灵态：常态无边框，hover / focus 时浮现 accentSoft 淡晕。
 * - 唯一的「线」是嵌套回复的左侧导轨，它编码层级信息，不是装饰。
 */

const ghostTransition = `background ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}, box-shadow ${vars.motion.durationBase} ${vars.motion.ease}`;

export const section = style({
	margin: `${vars.space.xxl} ${vars.space.lg} ${vars.space.xxxxl}`,
	fontFamily: vars.font.body,
	fontSize: '0.9rem',
	lineHeight: 1.7,
	color: vars.color.text,
	minWidth: 0,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			marginLeft: 0,
			marginRight: 0,
		},
	},
});

// 组件自己生成的 DOM 会大量用 [hidden]；带 display 的类会压过 UA 的 display:none。
globalStyle(`${section} [hidden]`, { display: 'none !important' });

export const header = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: vars.space.sm,
	marginBottom: vars.space.lg,
});

export const heading = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	gap: vars.space.sm,
	margin: 0,
	fontFamily: vars.font.heading,
	fontSize: '1.15rem',
	fontWeight: 700,
	lineHeight: 1.5,
	letterSpacing: '-0.01em',
	color: vars.color.textStrong,
});

export const count = style({
	display: 'inline-flex',
	alignItems: 'center',
	minWidth: '1.5em',
	padding: '1px 9px',
	borderRadius: vars.radius.pill,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontFamily: vars.font.mono,
	fontSize: '0.72rem',
	fontWeight: 600,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1.6,
});

export const subline = style({
	margin: `${vars.space.xs} 0 0`,
	fontSize: '0.78rem',
	color: vars.color.textMeta,
});

export const headActions = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.xs,
});

export const ghostButton = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '5px',
	minHeight: '30px',
	padding: '4px 10px',
	border: 'none',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.textMuted,
	font: 'inherit',
	fontSize: '0.78rem',
	fontWeight: 500,
	cursor: 'pointer',
	transition: ghostTransition,
	selectors: {
		'&:hover:not(:disabled)': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
		'&:disabled': { opacity: 0.45, cursor: 'default' },
		'&[aria-pressed="true"]': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
	},
});

export const primaryButton = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '6px',
	minHeight: '34px',
	padding: '7px 18px',
	border: 'none',
	borderRadius: vars.radius.sm,
	// 明暗两套 token 互换底色与字色，因此无需额外写 dark 分支也能保证对比度。
	background: vars.color.accentStrong,
	color: vars.color.background,
	font: 'inherit',
	fontSize: '0.82rem',
	fontWeight: 600,
	cursor: 'pointer',
	transition: ghostTransition,
	selectors: {
		'&:hover:not(:disabled)': { opacity: 0.86 },
		'&:disabled': { opacity: 0.45, cursor: 'default' },
	},
});

/* ── 编辑器 ───────────────────────────────────────────────────────────── */

export const editor = style({
	marginBottom: vars.space.xl,
});

export const replyBar = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.sm,
	marginBottom: vars.space.sm,
	padding: `6px ${vars.space.sm}`,
	borderRadius: vars.radius.sm,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.78rem',
});

export const identityRow = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
	gap: vars.space.sm,
	marginBottom: vars.space.sm,
});

export const input = style({
	width: '100%',
	minWidth: 0,
	padding: `8px ${vars.space.sm}`,
	border: 'none',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	fontSize: '0.82rem',
	transition: ghostTransition,
	selectors: {
		'&::placeholder': { color: vars.color.textMeta, opacity: 0.85 },
		'&:hover': { background: vars.color.accentSoft },
		'&:focus': { background: vars.color.accentSoft },
	},
});

export const composer = style({
	// 幽灵态：常态零装饰；hover / 聚焦才浮现 accentSoft 淡晕，不画边框。
	borderRadius: vars.radius.md,
	background: 'transparent',
	transition: ghostTransition,
	selectors: {
		'&:hover': { background: vars.color.accentSoft },
		'&:focus-within': { background: vars.color.accentSoft },
	},
});

export const textarea = style({
	display: 'block',
	width: '100%',
	minHeight: '96px',
	padding: `${vars.space.md} ${vars.space.md} 0`,
	border: 'none',
	borderRadius: `${vars.radius.md} ${vars.radius.md} 0 0`,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	fontSize: '0.9rem',
	lineHeight: 1.8,
	// 不用原生缩放手柄：它固定渲染在右下角，正好压在「发送」按钮边上，很难看。
	// 改成随内容自动增高（client.ts 的 autoGrow），超过上限再内部滚动。
	resize: 'none',
	overflowY: 'hidden',
	maxHeight: '248px',
	// 与站点搜索框一致：输入元素关掉原生外框，焦点反馈由 composer 的淡晕统一给出。
	outline: 'none',
	selectors: {
		'&::placeholder': { color: vars.color.textMeta, opacity: 0.85 },
	},
});

export const toolbar = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.sm,
	padding: `0 ${vars.space.sm} ${vars.space.sm}`,
});

export const toolbarLeft = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.xs,
	minWidth: 0,
});

export const emojiAnchor = style({
	position: 'relative',
});

export const emojiPanel = style({
	position: 'absolute',
	bottom: 'calc(100% + 8px)',
	left: 0,
	zIndex: 20,
	width: 'min(344px, 84vw)',
	padding: vars.space.md,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.md,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.float,
	// 关闭态显式隐藏：display:grid 会压过 [hidden]，且透明面板会吞掉点击。
	visibility: 'hidden',
	pointerEvents: 'none',
	opacity: 0,
	transform: 'translateY(4px)',
	transition: `opacity ${vars.motion.durationFast} ${vars.motion.ease}, transform ${vars.motion.durationFast} ${vars.motion.ease}, visibility ${vars.motion.durationFast}`,
	selectors: {
		'&[data-open="true"]': {
			visibility: 'visible',
			pointerEvents: 'auto',
			opacity: 1,
			transform: 'translateY(0)',
		},
	},
});

export const emojiTabs = style({
	display: 'flex',
	gap: '4px',
	marginBottom: vars.space.sm,
	overflowX: 'auto',
	scrollbarWidth: 'none',
});

export const emojiTab = style({
	flexShrink: 0,
	padding: '3px 9px',
	border: 'none',
	borderRadius: vars.radius.pill,
	background: 'transparent',
	color: vars.color.textMeta,
	font: 'inherit',
	fontSize: '0.72rem',
	cursor: 'pointer',
	whiteSpace: 'nowrap',
	transition: ghostTransition,
	selectors: {
		'&:hover': { background: vars.color.accentSoft, color: vars.color.accentStrong },
		'&[aria-selected="true"]': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
			fontWeight: 600,
		},
	},
});

export const emojiGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
	gap: '2px',
	// 高度对齐整行：32×6 + 2×5 = 202，避免底部露出半行被裁切的字形。
	maxHeight: '202px',
	overflowY: 'auto',
	scrollbarWidth: 'none',
	selectors: { '&::-webkit-scrollbar': { display: 'none' } },
});

export const emojiItem = style({
	width: '32px',
	height: '32px',
	display: 'grid',
	placeItems: 'center',
	padding: 0,
	border: 'none',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	fontSize: '18px',
	lineHeight: 1,
	cursor: 'pointer',
	transition: ghostTransition,
	selectors: { '&:hover': { background: vars.color.accentSoft } },
});

/**
 * 颜文字（kaomoji）是 6–14 个字符宽的文本，塞进 32px 方格会折成好几行糊成一片。
 * 这类分组改用「按内容宽度流式排布的小胶囊」，一行放几个由宽度自然决定，绝不截断。
 */
export const emojiGridText = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '2px 4px',
	// 同上：30×6 + 4×5 = 200，恰好 6 行，不切半行。
	maxHeight: '200px',
	overflowY: 'auto',
	scrollbarWidth: 'none',
	selectors: { '&::-webkit-scrollbar': { display: 'none' } },
});

export const emojiItemText = style({
	height: '30px',
	display: 'inline-flex',
	alignItems: 'center',
	padding: '0 7px',
	border: 'none',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: vars.color.text,
	font: 'inherit',
	fontSize: '0.82rem',
	lineHeight: 1,
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	transition: ghostTransition,
	selectors: { '&:hover': { background: vars.color.accentSoft, color: vars.color.accentStrong } },
});

export const emojiImage = style({
	width: '24px',
	height: '24px',
	objectFit: 'contain',
	borderRadius: 0,
});

export const notice = style({
	minHeight: '1.3em',
	margin: `${vars.space.sm} 0 0`,
	fontSize: '0.78rem',
	color: vars.color.textMeta,
	selectors: {
		'&[data-tone="error"]': { color: vars.tone.danger.fg },
		'&[data-tone="success"]': { color: vars.tone.success.fg },
	},
	'@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
});

/* ── 列表 / 状态 ──────────────────────────────────────────────────────── */

export const listHeader = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: vars.space.sm,
	marginBottom: vars.space.md,
});

export const listTitle = style({
	fontSize: '0.82rem',
	fontWeight: 600,
	color: vars.color.textMuted,
});

export const listMeta = style({
	fontSize: '0.75rem',
	color: vars.color.textMeta,
	fontVariantNumeric: 'tabular-nums',
});

export const list = style({
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.lg,
	minWidth: 0,
});

const shimmer = keyframes({
	'0%': { backgroundPosition: '180% 0' },
	'100%': { backgroundPosition: '-80% 0' },
});

const skeletonFill = style({
	borderRadius: vars.radius.sm,
	background: `linear-gradient(90deg, ${vars.color.border} 20%, ${vars.color.accentSoft} 45%, ${vars.color.border} 70%)`,
	backgroundSize: '200% 100%',
	animation: `${shimmer} 1.4s ${vars.motion.ease} infinite`,
});

export const skeletonRow = style({
	display: 'grid',
	gridTemplateColumns: '34px minmax(0, 1fr)',
	gap: vars.space.md,
});

export const skeletonAvatar = style([skeletonFill, { width: '34px', height: '34px', borderRadius: '50%' }]);
export const skeletonBody = style({ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' });
export const skeletonLine = style([skeletonFill, { height: '10px', width: '100%' }]);

export const empty = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: vars.space.sm,
	padding: `${vars.space.xxl} ${vars.space.lg}`,
	textAlign: 'center',
	color: vars.color.textMeta,
});

export const emptyIcon = style({
	width: '38px',
	height: '38px',
	color: vars.color.accent,
	opacity: 0.75,
});

export const emptyTitle = style({
	margin: 0,
	fontSize: '0.92rem',
	fontWeight: 600,
	color: vars.color.textStrong,
});

export const emptyText = style({
	margin: 0,
	fontSize: '0.8rem',
});

export const errorState = style([empty, { gap: vars.space.md }]);

/* ── 评论节点 ─────────────────────────────────────────────────────────── */

export const comment = style({
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	selectors: { '&[data-fresh="true"]': { animation: `${keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })} ${vars.motion.durationSlow} ${vars.motion.ease}` } },
});

export const commentLine = style({
	display: 'grid',
	gridTemplateColumns: '34px minmax(0, 1fr)',
	gap: vars.space.md,
	minWidth: 0,
});

export const avatar = style({
	width: '34px',
	height: '34px',
	display: 'grid',
	placeItems: 'center',
	overflow: 'hidden',
	flexShrink: 0,
	borderRadius: '50%',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.85rem',
	fontWeight: 600,
});

export const avatarImg = style({
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	borderRadius: 0,
});

export const commentBody = style({ minWidth: 0 });

export const commentMeta = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: vars.space.sm,
	fontSize: '0.76rem',
	lineHeight: 1.6,
	color: vars.color.textMeta,
});

export const commentNick = style({
	fontSize: '0.85rem',
	fontWeight: 600,
	color: vars.color.textStrong,
	textDecoration: 'none',
	selectors: { '&:hover': { color: vars.color.accentStrong } },
});

export const commentBadge = style({
	padding: '1px 6px',
	borderRadius: vars.radius.sm,
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.68rem',
});

export const commentPending = style({
	fontSize: '0.7rem',
	color: vars.tone.warning.fg,
});

export const commentReplyTo = style({
	margin: '2px 0 0',
	fontSize: '0.76rem',
	color: vars.color.textMeta,
});

export const commentContent = style({
	marginTop: '4px',
	fontSize: '0.9rem',
	lineHeight: 1.8,
	color: vars.color.text,
	overflowWrap: 'anywhere',
});

export const commentActions = style({
	display: 'flex',
	alignItems: 'center',
	gap: vars.space.sm,
	marginTop: vars.space.xs,
});

export const replyButton = style([ghostButton, { padding: '2px 8px', minHeight: '26px', fontSize: '0.75rem' }]);

export const children = style({
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.lg,
	margin: `${vars.space.lg} 0 0 calc(34px + ${vars.space.md})`,
	paddingLeft: vars.space.md,
	borderLeft: `1px solid ${vars.color.border}`,
	minWidth: 0,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			marginLeft: '18px',
			paddingLeft: vars.space.sm,
		},
	},
});

/* ── 分页 / 验证码 ────────────────────────────────────────────────────── */

export const footer = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'center',
	gap: vars.space.md,
	minHeight: '36px',
	marginTop: vars.space.xl,
});

export const loadMore = style([ghostButton, {
	padding: '6px 18px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
}]);

export const pagerText = style({
	fontSize: '0.75rem',
	color: vars.color.textMeta,
	fontVariantNumeric: 'tabular-nums',
});

export const captchaOverlay = style({
	position: 'fixed',
	inset: 0,
	zIndex: 100,
	display: 'grid',
	placeItems: 'center',
	padding: vars.space.lg,
	background: 'rgba(0, 0, 0, 0.38)',
	visibility: 'hidden',
	pointerEvents: 'none',
	opacity: 0,
	transition: `opacity ${vars.motion.durationFast} ${vars.motion.ease}, visibility ${vars.motion.durationFast}`,
	selectors: {
		'&[data-open="true"]': { visibility: 'visible', pointerEvents: 'auto', opacity: 1 },
	},
});

export const captchaCard = style({
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.md,
	width: 'min(320px, 92vw)',
	padding: vars.space.xl,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.float,
	fontSize: '0.86rem',
});

export const captchaTitle = style({ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: vars.color.textStrong });
export const captchaHint = style({ margin: 0, fontSize: '0.78rem', color: vars.color.textMeta });
export const captchaImage = style({
	width: '160px',
	height: '50px',
	objectFit: 'contain',
	alignSelf: 'center',
	borderRadius: vars.radius.sm,
	cursor: 'pointer',
});
export const captchaInput = style([input, { background: vars.color.accentSoft }]);
export const captchaActions = style({ display: 'flex', justifyContent: 'flex-end', gap: vars.space.sm });

/* ── 评论正文内的 Markdown 复位 ───────────────────────────────────────── */
// 全站 `p, ul, ol, blockquote, pre` 有 1.5rem 下边距，评论里必须收紧；
// 用 .commentContent p 这样的组合选择器提高特异性，不影响正文排版。

globalStyle(`${commentContent} p, ${commentContent} ul, ${commentContent} ol, ${commentContent} blockquote, ${commentContent} pre, ${commentContent} table`, {
	margin: '0 0 0.6em',
});
globalStyle(`${commentContent} > :last-child`, { marginBottom: 0 });
globalStyle(`${commentContent} p`, { fontSize: '0.9rem', lineHeight: 1.8 });
globalStyle(`${commentContent} ul, ${commentContent} ol`, { paddingInlineStart: vars.space.xl });
globalStyle(`${commentContent} blockquote`, {
	paddingLeft: vars.space.md,
	borderLeft: `2px solid ${vars.color.borderStrong}`,
	color: vars.color.textMuted,
});
globalStyle(`${commentContent} a`, { textDecoration: 'underline', textUnderlineOffset: '0.18em' });
globalStyle(`${commentContent} pre`, {
	padding: vars.space.md,
	fontSize: '0.8rem',
	lineHeight: 1.6,
});
globalStyle(`${commentContent} img`, {
	maxWidth: '100%',
	height: 'auto',
	borderRadius: vars.radius.sm,
});
globalStyle(`${commentContent} .cm-emoji`, {
	display: 'inline-block',
	width: '22px',
	height: '22px',
	margin: '0 2px',
	borderRadius: 0,
	verticalAlign: '-0.35em',
});
