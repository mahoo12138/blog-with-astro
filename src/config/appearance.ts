/** TinyShip 原始主题见 src/styles/themes；博客原主题作为独立选项保留。 */
export const appearanceStorageKeys = {
	mode: 'theme-preference',
	scheme: 'color-scheme-preference',
} as const;

export const appearanceModes = [
	{ id: 'system', label: '跟随系统' },
	{ id: 'light', label: '浅色' },
	{ id: 'dark', label: '深色' },
] as const;

// 色样直接采用同一版本原始 CSS 的 background / foreground / primary。
// blog 是当前博客样式；default 专指 TinyShip 的 default.css，二者不混用。
export const colorSchemes = [
	// 这里叫「原色」不叫「默认」：面板底部的「恢复默认」是回到季节自动配色，
	// 两者不是一个概念，用同一个词会让人以为恢复默认就是选中这一项。
	{ id: 'blog', name: '博客原色', description: '冷灰与雾蓝', light: ['#fafafa', '#202327', '#476b92'], dark: ['#151719', '#f1f5f9', '#9ab5d3'] },
	{ id: 'default', name: 'Default', description: '经典黑白', light: ['oklch(1 0 0)', 'oklch(0.145 0 0)', 'oklch(0.205 0 0)'], dark: ['oklch(0.145 0 0)', 'oklch(0.985 0 0)', 'oklch(0.922 0 0)'] },
	{ id: 'claude', name: 'Claude', description: '暖纸与陶土', light: ['oklch(0.9818 0.0054 95.0986)', 'oklch(0.3438 0.0269 95.7226)', 'oklch(0.6171 0.1375 39.0427)'], dark: ['oklch(0.2679 0.0036 106.6427)', 'oklch(0.8074 0.0142 93.0137)', 'oklch(0.6724 0.1308 38.7559)'] },
	{ id: 'cosmic-night', name: 'Cosmic Night', description: '淡紫与深空', light: ['oklch(0.9730 0.0133 286.1503)', 'oklch(0.3015 0.0572 282.4176)', 'oklch(0.5417 0.1790 288.0332)'], dark: ['oklch(0.1743 0.0227 283.7998)', 'oklch(0.9185 0.0257 285.8834)', 'oklch(0.7162 0.1597 290.3962)'] },
	{ id: 'modern-minimal', name: 'Modern Minimal', description: '纯白与清蓝', light: ['oklch(1.0000 0 0)', 'oklch(0.3211 0 0)', 'oklch(0.6231 0.1880 259.8145)'], dark: ['oklch(0.2046 0 0)', 'oklch(0.9219 0 0)', 'oklch(0.6231 0.1880 259.8145)'] },
	{ id: 'ocean-breeze', name: 'Ocean Breeze', description: '浅海与青绿', light: ['oklch(0.9751 0.0127 244.2507)', 'oklch(0.3729 0.0306 259.7328)', 'oklch(0.7227 0.1920 149.5793)'], dark: ['oklch(0.2077 0.0398 265.7549)', 'oklch(0.8717 0.0093 258.3382)', 'oklch(0.7729 0.1535 163.2231)'] },
	{ id: 'perplexity', name: 'Perplexity', description: '纸白与青墨', light: ['oklch(0.9902 0.0039 106.4715)', 'oklch(0.3043 0.0394 214.0798)', 'oklch(0.5322 0.0910 205.7465)'], dark: ['oklch(0.2167 0.0015 197.0427)', 'oklch(0.9836 0.0021 197.1231)', 'oklch(0.7216 0.1120 204.7055)'] },
] as const;

export type AppearanceMode = typeof appearanceModes[number]['id'];
export type ColorScheme = typeof colorSchemes[number]['id'];
export const colorSchemeIds = colorSchemes.map((scheme) => scheme.id);

