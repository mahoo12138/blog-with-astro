import { globalStyle, keyframes } from '@vanilla-extract/css';
import { breakpoints, vars } from '../../styles/theme.css';

const scope = '.md-text';
const block = vars.color.surfaceMuted;
const card = vars.color.surface;
const border = vars.color.borderStrong;
const text = vars.color.text;
const textStrong = vars.color.textStrong;
const textMuted = vars.color.textMuted;
const textMeta = vars.color.textMeta;
const manuscriptLightCard = 'rgba(251, 246, 238, 0.96)';
const manuscriptLightMuted = 'rgba(236, 229, 219, 0.96)';
const manuscriptLightRule = 'rgba(120, 103, 88, 0.18)';
const manuscriptLightText = 'rgba(58, 48, 40, 0.96)';
const manuscriptLightTextMuted = 'rgba(120, 103, 88, 0.82)';
const manuscriptDarkCard = 'rgb(37, 33, 25)';
const manuscriptDarkMuted = 'rgb(42, 37, 32)';
const manuscriptDarkRule = 'rgba(107, 94, 84, 0.68)';
const manuscriptDarkText = 'rgb(240, 236, 232)';
const manuscriptDarkTextMuted = 'rgb(168, 154, 144)';
const manuscriptAccent = '#f97316';

const copyPulse = keyframes({
	'0%': { transform: 'translateY(0) scale(1)' },
	'35%': { transform: 'translateY(-1px) scale(0.9)' },
	'72%': { transform: 'translateY(0) scale(1.05)' },
	'100%': { transform: 'translateY(0) scale(1)' },
});

globalStyle(`${scope} .tag-inline`, {
	display: 'inline',
	verticalAlign: 'baseline',
});

globalStyle(`${scope} .tag-inline.kbd`, {
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: '1.65em',
	padding: '0 0.42em',
	borderRadius: '6px',
	border: `1px solid ${border}`,
	borderBottomWidth: '2px',
	background: card,
	color: textStrong,
	fontFamily: vars.font.mono,
	fontSize: '0.84em',
	fontWeight: 700,
	lineHeight: 1.2,
});

globalStyle(`${scope} .tag-inline.blur, ${scope} .tag-inline.password`, {
	cursor: 'pointer',
	borderRadius: '4px',
	transition: 'filter 160ms ease, background 160ms ease, color 160ms ease',
});

globalStyle(`${scope} .tag-inline.blur:not(.is-revealed)`, {
	filter: 'blur(4px)',
	background: vars.color.codeBackground,
});

globalStyle(`${scope} .tag-inline.password:not(.is-revealed)`, {
	color: 'transparent',
	textShadow: `0 0 8px ${textMuted}`,
	background: vars.color.codeBackground,
});

globalStyle(`${scope} .tag-inline.underline`, {
	textDecoration: 'underline',
	textDecorationColor: 'var(--tag-color)',
	textDecorationThickness: '0.16em',
	textUnderlineOffset: '0.18em',
});

globalStyle(`${scope} .tag-inline.emphasis`, {
	fontWeight: 800,
	color: 'var(--tag-color)',
});

globalStyle(`${scope} .tag-inline.wavy`, {
	textDecoration: 'underline wavy var(--tag-color)',
	textUnderlineOffset: '0.18em',
});

globalStyle(`${scope} .tag-inline.deleted`, {
	color: textMuted,
	textDecorationThickness: '0.12em',
});

globalStyle(`${scope} .tag-inline.super, ${scope} .tag-inline.sub`, {
	padding: '0.05em 0.28em',
	borderRadius: '999px',
	background: 'var(--tag-bg)',
	color: 'var(--tag-color)',
	fontWeight: 700,
});

globalStyle(`${scope} .tag-inline.emoji`, {
	display: 'inline-flex',
	alignItems: 'center',
	lineHeight: 1,
	verticalAlign: '-0.25em',
});

globalStyle(`${scope} .tag-inline.emoji img`, {
	display: 'inline-block',
	height: 'var(--emoji-height)',
	width: 'auto',
	margin: 0,
	borderRadius: 0,
});

globalStyle(`${scope} .tag-plugin.callout`, {
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: 'auto minmax(0, 1fr)',
	gap: '0.75rem',
	margin: `0 0 ${vars.space.xl}`,
	padding: '1rem',
	border: '1px solid var(--callout-border)',
	borderLeft: '4px solid var(--callout-color)',
	borderRadius: '16px',
	background: 'linear-gradient(135deg, var(--callout-bg), transparent 130%), var(--callout-surface)',
	color: text,
});

globalStyle(`${scope} .tag-plugin.callout .callout-icon`, {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '1.55rem',
	height: '1.55rem',
	borderRadius: '999px',
	background: 'var(--callout-bg)',
	color: 'var(--callout-color)',
	fontSize: '0.78rem',
	fontWeight: 800,
	lineHeight: 1,
});

globalStyle(`${scope} .tag-plugin.callout .callout-icon svg`, {
	width: '1rem',
	height: '1rem',
});

globalStyle(`${scope} .tag-plugin.callout .callout-title`, {
	marginBottom: '0.35rem',
	color: textStrong,
	fontSize: '0.96rem',
	fontWeight: 800,
	lineHeight: 1.35,
});

globalStyle(`${scope} .tag-plugin.callout .callout-body > :first-child`, { marginTop: 0 });
globalStyle(`${scope} .tag-plugin.callout .callout-body > :last-child`, { marginBottom: 0 });

globalStyle(`${scope} .tag-plugin.folders`, {
	display: 'grid',
	gap: '0.65rem',
});

globalStyle(`${scope} .tag-plugin.folders .folder`, {
	border: `1px solid ${border}`,
	borderRadius: '14px',
	background: card,
	overflow: 'hidden',
});

globalStyle(`${scope} .tag-plugin.folders .folder > summary`, {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '0.75rem',
	padding: '0.8rem 1rem',
	cursor: 'pointer',
	listStyle: 'none',
	fontWeight: 700,
	color: textStrong,
});

globalStyle(`${scope} .tag-plugin.folders .folder > summary::-webkit-details-marker`, { display: 'none' });

