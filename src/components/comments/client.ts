import * as css from './comments.css';
import { ArtalkApi, ArtalkError, type ArtalkComment, type CommentListResult, type FrontendConf, type SubmitPayload } from './api';
import {
	BUILTIN_EMOTICONS,
	emoticonInsertText,
	imageEmoticonMap,
	resolveEmoticons,
	type EmoticonGroup,
} from './emoticons';
import { commentContent, formatDate, safeLink } from './content';

/**
 * 自定义 Artalk 客户端（无框架 / 无第三方运行时）。
 *
 * 生命周期遵循本站 ClientRouter 约定：模块自执行一次 + astro:page-load 重挂 +
 * astro:before-swap 销毁。评论区进入视口 600px 才发第一个请求，长文章只读前半段
 * 时完全不产生评论相关的网络与解析开销。
 *
 * SSR 只给两行骨架 + 配置 data-*；完整编辑器由本模块的 shellHTML() 注入
 * （共享 chunk 只下载一份，不必复制进 128 篇 HTML）。接管后立刻补回骨架，
 * 因此从 SSR 到客户端接管之间没有高度跳变。
 */

const LOCAL_USER_KEY = 'ArtalkUser'; // 与官方 SDK 共用，换组件不丢昵称
const EMPTY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M8 9h8M8 12h5"/></svg>';

type SortBy = 'date_desc' | 'date_asc' | 'vote';
/** 一次提交来自顶层编辑器还是评论下方的回复专用输入区。 */
type Source = 'root' | 'reply';
type Tone = 'info' | 'error' | 'success';
interface Notice {
	text: string;
	tone: Tone;
	needLogin?: boolean;
}

interface ClientConfig {
	server: string;
	site: string;
	pageKey: string;
	pageTitle: string;
	pageSize: number;
	nestMax: number;
	timeout: number;
	emoticons: string | false;
	noComment: string;
	placeholder: string;
}

interface LocalUser {
	name: string;
	email: string;
	link: string;
	token?: string;
}

interface Refs {
	form: HTMLFormElement;
	nameInput: HTMLInputElement;
	emailInput: HTMLInputElement;
	linkInput: HTMLInputElement;
	textarea: HTMLTextAreaElement;
	submitButton: HTMLButtonElement;
	notice: HTMLElement;
	sortButton: HTMLButtonElement;
	emojiAnchor: HTMLElement;
	emojiToggle: HTMLButtonElement;
	emojiPanel: HTMLElement;
	count: HTMLElement;
	listMeta: HTMLElement;
	list: HTMLElement;
	footer: HTMLElement;
	loadMore: HTMLButtonElement;
	pagerText: HTMLElement;
	captcha: HTMLElement;
	captchaImage: HTMLImageElement;
	captchaInput: HTMLInputElement;
	captchaError: HTMLElement;
	captchaCancel: HTMLButtonElement;
	captchaConfirm: HTMLButtonElement;
	login: HTMLElement;
	loginEmail: HTMLInputElement;
	loginPassword: HTMLInputElement;
	loginError: HTMLElement;
	loginCaptcha: HTMLElement;
	loginCaptchaImage: HTMLImageElement;
	loginCaptchaInput: HTMLInputElement;
	loginCancel: HTMLButtonElement;
	loginConfirm: HTMLButtonElement;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function int(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function readConfig(root: HTMLElement): ClientConfig {
	const data = root.dataset;
	return {
		server: data.server ?? '',
		site: data.site ?? '',
		pageKey: data.pageKey || location.pathname,
		pageTitle: data.pageTitle || document.title,
		pageSize: int(data.pageSize, 20),
		nestMax: int(data.nestMax, 2),
		timeout: int(data.timeout, 15000),
		emoticons: data.emoticons === undefined || data.emoticons === '' || data.emoticons === 'auto'
			? 'auto'
			: (data.emoticons === 'false' ? false : data.emoticons),
		noComment: data.noComment || '还没有评论，来聊两句吧',
		placeholder: data.placeholder || '写下你的想法…',
	};
}

function readUser(): LocalUser {
	try {
		const raw = JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || '{}') as Record<string, unknown>;
		return {
			name: String(raw.name || raw.nick || ''),
			email: String(raw.email || ''),
			link: String(raw.link || ''),
			token: typeof raw.token === 'string' ? raw.token : '',
		};
	} catch {
		return { name: '', email: '', link: '' };
	}
}

function saveUser(user: LocalUser): void {
	const previous = readUser();
	try {
		localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ ...previous, ...user }));
	} catch { /* 隐私模式下忽略 */ }
}

/**
 * 完整界面模板。全部是静态标记（没有任何用户数据），由共享 JS chunk 注入，
 * 避免把同一份表单复制进 128 篇文章的 HTML。
 */
function shellHTML(): string {
	return `
<header class="${css.header}"><div><h2 class="${css.heading}">评论<span class="${css.count}" data-role="count" aria-label="评论数">···</span></h2></div><div class="${css.headActions}"><button type="button" class="${css.ghostButton}" data-role="sort" aria-pressed="false">最早在前</button></div></header>
<div class="${css.editor}"><form data-role="form" novalidate><div class="${css.identityRow}"><input class="${css.input}" data-role="name" name="name" type="text" placeholder="昵称 *" required autocomplete="nickname"><input class="${css.input}" data-role="email" name="email" type="email" placeholder="邮箱 *" required autocomplete="email"><input class="${css.input}" data-role="link" name="link" type="url" placeholder="网站（可选）" autocomplete="url"></div><div class="${css.composer}"><textarea class="${css.textarea}" data-role="content" name="content" rows="4" required></textarea><div class="${css.toolbar}"><div class="${css.toolbarLeft}"><div class="${css.emojiAnchor}" data-role="emoji-anchor"><button type="button" class="${css.ghostButton}" data-role="emoji-toggle" aria-expanded="false" aria-label="插入表情">☺ 表情</button><div class="${css.emojiPanel}" data-role="emoji-panel" data-open="false" aria-label="表情选择"></div></div></div><button type="submit" class="${css.primaryButton}" data-role="submit">发送</button></div></div></form><p class="${css.notice}" data-role="notice" role="status" aria-live="polite"></p></div>
<div class="${css.listHeader}"><span class="${css.listTitle}">全部评论</span><span class="${css.listMeta}" data-role="list-meta"></span></div>
<div class="${css.list}" data-role="list" aria-busy="true" aria-live="polite"></div>
<div class="${css.footer}" data-role="footer"><button type="button" class="${css.loadMore}" data-role="load-more" hidden>加载更多</button><span class="${css.pagerText}" data-role="pager-text"></span></div>
<div class="${css.captchaOverlay}" data-role="captcha" data-open="false" aria-hidden="true"><div class="${css.captchaCard}" role="dialog" aria-modal="true" aria-label="人机验证"><h3 class="${css.captchaTitle}">请先完成验证</h3><div class="${css.captchaRow}"><img class="${css.captchaRowImage}" data-role="captcha-img" alt="验证码，点击可刷新"><input class="${css.captchaRowInput}" data-role="captcha-input" type="text" placeholder="输入验证码" autocomplete="off"></div><p class="${css.notice}" data-role="captcha-error" aria-live="polite"></p><div class="${css.captchaActions}"><button type="button" class="${css.ghostButton}" data-role="captcha-cancel">取消</button><button type="button" class="${css.primaryButton}" data-role="captcha-confirm">确认</button></div></div></div>
<div class="${css.captchaOverlay}" data-role="login" data-open="false" aria-hidden="true"><div class="${css.captchaCard}" role="dialog" aria-modal="true" aria-label="管理员登录"><h3 class="${css.captchaTitle}">管理员登录</h3><div class="${css.loginFields}"><input class="${css.input}" data-role="login-email" type="email" placeholder="管理员邮箱" autocomplete="username"><input class="${css.input}" data-role="login-password" type="password" placeholder="密码" autocomplete="current-password"></div><div class="${css.captchaRow}" data-role="login-captcha" hidden><img class="${css.captchaRowImage}" data-role="login-captcha-img" alt="验证码，点击可刷新"><input class="${css.captchaRowInput}" data-role="login-captcha-input" type="text" placeholder="输入图中字符" autocomplete="off"></div><p class="${css.notice}" data-role="login-error" role="alert" aria-live="polite"></p><div class="${css.captchaActions}"><button type="button" class="${css.ghostButton}" data-role="login-cancel">取消</button><button type="button" class="${css.primaryButton}" data-role="login-confirm">登录并重试</button></div></div></div>`;
}

