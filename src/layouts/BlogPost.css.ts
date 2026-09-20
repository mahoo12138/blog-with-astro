import { globalStyle, style } from '@vanilla-extract/css';
import { breakpoints, vars } from '../styles/theme.css';

const gapCompact = '1rem';
const borderCardLarge = '24px';
const borderCard = '16px';
const borderCardSmall = '12px';
const borderBar = '8px';
const borderImage = '24px';
const textP1 = vars.color.text;
const textP2 = vars.color.textMuted;
const textP3 = vars.color.textMeta;
const block = vars.color.surfaceMuted;
const blockBorder = vars.color.borderStrong;
const card = vars.color.surface;

export const main = style({
	width: '100%',
	maxWidth: '100%',
	margin: '0 auto',
	padding: 0,
});

export const article = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr)',
	gap: 0,
	minWidth: 0,
});

export const banner = style({
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-end',
	alignItems: 'flex-start',
	height: 'unset',
	margin: 0,
	overflow: 'hidden',
	borderRadius: borderCardLarge,
	background: block,
	color: vars.color.text,
	vars: {
		'--text-banner': vars.color.text,
		'--button-hover-bg': 'rgba(0, 0, 0, 0.05)',
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			borderRadius: 0,
		},
	},
});

/* ── 文章页头（沉浸式封面 + 渐变压暗）──
 *
 * 与上面的 `banner` / `bannerContent` / `bannerMeta` / `bannerBottom` 刻意分开：
 * 后者是专栏页仍在用的中性壳（浅底深字），文章页头恒为**暗底白字**——
 * 有封面时压在照片上，无封面时压在由文章身份派生出的光晕上。
 * 两套文字色与 hover 反馈完全不同，共用必然一边看不见、一边看不清。
 */

const ink = '#fff';
const inkSoft = 'rgba(255, 255, 255, 0.82)';
const shade = 'rgba(8, 12, 20,';

/** 极细颗粒：让压暗后的渐变像印刷品，而不是一块屏幕色 */
const grainUrl =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E\")";

export const postBanner = style({
	position: 'relative',
	isolation: 'isolate',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-end',
	alignItems: 'stretch',
	minHeight: 'clamp(248px, 32vw, 344px)',
	margin: 0,
	overflow: 'hidden',
	borderRadius: borderCardLarge,
	boxShadow: '0 18px 44px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
	color: ink,
	/* 无封面时的兜底底图：色相由 --banner-hue-a / --banner-hue-b 注入（见 utils/banner.ts） */
	background: [
		'radial-gradient(130% 120% at 14% 4%, hsl(var(--banner-hue-a, 214) 84% 58% / 0.92), transparent 58%)',
		'radial-gradient(110% 110% at 86% 96%, hsl(var(--banner-hue-b, 268) 72% 46% / 0.9), transparent 62%)',
		'linear-gradient(148deg, hsl(var(--banner-hue-a, 214) 62% 24%), hsl(var(--banner-hue-b, 268) 58% 14%))',
	].join(', '),
	vars: {
		'--text-banner': ink,
		'--button-hover-bg': 'rgba(255, 255, 255, 0.22)',
	},
	selectors: {
		"&[data-cover='false']": {
			minHeight: 'clamp(212px, 26vw, 288px)',
		},
	},
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			borderRadius: '20px',
		},
	},
});

export const bannerMedia = style({
	position: 'absolute',
	inset: 0,
	zIndex: 0,
	overflow: 'hidden',
});

export const bannerImage = style({
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	margin: 0,
	userSelect: 'none',
	transform: 'scale(1.015)',
	transition: 'transform 1.4s cubic-bezier(0.2, 0.7, 0.3, 1)',
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			transition: 'none',
		},
	},
});

export const bannerScrim = style({
	position: 'absolute',
	inset: 0,
	zIndex: 1,
	pointerEvents: 'none',
	backgroundImage: [
		`linear-gradient(180deg, ${shade} 0.44) 0%, ${shade} 0.12) 30%, ${shade} 0.32) 62%, ${shade} 0.82) 100%)`,
		`linear-gradient(102deg, ${shade} 0.42) 0%, ${shade} 0) 62%)`,
	].join(', '),
});

export const bannerGrain = style({
	position: 'absolute',
	inset: 0,
	zIndex: 2,
	pointerEvents: 'none',
	backgroundImage: grainUrl,
	backgroundSize: '140px 140px',
	opacity: 0.07,
	mixBlendMode: 'overlay',
});

