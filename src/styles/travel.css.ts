import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

const borderCardLarge = '24px';
const borderCardSmall = '12px';

const pulseAnim = keyframes({
	'0%': { transform: 'scale(0.6)', opacity: 0.65 },
	'100%': { transform: 'scale(1.6)', opacity: 0 },
});

const ringPulse = keyframes({
	'0%': { transform: 'scale(0.7)', opacity: 0.55 },
	'100%': { transform: 'scale(1.55)', opacity: 0 },
});

export const pageRoot = style({
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.xl,
	margin: `${vars.space.lg} 0 ${vars.space.xxxl}`,
	color: vars.color.text,
});

export const header = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	alignItems: 'end',
	gap: vars.space.xl,
	padding: `${vars.space.sm} 0 ${vars.space.lg}`,
	borderBottom: `1px solid ${vars.color.border}`,
	'@media': {
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			gridTemplateColumns: '1fr',
			gap: vars.space.md,
		},
	},
});

export const headerMain = style({
	minWidth: 0,
});

export const kicker = style({
	display: 'inline-flex',
	alignItems: 'baseline',
	gap: '0.4rem',
	margin: '0 0 0.5rem',
	fontSize: '0.78rem',
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
});

globalStyle(`${kicker} span`, {
	color: vars.color.accentStrong,
});

export const title = style({
	margin: '0 0 0.5rem',
	fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
	fontWeight: 800,
	letterSpacing: 0,
	color: vars.color.textStrong,
});

export const description = style({
	margin: 0,
	fontSize: '0.95rem',
	lineHeight: 1.6,
	color: vars.color.textMuted,
	maxWidth: '52ch',
});

export const headerMeta = style({
	display: 'flex',
	gap: vars.space.lg,
	alignItems: 'baseline',
	justifySelf: 'end',
	'@media': {
		[`screen and (max-width: ${breakpoints.tablet})`]: {
			justifySelf: 'start',
		},
	},
});

export const headerStat = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
	gap: '4px',
});

export const headerStatValue = style({
	fontFamily: vars.font.mono,
	fontSize: '2rem',
	fontWeight: 800,
	lineHeight: 1,
	color: vars.color.accentStrong,
	letterSpacing: '-0.02em',
});

export const headerStatLabel = style({
	fontSize: '0.7rem',
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: vars.color.textMeta,
	fontWeight: 600,
});

export const mapSection = style({
	margin: 0,
});

export const mapCard = style({
	position: 'relative',
	overflow: 'hidden',
	borderRadius: borderCardLarge,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			borderRadius: 0,
		},
	},
});

export const map = style({
	width: '100%',
	height: 'clamp(420px, 75vh, 750px)',
	background: vars.color.surfaceMuted,
});

export const legend = style({
	position: 'absolute',
	left: '12px',
	top: '12px',
	zIndex: 500,
	listStyle: 'none',
	margin: 0,
	padding: '8px 12px',
	borderRadius: borderCardSmall,
	background: vars.color.surfaceStrong,
	border: `1px solid ${vars.color.border}`,
	boxShadow: vars.shadow.head,
	display: 'flex',
	flexDirection: 'column',
	gap: '4px',
	fontSize: '12px',
	color: vars.color.text,
});

export const legendItem = style({
	display: 'flex',
	alignItems: 'center',
	gap: '0.45rem',
});

export const legendDotTravel = style({
	width: '10px',
	height: '10px',
	borderRadius: '50%',
	background: vars.color.accent,
	border: `2px solid ${vars.color.surfaceStrong}`,
	boxShadow: `0 0 0 1px ${vars.color.borderStrong}`,
});

export const legendDotResidence = style({
	width: '14px',
	height: '14px',
	borderRadius: '50%',
	background: '#FA6400',
	border: `2px solid ${vars.color.surfaceStrong}`,
	boxShadow: `0 0 0 1px ${vars.color.borderStrong}`,
});

export const sectionTitle = style({
	margin: `0 0 ${vars.space.md}`,
	fontSize: '1.05rem',
	fontWeight: 700,
	color: vars.color.textStrong,
	display: 'flex',
	alignItems: 'center',
	gap: '0.5rem',
	selectors: {
		'&::before': {
			content: '',
			width: '4px',
			height: '1.05em',
			borderRadius: '2px',
			background: vars.color.accent,
		},
	},
});

export const lifeline = style({
	margin: 0,
	padding: 0,
});

export const lifelineList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: vars.space.md,
});

export const lifelineItem = style({
	position: 'relative',
	display: 'flex',
	alignItems: 'flex-start',
	gap: vars.space.md,
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: borderCardLarge,
	background: vars.color.surfaceStrong,
	boxShadow: vars.shadow.card,
	transition: 'transform 200ms ease, box-shadow 200ms ease',
	selectors: {
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: vars.shadow.head,
		},
	},
});