class CommentsClient {
	private readonly config: ClientConfig;
	private readonly api: ArtalkApi;
	private readonly refs: Refs;
	private readonly user: LocalUser;

	private comments: ArtalkComment[] = [];
	private rootsCount = 0;
	private total = 0;
	private offset = 0;
	private pageSize: number;
	private nestMax: number;
	private sortBy: SortBy = 'date_desc';
	private autoLoad = true;
	private loaded = false;
	private loading = false;
	private submitting = false;
	private destroyed = false;
	private error: string | null = null;
	/** 当前展开「回复专用输入区」的目标评论；顶层编辑器不再读它。 */
	private replyTo: ArtalkComment | null = null;
	private replyDraft = '';
	private replyNotice: Notice = { text: '', tone: 'info' };
	/** 回复区是列表的一部分，render() 会重建列表，这几个引用每次重建后刷新。 */
	private replyTextarea: HTMLTextAreaElement | null = null;
	private replyNoticeEl: HTMLElement | null = null;
	private replySubmitButton: HTMLButtonElement | null = null;
	private freshId: number | null = null;
	private pageAdminOnly = false;
	private emoticons: EmoticonGroup[] = BUILTIN_EMOTICONS;
	private imageMap = new Map<string, string>();
	private activeEmojiGroup = 0;
	/** 面板只建一次，切分组时只换网格内容（重建会让点击目标脱离文档）。 */
	private emojiTabsEl: HTMLElement | null = null;
	private emojiGridEl: HTMLElement | null = null;
	/** 表情面板是单实例：打开回复区时临时挂到回复区的 anchor 下。 */
	private emojiArea: HTMLTextAreaElement | null = null;
	private emojiToggleEl: HTMLButtonElement | null = null;
	private conf: FrontendConf = {};
	private observer: IntersectionObserver | null = null;
	private scrollFrame = 0;
	private pendingSubmit: SubmitPayload | null = null;
	private pendingSource: Source = 'root';
	/** 登录接口同样受 LimiterGuard 保护，need_captcha 时展开弹层内的验证码。 */
	private loginCaptchaRequired = false;
	private readonly loginLink: HTMLButtonElement;
	private readonly onDocumentClick = (event: MouseEvent): void => {
		const target = event.target;
		// 面板内部重渲染会让被点中的节点脱离文档，此时 contains() 为 false，
		// 会被误判成「点了外面」而关闭面板 —— 先排除已断开的目标。
		if (!(target instanceof Node) || !target.isConnected) return;
		const inPanel = this.refs.emojiPanel.contains(target);
		const inToggle = this.refs.emojiToggle.contains(target)
			|| (this.emojiToggleEl !== null && this.emojiToggleEl.contains(target));
		if (!inPanel && !inToggle) this.closeEmojiPanel();
	};

	constructor(private readonly root: HTMLElement) {
		this.config = readConfig(root);
		this.user = readUser();
		this.pageSize = this.config.pageSize;
		this.nestMax = this.config.nestMax;
		this.api = new ArtalkApi(
			this.config.server,
			this.config.site,
			this.config.pageKey,
			this.config.pageTitle,
			this.config.timeout,
			this.user.token ?? '',
		);
		root.innerHTML = shellHTML();
		this.refs = this.collectRefs();
		// 单实例动作链接：need_login 时移动到出错那块提示里（顶层或回复区）。
		this.loginLink = el('button', css.inlineAction, '管理员登录');
		this.loginLink.type = 'button';
		this.loginLink.addEventListener('click', () => this.openLogin());
		this.refs.count.dataset.commentCount = this.config.pageKey;
		this.prefillUser();
		this.bindEvents();
		this.renderInitial();
		// 内置表情先就位，远程表情包在后台升级，面板永远不会是空的。
		if (this.config.emoticons !== false) this.renderEmojiPanel();
		this.lazyBoot();
	}

	private collectRefs(): Refs {
		const pick = <T extends HTMLElement>(role: string): T => {
			const node = this.root.querySelector<T>(`[data-role="${role}"]`);
			if (!node) throw new Error(`评论区缺少节点：${role}`);
			return node;
		};
		return {
			form: pick<HTMLFormElement>('form'),
			nameInput: pick<HTMLInputElement>('name'),
			emailInput: pick<HTMLInputElement>('email'),
			linkInput: pick<HTMLInputElement>('link'),
			textarea: pick<HTMLTextAreaElement>('content'),
			submitButton: pick<HTMLButtonElement>('submit'),
			notice: pick('notice'),
			sortButton: pick<HTMLButtonElement>('sort'),
			emojiAnchor: pick('emoji-anchor'),
			emojiToggle: pick<HTMLButtonElement>('emoji-toggle'),
			emojiPanel: pick('emoji-panel'),
			count: pick('count'),
			listMeta: pick('list-meta'),
			list: pick('list'),
			footer: pick('footer'),
			loadMore: pick<HTMLButtonElement>('load-more'),
			pagerText: pick('pager-text'),
			captcha: pick('captcha'),
			captchaImage: pick<HTMLImageElement>('captcha-img'),
			captchaInput: pick<HTMLInputElement>('captcha-input'),
			captchaError: pick('captcha-error'),
			captchaCancel: pick<HTMLButtonElement>('captcha-cancel'),
			captchaConfirm: pick<HTMLButtonElement>('captcha-confirm'),
			login: pick('login'),
			loginEmail: pick<HTMLInputElement>('login-email'),
			loginPassword: pick<HTMLInputElement>('login-password'),
			loginError: pick('login-error'),
			loginCaptcha: pick('login-captcha'),
			loginCaptchaImage: pick<HTMLImageElement>('login-captcha-img'),
			loginCaptchaInput: pick<HTMLInputElement>('login-captcha-input'),
			loginCancel: pick<HTMLButtonElement>('login-cancel'),
			loginConfirm: pick<HTMLButtonElement>('login-confirm'),
		};
	}

