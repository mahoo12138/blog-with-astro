import { existsSync } from 'node:fs';
import path from 'node:path';
import { mediaConfig } from '../config/media.mjs';

/**
 * 图片来源解析：把「带前缀的引用」翻译成浏览器能直接加载的地址。
 *
 * 规则表（详见 src/config/media.mjs 顶部注释）：
 *   https://… / //… / data:  → external，原样返回
 *   /images/…                → local（站内绝对写法，落在素材根下）
 *   其它 / 开头的地址          → public，原样返回
 *   store:<相对路径>          → storeBase + 逐段编码
 *   local:<相对路径>          → localRoot + 逐段编码（并校验文件真实存在）
 *   ./a.png 等裸相对路径       → relative，原样返回（相对内容文件，Astro 管线接管）
 *
 * 只做纯字符串映射 + 一次 optional 的存在性检查，不联网、不读图片尺寸，
 * 因此可以同时被构建期组件、remark 插件和预检脚本复用。
 */

/** 受管前缀。除此之外的任何 scheme 都当外链。 */
const MEDIA_SCHEME = /^(store|local):/i;
/** 已经过 URL 编码的段落（omni-store 明确要求不得二次编码）。 */
const PRE_ENCODED = /%[0-9a-f]{2}/i;

/** @typedef {'external' | 'public' | 'store' | 'local' | 'relative'} MediaKind */

/**
 * @typedef {object} ResolvedMedia
 * @property {string} src 可直接写进 src/href 的地址
 * @property {MediaKind} kind 来源类型（便于调试与断言）
 */

/**
 * 解析一个图片来源。
 *
 * @param {string} raw 内容里写的原始字符串
 * @param {{ storeBase?: string, localRoot?: string, root?: string, verify?: boolean }} [options]
 *   storeBase/localRoot 省略时取 mediaConfig；root 用于 local 存在性校验（默认 cwd）；
 *   verify=false 跳过 local 的文件检查（预检之外的宽松场景）
 * @returns {ResolvedMedia}
 */
export function resolveMedia(raw, options = {}) {
	if (typeof raw !== 'string') throw new Error('图片来源必须是字符串');
	const src = raw.trim();
	if (!src) throw new Error('图片来源为空');

	const match = MEDIA_SCHEME.exec(src);
	// 没有前缀：原样返回。已经解析过的地址（组件内部二次调用）也走这里，
	// 所以 kind 用「按最终地址反查」，见下方 classifyMediaUrl。
	if (!match) return { src, kind: classifyMediaUrl(src, options) };

	const scheme = /** @type {'store' | 'local'} */ (match[1].toLowerCase());
	const ref = src.slice(match[0].length);
	// 末段的 ?query / #hash 原样保留（缓存击穿用的 ?v= 之类），只编码路径部分。
	const [, encodedPath, suffix = ''] = /^([^?#]*)([\s\S]*)$/.exec(ref) ?? [];
	assertRefPath(encodedPath, scheme);
	const urlPath = encodeMediaPath(encodedPath);

	if (scheme === 'store') {
		const base = normalizeBase(options.storeBase ?? mediaConfig.storeBase);
		if (!base) {
			throw new Error(
				'store: 引用需要先配置 omni-store 静态发布地址：' +
					'填 src/config/media.mjs 的 mediaConfig.storeBase，或设置 MEDIA_STORE_BASE 环境变量' +
					'（形如 https://files.example.com/assets/ast-xxxxxxxx/）',
			);
		}
		return { src: `${base}${urlPath}${suffix}`, kind: 'store' };
	}

	const root = normalizeLocalRoot(options.localRoot ?? mediaConfig.localRoot);
	if (options.verify !== false) {
		const projectRoot = options.root ?? process.cwd();
		const file = path.join(projectRoot, 'public', root, safeDecode(encodedPath));
		if (!existsSync(file)) {
			throw new Error(
				`local: 找不到文件 public${root}/${encodedPath}` +
					'（本地素材必须放在 public 素材根下；文章配图请改用 store:）',
			);
		}
	}
	return { src: `${root}/${urlPath}${suffix}`, kind: 'local' };
}

/** 是否是我们管辖的前缀（外链/裸相对路径返回 false）。 */
export function isMediaRef(src) {
	return typeof src === 'string' && MEDIA_SCHEME.test(src.trim());
}

/**
 * 从**已解析**的地址反推来源，用于给最终 HTML 打 `data-media` 标记
 * （渲染到这里时原始前缀已经没了，只能按 base 反查）。
 *
 * @param {string} value
 * @param {{ storeBase?: string, localRoot?: string }} [options]
 * @returns {MediaKind}
 */
export function classifyMediaUrl(value, options = {}) {
	if (typeof value !== 'string' || !value) return 'external';
	const store = normalizeBase(options.storeBase ?? mediaConfig.storeBase);
	if (store && value.startsWith(store)) return 'store';
	const root = (options.localRoot ?? mediaConfig.localRoot).replace(/\/+$/, '');
	if (root && (value === root || value.startsWith(`${root}/`))) return 'local';
	return classify(value);
}

/** 归类非受管来源，只为了日志/调试好看，不参与地址计算。 */
function classify(src) {
	// 协议相对 //host/a.png 是外链，别被它开头的 / 骗成站内路径
	if (src.startsWith('//')) return 'external';
	if (/^[a-z][a-z\d+.-]*:/i.test(src)) return 'external';
	if (src.startsWith('/')) return 'public';
	return 'relative';
}

/**
 * 逐段 URL 编码。
 *
 * omni-store 的约定：每个文件名段单独编码，不能把整条带 `/` 的路径当一段；
 * 已编码的输入不得二次编码（`%20` 再编码会变成 `%2520`，直接 404）。
 */
export function encodeMediaPath(value) {
	if (PRE_ENCODED.test(value)) return value;
	return value
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

/**
 * @param {string} ref
 * @param {'store' | 'local'} scheme
 */
function assertRefPath(ref, scheme) {
	const label = `${scheme}:`;
	if (!ref) throw new Error(`${label} 后面缺少路径`);
	if (ref.startsWith('/')) throw new Error(`${label} 路径不要以 / 开头，它本来就相对发布根/素材根`);
	if (ref.includes('\\') || ref.includes('\0')) throw new Error(`${label} 路径含非法字符`);
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) {
		throw new Error(`${label} 后面只写相对路径，不要再带协议和域名`);
	}
	const segments = ref.split('/');
	if (segments.some((segment) => segment === '')) throw new Error(`${label} 路径不能有空的路径段（//）`);
	if (segments.some((segment) => segment === '.' || segment === '..')) {
		throw new Error(`${label} 路径不能包含 . 或 .. 段`);
	}
}

/** base_url 末尾斜杠归一化；空值原样返回。 */
function normalizeBase(value) {
	const base = (value ?? '').trim();
	if (!base) return '';
	return base.endsWith('/') ? base : `${base}/`;
}

/** 本地素材根：强制带前导斜杠、不带尾随斜杠。 */
function normalizeLocalRoot(value) {
	const root = (value ?? '').trim().replace(/\/+$/, '');
	if (!root) throw new Error('localRoot 未配置（src/config/media.mjs）');
	return root.startsWith('/') ? root : `/${root}`;
}

/** decodeURIComponent 在输入本身不合法时会抛错，校验路径不需要因此中断。 */
function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
