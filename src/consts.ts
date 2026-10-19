// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

import legacyPostIds from './config/legacy-post-ids.json';

/** Existing articles keep their pre-folder comment/redirect identity. New chapters need no legacy alias. */
export function legacyPostId(id: string): string | undefined {
	return (legacyPostIds as Record<string, string>)[id];
}
export function chapterSlug(id: string, columnId: string): string {
	const prefix = `${columnId}/`;
	if (!id.startsWith(prefix)) throw new Error(`Chapter identity ${id} does not belong to ${columnId}`);
	return id.slice(prefix.length);
}

export const SITE_TITLE = 'Mahoo Space';
export const SITE_DESCRIPTION = 'Welcome to my planet!';
export const SITE_AUTHOR = 'mahoo12138';

export const POSTS_PER_PAGE = 10;

// 文章固定链接。全站 URL 规则只在此处定义一次，
// 避免散落在 archives / rss / StellarPostCard / 侧栏挂件等处各自拼字符串（历史上曾出现 /blog/ 死链）。
export const POST_ROUTE_PREFIX = 'post';
export const COLUMN_ROUTE_PREFIX = 'columns';

/**
 * 文章 URL。
 *
 * 独立文章走 /post/<id>/；专栏章节走 /columns/<专栏>/<id>/，
 * 让专栏在地址栏里也是「一个系列」而不是散落的单篇。
 *
 * 传入 columnSlug 即输出专栏层级路径 —— 调用方负责提供该文章所属专栏的 slug，
 * 通常来自 utils/content.ts 的 buildColumnIndex()。
 */
export function postUrl(id: string, columnSlug?: string): string {
	return columnSlug ? `/${COLUMN_ROUTE_PREFIX}/${columnSlug}/${chapterSlug(id, columnSlug)}/` : `/${POST_ROUTE_PREFIX}/${id}/`;
}

/** 专栏目录页 URL。 */
export function columnUrl(slug: string): string {
	return `/${COLUMN_ROUTE_PREFIX}/${slug}/`;
}

/**
 * 文章的评论标识（Artalk pageKey）。
 *
 * 刻意使用**不含专栏层级**的旧路径：评论应该绑定在「文章」这个身份上，
 * 而不是绑定在 URL 结构上。这样专栏章节从 /post/<id>/ 迁移到
 * /columns/<col>/<id>/ 之后，历史评论仍然落在同一个 key 上，不会看起来凭空消失。
 */
export function postCommentKey(id: string): string {
	return `/${POST_ROUTE_PREFIX}/${legacyPostId(id) ?? id}/`;
}