export const bannerBody = style({
	position: 'relative',
	zIndex: 3,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	gap: '1.1rem',
	width: '100%',
	padding: '1.15rem 1.35rem 1.35rem',
	color: ink,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gap: '0.85rem',
			padding: '0.9rem 1rem 1.1rem',
		},
	},
});

export const bannerTop = style({
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: '0.75rem',
	minWidth: 0,
	fontSize: '13px',
	fontWeight: 500,
	lineHeight: 1,
	color: inkSoft,
});

export const crumbRow = style({
	display: 'flex',
	alignItems: 'baseline',
	flexWrap: 'wrap',
	minWidth: 0,
	rowGap: '4px',
});

export const bannerFoot = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: '0.6rem',
	minWidth: 0,
});

export const kickerRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '0.4rem',
	minWidth: 0,
});

export const chip = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.35rem',
	height: '26px',
	padding: '0 0.65rem',
	borderRadius: '999px',
	border: '1px solid rgba(255, 255, 255, 0.22)',
	background: 'rgba(255, 255, 255, 0.14)',
	backdropFilter: 'blur(10px) saturate(150%)',
	WebkitBackdropFilter: 'blur(10px) saturate(150%)',
	color: ink,
	fontSize: '12.5px',
	fontWeight: 600,
	lineHeight: 1,
	letterSpacing: '0.02em',
	whiteSpace: 'nowrap',
	textDecoration: 'none',
	textShadow: 'none',
	transition: 'background 180ms ease, border-color 180ms ease, transform 180ms ease',
	selectors: {
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.26)',
			borderColor: 'rgba(255, 255, 255, 0.36)',
			color: ink,
			transform: 'translateY(-1px)',
		},
	},
});

export const chipAccent = style({
	borderColor: 'rgba(146, 208, 255, 0.42)',
	background: 'rgba(33, 150, 243, 0.32)',
	selectors: {
		'&:hover': {
			background: 'rgba(33, 150, 243, 0.46)',
			borderColor: 'rgba(146, 208, 255, 0.6)',
		},
	},
});

export const chipIcon = style({
	width: '0.875rem',
	height: '0.875rem',
	flexShrink: 0,
	opacity: 0.92,
});

/** 标题上方那道 2px 微光：整套语言里唯一的「亮线」 */
export const accentRule = style({
	width: '44px',
	height: '2px',
	borderRadius: '2px',
	background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.12))',
});

export const postTitle = style({
	margin: 0,
	maxWidth: '42rem',
	color: ink,
	fontFamily: vars.font.heading,
	fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)',
	fontWeight: 700,
	lineHeight: 1.18,
	letterSpacing: '-0.02em',
	textShadow: '0 2px 20px rgba(6, 10, 18, 0.45)',
});

export const postMeta = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: '0.5rem',
	fontSize: '13px',
	lineHeight: 1,
	color: inkSoft,
	textShadow: '0 1px 10px rgba(6, 10, 18, 0.35)',
});

export const metaDot = style({
	opacity: 0.45,
});

globalStyle(`${postBanner}:hover ${bannerImage}`, { transform: 'scale(1.06)' });
globalStyle(`${bannerTop} span.sep`, { opacity: 0.5, padding: '0 2px' });
globalStyle(`${postMeta} span.sep`, { opacity: 0.45 });

/* ── 以下仍由专栏页复用（columns/[slug].astro），勿随意改动 ── */

export const bannerContent = style({
	position: 'relative',
	zIndex: 1,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	width: '100%',
	height: '100%',
	color: 'var(--text-banner)',
});

export const bannerMeta = style({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-start',
	margin: '1rem calc(1rem - 4px)',
	fontSize: '13px',
	lineHeight: 1,
	fontWeight: 500,
	color: 'var(--text-banner)',
	zIndex: 1,
});

export const breadcrumb = style({
	padding: '4px',
	borderRadius: '2px',
	color: 'var(--text-banner)',
	selectors: {
		'&:hover': {
			background: 'var(--button-hover-bg)',
			color: 'var(--text-banner)',
		},
	},
});

export const bannerBottom = style({
	display: 'flex',
	width: '100%',
	boxSizing: 'border-box',
	padding: '1rem',
	zIndex: 1,
});

export const title = style({
	margin: '0.25rem 0',
	padding: '0.75rem 0',
	fontSize: 'calc(1rem + 8px)',
	fontWeight: 600,
	lineHeight: 1.2,
	letterSpacing: 0,
	color: 'var(--text-banner)',
});

export const updated = style({
	margin: '0.25rem 0',
	fontSize: '14px',
	lineHeight: 1.2,
	opacity: 0.72,
});

