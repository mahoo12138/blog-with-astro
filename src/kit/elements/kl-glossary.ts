import { defineElement } from '../define';
import { baseSheet, sheet, ghostButtonCss } from '../styles';
import { emitKl, readJsonChild, ListenerBag } from '../behaviors/dom';
import { vars } from '../../styles/theme.css';

/**
 * kl-glossary —— 术语表：词目 chips + 详情面板。
 *
 * 数据（terms JSON 子节点）：
 *   [{"key":"elf","label":"ELF","desc":"…"}]
 *
 * 可见的 chips 是 shadow 内动态面板（补充材料）；
 * 各词的完整解释同时以 <kl-term> / 正文形式留在光 DOM 才是索引真源。
 */
interface GlossaryTerm {
	key: string;
	label: string;
	desc: string;
}

const ownSheet = sheet`
	${ghostButtonCss}
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.8fr);
		gap: ${vars.space.lg};
		align-items: start;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		border: 1px solid ${vars.color.border};
		background: transparent;
		border-radius: ${vars.radius.sm};
		padding: 5px 10px;
		font-family: ${vars.font.mono};
		font-size: 11px;
		color: ${vars.color.text};
		transition: background ${vars.motion.durationFast} ${vars.motion.ease},
			color ${vars.motion.durationFast} ${vars.motion.ease},
			border-color ${vars.motion.durationFast} ${vars.motion.ease};
	}
	.chip:hover {
		background: ${vars.color.accentSoft};
		color: ${vars.color.accentStrong};
	}
	.chip[aria-expanded="true"] {
		background: ${vars.color.accentSoft};
		border-color: ${vars.color.accent};
		color: ${vars.color.accentStrong};
		font-weight: 700;
	}
	.detail {
		border: 1px solid ${vars.color.border};
		border-radius: ${vars.radius.md};
		background: ${vars.color.surfaceStrong};
		padding: ${vars.space.lg};
		min-height: 96px;
		font-size: 13px;
		line-height: 1.85;
		color: ${vars.color.text};
	}
	.detail .kicker {
		font-family: ${vars.font.mono};
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: ${vars.color.accentStrong};
		margin: 0 0 6px;
	}
	.detail .empty {
		color: ${vars.color.textMeta};
	}
	@media (max-width: 768px) {
		.wrap { grid-template-columns: 1fr; }
	}
`;

class KlGlossary extends HTMLElement {
	#bag = new ListenerBag();
	#terms: GlossaryTerm[] = [];
	#active = -1;

	connectedCallback(): void {
		this.#terms = (readJsonChild<{ terms: GlossaryTerm[] }>(this)?.terms ?? []).filter(
			(t) => t && t.label && t.desc,
		);
		if (this.#terms.length === 0) return;

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `
			<div class="wrap">
				<div class="chips" role="group" aria-label="术语列表"></div>
				<div class="detail" role="status" aria-live="polite">
					<p class="kicker">GLOSSARY / 术语</p>
					<p class="empty">点击左侧词目查看解释。</p>
				</div>
			</div>
		`;

		const chips = root.querySelector('.chips')!;
		this.#terms.forEach((term, i) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'chip';
			btn.textContent = term.label;
			btn.setAttribute('aria-expanded', 'false');
			this.#bag.add(btn, 'click', () => this.#select(i));
			chips.append(btn);
		});
	}

	disconnectedCallback(): void {
		this.#bag.destroy();
	}

	#select(i: number): void {
		this.#active = i;
		const root = this.shadowRoot;
		if (!root) return;
		const chips = root.querySelectorAll('.chip');
		chips.forEach((chip, k) => chip.setAttribute('aria-expanded', String(k === i)));
		const term = this.#terms[i];
		const detail = root.querySelector('.detail');
		if (detail && term) {
			detail.innerHTML = `<p class="kicker"></p><p class="desc"></p>`;
			detail.querySelector('.kicker')!.textContent = term.label;
			detail.querySelector('.desc')!.textContent = term.desc;
		}
		emitKl(this, 'glossary-select', { key: term.key });
	}
}

defineElement('kl-glossary', KlGlossary);
