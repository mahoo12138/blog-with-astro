/**
 * 表情处理。
 *
 * 内置一套 Unicode 表情（离线可用、零请求），并兼容 Artalk 后端的表情包格式：
 *   { name, type: 'emoji' | 'emoticon' | 'image', items: [{ key, val }] }[]
 * - emoji / emoticon：把 val 直接插入输入框；
 * - image：插入 `:[key]` 短码，渲染评论时替换成 <img>（与官方 SDK 一致）。
 *
 * 后端默认指向 jsdelivr 的 default.json；该 CDN 在部分网络下不可达，
 * 因此解析失败一律静默回退内置表情，不影响评论功能。
 */

export interface EmoticonItem {
	key: string;
	val: string;
}

export interface EmoticonGroup {
	name: string;
	type: 'emoji' | 'emoticon' | 'image';
	items: EmoticonItem[];
}

const group = (name: string, values: string[]): EmoticonGroup => ({
	name,
	type: 'emoji',
	items: values.map((val, index) => ({ key: `emoji-${name}-${index + 1}`, val })),
});

export const BUILTIN_EMOTICONS: EmoticonGroup[] = [
	group('常用', [
		'😀', '😄', '😁', '😆', '😅', '🤣', '😊', '🙂', '🙃', '😉',
		'😍', '🥰', '😘', '😋', '😎', '🤔', '🤗', '🫡', '😴', '🥳',
	]),
	group('心情', [
		'❤️', '🧡', '💛', '💚', '💙', '💜', '💔', '✨', '🔥', '🌈',
		'😭', '😢', '😤', '😱', '🤯', '🥺', '😳', '🤩', '😌', '🙏',
	]),
	group('动作', [
		'👍', '👎', '👏', '🙌', '🤝', '💪', '👀', '✍️', '🎉', '🚀',
		'💡', '📝', '☕', '🌙', '⭐', '🐱', '🐶', '🍀', '🎈', '📌',
	]),
];

function parsePack(raw: unknown): EmoticonGroup[] | null {
	const source = typeof raw === 'string'
		? (() => { try { return JSON.parse(raw) as unknown; } catch { return null; } })()
		: raw;
	if (!Array.isArray(source)) return null;
	const groups: EmoticonGroup[] = [];
	for (const item of source) {
		if (!item || typeof item !== 'object') continue;
		const entry = item as Record<string, unknown>;
		if (!Array.isArray(entry.items)) continue;
		const type = entry.type === 'image' ? 'image' : entry.type === 'emoticon' ? 'emoticon' : 'emoji';
		const items: EmoticonItem[] = [];
		for (const rawItem of entry.items) {
			if (!rawItem || typeof rawItem !== 'object') continue;
			const pair = rawItem as Record<string, unknown>;
			if (typeof pair.key !== 'string' || typeof pair.val !== 'string') continue;
			items.push({ key: pair.key, val: pair.val });
		}
		if (items.length > 0) {
			groups.push({ name: String(entry.name ?? '表情'), type, items: items.slice(0, 120) });
		}
	}
	return groups.length > 0 ? groups.slice(0, 8) : null;
}

/**
 * 决定最终使用的表情包。
 * @param setting   站点侧配置：'auto' | 'builtin' | false | URL | JSON 字符串
 * @param remote    后端 /conf 的 frontend_conf.emoticons
 */
export async function resolveEmoticons(setting: string | false, remote: unknown): Promise<EmoticonGroup[]> {
	if (setting === false || setting === 'off' || setting === 'none') return [];
	if (setting === 'builtin') return BUILTIN_EMOTICONS;

	const source = setting === 'auto' ? remote : setting;
	// 后端显式关掉表情时尊重后端；配置缺失（/conf 失败）才回退内置。
	if (source === false || source === 'false') return [];
	if (source === undefined || source === null || source === '') return BUILTIN_EMOTICONS;

	if (typeof source === 'string' && /^https?:\/\//i.test(source.trim())) {
		const controller = new AbortController();
		const timer = window.setTimeout(() => controller.abort(), 6000);
		try {
			const response = await fetch(source.trim(), { signal: controller.signal });
			if (!response.ok) return BUILTIN_EMOTICONS;
			return parsePack(await response.json()) ?? BUILTIN_EMOTICONS;
		} catch {
			return BUILTIN_EMOTICONS;
		} finally {
			window.clearTimeout(timer);
		}
	}
	return parsePack(source) ?? BUILTIN_EMOTICONS;
}

/** image 类型表情的短码 → 图片地址，供评论渲染时替换 `:[key]`。 */
export function imageEmoticonMap(groups: EmoticonGroup[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const grp of groups) {
		if (grp.type !== 'image') continue;
		for (const item of grp.items) map.set(`:[${item.key}]`, item.val);
	}
	return map;
}

/** 点击表情时插入输入框的文本。 */
export function emoticonInsertText(grp: EmoticonGroup, item: EmoticonItem): string {
	return grp.type === 'image' ? `:[${item.key}]` : item.val;
}
