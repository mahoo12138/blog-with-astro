import { defineElement } from '../define';
import { baseSheet, sheet } from '../styles';
import { emitKl, readJsonChild, ListenerBag } from '../behaviors/dom';
import { vars } from '../../styles/theme.css';

/**
 * kl-flow-map —— 多阶段管线图 + 联动详情面板。
 *
 * 数据（steps JSON 子节点，节点按数组顺序蛇形排布）：
 *   [{"node":{"title":"源代码","lines":["hello.c","…"]},
 *     "kicker":"SOURCE / 源代码","title":"…","desc":"…","why":"…","io":"…",
 *     "concept":"…","phase":"build"}]
 *
 * 属性：cols（每行节点数，默认 3）。
 * 行为：点击 / Tab+Enter·Space 切换详情；aria-pressed 表示当前节点。
 */
interface FlowStep {
	node: { title: string; lines?: string[] };
	kicker: string;
	title: string;
	desc: string;
	why: string;
	io: string;
	concept: string;
	phase: 'build' | 'run';
}

const NODE_W = 212;
const NODE_H = 70;
const GAP_X = 42;
const GAP_Y = 24;

const ownSheet = sheet`
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.42fr) minmax(280px, 0.88fr);
		gap: ${vars.space.xl};
		align-items: stretch;
	}
	.map {
		min-width: 0;
	}
	.svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 11px;
		color: ${vars.color.textMuted};
		margin-top: 8px;
	}
	.legend i {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 3px;
		border: 1px solid ${vars.tone.success.fg};
		background: ${vars.tone.success.bg};
		margin-right: 5px;
	}
	.legend i.run-key {
		border-color: ${vars.color.border};
		background: ${vars.color.backgroundElevated};
	}
	.detail {
		border: 1px solid ${vars.color.border};
		border-radius: ${vars.radius.lg};
		background: ${vars.color.surfaceStrong};
		padding: ${vars.space.xl};
		min-width: 0;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.detail::before {
		content: "";
		position: absolute;
		left: 0;
		top: 18px;
		bottom: 18px;
		width: 3px;
		border-radius: 0 4px 4px 0;
		background: linear-gradient(${vars.color.accent}, ${vars.tone.info.fg});
	}
	.kicker {
		font-family: ${vars.font.mono};
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: ${vars.color.accentStrong};
		margin: 0 0 9px;
	}
	.detail h4 {
		font-family: ${vars.font.heading};
		font-size: clamp(18px, 2vw, 22px);
		line-height: 1.32;
		margin: 0 0 11px;
		letter-spacing: -0.02em;
		color: ${vars.color.textStrong};
	}
	.desc {
		font-size: 13px;
		line-height: 1.85;
		color: ${vars.color.textMuted};
		margin: 0 0 18px;
	}
	.block {
		border-top: 1px solid ${vars.color.border};
		padding: 12px 0 0;
		margin: 0 0 12px;
	}
	.block .label {
		font-family: ${vars.font.mono};
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${vars.color.textMeta};
		display: block;
		margin-bottom: 5px;
	}
	.block p {
		margin: 0;
		font-size: 12px;
		line-height: 1.85;
		color: ${vars.color.text};
	}
	.block.why {
		background: ${vars.tone.info.bg};
		border: 1px solid color-mix(in srgb, ${vars.tone.info.fg} 25%, transparent);
		border-radius: ${vars.radius.md};
		padding: 12px;
	}
	.block.why .label { color: ${vars.tone.info.fg}; }
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 8px;
		border-radius: ${vars.radius.pill};
		padding: 4px 10px;
		background: ${vars.color.accentSoft};
		color: ${vars.color.textMuted};
		font-family: ${vars.font.mono};
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
	}
	.pill.build {
		background: ${vars.tone.success.bg};
		color: ${vars.tone.success.fg};
	}
	@media (max-width: 980px) {
		.layout { grid-template-columns: 1fr; }
	}
`;

class KlFlowMap extends HTMLElement {
	#bag = new ListenerBag();
	#steps: FlowStep[] = [];
	#current = 0;

	connectedCallback(): void {
		const data = readJsonChild<{ steps: FlowStep[] }>(this);
		this.#steps = data?.steps ?? [];
		if (this.#steps.length === 0) return;

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `
			<div class="layout">
				<div class="map">
					<svg class="svg" role="img" aria-label="流程图"></svg>
					<div class="legend">
						<span><i></i>构建阶段</span>
						<span><i class="run-key"></i>运行阶段</span>
					</div>
				</div>
				<aside class="detail" aria-live="polite" aria-atomic="true">
					<p class="kicker"></p>
					<h4></h4>
					<p class="desc"></p>
					<div class="block why"><span class="label">WHY / 为什么需要这一步</span><p></p></div>
					<div class="block"><span class="label">INPUT → OUTPUT / 输入与输出</span><p class="io"></p></div>
					<div class="block"><span class="label">BEGINNER NOTE / 新手提示</span><p class="concept"></p></div>
					<span class="pill"></span>
				</aside>
			</div>
		`;
		this.#buildSvg();
		this.#render(0);
	}

	disconnectedCallback(): void {
		this.#bag.destroy();
	}

	#buildSvg(): void {
		const svg = this.shadowRoot?.querySelector('svg');
		if (!svg) return;
		const cols = Math.max(1, Number(this.getAttribute('cols') ?? 3) || 3);
		const rows = Math.ceil(this.#steps.length / cols);
		const width = cols * NODE_W + (cols - 1) * GAP_X;
		const height = rows * NODE_H + (rows - 1) * GAP_Y;
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.setAttribute('aria-label', `从起点到终点共 ${this.#steps.length} 个阶段的流程图`);

		const ns = 'http://www.w3.org/2000/svg';
		const defs = document.createElementNS(ns, 'defs');
		defs.innerHTML = `<marker id="kl-flow-arrow" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${vars.color.borderStrong}"></path></marker>`;
		svg.append(defs);

		const positions = this.#steps.map((_, i) => {
			const row = Math.floor(i / cols);
			const colInRow = i % cols;
			const col = row % 2 === 0 ? colInRow : cols - 1 - colInRow;
			return { x: col * (NODE_W + GAP_X), y: row * (NODE_H + GAP_Y) };
		});

