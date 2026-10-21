import { globalStyle, style } from '@vanilla-extract/css';
import { vars, breakpoints } from '../styles/theme.css';

const gapMargin = '16px';
const gapPadding = '16px';
const borderCardSmall = '12px';
const borderBar = '8px';
const bgA50 = vars.color.surface;
const bgA100 = vars.color.surfaceStrong;
const textP1 = vars.color.text;
const textP2 = vars.color.textMuted;
const textP3 = vars.color.textMeta;

export const root = style({
	overflow: 'visible',
	flexGrow: 1,
	scrollbarWidth: 'none',
	zIndex: 1,
	lineHeight: 1.2,
	margin: `0 ${gapMargin}`,
	display: 'flex',
	flexDirection: 'column',
	'@media': {
		[`screen and (min-width: ${breakpoints.laptop})`]: {
			// 与外壳 right 的吸顶偏移同源（top/marginTop = vars.space.xxl）：
			// 吸顶后上下留白对称，长挂件在内部滚动，不影响页面滚动条。
			maxHeight: `calc(100dvh - 2 * ${vars.space.xxl})`,
			overflowY: 'auto',
		},
	},
});

export const widget = style({
	display: 'block',
	paddingBottom: '32px',
});

export const widgetHeader = style({
	paddingLeft: gapPadding,
	paddingRight: gapPadding,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'baseline',
	lineHeight: '28px',
	fontWeight: 500,
	fontSize: '13px',
	color: textP1,
});

export const markdownWidget = style({});

export const markdownBody = style({
	borderRadius: borderCardSmall,
	padding: '0.25rem 1rem',
	background: bgA50,
	color: textP1,
	fontSize: '14px',
	lineHeight: 1.5,
});

export const postListWidget = style({});

export const timeline = style({
	display: 'block',
});

export const timelineLink = style({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: `6px ${gapPadding}`,
	borderRadius: borderBar,
	color: textP1,
	fontSize: '14px',
	lineHeight: 1.2,
	selectors: {
		'& + &': {
			marginTop: '2px',
		},
		'&:hover': {
			background: bgA100,
			color: textP1,
		},
	},
});

// 别名：与左栏 recentList/recentItem 对齐，供 gallery-albums 等跨栏 widget 复用
export const recentList = timeline;
export const recentItem = timelineLink;

export const ghrepoWidget = style({});

export const repoCard = style({
	display: 'block',
	padding: '0.75rem 0.5rem',
	borderRadius: borderCardSmall,
	background: bgA50,
	color: textP2,
	selectors: {
		'&:hover': {
			background: bgA100,
			color: textP1,
		},
	},
});

export const repoName = style({
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
	fontSize: '14px',
	fontWeight: 700,
	color: textP1,
});

export const repoDesc = style({
	marginTop: '0.5rem',
	marginLeft: '2px',
	marginRight: '2px',
	fontSize: '13px',
	lineHeight: 1.45,
	color: textP3,
});

export const repoMetaGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	gap: '2px',
	marginTop: '0.5rem',
	fontSize: '13px',
});

export const repoStat = style({
	display: 'flex',
	alignItems: 'center',
	minWidth: 0,
	color: textP2,
});

export const mediaCard = style({
	overflow: 'hidden',
});

export const mediaImage = style({
	width: '100%',
	aspectRatio: '1.25 / 0.82',
	objectFit: 'cover',
	borderRadius: borderCardSmall,
	marginBottom: '0.75rem',
});

export const mediaCaption = style({
	margin: 0,
	fontSize: '14px',
	color: textP1,
});

globalStyle(`${widgetHeader} > span`, { opacity: 0.6 });
globalStyle(`${markdownBody} > *:first-child`, { marginTop: '0.75rem' });
globalStyle(`${markdownBody} > *:last-child`, { marginBottom: '0.75rem' });
globalStyle(`${repoName} svg`, { width: '1em', height: '1em', fill: 'currentColor' });
globalStyle(`${repoStat} svg`, { width: '1em', height: '1em', marginRight: '4px', fill: 'currentColor' });