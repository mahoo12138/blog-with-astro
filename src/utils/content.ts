import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { postUrl } from '../consts';

type BlogPost = CollectionEntry<'posts'>;
type ColumnEntry = CollectionEntry<'columns'>;

export type TaxonomyKey = 'categories' | 'tags';

export interface TaxonomyBucket {
	label: string;
	slug: string;
	posts: BlogPost[];
	/**
	 * 以该标签/分类登记在**专栏**上的专栏。
	 *
	 * 分流之后章节不再自带 tags / categories —— 体裁与主题由专栏统一表达，
	 * 章节上重复标一遍是冗余的。所以标签页 / 分类页必须**同时看专栏**，
	 * 否则「STM32」这类只登记在专栏上的标签会整页消失（实测该标签下 8 篇全是章节）。
	 */
	columns: ColumnBucket[];
}

export interface ColumnBucket {
	title: string;
	slug: string;
	description: string;
	accent?: string;
	icon?: string;
	/** 专栏排序权重（取自专栏条目的 order） */
	order: number;
	/** 章节，已按阅读顺序排好（order → pubDate → id） */
	posts: BlogPost[];
	entry?: ColumnEntry;
	/** 章节数，等价于 posts.length，供侧栏上下文使用 */
	count: number;
	/** 首章发布时间 */
	startedAt?: Date;
	/** 末章发布时间，用于在归档页表达系列的时间跨度 */
	updatedAt?: Date;
}

