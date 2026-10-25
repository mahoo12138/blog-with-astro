import { defineElement } from '../define';
import { baseSheet, sheet, ghostButtonCss } from '../styles';
import { readJsonChild, ListenerBag, prefersReducedMotion } from '../behaviors/dom';
import { mountCanvasHost } from '../behaviors/canvas-host';
import { vars } from '../../styles/theme.css';

/**
 * kl-memory-map —— 装载/内存布局动画（canvas）。
 *
 * 数据（JSON 子节点）：
 *   {"blocks":[{"label":"Stack · 栈","desc":"…","color":"#b99af4"}],
 *    "file":{"label":"hello","format":"ELF","sections":[".text",".rodata"]},
 *    "stages":["读取格式头","建立映射","按需访问页面"],
 *    "doneStatus":"…","resetStatus":"…"}
 *
 * 行为：play 走完 2.8s 映射动画（reduced-motion 直接终帧）；reset 复位。
 * 画布动画在 shadow 内；教学叙述写在课时正文。
 */
interface MemBlock {
	label: string;
	desc: string;
	color: string;
}
interface MemData {
	blocks: MemBlock[];
	file: { label: string; format: string; sections: string[] };
	stages: string[];
	doneStatus: string;
	resetStatus: string;
}

const ownSheet = sheet`
	${ghostButtonCss}
	.canvas-wrap {
		background: ${vars.color.backgroundElevated};
		border: 1px solid ${vars.color.border};
		border-radius: ${vars.radius.md};
		padding: 12px;
		overflow: hidden;
	}
	canvas {
		width: 100%;
		display: block;
		height: 320px;
	}
	.controls {
		display: flex;
		gap: ${vars.space.sm};
		margin-top: ${vars.space.md};
	}
	.status {
		font-family: ${vars.font.mono};
		font-size: 11px;
		color: ${vars.color.textMuted};
		align-self: center;
		margin-left: auto;
	}
`;

class KlMemoryMap extends HTMLElement {
	#bag = new ListenerBag();

