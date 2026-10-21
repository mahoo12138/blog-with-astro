import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

const gapMargin = "16px";
const gapPadding = "16px";
const borderCardSmall = "8px";
const borderBar = "6px";
// 侧栏应用壳总高 = 视口高 − 上下各一档呼吸（vars.space.xxl）。
// 与 StellarShell 的 left/right 吸顶偏移同源（top/marginTop = vars.space.xxl）：
// 吸顶后容器上下留白对称，footer 钉底、挂件内部滚动与底部区域不受影响。
const sidebarHeight = `calc(100dvh - 2 * ${vars.space.xxl})`;
const bgA20 = vars.color.surfaceMuted;
const bgA50 = vars.color.surface;
const bgA100 = vars.color.surfaceStrong;
const textP1 = vars.color.text;
const textP2 = vars.color.textMuted;
const textP3 = vars.color.textMeta;

export const root = style({ position: "relative", margin: 0, maxHeight: sidebarHeight });
export const container = style({
  position: "relative", height: sidebarHeight, display: "flex", flexDirection: "column",
  textAlign: "left", overflowWrap: "break-word", overflow: "hidden",
});
export const inner = style({
  position: "relative", flexGrow: 1, minHeight: 0, overflow: "auto",
  margin: `0 ${gapMargin}`, scrollbarWidth: "thin", lineHeight: 1.5,
});

export const profile = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  minHeight: "48px",
  // 身份块比容器顶再沉一档（vars.space.lg = 16px）：头像顶边落在 48px
  // （容器 32px + 16px，恰为 vars.space.xxxl），站名 cap 线约 54px，
  // 与文章页右栏 TOC 标题、面包屑的首行文字同线。
  // 刻意不与右栏容器顶严格齐平：头像+站名是顶带最重的墨，若贴着 32px 顶线
  // 会成为全页最高的墨迹，显得顶得太紧；下沉后与邻列文字形成温和的错落。
  // 抽屉态（≤900px 浮层面板，上方还有关闭按钮）同样适用这档顶距，无需单独分支。
  margin: `${vars.space.lg} ${gapMargin} 0`,
  padding: 0,
  overflow: "hidden",
  zIndex: 1,
});

export const avatar = style({
  width: "48px",
  height: "48px",
  marginRight: "1rem",
  padding: "2px",
  borderRadius: "48px",
  // background: 'rgba(255, 255, 255, 0.35)',
  border: "2px solid rgba(255, 255, 255, 0.35)",
  boxShadow: "none",
  // objectFit: 'cover',
  flexShrink: 0,
  transformOrigin: "center",
  objectFit: "cover",
});

export const titleWrap = style({
  minWidth: 0,
});

export const title = style({
  display: "block",
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 700,
  lineHeight: 1.2,
  color: vars.color.textStrong,
  letterSpacing: 0,
  textShadow: "none",
});

export const subtitle = style({
  margin: 0,
  fontSize: "0.78rem",
  lineHeight: 1.6,
  whiteSpace: "normal",
  color: textP2,
});

export const navArea = style({
  position: "relative",
  margin: `1rem ${gapMargin} 0`,
  zIndex: 1,
});

export const menuGrid = style({
  position: "relative",
  display: "grid",
  width: "100%",
  gridTemplateColumns: "repeat(var(--menubar-columns), minmax(0, 1fr))",
  gap: "8px",
  margin: "8px 0",
  padding: 0,
  zIndex: 1,
});

export const menuLink = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  width: "100%",
  minHeight: "58px",
  gap: "5px",
  borderRadius: borderBar,
  background: bgA20,
  color: textP3,
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
  position: "relative",
  selectors: {
    "&:hover": {
      color: textP1,
      background: bgA100,
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: vars.shadow.focus,
    },
  },
});

export const menuActive = style({
  color: vars.color.accentStrong,
  background: bgA100,
  boxShadow: "none",
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      width: "16px",
      height: "2px",
      left: "50%",
      bottom: "2px",
      transform: "translateX(-50%)",
      borderRadius: "2px",
      background: "currentColor",
    },
  },
});

export const menuIcon = style({
  height: "20px",
  width: "20px",
  objectFit: "contain",
  fill: "currentColor",
  stroke: "none",
  filter: "none",
  selectors: {
    [`${menuLink}:hover &`]: {
      filter: "unset",
    },
    [`${menuActive} &`]: {
      filter: "unset",
    },
  },
});

