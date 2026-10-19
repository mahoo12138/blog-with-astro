import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const wrap = style({
	margin: `${vars.space.lg} 0`,
});

export const card = style({
	display: 'block',
	overflow: 'hidden',
	borderRadius: '10px',
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	boxShadow: vars.shadow.card,
	position: 'relative',
	zIndex: 0,
	vars: {
		'--stellar-img-br': '100%',
		'--stellar-img-sat': '100%',
		'--stellar-blur-sat': '120%',
		'--stellar-blur-px': '1em',
		'--stellar-blur-height': '128px',
	},
	selectors: {
		'&:hover': {
			borderColor: vars.color.borderStrong,
			boxShadow: vars.shadow.card,
		},
		'&:focus-visible': {
			outline: 'none',
			boxShadow: vars.shadow.focus,
		},
		'&:visited': {
			color: 'inherit',
		},
	},
});

export const cardVariant = styleVariants({
	default: {},
	cover: {},
	photo: {
		position: 'relative',
		minHeight: 0,
		color: '#ffffff',
		selectors: {
			'&:visited': {
				color: '#ffffff',
			},
		},
	},
});

export const textBody = style({
	padding: '20px',
});

export const cap = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.35rem',
	maxWidth: '100%',
	padding: '0.2rem 0.48rem',
	borderRadius: '8px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.72rem',
	fontWeight: 700,
	lineHeight: 1.4,
});

export const capRow = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: '0.4rem',
	marginBottom: vars.space.sm,
});

export const columnBadge = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.35rem',
	maxWidth: '100%',
	padding: '0.2rem 0.48rem',
	borderRadius: '8px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontSize: '0.72rem',
	fontWeight: 700,
	lineHeight: 1.4,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
});

export const columnBadgeIcon = style({
	width: '0.9rem',
	height: '0.9rem',
	flexShrink: 0,
});

export const columnBadgeOnPhoto = style({
	background: 'rgba(255, 255, 255, 0.22)',
	color: '#fff',
	// marginBottom: vars.space.sm,
	backdropFilter: 'blur(6px)',
	WebkitBackdropFilter: 'blur(6px)',
});

export const capIcon = style({
	width: '0.9rem',
	height: '0.9rem',
	flexShrink: 0,
});

export const title = style({
	margin: `0 auto ${vars.space.md} 0`,
	fontSize: 'calc(1rem + 4px)',
	fontWeight: 600,
	lineHeight: 1.5,
	color: vars.color.textStrong,
	selectors: {
		[`${card}:hover &`]: {
			color: vars.color.accentStrong,
		},
	},
});

export const excerpt = style({
	margin: `${vars.space.lg} 0`,
	fontSize: '0.875rem',
	lineHeight: 1.8,
	color: vars.color.textMuted,
});

export const meta = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	gap: '8px',
	lineHeight: 2,
	fontSize: '0.78rem',
	color: vars.color.textMeta,
});

export const metaIcon = style({
	width: '1em',
	height: '1em',
	flexShrink: 0,
	transform: 'scale(1.2)',
});

export const tag = style({
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: '1.65rem',
	padding: '0 0.5rem',
	borderRadius: '999px',
	background: 'rgba(148, 163, 184, 0.12)',
	fontSize: '0.78rem',
	color: vars.color.textMuted,
});

export const photoMedia = style({
	width: '100%',
	aspectRatio: '2 / 1',
	objectFit: 'cover',
	borderRadius: 0,
	filter: 'brightness(var(--stellar-img-br)) saturate(var(--stellar-img-sat))',
});

export const photoOverlay = style({
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	height: 'var(--stellar-blur-height)',
	background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.78))',
});

export const photoBody = style({
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	padding: `${vars.space.xl} ${vars.space.lg}`,
	zIndex: 1,
});

export const photoTitle = style({
	margin: 0,
	fontSize: 'calc(1rem + 4px)',
	fontWeight: 600,
	lineHeight: 1.5,
	color: '#ffffff',
	textShadow: '0 6px 18px rgba(0, 0, 0, 0.28)',
});

export const photoExcerpt = style({
	margin: '0.4rem 0 0 0',
	fontSize: '0.85rem',
	lineHeight: 1.5,
	color: 'rgba(255, 255, 255, 0.86)',
	textShadow: '0 4px 12px rgba(0, 0, 0, 0.32)',
	display: '-webkit-box',
	WebkitLineClamp: 2,
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
});

// 保留 cover 展示类型，封面不再复制为模糊背景。
export const coverBody = style({
	display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 30%)',
	minHeight: '180px', color: vars.color.text,
	'@media': { 'screen and (max-width: 540px)': { gridTemplateColumns: '1fr', gridTemplateRows: 'auto 170px' } },
});
export const coverImageWrap = style({ overflow: 'hidden', minHeight: '100%', background: vars.color.surfaceMuted });
export const coverImage = style({ display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 });
export const coverContent = style({
	display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0,
	gap: '12px', padding: '20px', color: vars.color.text,
});
export const coverTitle = style({
	margin: 0, fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.5, color: vars.color.textStrong,
	selectors: { [`${card}:hover &`]: { color: vars.color.accentStrong } },
});
export const coverExcerpt = style({ margin: 0, fontSize: '0.875rem', lineHeight: 1.8, color: vars.color.textMuted });
export const coverCap = cap;
export const coverMeta = meta;
export const coverTag = tag;
export const coverTitleHover = style({ selectors: { [`${card}:hover &`]: { color: vars.color.accentStrong } } });
