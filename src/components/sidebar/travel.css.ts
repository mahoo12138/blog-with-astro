import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const borderCardSmall = '12px';
const borderBar = '8px';

export const statsWidget = style({});

export const statsGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: '0.5rem',
	padding: '0 0.25rem',
});

export const statCard = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '4px',
	padding: '0.65rem 0.75rem',
	borderRadius: borderCardSmall,
	background: vars.color.surface,
	color: vars.color.text,
});

export const statValue = style({
	fontSize: '1.35rem',
	fontWeight: 800,
	lineHeight: 1,
	color: vars.color.accentStrong,
	fontFamily: vars.font.mono,
	letterSpacing: '-0.02em',
});

export const statLabel = style({
	fontSize: '0.72rem',
	color: vars.color.textMeta,
	fontWeight: 500,
});

export const regionsList = style({
	listStyle: 'none',
	margin: '0.75rem 0 0',
	padding: 0,
});

export const regionItem = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '5px 16px',
	borderRadius: borderBar,
	fontSize: '0.8rem',
	color: vars.color.text,
	selectors: {
		'& + &': {
			marginTop: '2px',
		},
	},
});

export const regionLabel = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.4rem',
});

export const regionDot = style({
	width: '6px',
	height: '6px',
	borderRadius: '50%',
	background: vars.color.accent,
	flexShrink: 0,
});

export const regionCount = style({
	fontFamily: vars.font.mono,
	fontSize: '0.78rem',
	color: vars.color.textMeta,
});

export const recentWidget = style({});

export const recentList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
});

export const recentItem = style({
	margin: 0,
});

export const recentLink = style({
	display: 'flex',
	alignItems: 'center',
	gap: '0.6rem',
	padding: '6px 16px',
	borderRadius: borderBar,
	color: vars.color.text,
	cursor: 'pointer',
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

export const recentPin = style({
	width: '22px',
	height: '22px',
	borderRadius: '50%',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	display: 'grid',
	placeItems: 'center',
	fontSize: '0.7rem',
	fontWeight: 800,
	flexShrink: 0,
});

export const recentMeta = style({
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	flex: 1,
});

export const recentName = style({
	fontSize: '0.88rem',
	fontWeight: 600,
	color: vars.color.text,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

export const recentDate = style({
	fontSize: '0.72rem',
	color: vars.color.textMeta,
	fontFamily: vars.font.mono,
});
