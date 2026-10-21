import { style } from '@vanilla-extract/css';
import { vars } from './theme.css';

/**
 * 侧栏挂件排版标准（左栏为主，右栏同源复用）。
 *
 * 1. 左基线：挂件内所有文字/行首内容对齐到容器左缘 + 16px
 *    （挂件标题 widgetTitle 的 padding、welcome 正文的 margin 同此基线）。
 * 2. 右基线：行内右侧 meta 对齐到容器右缘 − 16px。
 * 3. 行（列表项）：padding 6px 16px、圆角 6px、字号 13px、行距 2px；
 *    hover 反馈用 accentSoft 淡晕（不用线条、不用近白底），active 加粗。
 * 4. 层级字号：挂件/分组标题 12px/600，行 13px，meta 0.7rem。
 */

export const group = style({
	margin: '0 0 14px',
});

export const groupTitle = style({
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: '8px',
	margin: '0 0 6px',
	padding: '0 16px',
	fontFamily: vars.font.body,
	fontSize: '13px',
	fontWeight: 600,
	lineHeight: 1.6,
	letterSpacing: 'normal',
	color: vars.color.textStrong,
});

export const list = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	listStyle: 'none',
	margin: 0,
	padding: 0,
});

export const item = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '8px',
	width: '100%',
	padding: '6px 16px',
	borderRadius: '6px',
	color: vars.color.text,
	fontFamily: vars.font.body,
	fontSize: '13px',
	lineHeight: 1.55,
	textAlign: 'left',
	textDecoration: 'none',
	cursor: 'pointer',
	transition: `background 150ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
	},
});

/** 行内主文字：单行省略，长标题不换行 */
export const itemLabel = style({
	minWidth: 0,
	flex: '1 1 auto',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const itemActive = style({
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontWeight: 600,
});

export const meta = style({
	flexShrink: 0,
	fontSize: '0.7rem',
	color: vars.color.textMeta,
	whiteSpace: 'nowrap',
});

export const emptyRow = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '8px',
	padding: '6px 16px',
	fontSize: '13px',
	lineHeight: 1.55,
	color: vars.color.textMeta,
});