/**
 * 季节默认配色 —— 北半球（Northern Hemisphere）
 *
 * 月份按气象季节划分：春 3–5 / 夏 6–8 / 秋 9–11 / 冬 12–2。
 * 南半球恰好相差半年；若将来要支持，另配一张表按 hemisphere 分流即可，
 * 不要把月份区间散落进各个脚本。
 *
 * 选色只看「色调」与当季物候是否相配，明暗模式仍由 data-theme 独立控制：
 *   冬 冷、低饱和、雪与长夜   → 经典黑白 / 纯白清蓝 / 淡紫深空 / 冷灰雾蓝
 *   春 清透、湿润、新绿       → 纸白青墨 / 浅海青绿 / 冷灰雾蓝
 *   夏 明亮、晴空与海、夏夜   → 纯白清蓝 / 浅海青绿 / 淡紫深空
 *   秋 青墨转凉、暖土、暮秋   → 纸白青墨 / 暖纸陶土（深秋与暮秋共用暖调）
 *
 * 七套配色轮换 12 个月，只有 5 月回到博客原色；10–11 月刻意沿用同一套暖陶土，
 * 让深秋到暮秋是一段连续的暖调，而不是每月硬切一次。
 *
 * 站点是 output: 'static'，构建期 new Date() 会被写死进 HTML、跨月不更新；
 * 所以月份判定必须发生在浏览器首屏（BaseHead 的 is:inline 脚本），
 * 这里只提供静态映射表与两处运行期共用的一次真源。
 */
export const seasonalHemisphere = {
	id: 'northern',
	label: '北半球',
	seasons: '春 3–5 / 夏 6–8 / 秋 9–11 / 冬 12–2',
} as const;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const seasonLabels: Record<Season, string> = {
	spring: '春', summer: '夏', autumn: '秋', winter: '冬',
};

export function seasonOfMonth(month: number): Season {
	if (month >= 3 && month <= 5) return 'spring';
	if (month >= 6 && month <= 8) return 'summer';
	if (month >= 9 && month <= 11) return 'autumn';
	return 'winter';
}

/** 1–12 月逐月配色；tone 只用于外观面板里的季节提示文案。 */
export const seasonalSchemes: readonly { month: number; scheme: ColorScheme; tone: string }[] = [
	{ month: 1, scheme: 'default', tone: '凛冬 · 极简黑白' },
	{ month: 2, scheme: 'modern-minimal', tone: '残雪 · 纯白清蓝' },
	{ month: 3, scheme: 'perplexity', tone: '早春 · 纸白青墨' },
	{ month: 4, scheme: 'ocean-breeze', tone: '新绿 · 浅海青绿' },
	{ month: 5, scheme: 'blog', tone: '暮春 · 冷灰雾蓝' },
	{ month: 6, scheme: 'modern-minimal', tone: '初夏 · 晴空纯白' },
	{ month: 7, scheme: 'ocean-breeze', tone: '盛夏 · 海与青绿' },
	{ month: 8, scheme: 'cosmic-night', tone: '夏夜 · 淡紫深空' },
	{ month: 9, scheme: 'perplexity', tone: '初秋 · 青墨收敛' },
	{ month: 10, scheme: 'claude', tone: '深秋 · 暖纸陶土' },
	{ month: 11, scheme: 'claude', tone: '暮秋 · 暖纸陶土' },
	{ month: 12, scheme: 'cosmic-night', tone: '长夜 · 淡紫深空' },
] as const;

/** 供首屏 is:inline 脚本用 define:vars 注入；下标即 getMonth() 的 0–11。 */
export const seasonalSchemeIds = seasonalSchemes.map((entry) => entry.scheme);

export function seasonalDefault(date = new Date()) {
	const month = date.getMonth() + 1;
	const entry = seasonalSchemes[month - 1] ?? seasonalSchemes[0];
	return { month, season: seasonOfMonth(month), scheme: entry.scheme, tone: entry.tone };
}
export function seasonalDefaultScheme(date = new Date()): ColorScheme {
	return seasonalDefault(date).scheme;
}

export function normalizeMode(value: unknown): AppearanceMode {
	return appearanceModes.find((mode) => mode.id === value)?.id ?? 'system';
}
/**
 * fallback 区分两种语义：解析 DOM 上的属性时用 'blog'（无属性即博客原色），
 * 解析「用户偏好被清空」时用季节默认（没有偏好 = 跟随季节）。
 */
export function normalizeScheme(value: unknown, fallback: ColorScheme = 'blog'): ColorScheme {
	return colorSchemes.find((scheme) => scheme.id === value)?.id ?? fallback;
}
