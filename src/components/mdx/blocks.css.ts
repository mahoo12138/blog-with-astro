import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { vars, breakpoints } from '../../styles/theme.css';

/**
 * MDX 内容原语样式真源（组件域）。
 *
 * 对应组件：src/components/mdx/{Card,Tile,Grid,Caption,Intro,Panes,Pane,Flow,FlowStep,
 * Formula,Refs,Ref,Figure,Table,Subhead}.astro，由 mdx-components.ts 注册。
 *
 * ⚠️ import 顺序依赖：本文件必须在 mdx-components.ts 中排在 components.css.ts
 * **之后** import。容器 `> *` 规则与 `.tag-plugin.callout` 同为 (0,2,0) 特异性，
 * 靠源序决胜——顺序颠倒会导致卡片内 Callout 间距回退为 xl。
 *
 * 间距节奏（margin-bottom 模型，与 theme 全局一致）：
 * - 唯一块间距 = space.xl（1.5rem）；上间距只给标题；
 * - 容器内部（card/intro/pane/tileBody）子块 space.md，首末子归零；
 * - grid gap 即间距，子项 margin 0；
 * - Caption/Formula 是「附着块」（data-attach）：主体吸附图注（xs）、连续图注成组（sm）。
 * 取值一律引用 vars token（明暗 hash 变量穿透），禁止 var(--color-*) 未定义变量。
 */

/* ── 组件根类（哈希类自带 margin，先定义；结构规则在后，同特异性时后者胜） ── */

/** 唯一带框面板 */
export const card = style({
	margin: `0 0 ${vars.space.xl}`,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	boxShadow: vars.shadow.card,
	padding: 'clamp(18px, 3vw, 28px)',
	minWidth: 0,
});

export const cardTitle = style({
	fontSize: '1.05rem',
	fontWeight: 600,
	margin: `0 0 ${vars.space.md}`,
	letterSpacing: '-0.015em',
	color: vars.color.textStrong,
	fontFamily: vars.font.heading,
});

/** 概念小卡：无边框，靠 mini-label + 留白分组（嵌套降噪） */
export const tile = style({
	margin: 0,
	minWidth: 0,
});

export const tileLabel = styleVariants({
	default: {
		fontFamily: vars.font.mono,
		fontSize: '10px',
		fontWeight: 700,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: vars.color.textMeta,
		display: 'block',
		marginBottom: '4px',
	},
	danger: {
		fontFamily: vars.font.mono,
		fontSize: '10px',
		fontWeight: 700,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: vars.tone.danger.fg,
		display: 'block',
		marginBottom: '4px',
	},
});

export const tileTitle = style({
	fontSize: '1rem',
	margin: `0 0 ${vars.space.xs}`,
	color: vars.color.textStrong,
	fontFamily: vars.font.heading,
	letterSpacing: '-0.015em',
	lineHeight: 1.35,
});

export const tileBody = style({
	fontSize: '0.8125rem',
	lineHeight: 1.85,
	color: vars.color.textMuted,
});

/** 网格：gap 即间距 */
export const grid = style({
	margin: `0 0 ${vars.space.xl}`,
	display: 'grid',
	alignItems: 'start',
});

/** 列数语义：桌面 N 列，窄屏逐级降到 2 列、1 列。
 *  刻意不用 auto-fit —— auto-fit 不认识 cols，宽屏会把 6 张卡铺成 5+1 挂单，
 *  且列宽随视口漂移导致行尾断词。确定性列数让行对齐、列宽可预期。
 *  降级顺序：3/4 列在 laptop 下 2 列、mobile 下 1 列；2 列只在 mobile 下 1 列。 */
export const gridCols = styleVariants({
	2: {
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: vars.space.lg,
		'@media': {
			[`screen and (max-width: ${breakpoints.mobile})`]: { gridTemplateColumns: '1fr' },
		},
	},
	3: {
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: vars.space.md,
		'@media': {
			[`screen and (max-width: ${breakpoints.laptop})`]: { gridTemplateColumns: 'repeat(2, 1fr)' },
			[`screen and (max-width: ${breakpoints.mobile})`]: { gridTemplateColumns: '1fr' },
		},
	},
	4: {
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: vars.space.sm,
		'@media': {
			[`screen and (max-width: ${breakpoints.laptop})`]: { gridTemplateColumns: 'repeat(2, 1fr)' },
			[`screen and (max-width: ${breakpoints.mobile})`]: { gridTemplateColumns: '1fr' },
		},
	},
});

export const gridStack = style({
	gridTemplateColumns: '1fr',
	gap: vars.space.lg,
	alignContent: 'start',
});

/** 图注 / 小字注解（附着块） */
export const caption = style({
	margin: `0 0 ${vars.space.xl}`,
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.textMuted,
});

export const captionAlign = styleVariants({
	center: { textAlign: 'center' },
});

/** 章节导读：淡底无框 */
export const intro = style({
	margin: `0 0 ${vars.space.xl}`,
	background: vars.color.surfaceMuted,
	borderRadius: vars.radius.md,
	padding: '15px 17px',
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.text,
	minWidth: 0,
});

/** 并排对照 */
export const panes = style({
	margin: `0 0 ${vars.space.xl}`,
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
	gap: vars.space.md,
});

export const pane = style({
	borderRadius: vars.radius.md,
	padding: 14,
	background: `color-mix(in srgb, ${vars.color.backgroundElevated} 60%, transparent)`,
	minWidth: 0,
});

export const paneTitle = style({
	fontSize: '12px',
	margin: `0 0 ${vars.space.sm}`,
	color: vars.color.textMuted,
	fontFamily: vars.font.body,
	letterSpacing: 'normal',
	fontWeight: 600,
	lineHeight: 1.5,
});