export const lifelineGlyph = style({
	width: '40px',
	height: '40px',
	flexShrink: 0,
	display: 'grid',
	placeItems: 'center',
	borderRadius: '50%',
	background: 'var(--residence-accent, #FA6400)',
	color: '#fff',
	fontWeight: 800,
	fontSize: '1rem',
	letterSpacing: 0,
	boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18)',
});

export const lifelineBody = style({
	flex: 1,
	minWidth: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: '0.3rem',
});

export const lifelineHead = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: '0.5rem',
});

export const lifelineKind = style({
	padding: '0.15rem 0.45rem',
	borderRadius: '6px',
	background: 'var(--residence-accent, #FA6400)',
	color: '#fff',
	fontSize: '0.72rem',
	fontWeight: 700,
	letterSpacing: 0,
});

export const lifelineCity = style({
	fontSize: '1.05rem',
	fontWeight: 700,
	color: vars.color.textStrong,
});

export const lifelineProvince = style({
	fontSize: '0.78rem',
	color: vars.color.textMeta,
	padding: '0.1rem 0.4rem',
	borderRadius: '6px',
	background: vars.color.backgroundElevated,
	fontWeight: 500,
});

export const lifelineRange = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: '0.4rem',
	fontFamily: vars.font.mono,
	fontSize: '0.78rem',
	color: vars.color.textMuted,
});

export const lifelineRangeSep = style({
	opacity: 0.55,
});

export const lifelinePresent = style({
	color: vars.color.accentStrong,
	fontWeight: 700,
});

export const lifelineDuration = style({
	marginLeft: '0.25rem',
	padding: '0.1rem 0.4rem',
	borderRadius: '4px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	fontFamily: vars.font.mono,
	fontSize: '0.72rem',
	fontWeight: 700,
});

export const lifelineNote = style({
	margin: 0,
	fontSize: '0.84rem',
	lineHeight: 1.55,
	color: vars.color.textMuted,
});

export const lifelineConnector = style({
	position: 'absolute',
	left: `calc(${vars.space.lg} + 20px - 1px)`,
	top: '100%',
	width: '2px',
	height: vars.space.md,
	background: `repeating-linear-gradient(to bottom, var(--residence-accent, #FA6400) 0 4px, transparent 4px 8px)`,
	opacity: 0.55,
});

export const timeline = style({
	margin: 0,
	padding: 0,
});

export const timelineList = style({
	listStyle: 'none',
	margin: 0,
	padding: 0,
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
	gap: vars.space.md,
});

export const timelineItem = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '0.4rem',
	padding: `${vars.space.md} ${vars.space.lg}`,
	borderRadius: borderCardSmall,
	background: vars.color.surface,
	color: vars.color.text,
	transition: 'transform 180ms ease, box-shadow 180ms ease',
	selectors: {
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: vars.shadow.card,
		},
	},
});

export const timelineDate = style({
	fontFamily: vars.font.mono,
	fontSize: '0.78rem',
	color: vars.color.accentStrong,
	fontWeight: 700,
});

export const timelineBody = style({
	display: 'flex',
	flexDirection: 'column',
	gap: '0.35rem',
});

export const timelineHead = style({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: '0.45rem',
});

export const timelineCity = style({
	fontSize: '1.05rem',
	fontWeight: 700,
	color: vars.color.textStrong,
});

export const timelineCityEn = style({
	fontSize: '0.82rem',
	color: vars.color.textMeta,
	fontFamily: vars.font.mono,
	fontWeight: 500,
});

export const timelineCountry = style({
	fontSize: '0.72rem',
	color: vars.color.textMuted,
	padding: '0.1rem 0.4rem',
	borderRadius: '6px',
	background: vars.color.backgroundElevated,
	fontWeight: 600,
});

export const timelineBadge = style({
	fontSize: '0.7rem',
	fontWeight: 800,
	color: vars.color.accentStrong,
	background: vars.color.accentSoft,
	padding: '0.1rem 0.4rem',
	borderRadius: '6px',
	fontFamily: vars.font.mono,
});

export const timelineNote = style({
	margin: 0,
	fontSize: '0.84rem',
	lineHeight: 1.55,
	color: vars.color.textMuted,
});

/* ===== Sidebar widget styles (travel-stats, travel-recent) ===== */

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
	padding: '0 0.25rem',
});

export const regionItem = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '0.35rem 0.5rem',
	borderRadius: '8px',
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

/* ===== Leaflet marker globals ===== */

globalStyle('.travel-marker', {
	position: 'relative',
	width: '14px',
	height: '14px',
});

