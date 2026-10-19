import { appearanceModes, appearanceStorageKeys, colorSchemes, normalizeMode, normalizeScheme, type AppearanceMode, type ColorScheme } from '../config/appearance';
import * as styles from '../components/AppearancePicker.css';

// 首屏由 head bootstrap 恢复；ClientRouter 切页后沿用内存状态，不依赖存储可用。
let mode: AppearanceMode = normalizeMode(document.documentElement.dataset.theme);
let scheme: ColorScheme = normalizeScheme(document.documentElement.dataset.colorScheme);
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const saved = { mode: true, scheme: true };
try { localStorage.getItem(appearanceStorageKeys.mode); } catch { saved.mode = saved.scheme = false; }
let modalSession: { dialog: HTMLDialogElement; body: HTMLElement; overflow: string; opener: HTMLElement } | undefined;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}
function applyTo(root: HTMLElement) {
	if (mode === 'system') root.removeAttribute('data-theme');
	else root.dataset.theme = mode;
	if (scheme === 'blog') root.removeAttribute('data-color-scheme');
	else root.dataset.colorScheme = scheme;
	for (const item of colorSchemes) root.classList.toggle(`theme-${item.id}`, scheme === item.id && scheme !== 'blog');
	root.classList.toggle('dark', mode === 'dark' || (mode === 'system' && darkQuery.matches));
}
function syncControls() {
	const index = appearanceModes.findIndex((item) => item.id === mode);
	const label = `主题：${appearanceModes[index].label}，点击切换到${appearanceModes[(index + 1) % appearanceModes.length].label}`;
	document.querySelectorAll<HTMLButtonElement>('[data-theme-cycler]').forEach((button) => {
		button.dataset.themeMode = mode;
		button.title = label;
		button.setAttribute('aria-label', label);
	});
	document.querySelectorAll<HTMLButtonElement>('[data-appearance-open]').forEach((button) => { button.disabled = false; });
	document.querySelectorAll<HTMLInputElement>('input[data-appearance-option]').forEach((input) => {
		input.checked = input.dataset.appearanceOption === 'mode' ? input.value === mode : input.value === scheme;
		input.closest('label')?.setAttribute('data-selected', String(input.checked));
	});
	const status = document.querySelector<HTMLElement>('[data-appearance-status]');
	if (status) status.textContent = saved.mode && saved.scheme
		? '自动保存，仅对当前浏览器生效'
		: '已应用；浏览器无法保存部分偏好，刷新后可能无法保留';
}
function persist(kind: keyof typeof saved, value: string, fallback: string) {
	try {
		if (value === fallback) localStorage.removeItem(appearanceStorageKeys[kind]);
		else localStorage.setItem(appearanceStorageKeys[kind], value);
		saved[kind] = true;
	} catch { saved[kind] = false; }
}
function update(nextMode: AppearanceMode, nextScheme: ColorScheme) {
	mode = nextMode; scheme = nextScheme;
	applyTo(document.documentElement);
	syncControls();
}