export interface ResolvedPostCover {
	variant: 'cover' | 'photo' | 'default';
	src: ImageMetadata | string;
	isLocal: boolean;
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export function sortBlogPosts(posts: BlogPost[]) {
	return [...posts]
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * 判断一篇文章是否属于某个专栏。
 *
 * 文件夹内的章节与独立文章保留同一个 posts 查询集合；columnId 由加载器根据目录注入。
 * 全站所有「要不要分流」的判断都必须走这两个函数，避免各处各写一遍
 * `post.data.columnId` 判断而出现一半分、一半不分的情况。
 */
export function columnIdOf(post: BlogPost): string | undefined {
	const columnId = post.data.columnId?.trim();
	return columnId ? columnId : undefined;
}

/** 独立文章：不属于任何专栏，单篇即可完整阅读。 */
export function standalonePosts(posts: BlogPost[]) {
	return posts.filter((post) => !columnIdOf(post));
}

/** 专栏章节。 */
export function columnPosts(posts: BlogPost[]) {
	return posts.filter((post) => columnIdOf(post));
}

/**
 * 文章的最终 URL：专栏章节自动带上专栏层级，独立文章维持 /post/<id>/。
 *
 * 这里不需要查 columns 集合 —— 专栏 slug 由专栏的 columnId 经 slugifySegment 得到，
 * 而文章的 columnId 与专栏的 columnId 本来就是同一个值（见 buildColumnBuckets）。
 * 因此全站所有「给文章生成链接」的地方都应当调用本函数，
 * 否则专栏章节会漏回 /post/<id>/，而那个地址已经改成跳转桩页了。
 */
export function postHref(post: BlogPost): string {
	const columnId = columnIdOf(post);
	return postUrl(post.id, columnId ? slugifySegment(columnId) : undefined);
}

/**
 * 专栏章节的阅读顺序。
 *
 * 优先用显式 order（作者手写的章节号），缺失时回退 pubDate，最后用 id 兜底。
 * **必须保证唯一排序来源**：目录、侧栏「专栏目录」、上一章/下一章导航都调用它，
 * 否则三处顺序不一致会让「下一篇」跳到读者已经读过的章节。
 *
 * 为什么不能只按 pubDate：实测 stm32-8 的日期(2019-07-13)早于 stm32-5(2019-07-25)，
 * dsa-2/3、dsa-4/5 更是共享同一时间戳 —— 纯日期排序会把章节顺序打乱。
 */
export function sortColumnPosts(posts: BlogPost[]) {
	return [...posts].sort((a, b) => {
		const leftOrder = a.data.order ?? Number.MAX_SAFE_INTEGER;
		const rightOrder = b.data.order ?? Number.MAX_SAFE_INTEGER;
		if (leftOrder !== rightOrder) {
			return leftOrder - rightOrder;
		}
		const byDate = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
		return byDate !== 0 ? byDate : collator.compare(a.id, b.id);
	});
}

/**
 * Resolve a post's cover from frontmatter.
 *
 * 字段已收敛：Hexo 遗留的 `img` 与从未使用的 `banner` 均已下线，
 * 全站只保留 `cover`（迁移见 Schema 收敛提交）。
 * `variant` 保留是为了兼容卡片既有的两种呈现（缩略图 / 全幅）。
 *
 * Source can be either a remote URL string or a local ImageMetadata.
 * `isLocal` lets callers choose between <Image> and plain <img>.
 */
export function resolvePostCover(post: BlogPost): ResolvedPostCover | null {
	const coverVal = post.data.cover;
	if (coverVal === undefined || coverVal === null) {
		return null;
	}
	if (typeof coverVal === 'string' && !coverVal.trim()) {
		return null;
	}
	return {
		variant: 'cover',
		src: typeof coverVal === 'string' ? coverVal.trim() : coverVal,
		isLocal: typeof coverVal !== 'string',
	};
}

export function slugifySegment(value: string) {
	const normalized = value.trim().toLowerCase().normalize('NFKC');
	const slug = normalized
		.replace(/["'’]+/g, '')
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '');

	// 含 CJK / 假名 / 谚文时直接用原 slug，**不再剥成 ASCII 残留**。
	//
	// 旧逻辑是「优先取 ASCII 残留，为空才回退」，这对混合名会削掉含义，
	// 且实测造成**真实冲突**（两个不同标签被静默合并成同一个桶）：
	//   CSS布局  → css   ← 与 CSS 撞车，于是 /tags/css/ 里同时装着
	//                       标 `CSS` 的 React 专栏和标 `CSS布局` 的前端入门专栏
	//   51单片机 → 51    ← 退化成 /tags/51/
	// 纯 CJK 名本来就一直是 CJK URL（前端 / 数据结构与算法 / 随笔杂谈），
	// 所以这里与既有行为一致；只有纯 ASCII（含带变音符的拉丁文，如 café → cafe）
	// 才继续走 asciiSlug 做折叠。
	const hasNonLatin = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(slug);
	if (hasNonLatin) {
		return slug;
	}

	const asciiSlug = slug
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^\x00-\x7F]+/g, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

	return asciiSlug || slug || normalized.replace(/\s+/g, '-');
}

function normalizeValues(values: string[]) {
	return values.map((value) => value.trim()).filter(Boolean);
}

/**
 * 从 Markdown/MDX 正文抽取纯文本摘要。
 *
 * 用于 description 缺省时的兜底（RSS 条目、卡片摘要、OG 描述），
 * 使「121 篇没有手写 description」不再直接退化成空摘要。
 * 同一份实现同时服务 RSS 与列表页，避免两处规则漂移。
 */
export function excerptFromBody(body = '', maxLength = 120) {
	const text = body
		// 去掉 fenced code block（摘要里贴代码没有意义）
		.replace(/```[\s\S]*?```/g, ' ')
		// 去掉 MDX/HTML 标签
		.replace(/<[^>]+>/g, ' ')
		// 去掉图片，链接只保留文字
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		// 去掉标题 / 引用 / 列表的行首标记
		.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s*/gm, '')
		// 去掉强调与行内代码标记
		.replace(/[*_`~]/g, '')
		// 压缩空白
		.replace(/\s+/g, ' ')
		.trim();

	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

/**
 * 文章的最终描述：优先手写 description，缺省时回退正文摘要。
 */
export function resolvePostDescription(post: BlogPost, maxLength = 160) {
	const explicit = post.data.description?.trim();
	if (explicit) {
		return explicit;
	}
	return excerptFromBody(post.body, maxLength) || post.data.title;
}

/**
 * 汇总标签 / 分类桶。
 *
 * `columns` 刻意**不给默认值** —— 它必须是必传参数。
 *
 * 原因：章节的 tags / categories 已移到专栏上，只传 posts 会漏掉整类内容
 * （`STM32` 标签下 8 篇全是专栏章节，不传 columns 这个标签页会直接消失）。
 * 最初写成了 `= []`，结果侧栏挂件漏传也没人发现，直到人工对照两个页面才看出来。
 * 现在漏传是**编译错误**，不会再静默退化。
 *
 * 排序按「条目总数 = 文章数 + 专栏数」降序，让内容多的标签排在前面。
 */
export function buildTaxonomyBuckets(posts: BlogPost[], key: TaxonomyKey, columns: ColumnBucket[]) {
	const buckets = new Map<string, TaxonomyBucket>();

	const ensure = (value: string) => {
		const slug = slugifySegment(value);
		const existing = buckets.get(slug);
		if (existing) {
			return existing;
		}
		const created: TaxonomyBucket = { label: value, slug, posts: [], columns: [] };
		buckets.set(slug, created);
		return created;
	};

	for (const post of posts) {
		for (const value of normalizeValues(post.data[key] ?? [])) {
			ensure(value).posts.push(post);
		}
	}

	for (const column of columns) {
		for (const value of normalizeValues(column.entry?.data[key] ?? [])) {
			ensure(value).columns.push(column);
		}
	}

	return [...buckets.values()].sort(
		(left, right) =>
			right.posts.length + right.columns.length - (left.posts.length + left.columns.length) ||
			collator.compare(left.label, right.label),
	);
}

/**
 * 分类 / 标签桶的「条目数」= 文章数 + 专栏数。
 *
 * 章节的 tags / categories 已移到专栏上，一个专栏在分类页 / 标签页上只算**一条**
 * （不管它有多少章）。凡是展示或排序这个数量的地方都必须走本函数，
 * 否则侧栏与分类索引会出现两个不一样的数字（实测踩过：侧栏 63 / 索引 65）。
 */
export function taxonomyEntryCount(bucket: TaxonomyBucket) {
	return bucket.posts.length + bucket.columns.length;
}

export function buildColumnBuckets(posts: BlogPost[], columns: ColumnEntry[]) {
	const postsByColumn = new Map<string, BlogPost[]>();

	for (const post of posts) {
		const columnId = columnIdOf(post);
		if (!columnId) {
			continue;
		}

		const existing = postsByColumn.get(columnId) ?? [];
		existing.push(post);
		postsByColumn.set(columnId, existing);
	}

	const buckets: ColumnBucket[] = columns
		.filter((column) => !column.data.draft)
		.map((column) => {
			const columnId = column.data.columnId ?? column.id;
			// 章节顺序在此处一次性定好，下游（目录 / 侧栏 / 前后章导航）直接消费，
			// 不允许再各自排序。
			const chapters = sortColumnPosts(postsByColumn.get(columnId) ?? []);
			const dates = chapters.map((post) => post.data.pubDate.valueOf()).sort((a, b) => a - b);

			return {
				title: column.data.title,
				slug: slugifySegment(columnId),
				description: column.data.description,
				accent: column.data.accent,
				icon: column.data.icon,
				order: column.data.order,
				posts: chapters,
				count: chapters.length,
				entry: column,
				startedAt: dates.length ? new Date(dates[0]) : undefined,
				updatedAt: dates.length ? new Date(dates[dates.length - 1]) : undefined,
			};
		})
		// 空专栏不渲染：入口可以先建，补上公开章节后自动出现；当前有 3 个空入口
		// 一篇文章都没有，此前仍会在列表页渲染出空卡片。
		// 补上内容后会自动重新出现，无需改代码。
		.filter((bucket) => bucket.posts.length > 0);

	return buckets.sort((left, right) => left.order - right.order || collator.compare(left.title, right.title));
}

/**
 * 全站专栏索引。
 *
 * 解决的问题：URL 生成、卡片角标、章节导航都需要知道「这篇文章属于哪个专栏」，
 * 而 getCollection 是异步的 —— 此前 StellarPostCard 的做法是在**每张卡片**里
 * 各调一次 getCollection('columns')，一页 10 张卡片就查 10 次。
 * 这里构建一次、传下去复用。
 */
export interface ColumnIndex {
	/** postId → 所属专栏 */
	byPostId: Map<string, ColumnBucket>;
	/** 专栏 slug → 专栏 */
	bySlug: Map<string, ColumnBucket>;
}

export function buildColumnIndex(posts: BlogPost[], columns: ColumnEntry[]): ColumnIndex {
	const buckets = buildColumnBuckets(posts, columns);
	const byPostId = new Map<string, ColumnBucket>();
	const bySlug = new Map<string, ColumnBucket>();

	for (const bucket of buckets) {
		bySlug.set(bucket.slug, bucket);
		for (const post of bucket.posts) {
			byPostId.set(post.id, bucket);
		}
	}

	return { byPostId, bySlug };
}

/** 博客流里的「专栏最新更新」展示位。 */
export interface ColumnUpdate {
	column: ColumnBucket;
	/** 代表章节：该专栏最新发布的一章 */
	post: BlogPost;
}

/**
 * 选出博客流中唯一的「专栏最新更新」。
 *
 * 规则是刻意收紧的，目的是让专栏可以持续大量更新而不刷屏博客：
 * - **全站专栏合计只占一个位置**。若改成每个专栏各占一位，将来同时更新六个专栏，
 *   博客首页又会退回成学习笔记的堆叠。
 * - **替换而非累积**：专栏再发十篇，展示位依然只有一条。
 * - 代表章节取该专栏**最新发布**的一章，读者点进去就能读到新内容。
 */
export function latestColumnUpdate(columns: ColumnBucket[]): ColumnUpdate | null {
	const candidates = columns.filter((column) => column.posts.length > 0 && column.updatedAt);
	if (candidates.length === 0) {
		return null;
	}

	const column = candidates.reduce((newest, current) =>
		current.updatedAt!.valueOf() > newest.updatedAt!.valueOf() ? current : newest,
	);

	const post = column.posts.reduce((latest, current) =>
		current.data.pubDate.valueOf() > latest.data.pubDate.valueOf() ? current : latest,
	);

	return { column, post };
}

export type BlogFeedItem =
	| { kind: 'post'; post: BlogPost; date: Date }
	| { kind: 'column-update'; post: BlogPost; date: Date };

/**
 * 博客流条目：独立文章 + 至多一条专栏最新更新，按时间倒序合并。
 *
 * 首页与 /posts/ 分页必须都走这个函数，否则两边的分页边界会错位，
 * 「下一页」会跳到读者已经看过的内容。
 *
 * 注意：`column-update` 这一条在渲染上与普通文章**完全一样**（同一张卡片、
 * 同样的「专栏 · X」角标），`kind` 只是保留「它是全站唯一的专栏展示位」这一语义，
 * 供审计与后续调整识别。不要因为看不出差别就去掉它。
 */
export function buildBlogFeed(posts: BlogPost[], columns: ColumnBucket[]): BlogFeedItem[] {
	const items: BlogFeedItem[] = posts.map((post) => ({ kind: 'post', post, date: post.data.pubDate }));
	const update = latestColumnUpdate(columns);

	if (update) {
		items.push({
			kind: 'column-update',
			post: update.post,
			date: update.post.data.pubDate,
		});
	}

	return items.sort((left, right) => right.date.valueOf() - left.date.valueOf());
}

export interface BlogFeedSource {
	/** 独立文章，已按发布时间倒序、已剔除草稿 */
	posts: BlogPost[];
	/** 全部专栏（含按阅读顺序排好的章节），已剔除空专栏 */
	columns: ColumnBucket[];
}

/**
 * 博客流的统一数据源。
 *
 * 存在的意义是**消除一个很容易犯的错误**：专栏章节要从「全部文章」里筛出来，
 * 所以 buildColumnBuckets 必须接收**全量文章**；而博客流只展示独立文章。
 * 两件事用同一个 `posts` 变量会写错（先过滤再建专栏 → 所有专栏都变成空的），
 * 因此这里把「全量 → 分别派生」这一步收敛到一个地方。
 */
export async function loadBlogFeedSource(): Promise<BlogFeedSource> {
	const published = sortBlogPosts(await getCollection('posts'));

	return {
		posts: standalonePosts(published),
		columns: buildColumnBuckets(published, await getCollection('columns')),
	};
}

