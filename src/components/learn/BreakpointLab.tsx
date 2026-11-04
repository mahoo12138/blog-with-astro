import { useEffect, useRef, useState } from 'react';
import * as styles from './BreakpointLab.css';
import * as ui from './islandUi.css';

/**
 * BreakpointLab —— 同一张告警卡，分别用 @container 与 @media 控制布局，
 * 然后一起塞进一个可以拖窄的容器。
 *
 * @media 判断的是视口：容器再窄它也认为「屏幕很宽」，于是继续用行布局，
 * 直到被裁掉。@container 判断的是最近的 container-type 祖先，所以会跟着
 * 容器收缩。这个差别在「组件要放进侧栏 / 弹窗 / 后台小卡片」时最致命。
 */

const MIN = 280;
const MAX = 720;
const CQ_BREAKPOINT = 460;
const MQ_BREAKPOINT = 640;
const CARD_MIN_WIDTH = 380;

function AlertCard() {
	return (
		<>
			<span className={styles.avatar} aria-hidden="true" />
			<span className={styles.cardBody}>
				<span className={styles.cardTitle}>3 号机房 · 设备离线</span>
				<span className={styles.cardMeta}>2 分钟前 · 影响 4 台采集器</span>
			</span>
			<span className={styles.cardAction}>查看</span>
		</>
	);
}

export default function BreakpointLab() {
	const [width, setWidth] = useState(360);
	const [viewport, setViewport] = useState(1440);
	const mqHostRef = useRef<HTMLDivElement>(null);
	const [overflow, setOverflow] = useState(false);

	useEffect(() => {
		const sync = () => setViewport(window.innerWidth);
		sync();
		window.addEventListener('resize', sync);
		return () => window.removeEventListener('resize', sync);
	}, []);

	useEffect(() => {
		const el = mqHostRef.current;
		if (!el) return;
		const measure = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [width]);

	const cqHit = width >= CQ_BREAKPOINT;
	const mqHit = viewport >= MQ_BREAKPOINT;

	return (
		<section className={ui.root}>
			<p className={ui.eyebrow}>INTERACTIVE · QUERY SCOPE</p>
			<h3 className={ui.title}>它问的是谁有多宽？</h3>
			<p className={ui.lead}>
				两张一模一样的告警卡，只有断点的写法不同。拖动容器宽度：一个会跟着容器换布局，另一个只认视口。
			</p>

			<div className={styles.controls}>
				<span className={ui.groupLabel}>容器宽度</span>
				<input
					className={styles.slider}
					type="range"
					min={MIN}
					max={MAX}
					step={1}
					value={width}
					aria-label="容器宽度"
					onChange={(event) => setWidth(Number(event.currentTarget.value))}
				/>
				<span className={styles.stateValue} style={{ fontSize: '12px' }}>
					{width} px
				</span>
			</div>

			<div className={styles.stage}>
				<div className={styles.hostFrame} style={{ width }}>
					<div className={styles.hostHead}>
						<span>容器</span>
						<span>
							{width} px · 视口 {viewport} px
						</span>
					</div>

					<div className={styles.cqHost}>
						<span className={styles.tag}>@container (min-width: {CQ_BREAKPOINT}px)</span>
						<div className={styles.cqCard}>
							<AlertCard />
						</div>
					</div>

					<div className={styles.mqHost} ref={mqHostRef}>
						<span className={styles.tag}>@media (min-width: {MQ_BREAKPOINT}px)</span>
						<div className={styles.mqCard}>
							<AlertCard />
						</div>
					</div>
				</div>
			</div>

			<div className={styles.stateRow}>
				<div className={styles.stateItem}>
					<span className={styles.stateLabel}>容器查询</span>
					<span className={styles.stateValue}>{cqHit ? '宽布局' : '竖排'}</span>
				</div>
				<div className={styles.stateItem}>
					<span className={styles.stateLabel}>媒体查询</span>
					<span className={styles.stateValue}>{mqHit ? '宽布局' : '竖排'}</span>
				</div>
				<div className={styles.stateItem}>
					<span className={styles.stateLabel}>视口</span>
					<span className={styles.stateValue}>{viewport} px</span>
				</div>
				<div className={styles.stateItem}>
					<span className={styles.stateLabel}>内容溢出</span>
					<span className={styles.stateValue}>{overflow ? '是' : '否'}</span>
				</div>
			</div>

			<p className={`${styles.note} ${overflow ? styles.noteWarn : ''}`}>
				{cqHit
					? `容器 ${width}px 已过 ${CQ_BREAKPOINT}px，两种查询都给出宽布局 —— 这个区间看不出差别，往左拖才会暴露。`
					: mqHit
						? `容器只有 ${width}px，@container 已经切成竖排；@media 仍然认为「屏幕 ${viewport}px 很宽」，坚持行布局，卡片保住 ${CARD_MIN_WIDTH}px 的最小宽度，右边被裁掉。`
						: `视口 ${viewport}px 不到 ${MQ_BREAKPOINT}px，两种查询都退回竖排。`}
			</p>
		</section>
	);
}
