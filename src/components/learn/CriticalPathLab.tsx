import { useState } from 'react';
import * as styles from './CriticalPathLab.css';
import * as ui from './islandUi.css';

/**
 * CriticalPathLab —— 渲染阻塞模型。
 *
 * 刻意使用「相对时间单位」而不是毫秒：真实页面的资源大小、连接复用、
 * 优先级、CPU 与缓存都在变，编造一组精确毫秒只会制造错误直觉。
 * 这个模型固定资源大小与顺序，只让读者观察「阻塞关系」带来的位移。
 */

type ScriptMode = 'blocking' | 'defer' | 'async';
type ImageMode = 'eager' | 'lazy';
type FontMode = 'swap' | 'block';
type BarKind = 'html' | 'css' | 'js' | 'image' | 'font' | 'block' | 'fontBlock';

interface Row {
	label: string;
	start: number;
	end: number;
	kind: BarKind;
}

const MAX = 600;
const CSS_READY = 140;
const JS_READY = 160;
const FONT_READY = 240;
const SCRIPT_EXEC_START = 160;
const SCRIPT_EXEC_END = 220;

function pct(value: number): number {
	return Math.max(0, Math.min(100, (value / MAX) * 100));
}

export default function CriticalPathLab() {
	const [scriptMode, setScriptMode] = useState<ScriptMode>('defer');
	const [imageMode, setImageMode] = useState<ImageMode>('eager');
	const [fontMode, setFontMode] = useState<FontMode>('swap');

	const blocking = scriptMode === 'blocking';
	const parseDone = blocking ? 300 : 120;
	const bodyReady = blocking ? 260 : 80;
	const dcl = scriptMode === 'defer' ? SCRIPT_EXEC_END : parseDone;
	const fcp = Math.max(CSS_READY, bodyReady, fontMode === 'block' ? FONT_READY : 0);
	const imageStart = imageMode === 'eager' ? 40 : 300;
	const imageEnd = imageMode === 'eager' ? 300 : 560;
	const lcp = Math.max(fcp, imageEnd);
	const mainThreadBlocked = blocking ? 160 : 0;

	const rows: Row[] = [
		{ label: 'HTML 解析', start: 0, end: parseDone, kind: 'html' },
		...(blocking
			? [{ label: '解析暂停', start: 60, end: 220, kind: 'block' as const }]
			: []),
		{ label: 'CSS', start: 20, end: CSS_READY, kind: 'css' },
		{ label: 'JS 下载', start: 20, end: JS_READY, kind: 'js' },
		{ label: 'JS 执行', start: SCRIPT_EXEC_START, end: SCRIPT_EXEC_END, kind: blocking ? 'block' : 'js' },
		{ label: '首图', start: imageStart, end: imageEnd, kind: 'image' },
		{ label: '字体', start: 60, end: FONT_READY, kind: fontMode === 'block' ? 'fontBlock' : 'font' },
	];

	const scriptInsight =
		scriptMode === 'blocking'
			? `普通 script 把解析器按下了暂停键：下载与执行期间，后面的 HTML 都不会被解析，FCP 被推到 ${fcp} 单位。`
			: scriptMode === 'defer'
				? 'defer 让下载与解析并行，执行排到解析之后、DOMContentLoaded 之前；有依赖顺序的脚本优先用它。'
				: 'async 下载不阻塞解析，但执行时机不可控；独立、无依赖的脚本才适合 async。';

	const imageInsight =
		imageMode === 'lazy'
			? `首屏主图设成 lazy，浏览器会晚发现它，LCP 被推到 ${lcp} 单位。首屏主图应 eager，必要时加 fetchpriority="high"。`
			: '首屏主图保持 eager；它是 LCP 候选，别让 lazy 或低优先级拖后腿。';

	const fontInsight =
		fontMode === 'block'
			? 'font-display: block 在字体到达前可能让文字不可见；字体可见时间被推到 240 单位，可能成为 FCP 的新瓶颈。'
			: 'swap 先画后备字体，字体到达后替换；视觉上更快，但要用尺寸匹配减少 CLS。';

	const scriptOptions: Array<{ id: ScriptMode; label: string; hint: string }> = [
		{ id: 'blocking', label: '普通 script', hint: '下载与执行期间暂停解析' },
		{ id: 'defer', label: 'defer', hint: '解析后、DOMContentLoaded 前按顺序执行' },
		{ id: 'async', label: 'async', hint: '下载完立即执行，不保证顺序' },
	];

	const imageOptions: Array<{ id: ImageMode; label: string; hint: string }> = [
		{ id: 'eager', label: 'eager', hint: '立即加载首屏主图' },
		{ id: 'lazy', label: 'lazy', hint: '滚动接近时才加载' },
	];

	const fontOptions: Array<{ id: FontMode; label: string; hint: string }> = [
		{ id: 'swap', label: 'swap', hint: '先画后备字体，再替换' },
		{ id: 'block', label: 'block', hint: '字体到达前文字可能不可见' },
	];

	const metrics = [
		{ label: 'FCP', hint: '首次内容绘制', value: fcp },
		{ label: 'LCP', hint: '最大内容绘制', value: lcp },
		{ label: 'DCL', hint: 'DOMContentLoaded', value: dcl },
		{ label: 'BLOCK', hint: '解析器暂停', value: mainThreadBlocked },
	];

	return (
		<section className={ui.root} aria-labelledby="critical-path-title">
			<p className={ui.eyebrow}>INTERACTIVE · CRITICAL PATH LAB</p>
			<h3 className={ui.title} id="critical-path-title">
				阻塞关系实验：谁在拖住第一帧？
			</h3>
			<p className={ui.lead}>
				固定资源大小与顺序，只改变脚本、首图和字体的加载策略。数值是相对单位，不是毫秒基准；看的是位移方向，不是绝对快慢。
			</p>

			<div className={styles.controls}>
				<div className={styles.controlGroup}>
					<span className={ui.groupLabel} id="cpl-script-label">
						脚本加载方式
					</span>
					<div className={ui.segmentRow} role="group" aria-labelledby="cpl-script-label">
						{scriptOptions.map((option) => (
							<button
								key={option.id}
								type="button"
								className={ui.segment}
								aria-pressed={scriptMode === option.id}
								title={option.hint}
								onClick={() => setScriptMode(option.id)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<div className={styles.controlGroup}>
					<span className={ui.groupLabel} id="cpl-image-label">
						首屏主图
					</span>
					<div className={ui.segmentRow} role="group" aria-labelledby="cpl-image-label">
						{imageOptions.map((option) => (
							<button
								key={option.id}
								type="button"
								className={ui.segment}
								aria-pressed={imageMode === option.id}
								title={option.hint}
								onClick={() => setImageMode(option.id)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<div className={styles.controlGroup}>
					<span className={ui.groupLabel} id="cpl-font-label">
						字体 font-display
					</span>
					<div className={ui.segmentRow} role="group" aria-labelledby="cpl-font-label">
						{fontOptions.map((option) => (
							<button
								key={option.id}
								type="button"
								className={ui.segment}
								aria-pressed={fontMode === option.id}
								title={option.hint}
								onClick={() => setFontMode(option.id)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className={styles.gantt}>
				<div className={styles.ganttScroll}>
					<div className={styles.ganttInner}>
						{rows.map((row) => (
							<div key={row.label} className={styles.row}>
								<span className={styles.rowLabel}>{row.label}</span>
								<div
									className={styles.track}
									role="img"
									aria-label={`${row.label}：从 ${row.start} 到 ${row.end} 相对单位`}
								>
									<span
										className={`${styles.bar} ${styles.barKind[row.kind]}`}
										style={{
											left: `${pct(row.start)}%`,
											width: `${pct(row.end - row.start)}%`,
										}}
										aria-hidden="true"
									/>
								</div>
							</div>
						))}
						<div className={styles.axis} aria-hidden="true">
							{[0, 150, 300, 450, 600].map((tick) => (
								<span key={tick} className={styles.axisTick}>
									{tick}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className={styles.milestones} aria-hidden="true">
					<span>
						<span className={styles.milestoneStrong}>FCP</span> {fcp}
					</span>
					<span>
						<span className={styles.milestoneStrong}>LCP</span> {lcp}
					</span>
					<span>
						<span className={styles.milestoneStrong}>DCL</span> {dcl}
					</span>
					<span>单位：相对时间</span>
				</div>

				<div className={styles.legend} aria-hidden="true">
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.html}`} />
						HTML
					</span>
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.css}`} />
						CSS
					</span>
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.js}`} />
						JS
					</span>
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.image}`} />
						首图
					</span>
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.font}`} />
						字体
					</span>
					<span>
						<i className={`${styles.legendDot} ${styles.barKind.block}`} />
						阻塞 / 不可见
					</span>
				</div>
			</div>

			<div className={styles.summary}>
				{metrics.map((metric) => (
					<div key={metric.label} className={styles.metric}>
						<span className={styles.metricLabel}>{metric.label}</span>
						<span className={styles.metricValue}>{metric.value}</span>
						<span className={styles.metricHint}>{metric.hint}</span>
					</div>
				))}
			</div>

			<p className={styles.insight} role="status">
				{scriptInsight} {imageInsight} {fontInsight}
			</p>
			<p className={styles.modelNote}>
				模型固定了 HTML、CSS、JS、图片与字体的相对大小和先后顺序，只改变阻塞关系。真实浏览器还会受到连接复用、缓存、优先级、CPU 与字体回退策略影响；请把它当作因果演示，而不是性能基准。
			</p>
		</section>
	);
}