	private prefillUser(): void {
		this.refs.nameInput.value = this.user.name;
		this.refs.emailInput.value = this.user.email;
		this.refs.linkInput.value = this.user.link;
		if (!this.refs.textarea.placeholder) this.refs.textarea.placeholder = this.config.placeholder;
	}

	/** 注入模板后立刻补回骨架，保持 SSR 与客户端接管之间没有高度跳变。 */
	private renderInitial(): void {
		this.loading = true;
		this.render();
		this.loading = false;
	}

	/** 评论区接近视口再发第一个请求。 */
	private lazyBoot(): void {
		if ('IntersectionObserver' in window) {
			this.observer = new IntersectionObserver((entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !this.loaded && !this.loading) {
					this.observer?.disconnect();
					this.observer = null;
					void this.load();
				}
			}, { rootMargin: '600px' });
			this.observer.observe(this.root);
		} else {
			void this.load();
		}
	}

	private async load(): Promise<void> {
		if (this.destroyed) return;
		this.loading = true;
		this.render();

		// 后端配置决定分页 / 嵌套 / 文案 / 表情；失败时一律用站点侧默认值。
		try {
			const result = await this.api.getConf();
			this.conf = result.frontend_conf ?? {};
			this.applyConf(this.conf);
		} catch {
			this.conf = {};
		}
		if (this.destroyed) return;

		// 评论列表先渲染：远程表情包可能指向慢 CDN，不能让它挡住正文内容。
		const list = await this.api.getComments({ offset: 0, limit: this.pageSize, sortBy: this.sortBy })
			.then((data) => ({ ok: true as const, data }))
			.catch((err: unknown) => ({ ok: false as const, message: err instanceof Error ? err.message : '加载失败' }));
		if (this.destroyed) return;

		this.loading = false;
		this.loaded = true;
		if (list.ok) {
			this.error = null;
			this.applyList(list.data, false);
		} else {
			this.error = list.message;
			this.render();
		}
		void this.syncCountWidgets();
		if (this.autoLoad) requestAnimationFrame(() => this.maybeAutoLoad());

		// 表情包到位后再补渲染一次，让历史评论里的 :[key] 短码变成图片。
		void resolveEmoticons(this.config.emoticons, this.conf.emoticons).then((groups) => {
			if (this.destroyed) return;
			this.emoticons = groups;
			this.imageMap = imageEmoticonMap(groups);
			this.renderEmojiPanel();
			if (this.comments.length > 0) this.render();
		});
	}

	private applyConf(conf: FrontendConf): void {
		this.pageSize = int(String(conf.pagination?.pageSize ?? ''), this.pageSize);
		this.nestMax = int(String(conf.nestMax ?? ''), this.nestMax);
		this.autoLoad = conf.pagination?.autoLoad !== false && conf.pagination?.readMore !== false;
		if (conf.placeholder) this.refs.textarea.placeholder = conf.placeholder;
		if (conf.noComment) this.config.noComment = conf.noComment;
	}

	private applyList(data: CommentListResult, append: boolean): void {
		this.rootsCount = data.roots_count ?? 0;
		this.total = data.count ?? 0;
		// 后端页面级「仅管理员可评论」标记，用于把 need_login 解释成准确文案。
		this.pageAdminOnly = data.page?.admin_only === true;
		if (append) {
			const known = new Set(this.comments.map((item) => item.id));
			for (const comment of data.comments) if (!known.has(comment.id)) this.comments.push(comment);
		} else {
			this.comments = [...data.comments];
			this.offset = 0;
		}
		this.render();
	}

	private hasMore(): boolean {
		return this.rootsCount > this.offset + this.pageSize;
	}

	private async fetchPage(offset: number): Promise<void> {
		if (this.loading || this.destroyed) return;
		this.loading = true;
		this.refs.loadMore.disabled = true;
		this.refs.loadMore.textContent = '正在加载…';
		try {
			const data = await this.api.getComments({ offset, limit: this.pageSize, sortBy: this.sortBy });
			if (this.destroyed) return;
			this.offset = offset;
			this.error = null;
			this.applyList(data, offset > 0);
			void this.syncCountWidgets();
			if (this.autoLoad) requestAnimationFrame(() => this.maybeAutoLoad());
		} catch (err) {
			if (this.destroyed) return;
			this.error = err instanceof Error ? err.message : '加载失败';
			this.render();
		} finally {
			this.loading = false;
			this.refs.loadMore.disabled = false;
			this.refs.loadMore.textContent = '加载更多';
			this.updateFooter();
		}
	}

	private async reload(): Promise<void> {
		this.loading = true;
		this.render();
		try {
			const data = await this.api.getComments({ offset: 0, limit: this.pageSize, sortBy: this.sortBy });
			this.loading = false;
			if (this.destroyed) return;
			this.error = null;
			this.applyList(data, false);
		} catch (err) {
			this.loading = false;
			if (this.destroyed) return;
			this.error = err instanceof Error ? err.message : '加载失败';
			this.render();
		}
	}

	/* ── 渲染 ─────────────────────────────────────────────────────────── */

	/** 顶层编辑器与回复区各写各的提示，互不覆盖。 */
	private showNoticeFor(source: Source, message: string, tone: Tone, needLogin = false): void {
		const host = source === 'reply' ? this.replyNoticeEl : this.refs.notice;
		if (!host) return;
		if (source === 'reply') this.replyNotice = { text: message, tone, needLogin };
		host.textContent = message;
		host.dataset.tone = tone;
		// 单实例链接：need_login 时挂到出错的那一块提示里，其它情况一律摘掉。
		if (needLogin) host.append(' ', this.loginLink);
		else this.loginLink.remove();
	}

	private render(): void {
		// 列表重绘会销毁回复区；若表情面板此刻挂在回复区里，先归还给顶层 anchor，
		// 否则面板会随列表一起消失（顶层面板宿主不变，不受影响）。
		this.ensureEmojiHost();
		this.replyTextarea = null;
		this.replyNoticeEl = null;
		this.replySubmitButton = null;
		this.refs.list.replaceChildren();
		this.refs.list.setAttribute('aria-busy', String(this.loading && this.comments.length === 0));

		if (this.loading && this.comments.length === 0) {
			for (let i = 0; i < 3; i += 1) this.refs.list.append(this.skeletonRow(i));
		} else if (this.error && this.comments.length === 0) {
			this.refs.list.append(this.errorNode());
		} else if (this.comments.length === 0) {
			this.refs.list.append(this.emptyNode());
		} else {
			this.renderTree();
		}

		this.refs.count.textContent = this.loaded ? String(this.total) : '···';
		this.refs.count.setAttribute('aria-label', this.loaded ? `共 ${this.total} 条评论` : '评论数加载中');
		const shown = this.comments.filter((item) => item.visible !== false).length;
		this.refs.listMeta.textContent = this.total > 0 ? `共 ${this.total} 条 · 已加载 ${shown} 条` : '';
		this.updateFooter();
	}

	private skeletonRow(index: number): HTMLElement {
		const row = el('div', css.skeletonRow);
		row.setAttribute('aria-hidden', 'true');
		row.append(el('div', css.skeletonAvatar));
		const body = el('div', css.skeletonBody);
		const widths = index === 0 ? ['38%', '92%', '70%'] : ['28%', '86%'];
		for (const width of widths) {
			const line = el('div', css.skeletonLine);
			line.style.width = width;
			body.append(line);
		}
		row.append(body);
		return row;
	}

	private emptyNode(): HTMLElement {
		const box = el('div', css.empty);
		const icon = el('div', css.emptyIcon);
		icon.innerHTML = EMPTY_ICON;
		box.append(icon, el('p', css.emptyTitle, '这里还很安静'), el('p', css.emptyText, this.config.noComment));
		return box;
	}

	private errorNode(): HTMLElement {
		const box = el('div', css.errorState);
		const icon = el('div', css.emptyIcon);
		icon.innerHTML = EMPTY_ICON;
		const text = el('p', css.emptyText, this.error ?? '评论加载失败');
		const retry = el('button', css.ghostButton, '重新加载');
		retry.type = 'button';
		retry.addEventListener('click', () => { this.error = null; void this.reload(); });
		box.append(icon, el('p', css.emptyTitle, '评论没能加载'), text, retry);
		return box;
	}

	private avatarNode(comment: ArtalkComment): HTMLElement {
		const box = el('div', css.avatar);
		const fallback = el('span', undefined, (comment.nick || '匿').trim().charAt(0).toUpperCase());
		box.append(fallback);
		const mirror = this.conf.gravatar?.mirror;
		const hash = comment.email_encrypted;
		if (mirror && hash) {
			const params = this.conf.gravatar?.params?.replace(/^\?/, '') || 'd=404&s=80';
			const img = el('img', css.avatarImg);
			img.alt = '';
			img.loading = 'lazy';
			img.referrerPolicy = 'no-referrer';
			img.src = `${mirror.replace(/\/$/, '')}/${hash}?${params}`;
			img.addEventListener('error', () => img.remove(), { once: true });
			box.append(img);
		}
		return box;
	}

	private commentNode(comment: ArtalkComment, parentNick: string | null): HTMLElement {
		const node = el('article', css.comment);
		node.dataset.commentId = String(comment.id);
		if (this.freshId === comment.id) node.dataset.fresh = 'true';

		const line = el('div', css.commentLine);
		line.append(this.avatarNode(comment));

		const body = el('div', css.commentBody);
		const meta = el('div', css.commentMeta);
		const link = safeLink(comment.link);
		const nick = el(link ? 'a' : 'span', css.commentNick, comment.nick || '匿名');
		if (link && nick instanceof HTMLAnchorElement) {
			nick.href = link;
			nick.target = '_blank';
			nick.rel = 'noopener noreferrer nofollow';
		}
		meta.append(nick);
		if (comment.badge_name) {
			const badge = el('span', css.commentBadge, comment.badge_name);
			if (/^#[0-9a-f]{3,8}$/i.test(comment.badge_color)) badge.style.color = comment.badge_color;
			meta.append(badge);
		}
		const date = formatDate(comment.date);
		if (date) {
			const time = el('time', undefined, date);
			time.dateTime = comment.date.replace(' ', 'T');
			meta.append(time);
		}
		if (comment.ip_region) meta.append(el('span', undefined, comment.ip_region));
		if (comment.is_pending) meta.append(el('span', css.commentPending, '待审核'));
		if (comment.is_pinned) meta.append(el('span', css.commentBadge, '置顶'));
		body.append(meta);

		if (parentNick) body.append(el('p', css.commentReplyTo, `回复 @${parentNick}`));

		const content = el('div', css.commentContent);
		content.append(commentContent(comment, this.imageMap));
		body.append(content);

		const actions = el('div', css.commentActions);
		const reply = el('button', css.replyButton, '回复');
		reply.type = 'button';
		reply.setAttribute('aria-label', `回复 ${comment.nick || '匿名'}`);
		reply.disabled = comment.is_allow_reply === false || comment.is_collapsed === true;
		reply.addEventListener('click', () => this.setReply(comment));
		actions.append(reply);
		body.append(actions);

		line.append(body);
		node.append(line);
		return node;
	}

	/**
	 * 回复专用输入区：自己的 textarea / 提交按钮 / 就地提示。
	 * 昵称、邮箱、网站只读顶层资料栏（谁也不想填两次），但输入区、清空与反馈完全独立。
	 */
	private buildReplyComposer(comment: ArtalkComment): HTMLElement {
		const target = comment.nick || '匿名';
		const wrap = el('div', css.replyComposer);
		wrap.dataset.role = 'reply-composer';

		const bar = el('div', css.replyBar);
		bar.append(el('span', undefined, `回复 @${target}`));
		const cancel = el('button', css.ghostButton, '取消');
		cancel.type = 'button';
		cancel.addEventListener('click', () => this.setReply(null));
		bar.append(cancel);
		wrap.append(bar);

		const form = el('form');
		form.noValidate = true;
		const composer = el('div', css.composer);
		const area = el('textarea', css.replyTextarea);
		area.rows = 2;
		area.value = this.replyDraft;
		area.placeholder = `回复 @${target}…`;
		area.setAttribute('aria-label', `回复 ${target} 的内容`);
		area.addEventListener('input', () => {
			this.replyDraft = area.value;
			this.autoGrow(area);
		});

		const toolbar = el('div', css.toolbar);
		const left = el('div', css.toolbarLeft);
		if (this.config.emoticons !== false) {
			const anchor = el('div', css.emojiAnchor);
			const toggle = el('button', css.ghostButton, '☺ 表情');
			toggle.type = 'button';
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('aria-label', '插入表情');
			toggle.addEventListener('click', () => this.toggleEmoji(anchor, toggle, area));
			anchor.append(toggle);
			left.append(anchor);
		}
		const submit = el('button', css.primaryButton, '发送回复');
		submit.type = 'submit';
		toolbar.append(left, submit);
		composer.append(area, toolbar);
		form.append(composer);
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			void this.submitReply();
		});
		wrap.append(form);

		const notice = el('p', css.notice);
		notice.dataset.role = 'reply-notice';
		notice.setAttribute('role', 'status');
		notice.setAttribute('aria-live', 'polite');
		notice.textContent = this.replyNotice.text;
		notice.dataset.tone = this.replyNotice.tone;
		if (this.replyNotice.needLogin) notice.append(' ', this.loginLink);
		wrap.append(notice);

		this.replyTextarea = area;
		this.replyNoticeEl = notice;
		this.replySubmitButton = submit;
		return wrap;
	}

	private renderTree(): void {
		const byId = new Map(this.comments.map((item) => [item.id, item]));
		const childrenOf = new Map<number, ArtalkComment[]>();
		const roots: ArtalkComment[] = [];
		for (const comment of this.comments) {
			if (comment.visible === false) continue;
			if (comment.rid !== 0 && byId.has(comment.rid)) {
				const list = childrenOf.get(comment.rid) ?? [];
				list.push(comment);
				childrenOf.set(comment.rid, list);
			} else {
				roots.push(comment);
			}
		}
		const byDateAsc = (a: ArtalkComment, b: ArtalkComment) =>
			new Date(a.date.replace(' ', 'T')).getTime() - new Date(b.date.replace(' ', 'T')).getTime();
		for (const list of childrenOf.values()) list.sort(byDateAsc);

		const walk = (comment: ArtalkComment, depth: number, container: HTMLElement, chain: Set<number>): void => {
			const parentName = comment.rid !== 0 ? (byId.get(comment.rid)?.nick ?? null) : null;
			const node = this.commentNode(comment, parentName);
			container.append(node);
			// 回复专用输入区紧贴被回复评论，不复用、也不改动顶层编辑器。
			if (this.replyTo?.id === comment.id) node.append(this.buildReplyComposer(comment));
			const kids = childrenOf.get(comment.id) ?? [];
			if (kids.length === 0 || chain.has(comment.id)) return;
			const nextChain = new Set(chain).add(comment.id);
			// 超过 nestMax 不再缩进：把深层回复平铺到同一层，靠「回复 @xxx」保留语义。
			if (depth + 1 <= this.nestMax) {
				const box = el('div', css.children);
				node.append(box);
				for (const child of kids) walk(child, depth + 1, box, nextChain);
			} else {
				for (const child of kids) walk(child, depth, container, nextChain);
			}
		};
		for (const root of roots) walk(root, 1, this.refs.list, new Set<number>());

		if (this.freshId !== null) {
			const fresh = this.refs.list.querySelector<HTMLElement>(`[data-comment-id="${this.freshId}"]`);
			fresh?.scrollIntoView({ block: 'center', behavior: 'smooth' });
			this.freshId = null;
		}
	}

	private updateFooter(): void {
		const more = this.hasMore() && !this.error;
		this.refs.loadMore.hidden = !more;
		this.refs.pagerText.textContent = this.comments.length > 0
			? (more ? `已显示 ${this.offset + this.pageSize > this.rootsCount ? this.rootsCount : this.offset + this.pageSize} / ${this.rootsCount} 条主评论` : '已经到底了')
			: '';
	}

	/* ── 表情 ─────────────────────────────────────────────────────────── */

	private renderEmojiPanel(): void {
		this.refs.emojiPanel.replaceChildren();
		this.emojiTabsEl = null;
		this.emojiGridEl = null;
		if (this.emoticons.length === 0) {
			this.refs.emojiToggle.hidden = true;
			return;
		}
		this.refs.emojiToggle.hidden = false;
		this.activeEmojiGroup = Math.min(this.activeEmojiGroup, this.emoticons.length - 1);

		const tabs = el('div', css.emojiTabs);
		tabs.setAttribute('role', 'tablist');
		this.emoticons.forEach((grp, index) => {
			const tab = el('button', css.emojiTab, grp.name);
			tab.type = 'button';
			tab.setAttribute('role', 'tab');
			// 切分组只换内容、不重建 tab：重建会让被点中的节点脱离文档，
			// document 的「点到外面就关闭」随后就把它当成外部点击，弹窗被自己关掉。
			tab.addEventListener('click', () => this.selectEmojiGroup(index));
			tabs.append(tab);
		});

		this.emojiTabsEl = tabs;
		this.emojiGridEl = el('div', css.emojiGrid);
		this.refs.emojiPanel.append(tabs, this.emojiGridEl);
		this.selectEmojiGroup(this.activeEmojiGroup);
	}

	private selectEmojiGroup(index: number): void {
		this.activeEmojiGroup = index;
		const grp = this.emoticons[index];
		const grid = this.emojiGridEl;
		if (!grp || !grid) return;

		this.emojiTabsEl?.querySelectorAll('[role="tab"]').forEach((node, i) => {
			node.setAttribute('aria-selected', String(i === index));
		});

		// 颜文字是 6–14 字符宽的文本，emoji 是单个字形：方格排法会把前者折行糊成一团，
		// 两套布局分开走（text 用按内容宽度流式排布的小胶囊）。
		const isText = grp.type === 'emoticon';
		grid.className = isText ? css.emojiGridText : css.emojiGrid;

		const buttons: HTMLButtonElement[] = [];
		for (const item of grp.items) {
			const button = el('button', isText ? css.emojiItemText : css.emojiItem);
			button.type = 'button';
			if (grp.type === 'image') {
				const img = el('img', css.emojiImage);
				img.src = item.val;
				img.alt = item.key;
				img.loading = 'lazy';
				button.title = item.key;
				button.setAttribute('aria-label', item.key);
				button.append(img);
			} else {
				// 文本本身即无障碍名称，不再叠一层 aria-label / title。
				button.textContent = item.val;
			}
			button.addEventListener('click', () => {
				// 面板当前挂在哪块编辑器下，就往那块 textarea 插入表情。
				this.insertAtCaret(emoticonInsertText(grp, item), this.emojiArea ?? this.refs.textarea);
				this.closeEmojiPanel();
			});
			buttons.push(button);
		}
		grid.replaceChildren(...buttons);
		grid.scrollTop = 0;
	}

	/** 随内容增高（到上限后内部滚动），替代右下角那个压住「发送」的原生缩放手柄。 */
	private autoGrow(area: HTMLTextAreaElement = this.refs.textarea): void {
		const max = 248;
		area.style.height = 'auto';
		const next = Math.min(area.scrollHeight, max);
		area.style.height = `${next}px`;
		area.style.overflowY = area.scrollHeight > max ? 'auto' : 'hidden';
	}

	private insertAtCaret(text: string, area: HTMLTextAreaElement): void {
		const start = area.selectionStart ?? area.value.length;
		const end = area.selectionEnd ?? area.value.length;
		area.value = `${area.value.slice(0, start)}${text}${area.value.slice(end)}`;
		this.autoGrow();
		const caret = start + text.length;
		area.focus();
		area.setSelectionRange(caret, caret);
	}

	/**
	 * 表情面板是全组件唯一实例：打开回复区时临时挂到回复区的 anchor，
	 * 关闭或列表重绘时归还顶层 anchor，避免它随被销毁的回复区一起消失。
	 */
	private toggleEmoji(anchor: HTMLElement, toggle: HTMLButtonElement, area: HTMLTextAreaElement): void {
		const panel = this.refs.emojiPanel;
		if (panel.dataset.open === 'true' && this.emojiToggleEl === toggle) {
			this.closeEmojiPanel();
			return;
		}
		this.closeEmojiPanel();
		if (panel.parentElement !== anchor) anchor.append(panel);
		this.emojiArea = area;
		this.emojiToggleEl = toggle;
		panel.dataset.open = 'true';
		toggle.setAttribute('aria-expanded', 'true');
	}

	private ensureEmojiHost(): void {
		if (this.refs.emojiPanel.parentElement !== this.refs.emojiAnchor) this.closeEmojiPanel();
	}

	private closeEmojiPanel(): void {
		const panel = this.refs.emojiPanel;
		panel.dataset.open = 'false';
		this.refs.emojiToggle.setAttribute('aria-expanded', 'false');
		this.emojiToggleEl?.setAttribute('aria-expanded', 'false');
		if (panel.parentElement !== this.refs.emojiAnchor) this.refs.emojiAnchor.append(panel);
		this.emojiArea = null;
		this.emojiToggleEl = null;
	}

	/* ── 交互 ─────────────────────────────────────────────────────────── */

	private setReply(comment: ArtalkComment | null): void {
		// 同一时刻只保留一个回复区；切换/关闭目标即丢弃该回复区的草稿与提示。
		// 顶层编辑器的内容和提示完全不参与这里的状态。
		this.replyTo = comment;
		this.replyDraft = '';
		this.replyNotice = { text: '', tone: 'info' };
		this.closeEmojiPanel();
		this.render();
		if (comment) this.replyTextarea?.focus();
	}

	private onScroll = (): void => {
		if (this.scrollFrame) return;
		this.scrollFrame = requestAnimationFrame(() => {
			this.scrollFrame = 0;
			this.maybeAutoLoad();
		});
	};

	private maybeAutoLoad(): void {
		if (!this.autoLoad || !this.loaded || this.loading || !this.hasMore() || this.destroyed) return;
		const rect = this.refs.footer.getBoundingClientRect();
		if (rect.top < window.innerHeight + 200) void this.fetchPage(this.offset + this.pageSize);
	}

	private bindEvents(): void {
		this.refs.form.addEventListener('submit', (event) => {
			event.preventDefault();
			void this.submit();
		});
		this.refs.textarea.addEventListener('input', () => this.autoGrow());
		this.refs.sortButton.addEventListener('click', () => {
			this.sortBy = this.sortBy === 'date_desc' ? 'date_asc' : 'date_desc';
			this.refs.sortButton.textContent = this.sortBy === 'date_desc' ? '最早在前' : '最新在前';
			this.refs.sortButton.setAttribute('aria-pressed', String(this.sortBy === 'date_asc'));
			this.comments = [];
			this.error = null;
			void this.reload();
		});
		this.refs.emojiToggle.addEventListener('click', () => {
			this.toggleEmoji(this.refs.emojiAnchor, this.refs.emojiToggle, this.refs.textarea);
		});
		document.addEventListener('click', this.onDocumentClick);
		this.refs.loadMore.addEventListener('click', () => void this.fetchPage(this.offset + this.pageSize));
		window.addEventListener('scroll', this.onScroll, { passive: true });
		this.bindCaptcha();
		this.bindLogin();
	}

	/**
	 * 顶层编辑器只发根评论（rid = 0）。回复有自己的输入区与提交路径，
	 * 所以这里的草稿、提示、按钮状态永远不会被回复流程改写。
	 */
	private async submit(): Promise<void> {
		if (this.submitting) return;
		if (!this.refs.form.reportValidity()) return;
		const content = this.refs.textarea.value.trim();
		if (!content) {
			this.showNoticeFor('root', '写点什么再发送吧', 'error');
			this.refs.textarea.focus();
			return;
		}
		await this.doSubmit(this.buildPayload(content, 0), true, 'root');
	}

	/** 回复专用输入区的提交路径：rid 取父评论 id，页面上下文一律取当前页配置。 */
	private async submitReply(): Promise<void> {
		if (this.submitting || !this.replyTo) return;
		const content = (this.replyTextarea?.value ?? '').trim();
		if (!content) {
			this.showNoticeFor('reply', '写点什么再发送吧', 'error');
			this.replyTextarea?.focus();
			return;
		}
		if (!this.refs.nameInput.value.trim() || !this.refs.emailInput.value.trim()) {
			this.showNoticeFor('reply', '请先在上方资料栏填写昵称和邮箱，再发送回复', 'error');
			this.refs.nameInput.focus();
			return;
		}
		await this.doSubmit(this.buildPayload(content, this.replyTo.id), true, 'reply');
	}

	/**
	 * 完整报文的唯一构造点。Artalk v2 会校验 parentComment.PageKey === p.PageKey，
	 * 所以回复绝不能继承父评论的 page_key / site_name（跨页评论会 400）；
	 * 页面上下文固定取当前页配置，rid 只决定父评论。
	 */
	private buildPayload(content: string, rid: number): SubmitPayload {
		return {
			content,
			name: this.refs.nameInput.value.trim(),
			email: this.refs.emailInput.value.trim(),
			link: this.refs.linkInput.value.trim() || undefined,
			rid,
			page_key: this.config.pageKey,
			page_title: this.config.pageTitle,
			site_name: this.config.site,
		};
	}

	/** 把后端错误翻译成可操作的提示，而不是把 msg 原样丢给用户。 */
	private describeError(err: unknown): { message: string; needLogin: boolean } {
		if (err instanceof ArtalkError) {
			const payload = err.payload;
			if (payload.need_auth_login === true) {
				return { message: '登录状态已失效，请重新登录管理员后再发送。', needLogin: true };
			}
			if (payload.need_login === true) {
				return {
					message: this.pageAdminOnly
						? '这个页面开启了「仅管理员可评论」，请先登录管理员后再发送。'
						: '你填写的昵称和邮箱与管理员账号一致，Artalk 为防止冒名要求先登录；也可以改用其他昵称/邮箱。',
					needLogin: true,
				};
			}
			if (payload.incomplete === true) return { message: err.message, needLogin: false };
			if (payload.err_no_site === true) return { message: '评论站点配置不正确，请联系站长', needLogin: false };
			return { message: `发送失败：${err.message}`, needLogin: false };
		}
		return { message: `发送失败：${err instanceof Error ? err.message : '请稍后重试'}`, needLogin: false };
	}

	private async doSubmit(payload: SubmitPayload, allowCaptcha: boolean, source: Source): Promise<void> {
		if (this.submitting) return;
		this.submitting = true;
		this.pendingSource = source;
		const button = source === 'reply' ? this.replySubmitButton : this.refs.submitButton;
		const idleLabel = source === 'reply' ? '发送回复' : '发送';
		if (button) { button.disabled = true; button.textContent = '发送中…'; }
		this.showNoticeFor(source, '正在发送…', 'info');
		try {
			const created = await this.api.createComment(payload);
			if (this.destroyed) return;
			saveUser({ name: payload.name, email: payload.email, link: payload.link ?? '' });
			if (source === 'root') {
				this.refs.textarea.value = '';
				this.autoGrow();
			} else {
				// 只清回复区：顶层草稿、提示、按钮一概不动。
				this.replyDraft = '';
				this.replyTo = null;
				this.replyNotice = { text: '', tone: 'info' };
			}
			// POST 响应没有 visible 字段，视为可见；本地插入而不是重载第一页，
			// 这样用户已经翻到的分页不会被打回。renderTree 按 rid 重建树，
			// 新回复会挂到对应父评论下并带「回复 @xxx」。
			const fresh: ArtalkComment = {
				...created,
				rid: payload.rid,
				page_key: payload.page_key,
				site_name: payload.site_name,
				visible: created.visible ?? true,
			};
			if (payload.rid > 0) {
				const parentIndex = this.comments.findIndex((item) => item.id === payload.rid);
				this.comments.splice(parentIndex >= 0 ? parentIndex + 1 : this.comments.length, 0, fresh);
			} else if (this.sortBy === 'date_asc') {
				this.comments.push(fresh);
			} else {
				this.comments.unshift(fresh);
			}
			this.total += 1;
			if (payload.rid === 0) this.rootsCount += 1;
			this.freshId = created.id;
			this.error = null;
			this.showNoticeFor(source, created.is_pending
				? '评论已提交，等待审核'
				: (source === 'reply' ? '回复已发布' : '评论已发布'), 'success');
			this.render();
			void this.syncCountWidgets();
			this.pendingSubmit = null;
		} catch (err) {
			if (this.destroyed) return;
			if (err instanceof ArtalkError && err.payload.need_captcha === true && allowCaptcha) {
				this.pendingSubmit = payload;
				// 清掉「正在发送…」：验证码浮层本身已经说明当前在做什么，不必再叠一行提示。
				this.showNoticeFor(source, '', 'info');
				this.openCaptcha(err.payload);
				return;
			}
			const described = this.describeError(err);
			// 只有 need_login 的登录补全过程要原样重试这份完整报文。
			this.pendingSubmit = described.needLogin ? payload : null;
			this.showNoticeFor(source, described.message, 'error', described.needLogin);
		} finally {
			this.submitting = false;
			if (button) { button.disabled = false; button.textContent = idleLabel; }
		}
	}

	/* ── 验证码 ───────────────────────────────────────────────────────── */

	private openCaptcha(payload: Record<string, unknown>): void {
		this.refs.captchaError.textContent = '';
		this.refs.captchaInput.value = '';
		if (typeof payload.img_data === 'string' && payload.img_data) {
			this.refs.captchaImage.src = payload.img_data;
			this.refs.captchaImage.hidden = false;
		} else {
			void this.refreshCaptcha();
		}
		if (typeof payload.iframe === 'string' && payload.iframe) {
			this.refs.captchaError.textContent = '如验证页面未出现，请允许弹出窗口后重试';
		}
		this.refs.captcha.dataset.open = 'true';
		this.refs.captcha.setAttribute('aria-hidden', 'false');
		// visibility 生效后再聚焦，否则 focus() 会静默失败。
		requestAnimationFrame(() => this.refs.captchaInput.focus());
	}

	private async refreshCaptcha(): Promise<void> {
		try {
			const data = await this.api.getCaptcha();
			if (data.img_data) {
				this.refs.captchaImage.src = data.img_data;
				this.refs.captchaImage.hidden = false;
			}
		} catch { /* 保留旧图 */ }
	}

	private closeCaptcha(): void {
		this.refs.captcha.dataset.open = 'false';
		this.refs.captcha.setAttribute('aria-hidden', 'true');
		this.pendingSubmit = null;
	}

	private bindCaptcha(): void {
		this.refs.captchaImage.addEventListener('click', () => void this.refreshCaptcha());
		this.refs.captchaCancel.addEventListener('click', () => {
			this.closeCaptcha();
			this.showNoticeFor(this.pendingSource, '已取消发送', 'info');
		});
		this.refs.captchaConfirm.addEventListener('click', () => void this.confirmCaptcha());
		this.refs.captchaInput.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); void this.confirmCaptcha(); }
		});
		this.refs.captcha.addEventListener('click', (event) => {
			if (event.target === this.refs.captcha) this.closeCaptcha();
		});
	}

	private async confirmCaptcha(): Promise<void> {
		const value = this.refs.captchaInput.value.trim();
		if (!value) {
			this.refs.captchaError.textContent = '请输入图中的字符';
			return;
		}
		this.refs.captchaConfirm.disabled = true;
		try {
			await this.api.verifyCaptcha(value);
			const pending = this.pendingSubmit;
			const source = this.pendingSource;
			this.closeCaptcha();
			if (pending) await this.doSubmit(pending, false, source);
		} catch {
			this.refs.captchaError.textContent = '验证失败，请重试';
			this.refs.captchaInput.value = '';
			void this.refreshCaptcha();
		} finally {
			this.refs.captchaConfirm.disabled = false;
		}
	}

	/* ── 管理员登录（need_login 的补全过程） ───────────────────────────── */

	/**
	 * Artalk v2 的 isAllowComment：昵称+邮箱命中管理员账号、或页面 admin_only 时，
	 * 请求必须带管理员 JWT，否则 403 { need_login: true }。这里在本地完成登录，
	 * 拿到 token 后原地更新 Api 实例并重试原始报文（含正确的 rid / page_key）。
	 */
	private openLogin(): void {
		this.refs.loginEmail.value = this.refs.emailInput.value.trim();
		this.refs.loginPassword.value = '';
		this.refs.loginError.textContent = '';
		this.refs.loginError.dataset.tone = 'error';
		// 每次打开从「无需验证码」开始，只有登录接口返回 need_captcha 才展开。
		this.loginCaptchaRequired = false;
		this.refs.loginCaptcha.hidden = true;
		this.refs.loginCaptchaInput.value = '';
		this.refs.loginCaptchaImage.hidden = true;
		this.refs.loginCaptchaImage.removeAttribute('src');
		this.refs.login.dataset.open = 'true';
		this.refs.login.setAttribute('aria-hidden', 'false');
		requestAnimationFrame(() => {
			(this.refs.loginEmail.value ? this.refs.loginPassword : this.refs.loginEmail).focus();
		});
	}

	private closeLogin(): void {
		this.refs.login.dataset.open = 'false';
		this.refs.login.setAttribute('aria-hidden', 'true');
	}

	private bindLogin(): void {
		this.refs.loginCancel.addEventListener('click', () => this.closeLogin());
		this.refs.loginConfirm.addEventListener('click', () => void this.confirmLogin());
		this.refs.loginPassword.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); void this.confirmLogin(); }
		});
		this.refs.loginCaptchaInput.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') { event.preventDefault(); void this.confirmLogin(); }
		});
		this.refs.loginCaptchaImage.addEventListener('click', () => void this.refreshLoginCaptcha());
		this.refs.login.addEventListener('click', (event) => {
			if (event.target === this.refs.login) this.closeLogin();
		});
	}

	/**
	 * /user/access_token 同样套了 LimiterGuard：达到频率后返回
	 * 403 { need_captcha, img_data }。图片与输入内嵌在登录弹层里，
	 * 不和评论用的全屏验证码浮层叠加。
	 */
	private showLoginCaptcha(payload: Record<string, unknown>): void {
		this.loginCaptchaRequired = true;
		this.refs.loginCaptcha.hidden = false;
		this.refs.loginCaptchaInput.value = '';
		if (typeof payload.img_data === 'string' && payload.img_data) {
			this.refs.loginCaptchaImage.src = payload.img_data;
			this.refs.loginCaptchaImage.hidden = false;
		} else {
			void this.refreshLoginCaptcha();
		}
		// 图片 + 输入框占位文字已自解释，不再堆引导文案；仅 iframe 模式给一句必要提示。
		this.refs.loginError.textContent = payload.iframe ? '请完成页面验证后重试' : '';
		this.refs.loginError.dataset.tone = 'error';
		requestAnimationFrame(() => this.refs.loginCaptchaInput.focus());
	}

	private async refreshLoginCaptcha(): Promise<void> {
		try {
			const data = await this.api.getCaptcha();
			if (data.img_data) {
				this.refs.loginCaptchaImage.src = data.img_data;
				this.refs.loginCaptchaImage.hidden = false;
			}
		} catch { /* 保留旧图 */ }
	}

	private async confirmLogin(): Promise<void> {
		const email = this.refs.loginEmail.value.trim();
		const password = this.refs.loginPassword.value;
		if (!email || !password) {
			this.refs.loginError.textContent = '请填写管理员邮箱和密码';
			this.refs.loginError.dataset.tone = 'error';
			return;
		}
		this.refs.loginConfirm.disabled = true;
		this.refs.loginError.textContent = '';
		try {
			if (this.loginCaptchaRequired) {
				const value = this.refs.loginCaptchaInput.value.trim();
				if (!value) {
					this.refs.loginError.textContent = '请输入图中的字符';
					this.refs.loginError.dataset.tone = 'error';
					return;
				}
				// captcha/verify 不受 LimiterGuard 限制，验证通过会按 IP 标记放行，
				// 随后的登录请求以及重试的评论提交即可通过。
				await this.api.verifyCaptcha(value);
				this.loginCaptchaRequired = false;
				this.refs.loginCaptcha.hidden = true;
			}
			// 带上 name 精确匹配账号，避免同邮箱多用户时 need_name_select。
			const result = await this.api.login({ name: this.refs.nameInput.value.trim(), email, password });
			if (!result?.token) throw new Error('登录未返回凭证，请重试');
			saveUser({
				name: this.refs.nameInput.value.trim(),
				email,
				link: this.refs.linkInput.value.trim(),
				token: result.token,
			});
			this.api.setToken(result.token);
			this.closeLogin();
			const pending = this.pendingSubmit;
			const source = this.pendingSource;
			if (pending) await this.doSubmit(pending, true, source);
		} catch (err) {
			if (err instanceof ArtalkError && err.payload.need_captcha === true) {
				this.showLoginCaptcha(err.payload);
				return;
			}
			// 验证码填错：verifyCaptcha 返回 403 并附一张新图。
			if (err instanceof ArtalkError && this.loginCaptchaRequired && typeof err.payload.img_data === 'string') {
				this.refs.loginCaptchaImage.src = err.payload.img_data;
				this.refs.loginCaptchaImage.hidden = false;
				this.refs.loginCaptchaInput.value = '';
				this.refs.loginError.textContent = '验证码不正确，已换一张，请重试';
				this.refs.loginError.dataset.tone = 'error';
				requestAnimationFrame(() => this.refs.loginCaptchaInput.focus());
				return;
			}
			this.refs.loginError.textContent = err instanceof Error ? err.message : '登录失败，请重试';
			this.refs.loginError.dataset.tone = 'error';
		} finally {
			this.refs.loginConfirm.disabled = false;
		}
	}

	/* ── 评论数挂件 ───────────────────────────────────────────────────── */

	/** 页面上任何 <span data-comment-count="/post/x/"></span> 都能被批量补全。 */
	private async syncCountWidgets(): Promise<void> {
		const widgets = Array.from(document.querySelectorAll<HTMLElement>('[data-comment-count]'))
			.filter((node) => !node.closest('[data-comments-root]'));
		const keys = Array.from(new Set(widgets.map((node) => node.dataset.commentCount || this.config.pageKey).filter(Boolean)));
		if (keys.length === 0) return;
		try {
			const counts = await this.api.getCommentCounts(keys);
			if (this.destroyed) return;
			for (const widget of widgets) {
				const key = widget.dataset.commentCount || this.config.pageKey;
				const value = counts[key];
				if (typeof value === 'number') widget.textContent = String(value);
			}
		} catch { /* 统计失败不影响评论主体 */ }
	}

	destroy(): void {
		this.destroyed = true;
		this.observer?.disconnect();
		this.observer = null;
		window.removeEventListener('scroll', this.onScroll);
		document.removeEventListener('click', this.onDocumentClick);
		if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
	}
}