globalStyle('.travel-marker .dot', {
	position: 'absolute',
	inset: 0,
	width: '14px',
	height: '14px',
	borderRadius: '50%',
	background: vars.color.accent,
	border: `2px solid ${vars.color.surfaceStrong}`,
	boxShadow: `0 0 0 1px ${vars.color.borderStrong}, 0 4px 10px color-mix(in srgb, ${vars.color.accent} 25%, transparent)`,
	transition: 'transform 200ms ease',
});

globalStyle('.travel-marker .pulse', {
	position: 'absolute',
	left: '50%',
	top: '50%',
	width: '36px',
	height: '36px',
	marginLeft: '-18px',
	marginTop: '-18px',
	borderRadius: '50%',
	background: `color-mix(in srgb, ${vars.color.accent} 18%, transparent)`,
	animation: `${pulseAnim} 2s ease-out infinite`,
	pointerEvents: 'none',
});

globalStyle('.travel-marker:hover .dot', {
	transform: 'scale(1.18)',
});

globalStyle('.residence-marker', {
	position: 'relative',
	width: '34px',
	height: '34px',
});

globalStyle('.residence-marker .residence-dot', {
	position: 'absolute',
	inset: 0,
	display: 'grid',
	placeItems: 'center',
	width: '34px',
	height: '34px',
	borderRadius: '50%',
	background: 'var(--accent, #FA6400)',
	color: '#fff',
	border: '3px solid #fff',
	fontSize: '14px',
	fontWeight: 800,
	letterSpacing: 0,
	boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.20), 0 8px 16px rgba(250, 100, 0, 0.35)',
	transition: 'transform 200ms ease',
});

globalStyle('.residence-marker .residence-ring', {
	position: 'absolute',
	left: '50%',
	top: '50%',
	width: '54px',
	height: '54px',
	marginLeft: '-27px',
	marginTop: '-27px',
	borderRadius: '50%',
	background: 'var(--ring, rgba(250, 100, 0, 0.28))',
	opacity: 0.32,
	animation: `${ringPulse} 2.4s ease-out infinite`,
	pointerEvents: 'none',
});

globalStyle('.residence-marker:hover .residence-dot', {
	transform: 'scale(1.1)',
});

/* ===== AMap container + InfoWindow theming ===== */

globalStyle('.amap-container', {
	fontFamily: vars.font.body,
	fontSize: '13px',
	background: vars.color.surfaceMuted,
});

globalStyle('.amap-info-content', {
	padding: 0,
	borderRadius: borderCardSmall,
	background: vars.color.surfaceStrong,
	color: vars.color.text,
	boxShadow: vars.shadow.head,
	border: `1px solid ${vars.color.border}`,
	overflow: 'hidden',
});

globalStyle('.amap-info-outer', {
	boxShadow: 'none !important',
	background: 'transparent !important',
});

globalStyle('.amap-info-sharp', {
	borderTopColor: `${vars.color.surfaceStrong} !important`,
});

globalStyle('.amap-info-close', {
	top: '8px !important',
	right: '10px !important',
	color: `${vars.color.textMuted} !important`,
	fontSize: '16px !important',
	lineHeight: '1 !important',
});

globalStyle('.pop-card', {
	padding: '0.7rem 0.9rem',
	minWidth: '200px',
	lineHeight: 1.45,
});

globalStyle('.pop-card .pop-head', {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'baseline',
	gap: '0.4rem',
	marginBottom: '0.35rem',
});

globalStyle('.pop-card .pop-tag', {
	padding: '0.1rem 0.4rem',
	borderRadius: '6px',
	fontSize: '0.7rem',
	fontWeight: 700,
});

globalStyle('.pop-card .pop-city', {
	fontSize: '1rem',
	fontWeight: 700,
	color: vars.color.textStrong,
});

globalStyle('.pop-card .pop-en', {
	fontSize: '0.78rem',
	color: vars.color.textMeta,
	fontFamily: vars.font.mono,
});

globalStyle('.pop-card .pop-row', {
	display: 'flex',
	alignItems: 'center',
	gap: '0.4rem',
	fontSize: '0.8rem',
	color: vars.color.textMuted,
	marginTop: '2px',
});

globalStyle('.pop-card .pop-row strong', {
	fontFamily: vars.font.mono,
	color: vars.color.accentStrong,
	fontWeight: 700,
});

globalStyle('.pop-card .pop-note', {
	marginTop: '0.45rem',
	fontSize: '0.82rem',
	lineHeight: 1.45,
	color: vars.color.text,
});

/* 隐藏高德 logo 与版权（注意：使用免费 key 时请保留官方版权信息 / 已在条款约定下） */
globalStyle('.amap-logo, .amap-copyright', {
	opacity: '0.55',
	transition: 'opacity 0.2s ease',
});

globalStyle('.amap-logo:hover, .amap-copyright:hover', {
	opacity: '1',
});
