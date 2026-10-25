import { defineElement } from '../define';
import { readJsonChild } from '../behaviors/dom';

/**
 * kl-term-annotate —— 术语自动注解。
 *
 * 用法（dict 放 JSON 子节点；只处理自己的光 DOM 子树）：
 *   <kl-term-annotate>
 *     <script type="application/json">{"ELF":"…","ASLR":"…"}</script>
 *     <p>正文里的 ELF 与 ASLR 会被包成 kl-term…</p>
 *   </kl-term-annotate>
 *
 * 幂等：已包好的 kl-term 与 code/pre/a 等内容不会再被处理。
 * 显式 <kl-term> 是正式写法，本元素只是写作糖。
 */
const SKIP_SELECTOR = 'code, pre, script, style, svg, canvas, button, a, input, textarea, select, kl-term, .term-done';

class KlTermAnnotate extends HTMLElement {
	#done = false;

	connectedCallback(): void {
		// children 在 connectedCallback 时已就绪
		queueMicrotask(() => this.#annotate());
	}

	#annotate(): void {
		if (this.#done || !this.isConnected) return;
		this.#done = true;

		const dict = readJsonChild<Record<string, string>>(this) ?? {};
		const keys = Object.keys(dict)
			.filter((k) => k.length > 1)
			.sort((a, b) => b.length - a.length);
		if (keys.length === 0) return;

		const pattern = new RegExp(`\\b(${keys.map(escapeRegExp).join('|')})\\b`, 'g');

		// 只遍历自己的光 DOM 子树（不含 JSON script 与已跳过节点）
		const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => {
				const parent = node.parentElement;
				if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
				const value = node.nodeValue;
				if (!value || !pattern.test(value)) {
					pattern.lastIndex = 0;
					return NodeFilter.FILTER_REJECT;
				}
				pattern.lastIndex = 0;
				return NodeFilter.FILTER_ACCEPT;
			},
		});

		const targets: Text[] = [];
		while (walker.nextNode()) targets.push(walker.currentNode as Text);

		for (const node of targets) {
			const value = node.nodeValue;
			if (!value) continue;
			const frag = document.createDocumentFragment();
			let last = 0;
			let match: RegExpExecArray | null;
			pattern.lastIndex = 0;
			while ((match = pattern.exec(value)) !== null) {
				if (match.index > last) frag.append(document.createTextNode(value.slice(last, match.index)));
				const word = match[0];
				const tip = document.createElement('kl-term');
				tip.setAttribute('term', word);
				tip.setAttribute('def', dict[word] ?? '');
				tip.textContent = word;
				frag.append(tip);
				last = match.index + word.length;
			}
			if (last < value.length) frag.append(document.createTextNode(value.slice(last)));
			node.parentNode?.replaceChild(frag, node);
		}
	}
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

defineElement('kl-term-annotate', KlTermAnnotate);