export const paneValue = style({
	fontWeight: 700,
	fontSize: '1.15rem',
	fontFamily: vars.font.mono,
	color: vars.color.accentStrong,
	overflowWrap: 'anywhere',
	margin: `0 0 ${vars.space.sm}`,
	lineHeight: 1.6,
});

export const paneBody = style({
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.text,
});

/** 横向步骤流：淡底无框，伪元素箭头连接 */
export const flow = style({
	margin: `0 0 ${vars.space.xl}`,
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
	gap: 9,
	alignItems: 'stretch',
});

export const flowStep = style({
	position: 'relative',
	borderRadius: vars.radius.md,
	padding: 12,
	background: `color-mix(in srgb, ${vars.color.backgroundElevated} 60%, transparent)`,
	minWidth: 0,
	fontSize: '0.75rem',
	lineHeight: 1.7,
	color: vars.color.textMuted,
	selectors: {
		'&:not(:last-child)::after': {
			content: "'→'",
			position: 'absolute',
			right: '-10px',
			top: 'calc(50% - 10px)',
			zIndex: 2,
			color: vars.color.textMeta,
			fontWeight: 800,
			background: vars.color.background,
			padding: '0 1px',
		},
	},
});

globalStyle(`${flowStep}::after`, {
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			display: 'none',
		},
	},
});

export const flowTitle = style({
	display: 'block',
	fontSize: '0.8rem',
	marginBottom: 4,
	color: vars.color.textStrong,
});

export const flowBody = style({
	display: 'block',
});

/** 公式条（附着块） */
export const formula = style({
	margin: `0 0 ${vars.space.sm}`,
	borderRadius: vars.radius.sm,
	background: vars.color.backgroundElevated,
	padding: '10px 12px',
	color: vars.color.textStrong,
	fontFamily: vars.font.mono,
	fontSize: '12px',
	lineHeight: 1.9,
	overflowWrap: 'anywhere',
});

export const formulaPlain = style({
	background: 'transparent',
	padding: 0,
});

/** 延伸阅读 */
export const refs = style({
	margin: `0 0 ${vars.space.xl}`,
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
	gap: vars.space.md,
	padding: 0,
	listStyle: 'none',
});

export const ref = style({
	minWidth: 0,
});

export const refDesc = style({
	margin: '4px 0 0',
	fontSize: '12px',
	lineHeight: 1.8,
	color: vars.color.textMuted,
});

/** 示意图：独立图保留框体 */
export const figure = style({
	margin: `0 0 ${vars.space.xl}`,
});

export const figureFrame = style({
	display: 'block',
	width: '100%',
	background: vars.color.backgroundElevated,
	border: `1px solid ${vars.color.border}`,
	borderRadius: vars.radius.lg,
	overflow: 'hidden',
});

export const figureCaption = style({
	margin: `${vars.space.sm} 0 0`,
	fontSize: '13px',
	lineHeight: 1.85,
	color: vars.color.textMuted,
});

/** 教学对照表外壳 */
export const tableWrap = style({
	margin: `0 0 ${vars.space.xl}`,
	width: '100%',
	fontSize: '0.8rem',
	lineHeight: 1.8,
	overflowX: 'auto',
	display: 'block',
});

/** 块内小标题 */
export const subhead = style({
	fontSize: '1.05rem',
	margin: `0 0 ${vars.space.sm}`,
	letterSpacing: '-0.015em',
	color: vars.color.textStrong,
	fontFamily: vars.font.heading,
	fontWeight: 600,
	lineHeight: 1.35,
});

/* ── 结构规则（.md-text 作用域，(0,2,0) 与 callout 平级、靠源序胜） ── */

const scope = '.md-text';

const containers = [card, intro, pane, paneBody, tileBody];
for (const container of containers) {
	globalStyle(`${scope} ${container} > *`, { margin: `0 0 ${vars.space.md}` });
	globalStyle(`${scope} ${container} > :first-child`, { marginTop: 0 });
	globalStyle(`${scope} ${container} > :last-child`, { marginBottom: 0 });
}

/** grid gap 即间距：子项（含 Tile、裸容器、kl-* host）不带外边距 */
globalStyle(`${scope} ${grid} > *`, { margin: 0 });

/** 术语注解包装器：自定义元素默认 inline，包整篇正文时必须成块 */
globalStyle(`${scope} kl-term-annotate`, { display: 'block' });

/** 表格内部：外壳独占块间距 */
globalStyle(`${tableWrap} table`, {
	width: '100%',
	borderCollapse: 'collapse',
	fontSize: '0.8rem',
	margin: 0,
});
globalStyle(`${tableWrap} th`, {
	background: vars.color.backgroundElevated,
	color: vars.color.textStrong,
	textAlign: 'left',
	fontSize: '0.75rem',
});
globalStyle(`${tableWrap} td:first-child`, {
	fontWeight: 650,
	color: vars.color.textStrong,
});

/** 图框内的 svg 充满框体 */
globalStyle(`${figureFrame} > svg`, {
	display: 'block',
	width: '100%',
});

/** 延伸阅读链接 */
globalStyle(`${ref} a`, {
	fontWeight: 600,
	fontSize: '0.9rem',
});

/**
 * 附着块吸附（data-attach = Caption / Formula / figcaption）：
 * 主体紧贴其图注（xs）；连续附着块成组（sm）。:has() 基线 Chrome 105+，
 * 不支持时退化为普通块间距，无布局破坏。
 */
globalStyle(`${scope} *:not([data-attach]):has(+ [data-attach])`, {
	marginBottom: vars.space.xs,
});
globalStyle(`${scope} [data-attach]:has(+ [data-attach])`, {
	marginBottom: vars.space.sm,
});
