/**
 * Artalk v2 REST 客户端（无第三方依赖）。
 *
 * 端点与字段按 artalk@2.9.1 自带的生成式 API 声明对齐；服务端实测为 2.10.1，
 * `/api/v2` 向下兼容。所有响应都是裸 JSON 对象（不包在 { data } 里），
 * stats 系列例外：`GET /stats/:type` 返回 `{ data, msg }`。
 */

export interface ArtalkComment {
	id: number;
	rid: number;
	nick: string;
	email_encrypted: string;
	link: string;
	content: string;
	content_marked: string;
	date: string;
	badge_name: string;
	badge_color: string;
	is_verified: boolean;
	is_pending: boolean;
	is_allow_reply: boolean;
	is_pinned: boolean;
	is_collapsed: boolean;
	visible: boolean;
	page_key: string;
	page_url: string;
	site_name: string;
	vote_up: number;
	vote_down: number;
	ip_region: string;
	ua: string;
	user_id: number;
}

export interface ArtalkPage {
	id: number;
	key: string;
	title: string;
	url: string;
	admin_only: boolean;
	pv: number;
}

export interface CommentListResult {
	comments: ArtalkComment[];
	/** 含回复的评论总数。 */
	count: number;
	/** 根评论总数 —— 嵌套模式下分页以它为准。 */
	roots_count: number;
	page: ArtalkPage;
}

export interface FrontendConf {
	pagination?: { pageSize?: number; readMore?: boolean; autoLoad?: boolean };
	nestMax?: number;
	nestSort?: 'DATE_ASC' | 'DATE_DESC' | 'SRC_INDEX' | 'VOTE_UP_DESC';
	emoticons?: string | unknown[] | false;
	gravatar?: { mirror?: string; params?: string };
	placeholder?: string;
	noComment?: string;
	reqTimeout?: number;
}

export interface ConfResult {
	frontend_conf: FrontendConf;
	version?: { app?: string; version?: string };
}

export interface SubmitPayload {
	content: string;
	name: string;
	email: string;
	link?: string;
	rid: number;
	page_key: string;
	page_title?: string;
	site_name: string;
	ua?: string;
}

/** 后端错误体里可能带 need_captcha / img_data / err_no_site 等指令。 */
export class ArtalkError extends Error {
	readonly payload: Record<string, unknown>;
	readonly status: number;

	constructor(message: string, status: number, payload: Record<string, unknown>) {
		super(message);
		this.name = 'ArtalkError';
		this.status = status;
		this.payload = payload;
	}
}

export class ArtalkApi {
	constructor(
		readonly base: string,
		readonly site: string,
		readonly pageKey: string,
		readonly pageTitle: string,
		private readonly timeout = 15000,
		/** 管理员 token（沿用官方 SDK 存在 localStorage 的 ArtalkUser.token）。 */
		private readonly token = '',
	) {}

	private url(path: string, query: Record<string, string | number | boolean | undefined> = {}): string {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) search.set(key, String(value));
		}
		const suffix = search.size > 0 ? `?${search.toString()}` : '';
		return `${this.base.replace(/\/+$/, '')}/api/v2/${path.replace(/^\/+/, '')}${suffix}`;
	}

	private async request<T>(
		path: string,
		options: { method?: string; body?: unknown; query?: Record<string, string | number | boolean | undefined> } = {},
	): Promise<T> {
		const controller = new AbortController();
		const timer = window.setTimeout(() => controller.abort(), this.timeout);
		try {
			const response = await fetch(this.url(path, options.query), {
				method: options.method ?? 'GET',
				// 与官方 SDK 一致：跨源不带 cookie；dev 走同源代理时会自动带上。
				credentials: 'same-origin',
				headers: {
					...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
					...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
				},
				body: options.body === undefined ? undefined : JSON.stringify(options.body),
				signal: controller.signal,
			});
			const payload: unknown = await response.json().catch(() => ({}));
			const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
			if (!response.ok || record.err_no_site === true) {
				throw new ArtalkError(
					String(record.msg || `请求失败（HTTP ${response.status}）`),
					response.status,
					record,
				);
			}
			return payload as T;
		} catch (error) {
			if (error instanceof ArtalkError) throw error;
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new ArtalkError('请求超时，请检查网络后重试', 408, {});
			}
			throw new ArtalkError(error instanceof Error ? error.message : '网络异常', 0, {});
		} finally {
			window.clearTimeout(timer);
		}
	}

	/** 后端 UI 配置：分页大小、嵌套层数、表情包、Gravatar、文案。 */
	getConf(): Promise<ConfResult> {
		return this.request<ConfResult>('conf');
	}

	getComments(params: { offset: number; limit: number; sortBy?: 'date_asc' | 'date_desc' | 'vote' }): Promise<CommentListResult> {
		return this.request<CommentListResult>('comments', {
			query: {
				page_key: this.pageKey,
				site_name: this.site,
				limit: params.limit,
				offset: params.offset,
				// 嵌套模式：offset 按「根评论」计数，hasMore 用 roots_count 判断。
				flat_mode: false,
				...(params.sortBy ? { sort_by: params.sortBy } : {}),
			},
		});
	}

	createComment(payload: SubmitPayload): Promise<ArtalkComment> {
		return this.request<ArtalkComment>('comments', { method: 'POST', body: payload });
	}

	/** 评论数统计：一次可批量查多个 page_key。 */
	getCommentCounts(pageKeys: string[]): Promise<Record<string, number>> {
		return this.request<{ data?: Record<string, number> }>('stats/page_comment', {
			query: { page_keys: pageKeys.join(','), site_name: this.site },
		}).then((result) => result.data ?? {});
	}

	verifyCaptcha(value: string): Promise<unknown> {
		return this.request('captcha/verify', { method: 'POST', body: { value } });
	}

	/** 刷新图形验证码；返回 base64 图片或需要 iframe 验证的地址。 */
	getCaptcha(): Promise<{ img_data?: string; iframe?: string }> {
		return this.request<{ img_data?: string; iframe?: string }>('captcha');
	}
}
