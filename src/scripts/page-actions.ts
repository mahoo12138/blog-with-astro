export {};

/**
 * 目录下方的页面操作（回到顶部 / 参与讨论）。
 *
 * 只在阅读进度超过阈值后出现 —— 位于文首时这两件事都无意义，常驻反而占版面。
 * 生命周期跟随 ClientRouter，与 toc.ts 同构：同一 DOM 只绑定一次。
 */

const THRESHOLD = 0.3; // 占「可滚动距离」的比例

let cleanup: (() => void) | undefined;
let initialized: HTMLElement | null = null;

function initializePageActions() {
	const nav = document.querySelector<HTMLElement>('[data-page-actions]');
	if (nav && nav === initialized) return;
	cleanup?.();
	if (!nav) return;
	initialized = nav;

	const controller = new AbortController();
	const { signal } = controller;
	const discussion = nav.querySelector<HTMLElement>('[data-page-action="discuss"]');
	let frame = 0;
	let visible = false;

	function commentsSection() {
		return document.querySelector<HTMLElement>('[data-comments-root][data-mode="full"]');
	}

	/** 进度 = 已滚距离 / 可滚距离；短页面（无可滚距离）不显示。 */
	function sync() {
		frame = 0;
		if (signal.aborted) return;
		const scrollable = document.documentElement.scrollHeight - window.innerHeight;
		const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
		const next = progress >= THRESHOLD;
		if (next === visible) return;
		visible = next;
		nav!.hidden = !next;
	}
	function schedule() {
		if (!frame) frame = requestAnimationFrame(sync);
	}
	function behavior(): ScrollBehavior {
		return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}
	/** 移动端侧栏是抽屉：先收起（解除 body 滚动锁），再滚动页面。 */
	function closeDrawer() {
		const modal = nav!.closest<HTMLElement>('[aria-modal="true"]');
		if (modal) {
			modal.querySelector<HTMLElement>('[data-sidebar-close]')?.click();
			return;
		}
		// WideShell（课时页）用 data-leftbar-open 状态 + 遮罩关闭，没有关闭按钮。
		const shell = nav!.closest<HTMLElement>('[data-stellar-shell]');
		if (shell?.hasAttribute('data-leftbar-open') || shell?.hasAttribute('data-rightbar-open')) {
			shell.querySelector<HTMLElement>('[data-sidebar-dismiss]')?.click();
		}
	}
	function focusComposer(section: HTMLElement) {
		const field = section.querySelector<HTMLElement>('[data-role="content"]');
		if (field) {
			field.focus({ preventScroll: true });
			return;
		}
		// 评论区进入视口才开始注入界面，稍后重试一次即可。
		window.setTimeout(() => {
			if (signal.aborted) return;
			section.querySelector<HTMLElement>('[data-role="content"]')?.focus({ preventScroll: true });
		}, 420);
	}

	nav.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-page-action]') : null;
		if (!target) return;
		if (target.dataset.pageAction === 'top') {
			closeDrawer();
			window.scrollTo({ top: 0, behavior: behavior() });
			return;
		}
		if (target.dataset.pageAction !== 'discuss') return;
		const section = commentsSection();
		if (!section) return;
		closeDrawer();
		// 与标题锚点的 scroll-margin 对齐，留出一点上呼吸位。
		const top = section.getBoundingClientRect().top + window.scrollY - 28;
		window.scrollTo({ top: Math.max(0, top), behavior: behavior() });
		focusComposer(section);
	}, { signal });

	window.addEventListener('scroll', schedule, { passive: true, signal });
	window.addEventListener('resize', schedule, { passive: true, signal });
	window.addEventListener('pageshow', schedule, { signal });

	// 图片、评论列表、字体都会改变页面高度，进度需重算。
	const main = document.getElementById('main-content');
	const observer = new ResizeObserver(schedule);
	if (main) observer.observe(main);

	// 课时页左栏也用同一个目录挂件，但那些页面没有评论区。
	if (discussion) discussion.hidden = !commentsSection();
	sync();

	cleanup = () => {
		controller.abort();
		cancelAnimationFrame(frame);
		observer.disconnect();
		if (initialized === nav) initialized = null;
	};
}

initializePageActions();
document.addEventListener('astro:page-load', initializePageActions);
document.addEventListener('astro:before-swap', () => {
	cleanup?.();
	cleanup = undefined;
});
