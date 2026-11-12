import { useState } from 'react';
import * as styles from './NavigationJourney.css';
import * as ui from './islandUi.css';

/**
 * NavigationJourney —— 一次导航的交互时间线。
 *
 * 设计取舍：
 * - 阶段数据留在组件内，而不是从 MDX 传数组：文章只关心「展示这一块」，
 *   不需要为每个阶段维护两份数据；也避免 MDX 里出现大段无类型 JSON。
 * - 场景只改变「哪些阶段被跳过」与少量文案，不伪造精确毫秒；RTT 只是
 *   用于建立数量级直觉的教学预算，和真实基准测试无关。
 * - 所有交互都是原生 button，键盘与读屏不需要额外的键位脚本。
 */

type ScenarioId = 'cold' | 'warm' | 'h3';
type Phase = '导航' | '网络' | '解析' | '渲染';

interface StageCopy {
	title: string;
	detail: string;
	artifact?: string;
	gotcha?: string;
}

interface Stage {
	id: string;
	phase: Phase;
	title: string;
	summary: string;
	detail: string;
	artifact: string;
	gotcha: string;
	rtt: Record<ScenarioId, number>;
	copy?: Partial<Record<ScenarioId, StageCopy>>;
	skip?: Partial<Record<ScenarioId, string>>;
}

interface Scenario {
	id: ScenarioId;
	label: string;
	hint: string;
	note: string;
}

interface NavigationJourneyProps {
	/** 面试专栏展示输入、依赖、瓶颈与考点；课时默认保持原有的精简详情。 */
	interviewMode?: boolean;
}

interface InterviewNote {
	input: string;
	dependencies: string;
	bottleneck: string;
	point: string;
}

const SCENARIOS: Scenario[] = [
	{
		id: 'cold',
		label: '首次访问',
		hint: 'HTTP/2 · 无缓存',
		note: '冷启动：DNS、TCP、TLS 都要现付。预算按每个网络阶段 1 次往返估算，不含服务端排队与并行子资源。',
	},
	{
		id: 'warm',
		label: '再次访问',
		hint: 'DNS / 连接复用',
		note: '同一站点、连接仍在 keep-alive 窗口内、DNS 缓存未过期。HTML 仍可能 revalidate，请求与首个响应字节合计约 1 RTT。',
	},
	{
		id: 'h3',
		label: 'HTTP/3',
		hint: 'QUIC 首次访问',
		note: 'QUIC 把 TLS 1.3 折进传输握手，省掉独立的一次 TLS 往返；首次访问仍要付 DNS 与 QUIC 握手。',
	},
];