export const prose = style({
	position: 'relative',
	boxSizing: 'border-box',
	width: '100%',
	maxWidth: '100%',
	minWidth: 0,
	margin: 0,
	padding: '1rem 1rem 2rem',
	overflow: 'hidden',
	color: textP1,
	lineHeight: 1.6,
	wordBreak: 'break-word',
});

globalStyle(`${prose} > :first-child`, { marginTop: 0 });
globalStyle(`${prose} > :last-child`, { marginBottom: 0 });

globalStyle(`${prose} p`, {
	fontSize: '1rem',
	lineHeight: 1.6,
	marginTop: `calc(${gapCompact} - 4px)`,
	marginBottom: `calc(${gapCompact} - 4px)`,
});

globalStyle(`${prose} ul, ${prose} ol`, {
	margin: `calc(${gapCompact} - 4px) 0.25rem`,
	paddingBottom: '0.5rem',
	paddingInlineStart: '1.4rem',
});

globalStyle(`${prose} li`, {
	margin: '0.25rem 0',
});

globalStyle(`${prose} h1, ${prose} h2, ${prose} h3, ${prose} h4, ${prose} h5, ${prose} h6`, {
	color: vars.color.textStrong,
	lineHeight: 1.45,
	letterSpacing: 0,
});

globalStyle(`${prose} h1`, { fontSize: '1.75rem', fontWeight: 700, marginTop: '1.5em' });
globalStyle(`${prose} h2`, { fontSize: '1.65rem', fontWeight: 700, marginTop: '1.5em' });
globalStyle(`${prose} h3`, { fontSize: '1.35rem', fontWeight: 700, marginTop: '1.25em' });
globalStyle(`${prose} h4`, { fontSize: '1.18rem', fontWeight: 700 });
globalStyle(`${prose} h5`, { fontSize: '1.05rem', fontWeight: 700 });
globalStyle(`${prose} h6`, { fontSize: '1rem', fontWeight: 700, color: textP2 });

globalStyle(`${prose} a:not([class])`, {
	position: 'relative',
	borderRadius: 0,
	textDecoration: 'none',
	background: `linear-gradient(0deg, ${blockBorder}, ${blockBorder}) no-repeat left 100% / 100% 2px`,
});

globalStyle(`${prose} a:not([class]):hover`, {
	borderRadius: '4px',
	color: vars.color.accentStrong,
	background: `linear-gradient(0deg, ${vars.color.accentSoft}, ${vars.color.accentSoft}) no-repeat left 100% / 100% 100%`,
});

globalStyle(`${prose} blockquote`, {
	margin: '1rem 0',
	padding: '0.75rem 1rem',
	borderLeft: `4px solid ${vars.color.accent}`,
	borderRadius: `0 ${borderCardSmall} ${borderCardSmall} 0`,
	background: block,
	color: textP1,
});

globalStyle(`${prose} blockquote p`, { fontSize: '0.95rem', lineHeight: 1.5 });

globalStyle(`${prose} img`, {
	display: 'block',
	maxWidth: '100%',
	height: 'auto',
	margin: '1rem auto',
	borderRadius: borderImage,
});

globalStyle(`${prose} p > img`, { margin: 'auto' });

globalStyle(`${prose} pre`, {
	margin: '1rem 0',
	padding: '1rem',
	borderRadius: borderCardSmall,
	border: `1px solid ${blockBorder}`,
	boxShadow: 'none',
	background: vars.color.surfaceStrong,
	color: vars.color.codeText,
	lineHeight: 1.55,
	whiteSpace: 'pre-wrap',
	overflowWrap: 'anywhere',
});

globalStyle(`${prose} code`, {
	borderRadius: '4px',
	padding: '0.15em 0.35em',
	background: block,
	color: vars.color.textStrong,
	fontSize: '0.88em',
});

globalStyle(`${prose} pre > code`, {
	all: 'unset',
	fontFamily: vars.font.mono,
	fontSize: '0.9rem',
	color: vars.color.codeText,
	lineHeight: 1.65,
});

globalStyle(`${prose} table`, {
	display: 'block',
	width: '100%',
	overflowX: 'auto',
	borderCollapse: 'collapse',
	fontSize: '0.9rem',
});

globalStyle(`${prose} th, ${prose} td`, {
	padding: '0.55rem 0.75rem',
	borderBottom: `1px solid ${blockBorder}`,
});

globalStyle(`${prose} hr`, {
	margin: '2rem 0',
	border: 'none',
	borderTop: `1px dashed ${blockBorder}`,
});

globalStyle(`${prose} u`, { textDecoration: 'none', borderBottom: `2px solid ${vars.color.accent}` });

