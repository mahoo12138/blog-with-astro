import { defineElement } from '../define';
import { baseSheet, sheet } from '../styles';
import { emitKl, ListenerBag } from '../behaviors/dom';
import { vars } from '../../styles/theme.css';

/**
 * kl-term —— 行内术语弹层。
 *
 * 用法（光 DOM 文本即标签，pagefind 可索引）：
 *   <kl-term term="elf" def="Linux 常用的目标文件与可执行文件格式">ELF</kl-term>
 *
 * 行为：hover / focus / click 打开弹层，Escape 或点击外部关闭。
 */
const ownSheet = sheet`
	:host {
		display: inline;
		position: relative;
		margin: 0;
		border-bottom: 1px dashed ${vars.color.textMeta};
		cursor: help;
	}
	:host(:focus-visible) {
		outline: 2px solid ${vars.color.accentStrong};
		outline-offset: 2px;
		border-radius: 2px;
	}
	.label {
		color: inherit;
	}
	.popup {
		display: none;
		position: absolute;
		left: 0;
		top: calc(100% + 7px);
		z-index: 90;
		width: min(300px, 72vw);
		padding: 10px 12px;
		border: 1px solid ${vars.color.border};
		border-radius: ${vars.radius.md};
		background: ${vars.color.surfaceStrong};
		color: ${vars.color.text};
		box-shadow: ${vars.shadow.float};
		font-size: 12px;
		line-height: 1.65;
		letter-spacing: normal;
		text-transform: none;
		text-align: left;
		white-space: normal;
	}
	.popup::before {
		content: "术语解释";
		display: block;
		color: ${vars.color.accentStrong};
		font-family: ${vars.font.mono};
		font-weight: 700;
		font-size: 9px;
		letter-spacing: 0.1em;
		margin-bottom: 3px;
	}
	:host([open]) .popup,
	.popup:hover {
		display: block;
	}
`;

class KlTerm extends HTMLElement {
	#bag = new ListenerBag();
	#open = false;

	connectedCallback(): void {
		if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
		this.setAttribute('role', 'button');
		this.#syncAria();

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `<span class="label"><slot></slot></span><span class="popup"></span>`;

		this.#render();

		this.#bag.add(this, 'click', (ev) => {
			ev.stopPropagation();
			this.#toggle();
		});
		this.#bag.add(this, 'keydown', (ev) => {
			const e = ev as KeyboardEvent;
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.#toggle();
			} else if (e.key === 'Escape' && this.#open) {
				this.#close();
			}
		});
		this.#bag.add(document, 'click', (ev) => {
			if (this.#open && ev.target !== this && !this.contains(ev.target as Node)) this.#close();
		});
	}

	disconnectedCallback(): void {
		this.#bag.destroy();
	}

	static get observedAttributes(): string[] {
		return ['term', 'def'];
	}

	attributeChangedCallback(): void {
		if (this.shadowRoot) this.#render();
	}

	#render(): void {
		const popup = this.shadowRoot?.querySelector('.popup');
		if (!popup) return;
		const term = this.getAttribute('term') ?? '';
		const def = this.getAttribute('def') ?? '';
		popup.textContent = def;
		this.#syncAria(term);
	}

	#syncAria(term = this.getAttribute('term') ?? ''): void {
		this.setAttribute('aria-label', `${term}：查看术语解释`);
		this.setAttribute('aria-expanded', String(this.#open));
	}

	#toggle(): void {
		if (this.#open) this.#close();
		else {
			this.#open = true;
			this.setAttribute('open', '');
			this.#syncAria();
			emitKl(this, 'term-open', { term: this.getAttribute('term') });
		}
	}

	#close(): void {
		if (!this.#open) return;
		this.#open = false;
		this.removeAttribute('open');
		this.#syncAria();
	}
}

defineElement('kl-term', KlTerm);
