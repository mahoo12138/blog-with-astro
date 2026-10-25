export {};

// TOC 生命周期跟随 ClientRouter；同一 DOM 仅绑定一次，折叠交互由原生 details 负责。
let cleanup: (() => void) | undefined;
let initializedWidget: HTMLDetailsElement | null = null;

function initializeToc() {
	const widget = document.querySelector<HTMLDetailsElement>('[data-toc-widget]');
	if (widget && widget === initializedWidget) return;
	cleanup?.();
	if (!widget) return;
	initializedWidget = widget;
	const controller = new AbortController();
	const { signal } = controller;
	const viewport = widget.querySelector<HTMLElement>('[data-toc-scroll]');
	const toggle = widget.querySelector<HTMLElement>('[data-toc-toggle]');
	const entries = Array.from(widget.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')).flatMap((link) => {
		try {
			const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
			return heading ? [{ link, heading, top: 0 }] : [];
		} catch { return []; } // 异常 fragment 不应破坏其他目录项。
	});
	const temporaryTabStops = new Set<HTMLElement>();
	let activeIndex = -1;
	let frame = 0;
	let needsMeasure = true;
	let pointerInside = false;
	let focusFrame = 0;

	function revealActive() {
		if (!widget!.open || !viewport || pointerInside || viewport.contains(document.activeElement)) return;
		if (getComputedStyle(widget!).visibility !== 'visible') return;
		const link = entries[activeIndex]?.link;
		if (!link || !viewport.clientHeight) return;
		const rect = link.getBoundingClientRect();
		const bounds = viewport.getBoundingClientRect();
		if (rect.top < bounds.top + 8 || rect.bottom > bounds.bottom - 8) {
			// 只滚动目录自身，不使用 scrollIntoView 牵动正文或外层侧栏。
			viewport.scrollTop += rect.top - bounds.top - Math.max(8, (viewport.clientHeight - rect.height) / 2);
		}
	}
	function setActive(index: number) {
		if (activeIndex !== index) {
			activeIndex = index;
			entries.forEach(({ link }, i) => {
				link.classList.toggle('active', i === index);
				if (i === index) link.setAttribute('aria-current', 'location');
				else link.removeAttribute('aria-current');
			});
		}
		revealActive();
	}
	function update() {
		frame = 0;
		if (signal.aborted || !entries.length) return;
		if (needsMeasure) {
			entries.forEach((entry) => { entry.top = entry.heading.getBoundingClientRect().top + window.scrollY; });
			needsMeasure = false;
		}
		const readingLine = window.scrollY + 100;
		let next = 0;
		entries.forEach((entry, i) => { if (entry.top <= readingLine) next = i; });
		const pageHeight = document.documentElement.scrollHeight;
		// 页尾内容不足以顶到阅读线；给字体/像素取整造成的微小高度变化留出余量。
		const last = entries[entries.length - 1];
		if (window.scrollY > 0 && window.scrollY + window.innerHeight >= pageHeight - 24 && last.top < window.scrollY + window.innerHeight) {
			next = entries.length - 1;
		}
		// 明确点击的锚点优先：倒数第二节也可能已接近页底，不能一律标成最后一节。
		// 只在浏览器确实停于该锚点的位置时保持选中；手动滚走后继续按阅读位置高亮。
		try {
			const hashId = decodeURIComponent(window.location.hash.slice(1));
			const hashIndex = entries.findIndex((entry) => entry.heading.id === hashId);
			if (hashIndex >= 0) {
				const target = entries[hashIndex];
				const margin = Number.parseFloat(getComputedStyle(target.heading).scrollMarginTop) || 0;
				const targetY = Math.min(Math.max(0, pageHeight - window.innerHeight), Math.max(0, target.top - margin));
				if (Math.abs(window.scrollY - targetY) <= 8) next = hashIndex;
			}
		} catch { /* 保留基于滚动位置的结果，不处理无效编码的 hash。 */ }
		setActive(next);
	}
	function schedule(measure = false) {
		if (signal.aborted) return;
		needsMeasure ||= measure;
		if (!frame) frame = requestAnimationFrame(update);
	}
	function syncDisclosure() {
		widget!.dataset.tocCollapse = String(!widget!.open);
		toggle?.setAttribute('aria-label', widget!.open ? '折叠目录' : '展开目录');
		toggle?.setAttribute('aria-expanded', String(widget!.open));
		schedule(true);
	}
	widget.addEventListener('toggle', syncDisclosure, { signal });
	viewport?.addEventListener('pointerenter', () => { pointerInside = true; }, { signal });
	viewport?.addEventListener('pointerleave', () => { pointerInside = false; schedule(); }, { signal });
	viewport?.addEventListener('focusout', () => schedule(), { signal });
	entries.forEach(({ link, heading }, index) => {
		link.addEventListener('click', (event) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			setActive(index);
			// 不拦截默认锚点行为：保留 URL、前进/后退和无 JS 导航。
			// 手机侧栏先由其控制器关闭，再把焦点交回目标标题。
			if (widget!.closest('[aria-modal="true"]')) {
				cancelAnimationFrame(focusFrame);
				focusFrame = requestAnimationFrame(() => {
					if (signal.aborted || !heading.isConnected) return;
					if (!heading.hasAttribute('tabindex')) {
						heading.tabIndex = -1;
						temporaryTabStops.add(heading);
						heading.addEventListener('blur', () => { heading.removeAttribute('tabindex'); temporaryTabStops.delete(heading); }, { once: true, signal });
					}
					heading.focus({ preventScroll: true });
				});
			}
		}, { signal });
	});
	window.addEventListener('scroll', () => schedule(), { passive: true, signal });
	window.addEventListener('resize', () => schedule(true), { passive: true, signal });
	window.addEventListener('hashchange', () => schedule(true), { signal });
	window.addEventListener('pageshow', () => schedule(true), { signal });
	const main = document.getElementById('main-content');
	// 图片、字体和异步内容会改变标题位置；滚动时只读取已缓存的坐标。
	main?.addEventListener('load', () => schedule(true), { capture: true, signal });
	const resizeObserver = new ResizeObserver(() => schedule(true));
	if (main) resizeObserver.observe(main);
	const shell = widget.closest('[data-stellar-shell]');
	const panelObserver = new MutationObserver(() => schedule());
	// 左右栏共用同一挂件：任一抽屉开合都会改变目录可视高度，需重新测量。
	if (shell) panelObserver.observe(shell, { attributes: true, attributeFilter: ['data-rightbar-open', 'data-leftbar-open'] });
	void document.fonts?.ready.then(() => schedule(true));
	syncDisclosure();
	cleanup = () => {
		controller.abort();
		cancelAnimationFrame(frame);
		cancelAnimationFrame(focusFrame);
		resizeObserver.disconnect();
		panelObserver.disconnect();
		temporaryTabStops.forEach((heading) => heading.removeAttribute('tabindex'));
		if (initializedWidget === widget) initializedWidget = null;
	};
}

initializeToc();
document.addEventListener('astro:page-load', initializeToc);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