const STAGES: Stage[] = [
	{
		id: 'url',
		phase: '导航',
		title: '解析 URL',
		summary: '地址栏里的文本先被拆成协议、主机、端口、路径、查询和片段，再补全成绝对 URL。',
		detail:
			'WHATWG URL 解析器是一个状态机，不是正则。它会把 Unicode 主机转成 punycode、把 /a/../b 规范化成 /b、为空路径补 /，并按协议补默认端口（https → 443）。fragment 不参与网络请求。',
		artifact: '一个绝对 URL + 同源判定（scheme + host + port）',
		gotcha: 'URL 里的 #fragment 不会发给服务器；它只留在浏览器里，供页面内导航或前端路由使用。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'navigation',
		phase: '导航',
		title: '导航与缓存判定',
		summary: '浏览器判断这次导航能不能由已有文档、Service Worker 或 HTTP 缓存直接回答。',
		detail:
			'可能命中 bfcache（前进 / 后退）、已注册的 Service Worker（fetch 事件）、HTTP 缓存（fresh 或 revalidate），也可能被 301 / 302 / 307 / 308 重定向。只有这些都不行，才进入真正的网络栈。',
		artifact: '一份缓存响应，或一张发往网络的导航请求',
		gotcha: '“缓存命中”不等于“没有网络”：过期缓存通常要先发条件请求，拿到 304 才能复用正文。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'dns',
		phase: '网络',
		title: 'DNS 解析',
		summary: '把主机名翻译成 IP 地址；浏览器、操作系统、递归解析器和权威服务器都可能回答。',
		detail:
			'查询顺序通常是浏览器缓存 → 系统缓存 / hosts → 递归解析器 → 根 / TLD / 权威。A / AAAA 给地址，CNAME 把名字指向另一个名字，HTTPS / SVCB 还能携带 ALPN 与端口提示。',
		artifact: '一个或多个 IP + TTL',
		gotcha: 'DNS 不是 HTTP 的一部分，也不存在一个“中心数据库”；缓存和 TTL 决定了这次查询要花多久。',
		rtt: { cold: 1, warm: 0, h3: 1 },
		copy: {
			warm: {
				title: 'DNS 缓存命中',
				detail:
					'浏览器或系统缓存仍在 TTL 内，直接复用上次的 A / AAAA 记录；这次没有离开本机，也没有递归解析器往返。',
			},
		},
	},
	{
		id: 'connect',
		phase: '网络',
		title: '建立连接',
		summary: '浏览器与目标服务器（通常是 CDN 边缘）建立一条可用的传输连接。',
		detail:
			'TCP 通过 SYN → SYN + ACK → ACK 三次握手建立连接，完整一次往返后才能发送请求数据。TFO（TCP Fast Open）可以省一点，但部署有限。',
		artifact: '一条可复用的 TCP 连接',
		gotcha: '并不是每个请求都新建 TCP 连接：浏览器会复用连接池；HTTP/2 通常在一条连接上跑多个流。',
		rtt: { cold: 1, warm: 0, h3: 1 },
		copy: {
			cold: {
				title: 'TCP 握手（1 RTT）',
				detail:
					'TCP 通过 SYN → SYN + ACK → ACK 三次握手建立连接，完整一次往返后才能发送请求数据。TFO（TCP Fast Open）可以省一点，但部署有限。',
			},
			warm: {
				title: '复用已有连接',
				detail:
					'同一 origin 的连接还在 keep-alive 窗口内，直接复用；TCP 握手这一步被省掉。HTTP/2 会继续使用同一条连接，HTTP/3 可以复用 QUIC 连接或连接 ID。',
				artifact: '一条已存在的连接',
			},
			h3: {
				title: 'QUIC 握手（1 RTT）',
				detail:
					'QUIC 跑在 UDP 上，把 TLS 1.3 折进自己的握手：客户端 Initial 里就带 ClientHello，服务器回应证书与密钥材料。首次连接 1 RTT；恢复会话可 0-RTT，但要接受重放风险。',
				artifact: '一条加密的 QUIC 连接',
				gotcha: 'QUIC 不是“UDP 上跑 TCP”；它有独立的流、拥塞控制和连接迁移机制。',
			},
		},
	},
	{
		id: 'tls',
		phase: '网络',
		title: 'TLS 1.3 握手',
		summary: '验证证书链、协商密钥与应用协议，然后才把 HTTP 字节放进加密通道。',
		detail:
			'客户端 ClientHello 带上支持的版本、SNI、ALPN 和 key_share；服务器回复证书、密钥材料与 Finished；客户端再发 Finished。完整 TLS 1.3 握手 1 RTT，TLS 1.2 通常 2 RTT。',
		artifact: '加密通道 + 选定的应用协议（h2 / h3）',
		gotcha: 'HTTPS 只保护内容与完整性，默认不隐藏 IP、端口和 SNI；ECH 也只解决了其中一部分。',
		rtt: { cold: 1, warm: 0, h3: 0 },
		copy: {
			warm: {
				title: 'TLS 会话复用',
				detail:
					'浏览器拿着上次的会话票据（session ticket / PSK），省掉完整的证书与密钥协商。连接复用加上会话复用，TLS 这一步不再单独占一次往返。',
			},
			h3: {
				title: 'TLS 已内建在 QUIC',
				detail:
					'QUIC 的握手本身就携带 TLS 1.3，不再有独立的 TLS 往返；所以这里标记为被 QUIC 吸收，而不是“没有加密”。',
			},
		},
		skip: { warm: '会话复用', h3: '已内建在 QUIC' },
	},
	{
		id: 'request',
		phase: '网络',
		title: '发送 HTTP 请求',
		summary: '把方法、目标和头字段编码成 HTTP 请求；HTTP/2 与 HTTP/3 会再拆成帧 / 流。',
		detail:
			'导航通常是 GET。HTTP/1.1 用请求行与 Host 头；HTTP/2 用 :method、:scheme、:authority、:path 伪头。Accept、Accept-Encoding、Cookie、Referer、Sec-Fetch-* 和 Priority 决定服务器返回什么、如何压缩，以及资源谁先谁后。',
		artifact: '一个 HTTP 请求（可能带 If-None-Match / If-Modified-Since）',
		gotcha: 'HTTP/2 的“文本”只是语义层；线上是二进制帧。抓包看到的可读请求行是工具还原出来的。',
		// 请求发出到首个响应字节合计约 1 RTT，记在 server 站，避免重复计费。
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'server',
		phase: '网络',
		title: '服务器处理与响应',
		summary: 'CDN / 反向代理 / 应用 / 数据库处理请求，返回状态行、响应头和正文（或 304）。',
		detail:
			'TTFB 只覆盖请求发出到首字节，也就是 DevTools 的 Waiting。DNS、连接、TLS、请求发送和服务器等待加起来，才是「从导航到首字节」。响应头里的 Cache-Control、ETag、Set-Cookie、Content-Encoding 和 CSP 会继续影响浏览器。',
		artifact: '响应头 + 正文（或 304 Not Modified）',
		gotcha: 'Waiting (TTFB) 慢不一定是后端计算慢；CDN 未命中、回源和排队都可能占大头。DNS、连接与 TLS 发生在它之前。',
		rtt: { cold: 1, warm: 1, h3: 1 },
	},
	{
		id: 'decode',
		phase: '解析',
		title: '响应处理与预加载',
		summary: '浏览器解码正文、确认 MIME 与字符集，把字节交给 HTML 解析器；预加载扫描器同时寻找子资源。',
		detail:
			'先按 Content-Encoding 解压（gzip / br，部分客户端支持 zstd），再按 Content-Type 的 charset 解码。预加载扫描器在解析器被脚本阻塞时仍会向前扫描 HTML，提前发现 CSS、JS、图片等资源。',
		artifact: '解码后的 HTML 字节流 + 已启动的子资源请求',
		gotcha: '“HTML 下载完才开始渲染”是错的：解析是流式的。真正会卡住首屏的是渲染阻塞的 CSS、阻塞解析的脚本和字体。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'dom',
		phase: '解析',
		title: 'HTML → DOM',
		summary: 'Tokenizer 把字节切成标签与文本，Tree Construction 按 HTML 规则搭出 DOM。',
		detail:
			'HTML 允许省略结束标签，解析器会补出隐式节点（例如 tbody），并按错误恢复规则继续。经典 script 会暂停解析去下载并执行；defer 推迟到解析后，async 下载完就执行，module 默认 defer。',
		artifact: 'DOM 树 + DOMContentLoaded 的触发时机',
		gotcha: 'DOMContentLoaded 不是“页面加载完成”，更不是“可交互”。load 还要等图片、样式等资源。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'style',
		phase: '渲染',
		title: 'CSSOM 与 Render Tree',
		summary: 'CSS 解析成 CSSOM，与 DOM 合成 Render Tree；只有会参与渲染的节点才进入这棵树。',
		detail:
			'层叠（origin / importance / layer / specificity / order）决定每个属性的计算值；继承与自定义属性再把它传播下去。display:none 的节点不进入 Render Tree，visibility:hidden 的节点仍占位置。',
		artifact: 'Render Tree + 每个节点的计算样式',
		gotcha: 'CSS 不只影响外观：样式表是渲染阻塞资源，而且脚本执行前会等待尚未加载的样式表。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'render',
		phase: '渲染',
		title: 'Layout → Paint → Composite',
		summary: 'Layout 算几何，Paint 记录绘制指令，Raster 栅格化，Composite 合成上屏。',
		detail:
			'改 width / top / 字体大小通常会触发布局；改颜色通常只重绘；改 transform / opacity 往往能只走合成。布局在主线程，栅格化与合成可以在合成线程 / GPU 继续。',
		artifact: '第一帧像素',
		gotcha: '“回流”和“重绘”不是一回事；读取 offsetHeight 再马上写样式，会把一次布局拆成多次（layout thrashing）。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
	{
		id: 'after',
		phase: '渲染',
		title: '首帧之后',
		summary: '字体、图片、水合和长任务继续影响 LCP、CLS 与 INP。',
		detail:
			'font-display 决定字体未到时文字是否可见；首屏图片不该 lazy；SSR HTML 可见不代表事件已绑定，水合期间的长任务会推迟可交互时间。load 事件也不是终点。',
		artifact: '可交互页面 + 真实用户体验指标',
		gotcha: 'load 事件之后仍可能有 async 脚本、懒加载图片、字体替换和用户输入引发的长任务。',
		rtt: { cold: 0, warm: 0, h3: 0 },
	},
];

const INTERVIEW_NOTES: Record<string, InterviewNote> = {
	url: {
		input: '地址栏文本、浏览器补全与安全策略',
		dependencies: 'WHATWG URL 解析规则；输入也可能被识别为搜索词',
		bottleneck: '本阶段通常不是性能热点；错误地址与多余改写会制造额外导航',
		point: '说清 scheme / host / port 共同决定 origin；#fragment 不会进入 HTTP 请求。',
	},
	navigation: {
		input: '绝对 URL、当前文档、Service Worker 与 HTTP 缓存',
		dependencies: 'SW 作用域、缓存新鲜度、重定向与 bfcache 状态',
		bottleneck: '缓存失效、SW 响应慢、连续重定向增加往返',
		point: '强缓存命中不发请求；协商缓存仍会请求，304 后复用旧正文。',
	},
	dns: {
		input: 'URL 主机名与各层 DNS 缓存',
		dependencies: 'TTL、递归解析器、A / AAAA / CNAME / HTTPS 记录',
		bottleneck: '缓存未命中、CNAME 链过长、解析器或跨地域网络慢',
		point: 'DNS 把域名变成 IP；任一缓存层命中都会提前结束，并非每次都问根服务器。',
	},
	connect: {
		input: 'IP、端口、代理配置与连接池状态',
		dependencies: 'DNS 结果；TCP 或 QUIC；已有连接能否复用',
		bottleneck: '高 RTT、丢包、拥塞，以及 TCP 层的队头阻塞',
		point: 'TCP 三次握手通常 1 RTT；HTTP/2 多路复用仍受 TCP 丢包影响，HTTP/3 使用 QUIC。',
	},
	tls: {
		input: '传输连接、SNI、ALPN、证书与会话状态',
		dependencies: 'TCP（h1 / h2）或 QUIC（h3）、信任库与证书链',
		bottleneck: '完整握手、证书链校验与跨地域 RTT；h3 中已并入 QUIC',
		point: 'TLS 提供身份认证、机密性与完整性；TLS 1.3 完整握手通常 1 RTT。',
	},
	request: {
		input: 'URL、可用连接、请求头、Cookie 与缓存验证器',
		dependencies: '安全通道已就绪；重定向后的最终目标已明确',
		bottleneck: 'Cookie / 头部过大、连接池排队、资源优先级不合理',
		point: '区分 HTTP/1.1 请求行与 h2 / h3 伪头；CORS 不会阻止地址栏顶级导航。',
	},
	server: {
		input: 'HTTP 请求、CDN 缓存状态、应用与数据依赖',
		dependencies: '边缘缓存、反向代理、后端服务与数据库',
		bottleneck: 'CDN 回源、服务器排队、慢查询、首字节前等待完整结果',
		point: 'TTFB 不含 DNS / 连接 / TLS；200、304 与重定向要走不同后续路径。',
	},
	decode: {
		input: '响应字节、Content-Encoding、Content-Type 与安全策略',
		dependencies: '响应头已到达；网络服务已向渲染进程提交响应',
		bottleneck: '解压与解码通常较轻；错误 MIME 或安全策略可能直接终止渲染',
		point: '先内容解码再字符解码；HTML 流式解析，预加载扫描器只发现资源、不构建 DOM。',
	},
	dom: {
		input: 'HTML 文本流与已发现的子资源',
		dependencies: 'MIME / 字符集已确定；脚本执行时机会改变解析进度',
		bottleneck: '超大 DOM、阻塞解析的脚本与主线程长任务',
		point: 'DOMContentLoaded 等 HTML 解析和 defer 脚本执行，不等图片，也不代表可交互。',
	},
	style: {
		input: 'DOM、CSS 字节、视口与样式计算上下文',
		dependencies: '可见 DOM 节点与渲染阻塞 CSSOM；脚本可能读取样式',
		bottleneck: '关键 CSS 下载慢、@import 串行、大范围样式重算',
		point: 'CSS 不直接阻塞 DOM 构建，但阻塞渲染，并可能阻塞脚本执行。',
	},
	render: {
		input: 'Render Tree、计算样式、视口与资源尺寸',
		dependencies: 'DOM + CSSOM 已汇合；首屏关键资源与主线程可用',
		bottleneck: '布局抖动、大面积重绘、图层过多与主线程长任务',
		point: 'Layout → Paint → Raster → Composite；transform / opacity 通常可只合成，但并非零成本。',
	},
	after: {
		input: '已提交的首帧、剩余资源、水合任务与用户输入',
		dependencies: 'LCP 元素、字体、脚本水合和后续主线程任务',
		bottleneck: '首图晚发现 / 过大、字体换入造成 CLS、水合长任务推高 INP',
		point: 'FCP、LCP、DOMContentLoaded、load 与可交互不是同一时刻；用真实用户指标验证。',
	},
};

export default function NavigationJourney({ interviewMode = false }: NavigationJourneyProps) {
	const [scenario, setScenario] = useState<ScenarioId>('cold');
	const [active, setActive] = useState(0);

	const activeStage = STAGES[active]!;
	const activeScenario = SCENARIOS.find((item) => item.id === scenario)!;
	const totalRtt = STAGES.reduce((sum, stage) => sum + stage.rtt[scenario], 0);
	const copy = activeStage.copy?.[scenario];
	const detailTitle = copy?.title ?? activeStage.title;
	const detailText = copy?.detail ?? activeStage.detail;
	const detailArtifact = copy?.artifact ?? activeStage.artifact;
	const detailGotcha = copy?.gotcha ?? activeStage.gotcha;
	const interviewNote = INTERVIEW_NOTES[activeStage.id];
	const skipReason = activeStage.skip?.[scenario];

	return (
		<section className={ui.root} aria-labelledby="navigation-journey-title">
			<p className={ui.eyebrow}>INTERACTIVE · NAVIGATION TIMELINE</p>
			<h3 className={ui.title} id="navigation-journey-title">
				{interviewMode ? '首屏加载的 12 个面试站点' : '一次导航的 12 个站点'}
			</h3>
			<p className={ui.lead}>
				{interviewMode
					? '切换场景，再用上一站 / 下一站按顺序走完 12 个站点；每一站的输入、输出、依赖、瓶颈与考点都直接平铺在卡片里。'
					: '切换场景，再用上一站 / 下一站按顺序走完 12 个站点；每一站的完整职责说明都直接平铺在卡片里。'}
			</p>

			<div className={styles.scenarioBar}>
				<div className={styles.scenarioGroup}>
					<span className={ui.groupLabel}>场景</span>
					<div className={ui.segmentRow} role="group" aria-label="选择网络场景">
						{SCENARIOS.map((item) => (
							<button
								key={item.id}
								type="button"
								className={ui.segment}
								aria-pressed={scenario === item.id}
								aria-label={`${item.label}，${item.hint}`}
								onClick={() => setScenario(item.id)}
							>
								{item.label}
								<span className={styles.scenarioHint}>{item.hint}</span>
							</button>
						))}
					</div>
				</div>
			</div>

			<p className={styles.scenarioNote}>{activeScenario.note}</p>

			<div className={styles.card}>
				<aside className={styles.detail} aria-live="polite" aria-atomic="true">
					<div className={styles.detailHead}>
						<div className={styles.detailHeading}>
							<p className={styles.detailKicker}>
								{String(active + 1).padStart(2, '0')} / {activeStage.phase} · {activeScenario.label}
							</p>
							<h4 className={styles.detailTitle}>{detailTitle}</h4>
						</div>
						<div className={styles.navRow}>
							<button
								type="button"
								className={ui.control}
								disabled={active === 0}
								onClick={() => setActive((value) => Math.max(0, value - 1))}
							>
								← 上一站
							</button>
							<button
								type="button"
								className={ui.control}
								disabled={active === STAGES.length - 1}
								onClick={() => setActive((value) => Math.min(STAGES.length - 1, value + 1))}
							>
								下一站 →
							</button>
						</div>
					</div>

					<div className={styles.detailBody}>
						{skipReason && <span className={styles.skipBadge}>本场景：{skipReason}</span>}
						<p className={styles.detailSummary}>{activeStage.summary}</p>
						<p className={styles.detailText}>{detailText}</p>

						{interviewMode && interviewNote ? (
							<div className={styles.interviewDetails}>
								<div className={styles.dataFlow}>
									<div className={styles.flowNode}>
										<span className={styles.blockLabel}>INPUT / 输入</span>
										<p className={styles.blockValue}>{interviewNote.input}</p>
									</div>
									<div className={styles.flowNode}>
										<span className={styles.blockLabel}>→ OUTPUT / 输出</span>
										<p className={styles.blockValue}>{detailArtifact}</p>
									</div>
								</div>
								<div className={styles.factGrid}>
									<div className={styles.flowNode}>
										<span className={styles.blockLabel}>DEPENDS ON / 前置依赖</span>
										<p className={styles.blockValue}>{interviewNote.dependencies}</p>
									</div>
									<div className={styles.flowNode}>
										<span className={styles.blockLabel}>BOTTLENECK / 常见瓶颈</span>
										<p className={styles.blockValue}>{interviewNote.bottleneck}</p>
									</div>
								</div>
								<div className={styles.interviewPoint}>
									<span className={styles.interviewLabel}>INTERVIEW / 面试考点</span>
									<p className={styles.blockValue}>{interviewNote.point}</p>
								</div>
							</div>
						) : (
							<div className={styles.detailBlock}>
								<span className={styles.blockLabel}>OUTPUT / 产物与交接</span>
								<p className={styles.blockValue}>{detailArtifact}</p>
							</div>
						)}

						<div className={styles.gotcha}>
							<span className={styles.gotchaLabel}>EASY TO MISS / 容易误解</span>
							{detailGotcha}
						</div>

						<div className={styles.detailFoot}>
							<span className={styles.progress}>
								第 {active + 1} / {STAGES.length} 站
							</span>
							<span className={styles.progress}>
								{skipReason ?? `${activeStage.rtt[scenario]} RTT`} · 总预算 {totalRtt} RTT
							</span>
						</div>
					</div>
				</aside>
			</div>

			<div className={styles.budget}>
				<span className={styles.budgetValue}>≈ {totalRtt} RTT</span>
				<div
					className={styles.meter}
					role="img"
					aria-label={`网络往返预算约 ${totalRtt} 个 RTT`}
				>
					<span className={styles.meterFill} style={{ width: `${(totalRtt / 5) * 100}%` }} />
				</div>
				<p className={styles.budgetText}>
					{activeScenario.label}：到首字节前的往返预算（示意）。不含并行子资源、服务端排队与真实网络抖动。
				</p>
			</div>
		</section>
	);
}
