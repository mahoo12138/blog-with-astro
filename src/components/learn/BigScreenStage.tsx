import { useEffect, useRef, useState } from 'react';
import * as styles from './BigScreenStage.css';
import * as ui from './islandUi.css';

/**
 * BigScreenStage —— 1920×1080 看板在三种适配策略、三种屏幕比例下的表现。
 *
 * 关键对照：同一份 DOM，只换布局策略。
 * - scale：布局像素不重算，整体缩放，四周黑边；
 * - fill：宽高各自铺满，图形被拉变形；
 * - fluid：字号与间距跟随容器，栅格重排，形状保持。
 * 屏幕尺寸由 CSS aspect-ratio 决定，再用 ResizeObserver 读取真实像素来算缩放比，
 * 这样指标栏里的数字是量出来的，不是我按比例手算的。
 */

type Strategy = 'scale' | 'fill' | 'fluid';

const STRATEGIES: { id: Strategy; label: string; hint: string }[] = [
	{ id: 'scale', label: '等比缩放', hint: 'scale(min(w/1920, h/1080))' },
	{ id: 'fill', label: '拉伸铺满', hint: 'width / height 各拉各的' },
	{ id: 'fluid', label: '弹性重排', hint: '栅格 + clamp 字号' },
];

const RATIOS = [
	{ id: '16:9', label: '16 : 9', note: '1920 × 1080', ar: 16 / 9 },
	{ id: '21:9', label: '21 : 9', note: '超宽拼接', ar: 21 / 9 },
	{ id: '4:3', label: '4 : 3', note: '老投影', ar: 4 / 3 },
] as const;

const KPI = [
	['在线设备', '1,284'],
	['今日能耗', '8,642'],
	['未处理告警', '12'],
	['到岗率', '96%'],
];

const BARS = [42, 68, 55, 82, 61, 90, 74];