	connectedCallback(): void {
		const data = readJsonChild<MemData>(this);
		if (!data?.blocks?.length) return;

		const root = this.attachShadow({ mode: 'open' });
		root.adoptedStyleSheets = [baseSheet, ownSheet];
		root.innerHTML = `
			<div class="canvas-wrap"><canvas></canvas></div>
			<div class="controls">
				<button class="btn" type="button" data-play>建立映射</button>
				<button class="btn" type="button" data-reset>重置</button>
				<span class="status" role="status" aria-live="polite"></span>
			</div>
		`;

		const canvas = root.querySelector('canvas')!;
		const status = root.querySelector('.status')!;
		status.textContent = data.resetStatus;

		let progress = 0;

		mountCanvasHost(canvas, (ctxHost) => {
			const draw = (p: number) => {
				const { ctx } = ctxHost;
				const { width: w, height: h } = ctxHost.size();
				ctx.clearRect(0, 0, w, h);

				const compact = w < 520;
				const fileX = 14;
				const fileW = compact ? 72 : 92;
				const blocksX = compact ? fileX + fileW + 16 : fileX + fileW + 30;
				const blocksW = w - blocksX - 16;
				const blockH = Math.min(47, (h - 70) / data.blocks.length - 8);
				const gap = 8;

				// 左侧文件盒
				roundRect(ctx, fileX, h / 2 - 64, fileW, 128, 9, true, true);
				ctx.fillStyle = getVar(ctxHost.canvas, vars.color.textStrong, '#d8e5f8');
				ctx.font = 'bold 11px ui-monospace, monospace';
				ctx.fillText(data.file.label, fileX + 12, h / 2 - 40);
				ctx.fillText(data.file.format, fileX + 12, h / 2 - 24);
				ctx.fillStyle = getVar(ctxHost.canvas, vars.color.textMeta, '#8298b5');
				ctx.font = '10px ui-monospace, monospace';
				data.file.sections.slice(0, 4).forEach((s, i) => {
					ctx.fillText(s, fileX + 12, h / 2 + 2 + i * 15);
				});

				// 右侧内存块
				data.blocks.forEach((block, i) => {
					const y = 16 + i * (blockH + gap);
					roundRect(ctx, blocksX, y, blocksW, blockH, 8, true, true);
					ctx.globalAlpha = 0.95;
					ctx.fillStyle = block.color;
					roundRect(ctx, blocksX + 9, y + 9, 6, blockH - 18, 3, true, false);
					ctx.globalAlpha = 1;
					ctx.fillStyle = getVar(ctxHost.canvas, vars.color.textStrong, '#e2ebf8');
					ctx.font = 'bold 12px ui-sans-serif, system-ui';
					ctx.fillText(block.label, blocksX + 25, y + 19);
					ctx.fillStyle = getVar(ctxHost.canvas, vars.color.textMeta, '#9bacbf');
					ctx.font = '10px ui-sans-serif, system-ui';
					ctx.fillText(block.desc.slice(0, 60), blocksX + 25, y + 35);
				});

				// 动画包
				if (p > 0) {
					const t = Math.min(1, p);
					const targetY = 16 + (data.blocks.length - 1) * (blockH + gap) + blockH / 2;
					ctx.strokeStyle = vars.color.accent;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(fileX + fileW + 2, h / 2);
					ctx.bezierCurveTo(fileX + fileW + 14, h / 2 + 30, blocksX - 14, targetY, blocksX - 2, targetY);
					ctx.stroke();
					ctx.fillStyle = vars.tone.warning.fg;
					ctx.beginPath();
					ctx.arc(fileX + fileW + 2 + t * (blocksX - fileX - fileW - 6), h / 2 + (targetY - h / 2) * t, 5, 0, Math.PI * 2);
					ctx.fill();
					const stageIndex = p < 0.35 ? 0 : p < 0.72 ? 1 : 2;
					ctx.fillStyle = vars.color.textMeta;
					ctx.font = '10px ui-monospace, monospace';
					ctx.fillText(data.stages[stageIndex] ?? '', fileX, h - 12);
				}
			};

			ctxHost.onResize(() => draw(progress));
			ctxHost.onFrame(() => draw(progress));

			const play = () => {
				if (prefersReducedMotion()) {
					progress = 1;
					status.textContent = data.doneStatus;
					ctxHost.redraw();
					return;
				}
				progress = 0;
				status.textContent = '正在建立映射…';
				const t0 = performance.now();
				const tick = (now: number) => {
					progress = Math.min(1, (now - t0) / 2800);
					if (progress < 1) requestAnimationFrame(tick);
					else status.textContent = data.doneStatus;
				};
				requestAnimationFrame(tick);
			};

			const reset = () => {
				progress = 0;
				status.textContent = data.resetStatus;
				ctxHost.redraw();
			};

			this.#bag.add(root.querySelector('[data-play]')!, 'click', play);
			this.#bag.add(root.querySelector('[data-reset]')!, 'click', reset);
		});
	}

	disconnectedCallback(): void {
		this.#bag.destroy();
		// canvas-host 的 destroy 由其自身管理（观察者在元素 detach 后自然失效）
	}
}

function roundRect(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
	fill: boolean,
	stroke: boolean,
): void {
	c.beginPath();
	c.moveTo(x + r, y);
	c.arcTo(x + w, y, x + w, y + h, r);
	c.arcTo(x + w, y + h, x, y + h, r);
	c.arcTo(x, y + h, x, y, r);
	c.arcTo(x, y, x + w, y, r);
	c.closePath();
	if (fill) c.fill();
	if (stroke) c.stroke();
}

function getVar(el: HTMLElement, name: string, fallback: string): string {
	const v = getComputedStyle(el).getPropertyValue(name).trim();
	return v || fallback;
}

defineElement('kl-memory-map', KlMemoryMap);
