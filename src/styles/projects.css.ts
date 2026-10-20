import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

// 开放式双列项目陈列：复用站点 token，不增加无内容的右栏或筛选工具栏。
export const main = style({ width: '100%', minWidth: 0 });
export const page = style({
  margin: '0 16px', minWidth: 0, containerType: 'inline-size', containerName: 'projects',
  '@media': { 'screen and (max-width: 667px)': { margin: 0 } },
});
export const breadcrumbs = style({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', minHeight: '40px', color: vars.color.textMuted, fontSize: '0.8125rem', lineHeight: 1.6 });
globalStyle(`${breadcrumbs} a`, { display: 'inline-flex', alignItems: 'center', minHeight: '44px', color: 'inherit', borderRadius: '3px' });
globalStyle(`${breadcrumbs} a:hover`, { color: vars.color.accentStrong, textDecoration: 'underline', textUnderlineOffset: '4px' });
export const header = style({ padding: '26px 0 28px' });
export const title = style({ margin: 0, fontFamily: vars.font.heading, fontSize: 'clamp(2rem, 3.5vw, 2.65rem)', fontWeight: 650, lineHeight: 1.3, letterSpacing: '-0.025em', color: vars.color.textStrong });
export const introduction = style({ margin: '14px 0 14px', fontSize: '0.9375rem', lineHeight: 1.85, color: vars.color.textMuted, textWrap: 'pretty' });
export const overview = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2px 20px' });
export const snapshot = style({ margin: 0, fontSize: '0.75rem', lineHeight: 1.8, color: vars.color.textMeta });
export const textLink = style({
  display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px', borderRadius: '3px', color: vars.color.accentStrong,
  fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'nowrap', textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline', textUnderlineOffset: '4px' } },
});
globalStyle(`${textLink} svg`, { width: '14px', height: '14px', flexShrink: 0 });
export const listHeading = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 0 16px' });
export const resultCount = style({ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: vars.color.textMuted, lineHeight: 1.6 });
export const sortNote = style({ fontSize: '0.75rem', lineHeight: 1.6, color: vars.color.textMeta });
export const list = style({
  display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 44px',
  listStyle: 'none', margin: 0, padding: 0, minWidth: 0,
  '@container': { 'projects (max-width: 760px)': { gridTemplateColumns: 'minmax(0, 1fr)' } },
});
export const item = style({ display: 'flex', margin: 0, padding: 0, minWidth: 0, borderTop: `1px solid ${vars.color.border}` });
export const project = style({ display: 'flex', flexDirection: 'column', width: '100%', padding: '26px 0 20px', minWidth: 0 });
export const projectHeader = style({
  display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px 20px',
  '@container': { 'projects (max-width: 500px)': { flexDirection: 'column' } },
});
export const identity = style({ minWidth: 0, flex: '1 1 auto' });
export const projectTitle = style({ margin: 0, fontFamily: vars.font.heading, fontSize: '1.4rem', fontWeight: 650, lineHeight: 1.45, letterSpacing: '-0.015em', color: vars.color.textStrong, overflowWrap: 'anywhere' });
globalStyle(`${projectTitle} a`, { color: 'inherit', textDecoration: 'none', borderRadius: '3px' });
globalStyle(`${projectTitle} a:hover`, { color: vars.color.accentStrong });
export const repoName = style({ margin: '5px 0 0', fontFamily: vars.font.mono, fontSize: '0.6875rem', lineHeight: 1.8, color: vars.color.textMeta, overflowWrap: 'anywhere' });
export const meta = style({
  display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, paddingTop: '4px',
  '@container': { 'projects (max-width: 500px)': { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 16px', paddingTop: 0 } },
});
export const category = style({ fontSize: '0.6875rem', fontWeight: 500, lineHeight: 1.7, color: vars.color.textMuted });
export const flag = style({ color: vars.color.accentStrong });
export const updated = style({ fontSize: '0.6875rem', lineHeight: 1.8, color: vars.color.textMeta, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' });
export const description = style({ margin: '16px 0 0', fontSize: '0.875rem', lineHeight: 1.9, color: vars.color.text, overflowWrap: 'anywhere', textWrap: 'pretty' });
export const note = style({ margin: '6px 0 0', fontSize: '0.75rem', lineHeight: 1.85, color: vars.color.textMuted, overflowWrap: 'anywhere' });
export const projectFooter = style({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 20px',
  marginTop: 'auto', paddingTop: '16px',
  '@media': { 'screen and (max-width: 900px)': { paddingRight: '44px' } },
});
export const stack = style({ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px 14px', margin: 0, padding: 0, listStyle: 'none', fontSize: '0.6875rem', fontFamily: vars.font.body, lineHeight: 1.8, color: vars.color.textMuted });
export const links = style({ display: 'flex', alignItems: 'center', gap: '20px' });
export const empty = style({ margin: 0, padding: '40px 0', borderTop: `1px solid ${vars.color.border}`, color: vars.color.textMuted, fontSize: '0.875rem', lineHeight: 1.8 });
export const sourceNote = style({ margin: '22px 0 0', padding: '22px 0 0', borderTop: `1px solid ${vars.color.border}`, color: vars.color.textMeta, fontSize: '0.75rem', lineHeight: 1.9, textWrap: 'pretty' });
