import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

// 关于页只使用现有 token。插画保持作者原色，不随主题重染或滤色。
export const main = style({ minWidth: 0 });
export const page = style({
	margin: '0 16px', minWidth: 0, containerType: 'inline-size', containerName: 'about',
	'@media': { 'screen and (max-width: 667px)': { margin: 0 } },
});
export const breadcrumbs = style({
	display: 'flex', alignItems: 'center', gap: '12px', minHeight: '40px',
	fontSize: '0.8125rem', lineHeight: 1.6, color: vars.color.textMuted,
});
globalStyle(`${breadcrumbs} a`, { display: 'inline-flex', alignItems: 'center', minHeight: '44px', color: 'inherit' });
globalStyle(`${breadcrumbs} a:hover`, { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' });
export const hero = style({
	display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(160px, 36%)', alignItems: 'center', gap: '28px',
	padding: '26px 0 38px', borderBottom: `1px solid ${vars.color.border}`,
	'@container': { 'about (max-width: 510px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px', padding: '20px 0 28px' } },
});
export const heroCopy = style({ minWidth: 0 });
export const title = style({
	margin: 0, fontFamily: vars.font.heading, fontSize: 'clamp(1.9rem, 4vw, 2.55rem)',
	fontWeight: 650, lineHeight: 1.35, letterSpacing: '-0.03em', color: vars.color.textStrong,
});
export const name = style({ display: 'block', fontSize: '1.28em', marginTop: '2px', letterSpacing: '-0.035em' });
export const greeting = style({ margin: '22px 0 4px', fontSize: '0.9375rem', lineHeight: 1.9, color: vars.color.text, textWrap: 'pretty' });
export const introduction = style({ margin: 0, fontSize: '0.875rem', lineHeight: 1.9, color: vars.color.textMuted, textWrap: 'pretty' });
export const heroLink = style({
	display: 'inline-flex', alignItems: 'center', gap: '10px', minHeight: '44px', marginTop: '12px',
	fontSize: '0.8125rem', color: vars.color.accentStrong, borderRadius: '3px',
	selectors: { '&:hover': { textDecoration: 'underline', textUnderlineOffset: '5px' } },
});
globalStyle(`${heroLink} svg`, { width: '16px', height: '16px' });
export const portrait = style({
	margin: 0, width: '100%', minWidth: 0, alignSelf: 'center',
	'@container': { 'about (max-width: 510px)': { width: 'min(64%, 220px)', justifySelf: 'center' } },
});
export const illustration = style({ display: 'block', width: '100%', height: 'auto', aspectRatio: '1', maxWidth: '100%', objectFit: 'contain', borderRadius: 0 });
export const portraitCaption = style({ textAlign: 'center', marginTop: '6px', fontSize: '0.75rem', lineHeight: 1.7, color: vars.color.textMeta });
globalStyle(`${portraitCaption} a`, { display: 'inline-flex', alignItems: 'center', minHeight: '32px', color: 'inherit', borderRadius: '3px' });
globalStyle(`${portraitCaption} a:hover`, { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' });
export const section = style({
	padding: '36px 0', borderBottom: `1px solid ${vars.color.border}`, minWidth: 0,
	'@container': { 'about (max-width: 510px)': { padding: '28px 0' } },
});
export const closingSection = style({ borderBottom: 0, paddingBottom: '12px' });
export const sectionHeading = style({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px 20px', marginBottom: '18px' });
export const sectionTitle = style({ margin: '0 0 18px', fontFamily: vars.font.heading, fontSize: '1.45rem', fontWeight: 650, lineHeight: 1.5, color: vars.color.textStrong, letterSpacing: '-0.015em', scrollMarginTop: '24px' });
globalStyle(`${sectionHeading} ${sectionTitle}`, { margin: 0 });
export const sectionNote = style({ margin: 0, fontSize: '0.8125rem', lineHeight: 1.7, color: vars.color.textMeta });
export const bio = style({ margin: 0, color: vars.color.text, fontSize: '0.9375rem', lineHeight: 1.95, textWrap: 'pretty' });
export const interests = style({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px', margin: '24px 0 0',
	'@container': { 'about (max-width: 510px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' } },
});
export const interest = style({ minWidth: 0 });
globalStyle(`${interest} dt`, { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.7, color: vars.color.textStrong });
globalStyle(`${interest} dd`, { margin: '6px 0 0', fontSize: '0.8125rem', lineHeight: 1.85, color: vars.color.textMuted });
export const skills = style({ margin: 0 });
export const skillGroup = style({
	display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr)', gap: '12px 20px', padding: '16px 0',
	selectors: { '& + &': { borderTop: `1px solid ${vars.color.border}` } },
	'@container': { 'about (max-width: 420px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' } },
});
export const skillLabel = style({ color: vars.color.textMuted, fontSize: '0.8125rem', lineHeight: 1.9 });
export const skillItems = style({ margin: 0, minWidth: 0 });
export const skillList = style({ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', margin: 0, padding: 0, listStyle: 'none', color: vars.color.textStrong, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.8 });
export const personality = style({
	display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: '40px',
	'@container': { 'about (max-width: 510px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '26px' } },
});
export const personalityIntro = style({ minWidth: 0 });
export const personalityType = style({ margin: '24px 0 0', fontSize: '2.1rem', lineHeight: 1.2, fontFamily: vars.font.mono, fontWeight: 550, letterSpacing: '-0.06em', color: vars.color.accentStrong });
export const personalityName = style({ margin: '8px 0 0', fontSize: '0.875rem', color: vars.color.textStrong });
export const personalityNote = style({ margin: '16px 0 0', fontSize: '0.8125rem', lineHeight: 1.85, color: vars.color.textMuted });
export const sourceLink = style({ display: 'inline-flex', alignItems: 'center', minHeight: '44px', marginTop: '6px', fontSize: '0.75rem', color: vars.color.textMeta, textDecoration: 'underline', textUnderlineOffset: '4px', borderRadius: '3px' });
export const traits = style({ margin: 0, display: 'grid', gap: '19px', alignContent: 'center', minWidth: 0 });
export const trait = style({ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'baseline', gap: '8px', minWidth: 0 });
export const traitDimension = style({ fontSize: '0.8125rem', color: vars.color.textMuted, lineHeight: 1.7 });
export const traitResult = style({ margin: 0, display: 'flex', alignItems: 'baseline', gap: '14px' });
export const traitPreference = style({ fontSize: '0.8125rem', lineHeight: 1.7, color: vars.color.textStrong });
export const traitValue = style({ fontFamily: vars.font.mono, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums', color: vars.color.accentStrong });
globalStyle(`${traitValue} span`, { fontSize: '0.7rem', marginLeft: '2px' });
export const traitTrack = style({ margin: 0, gridColumn: '1 / -1', minWidth: 0 });
export const meter = style({ display: 'block', width: '100%', height: '5px', border: 0, borderRadius: '8px', appearance: 'none', background: vars.color.border, overflow: 'hidden' });
globalStyle(`${meter}::-webkit-meter-bar`, { background: vars.color.border, border: 0, borderRadius: '8px', height: '5px', boxShadow: 'none' });
globalStyle(`${meter}::-webkit-meter-optimum-value`, { background: vars.color.accentStrong, borderRadius: '8px' });
globalStyle(`${meter}::-moz-meter-bar`, { background: vars.color.accentStrong, borderRadius: '8px' });
export const writingList = style({ margin: 0 });
export const writingItem = style({ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: '8px 20px', padding: '12px 0',
	'@container': { 'about (max-width: 420px)': { gridTemplateColumns: 'minmax(0, 1fr)', gap: '4px' } },
});
globalStyle(`${writingItem} dt`, { fontSize: '0.875rem', lineHeight: 1.8, fontWeight: 550, color: vars.color.textStrong });
globalStyle(`${writingItem} dd`, { margin: 0, fontSize: '0.875rem', lineHeight: 1.8, color: vars.color.textMuted });
export const readingLinks = style({ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', marginTop: '24px', paddingRight: '40px' });
globalStyle(`${readingLinks} a`, { display: 'inline-flex', gap: '8px', alignItems: 'center', minHeight: '44px', fontSize: '0.8125rem', fontWeight: 500, color: vars.color.accentStrong, borderRadius: '3px' });
globalStyle(`${readingLinks} svg`, { width: '14px', height: '14px', flexShrink: 0 });
globalStyle(`${readingLinks} a:hover`, { textDecoration: 'underline', textUnderlineOffset: '5px' });
globalStyle(`${page} :where(a):focus-visible`, { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: '3px' });
