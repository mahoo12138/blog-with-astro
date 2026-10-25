import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

/**
 * 课时页布局域（真源分工见 docs/design/design-language.md）：
 * 本文件只剩 —— 正文容器、h2 编号徽章、markdown 标题节奏、prev/next pager。
 *
 * ⚠️ 旧约定（「新课静态排版一律用 lesson-* 全局类、不做组件」）已作废。
 * 新约定：课时静态排版一律用 src/components/mdx-components.ts 注册的 PascalCase
 * 原语组件（Card / Tile / Grid / Caption / Intro / Panes / Flow / Formula /
 * Figure / Table / Refs / Subhead），样式住 src/components/mdx/blocks.css.ts；
 * 有状态交互件归 kl-*（src/kit/），术语弹层归 kl-term。
 *
 * 注意 h2 用后代组合器：MDX 内容被 .md-text 与 kl-term-annotate 两层包裹
 * （LessonLayout / learn/[slug].astro），直接子组合器 `> h2` 打不中任何标题。
 */

/** 课程正文容器 */
export const lessonBody = style({
	width: '100%',
	minWidth: 0,
});

/**
 * 每个 h2 自动带编号徽章（counter-increment），MDX 里零负担。
 *
 * 作用域必须收紧到 `.md-text`（正文域）：lessonBody 挂在 <main> 内容容器上，
 * 而 StellarPageFooter 是它的子孙 —— 用 `${lessonBody} h2` 会把编号徽章、
 * 52px 缩进、巨号字一并砸到页脚分组标题（h2）上，页脚出现竖排单字 + 18/19/20 编号。
 */
const lessonProse = `${lessonBody} .md-text`;

globalStyle(`${lessonProse} h2`, {
	position: 'relative',
	paddingInlineStart: '52px',
	marginTop: vars.space.xxxxl,
	scrollMarginTop: '80px',
	fontSize: 'clamp(1.55rem, 3vw, 2.1rem)',
	counterIncrement: 'section',
});

globalStyle(`${lessonProse} h2::before`, {
	content: 'counter(section)',
	position: 'absolute',
	insetInlineStart: 0,
	top: '2px',
	width: '38px',
	height: '38px',
	borderRadius: '13px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	display: 'grid',
	placeItems: 'center',
	fontFamily: vars.font.mono,
	fontWeight: 800,
	fontSize: '13px',
	letterSpacing: 'normal',
	lineHeight: 1,
});

globalStyle(`${lessonProse}`, {
	// 编号从 00 起
	counterReset: 'section -1',
});

// hero/章节导航之后已有呼吸，首个 h2 不再叠 4rem
globalStyle(`${lessonProse} h2:first-of-type`, {
	marginTop: vars.space.xl,
});

// markdown 裸 h3 的节奏（组件标题自带类名，不命中 :not([class])）
globalStyle(`${lessonProse} h3:not([class])`, {
	marginTop: vars.space.xxl,
});

/** 课程 hero 域：prev/next */
export const pager = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: vars.space.md,
	marginTop: vars.space.xxxxl,
	paddingTop: vars.space.xl,
});

export const pagerLink = style({
	flex: '1 1 220px',
	padding: `${vars.space.lg} ${vars.space.xl}`,
	borderRadius: vars.radius.md,
	border: `1px solid ${vars.color.border}`,
	color: vars.color.text,
	textDecoration: 'none',
	transition: `background ${vars.motion.durationFast} ${vars.motion.ease}, border-color ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			borderColor: vars.color.accent,
			color: vars.color.accentStrong,
		},
	},
});

export const pagerDir = style({
	fontSize: '0.7rem',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
	display: 'block',
	marginBottom: '2px',
});

export const pagerTitle = style({
	fontSize: '0.95rem',
	fontWeight: 600,
	color: vars.color.textStrong,
});
