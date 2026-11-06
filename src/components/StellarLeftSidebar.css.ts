import { createVar, globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

const gapMargin = "16px";
const gapPadding = "16px";
const borderCardSmall = "8px";
const borderBar = "6px";
// 侧栏应用壳总高 = 视口高 − 上下各一档呼吸（vars.space.xxl）。
// 与 StellarShell 的 left/right 吸顶偏移同源（top/marginTop = vars.space.xxl）：
// 吸顶后容器上下留白对称，footer 钉底、挂件内部滚动与底部区域不受影响。
const sidebarHeight = `calc(100dvh - 2 * ${vars.space.xxl})`;
const bgA50 = vars.color.surface;
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

/**
 * 菜单磁贴的底色只由「当前主题」决定，四项保持同一色：
 *  - 中性底 = 卡片色掺一点前景墨色，保证任何主题下都与页面拉开明度差
 *    （原先直接用 surfaceMuted / surfaceStrong，在博客默认浅色里与页面同色，
 *    磁贴整块隐形，选中项尤其看不见）；
 *  - 再掺一点主题主色：六套配色取各自的 --primary，博客默认取雾蓝 accent，
 *    于是切换配色主题时这里会跟着换色相，而不是一串写死的固定色。
 * 配置里的 --menu-theme 是四个入口各自的固定十六进制色，与主题系统无关，
 * **不要**用它染底色 —— 那会让主题切换在这一块完全失去意义。
 */
// 注意 default.css 在 :root 上也定义了 --primary（经典黑白的中性色），
// 所以不能写 var(--primary, accent) 指望回退：博客默认主题会误吃到黑色。
// 按 data-color-scheme 分流：六套配色用各自的 --primary，博客默认用雾蓝 accent。
const menuAccent = createVar();
globalStyle(":root", { vars: { [menuAccent]: vars.color.accent } });
globalStyle(':root[data-color-scheme]', { vars: { [menuAccent]: "var(--primary)" } });
const menuSurface = (ink: number, tint: number) =>
  `color-mix(in srgb, ${menuAccent} ${tint}%, color-mix(in srgb, ${vars.color.textStrong} ${ink}%, ${vars.color.surfaceStrong}))`;

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
  // 常态刻意比选中态轻得多：只留一点墨色 + 一点主题色相，磁贴与页面能分开
  // 又不压过顶带的头像和站名。
  background: menuSurface(5, 6),
  // 11px 标签沿用正文色，任何主题下都留足 AA 余量（原先 textMeta 在近白底只有 4.4:1）。
  color: textP1,
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: 1.2,
  textAlign: "center",
  position: "relative",
  transition: `background-color ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}`,
  selectors: {
    // 悬停只比常态重一档，别从很浅的底突然跳到选中态的深度。
    "&:hover": {
      background: menuSurface(8, 10),
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: vars.shadow.focus,
    },
  },
});

// 掺三成前景墨色：个别配色主题（如 Ocean Breeze 浅色）的 accentStrong 偏亮，
// 直接用在染过色的磁贴上会掉到 AA 以下；深色主题里则相反地被提亮。
const menuActiveText = `color-mix(in srgb, ${vars.color.accentStrong} 65%, ${vars.color.textStrong})`;

export const menuActive = style({
  color: menuActiveText,
  // 选中不再退回等于页面底色的 surfaceStrong，而是在同一层底上加深；
  // 深度只比悬停高一档 —— 辨识主要交给文字色与下划线，不要把整块压重。
  background: menuSurface(9, 12),
  boxShadow: "none",
  selectors: {
    // 悬停只加强底色，选中项的文字色相不丢。
    "&:hover": { color: menuActiveText, background: menuSurface(11, 14) },
    "&::after": {
      content: '""',
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
export const socialIcon = style({
  width: "18px",
  height: "18px",
});

globalStyle(`${container}::-webkit-scrollbar`, { display: "none" });
globalStyle(`${inner}::-webkit-scrollbar`, { display: "none" });
globalStyle(`${markdownBody} > *:first-child`, { marginTop: "0.75rem" });
globalStyle(`${markdownBody} > *:last-child`, { marginBottom: "0.75rem" });
globalStyle(`${widgetTitle} > span`, { opacity: 1 });
