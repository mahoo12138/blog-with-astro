import { style, globalStyle } from '@vanilla-extract/css';
import { vars, breakpoints } from '../styles/theme.css';

/**
 * LessonLayout —— 课时页 chrome：暗色 hero、正文。
 * 视觉哲学见 docs/design/article-banner-philosophy.md（深空显影）。
 *
 * Hero：单列骨架，顶部轻（来路 + eyebrow）/ 底部重（标题 + 导语 + 标签 + 终端）。
 * 四层深度：底色渐变（课时 slug 派生色温）→ 底部压暗 → 极低颗粒 → 文字。
 * 色温变量 --hero-* 由 LessonLayout.astro 按 slug 确定性注入。
 */

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// 第一层：深空底色 —— 顶部色温渐隐到近黑（不是平涂，是「显影」）
export const hero = style({
	position: 'relative',
	isolation: 'isolate',
	overflow: 'hidden',
	maxWidth: '1080px',
	margin: `0 auto ${vars.space.xxl}`,
	borderRadius: vars.radius.xl,
	background:
		'radial-gradient(130% 125% at 8% 0%, var(--hero-tint) 0%, var(--hero-deep) 48%, #050a12 100%)',
	color: '#fff',
});

// 第二层：底部压暗（上方轻、下方重，阅读区最重）
globalStyle(`${hero}::before`, {
	content: '""',
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	background:
		'linear-gradient(to top, rgba(3,7,14,.86) 0%, rgba(3,7,14,.22) 44%, rgba(3,7,14,0) 72%)',
});

// 第三层：极低颗粒 —— 决定它是「印刷品」而非「屏幕」
globalStyle(`${hero}::after`, {
	content: '""',
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	opacity: 0.05,
	backgroundImage: GRAIN,
	backgroundSize: '140px 140px',
});

export const heroInner = style({
	position: 'relative',
	zIndex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: 'clamp(40px, 6.4vw, 80px)',
	padding: 'clamp(28px, 3.2vw, 44px) clamp(24px, 4vw, 48px) clamp(18px, 2.2vw, 28px)',
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gap: '30px',
			padding: '24px 20px',
		},
	},
});

export const heroTop = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	flexWrap: 'wrap',
	gap: '12px 18px',
});

export const heroBack = style({
	fontFamily: vars.font.mono,
	fontSize: '11px',
	letterSpacing: '0.06em',
	color: 'color-mix(in srgb, var(--hero-accent) 74%, transparent)',
	textDecoration: 'none',
	transition: `color ${vars.motion.durationFast} ${vars.motion.ease}`,
	selectors: {
		'&:hover': { color: 'var(--hero-accent)' },
		'&:focus-visible': { outline: '2px solid var(--hero-accent)', outlineOffset: '3px' },
	},
});

export const heroEyebrow = style({
	fontFamily: vars.font.mono,
	fontWeight: 700,
	fontSize: '11px',
	lineHeight: 1.4,
	letterSpacing: '0.16em',
	textTransform: 'uppercase',
	color: 'var(--hero-accent)',
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	margin: 0,
	selectors: {
		'&::before': {
			content: '""',
			height: '1px',
			width: '28px',
			background: 'color-mix(in srgb, var(--hero-accent) 64%, transparent)',
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: { display: 'none' },
	},
});

export const heroBottom = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: '16px',
	minWidth: 0,
});

export const heroTitle = style({
	margin: 0,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(26px, 5vw, 54px)',
	fontWeight: 700,
	lineHeight: 1.14,
	letterSpacing: '-0.04em',
	color: '#f5f9ff',
	maxWidth: '920px',
	textWrap: 'balance',
});

export const heroTitleAccent = style({
	fontStyle: 'normal',
	color: 'var(--hero-accent)',
});

export const heroLead = style({
	margin: 0,
	color: 'rgba(206,219,235,.86)',
	fontSize: 'clamp(15px, 1.15vw, 17px)',
	lineHeight: 1.8,
	maxWidth: '760px',
});

export const heroTags = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '8px',
	margin: '2px 0 0',
	padding: 0,
	listStyle: 'none',
});

// 胶囊是半透明玻璃（淡底 + 微光边），不是色块
export const heroTag = style({
	fontFamily: vars.font.mono,
	fontSize: '11px',
	fontWeight: 500,
	letterSpacing: '0.04em',
	color: 'color-mix(in srgb, var(--hero-accent) 86%, #fff)',
	background: 'rgba(255,255,255,.055)',
	border: '1px solid rgba(255,255,255,.14)',
	borderRadius: vars.radius.pill,
	padding: '4px 11px',
	backdropFilter: 'blur(6px)',
	WebkitBackdropFilter: 'blur(6px)',
});

// 终端降级为底部一行 mono —— 保留记忆点，不再占据右栏
export const heroTerm = style({
	display: 'flex',
	alignItems: 'baseline',
	flexWrap: 'wrap',
	gap: '10px',
	marginTop: '2px',
	fontFamily: vars.font.mono,
	fontSize: '12px',
	lineHeight: 1.7,
	color: 'rgba(198,214,232,.6)',
});

export const heroTermPrompt = style({ color: 'var(--hero-accent)' });
export const heroTermCmd = style({ color: 'rgba(226,238,250,.82)' });
export const heroTermOut = style({ color: 'rgba(198,214,232,.62)' });
export const heroTermNote = style({ color: 'rgba(198,214,232,.4)' });

// 2px 微光收束（「分割线是一道微光」）
export const heroRule = style({
	width: '100%',
	height: '2px',
	marginTop: '6px',
	borderRadius: '2px',
	background:
		'linear-gradient(90deg, color-mix(in srgb, var(--hero-accent) 72%, transparent), transparent 68%)',
});

/** 正文区（比常规内容更宽，教学页沉浸式） */
export const content = style({
	width: '100%',
	maxWidth: '1080px',
	margin: '0 auto',
});
