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
	{ id: 'blog', name: '博客默认', description: '冷灰与雾蓝', light: ['#fafafa', '#202327', '#476b92'], dark: ['#151719', '#f1f5f9', '#9ab5d3'] },
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
export function normalizeMode(value: unknown): AppearanceMode {
	return appearanceModes.find((mode) => mode.id === value)?.id ?? 'system';
}
export function normalizeScheme(value: unknown): ColorScheme {
	return colorSchemes.find((scheme) => scheme.id === value)?.id ?? 'blog';
}
