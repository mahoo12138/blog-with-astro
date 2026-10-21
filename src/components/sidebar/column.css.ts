import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const borderBar = '8px';

// 「专栏简介」卡片（column-info 挂件）已下线，其 info* 样式随之删除。
// 侧栏只剩「专栏目录」（column-posts）。

export const postsWidget = style({});

export const postList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	counterReset: 'column-posts',
});

export const postItem = style({
	margin: 0,
});

export const postLink = style({
	display: 'flex',
	alignItems: 'flex-start',
	gap: '0.55rem',
	padding: '6px 16px',
	borderRadius: borderBar,
	color: vars.color.text,
	fontSize: '0.85rem',
	lineHeight: 1.4,
	selectors: {
		'& + &': {
			marginTop: '2px',
		},
		// 反馈统一 accentSoft 淡晕（近白底上 surfaceStrong 白色会隐形）
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
	},
});

export const postLinkActive = style({
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	selectors: {
		'&:hover': {
			background: vars.color.accentSoft,
			color: vars.color.accentStrong,
		},
	},
});

export const postIndex = style({
	flexShrink: 0,
	fontFamily: vars.font.mono,
	fontSize: '0.75rem',
	fontWeight: 700,
	color: vars.color.textMeta,
	paddingTop: '2px',
	selectors: {
		[`${postLinkActive} &`]: {
			color: vars.color.accentStrong,
		},
	},
});

export const postTitle = style({
	minWidth: 0,
	flex: 1,
	display: '-webkit-box',
	WebkitBoxOrient: 'vertical',
	WebkitLineClamp: 2,
	overflow: 'hidden',
});
