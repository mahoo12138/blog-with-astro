import type { ArtalkComment } from './api';

/**
 * 评论内容渲染。
 *
 * 服务端返回的 `content_marked` 是已渲染的 HTML，但评论是用户输入，
 * 直接 innerHTML 会有 XSS 风险。这里用 DOMParser 做白名单清洗（零依赖），
 * 再把 Artalk 的图片表情短码 `:[key]` 还原成 <img>。
 */

const TAGS = new Set([
	'p', 'br', 'strong', 'b', 'em', 'i', 'del', 's', 'u', 'code', 'pre',
	'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'span', 'hr',
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
	'sup', 'sub', 'kbd',
]);
const DROP_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'svg', 'math', 'template']);
const ALLOWED_ATTRS = new Set(['href', 'title', 'src', 'alt', 'class', 'width', 'height', 'colspan', 'rowspan']);

function safeURL(value: string, allowImage: boolean): string | null {
	const trimmed = value.trim();
	if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
	if (allowImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(trimmed)) return trimmed;
	if (allowImage && /^\/[^/]/i.test(trimmed)) return trimmed; // 同源图片路径
	return null;
}

function sanitize(root: DocumentFragment): void {
	const nodes = Array.from(root.querySelectorAll('*'));
	for (const element of nodes) {
		const tag = element.tagName.toLowerCase();
		if (DROP_TAGS.has(tag)) {
			element.remove();
			continue;
		}
		if (!TAGS.has(tag)) {
			element.replaceWith(...Array.from(element.childNodes));
			continue;
		}
		for (const attr of Array.from(element.attributes)) {
			const name = attr.name.toLowerCase();
			if (!ALLOWED_ATTRS.has(name)) {
				element.removeAttribute(attr.name);
				continue;
			}
			if (name === 'href' || name === 'src') {
				const url = safeURL(attr.value, name === 'src');
				if (!url) { element.removeAttribute(attr.name); continue; }
				element.setAttribute(name, url);
			}
		}
		if (tag === 'a') {
			element.setAttribute('target', '_blank');
			element.setAttribute('rel', 'noopener noreferrer nofollow');
		}
		if (tag === 'img') {
			element.setAttribute('loading', 'lazy');
			element.setAttribute('referrerpolicy', 'no-referrer');
			if (!element.getAttribute('src')) element.remove();
		}
	}
}

const SHORTCODE = /:\[([^\]\n]{1,48})\]/g;

function emoticonize(root: DocumentFragment, imageMap: Map<string, string>): void {
	if (imageMap.size === 0) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const textNodes: Text[] = [];
	while (walker.nextNode()) {
		if (SHORTCODE.test(walker.currentNode.nodeValue ?? '')) textNodes.push(walker.currentNode as Text);
		SHORTCODE.lastIndex = 0;
	}
	for (const node of textNodes) {
		const text = node.nodeValue ?? '';
		const fragment = document.createDocumentFragment();
		let cursor = 0;
		for (const match of text.matchAll(SHORTCODE)) {
			const index = match.index ?? 0;
			const src = imageMap.get(match[0]);
			if (!src) continue;
			if (index > cursor) fragment.append(document.createTextNode(text.slice(cursor, index)));
			const img = document.createElement('img');
			const url = safeURL(src, true);
			if (url) {
				img.src = url;
				img.alt = match[1];
				img.loading = 'lazy';
				img.referrerPolicy = 'no-referrer';
				img.className = 'cm-emoji';
				fragment.append(img);
			} else {
				fragment.append(document.createTextNode(match[0]));
			}
			cursor = index + match[0].length;
		}
		if (cursor === 0) continue;
		if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
		node.replaceWith(fragment);
	}
}

export function escapeHTML(value: string): string {
	return value.replace(/[&<>"']/g, (char) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
	})[char] ?? char);
}

/** 返回可直接 append 的 DocumentFragment（只能插入一次）。 */
export function commentContent(comment: ArtalkComment, imageMap: Map<string, string>): DocumentFragment {
	const html = comment.content_marked?.trim()
		? comment.content_marked
		: escapeHTML(comment.content ?? '').replace(/\r?\n/g, '<br>');
	const template = document.createElement('template');
	template.innerHTML = html;
	sanitize(template.content);
	emoticonize(template.content, imageMap);
	return template.content;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatDate(value: string): string {
	if (!value || value.startsWith('0001-')) return '';
	const parsed = new Date(value.replace(' ', 'T'));
	if (Number.isNaN(parsed.getTime())) {
		const match = DATE_ONLY.exec(value);
		return match ? match[0] : '';
	}
	const diff = Date.now() - parsed.getTime();
	if (diff < 0) {
		const match = DATE_ONLY.exec(value);
		return match ? match[0] : '';
	}
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return '刚刚';
	if (minutes < 60) return `${minutes} 分钟前`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} 小时前`;
	const days = Math.floor(hours / 24);
	if (days < 8) return `${days} 天前`;
	const match = DATE_ONLY.exec(value);
	return match ? match[0] : '';
}

/** 只接受 http(s) 链接，避免把 javascript: 写进 href。 */
export function safeLink(value: string): string | null {
	if (!value) return null;
	const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	return safeURL(candidate, false);
}
