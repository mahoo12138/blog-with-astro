import { defineElement } from '../define';
import { baseSheet, sheet } from '../styles';
import { vars } from '../../styles/theme.css';

/**
 * kl-byte-strip —— 字符串 → 字节网格。
 *
 * 用法（标量走属性）：
 *   <kl-byte-strip value="hello world" c-string></kl-byte-strip>
 *
 * c-string 属性存在时自动追加 \0 终止符并高亮。
 * 可见网格在 shadow 内；教学叙述写在课时正文（光 DOM）。
 */
const ownSheet = sheet`
	.strip {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
		gap: 5px;
		margin: ${vars.space.md} 0 ${vars.space.sm};
	}
	.byte {
		border: 1px solid ${vars.color.border};
		background: ${vars.color.backgroundElevated};
		border-radius: 8px;
		text-align: center;
		padding: 7px 1px;
		min-width: 0;
	}
	.byte b {
		display: block;
		font-family: ${vars.font.mono};
		font-weight: 700;
		font-size: 11px;
		color: ${vars.color.accentStrong};
	}
	.byte span {
		display: block;
		font-size: 11px;
		color: ${vars.color.textMeta};
		overflow: hidden;
	}
	.byte.zero {
		background: ${vars.tone.warning.bg};
		border-color: ${vars.tone.warning.fg};
	}
	.byte.zero b { color: ${vars.tone.warning.fg}; }
	.hint {
		font-size: 11px;
		color: ${vars.color.textMeta};
		margin: 0;
	}
`;

class KlByteStrip extends HTMLElement {
	connectedCallback(): void {
		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `<div class="strip"></div><p class="hint"></p>`;
		this.#render();
	}

	static get observedAttributes(): string[] {
		return ['value', 'c-string'];
	}

	attributeChangedCallback(): void {
		if (this.shadowRoot) this.#render();
	}

	#render(): void {
		const root = this.shadowRoot;
		if (!root) return;
		const value = this.getAttribute('value') ?? '';
		const cString = this.hasAttribute('c-string');

		const bytes: Array<{ hex: string; ch: string; zero: boolean; title: string }> = [];
		for (const ch of value) {
			const code = ch.codePointAt(0) ?? 0;
			const hex = code <= 0xff ? code.toString(16).padStart(2, '0') : code.toString(16).padStart(4, '0');
			bytes.push({ hex, ch: ch === ' ' ? '␠' : ch, zero: false, title: ch === ' ' ? '空格' : ch });
		}
		if (cString) bytes.push({ hex: '00', ch: '\\0', zero: true, title: 'C 字符串终止符' });

		const strip = root.querySelector('.strip')!;
		strip.innerHTML = '';
		for (const b of bytes) {
			const cell = document.createElement('div');
			cell.className = b.zero ? 'byte zero' : 'byte';
			cell.title = b.title;
			const hexEl = document.createElement('b');
			hexEl.textContent = b.hex;
			const chEl = document.createElement('span');
			chEl.textContent = b.ch;
			cell.append(hexEl, chEl);
			strip.append(cell);
		}

		const hint = root.querySelector('.hint')!;
		const utf8 = new TextEncoder().encode(value).length;
		hint.textContent = `${[...value].length} 个字符 · UTF-8 ${utf8} 字节${cString ? ' · 含 \\0 终止符共 ' + (utf8 + 1) + ' 字节' : ''}`;
	}
}

defineElement('kl-byte-strip', KlByteStrip);