globalStyle(`${scope} .tag-plugin.folders .folder > summary::after`, {
	content: '+',
	color: textMeta,
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.folders .folder[open] > summary`, {
	borderBottom: `1px solid ${border}`,
});

globalStyle(`${scope} .tag-plugin.folders .folder[open] > summary::after`, { content: '-' });

globalStyle(`${scope} .tag-plugin.folders .folder-body`, {
	padding: '0.85rem 1rem 1rem',
});

globalStyle(`${scope} .tag-plugin.folders .folder-body > :first-child`, { marginTop: 0 });
globalStyle(`${scope} .tag-plugin.folders .folder-body > :last-child`, { marginBottom: 0 });

globalStyle(`${scope} .tag-plugin.blockquote-card`, {
	position: 'relative',
	margin: '1.25rem 0',
	padding: '1.25rem 1.5rem',
	border: `1px solid ${border}`,
	borderRadius: '18px',
	background: card,
	boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
	color: text,
});

globalStyle(`${scope} .tag-plugin.blockquote-card::before`, {
	content: '"“"',
	position: 'absolute',
	top: '-0.35rem',
	left: '1rem',
	color: 'var(--quote-color)',
	fontSize: '3rem',
	fontFamily: 'Georgia, serif',
	lineHeight: 1,
	opacity: 0.34,
});

globalStyle(`${scope} .tag-plugin.blockquote-card .blockquote-content`, {
	position: 'relative',
	zIndex: 1,
});

globalStyle(`${scope} .tag-plugin.blockquote-card .blockquote-cite`, {
	display: 'block',
	marginTop: '0.85rem',
	color: textMuted,
	fontSize: '0.88rem',
	fontStyle: 'normal',
});

globalStyle(`${scope} .tag-plugin.title-block`, {
	display: 'flex',
	alignItems: 'center',
	gap: '0.6rem',
	margin: '1.8rem 0 0.8rem',
	letterSpacing: 0,
	textWrap: 'balance',
});

globalStyle(`${scope} .tag-plugin.title-block[data-align='center']`, { justifyContent: 'center', textAlign: 'center' });
globalStyle(`${scope} .tag-plugin.title-block[data-align='right']`, { justifyContent: 'flex-end', textAlign: 'right' });

globalStyle(`${scope} .tag-plugin.title-block .title-icon`, {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '1.8rem',
	height: '1.8rem',
	padding: '0 0.45rem',
	borderRadius: '9px',
	background: 'var(--title-bg)',
	color: 'var(--title-color)',
	fontSize: '0.95rem',
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.title-block[data-variant='quote'] .title-icon`, {
	background: 'transparent',
	fontFamily: 'Georgia, serif',
	fontSize: '1.35em',
});

globalStyle(`${scope} .tag-plugin.title-block[data-shadow='true'] .title-text`, {
	textShadow: '0 0 20px var(--title-bg)',
});

globalStyle(`${scope} .tag-plugin.paper, ${scope} .tag-plugin.reel`, {
	vars: {
		'--manuscript-bg': manuscriptLightCard,
		'--manuscript-muted': manuscriptLightMuted,
		'--manuscript-rule': manuscriptLightRule,
		'--manuscript-text': manuscriptLightText,
		'--manuscript-text-muted': manuscriptLightTextMuted,
		'--manuscript-accent': manuscriptAccent,
	},
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.reel`, {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '1rem 0',
});

globalStyle(`${scope} .tag-plugin.reel .reel-content`, {
	display: 'flex',
	flexDirection: 'column',
	width: 'fit-content',
	maxWidth: 'calc(100% - 5rem)',
	padding: '1rem',
	position: 'relative',
	writingMode: 'vertical-rl',
	background: 'var(--manuscript-bg)',
	borderTop: '1px dashed var(--manuscript-text-muted)',
	borderBottom: '1px dashed var(--manuscript-text-muted)',
	borderRadius: 0,
	boxShadow: 'none',
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-content::before, ${scope} .tag-plugin.reel .reel-content::after`, {
	content: '',
	position: 'absolute',
	width: '4px',
	top: '-16px',
	bottom: '-16px',
	borderRadius: '4px',
	background: 'var(--manuscript-muted)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-content::before`, { left: '-4px' });
globalStyle(`${scope} .tag-plugin.reel .reel-content::after`, { left: '100%' });

globalStyle(`${scope} .tag-plugin.reel .reel-title`, {
	position: 'relative',
	fontSize: '1rem',
	fontWeight: 500,
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-title::before, ${scope} .tag-plugin.reel .reel-title::after`, {
	content: '',
	position: 'absolute',
	width: '4px',
	right: 'calc(-1rem - 4px)',
	borderRadius: '4px',
	background: 'var(--manuscript-accent)',
	zIndex: 1,
});

globalStyle(`${scope} .tag-plugin.reel .reel-title::before`, {
	top: 'calc(-1rem - 6px)',
	bottom: 'calc(100% + 1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-title::after`, {
	top: 'calc(100% + 1rem - 6px)',
	bottom: 'calc(-1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-meta`, {
	color: 'var(--manuscript-text-muted)',
	fontSize: '0.78rem',
	fontWeight: 500,
});

globalStyle(`${scope} .tag-plugin.reel .reel-body`, {
	overflow: 'auto',
	margin: 'calc(1rem - 4px) 1rem',
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-main p`, {
	margin: 0,
	fontSize: '0.95rem',
	lineHeight: 1.85,
	color: 'inherit',
});

globalStyle(`${scope} .tag-plugin.reel .reel-main p + p`, {
	marginBlockStart: '1rem',
});

globalStyle(`${scope} .tag-plugin.reel .reel-date`, {
	color: 'var(--manuscript-text-muted)',
	fontSize: '0.78rem',
	fontWeight: 500,
	textAlign: 'right',
});

globalStyle(`${scope} .tag-plugin.reel .reel-footer`, {
	position: 'relative',
	color: 'var(--manuscript-text-muted)',
	fontSize: '0.78rem',
	textAlign: 'right',
});

globalStyle(`${scope} .tag-plugin.reel .reel-footer::before, ${scope} .tag-plugin.reel .reel-footer::after`, {
	content: '',
	position: 'absolute',
	width: '4px',
	left: 'calc(-1rem - 4px)',
	borderRadius: '4px',
	background: 'var(--manuscript-accent)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-footer::before`, {
	top: 'calc(-1rem - 6px)',
	bottom: 'calc(100% + 1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.reel .reel-footer::after`, {
	top: 'calc(100% + 1rem - 6px)',
	bottom: 'calc(-1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.paper`, {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '1rem 0',
});

globalStyle(`${scope} .tag-plugin.paper .paper-content`, {
	position: 'relative',
	width: 'min(100%, 38rem)',
	maxWidth: '95%',
	padding: '1rem',
	borderLeft: '1px dashed var(--manuscript-text-muted)',
	borderRight: '1px dashed var(--manuscript-text-muted)',
	borderBottom: '1px dashed var(--manuscript-text-muted)',
	borderRadius: 0,
	background: 'var(--manuscript-bg)',
	boxShadow: 'none',
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-content::before`, {
	content: '',
	position: 'absolute',
	height: '4px',
	left: '-16px',
	top: '-4px',
	right: '-16px',
	borderRadius: '4px',
	background: 'var(--manuscript-muted)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title`, {
	position: 'relative',
	margin: 0,
	fontSize: '1rem',
	fontWeight: 500,
	textAlign: 'center',
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title::before, ${scope} .tag-plugin.paper .paper-title::after`, {
	content: '',
	position: 'absolute',
	height: '4px',
	top: 'calc(-1rem - 4px)',
	borderRadius: '4px',
	background: 'var(--manuscript-accent)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title::before`, {
	left: 'calc(-1rem - 6px)',
	right: 'calc(100% + 1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title::after`, {
	right: 'calc(-1rem - 6px)',
	left: 'calc(100% + 1rem - 6px)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title, ${scope} .tag-plugin.paper .paper-footer, ${scope} .tag-plugin.paper .paper-body`, {
	background: 'linear-gradient(transparent 1.5rem, var(--manuscript-rule) 1px)',
	backgroundSize: '100% calc(1.5rem + 1px)',
	lineHeight: 'calc(1.5rem + 1px)',
	padding: '0 3px',
});

globalStyle(`${scope} .tag-plugin.paper .paper-title`, {
	borderTop: '1px solid var(--manuscript-rule)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-paragraph`, {
	textIndent: '2em',
});

globalStyle(`${scope} .tag-plugin.paper .paper-section .paper-section-title`, {
	marginBottom: '0.25rem',
	textAlign: 'center',
	fontWeight: 500,
	color: 'var(--manuscript-text)',
});

globalStyle(`${scope} .tag-plugin.paper .paper-section .paper-section-content`, {
	textIndent: '2em',
});

globalStyle(`${scope} .tag-plugin.paper .paper-line-right p, ${scope} .tag-plugin.paper .paper-line[data-align='right'] p`, {
	textAlign: 'right',
});

globalStyle(`${scope} .tag-plugin.paper .paper-line-center p, ${scope} .tag-plugin.paper .paper-line[data-align='center'] p`, {
	textAlign: 'center',
});

globalStyle(`${scope} .tag-plugin.paper .paper-footer`, {
	color: 'var(--manuscript-text-muted)',
	fontSize: '0.78rem',
	textAlign: 'right',
});

globalStyle(`${scope} .tag-plugin.paper .paper-author-date`, {
	textAlign: 'right',
});

globalStyle(`${scope} .tag-plugin.paper .paper-author-date span`, {
	color: 'var(--manuscript-text-muted)',
	fontSize: '0.78rem',
	fontWeight: 500,
});

globalStyle(`${scope} .tag-plugin.paper .paper-author-date .paper-author`, {
	marginRight: '0.5rem',
});

globalStyle(`${scope} .tag-plugin.paper .paper-content p`, {
	margin: 0,
	color: 'inherit',
});

globalStyle(`${scope} .tag-plugin.paper[data-variant='plain'] .paper-content`, {
	borderLeft: 0,
	borderRight: 0,
	borderBottom: 0,
	paddingTop: '0.5rem',
	paddingBottom: '0.5rem',
});

globalStyle(`${scope} .tag-plugin.paper[data-variant='plain'] .paper-content::before, ${scope} .tag-plugin.paper[data-variant='plain'] .paper-title::before, ${scope} .tag-plugin.paper[data-variant='plain'] .paper-title::after`, {
	display: 'none',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.paper, :root:not([data-theme="light"]) ${scope} .tag-plugin.reel`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			vars: {
				'--manuscript-bg': manuscriptDarkCard,
				'--manuscript-muted': manuscriptDarkMuted,
				'--manuscript-rule': manuscriptDarkRule,
				'--manuscript-text': manuscriptDarkText,
				'--manuscript-text-muted': manuscriptDarkTextMuted,
				'--manuscript-accent': '#fb923c',
			},
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.paper, :root[data-theme="dark"] ${scope} .tag-plugin.reel`, {
	vars: {
		'--manuscript-bg': manuscriptDarkCard,
		'--manuscript-muted': manuscriptDarkMuted,
		'--manuscript-rule': manuscriptDarkRule,
		'--manuscript-text': manuscriptDarkText,
		'--manuscript-text-muted': manuscriptDarkTextMuted,
		'--manuscript-accent': '#fb923c',
	},
});

globalStyle(`${scope} .tag-plugin.panel`, {
	border: `1px solid ${border}`,
	borderRadius: '12px',
	background: vars.color.surfaceMuted,
	overflow: 'hidden',
	boxShadow: 'none',
});

globalStyle(`${scope} .tag-plugin.panel .panel-header`, {
	display: 'flex',
	justifyContent: 'space-between',
	gap: '1rem',
	padding: '0.7rem 0.9rem',
	borderBottom: `1px solid ${border}`,
	background: block,
	color: textStrong,
	fontSize: '0.88rem',
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment`, {
	position: 'relative',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment ~ .panel-segment`, {
	backgroundImage: `repeating-linear-gradient(to right, ${border} 0 6px, transparent 6px 11px)`,
	backgroundPosition: '1rem 0',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'calc(100% - 2rem) 1px',
	paddingTop: '0.35rem',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-header`, {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: '0.75rem',
	minHeight: '2rem',
	padding: '0.75rem 1rem 0.25rem',
	fontSize: '0.8125rem',
	fontWeight: 600,
	color: textMeta,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-label`, {
	display: 'inline-flex',
	alignItems: 'center',
	maxWidth: '100%',
	padding: '0.12rem 0.6rem',
	borderRadius: '6px',
	background: 'rgba(15, 23, 42, 0.05)',
	color: textMuted,
	lineHeight: 1.4,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-meta`, {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.5rem',
	flexShrink: 0,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-right`, {
	color: textMeta,
	fontSize: '0.8125rem',
	fontWeight: 600,
	lineHeight: 1.4,
	transition: 'color 160ms ease',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-copy`, {
	minWidth: 0,
	padding: '0.2rem 0.55rem',
	border: `1px solid ${border}`,
	background: 'transparent',
	color: textMeta,
	opacity: 0,
	transform: 'translateY(2px) scale(0.94)',
	transition: 'opacity 160ms ease, transform 160ms ease, color 160ms ease, background 160ms ease, border-color 160ms ease',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment:hover .panel-segment-copy, ${scope} .tag-plugin.panel .panel-segment-copy:focus-visible, ${scope} .tag-plugin.panel .panel-segment-copy.is-copied`, {
	opacity: 1,
	transform: 'translateY(0) scale(1)',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment:hover .panel-segment-right`, {
	color: textMuted,
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.panel .panel-segment-label`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: 'rgba(255, 255, 255, 0.06)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.panel .panel-segment-label`, {
	background: 'rgba(255, 255, 255, 0.06)',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.panel .panel-segment-copy:hover`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: 'rgba(255, 255, 255, 0.06)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.panel .panel-segment-copy:hover`, {
	background: 'rgba(255, 255, 255, 0.06)',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body`, {
	padding: 0,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > :first-child`, { marginTop: 0 });
globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > :last-child`, { marginBottom: 0 });

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > p, ${scope} .tag-plugin.panel .panel-segment-body > ul, ${scope} .tag-plugin.panel .panel-segment-body > ol`, {
	margin: 0,
	padding: '0.35rem 1rem 0.85rem',
	fontSize: '0.9375rem',
	lineHeight: 1.7,
	color: text,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > pre, ${scope} .tag-plugin.panel .panel-segment-body > pre.astro-code`, {
	margin: '0 !important',
	padding: '0.35rem 1rem 0.9rem !important',
	border: '0 !important',
	borderRadius: '0 !important',
	boxShadow: 'none !important',
	background: 'transparent !important',
	color: `${vars.color.codeText} !important`,
	whiteSpace: 'pre-wrap',
	overflowWrap: 'anywhere',
	lineHeight: 1.7,
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > pre code`, {
	all: 'unset',
	fontFamily: vars.font.mono,
	fontSize: '0.85rem',
	lineHeight: 1.7,
	color: 'inherit',
	background: 'transparent',
});

globalStyle(`${scope} .tag-plugin.panel .panel-segment-body > pre .line`, {
	display: 'block',
});

globalStyle(`${scope} .mdx-copy-button`, {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '0.3rem',
	minWidth: '2.25rem',
	border: 0,
	borderRadius: '7px',
	padding: '0.35rem 0.55rem',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	cursor: 'pointer',
	fontSize: '0.78rem',
	fontWeight: 800,
	transition: 'transform 180ms ease, opacity 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
});

globalStyle(`${scope} .mdx-copy-button:hover, ${scope} .mdx-copy-button:focus-visible`, {
	transform: 'translateY(-1px)',
	boxShadow: '0 8px 18px rgba(15, 23, 42, 0.10)',
});

globalStyle(`${scope} .mdx-copy-button svg`, {
	width: '0.9rem',
	height: '0.9rem',
	transition: 'transform 180ms ease, opacity 180ms ease',
});

globalStyle(`${scope} .mdx-copy-button.is-copied`, {
	animation: `${copyPulse} 360ms ease`,
});

globalStyle(`${scope} .tag-plugin.private`, {
	border: `1px solid ${border}`,
	borderRadius: '16px',
	background: card,
	overflow: 'hidden',
});

globalStyle(`${scope} .tag-plugin.private .private-locked`, {
	display: 'grid',
	justifyItems: 'center',
	gap: '0.7rem',
	padding: '1.5rem',
	textAlign: 'center',
});

globalStyle(`${scope} .tag-plugin.private .private-icon`, {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '2.8rem',
	height: '2.8rem',
	borderRadius: '999px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
});

globalStyle(`${scope} .tag-plugin.private .private-icon svg`, { width: '1.25rem', height: '1.25rem' });

globalStyle(`${scope} .tag-plugin.private .private-title`, {
	fontWeight: 800,
	color: textStrong,
});

globalStyle(`${scope} .tag-plugin.private .private-desc, ${scope} .tag-plugin.private .private-hint`, {
	color: textMuted,
	fontSize: '0.9rem',
});

globalStyle(`${scope} .tag-plugin.private .private-form`, {
	display: 'flex',
	flexWrap: 'wrap',
	justifyContent: 'center',
	gap: '0.5rem',
	width: '100%',
});

globalStyle(`${scope} .tag-plugin.private .private-input`, {
	minWidth: '12rem',
	padding: '0.55rem 0.7rem',
	border: `1px solid ${border}`,
	borderRadius: '8px',
	background: vars.color.surfaceStrong,
	color: textStrong,
});

globalStyle(`${scope} .tag-plugin.private .private-button`, {
	border: 0,
	borderRadius: '8px',
	padding: '0.55rem 0.9rem',
	background: vars.color.accentStrong,
	color: '#fff',
	cursor: 'pointer',
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.private .private-error`, {
	display: 'none',
	color: '#ef4444',
	fontSize: '0.85rem',
	fontWeight: 700,
});

globalStyle(`${scope} .tag-plugin.private[data-error='true'] .private-error`, { display: 'block' });

globalStyle(`${scope} .tag-plugin.private .private-unlocked`, {
	padding: '1rem',
});

globalStyle(`${scope} .tag-plugin.private .private-unlocked[hidden], ${scope} .tag-plugin.private .private-locked[hidden]`, { display: 'none' });

globalStyle(`${scope} .tag-plugin.private .private-unlocked-header`, {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: '1rem',
	marginBottom: '0.8rem',
	paddingBottom: '0.75rem',
	borderBottom: `1px solid ${border}`,
	color: textMuted,
	fontSize: '0.86rem',
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.private .private-content > :first-child`, { marginTop: 0 });
globalStyle(`${scope} .tag-plugin.private .private-content > :last-child`, { marginBottom: 0 });

globalStyle(`${scope} .tag-plugin.audio`, {
	display: 'flex',
	justifyContent: 'var(--audio-align, flex-start)',
});

globalStyle(`${scope} .tag-plugin.audio .audio-card`, {
	display: 'grid',
	gridTemplateColumns: '4rem minmax(0, 1fr)',
	alignItems: 'center',
	gap: '0.85rem',
	width: 'min(100%, var(--audio-width, 34rem))',
	padding: '0.75rem',
	border: `1px solid ${border}`,
	borderRadius: '16px',
	background: card,
	boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
});

globalStyle(`${scope} .tag-plugin.audio .audio-cover`, {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '4rem',
	height: '4rem',
	borderRadius: '12px',
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
	overflow: 'hidden',
});

globalStyle(`${scope} .tag-plugin.audio .audio-cover img`, {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	margin: 0,
	borderRadius: 0,
});

globalStyle(`${scope} .tag-plugin.audio .audio-cover svg`, { width: '1.45rem', height: '1.45rem' });

globalStyle(`${scope} .tag-plugin.audio .audio-title`, {
	fontWeight: 800,
	color: textStrong,
	lineHeight: 1.3,
});

globalStyle(`${scope} .tag-plugin.audio .audio-artist`, {
	marginTop: '0.1rem',
	color: textMuted,
	fontSize: '0.86rem',
});

globalStyle(`${scope} .tag-plugin.audio audio`, {
	width: '100%',
	marginTop: '0.55rem',
});

globalStyle(`${scope} .tag-plugin.audio .netease-wrap`, {
	width: 'min(100%, var(--audio-width, 330px))',
	borderRadius: '12px',
	overflow: 'hidden',
	background: card,
});

globalStyle(`${scope} .tag-plugin.photo`, {
	position: 'relative',
	overflow: 'hidden',
	borderRadius: '20px',
	background: block,
	border: `1px solid ${border}`,
});

globalStyle(`${scope} .tag-plugin.photo .photo-bg`, {
	position: 'absolute',
	inset: 0,
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	filter: 'blur(18px)',
	transform: 'scale(1.08)',
	opacity: 0.42,
});

globalStyle(`${scope} .tag-plugin.photo .photo-image-wrap`, {
	position: 'relative',
	zIndex: 1,
	display: 'flex',
	justifyContent: 'center',
	padding: '1rem',
});

globalStyle(`${scope} .tag-plugin.photo .photo-image`, {
	maxHeight: '32rem',
	width: 'auto',
	maxWidth: '100%',
	objectFit: 'contain',
	margin: 0,
	borderRadius: '14px',
});

globalStyle(`${scope} .tag-plugin.photo .photo-bar`, {
	position: 'relative',
	zIndex: 1,
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
	alignItems: 'center',
	gap: '0.75rem',
	padding: '0.75rem 1rem',
	background: 'rgba(255, 255, 255, 0.78)',
	backdropFilter: 'blur(10px)',
	color: 'rgba(15, 23, 42, 0.78)',
	fontSize: '0.78rem',
	fontWeight: 700,
});

globalStyle(`${scope} .tag-plugin.photo[data-type='blur'] .photo-bar`, {
	gridTemplateColumns: 'minmax(0, 1fr) auto',
});

globalStyle(`${scope} .tag-plugin.photo .photo-brand`, { color: 'rgba(15, 23, 42, 0.92)' });
globalStyle(`${scope} .tag-plugin.photo .photo-center`, { textAlign: 'center', fontWeight: 900 });
globalStyle(`${scope} .tag-plugin.photo .photo-right`, { textAlign: 'right' });

globalStyle(`${scope} .tag-plugin.terminal`, {
	border: `1px solid ${border}`,
	borderRadius: '14px',
	background: vars.color.surfaceStrong,
	overflow: 'hidden',
	boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-header`, {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '1rem',
	padding: '0.5rem 0.7rem',
	borderBottom: `1px solid ${border}`,
	background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,247,251,0.96))',
	color: textMuted,
	fontSize: '0.8rem',
	fontWeight: 700,
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-title`, {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.45rem',
	minWidth: 0,
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-dots`, {
	display: 'inline-flex',
	gap: '0.35rem',
	flexShrink: 0,
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-dots span`, {
	display: 'block',
	width: '0.62rem',
	height: '0.62rem',
	borderRadius: '50%',
	opacity: 0.95,
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-dots span:nth-child(1)`, { background: '#fb7185' });
globalStyle(`${scope} .tag-plugin.terminal .terminal-dots span:nth-child(2)`, { background: '#fbbf24' });
globalStyle(`${scope} .tag-plugin.terminal .terminal-dots span:nth-child(3)`, { background: '#34d399' });

globalStyle(`${scope} .tag-plugin.terminal .terminal-body`, {
	padding: '0.25rem 0.7rem 0.7rem',
	overflowX: 'hidden',
});

globalStyle(`${scope} .tag-plugin.terminal pre`, {
	margin: 0,
	padding: '0.5rem 0',
	border: 0,
	borderRadius: '0',
	boxShadow: 'none',
	background: 'transparent',
	overflowX: 'auto',
	whiteSpace: 'pre',
});

globalStyle(`${scope} .tag-plugin.terminal code`, {
	fontFamily: vars.font.mono,
	fontSize: '0.88rem',
	color: vars.color.codeText,
	background: 'transparent',
	whiteSpace: 'pre',
});

globalStyle(`${scope} .tag-plugin.terminal pre::-webkit-scrollbar`, {
	height: '6px',
});

globalStyle(`${scope} .tag-plugin.terminal pre::-webkit-scrollbar-thumb`, {
	background: 'rgba(18, 25, 38, 0.14)',
	borderRadius: '999px',
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-copy-button`, {
	minWidth: '1.95rem',
	width: '1.95rem',
	height: '1.95rem',
	padding: 0,
	border: '1px solid transparent',
	borderRadius: '6px',
	background: 'transparent',
	color: 'inherit',
	boxShadow: 'none',
});

globalStyle(`${scope} .tag-plugin.terminal .terminal-copy-button:hover, ${scope} .tag-plugin.terminal .terminal-copy-button:focus-visible`, {
	background: vars.color.accentSoft,
	color: vars.color.accentStrong,
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: 'rgba(2, 6, 23, 0.94)',
			boxShadow: '0 14px 32px rgba(2, 6, 23, 0.22)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal`, {
	background: 'rgba(2, 6, 23, 0.94)',
	boxShadow: '0 14px 32px rgba(2, 6, 23, 0.22)',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal .terminal-header`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
			background: 'rgba(15, 23, 42, 0.82)',
			color: 'rgba(226, 232, 240, 0.84)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal .terminal-header`, {
	borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
	background: 'rgba(15, 23, 42, 0.82)',
	color: 'rgba(226, 232, 240, 0.84)',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal pre`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			border: 0,
			background: 'transparent',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal pre`, {
	border: 0,
	background: 'transparent',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal code`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			color: '#e2e8f0',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal code`, {
	color: '#e2e8f0',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal pre::-webkit-scrollbar-thumb`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: 'rgba(255, 255, 255, 0.14)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal pre::-webkit-scrollbar-thumb`, {
	background: 'rgba(255, 255, 255, 0.14)',
});

globalStyle(`:root:not([data-theme="light"]) ${scope} .tag-plugin.terminal .terminal-copy-button:hover, :root:not([data-theme="light"]) ${scope} .tag-plugin.terminal .terminal-copy-button:focus-visible`, {
	'@media': {
		'(prefers-color-scheme: dark)': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(226, 232, 240, 0.96)',
		},
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.terminal .terminal-copy-button:hover, :root[data-theme="dark"] ${scope} .tag-plugin.terminal .terminal-copy-button:focus-visible`, {
	background: 'rgba(255, 255, 255, 0.08)',
	color: 'rgba(226, 232, 240, 0.96)',
});

globalStyle(`${scope} .tag-plugin.gh-card`, {
	width: 'min(100%, 34rem)',
	border: `1px solid ${border}`,
	borderRadius: '16px',
	background: card,
	overflow: 'hidden',
	boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
});

globalStyle(`${scope} .tag-plugin.gh-card a`, {
	display: 'block',
	padding: '1rem',
	color: text,
	background: 'none',
});

globalStyle(`${scope} .tag-plugin.gh-card .gh-header`, {
	display: 'flex',
	alignItems: 'center',
	gap: '0.55rem',
	fontWeight: 800,
	color: textStrong,
});

globalStyle(`${scope} .tag-plugin.gh-card .gh-avatar`, {
	width: '4rem',
	height: '4rem',
	borderRadius: '50%',
	objectFit: 'cover',
	margin: 0,
});

globalStyle(`${scope} .tag-plugin.gh-card .gh-description`, {
	marginTop: '0.6rem',
	color: textMuted,
	fontSize: '0.9rem',
});

globalStyle(`${scope} .tag-plugin.gh-card .gh-stats`, {
	display: 'flex',
	flexWrap: 'wrap',
	gap: '0.55rem',
	marginTop: '0.85rem',
});

globalStyle(`${scope} .tag-plugin.gh-card .gh-stat`, {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '0.25rem',
	padding: '0.25rem 0.5rem',
	borderRadius: '999px',
	background: block,
	color: textMuted,
	fontSize: '0.8rem',
	fontWeight: 700,
});

globalStyle(`${scope} .tag-plugin.sites .sites-grid`, {
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 15rem), 1fr))',
	gap: '0.85rem',
});

globalStyle(`${scope} .tag-plugin.sites .site-card`, {
	display: 'grid',
	gridTemplateRows: '8rem minmax(0, 1fr)',
	border: `1px solid ${border}`,
	borderRadius: '16px',
	background: card,
	color: text,
	overflow: 'hidden',
	boxShadow: '0 8px 22px rgba(15, 23, 42, 0.07)',
});

globalStyle(`${scope} .tag-plugin.sites .site-card:hover`, {
	transform: 'translateY(-2px)',
	color: text,
});

globalStyle(`${scope} .tag-plugin.sites .site-cover`, {
	background: block,
	overflow: 'hidden',
});

globalStyle(`${scope} .tag-plugin.sites .site-cover img`, {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	margin: 0,
	borderRadius: 0,
});

globalStyle(`${scope} .tag-plugin.sites .site-info`, {
	display: 'grid',
	gridTemplateColumns: '2rem minmax(0, 1fr)',
	gap: '0.65rem',
	padding: '0.85rem',
});

globalStyle(`${scope} .tag-plugin.sites .site-icon`, {
	width: '2rem',
	height: '2rem',
	borderRadius: '8px',
	objectFit: 'cover',
	margin: 0,
});

globalStyle(`${scope} .tag-plugin.sites .site-title`, {
	fontWeight: 800,
	color: textStrong,
	lineHeight: 1.25,
});

globalStyle(`${scope} .tag-plugin.sites .site-desc`, {
	display: '-webkit-box',
	WebkitBoxOrient: 'vertical',
	WebkitLineClamp: 2,
	overflow: 'hidden',
	marginTop: '0.2rem',
	color: textMuted,
	fontSize: '0.82rem',
	lineHeight: 1.35,
});

globalStyle(`${scope} .tag-plugin.sites .site-labels`, {
	display: 'flex',
	flexWrap: 'wrap',
	gap: '0.35rem',
	gridColumn: '1 / -1',
	marginTop: '0.45rem',
});

globalStyle(`${scope} .tag-plugin.sites .site-label`, {
	padding: '0.1rem 0.4rem',
	borderRadius: '999px',
	fontSize: '0.72rem',
	fontWeight: 800,
});

globalStyle(`${scope} .tag-plugin.posters .posters-grid`, {
	display: 'grid',
	gridTemplateColumns: 'repeat(var(--poster-cols, auto-fill), minmax(min(100%, var(--poster-min, 8rem)), 1fr))',
	gap: '0.75rem',
});

globalStyle(`${scope} .tag-plugin.posters .poster-card`, {
	display: 'block',
	color: text,
	background: 'none',
});

globalStyle(`${scope} .tag-plugin.posters .poster-cover`, {
	aspectRatio: 'var(--poster-ratio, 2 / 3)',
	borderRadius: '14px',
	background: block,
	overflow: 'hidden',
	boxShadow: '0 8px 22px rgba(15, 23, 42, 0.09)',
});

globalStyle(`${scope} .tag-plugin.posters .poster-cover img`, {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	margin: 0,
	borderRadius: 0,
	transition: 'transform 260ms ease',
});

globalStyle(`${scope} .tag-plugin.posters .poster-card:hover .poster-cover img`, { transform: 'scale(1.04)' });

globalStyle(`${scope} .tag-plugin.posters .poster-title`, {
	display: 'block',
	marginTop: '0.45rem',
	color: textMuted,
	fontSize: '0.82rem',
	fontWeight: 700,
	textAlign: 'center',
});

globalStyle(`${scope} .tag-plugin.yo-card`, {
	position: 'relative',
	overflow: 'hidden',
	minHeight: '16rem',
	padding: '1.25rem',
	border: `1px solid ${border}`,
	borderRadius: '18px',
	background: 'var(--yc-bg, var(--yc-bg-gradient, var(--yc-bg-color, var(--yc-surface))))',
	backgroundImage: 'var(--yc-bg-image-layer, none), var(--yc-bg-gradient, none)',
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	color: 'var(--yc-text, var(--yc-text-default))',
	boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
});

globalStyle(`${scope} .tag-plugin.yo-card::before`, {
	content: '',
	position: 'absolute',
	inset: 0,
	background: 'var(--yc-overlay, transparent)',
	pointerEvents: 'none',
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-body`, {
	position: 'relative',
	zIndex: 1,
	display: 'grid',
	minHeight: '13.5rem',
	alignContent: 'space-between',
	gap: '1rem',
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-logo`, {
	position: 'absolute',
	right: '1rem',
	top: '1rem',
	zIndex: 2,
	width: '3.2rem',
	height: '3.2rem',
	objectFit: 'cover',
	margin: 0,
	border: '2px solid rgba(255,255,255,0.6)',
	boxShadow: '0 8px 20px rgba(15,23,42,0.18)',
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-logo[data-shape='circle']`, { borderRadius: '50%' });
globalStyle(`${scope} .tag-plugin.yo-card .yo-card-logo[data-shape='rounded']`, { borderRadius: '10px' });
globalStyle(`${scope} .tag-plugin.yo-card .yo-card-logo[data-shape='square']`, { borderRadius: 0 });

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-name`, {
	maxWidth: 'calc(100% - 4rem)',
	color: 'var(--yc-name-color, currentColor)',
	fontFamily: 'var(--yc-font-name, inherit)',
	fontSize: '1.65rem',
	fontWeight: 900,
	lineHeight: 1.05,
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-role`, {
	marginTop: '0.35rem',
	color: 'var(--yc-role-color, currentColor)',
	opacity: 0.78,
	fontWeight: 700,
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-bio`, {
	maxWidth: '32rem',
	fontFamily: 'var(--yc-font-body, inherit)',
	lineHeight: 1.65,
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-bio > :first-child`, { marginTop: 0 });
globalStyle(`${scope} .tag-plugin.yo-card .yo-card-bio > :last-child`, { marginBottom: 0 });

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-contact`, {
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'space-between',
	gap: '1rem',
	borderTop: '1px solid color-mix(in srgb, currentColor 18%, transparent)',
	paddingTop: '0.85rem',
	fontSize: '0.86rem',
});

globalStyle(`${scope} .tag-plugin.yo-card .yo-card-qr`, {
	display: 'inline-grid',
	placeItems: 'center',
	width: '4rem',
	height: '4rem',
	borderRadius: '10px',
	background: '#fff',
	color: '#111827',
	fontSize: '0.72rem',
	fontWeight: 900,
});

globalStyle(`${scope} .tag-plugin.step`, {
	display: 'flex',
	alignItems: 'center',
	gap: '0.7rem',
	padding: '0.8rem 1rem',
	border: `1px solid ${border}`,
	borderRadius: '14px',
	background: card,
});

globalStyle(`${scope} .tag-plugin.step .step-badge`, {
	display: 'inline-grid',
	placeItems: 'center',
	minWidth: '2rem',
	height: '2rem',
	padding: '0 0.45rem',
	borderRadius: '10px',
	background: 'var(--step-bg)',
	color: 'var(--step-color)',
	fontWeight: 900,
});

globalStyle(`${scope} .tag-plugin.step .step-title`, {
	fontWeight: 800,
	color: textStrong,
});

globalStyle(`${scope} .tag-plugin.radio`, {
	display: 'flex',
	alignItems: 'center',
	gap: '0.5rem',
	fontSize: '0.94rem',
	lineHeight: 1.2,
	margin: '0.5rem 0',
});

globalStyle(`${scope} .tag-plugin.radio input`, {
	appearance: 'none',
	width: '16px',
	height: '16px',
	border: '2px solid var(--theme)',
	borderRadius: '50%',
	background: 'transparent',
	flexShrink: 0,
});

globalStyle(`${scope} .tag-plugin.radio input:checked`, {
	boxShadow: 'inset 0 0 0 3px var(--radio-surface)',
	background: 'var(--theme)',
});

globalStyle(`${scope} a.tag-plugin.button .button-icon`, {
	display: 'inline-flex',
	alignItems: 'center',
	marginRight: '0.35rem',
});

globalStyle(`${scope} a.tag-plugin.button .button-icon svg`, {
	width: '1em',
	height: '1em',
});

globalStyle(`${scope} .tag-plugin.image .image-bg`, {
	background: 'var(--image-bg, transparent)',
	padding: 'var(--image-padding, 0)',
	aspectRatio: 'var(--image-ratio, auto)',
});

globalStyle(`${scope} .tag-plugin.image .image-bg img`, {
	width: 'var(--image-width, auto)',
	height: 'var(--image-height, auto)',
});

globalStyle(`${scope} .tag-plugin.image .image-bg[data-fit='contain'] img`, { objectFit: 'contain' });
globalStyle(`${scope} .tag-plugin.image .image-bg[data-fit='cover'] img`, { width: '100%', height: '100%', objectFit: 'cover' });

globalStyle(`${scope} .tag-plugin.checkbox[data-inline='true'], ${scope} .tag-plugin.radio[data-inline='true']`, {
	display: 'inline-flex',
	margin: '0 0.25rem',
	verticalAlign: 'middle',
});

globalStyle(`${scope} .tag-plugin.copy .copy-btn.is-copied, ${scope} .mdx-copy-button.is-copied`, {
	background: 'rgba(34, 197, 94, 0.16)',
	color: '#16a34a',
});

globalStyle(`${scope} .tag-plugin.copy .copy-icon`, {
	display: 'inline-flex',
	alignItems: 'center',
	marginRight: 0,
});

globalStyle(`${scope} .tag-plugin.copy .copy-icon svg`, {
	width: '0.9rem',
	height: '0.9rem',
});

globalStyle(`${scope} .tag-plugin.banner .banner-back`, {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: '2rem',
	height: '2rem',
	border: 0,
	borderRadius: '999px',
	background: 'rgba(255,255,255,0.22)',
	color: '#fff',
	cursor: 'pointer',
});

globalStyle(`${scope} .tag-plugin.banner .banner-back svg`, { width: '1rem', height: '1rem' });

globalStyle(`${scope} .tag-plugin.gh-card, ${scope} .tag-plugin.sites, ${scope} .tag-plugin.posters, ${scope} .tag-plugin.yo-card`, {
	vars: {
		'--yc-surface': card,
		'--yc-text-default': textStrong,
	},
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.photo .photo-bar`, {
	background: 'rgba(15, 23, 42, 0.72)',
	color: 'rgba(241, 245, 249, 0.82)',
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.photo .photo-brand`, {
	color: 'rgba(241, 245, 249, 0.96)',
});

globalStyle(`:root[data-theme="dark"] ${scope} .tag-plugin.yo-card`, {
	vars: {
		'--yc-surface': vars.color.surfaceStrong,
		'--yc-text-default': vars.color.textStrong,
	},
});

globalStyle(`${scope} .tag-plugin.audio .audio-card`, {
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gridTemplateColumns: '1fr',
		},
	},
});

globalStyle(`${scope} .tag-plugin.audio .audio-cover`, {
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			width: '100%',
			height: '8rem',
		},
	},
});

globalStyle(`${scope} .tag-plugin.photo .photo-bar`, {
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			gridTemplateColumns: '1fr',
			textAlign: 'left',
		},
	},
});

globalStyle(`${scope} .tag-plugin.photo .photo-right`, {
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			textAlign: 'left',
		},
	},
});
// —— Tabs（从 BlogPost.css.ts 迁入）——
// tabs 是 MDX 组件，样式必须住在 md-text 组件域里跟 mdx-components 走；
// 之前寄居 BlogPost.css.ts，非博客布局（课时页等）加载不到该 chunk，
// tab-pane 的隐藏规则（height:0）整套失效，所有 pane 同时堆出。
globalStyle(`${scope} .tag-plugin.tabs`, {
	position: 'relative',
	marginTop: '1rem',
	marginBottom: '1rem',
	display: 'flex',
	flexDirection: 'column',
});
globalStyle(`${scope} .tag-plugin.tabs[data-align='center']`, { alignItems: 'center' });
globalStyle(`${scope} .tag-plugin.tabs[data-align='right']`, { alignItems: 'flex-end' });
globalStyle(`${scope} .tag-plugin.tabs .nav-tabs`, {
	display: 'flex',
	alignSelf: 'center',
	maxWidth: '100%',
	overflow: 'auto visible',
	whiteSpace: 'nowrap',
	margin: '0',
	padding: '8px 0',
	lineHeight: 1.5,
	position: 'relative',
	listStyle: 'none',
});
globalStyle(`${scope} .tag-plugin.tabs .nav-tabs::after`, {
	content: '',
	position: 'absolute',
	left: 0,
	bottom: 0,
	width: '100%',
	height: '2px',
	borderRadius: '2px',
	background: border,
});
globalStyle(`${scope} .tag-plugin.tabs .tab a`, {
	display: 'block',
	cursor: 'pointer',
	padding: '0.25rem 0.75rem',
	fontSize: '0.875rem',
	lineHeight: 'inherit',
	fontWeight: 500,
	color: textMuted,
	borderRadius: '4px',
	position: 'relative',
	margin: '0 2px',
	background: 'none',
});
globalStyle(`${scope} .tag-plugin.tabs .tab a:hover`, { color: textStrong, background: border });
globalStyle(`${scope} .tag-plugin.tabs .tab.active a`, {
	cursor: 'default',
	color: textStrong,
	background: card,
	boxShadow: '0 0 0 1px rgba(18, 25, 38, 0.05), 0 4px 12px rgba(15, 23, 42, 0.06)',
});
globalStyle(`${scope} .tag-plugin.tabs .tab.active a::after`, {
	content: '',
	zIndex: 1,
	position: 'absolute',
	background: 'var(--theme)',
	height: '2px',
	bottom: '-8px',
	left: '0.75rem',
	right: '0.75rem',
	borderRadius: '2px',
});
globalStyle(`${scope} .tag-plugin.tabs .tab-content`, {
	maxWidth: '100%',
	textAlign: 'justify',
	marginTop: '0.5rem',
	display: 'flex',
	flexDirection: 'column',
});
globalStyle(`${scope} .tag-plugin.tabs .tab-pane`, { display: 'block', maxWidth: '100%' });
globalStyle(`${scope} .tag-plugin.tabs .tab-pane:not(.active)`, { height: 0, overflow: 'hidden' });