let current: CommentsClient | null = null;
let mountedRoot: HTMLElement | null = null;
const countKeysFetched = new Set<string>();

/**
 * 轻量模式：<ArtalkComments mode="counts" /> 只渲染一个隐藏配置节点，
 * 用来批量补全列表页上的 <span data-comment-count="/post/x/"></span>。
 */
function bootCountWidgets(): void {
	const carrier = document.querySelector<HTMLElement>('[data-comments-root][data-mode="counts"]');
	if (!carrier) return;
	const widgets = Array.from(document.querySelectorAll<HTMLElement>('[data-comment-count]'));
	if (widgets.length === 0) return;
	const config = readConfig(carrier);
	const keys = Array.from(new Set(widgets.map((node) => node.dataset.commentCount || config.pageKey).filter(Boolean)));
	const pending = keys.filter((key) => !countKeysFetched.has(key));
	if (pending.length === 0) return;
	pending.forEach((key) => countKeysFetched.add(key));
	const user = readUser();
	const api = new ArtalkApi(config.server, config.site, config.pageKey, config.pageTitle, config.timeout, user.token ?? '');
	void api.getCommentCounts(pending).then((counts) => {
		for (const widget of widgets) {
			const value = counts[widget.dataset.commentCount || config.pageKey];
			if (typeof value === 'number') widget.textContent = String(value);
		}
	}).catch(() => { pending.forEach((key) => countKeysFetched.delete(key)); });
}

function boot(): void {
	bootCountWidgets();
	if (current && mountedRoot?.isConnected) return;
	current?.destroy();
	current = null;
	mountedRoot = null;
	const root = document.querySelector<HTMLElement>('[data-comments-root]:not([data-mode="counts"])');
	if (root) {
		mountedRoot = root;
		current = new CommentsClient(root);
	}
}

boot();
document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', () => {
	current?.destroy();
	current = null;
	mountedRoot = null;
});
