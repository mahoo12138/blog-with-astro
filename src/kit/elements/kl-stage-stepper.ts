import { defineElement } from '../define';
import { baseSheet, sheet, ghostButtonCss } from '../styles';
import { readJsonChild, ListenerBag } from '../behaviors/dom';
import { createStepper } from '../behaviors/stepper-core';
import { vars } from '../../styles/theme.css';

/**
 * kl-stage-stepper —— 通用 N 阶段推进演示。
 *
 * 数据（stages JSON 子节点）：
 *   [{"title":"调用 printf","body":"…","status":"stdout buffer: …"}]
 *
 * 渲染：状态行（aria-live）+ 终端式展示区 + next/reset。
 * 用于任意「阶段链路」教学（输出链路、握手过程…）。
 */
interface Stage {
	title: string;
	body: string;
	status: string;
	/** 可选：展示区里出现的已输出文本 */
	printed?: string;
}

const ownSheet = sheet`
	${ghostButtonCss}
	.panel {
		border: 1px solid ${vars.color.border};
		border-radius: ${vars.radius.lg};
		background: ${vars.color.surfaceStrong};
		padding: ${vars.space.xl};
	}
	.term {
		background: ${vars.color.backgroundElevated};
		border-radius: ${vars.radius.md};
		padding: 14px 16px;
		font-family: ${vars.font.mono};
		font-size: 12px;
		line-height: 1.8;
		min-height: 96px;
	}
	.term .dim { color: ${vars.color.textMeta}; }
	.term .printed { color: ${vars.color.accentStrong}; font-weight: 700; }
	.status {
		margin: ${vars.space.md} 0 0;
		font-size: 12px;
		line-height: 1.8;
		color: ${vars.color.textMuted};
		min-height: 2.4em;
	}
	.controls {
		display: flex;
		gap: ${vars.space.sm};
		margin-top: ${vars.space.md};
	}
	.progress {
		font-family: ${vars.font.mono};
		font-size: 10px;
		letter-spacing: 0.08em;
		color: ${vars.color.textMeta};
		margin-left: auto;
		align-self: center;
	}
`;

class KlStageStepper extends HTMLElement {
	#bag = new ListenerBag();
	#stages: Stage[] = [];
	#stepper = createStepper({ count: 0, onChange: () => this.#render() });

	connectedCallback(): void {
		const data = readJsonChild<{ stages: Stage[] }>(this);
		this.#stages = data?.stages ?? [];
		if (this.#stages.length === 0) return;
		this.#stepper = createStepper({ count: this.#stages.length, onChange: () => this.#render() });

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `
			<div class="panel">
				<div class="term" part="screen"></div>
				<p class="status" role="status" aria-live="polite"></p>
				<div class="controls">
					<button class="btn" type="button" data-next>逐层推进 →</button>
					<button class="btn" type="button" data-reset>重置</button>
					<span class="progress"></span>
				</div>
			</div>
		`;
		this.#bag.add(root.querySelector('[data-next]')!, 'click', () => this.#stepper.next());
		this.#bag.add(root.querySelector('[data-reset]')!, 'click', () => this.#stepper.reset());
		this.#render();
	}

	disconnectedCallback(): void {
		this.#bag.destroy();
	}

	#render(): void {
		const root = this.shadowRoot;
		if (!root) return;
		const i = this.#stepper.index();
		const term = root.querySelector('.term')!;
		const status = root.querySelector('.status')!;
		const progress = root.querySelector('.progress')!;
		const nextBtn = root.querySelector('[data-next]')!;

		if (i < 0) {
			term.innerHTML = '';
			status.textContent = '尚未开始。';
			progress.textContent = `0 / ${this.#stages.length}`;
			nextBtn.textContent = '逐层推进 →';
			return;
		}

		const stage = this.#stages[i];
		const dim = document.createElement('div');
		dim.className = 'dim';
		dim.textContent = `stage ${i + 1} / ${this.#stages.length} · ${stage.title}`;
		term.innerHTML = '';
		term.append(dim);
		if (stage.printed) {
			const out = document.createElement('div');
			out.className = 'printed';
			out.textContent = stage.printed;
			term.append(out);
		}
		const tail = document.createElement('div');
		tail.className = 'dim';
		tail.textContent = stage.status;
		term.append(tail);

		status.textContent = stage.body;
		progress.textContent = `${i + 1} / ${this.#stages.length}`;
		nextBtn.textContent = i === this.#stages.length - 1 ? '从头演示 →' : '逐层推进 →';
	}
}

defineElement('kl-stage-stepper', KlStageStepper);
