import { useState } from 'react';
import * as styles from './PixelLens.css';
import * as ui from './islandUi.css';
import { vars } from '../../styles/theme.css';

/**
 * PixelLens —— 1 CSS 像素在不同 DPR 下的物理覆盖，以及四种「细线」写法的代价。
 *
 * 网格不是装饰：一个格子就是一个物理像素，高亮行数就是这条线真正占用的
 * 设备像素数。四种写法的真实渲染也一并画出来，避免只讲数值不给观感。
 */

type Method = 'px' | 'half' | 'scale' | 'shadow';

const DPRS = [1, 2, 3] as const;

const METHODS: { id: Method; label: string; value: string }[] = [
	{ id: 'px', label: 'border: 1px', value: '1 CSS px' },
	{ id: 'half', label: 'border: 0.5px', value: '0.5 CSS px' },
	{ id: 'scale', label: '伪元素 + scaleY', value: '1 物理像素' },
	{ id: 'shadow', label: 'box-shadow', value: '0.5 CSS px' },
];

const COLS_CSS = 4;
const ROWS_CSS = 2;
const CELL = 15;

function coveredRows(method: Method, dpr: number) {
	if (method === 'px') return dpr;
	if (method === 'scale') return 1;
	return Math.max(1, Math.round(0.5 * dpr));
}

function describe(method: Method, dpr: number, rows: number) {
	switch (method) {
		case 'px':
			return `1 CSS px 在 ${dpr}× 屏上占 ${dpr} 个物理像素。设计稿那条 1px 是按物理像素标的，于是它比你想要的粗了 ${dpr} 倍——这不是浏览器画错了，是单位对不上。`;
		case 'half':
			return dpr === 1
				? '1× 屏上 0.5px 会被取整成 1px，等于没做；这个方案只在高分屏上有意义。'
				: `0.5 CSS px ≈ ${(0.5 * dpr).toFixed(1)} 个物理像素，浏览器取整到 ${rows} 个。iOS Safari 稳定，部分 Android WebView 会渲染成 1px 或直接消失，所以工程上通常配降级。`;
		case 'scale':
			return `父元素高 1px，子元素 transform: scaleY(${(1 / dpr).toFixed(2)})。布局仍按 1px 计算，绘制只剩 1 个物理像素：${dpr}× 与 1× 都能精确得到细线，代价是多一层合成与圆角处理。`;
		default:
			return `box-shadow 不参与布局，0.5px 的扩展在 ${dpr}× 屏上落在 ${rows} 个物理像素；能跟着 border-radius 走，但不改变盒模型，也没法用它做单边描边以外的结构。`;
	}
}

export default function PixelLens() {
	const [dpr, setDpr] = useState<(typeof DPRS)[number]>(2);
	const [method, setMethod] = useState<Method>('px');

	const cols = COLS_CSS * dpr;
	const rows = ROWS_CSS * dpr;
	const lit = coveredRows(method, dpr);
	const current = METHODS.find((item) => item.id === method) ?? METHODS[0];

	const cells = Array.from({ length: cols * rows }, (_, index) => {
		const row = Math.floor(index / cols);
		return { key: index, on: row < lit };
	});

	return (
		<section className={ui.root}>
			<p className={ui.eyebrow}>INTERACTIVE · PIXEL LENS</p>
			<h3 className={ui.title}>1px 到底有多粗？</h3>
			<p className={ui.lead}>
				把屏幕放大到能看见物理像素：一个格子就是一个设备像素。切换 DPR 与写法，看这条线真正吃掉几格。
			</p>

			<div className={styles.footRow} style={{ marginBottom: vars.space.lg }}>
				<div role="group" aria-label="设备像素比" className={ui.segmentRow}>
					{DPRS.map((value) => (
						<button
							key={value}
							type="button"
							className={ui.segment}
							aria-pressed={dpr === value}
							onClick={() => setDpr(value)}
						>
							{value}× 屏
						</button>
					))}
				</div>
				<p className={styles.hint}>
					{dpr === 1 ? '普通显示器' : dpr === 2 ? 'Retina / 主流手机' : 'iPhone Pro 系列'}
				</p>
			</div>

			<div className={styles.layout}>
				<div className={styles.lensPane}>
					<span className={styles.lensCaption}>1 CSS px 的横截面</span>
					<div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}>
						{cells.map((cell) => (
							<span key={cell.key} className={`${styles.cell} ${cell.on ? styles.covered : ''}`} />
						))}
					</div>
					<div className={styles.axis}>
						<span>1 格 = 1 物理像素</span>
						<span>
							{cols} × {rows} 格
						</span>
					</div>
				</div>

				<div className={styles.lensPane}>
					<p className={styles.noteStrong}>
						{current.label} → 占 {lit} 个物理像素
					</p>
					<p className={styles.note}>{describe(method, dpr, lit)}</p>
				</div>
			</div>

			<div className={styles.swatchList} role="group" aria-label="细线实现方式">
				{METHODS.map((item) => {
					const color = vars.color.accentStrong;
					const itemLit = coveredRows(item.id, dpr);
					return (
						<button
							key={item.id}
							type="button"
							className={styles.swatchRow}
							aria-pressed={method === item.id}
							onClick={() => setMethod(item.id)}
						>
							<span className={styles.swatchName}>{item.label}</span>
							<span className={styles.swatch}>
								<span
									className={styles.line}
									style={{
										height: item.id === 'half' ? 0.5 : 1,
										transform: item.id === 'scale' ? `scaleY(${(1 / dpr).toFixed(3)})` : undefined,
										transformOrigin: 'top',
										background: item.id === 'shadow' ? 'transparent' : color,
										boxShadow: item.id === 'shadow' ? `inset 0 0.5px 0 0 ${color}` : undefined,
									}}
								/>
							</span>
							<span className={styles.swatchValue}>
								{itemLit} 物理 px
							</span>
						</button>
					);
				})}
			</div>

			<p className={styles.hint}>
				四条线是按真实 CSS 渲染的，不是画出来的示意。数值那一列才是它在 {dpr}× 屏上的实际覆盖。
			</p>
		</section>
	);
}