globalStyle(`${prose} kbd`, {
	padding: '2px 4px 1px',
	borderRadius: '4px',
	border: `1px solid ${blockBorder}`,
	borderBottomWidth: '2px',
	background: card,
	fontFamily: vars.font.mono,
	fontWeight: 700,
});

globalStyle(`${prose} .tag-plugin`, {
	boxSizing: 'border-box',
	marginTop: gapCompact,
	marginBottom: gapCompact,
	vars: {
		'--theme': vars.color.accent,
		'--theme-block': vars.color.accentSoft,
		'--theme-border': vars.color.borderStrong,
		'--theme-mark': 'rgba(255, 230, 89, 0.55)',
	},
});

globalStyle(`${prose} .tag-plugin.note`, {
	position: 'relative',
	padding: '0.25rem 1rem',
	borderRadius: borderCard,
	background: 'var(--theme-block)',
	overflow: 'hidden',
	color: textP1,
});

globalStyle(`${prose} .tag-plugin.note > .title`, {
	fontSize: '0.95rem',
	lineHeight: 1.5,
	marginTop: gapCompact,
	fontWeight: 500,
	color: vars.color.textStrong,
});

globalStyle(`${prose} .tag-plugin.note > .body`, {
	marginTop: gapCompact,
	marginBottom: gapCompact,
	fontSize: '0.92rem',
	lineHeight: 1.5,
});

globalStyle(`${prose} .tag-plugin.note > .body > :first-child`, { marginTop: 0 });
globalStyle(`${prose} .tag-plugin.note > .body > :last-child`, { marginBottom: 0 });

globalStyle(`${prose} details.folding`, {
	display: 'block',
	padding: '1rem',
	margin: '1rem 0',
	borderRadius: borderCard,
	background: 'var(--theme-block)',
	border: '1px solid var(--theme-border)',
});

globalStyle(`${prose} details.folding > summary`, {
	cursor: 'pointer',
	padding: '1rem',
	margin: '-1rem',
	color: textP2,
	fontWeight: 500,
	fontSize: '0.95rem',
	position: 'relative',
	lineHeight: 1.2,
	outline: 'none',
	listStyle: 'none',
});

globalStyle(`${prose} details.folding > summary::-webkit-details-marker`, { display: 'none' });
globalStyle(`${prose} details.folding > summary::after`, { position: 'absolute', content: '+', right: '1rem', top: '50%', transform: 'translateY(-50%)', lineHeight: 1 });
globalStyle(`${prose} details.folding[open] > summary`, { color: textP1, fontWeight: 700 });
globalStyle(`${prose} details.folding[open] > summary::after`, { content: '-' });
globalStyle(`${prose} details.folding > .body`, { padding: '0 1rem 1rem', margin: '0 -1rem -1rem', color: textP1 });
globalStyle(`${prose} details.folding[open] > .body > :first-child`, { marginTop: '1rem' });
globalStyle(`${prose} details.folding[open] > .body > :last-child`, { marginBottom: 0 });

globalStyle(`${prose} .tag-plugin.quot`, { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textWrap: 'balance', margin: '2rem 1rem' });
globalStyle(`${prose} .tag-plugin.quot .content`, { position: 'relative', display: 'flex', alignItems: 'center', borderBottom: 'none', fontWeight: 700, lineHeight: 1.2, padding: '0 24px' });
globalStyle(`${prose} .tag-plugin.quot .text`, { margin: '0 0.5rem', paddingTop: '1px' });
globalStyle(`${prose} .tag-plugin.quot .empty`, { padding: '0 8px' });
globalStyle(`${prose} .tag-plugin.quot h1, ${prose} .tag-plugin.quot h2`, { fontSize: '1.75rem', fontWeight: 900, padding: '4px 32px 0' });
globalStyle(`${prose} .tag-plugin.quot.p .text::after`, { content: '', position: 'absolute', width: '90%', height: '4px', left: '5%', bottom: '-8px', borderRadius: '100%', background: vars.color.textStrong, opacity: 0.1, filter: 'blur(2px)' });

globalStyle(`${prose} .tag-plugin.mark`, { padding: '1px 2px', borderRadius: '2px', background: 'var(--theme-mark)', color: vars.color.textStrong });