export default function BigScreenStage() {
	const [strategy, setStrategy] = useState<Strategy>('scale');
	const [ratio, setRatio] = useState<(typeof RATIOS)[number]['id']>('16:9');
	const screenRef = useRef<HTMLDivElement>(null);
	const [box, setBox] = useState({ w: 748, h: 420 });

	useEffect(() => {
		const el = screenRef.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			const rect = entries[0]?.contentRect;
			if (rect && rect.width > 0) setBox({ w: rect.width, h: rect.height });
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const active = RATIOS.find((item) => item.id === ratio) ?? RATIOS[0];
	const s = Math.min(box.w / 1920, box.h / 1080);
	const scaleX = box.w / 1920;
	const scaleY = box.h / 1080;
	const fluidFont = Math.min(40, Math.max(8, box.w * 0.021));
	const fontPx = strategy === 'scale' ? 40 * s : strategy === 'fill' ? 20 : fluidFont;
	const letterboxX = Math.max(0, (box.w - 1920 * s) / 2);
	const letterboxY = Math.max(0, (box.h - 1080 * s) / 2);

	const dashClass =
		strategy === 'scale' ? styles.dashScale : strategy === 'fill' ? styles.dashFill : styles.dashFluid;

	return (
		<section className={ui.root}>
			<p className={ui.eyebrow}>INTERACTIVE · BIG SCREEN LAB</p>
			<h3 className={ui.title}>同一块看板，三种拉伸方式</h3>
			<p className={ui.lead}>
				设计稿 1920×1080。换一块 21:9 的拼接屏、或者一台 4:3 的老投影，三种策略给出的不是「一样好」，而是三种不同的坏。
			</p>

			<div className={styles.controls}>
				<div className={ui.segmentRow} role="group" aria-label="适配策略">
					{STRATEGIES.map((item) => (
						<button
							key={item.id}
							type="button"
							className={ui.segment}
							aria-pressed={strategy === item.id}
							title={item.hint}
							onClick={() => setStrategy(item.id)}
						>
							{item.label}
						</button>
					))}
				</div>
				<div className={ui.segmentRow} role="group" aria-label="屏幕比例">
					{RATIOS.map((item) => (
						<button
							key={item.id}
							type="button"
							className={ui.segment}
							aria-pressed={ratio === item.id}
							onClick={() => setRatio(item.id)}
						>
							{item.label}
							<span style={{ marginLeft: 6, opacity: 0.6, fontSize: '10px' }}>{item.note}</span>
						</button>
					))}
				</div>
			</div>

			<div className={styles.stage}>
				<div
					ref={screenRef}
					className={`${styles.screen} ${strategy === 'scale' ? styles.letterbox : ''}`}
					style={{ width: `min(100%, ${Math.round(380 * active.ar)}px)`, aspectRatio: String(active.ar) }}
				>
					<div
						className={`${styles.dash} ${dashClass}`}
						style={
							strategy === 'scale'
								? {
										transform: `translate(-50%, -50%) scale(${s})`,
										transformOrigin: 'center center',
									}
								: undefined
						}
					>
						<div className={styles.header}>
							<span className={styles.dashTitle}>智慧园区 · 运营总览</span>
							<span className={styles.dashMeta}>2026-11-04 23:40</span>
						</div>

						<div className={styles.kpis}>
							{KPI.map(([label, value]) => (
								<div key={label} className={styles.kpi}>
									<span className={styles.kpiLabel}>{label}</span>
									<span className={styles.kpiValue}>{value}</span>
								</div>
							))}
						</div>

						<div className={styles.charts}>
							<div className={styles.pane}>
								<span className={styles.paneLabel}>近 7 日客流</span>
								<div className={styles.bars}>
									{BARS.map((height, index) => (
										<span
											key={index}
											className={styles.bar}
											style={{ height: `${height}%` }}
										/>
									))}
								</div>
							</div>
							<div className={styles.pane}>
								<span className={styles.paneLabel}>设备负载</span>
								<div className={styles.ringWrap}>
									<span
										className={`${styles.ring} ${strategy === 'fill' ? styles.ringFill : ''}`}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.metrics}>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>缩放比</span>
					<span className={styles.metricValue}>
						{strategy === 'fill'
							? `${scaleX.toFixed(2)} × ${scaleY.toFixed(2)}`
							: strategy === 'scale'
								? `${s.toFixed(2)}×`
								: '随容器'}
					</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>标题字号</span>
					<span className={styles.metricValue}>{fontPx.toFixed(1)} px</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>黑边</span>
					<span className={styles.metricValue}>
						{strategy === 'scale'
							? `${Math.round(letterboxX)} × ${Math.round(letterboxY)}`
							: '0 × 0'}
					</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>屏幕宽高比</span>
					<span className={styles.metricValue}>{active.label}</span>
				</div>
			</div>

			<p className={`${styles.note} ${strategy === 'fill' ? styles.noteWarn : ''}`}>
				{strategy === 'scale' &&
					`整层 scale(${s.toFixed(2)})：内容零变形、零重排，但字号掉到 ${fontPx.toFixed(1)}px，1px 边框按比例栅格化，四周留下 ${Math.round(letterboxY)}px 黑边。适合「大屏就是一块固定画布」的项目，不适合要塞进 iframe 或侧栏的场景。`}
				{strategy === 'fill' &&
					'宽高各自铺满：卡片、圆环、柱状图全部被拉成椭圆或胖柱，而字号仍是 20px —— 在 1920 上合适，在 4K 上偏小，在小拼接屏上偏大。只有「内容本身就是可拉伸底图」时才可以用。'}
				{strategy === 'fluid' &&
					`字号与间距跟随容器（当前 ${fontPx.toFixed(1)}px），栅格按比例重排，圆环用 aspect-ratio 保持正圆。没有黑边也不变形，代价是每个模块都要写自己的响应式规则，而不是一行 transform 收工。`}
			</p>
		</section>
	);
}
