/**
 * 评论区配置 —— 唯一真源（仅在 SSR / 构建期读取）。
 *
 * ⚠️ 客户端不直接读 import.meta.env：非 PUBLIC_ 变量在浏览器侧会被 Vite 替换成
 * undefined。这里解析好的值统一由 ArtalkComments.astro 写到根节点的 data-* 上，
 * client.ts 只读 dataset，配置和运行时解耦。
 *
 * 与官方 SDK 的关系：本组件**不使用 artalk 的运行时 UI**，而是直接调用它的
 * `/api/v2` REST 接口（GET /conf、GET /comments、POST /comments、
 * GET /stats/page_comment、POST /captcha/verify）。这样评论框能完全使用站点的
 * 主题 token，也不会把 37KB 官方 CSS / 297KB SDK 打进产物。
 */

export const COMMENTS_DEFAULT_SERVER = 'https://artalk.mahoo12138.cn';
/** 后端「站点管理」里注册的名字，必须完全一致；实测该地址已注册此站点。 */
export const COMMENTS_DEFAULT_SITE = 'Mahoo Space';

/** 开发态同源代理前缀：绕开浏览器跨域（后端 CORS 只放行线上域名）。 */
export const COMMENTS_DEV_PROXY = '/artalk-api';

function cleanURL(value: string | undefined, fallback: string): string {
	return (value?.trim() || fallback).replace(/\/+$/, '');
}

function positiveInt(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

const env = import.meta.env;

export interface CommentsConfig {
	/** Artalk 后端地址（不含末尾斜杠）。 */
	server: string;
	/** 站点名。 */
	site: string;
	/** 每页评论数，可被后端 /conf 的 pagination.pageSize 覆盖。 */
	pageSize: number;
	/** 嵌套层数上限，可被后端 /conf 的 nestMax 覆盖。 */
	nestMax: number;
	/** 表情来源：'auto' 跟随后端配置并回退内置、'builtin' 只用内置、false 关闭、URL 远程表情包。 */
	emoticons: string | false;
	/** 空评论文案。 */
	noComment: string;
	/** 输入框占位文案。 */
	placeholder: string;
	/** 单页请求的超时（毫秒）。 */
	timeout: number;
	/** 是否启用（两个必填项都有值即启用；也可显式 ARTALK_DISABLED=1 关闭）。 */
	enabled: boolean;
	/** 实际下发给客户端的 API 基址；dev 走同源代理，build 走绝对地址。 */
	apiBase: string;
}

export const commentsConfig: CommentsConfig = (() => {
	const server = cleanURL(env.ARTALK_SERVER, COMMENTS_DEFAULT_SERVER);
	const site = (env.ARTALK_SITE?.trim() || COMMENTS_DEFAULT_SITE);
	const devProxyEnabled = env.DEV && env.ARTALK_DEV_PROXY !== '0';
	const proxyPath = (env.ARTALK_DEV_PROXY && env.ARTALK_DEV_PROXY !== '1' && env.ARTALK_DEV_PROXY !== '0')
		? env.ARTALK_DEV_PROXY
		: COMMENTS_DEV_PROXY;

	return {
		server,
		site,
		pageSize: positiveInt(env.ARTALK_PAGE_SIZE, 20),
		nestMax: positiveInt(env.ARTALK_NEST_MAX, 2),
		emoticons: env.ARTALK_EMOTICONS === undefined
			? 'auto'
			: (env.ARTALK_EMOTICONS === 'false' ? false : String(env.ARTALK_EMOTICONS)),
		noComment: env.ARTALK_NO_COMMENT || '还没有评论，来聊两句吧',
		placeholder: env.ARTALK_PLACEHOLDER || '写下你的想法…',
		timeout: positiveInt(env.ARTALK_TIMEOUT, 15000),
		enabled: env.ARTALK_DISABLED !== '1' && Boolean(server && site),
		apiBase: devProxyEnabled ? proxyPath : server,
	};
})();