// 按需创建一次原生 dialog，避免在数百个静态页面里重复输出设置面板。
function createDialog() {
	const existing = document.getElementById('appearance-dialog');
	if (existing instanceof HTMLDialogElement) return existing;
	const dialog = element('dialog', styles.dialog);
	dialog.id = 'appearance-dialog';
	dialog.setAttribute('aria-labelledby', 'appearance-title');
	dialog.setAttribute('aria-describedby', 'appearance-description');
	dialog.setAttribute('data-pagefind-ignore', '');
	const header = element('div', styles.header);
	const title = element('h2', styles.title, '外观设置');
	title.id = 'appearance-title';
	const close = element('button', styles.closeButton);
	close.type = 'button'; close.autofocus = true;
	close.dataset.appearanceClose = '';
	close.setAttribute('aria-label', '关闭外观设置');
	// 唯一的静态 HTML 是关闭图标；所有主题文字均通过 textContent 创建。
	close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
	header.append(title, close);
	const description = element('p', styles.subtitle, '选择喜欢的配色，保留熟悉的阅读布局。');
	description.id = 'appearance-description';
	dialog.append(header, description);
	for (const kind of ['mode', 'scheme'] as const) {
		const fieldset = element('fieldset', styles.fieldset);
		fieldset.append(element('legend', styles.legend, kind === 'mode' ? '明暗模式' : '配色主题'));
		const choices = element('div', kind === 'mode' ? styles.modes : styles.schemes);
		const options = kind === 'mode' ? appearanceModes : colorSchemes;
		for (const item of options) {
			const isScheme = 'light' in item;
			const label = element('label', `${styles.option}${isScheme ? ` ${styles.schemeOption}` : ''}${item.id === 'blog' ? ` ${styles.defaultOption}` : ''}`);
			const radio = element('input', styles.radio);
			radio.type = 'radio'; radio.name = `appearance-${kind}`; radio.value = item.id;
			radio.dataset.appearanceOption = kind;
			const name = element('span', styles.label, isScheme ? item.name : item.label);
			if (isScheme) name.append(element('span', styles.description, item.description));
			label.append(radio, name);
			if (isScheme) {
				const swatches = element('span', styles.swatches);
				swatches.setAttribute('aria-hidden', 'true');
				for (let i = 0; i < item.light.length; i++) {
					const swatch = element('span', styles.swatch);
					swatch.style.setProperty('--swatch-light', item.light[i]);
					swatch.style.setProperty('--swatch-dark', item.dark[i]);
					swatches.append(swatch);
				}
				label.append(swatches);
			}
			choices.append(label);
		}
		fieldset.append(choices); dialog.append(fieldset);
	}
	const footer = element('div', styles.footer);
	const reset = element('button', styles.reset, '恢复默认');
	reset.type = 'button'; reset.dataset.appearanceReset = '';
	const status = element('p', styles.status);
	status.dataset.appearanceStatus = ''; status.setAttribute('role', 'status');
	footer.append(reset, status); dialog.append(footer);
	// 原生 dialog 负责背景 inert；显式闭合 Tab 顺序，避免跨标签页后焦点进入浏览器工具栏。
	dialog.addEventListener('keydown', (event) => {
		if (event.key !== 'Tab') return;
		const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:checked, a[href]')).filter(visible);
		const first = controls[0], last = controls[controls.length - 1];
		if (!first) { event.preventDefault(); return; }
		if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
			event.preventDefault(); last.focus();
		} else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
			event.preventDefault(); first.focus();
		}
	});
	document.body.append(dialog);
	return dialog;
}
function visible(target: HTMLElement | null | undefined): target is HTMLElement {
	return !!target?.isConnected && !target.closest('[inert]') && target.getClientRects().length > 0 && getComputedStyle(target).visibility === 'visible';
}
function releaseModal(restoreFocus = true) {
	const session = modalSession;
	modalSession = undefined;
	if (!session) return;
	if (session.dialog.open) session.dialog.close();
	session.body.style.overflow = session.overflow;
	if (restoreFocus) {
		const fallback = Array.from(document.querySelectorAll<HTMLElement>('[data-mobile-header] [data-appearance-open], [data-sidebar-toggle="leftbar"]')).find(visible);
		const target = visible(session.opener) ? session.opener : fallback;
		target?.focus({ preventScroll: true });
	}
}
function openDialog(opener: HTMLElement) {
	if (modalSession?.dialog.open) return;
	// 先解除现有侧栏的焦点约束和滚动锁，也兼容 WideShell。
	document.querySelector<HTMLButtonElement>('[data-sidebar-dismiss]')?.click();
	const dialog = createDialog();
	syncControls();
	modalSession = { dialog, body: document.body, overflow: document.body.style.overflow, opener };
	document.body.style.overflow = 'hidden';
	dialog.showModal();
}

document.addEventListener('click', (event) => {
	if (!(event.target instanceof Element)) return;
	const opener = event.target.closest<HTMLElement>('[data-appearance-open]');
	if (opener) { openDialog(opener); return; }
	if (event.target.closest('[data-appearance-close]')) { releaseModal(); return; }
	if (event.target.closest('[data-appearance-reset]')) {
		persist('mode', 'system', 'system'); persist('scheme', 'blog', 'blog');
		update('system', 'blog'); return;
	}
	if (event.target.closest('[data-theme-cycler]')) {
		const next = appearanceModes[(appearanceModes.findIndex((item) => item.id === mode) + 1) % appearanceModes.length].id;
		persist('mode', next, 'system'); update(next, scheme); return;
	}
	if (event.target === modalSession?.dialog) {
		const bounds = modalSession.dialog.getBoundingClientRect();
		if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) releaseModal();
	}
});
document.addEventListener('change', (event) => {
	const input = event.target;
	if (!(input instanceof HTMLInputElement) || !input.checked) return;
	if (input.dataset.appearanceOption === 'mode') {
		const next = normalizeMode(input.value);
		persist('mode', next, 'system'); update(next, scheme);
	} else if (input.dataset.appearanceOption === 'scheme') {
		const next = normalizeScheme(input.value);
		persist('scheme', next, 'blog'); update(mode, next);
	}
});
document.addEventListener('close', (event) => { if (event.target === modalSession?.dialog) releaseModal(); }, true);
window.addEventListener('storage', (event) => {
	try { if (event.storageArea !== localStorage) return; } catch { return; }
	if (event.key === null) update('system', 'blog');
	else if (event.key === appearanceStorageKeys.mode) update(normalizeMode(event.newValue), scheme);
	else if (event.key === appearanceStorageKeys.scheme) update(mode, normalizeScheme(event.newValue));
});
darkQuery.addEventListener('change', () => { applyTo(document.documentElement); syncControls(); });
document.addEventListener('astro:before-swap', (event) => {
	releaseModal(false);
	const swap = event as Event & { newDocument: Document };
	applyTo(swap.newDocument.documentElement);
});
document.addEventListener('astro:page-load', () => { applyTo(document.documentElement); syncControls(); });
applyTo(document.documentElement);
syncControls();
