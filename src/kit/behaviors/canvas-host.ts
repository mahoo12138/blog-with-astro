/**
 * canvas 组件运行时（语义吸收自 src/lab/runtime.ts，为 shadow DOM 组件定制）。
 *
 * 脏活全在这层：DPR ≤2 适配、ResizeObserver 尺寸跟随、IntersectionObserver
 * 离屏暂停、visibilitychange 切后台暂停、prefers-reduced-motion 单帧降级、
 * dt clamp、拆卸。组件只注册绘制回调。
 */

export interface CanvasHostSize {
	/** CSS 像素宽 */
	width: number;
	/** CSS 像素高 */
	height: number;
	dpr: number;
}

export interface CanvasHostContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	size(): CanvasHostSize;
	/** 每帧回调。dt 单位秒，已 clamp 到 0.05 */
	onFrame(cb: (dt: number, elapsed: number) => void): void;
	/** 尺寸变化回调，挂载时先同步调用一次（首次绘制在这里做） */
	onResize(cb: (size: CanvasHostSize) => void): void;
	/** 手动重绘一帧（暂停状态下的交互反馈用） */
	redraw(): void;
	reducedMotion: boolean;
	/** 拆卸（disconnectedCallback 调用） */
	destroy(): void;
}

export type CanvasHostSetup = (context: CanvasHostContext) => void;

export function mountCanvasHost(canvas: HTMLCanvasElement, setup: CanvasHostSetup): void {
	const maybeCtx = canvas.getContext('2d');
	if (!maybeCtx) return;
	const ctx: CanvasRenderingContext2D = maybeCtx;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const frameHandlers: Array<(dt: number, elapsed: number) => void> = [];
	const resizeHandlers: Array<(size: CanvasHostSize) => void> = [];

	let width = 0;
	let height = 0;
	let dpr = 1;
	let rafId = 0;
	let lastTs = 0;
	let elapsed = 0;
	let inView = true;
	let pageVisible = typeof document !== 'undefined' ? !document.hidden : true;
	let destroyed = false;

	const abort = new AbortController();

	function size(): CanvasHostSize {
		return { width, height, dpr };
	}

	function applySize(): void {
		const rect = canvas.getBoundingClientRect();
		const nextW = Math.max(1, Math.round(rect.width));
		const nextH = Math.max(1, Math.round(rect.height));
		const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
		if (nextW === width && nextH === height && nextDpr === dpr) return;

		width = nextW;
		height = nextH;
		dpr = nextDpr;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		// 之后所有绘制都用 CSS 像素坐标
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		for (const handler of resizeHandlers) handler(size());
	}

	function frame(ts: number): void {
		rafId = requestAnimationFrame(frame);
		const dt = lastTs === 0 ? 1 / 60 : Math.min((ts - lastTs) / 1000, 0.05);
		lastTs = ts;
		elapsed += dt;
		for (const handler of frameHandlers) handler(dt, elapsed);
	}

	function drawOnce(): void {
		for (const handler of frameHandlers) handler(0, elapsed);
	}

	function shouldRun(): boolean {
		return !reducedMotion && inView && pageVisible && !destroyed;
	}

	function syncLoop(): void {
		if (destroyed) return;
		if (shouldRun()) {
			if (rafId === 0) {
				lastTs = 0;
				rafId = requestAnimationFrame(frame);
			}
		} else if (rafId !== 0) {
			cancelAnimationFrame(rafId);
			rafId = 0;
			// 降级时补一帧静态图，保证内容不空白
			drawOnce();
		}
	}

	const ro = new ResizeObserver(() => {
		applySize();
		syncLoop();
	});
	ro.observe(canvas);

	const io = new IntersectionObserver(
		(entries) => {
			inView = entries.some((e) => e.isIntersecting);
			syncLoop();
		},
		{ rootMargin: '128px' },
	);
	io.observe(canvas);

	document.addEventListener(
		'visibilitychange',
		() => {
			pageVisible = !document.hidden;
			syncLoop();
		},
		{ signal: abort.signal },
	);

	const context: CanvasHostContext = {
		canvas,
		ctx,
		size,
		onFrame(cb) {
			frameHandlers.push(cb);
		},
		onResize(cb) {
			resizeHandlers.push(cb);
		},
		redraw() {
			drawOnce();
		},
		reducedMotion,
		destroy() {
			if (destroyed) return;
			destroyed = true;
			if (rafId !== 0) cancelAnimationFrame(rafId);
			rafId = 0;
			ro.disconnect();
			io.disconnect();
			abort.abort();
		},
	};

	setup(context);
	applySize();
	syncLoop();
}
