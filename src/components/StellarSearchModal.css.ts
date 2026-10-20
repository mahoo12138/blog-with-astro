import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const backdrop = style({
	position: 'fixed',
	inset: 0,
	zIndex: 100,
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'center',
	padding: '12vh 16px 16px',
	background: 'rgba(18, 22, 28, 0.36)',
	backdropFilter: 'blur(8px)',
	WebkitBackdropFilter: 'blur(8px)',
	// 关闭态必须同时 visibility:hidden + pointer-events:none：
	// display:flex 会压过 [hidden] 的 UA display:none，透明遮罩会吞掉全页点击。
	opacity: 0,
	visibility: 'hidden',
	pointerEvents: 'none',
	transition: 'opacity 180ms ease, visibility 0s linear 180ms',
	selectors: {
		'&[data-open="true"]': {
			opacity: 1,
			visibility: 'visible',
			pointerEvents: 'auto',
			transition: 'opacity 180ms ease, visibility 0s',
		},
	},
	'@media': { 'screen and (max-width: 667px)': { padding: '8vh 12px 12px' } },
});

export const dialog = style({
	width: 'min(560px, 100%)',
	maxHeight: 'min(72vh, 560px)',
	display: 'flex',
	flexDirection: 'column',
	borderRadius: vars.radius.lg,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	boxShadow: '0 18px 48px rgba(15, 23, 32, 0.18)',
	overflow: 'hidden',
	opacity: 0,
	transform: 'translateY(-8px) scale(0.98)',
	transition: `opacity 180ms ease, transform 200ms ${ease}`,
	selectors: {
		'&[data-open="true"]': { opacity: 1, transform: 'none' },
	},
});

export const inputRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	padding: '0 14px',
	minHeight: '52px',
	flexShrink: 0,
	borderBottom: `1px solid ${vars.color.border}`,
	transition: 'border-color 150ms ease, box-shadow 150ms ease',
	selectors: {
		'&:focus-within': {
			borderBottomColor: vars.color.accentStrong,
			boxShadow: `inset 0 -1px 0 ${vars.color.accentStrong}`,
		},
	},
});

export const inputIcon = style({
	width: '16px',
	height: '16px',
	flexShrink: 0,
	color: vars.color.textMuted,
});

export const input = style({
	flex: '1 1 auto',
	minWidth: 0,
	appearance: 'none',
	border: 0,
	outline: 0,
	background: 'transparent',
	fontFamily: vars.font.body,
	fontSize: '0.9375rem',
	lineHeight: 1.4,
	color: vars.color.textStrong,
	// input[type=search] 的原生装饰与 focus 外框全部关掉，
	// 聚焦反馈由容器 inputRow 统一给出（同菜单项的 vars.shadow.focus 语言）。
	selectors: {
		'&::placeholder': { color: vars.color.textMeta },
		'&::-webkit-search-cancel-button': { appearance: 'none' },
	},
});

export const kbd = style({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '20px',
	height: '20px',
	padding: '0 5px',
	borderRadius: vars.radius.sm,
	border: `1px solid ${vars.color.border}`,
	background: vars.color.surfaceMuted,
	fontFamily: vars.font.body,
	fontSize: '11px',
	lineHeight: 1,
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const body = style({
	flex: '1 1 auto',
	minHeight: 0,
	overflowY: 'auto',
	padding: '8px',
	scrollbarWidth: 'thin',
});

export const hint = style({
	margin: 0,
	padding: '20px 12px',
	textAlign: 'center',
	fontSize: '0.8125rem',
	lineHeight: 1.7,
	color: vars.color.textMeta,
});

export const results = style({
	margin: 0,
	padding: 0,
	listStyle: 'none',
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
});

export const resultItem = style({});

export const groupTitle = style({
	padding: '10px 12px 4px',
	fontSize: '11px',
	fontWeight: 600,
	letterSpacing: '0.04em',
	color: vars.color.textMeta,
});

export const commandRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	width: '100%',
	minHeight: '40px',
	padding: '8px 12px',
	border: 0,
	borderRadius: vars.radius.md,
	background: 'transparent',
	fontFamily: vars.font.body,
	fontSize: '0.875rem',
	color: vars.color.text,
	textAlign: 'left',
	cursor: 'pointer',
	selectors: {
		'&:hover': { background: vars.color.accentSoft },
	},
});

export const commandIcon = style({
	width: '16px',
	height: '16px',
	flexShrink: 0,
	color: vars.color.textMuted,
});

export const commandLabel = style({
	fontWeight: 500,
	color: vars.color.textStrong,
	whiteSpace: 'nowrap',
});

export const commandHint = style({
	marginLeft: 'auto',
	fontSize: '0.75rem',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
});

export const resultLink = style({
	display: 'block',
	padding: '10px 12px',
	borderRadius: vars.radius.md,
	textDecoration: 'none',
	color: vars.color.text,
	selectors: {
		'&:hover': { background: vars.color.accentSoft },
	},
});

export const resultTitle = style({
	display: 'block',
	fontSize: '0.875rem',
	fontWeight: 600,
	lineHeight: 1.45,
	color: vars.color.textStrong,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const resultUrl = style({
	display: 'block',
	marginTop: '2px',
	fontSize: '0.6875rem',
	color: vars.color.textMeta,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const resultExcerpt = style({
	margin: '6px 0 0',
	fontSize: '0.75rem',
	lineHeight: 1.6,
	color: vars.color.textMuted,
	display: '-webkit-box',
	WebkitLineClamp: 2,
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
});

export const footer = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	gap: '4px 14px',
	padding: '8px 14px',
	flexShrink: 0,
	borderTop: `1px solid ${vars.color.border}`,
	background: vars.color.surfaceMuted,
	fontSize: '0.6875rem',
	color: vars.color.textMeta,
});

export const footerItem = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '4px',
});

// 键盘 ↑↓ 导航的当前项，与 hover 态区分开（命令按钮与结果链接同规则）。
globalStyle(`${resultItem}[data-active] > a, ${resultItem}[data-active] > button`, {
	background: vars.color.accentSoft,
});

globalStyle(`${resultExcerpt} mark`, {
	padding: '0 2px',
	borderRadius: '3px',
	background: vars.color.codeBackground,
	color: 'inherit',
	fontWeight: 600,
});