		// 箭头
		for (let i = 0; i < positions.length - 1; i++) {
			const a = positions[i];
			const b = positions[i + 1];
			const path = document.createElementNS(ns, 'path');
			const sameRow = Math.abs(a.y - b.y) < 1;
			if (sameRow) {
				const [left, right] = a.x < b.x ? [a, b] : [b, a];
				if (a.x < b.x) {
					path.setAttribute('d', `M${a.x + NODE_W} ${a.y + NODE_H / 2} H${b.x - 6}`);
				} else {
					path.setAttribute('d', `M${a.x} ${a.y + NODE_H / 2} H${b.x + NODE_W + 6}`);
				}
				void left;
				void right;
			} else {
				path.setAttribute('d', `M${a.x + NODE_W / 2} ${a.y + NODE_H} V${b.y - 6}`);
			}
			path.setAttribute('fill', 'none');
			path.setAttribute('stroke', vars.color.borderStrong);
			path.setAttribute('stroke-width', '1.8');
			path.setAttribute('marker-end', 'url(#kl-flow-arrow)');
			svg.append(path);
		}

		// 节点
		this.#steps.forEach((step, i) => {
			const { x, y } = positions[i];
			const g = document.createElementNS(ns, 'g');
			g.setAttribute('class', 'flow-node');
			g.setAttribute('data-index', String(i));
			g.setAttribute('tabindex', '0');
			g.setAttribute('role', 'button');
			g.setAttribute('aria-pressed', 'false');
			g.setAttribute('aria-label', step.node.title);

			const rect = document.createElementNS(ns, 'rect');
			rect.setAttribute('x', String(x));
			rect.setAttribute('y', String(y));
			rect.setAttribute('width', String(NODE_W));
			rect.setAttribute('height', String(NODE_H));
			rect.setAttribute('rx', '10');
			rect.setAttribute('fill', step.phase === 'build' ? vars.tone.success.bg : vars.color.backgroundElevated);
			rect.setAttribute('stroke', step.phase === 'build' ? vars.tone.success.fg : vars.color.border);
			rect.setAttribute('stroke-width', '1.3');
			g.append(rect);

			const cx = x + NODE_W / 2;
			const title = document.createElementNS(ns, 'text');
			title.setAttribute('x', String(cx));
			title.setAttribute('y', String(y + 24));
			title.setAttribute('text-anchor', 'middle');
			title.setAttribute('font-size', '12');
			title.setAttribute('font-weight', '600');
			title.setAttribute('fill', vars.color.textStrong);
			title.textContent = step.node.title;
			g.append(title);

			(step.node.lines ?? []).slice(0, 2).forEach((line, k) => {
				const tiny = document.createElementNS(ns, 'text');
				tiny.setAttribute('x', String(cx));
				tiny.setAttribute('y', String(y + 41 + k * 15));
				tiny.setAttribute('text-anchor', 'middle');
				tiny.setAttribute('font-size', '10');
				tiny.setAttribute('fill', vars.color.textMeta);
				tiny.textContent = line;
				g.append(tiny);
			});

			const activate = () => this.#render(i);
			this.#bag.add(g, 'click', activate);
			this.#bag.add(g, 'keydown', (ev) => {
				const e = ev as KeyboardEvent;
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					activate();
				}
			});
			svg.append(g);
		});
	}

	#render(i: number): void {
		this.#current = i;
		const root = this.shadowRoot;
		if (!root) return;
		const step = this.#steps[i];
		if (!step) return;

		root.querySelectorAll('.flow-node').forEach((n, k) => {
			n.setAttribute('aria-pressed', String(k === i));
			const rect = n.querySelector('rect');
			if (!rect) return;
			if (k === i) {
				rect.setAttribute('fill', vars.color.accentSoft);
				rect.setAttribute('stroke', vars.color.accentStrong);
				rect.setAttribute('stroke-width', '2.7');
			} else {
				const phase = this.#steps[k]?.phase;
				rect.setAttribute('fill', phase === 'build' ? vars.tone.success.bg : vars.color.backgroundElevated);
				rect.setAttribute('stroke', phase === 'build' ? vars.tone.success.fg : vars.color.border);
				rect.setAttribute('stroke-width', '1.3');
			}
		});

		root.querySelector('.kicker')!.textContent = step.kicker;
		root.querySelector('h4')!.textContent = step.title;
		root.querySelector('.desc')!.textContent = step.desc;
		root.querySelector('.block.why p')!.textContent = step.why;
		root.querySelector('.io')!.textContent = step.io;
		root.querySelector('.concept')!.textContent = step.concept;
		const pill = root.querySelector('.pill')!;
		pill.className = step.phase === 'build' ? 'pill build' : 'pill';
		pill.textContent = step.phase === 'build' ? 'BUILD / 构建阶段' : 'RUN / 运行阶段';

		emitKl(this, 'flow-change', { index: i, phase: step.phase });
	}
}

defineElement('kl-flow-map', KlFlowMap);
