/**
 * kit 共享 DOM 小工具。
 *
 * 数据装载统一约定「光 DOM 子节点即数据」：
 *   - 散文/可见内容 → 直接写 slotted 标记（进静态 HTML，pagefind 可索引）
 *   - 结构化数据集 → 唯一子节点 <script type="application/json">，经 readJsonChild 读取
 *   - 标量 → 属性
 * 对外事件统一 kl:* 前缀 CustomEvent（bubbles）。
 */

/** 读取元素内第一个 <script type="application/json"> 子节点并解析 */
export function readJsonChild<T>(el: Element): T | null {
	const script = el.querySelector(':scope > script[type="application/json"]');
	if (!script || !script.textContent) return null;
	try {
		return JSON.parse(script.textContent) as T;
	} catch (err) {
		console.warn('[kit] JSON 数据解析失败：', err);
		return null;
	}
}

/** 派发 kl:* 事件 */
export function emitKl(el: Element, type: string, detail?: unknown): void {
	el.dispatchEvent(new CustomEvent(`kl:${type}`, { bubbles: true, detail }));
}

/** 统一管理元素生命周期内的监听器，destroy 时全部拆除 */
export class ListenerBag {
	#abort = new AbortController();

	get signal(): AbortSignal {
		return this.#abort.signal;
	}

	/** 目标级监听（默认跟随 bag 生命周期） */
	add(
		target: EventTarget,
		type: string,
		handler: (ev: Event) => void,
		options?: AddEventListenerOptions,
	): void {
		target.addEventListener(type, handler as EventListener, { ...options, signal: this.#abort.signal });
	}

	destroy(): void {
		this.#abort.abort();
	}
}

/** prefers-reduced-motion 当前值（组件内自带检查，全局规则不进 shadow） */
export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
