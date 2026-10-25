import { defineElement } from '../define';
import { baseSheet, sheet, ghostButtonCss } from '../styles';
import { readJsonChild, ListenerBag } from '../behaviors/dom';
import { createStepper } from '../behaviors/stepper-core';
import { vars } from '../../styles/theme.css';

/**
 * kl-instr-stepper —— 指令单步执行模型：汇编表 + 寄存器状态 + 解释。
 *
 * 数据（JSON 子节点）：
 *   {"rows":[{"addr":"main + 00","code":"push rbp"}],
 *    "regs":[{"label":"RIP · 指令位置"}],
 *    "steps":[{"note":"push rbp","explain":"…","values":["…"]}],
 *    "initial":{"values":["…"],"status":"…","explain":"…"}}
 *
 * values 与 regs 一一对应；steps[i].values 是第 i 步后的寄存器值。
 */
interface InstrRow {
	addr: string;
	code: string;
}
interface InstrReg {
	label: string;
}
interface InstrStep {
	note: string;
	explain: string;
	values: string[];
}
interface InstrData {
	rows: InstrRow[];
	regs: InstrReg[];
	steps: InstrStep[];
	initial?: { values: string[]; status: string; explain: string };
}

const ownSheet = sheet`
	${ghostButtonCss}
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(230px, 0.65fr);
		gap: ${vars.space.lg};
		align-items: start;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-family: ${vars.font.mono};
		font-size: 12px;
		line-height: 1.65;
	}
	th {
		text-align: left;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: ${vars.color.textMeta};
		background: ${vars.color.backgroundElevated};
		padding: 9px;
	}
	td {
		padding: 8px 9px;
		border-bottom: 1px solid ${vars.color.border};
		color: ${vars.color.text};
		vertical-align: top;
	}
	tr.active {
		background: ${vars.tone.success.bg};
		box-shadow: inset 3px 0 ${vars.tone.success.fg};
	}
	.addr { color: ${vars.color.textMeta}; }
	.regs {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}
	.reg {
		border: 1px solid ${vars.color.border};
		background: ${vars.color.backgroundElevated};
		border-radius: ${vars.radius.sm};
		padding: 9px;
		min-width: 0;
	}
	.reg small {
		display: block;
		font-family: ${vars.font.mono};
		font-size: 10px;
		color: ${vars.color.textMeta};
	}
	.reg b {
		display: block;
		font-family: ${vars.font.mono};
		font-size: 12px;
		color: ${vars.color.textStrong};
		overflow-wrap: anywhere;
	}
	.reg.changed {
		border-color: ${vars.tone.success.fg};
		background: ${vars.tone.success.bg};
	}
	.explain {
		margin: ${vars.space.md} 0 0;
		font-size: 12px;
		line-height: 1.85;
		color: ${vars.color.textMuted};
		min-height: 3.5em;
	}
	.explain strong {
		font-family: ${vars.font.mono};
		color: ${vars.color.textStrong};
	}
	.controls {
		display: flex;
		gap: ${vars.space.sm};
		margin-top: ${vars.space.md};
	}
	.status {
		font-family: ${vars.font.mono};
		font-size: 10px;
		letter-spacing: 0.08em;
		color: ${vars.color.textMeta};
		align-self: center;
		margin-left: auto;
	}
	@media (max-width: 768px) {
		.wrap { grid-template-columns: 1fr; }
	}
`;

class KlInstrStepper extends HTMLElement {
	#bag = new ListenerBag();
	#data: InstrData | null = null;
	#stepper = createStepper({ count: 0, onChange: () => this.#render() });

	connectedCallback(): void {
		this.#data = readJsonChild<InstrData>(this);
		if (!this.#data || !this.#data.steps?.length) return;
		this.#stepper = createStepper({ count: this.#data.steps.length, onChange: () => this.#render() });

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];

		const rowsHtml = this.#data.rows
			.map(
				(r, i) =>
					`<tr data-instr="${i}"><td class="addr">${escapeHtml(r.addr)}</td><td>${escapeHtml(r.code)}</td></tr>`,
			)
			.join('');
		const regsHtml = this.#data.regs
			.map(
				(r, i) =>
					`<div class="reg" data-reg="${i}"><small>${escapeHtml(r.label)}</small><b>—</b></div>`,
			)
			.join('');

		root.innerHTML = `
			<div class="wrap">
				<div>
					<table>
						<thead><tr><th>地址</th><th>指令</th></tr></thead>
						<tbody>${rowsHtml}</tbody>
					</table>
					<p class="explain" role="status" aria-live="polite"></p>
					<div class="controls">
						<button class="btn" type="button" data-next>单步执行 →</button>
						<button class="btn" type="button" data-reset>重置</button>
						<span class="status"></span>
					</div>
				</div>
				<div class="regs">${regsHtml}</div>
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
		const data = this.#data;
		if (!root || !data) return;
		const i = this.#stepper.index();

		root.querySelectorAll('tr[data-instr]').forEach((tr, k) => {
			tr.classList.toggle('active', k === i);
		});

		const explain = root.querySelector('.explain')!;
		const status = root.querySelector('.status')!;

		if (i < 0) {
			const initial = data.initial;
			explain.innerHTML = initial ? escapeHtml(initial.explain) : '按「单步执行」开始。';
			status.textContent = initial?.status ?? '准备执行';
			this.#paintRegs(initial?.values, null);
			return;
		}

		const step = data.steps[i];
		explain.innerHTML = `<strong>${escapeHtml(step.note)}</strong>：${escapeHtml(step.explain)}`;
		status.textContent = `正在执行第 ${i + 1} 步 · ${i + 1} / ${data.steps.length}`;
		const prev = i > 0 ? data.steps[i - 1].values : data.initial?.values ?? null;
		this.#paintRegs(step.values, prev);
	}

	#paintRegs(values?: string[] | null, prev?: string[] | null): void {
		const root = this.shadowRoot;
		if (!root) return;
		root.querySelectorAll('.reg').forEach((reg, k) => {
			const val = values?.[k] ?? '—';
			const b = reg.querySelector('b');
			if (b) b.textContent = val;
			reg.classList.toggle('changed', Boolean(prev && prev[k] !== undefined && prev[k] !== val));
		});
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

defineElement('kl-instr-stepper', KlInstrStepper);
