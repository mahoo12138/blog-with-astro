import { useId, useState } from 'react';
import * as styles from './ViewportRuler.css';
import * as ui from './islandUi.css';
import { vars } from '../../styles/theme.css';

/**
 * ViewportRuler —— 同一份 750 设计稿在四种落地方式下的实际尺寸。
 *
 * 设计取舍：
 * - 预览画布不整体缩放。若把 1440 视口等比缩进 560 宽，字号会跟着缩到 3px，
 *   反而看不清「内容到底被放大成多大」。这里改为「画布最宽 560，超出部分裁切」，
 *   真实字号保持不变；屏宽与内容的相对关系交给下面的占比条表达。
 * - 四套方案的数学关系写在组件里，而不是让 MDX 传配置：正文只关心「展示这个
 *   对照实验」，不需要维护第二份规格表。
 */

type Strategy = 'px' | 'vw' | 'rem' | 'scale';

const STRATEGIES: { id: Strategy; label: string; hint: string }[] = [
	{ id: 'px', label: '裸 px', hint: '按标注值直接写' },
	{ id: 'vw', label: 'vw', hint: '1vw = 1% 视口宽' },
	{ id: 'rem', label: 'rem + JS', hint: '根字号 = 屏宽 / 10' },
	{ id: 'scale', label: 'transform', hint: '整层等比缩放' },
];

const DESIGN_WIDTHS = [375, 750] as const;
const DPRS = [1, 2, 3] as const;

/** 750 宽设计稿上的标注值；375 稿按 0.5 折算。 */
const SPEC_750 = { title: 32, body: 24, pad: 28, margin: 24, radius: 14, minWidth: 670 };

const CANVAS_MAX = 420;