export const menuIconBase = style({
  opacity: 0.42,
});

export const menuIconTone = style({
  opacity: 1,
});

export const menuText = style({ fontSize: "11px", lineHeight: 1.4, whiteSpace: "nowrap" });

export const menuLabel = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const widgets = style({
  position: "relative",
  display: "block",
  // 搜索框迁出后，滚动区首个挂件与菜单之间保留呼吸间距。
  padding: "16px 0 0",
  zIndex: 1,
});

export const widget = style({
  display: "block",
  paddingBottom: "32px",
});

export const welcomeText = style({
  margin: 0,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.42)",
  fontSize: "0.88rem",
  lineHeight: 1.55,
  color: vars.color.text,
});

export const markdownWidget = style({});

export const markdownBody = style({
  borderRadius: borderCardSmall,
  padding: "0.25rem 1rem",
  background: bgA50,
  color: textP1,
  fontSize: "14px",
  lineHeight: 1.5,
});

export const postListWidget = style({});

export const widgetTitle = style({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: `0 ${gapPadding} 8px`, lineHeight: "20px", fontWeight: 600,
  fontSize: "12px", letterSpacing: 0, color: textP2,
});
export const widgetLink = style({
  fontSize: "0.78rem",
  color: vars.color.textMeta,
});

// 最近更新 / 相册列表等「文字行」挂件统一走 sidebarRows 标准：
// 文字左基线 16px、行 padding 6px 16px、hover accentSoft 淡晕。
// 别名保留旧名字，gallery-albums 等跨栏 widget 不必改引用。
import * as rows from "../styles/sidebarRows.css";

export const recentList = rows.list;
export const recentItem = rows.item;
export const recentItemTitle = rows.itemLabel;

export const footer = style({
  position: "relative",
  flexShrink: 0,
  margin: `0.5rem ${gapMargin} 1rem`,
  padding: "12px 0 0",
  borderTop: `1px solid ${vars.color.border}`,
  fontSize: "14px",
  color: textP3,
  zIndex: 1,
});

export const footerTools = style({
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px",
  "@media": { "(pointer: coarse)": { gap: 0 } },
});

export const socialWrap = style({
  display: "flex",
  flexShrink: 0,
  gap: "0.25rem",
  textAlign: "center",
  // 平板横屏侧栏只有 224px：保留 44px 触控目标，压缩的是间距而不是按钮。
  "@media": { "(pointer: coarse)": { gap: 0 } },
});

export const socialLink = style({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: "40px", height: "40px", flexShrink: 0, lineHeight: 0, padding: "10px",
  border: 0, borderRadius: "6px", background: "transparent", color: textP2,
  transition: "background-color 150ms ease, color 150ms ease",
  selectors: {
    "&:hover": { background: vars.color.accentSoft, color: vars.color.accentStrong },
    "&:focus-visible": { outline: `2px solid ${vars.color.accentStrong}`, outlineOffset: "2px" },
  },
  "@media": { "(pointer: coarse)": { width: "44px", height: "44px" } },
});
export const themeToggle = style({ cursor: "pointer" });
export const themeStatusIcon = style({ display: "none" });

export const themeStatusSystem = style({
  display: "block",
  selectors: {
    [`${themeToggle}[data-theme-mode='light'] &`]: {
      display: "none",
    },
    [`${themeToggle}[data-theme-mode='dark'] &`]: {
      display: "none",
    },
  },
});

export const themeStatusLight = style({
  selectors: {
    [`${themeToggle}[data-theme-mode='light'] &`]: {
      display: "block",
    },
  },
});

export const themeStatusDark = style({
  selectors: {
    [`${themeToggle}[data-theme-mode='dark'] &`]: {
      display: "block",
    },
  },
});

export const socialIcon = style({
  width: "18px",
  height: "18px",
});

globalStyle(`${container}::-webkit-scrollbar`, { display: "none" });
globalStyle(`${inner}::-webkit-scrollbar`, { display: "none" });
globalStyle(`${markdownBody} > *:first-child`, { marginTop: "0.75rem" });
globalStyle(`${markdownBody} > *:last-child`, { marginBottom: "0.75rem" });
globalStyle(`${widgetTitle} > span`, { opacity: 1 });