globalStyle(`${prose} .tag-plugin.link`, { display: 'flex', justifyContent: 'center', textAlign: 'left', margin: '1em auto' });
globalStyle(`${prose} .link-card`, { display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center', width: '300px', maxWidth: '100%', borderRadius: borderCardSmall, background: card, color: textP2, lineHeight: 1.2, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' });
globalStyle(`${prose} .link-card:hover`, { transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)', color: textP1 });
globalStyle(`${prose} .link-card.rich`, { flexDirection: 'column', alignItems: 'stretch', width: '460px', textAlign: 'justify' });
globalStyle(`${prose} .link-card > .left`, { overflow: 'hidden', margin: '0.75rem 0 0.75rem 0.75rem' });
globalStyle(`${prose} .link-card > .right`, { width: '2.75rem', height: '2.75rem', margin: '0.75rem', overflow: 'hidden', flexShrink: 0 });
globalStyle(`${prose} .link-card > .top`, { display: 'flex', alignItems: 'center', margin: '1rem 1rem 0.75rem', overflow: 'hidden' });
globalStyle(`${prose} .link-card > .bottom`, { margin: '0 1rem 1rem' });
globalStyle(`${prose} .link-card .title`, { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', fontWeight: 500, color: textP1 });
globalStyle(`${prose} .link-card .cap`, { flexShrink: 0, color: textP3 });
globalStyle(`${prose} .link-card .link`, { lineHeight: 1.5, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
globalStyle(`${prose} .link-card .desc`, { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' });
globalStyle(`${prose} .link-card .img`, { borderRadius: '4px', width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center' });
globalStyle(`${prose} .link-card > .top .img`, { width: '16px', height: '16px', borderRadius: '16px', marginRight: '8px', flexShrink: 0 });

globalStyle(`${prose} a.tag-plugin.button`, { display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', margin: '0.5em 0', padding: '0 0.5rem', borderRadius: borderBar, background: 'var(--theme)', color: '#fff', fontSize: '1em', lineHeight: 1.5 });
globalStyle(`${prose} a.tag-plugin.button:hover`, { background: vars.color.accentStrong, color: '#fff' });
globalStyle(`${prose} a.tag-plugin.button span`, { margin: '0.5em', textIndent: 0 });
globalStyle(`${prose} a.tag-plugin.button[data-size='xs']`, { margin: 0, borderRadius: '4px', padding: '0 4px' });
globalStyle(`${prose} a.tag-plugin.button[data-size='xs'] span`, { margin: '0 2px' });

globalStyle(`${prose} .tag-plugin.grid`, { display: 'grid', gridGap: '16px' });
globalStyle(`${prose} .tag-plugin.grid[data-bg] > *`, { padding: '1rem', borderRadius: borderCard });
globalStyle(`${prose} .tag-plugin.grid[data-bg='box'] > *`, { background: block });
globalStyle(`${prose} .tag-plugin.grid[data-bg='card'] > *`, { background: card, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' });
globalStyle(`${prose} .tag-plugin.grid[data-bg] > * > :first-child`, { marginTop: 0 });
globalStyle(`${prose} .tag-plugin.grid[data-bg] > * > :last-child`, { marginBottom: 0 });

globalStyle(`${prose} .tag-plugin.tabs`, { position: 'relative', marginTop: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column' });
globalStyle(`${prose} .tag-plugin.tabs[data-align='center']`, { alignItems: 'center' });
globalStyle(`${prose} .tag-plugin.tabs[data-align='right']`, { alignItems: 'flex-end' });
globalStyle(`${prose} .tag-plugin.tabs .nav-tabs`, { display: 'flex', alignSelf: 'center', maxWidth: '100%', overflow: 'auto visible', whiteSpace: 'nowrap', margin: '0', padding: '8px 0', lineHeight: 1.5, position: 'relative', listStyle: 'none' });
globalStyle(`${prose} .tag-plugin.tabs .nav-tabs::after`, { content: '', position: 'absolute', left: 0, bottom: 0, width: '100%', height: '2px', borderRadius: '2px', background: blockBorder });
globalStyle(`${prose} .tag-plugin.tabs .tab a`, { display: 'block', cursor: 'pointer', padding: '0.25rem 0.75rem', fontSize: '0.875rem', lineHeight: 'inherit', fontWeight: 500, color: textP3, borderRadius: '4px', position: 'relative', margin: '0 2px', background: 'none' });
globalStyle(`${prose} .tag-plugin.tabs .tab a:hover`, { color: textP1, background: blockBorder });
globalStyle(`${prose} .tag-plugin.tabs .tab.active a`, { cursor: 'default', color: textP1, background: card, boxShadow: '0 0 0 1px rgba(18, 25, 38, 0.05), 0 4px 12px rgba(15, 23, 42, 0.06)' });
globalStyle(`${prose} .tag-plugin.tabs .tab.active a::after`, { content: '', zIndex: 1, position: 'absolute', background: 'var(--theme)', height: '2px', bottom: '-8px', left: '0.75rem', right: '0.75rem', borderRadius: '2px' });
globalStyle(`${prose} .tag-plugin.tabs .tab-content`, { maxWidth: '100%', textAlign: 'justify', marginTop: '0.5rem', display: 'flex', flexDirection: 'column' });
globalStyle(`${prose} .tag-plugin.tabs .tab-pane`, { display: 'block', maxWidth: '100%' });
globalStyle(`${prose} .tag-plugin.tabs .tab-pane:not(.active)`, { height: 0, overflow: 'hidden' });

globalStyle(`${prose} .tag-plugin.image`, { marginTop: '1rem', marginBottom: '1rem', boxSizing: 'border-box' });
globalStyle(`${prose} .tag-plugin.image .image-bg`, { textAlign: 'center', borderRadius: borderImage, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 'auto', maxWidth: '100%' });
globalStyle(`${prose} .tag-plugin.image img`, { display: 'block', objectFit: 'cover', borderRadius: borderImage, margin: 0 });
globalStyle(`${prose} .tag-plugin.image .image-download`, { position: 'absolute', right: '8px', bottom: '8px', zIndex: 2, opacity: 0, padding: '6px', lineHeight: 0, borderRadius: '40px', color: textP1, background: card });
globalStyle(`${prose} .tag-plugin.image .image-bg:hover .image-download`, { opacity: 1 });
globalStyle(`${prose} .tag-plugin.image .image-meta`, { display: 'flex', justifyContent: 'center', padding: '0.5rem 0' });
globalStyle(`${prose} .tag-plugin.image .image-caption`, { display: 'inline-block', fontSize: '13px', color: textP2, lineHeight: 1.5, textAlign: 'justify' });

globalStyle(`${prose} .tag-plugin.checkbox`, { display: 'flex', alignItems: 'center', fontSize: '0.94rem', lineHeight: 1.2, margin: '0.5rem 0' });
globalStyle(`${prose} .tag-plugin.checkbox input`, { appearance: 'none', position: 'relative', height: '16px', width: '16px', flexShrink: 0, marginRight: '8px', border: '2px solid var(--theme)', borderRadius: '2px' });
globalStyle(`${prose} .tag-plugin.checkbox input:checked`, { background: 'var(--theme)' });
globalStyle(`${prose} .tag-plugin.checkbox input:checked::after`, { content: '', position: 'absolute', left: '3px', top: '0px', width: '4px', height: '9px', border: 'solid white', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)' });

globalStyle(`${prose} .tag-plugin.copy`, { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', alignItems: 'center', columnGap: '0.55rem', width: '100%', minWidth: '200px', padding: '0.3rem', overflow: 'hidden', borderRadius: borderBar, border: `1px solid ${blockBorder}`, background: card });
globalStyle(`${prose} .tag-plugin.copy span`, { padding: '0.3rem 0.55rem', margin: 0, lineHeight: 1, borderRadius: '6px', background: vars.color.accentSoft, color: 'var(--theme)', fontFamily: vars.font.mono, fontSize: '12px', fontWeight: 700, flexShrink: 0, alignSelf: 'center' });
globalStyle(`${prose} .tag-plugin.copy input.copy-area`, { display: 'block', minWidth: 0, width: '100%', padding: '0.45rem 0', border: 0, outline: 0, background: 'transparent', color: textP2, lineHeight: 1.35, fontSize: '0.92rem', alignSelf: 'center' });
globalStyle(`${prose} .tag-plugin.copy button.copy-btn`, { alignSelf: 'center', justifySelf: 'end', margin: 0, border: 0, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', minWidth: 0, height: '2rem', background: block, color: textP2, lineHeight: 1, padding: '0 0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 700, transition: 'transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease' });
globalStyle(`${prose} .tag-plugin.copy button.copy-btn:hover`, { transform: 'translateY(-1px)', color: 'var(--theme)', background: vars.color.accentSoft, boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)' });
globalStyle(`${prose} .tag-plugin.copy button.copy-btn .copy-btn-text`, { lineHeight: 1 });

globalStyle(`${prose} .tag-plugin.hashtag`, { display: 'inline-flex', alignItems: 'center', margin: '2px 0', padding: '0 8px', borderRadius: '100px', background: 'var(--theme-block)', color: textP2, fontSize: '0.92rem', fontWeight: 500 });
globalStyle(`${prose} .tag-plugin.hashtag:hover`, { background: textP2, color: 'var(--theme-block)' });
globalStyle(`${prose} .tag-plugin.hashtag span`, { margin: '0 2px' });

globalStyle(`${prose} .tag-plugin.banner`, { position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', height: '220px', borderRadius: borderImage, color: '#fff' });
globalStyle(`${prose} .tag-plugin.banner .bg`, { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, margin: 0, zIndex: 0, transition: 'transform 2s ease' });
globalStyle(`${prose} .tag-plugin.banner:hover .bg`, { transform: 'scale(1.01)' });
globalStyle(`${prose} .tag-plugin.banner .content`, { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.02) 42%, rgba(0,0,0,0.30))' });
globalStyle(`${prose} .tag-plugin.banner .top`, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1, margin: '1rem' });
globalStyle(`${prose} .tag-plugin.banner .bottom`, { display: 'flex', width: '100%', boxSizing: 'border-box', padding: '1rem', backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.2))' });
globalStyle(`${prose} .tag-plugin.banner .avatar`, { width: '48px', height: '48px', borderRadius: '50%', border: '2px solid white', margin: 0, objectFit: 'cover' });
globalStyle(`${prose} .tag-plugin.banner .avatar + .text-area`, { marginLeft: '0.75rem' });
globalStyle(`${prose} .tag-plugin.banner .title`, { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2, margin: '0.25rem 0', color: '#fff' });
globalStyle(`${prose} .tag-plugin.banner .subtitle`, { fontSize: '0.875rem', lineHeight: 1.2, margin: '0.25rem 0', opacity: 0.86 });
globalStyle(`${prose} .tag-plugin.banner .banner-link`, { position: 'absolute', inset: 0, opacity: 0, zIndex: 2 });

globalStyle(`${prose} .frame-wrap`, { position: 'relative', overflow: 'hidden', margin: '1rem auto', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' });
globalStyle(`${prose} .frame-wrap img, ${prose} .frame-wrap video`, { borderRadius: 0, margin: 0 });
globalStyle(`${prose} .frame-wrap .frame`, { zIndex: 1, display: 'block', position: 'absolute', backgroundSize: '100%', backgroundRepeat: 'no-repeat', overflow: 'hidden' });
globalStyle(`${prose} .frame-wrap#iphone11 img, ${prose} .frame-wrap#iphone11 video`, { width: '287px', marginTop: '19px', marginBottom: '20px' });
globalStyle(`${prose} .frame-wrap#iphone11 .frame`, { top: 0, width: '329px', height: '658px', backgroundImage: 'url(https://gcore.jsdelivr.net/gh/cdn-x/placeholder@1.0.12/frame/iphone11.svg)' });

globalStyle(`${prose} .tag-plugin.timeline`, { position: 'relative', paddingLeft: '16px' });
globalStyle(`${prose} .tag-plugin.timeline::before`, { content: '', position: 'absolute', zIndex: 0, background: block, width: '4px', left: 0, borderRadius: '8px', top: '0.5rem', bottom: 0 });
globalStyle(`${prose} .tag-plugin.timeline .timenode`, { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxSizing: 'border-box', maxWidth: '100%' });
globalStyle(`${prose} .tag-plugin.timeline .timenode + .timenode`, { marginTop: '1rem' });
globalStyle(`${prose} .tag-plugin.timeline .timenode .header`, { display: 'flex', alignItems: 'center', position: 'relative', margin: '0.25rem 0', fontSize: '13px', fontWeight: 500, color: textP3, lineHeight: 1 });
globalStyle(`${prose} .tag-plugin.timeline .timenode .header::before`, { content: '', position: 'absolute', left: '-16px', width: '4px', height: '4px', top: 'calc(50% - 2px)', borderRadius: '12px', background: textP3, transform: 'scale(2)', transition: 'background 0.2s ease, height 0.2s ease, top 0.2s ease, transform 0.2s ease' });
globalStyle(`${prose} .tag-plugin.timeline .timenode:hover .header::before`, { background: 'var(--theme)', height: '16px', top: 'calc(50% - 8px)', transform: 'scale(1)' });
globalStyle(`${prose} .tag-plugin.timeline .timenode.highlight .header::before`, { background: 'var(--theme)' });
globalStyle(`${prose} .tag-plugin.timeline .body`, { background: card, borderRadius: '16px', borderTopLeftRadius: '2px', padding: '0.5rem 1rem', marginTop: '4px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', lineHeight: 1.5 });
globalStyle(`${prose} .tag-plugin.timeline .body:empty`, { display: 'none' });
globalStyle(`${prose} .tag-plugin.timeline .body > :first-child`, { marginTop: '0.5rem' });
globalStyle(`${prose} .tag-plugin.timeline .body > :last-child`, { marginBottom: '0.5rem' });

globalStyle(`${prose} .tag-plugin.poetry`, { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'left' });
globalStyle(`${prose} .tag-plugin.poetry .content`, { position: 'relative', paddingLeft: '1rem' });
globalStyle(`${prose} .tag-plugin.poetry .content::before`, { content: '', position: 'absolute', width: '4px', left: '-4px', top: '4px', bottom: '4px', borderRadius: '4px', background: block });
globalStyle(`${prose} .tag-plugin.poetry .title`, { position: 'relative', fontWeight: 500, marginTop: gapCompact });
globalStyle(`${prose} .tag-plugin.poetry .title::before`, { content: '', position: 'absolute', width: '4px', left: 'calc(-1rem - 4px)', top: '6px', bottom: '6px', borderRadius: '4px', background: vars.color.accent });
globalStyle(`${prose} .tag-plugin.poetry .meta`, { color: textP2, fontSize: '0.82rem', fontWeight: 500 });
globalStyle(`${prose} .tag-plugin.poetry .meta span + span`, { marginLeft: '4px' });
globalStyle(`${prose} .tag-plugin.poetry .body`, { margin: `${gapCompact} 0`, borderTop: `1px dashed ${blockBorder}`, borderBottom: `1px dashed ${blockBorder}`, lineHeight: 2 });
globalStyle(`${prose} .tag-plugin.poetry .footer`, { fontStyle: 'italic', color: textP3, margin: `${gapCompact} 0`, fontSize: '0.82rem' });

globalStyle(`${prose} .tag-plugin.ds-rating`, { textAlign: 'center' });
globalStyle(`${prose} .tag-plugin.ds-rating .header`, { margin: '0.5rem', fontWeight: 500, color: vars.color.textStrong });
globalStyle(`${prose} .tag-plugin.ds-rating .body`, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
globalStyle(`${prose} .tag-plugin.ds-rating button`, { color: 'var(--theme)', fontSize: '1.4rem', padding: '4px', border: 0, borderRadius: borderBar, background: 'transparent', opacity: 0.35, cursor: 'pointer' });
globalStyle(`${prose} .tag-plugin.ds-rating button:hover, ${prose} .tag-plugin.ds-rating button.preview`, { opacity: 1 });
globalStyle(`${prose} .tag-plugin.ds-rating .footer`, { margin: '0.5rem', color: textP3, fontWeight: 500, fontSize: '12px' });

globalStyle(`${prose} .tag-plugin.gallery .grid-cell, ${prose} .tag-plugin.gallery .flow-cell`, { display: 'block', overflow: 'hidden', zIndex: 0, position: 'relative' });
globalStyle(`${prose} .tag-plugin.gallery img`, { objectFit: 'cover', maxHeight: '100%', display: 'block', margin: 0 });
globalStyle(`${prose} .tag-plugin.gallery .image-meta`, { position: 'absolute', zIndex: 1, inset: 0, pointerEvents: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'background 0.2s ease' });
globalStyle(`${prose} .tag-plugin.gallery .image-caption`, { display: 'block', fontSize: '13px', color: 'transparent', pointerEvents: 'none', lineHeight: 1.2, margin: '0.5rem', transition: 'color 0.2s ease', textAlign: 'left' });
globalStyle(`${prose} .tag-plugin.gallery .grid-cell:hover .image-meta, ${prose} .tag-plugin.gallery .flow-cell:hover .image-meta`, { background: 'rgba(0, 0, 0, 0.5)' });
globalStyle(`${prose} .tag-plugin.gallery .grid-cell:hover .image-caption, ${prose} .tag-plugin.gallery .flow-cell:hover .image-caption`, { color: '#fff' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box`, { display: 'grid' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-size='s']`, { gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '2px' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-size='m']`, { gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '4px' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-size='l']`, { gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-size='xl']`, { gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-ratio='square'] .grid-cell`, { aspectRatio: '1' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box[data-ratio='portrait'] .grid-cell`, { aspectRatio: '2 / 3' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box .grid-cell`, { background: block, borderRadius: '8px' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box .grid-cell img`, { width: '100%', height: '100%', borderRadius: '8px', transition: 'transform 0.5s ease' });
globalStyle(`${prose} .tag-plugin.gallery.grid-box .grid-cell:hover img`, { transform: 'scale(1.1)' });
globalStyle(`${prose} .tag-plugin.gallery.flow-box`, { columnCount: 3, columnGap: '8px' });
globalStyle(`${prose} .tag-plugin.gallery.flow-box .flow-cell`, { borderRadius: '8px', paddingBottom: '8px' });
globalStyle(`${prose} .tag-plugin.gallery.flow-box img`, { width: '100%', height: '100%', borderRadius: '8px' });