export default function ViewportRuler() {
	const [width, setWidth] = useState(375);
	const [design, setDesign] = useState<(typeof DESIGN_WIDTHS)[number]>(750);
	const [strategy, setStrategy] = useState<Strategy>('vw');
	const [dpr, setDpr] = useState<(typeof DPRS)[number]>(2);

	const sliderId = useId();

	const unit = design === 750 ? 1 : 0.5;
	const spec = {
		title: SPEC_750.title * unit,
		body: SPEC_750.body * unit,
		pad: SPEC_750.pad * unit,
		margin: SPEC_750.margin * unit,
		radius: SPEC_750.radius * unit,
		minWidth: SPEC_750.minWidth * unit,
	};

	// px 方案不换算：写多少就是多少 CSS 像素。
	// 其余三种都把「设计稿 px」按 视口宽 / 设计稿宽 线性映射。
	const k = strategy === 'px' ? 1 : width / design;
	const cardW = spec.minWidth * k;
	const titleCss = spec.title * k;
	const titlePx = titleCss * dpr;
	const rootFont = width / 10;
	const contentRatio = cardW / width;
	const overflow = cardW > width + 0.5;

	const canvasW = Math.min(width, CANVAS_MAX);
	// 保持手机屏的长宽比，而不是固定高度：画布太矮会让内容挤在顶部。
	const canvasH = Math.round(canvasW * 1.5);

	const verdicts: { text: string; warn?: boolean }[] = [];
	if (overflow) {
		verdicts.push({
			text: `横向溢出：卡片 ${Math.round(cardW)}px 塞不进 ${width}px 视口，右侧被裁掉，用户必须横向滚动。`,
			warn: true,
		});
	}
	if (titleCss < 12) {
		verdicts.push({ text: `标题只有 ${titleCss.toFixed(1)}px，低于中文正文的可读下限。`, warn: true });
	}
	if ((strategy === 'vw' || strategy === 'rem') && width >= 1024) {
		verdicts.push({
			text: `宽屏失控：内容被放大 ${k.toFixed(2)} 倍，手机方案直接搬到桌面会得到一张巨型海报。`,
			warn: true,
		});
	}
	if (strategy === 'scale' && Math.abs(k - 1) > 0.01) {
		verdicts.push({
			text: `整层缩放 ${k.toFixed(2)}×：布局像素不重算，字号与 1px 线按比例栅格化，非整数倍会发虚。`,
		});
	}
	if (strategy === 'rem') {
		verdicts.push({
			text: `根字号被写成 ${rootFont.toFixed(1)}px，用户浏览器里设置的「最小字号 / 放大字号」会被覆盖。`,
		});
	}
	if (strategy === 'px') {
		verdicts.push({
			text: '裸 px 不随屏变化：它保证「标注值 = CSS 像素」，但不保证在不同屏宽下保持同一版式比例。',
		});
	}
	if (verdicts.length === 0) {
		verdicts.push({ text: '当前组合下没有明显副作用。' });
	}
	const shown = verdicts.slice(0, 3);

	return (
		<section className={ui.root}>
			<div className={styles.head}>
				<div>
					<p className={ui.eyebrow}>INTERACTIVE · ADAPTATION LAB</p>
					<h3 className={ui.title}>一份设计稿，四种落地方式</h3>
				</div>
				<span className={styles.readout}>
					{width} CSS px · {width * dpr} 物理 px
				</span>
			</div>
			<p className={ui.lead}>
				拖动视口宽度，切换方案与 DPR。四种做法在 375 宽的手机上几乎一致，差异要拉到 1024、1440 才会暴露出来。
			</p>

			<div className={styles.controls}>
				<div className={styles.row}>
					<label className={styles.fieldLabel} htmlFor={sliderId}>
						视口
					</label>
					<input
						id={sliderId}
						className={styles.slider}
						type="range"
						min={320}
						max={1440}
						step={1}
						value={width}
						onChange={(event) => setWidth(Number(event.currentTarget.value))}
					/>
					<span className={styles.readout}>{width} px</span>
				</div>

				<div className={styles.row} role="group" aria-label="设计稿宽度">
					<span className={styles.fieldLabel}>设计稿</span>
					<div className={ui.segmentRow}>
						{DESIGN_WIDTHS.map((value) => (
							<button
								key={value}
								type="button"
								className={ui.segment}
								aria-pressed={design === value}
								onClick={() => setDesign(value)}
							>
								{value} 稿
							</button>
						))}
					</div>
				</div>

				<div className={styles.row} role="group" aria-label="适配方案">
					<span className={styles.fieldLabel}>方案</span>
					<div className={ui.segmentRow}>
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
				</div>

				<div className={styles.row} role="group" aria-label="设备像素比">
					<span className={styles.fieldLabel}>DPR</span>
					<div className={ui.segmentRow}>
						{DPRS.map((value) => (
							<button
								key={value}
								type="button"
								className={ui.segment}
								aria-pressed={dpr === value}
								onClick={() => setDpr(value)}
							>
								{value}×
							</button>
						))}
					</div>
				</div>
			</div>

			<div className={styles.stage}>
				<div className={styles.screenWrap} style={{ width: canvasW, height: canvasH }}>
					<div className={styles.screen} style={{ width: canvasW, height: canvasH }}>
						<div className={styles.statusBar}>
							<span>9:41</span>
							<span>
								{width} × {Math.round(width * 1.78)}
							</span>
						</div>
						<div
							style={{
								display: 'flex',
								flex: '1 1 auto',
								flexDirection: 'column',
								minHeight: 0,
								overflow: 'hidden',
							}}
						>
							<div
								className={styles.previewCard}
								style={{
									width: cardW,
									margin: spec.margin * k,
									padding: spec.pad * k,
									borderRadius: spec.radius * k,
								}}
							>
								<div
									style={{
										fontSize: titleCss,
										fontWeight: 700,
										lineHeight: 1.25,
										letterSpacing: '-0.02em',
										color: vars.color.textStrong,
									}}
								>
									本周活跃
								</div>
								<div
									style={{
										marginTop: spec.body * 0.3 * k,
										fontSize: spec.body * 0.8 * k,
										lineHeight: 1.6,
										color: vars.color.textMuted,
									}}
								>
									过去 7 天的设备分布
								</div>
								<div
									className={styles.divider}
									style={{ margin: `${spec.body * 0.7 * k}px 0` }}
								/>
								{[
									['iOS', '62%'],
									['Android', '31%'],
									['其他', '7%'],
								].map(([label, value]) => (
									<div
										key={label}
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											gap: spec.body * 0.5 * k,
											fontSize: spec.body * 0.86 * k,
											lineHeight: 1.9,
											color: vars.color.text,
										}}
									>
										<span>{label}</span>
										<span style={{ fontFamily: vars.font.mono }}>{value}</span>
									</div>
								))}
								<div
									style={{
										marginTop: spec.body * 0.7 * k,
										display: 'inline-flex',
										padding: `${spec.body * 0.34 * k}px ${spec.body * 0.9 * k}px`,
										borderRadius: 999,
										background: vars.color.accentSoft,
										color: vars.color.accentStrong,
										fontSize: spec.body * 0.78 * k,
										fontWeight: 600,
									}}
								>
									查看明细
								</div>
							</div>
							{/* 首屏以下的骨架：让画布像一台真机，而不是一张白纸 */}
							<div
								aria-hidden="true"
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: Math.max(5, spec.body * 0.55 * k),
									padding: `0 ${spec.margin * k}px`,
								}}
							>
								{[88, 72, 56, 80, 64, 90, 58, 74, 66, 82].map((w, index) => (
									<span
										key={index}
										style={{
											width: `${w}%`,
											height: Math.max(6, spec.body * 0.72 * k),
											borderRadius: Math.max(3, spec.radius * 0.3 * k),
											background: vars.color.borderStrong,
											opacity: 0.5,
										}}
									/>
								))}
							</div>
							<div
								aria-hidden="true"
								style={{
									display: 'flex',
									justifyContent: 'space-around',
									alignItems: 'center',
									marginTop: 'auto',
									padding: `${Math.max(8, 26 * k)}px 0`,
									background: vars.color.surface,
									borderTop: `1px solid ${vars.color.border}`,
								}}
							>
								{[0, 1, 2, 3].map((index) => (
									<span
										key={index}
										style={{
											width: Math.max(12, 44 * k),
											height: Math.max(12, 44 * k),
											borderRadius: Math.max(4, 12 * k),
											background:
												index === 0 ? vars.color.accentSoft : vars.color.borderStrong,
											opacity: index === 0 ? 1 : 0.45,
										}}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				className={styles.ratioTrack}
				title={`内容宽 ${Math.round(cardW)}px / 视口宽 ${width}px`}
			>
				<div
					className={styles.ratioFill}
					style={{
						width: `${Math.min(100, contentRatio * 100)}%`,
						background: overflow ? vars.tone.warning.fg : vars.color.accent,
					}}
				/>
			</div>

			<div className={styles.metrics}>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>内容缩放</span>
					<span className={styles.metricValue}>{k.toFixed(2)}×</span>
					<span className={styles.metricSub}>设计稿 px → CSS px</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>标题字号</span>
					<span className={styles.metricValue}>{titleCss.toFixed(1)} px</span>
					<span className={styles.metricSub}>
						物理 {titlePx.toFixed(1)} px @ {dpr}×
					</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>根字号</span>
					<span className={styles.metricValue}>
						{strategy === 'rem' ? `${rootFont.toFixed(1)} px` : '—'}
					</span>
					<span className={styles.metricSub}>
						{strategy === 'rem' ? `1rem = ${(design / 10).toFixed(1)} 设计 px` : '仅 rem 方案需要'}
					</span>
				</div>
				<div className={styles.metric}>
					<span className={styles.metricLabel}>卡片宽度</span>
					<span className={styles.metricValue}>{Math.round(cardW)} px</span>
					<span className={styles.metricSub}>占视口 {(contentRatio * 100).toFixed(0)}%</span>
				</div>
			</div>

			<ul className={styles.verdictList}>
				{shown.map((item) => (
					<li key={item.text} className={`${styles.verdict} ${item.warn ? styles.verdictWarn : ''}`}>
						<span className={styles.dot} aria-hidden="true" />
						<span>{item.text}</span>
					</li>
				))}
			</ul>

			<p className={styles.footnote}>
				画布最宽 420px；比阅读区更宽时保持真实宽度，可以横向拖动 —— 这正是横向溢出的样子。比例条是「内容宽 / 视口宽」，不是缩放比。
			</p>
		</section>
	);
}
