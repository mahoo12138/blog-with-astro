// ClientRouter 会替换 body；每次导航重新绑定，离开页面时清理媒体监听和滚动锁。
let cleanup: (() => void) | undefined;
let initializedShell: HTMLElement | null = null;

type PanelName = 'leftbar' | 'rightbar';

function initializeSidebar() {
	const shell = document.querySelector<HTMLElement>('[data-stellar-shell]');
	// 模块首次执行后还会收到 astro:page-load；同一 DOM 不重复初始化，
	// 避免用户快速打开侧栏后，被稍晚到达的页面事件意外关闭。
	if (shell && shell === initializedShell) return;
	cleanup?.();
	if (!shell) return;
	initializedShell = shell;
	const controller = new AbortController();
	const { signal } = controller;
	const panels = {
		leftbar: document.getElementById('site-leftbar'),
		rightbar: document.getElementById('site-rightbar'),
	};
	const media = {
		leftbar: matchMedia('(max-width: 900px)'),
		rightbar: matchMedia('(max-width: 1180px)'),
	};
	const main = document.getElementById('main-content');
	const mobileHeader = document.querySelector<HTMLElement>('[data-mobile-header]');
	const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-sidebar-toggle]'));
	const originalOverflow = document.body.style.overflow;
	let active: PanelName | null = null;
	let returnFocus: HTMLElement | null = null;

	function sync() {
		for (const name of ['leftbar', 'rightbar'] as const) {
			const panel = panels[name];
			const open = active === name;
			shell!.toggleAttribute(`data-${name}-open`, open);
			if (panel) {
				panel.inert = (!open && media[name].matches) || (active !== null && !open);
				if (open) {
					panel.setAttribute('role', 'dialog');
					panel.setAttribute('aria-modal', 'true');
				} else {
					panel.removeAttribute('role');
					panel.removeAttribute('aria-modal');
				}
			}
			for (const toggle of toggles.filter((button) => button.dataset.sidebarToggle === name)) {
				toggle.setAttribute('aria-expanded', String(open));
			}
		}
		if (main) main.inert = active !== null;
		if (mobileHeader) mobileHeader.inert = active !== null;
		document.body.style.overflow = active ? 'hidden' : originalOverflow;
	}
	function dismiss(restoreFocus = true) {
		active = null;
		sync();
		if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
	}
	function focusable(panel: HTMLElement) {
		return Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'))
			.filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible' && !element.closest('[inert]'));
	}
	for (const button of toggles) {
		button.addEventListener('click', () => {
			const name = button.dataset.sidebarToggle as PanelName;
			const panel = panels[name];
			if (!panel || !media[name].matches) return;
			if (active === name) return dismiss();
			returnFocus = button;
			active = name;
			sync();
			focusable(panel)[0]?.focus({ preventScroll: true });
		}, { signal });
	}
	document.querySelectorAll('[data-sidebar-close], [data-sidebar-dismiss]').forEach((button) => {
		button.addEventListener('click', () => dismiss(), { signal });
	});
	for (const panel of Object.values(panels)) {
		panel?.addEventListener('click', (event) => {
			if (active && event.target instanceof Element && event.target.closest('a[href]')) dismiss(false);
		}, { signal });
	}
	document.addEventListener('keydown', (event) => {
		if (!active) return;
		if (event.key === 'Escape') { event.preventDefault(); dismiss(); return; }
		const panel = panels[active];
		if (event.key !== 'Tab' || !panel) return;
		const controls = focusable(panel);
		const first = controls[0];
		const last = controls[controls.length - 1];
		if (!first) { event.preventDefault(); return; }
		if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
			event.preventDefault(); last.focus();
		} else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
			event.preventDefault(); first.focus();
		}
	}, { signal });
	Object.values(media).forEach((query) => query.addEventListener('change', () => dismiss(false), { signal }));
	sync();
	cleanup = () => {
		controller.abort();
		active = null;
		sync();
		if (initializedShell === shell) initializedShell = null;
	};
}

initializeSidebar();
document.addEventListener('astro:page-load', initializeSidebar);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
