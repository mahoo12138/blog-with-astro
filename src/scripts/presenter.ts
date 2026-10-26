/**
 * 学苑演示套件 —— 指针拖尾 + 右侧贴边工具栏。
 *
 * 设计约束（与 docs/design/design-language.md 一致）：
 *  · 浮层全部 pointer-events: none，只有工具栏可交互 → 不挡阅读、不挡点击。
 *  · 动效只用 motion.ease / 150–240ms；prefers-reduced-motion 下拖尾直接关停。
 *  · RAF 用完即停：没有残影 / 没有手电筒时说停就停，不空转。
 *  · 主题色从 --pk-* 读（明暗切换由 MutationObserver + matchMedia 同步刷新）。
 *
 * 墨迹模型存在客户端坐标里，窗口缩放后整体重绘 —— 画布是 fixed 的，
 * 滚动时墨迹随视口移动（讲课批注的预期行为），关掉工具即恢复页面操作。
 */

type Tool = 'none' | 'pen' | 'shape' | 'torch';
type ShapeKind = 'arrow' | 'rect' | 'ellipse';
type Preset = 'ink' | 'red' | 'amber' | 'teal' | 'violet' | 'slate';
type Point = [number, number];

interface PenStroke {
	kind: 'pen';
	/** 只存色档，具体色值在绘制时按当前主题解析 —— 换主题时笔迹跟着换，而不是被定格 */
	preset: Preset;
	width: number;
	points: Point[];
}

interface ShapeStroke {
	kind: ShapeKind;
	preset: Preset;
	width: number;
	from: Point;
	to: Point;
}

type Stroke = PenStroke | ShapeStroke;

/** 拖尾生命周期与采样步长（像素） */
const TRAIL_LIFE = 460;
const TRAIL_STEP = 1.6;

/** 主题色桥接：CSS 里能出现 hex / rgb() / color(srgb …) / oklch()，统一收敛成 0–255 的 RGB */
interface Rgb {
	r: number;
	g: number;
	b: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * 解析任意已"落地"的色值字符串。
 * 主题配色走 `[data-color-scheme]` 时会声明成 `color-mix(in srgb, oklch(…) 40%, …)`，
 * 取回来是 `color(srgb 0.06 0.06 0.06)` 这种写法 —— 三分量是 0–1 而不是 0–255。
 */
function parseRgb(input: string): Rgb | null {
	const value = input.trim();
	if (!value) return null;

	if (value.startsWith('#')) {
		let hex = value.slice(1);
		if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((c) => c + c).join('');
		if (hex.length !== 6 && hex.length !== 8) return null;
		const n = Number.parseInt(hex.slice(0, 6), 16);
		if (Number.isNaN(n)) return null;
		return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
	}

	const nums = value.match(/-?\d*\.?\d+/g);
	if (!nums || nums.length < 3) return null;

	if (value.startsWith('color(')) {
		return {
			r: clamp(Number(nums[0]) * 255, 0, 255),
			g: clamp(Number(nums[1]) * 255, 0, 255),
			b: clamp(Number(nums[2]) * 255, 0, 255),
		};
	}

	return { r: clamp(Number(nums[0]), 0, 255), g: clamp(Number(nums[1]), 0, 255), b: clamp(Number(nums[2]), 0, 255) };
}

const rgbToHsl = ({ r, g, b }: Rgb) => {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
	else if (max === gn) h = ((bn - rn) / d + 2) / 6;
	else h = ((rn - gn) / d + 4) / 6;
	return { h: h * 360, s, l };
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const hp = ((h % 360) + 360) % 360 / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	const [r1, g1, b1] =
		hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
	const m = l - c / 2;
	return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
};

const toCss = ({ r, g, b }: Rgb) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/**
 * 给颜色加透明度。
 *
 * 主题变量经 getComputedStyle 取回来是 hex 或 `color(srgb …)`（配色主题会走 color-mix），
 * 统一先过 parseRgb 再输出 rgba —— 只按数字抓会得到荒诞的通道值。
 * 渐变需要「同色零透明」—— 不能用 `transparent`（会往黑色插值）。
 */
function withAlpha(color: string, alpha: number): string {
	const rgb = parseRgb(color);
	if (!rgb) return color;
	const base = /^\s*rgba?\(/i.test(color) ? Number(color.match(/-?\d*\.?\d+/g)?.[3] ?? 1) : 1;
	return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${(base * alpha).toFixed(3)})`;
}

function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const width = window.innerWidth;
	const height = window.innerHeight;
	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	return ctx;
}

export function initPresenterKit(): void {
	const root = document.querySelector<HTMLElement>('[data-presenter-kit]');
	if (!root || root.dataset.ready === 'true') return;
	root.dataset.ready = 'true';

	const trailCanvas = root.querySelector<HTMLCanvasElement>('[data-pk-trail]');
	const inkCanvas = root.querySelector<HTMLCanvasElement>('[data-pk-ink]');
	const torchEl = root.querySelector<HTMLElement>('[data-pk-torch]');
	const collapseBtn = root.querySelector<HTMLButtonElement>('[data-pk-collapse]');
	const bodyEl = root.querySelector<HTMLElement>('[data-pk-body]');
	const undoBtn = root.querySelector<HTMLButtonElement>('[data-pk-undo]');
	const clearBtn = root.querySelector<HTMLButtonElement>('[data-pk-clear]');
	const pinBtn = root.querySelector<HTMLButtonElement>('[data-pk-pin]');
	const statusEl = root.querySelector<HTMLElement>('[data-pk-status]');
	const toolButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-pk-tool]')];
	const shapeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-pk-shape]')];
	const shapePanel = root.querySelector<HTMLElement>('[data-pk-shapes]');
	const colorTrigger = root.querySelector<HTMLButtonElement>('[data-pk-color-trigger]');
	const widthTrigger = root.querySelector<HTMLButtonElement>('[data-pk-width-trigger]');
	const inkDot = root.querySelector<HTMLElement>('[data-pk-dot]');
	const widthBarEl = root.querySelector<HTMLElement>('[data-pk-widthbar]');
	const colorButtons = new Map<Preset, HTMLButtonElement>();
	for (const button of root.querySelectorAll<HTMLButtonElement>('[data-pk-color]')) {
		colorButtons.set((button.dataset.pkColor || 'ink') as Preset, button);
	}
	const widthButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-pk-width]')];

	const controller = new AbortController();
	const { signal } = controller;

	/* ── 主题色桥接 ── */
	const readVar = (name: string) =>
		getComputedStyle(root).getPropertyValue(name).trim();

	/**
	 * 任意色彩语法 → 具体 RGB。
	 *
	 * 主题里的颜色可能是 hex、rgb()、`color(srgb …)`，配色主题还会给出 `oklch(…)`；
	 * canvas 的 fillStyle 只归一 color-mix，oklch 会**原样返回**，按字符串解析必错。
	 * 所以直接往 1×1 画布上刷一格再读像素 —— 这是唯一对所有语法都成立的办法。
	 */
	const sampler = document.createElement('canvas');
	sampler.width = 1;
	sampler.height = 1;
	const sampleCtx = sampler.getContext('2d', { willReadFrequently: true });

	const sampleColor = (raw: string): { r: number; g: number; b: number; a: number } | null => {
		const value = raw.trim();
		if (!value || !sampleCtx) return null;
		sampleCtx.fillStyle = '#010203';
		sampleCtx.fillStyle = value;
		// 语法非法时 fillStyle 会保留哨兵值
		if (String(sampleCtx.fillStyle) === '#010203' && value !== '#010203') return null;
		sampleCtx.clearRect(0, 0, 1, 1);
		sampleCtx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = sampleCtx.getImageData(0, 0, 1, 1).data;
		return { r, g, b, a: a / 255 };
	};

	/** 取元素的不透明底色；配色主题下 body 常常是透明的，返回 null 交给上层回退 */
	const opaqueBackground = (el: Element): Rgb | null => {
		const sampled = sampleColor(getComputedStyle(el).backgroundColor);
		if (!sampled || sampled.a < 0.5) return null;
		return { r: sampled.r, g: sampled.g, b: sampled.b };
	};

	const colorToCss = (raw: string, fallback: string): string => {
		const sampled = sampleColor(raw) ?? sampleColor(fallback);
		return sampled ? toCss(sampled) : fallback;
	};

	/**
	 * 拖尾配色：只借主题的**色相**，亮度按相对亮度对齐博客默认主题。
	 *
	 * 各配色的 accent 由 `color-mix(primary, foreground)` 派生，深浅差得离谱
	 * （博客默认 rgb(71,107,146)，而「经典黑白」只有 rgb(15,15,15)）—— 直接拿来画拖尾，
	 * 深色配色下就是一道近黑的粗涂。这里把色相留下、彩度兜底，再用二分把相对亮度
	 * 拉到与默认主题同级：浅底核心 0.10、荧光带 0.145；深底核心 0.60、荧光带 0.68。
	 */
	const relLum = ({ r, g, b }: Rgb) => {
		const lin = (v: number) => {
			const n = v / 255;
			return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
	};

	const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => ({
		r: a.r + (b.r - a.r) * t,
		g: a.g + (b.g - a.g) * t,
		b: a.b + (b.b - a.b) * t,
	});

	/** 朝黑/白二分插值，把颜色压到目标相对亮度（保持色相，只动明度） */
	const towardLum = (color: Rgb, target: number): Rgb => {
		const current = relLum(color);
		if (Math.abs(current - target) < 0.004) return color;
		const pole: Rgb = target > current ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 14; i += 1) {
			const t = (lo + hi) / 2;
			const lum = relLum(mixRgb(color, pole, t));
			const short = target > current ? lum < target : lum > target;
			if (short) lo = t;
			else hi = t;
		}
		return mixRgb(color, pole, (lo + hi) / 2);
	};

	/** 线条色档 → 当前主题下的具体色值（色板取自语义 tone，明暗自动切换） */
	const presetColors = new Map<Preset, string>();
	let inkPreset: Preset = 'ink';
	let inkWidth = 3;
	let inkColor = colorToCss(readVar('--pk-ink'), '#2457d6');
	let trailColor = 'rgb(71, 107, 146)';
	let coreColor = 'rgb(54, 91, 129)';

	const swatchColor = (el: Element, fallback: string) => {
		const sampled = sampleColor(getComputedStyle(el).backgroundColor);
		if (!sampled || sampled.a < 0.5) return fallback;
		return toCss(sampled);
	};

	const refreshColors = () => {
		for (const [preset, button] of colorButtons) {
			presetColors.set(preset, swatchColor(button, '#2457d6'));
		}
		inkColor = presetColors.get(inkPreset) ?? colorToCss(readVar('--pk-ink'), '#2457d6');
		if (inkDot) inkDot.style.background = inkColor;

		const accentSample = sampleColor(readVar('--pk-trail')) ?? sampleColor('#476b92');
		const accent: Rgb = accentSample ?? { r: 71, g: 107, b: 146 };
		// 配色主题下 body 的背景是透明的（底色落在 html 上），要逐级回退着取
		const pageBg =
			opaqueBackground(document.body) ?? opaqueBackground(document.documentElement) ?? { r: 250, g: 250, b: 250 };
		const lightPage = relLum(pageBg) > 0.5;
		const accentHsl = rgbToHsl(accent);

		// 色相保留；近无彩的配色（经典黑白）给一个博客同族的冷蓝，避免拖尾变成一团泥灰
		const hue = accentHsl.s < 0.06 ? 210 : accentHsl.h;
		const sat = clamp(accentHsl.s, 0.14, 0.46);
		const base = hslToRgb(hue, sat, clamp(accentHsl.l, 0.35, 0.7));

		trailColor = toCss(towardLum(base, lightPage ? 0.145 : 0.68));
		coreColor = toCss(towardLum(base, lightPage ? 0.1 : 0.6));
	};
	refreshColors();

	/* ── 画布 ── */
	let trailCtx = trailCanvas ? fitCanvas(trailCanvas) : null;
	const inkCtx = inkCanvas ? fitCanvas(inkCanvas) : null;

	/* ══════════════ 指针拖尾 ══════════════ */
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const finePointer = window.matchMedia('(pointer: fine)');
	let trailPoints: { x: number; y: number; t: number }[] = [];
	let trailRaf = 0;

	/**
	 * 拖尾笔头精灵。
	 *
	 * 逐段描边会让 alpha / 线宽按「段」阶跃，放大后是一排梳齿 —— 这是最初的实现翻车点。
	 * 改为沿路径按固定步长盖印柔光点：透明度与半径由该点的年龄连续插值，
	 * 相邻盖印大幅重叠，肉眼看不出接缝。精灵预渲染一次，逐帧只做 drawImage。
	 */
	let trailSprite: HTMLCanvasElement | null = null;
	const getSprite = () => {
		if (trailSprite) return trailSprite;
		const size = 64;
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;
		const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		gradient.addColorStop(0, withAlpha(coreColor, 1));
		gradient.addColorStop(0.34, withAlpha(coreColor, 0.62));
		gradient.addColorStop(0.68, withAlpha(coreColor, 0.18));
		gradient.addColorStop(1, withAlpha(coreColor, 0));
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
		ctx.fill();
		trailSprite = canvas;
		return canvas;
	};

	const drawHead = (ctx: CanvasRenderingContext2D, x: number, y: number, k: number) => {
		const radius = 22;
		const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
		glow.addColorStop(0, withAlpha(coreColor, 0.3 * k));
		glow.addColorStop(0.45, withAlpha(coreColor, 0.08 * k));
		glow.addColorStop(1, withAlpha(coreColor, 0));
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = withAlpha(coreColor, 0.9 * k);
		ctx.beginPath();
		ctx.arc(x, y, 2.2, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = withAlpha('#ffffff', 0.5 * k);
		ctx.beginPath();
		ctx.arc(x, y, 0.95, 0, Math.PI * 2);
		ctx.fill();
	};

	const STAMP_STEP = 2.2;

	const trailFrame = (now: number) => {
		const ctx = trailCtx;
		if (!ctx) {
			trailRaf = 0;
			return;
		}
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		while (trailPoints.length > 0 && now - trailPoints[0].t > TRAIL_LIFE) trailPoints.shift();

		if (trailPoints.length === 0) {
			trailRaf = 0;
			return;
		}

		// 底层荧光带：整条轨迹一次描边，低透明度托住盖印点
		if (trailPoints.length > 1) {
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = withAlpha(trailColor, 0.1);
			ctx.lineWidth = 13;
			ctx.beginPath();
			ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
			for (let i = 1; i < trailPoints.length; i += 1) {
				ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
			}
			ctx.stroke();
		}

		const sprite = getSprite();
		if (sprite) {
			for (let i = 1; i < trailPoints.length; i += 1) {
				const from = trailPoints[i - 1];
				const to = trailPoints[i];
				const span = Math.hypot(to.x - from.x, to.y - from.y);
				const steps = Math.max(1, Math.ceil(span / STAMP_STEP));
				for (let s = 0; s < steps; s += 1) {
					const t = s / steps;
					const k = 1 - Math.min(1, Math.max(0, (now - (from.t + (to.t - from.t) * t)) / TRAIL_LIFE));
					if (k <= 0.02) continue;
					const radius = 2 + 3.9 * k;
					ctx.globalAlpha = 0.3 * k ** 1.15;
					ctx.drawImage(sprite, from.x + (to.x - from.x) * t - radius, from.y + (to.y - from.y) * t - radius, radius * 2, radius * 2);
				}
			}
			ctx.globalAlpha = 1;
		}

		const head = trailPoints[trailPoints.length - 1];
		const headK = 1 - Math.min(1, Math.max(0, (now - head.t) / TRAIL_LIFE));
		drawHead(ctx, head.x, head.y, headK);

		trailRaf = requestAnimationFrame(trailFrame);
	};

	const pushTrail = (x: number, y: number) => {
		if (reduced.matches || !finePointer.matches || !trailCtx) return;
		const last = trailPoints[trailPoints.length - 1];
		if (last && Math.hypot(x - last.x, y - last.y) < TRAIL_STEP) return;
		if (trailPoints.length === 0) {
			// 新一段轨迹：刷新一次主题色，避免切换主题后仍用旧色
			refreshColors();
			trailSprite = null;
		}
		trailPoints.push({ x, y, t: performance.now() });
		// 最多留 72 个采样点，长距离快速划动也不堆积
		if (trailPoints.length > 72) trailPoints.splice(0, trailPoints.length - 72);
		if (!trailRaf) trailRaf = requestAnimationFrame(trailFrame);
	};

	/* ══════════════ 墨迹 ══════════════ */
	const strokes: Stroke[] = [];
	let draft: Stroke | null = null;
	let drawing = false;
	let activePointer: number | null = null;
	let inkRaf = 0;

	const strokePath = (ctx: CanvasRenderingContext2D, stroke: PenStroke) => {
		const points = stroke.points;
		ctx.beginPath();
		ctx.moveTo(points[0][0], points[0][1]);
		for (let i = 1; i < points.length - 1; i += 1) {
			const [cx, cy] = points[i];
			const [nx, ny] = points[i + 1];
			ctx.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
		}
		const last = points[points.length - 1];
		ctx.lineTo(last[0], last[1]);
	};

	/**
	 * 笔迹的统一画法：先在底下垫一层近白描边，再画主色。
	 * 白色垫底在浅色页面底上是隐形的，在深色 hero / 代码块上则是可见的亮边 ——
	 * 同一支笔因此能在明暗两种底子上都读得出来。
	 */
	const paintShape = (
		ctx: CanvasRenderingContext2D,
		stroke: ShapeStroke,
		color: string,
		width: number,
		fillHead: boolean,
	) => {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		const [x1, y1] = stroke.from;
		const [x2, y2] = stroke.to;

		if (stroke.kind === 'arrow') {
			const dx = x2 - x1;
			const dy = y2 - y1;
			const len = Math.hypot(dx, dy);
			if (len < 4) return;
			const headLen = Math.min(17, len * 0.42);
			const angle = Math.atan2(dy, dx);
			const shaftEnd: Point = [x2 - Math.cos(angle) * headLen * 0.82, y2 - Math.sin(angle) * headLen * 0.82];

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(shaftEnd[0], shaftEnd[1]);
			ctx.stroke();

			const spread = 0.42;
			ctx.beginPath();
			ctx.moveTo(x2, y2);
			ctx.lineTo(x2 - Math.cos(angle - spread) * headLen, y2 - Math.sin(angle - spread) * headLen);
			ctx.lineTo(x2 - Math.cos(angle + spread) * headLen, y2 - Math.sin(angle + spread) * headLen);
			ctx.closePath();
			if (fillHead) {
				ctx.fillStyle = color;
				ctx.fill();
			} else {
				ctx.stroke();
			}
			return;
		}

		if (stroke.kind === 'rect') {
			ctx.beginPath();
			ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
			ctx.stroke();
			return;
		}

		ctx.beginPath();
		ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
		ctx.stroke();
	};

	const strokeColor = (stroke: Stroke) => presetColors.get(stroke.preset) ?? inkColor;

	/**
	 * 深色墨才需要近白垫底：它让笔迹在深色 hero / 代码块上也读得出来。
	 * 浅色墨（深色主题的色档）本身就是亮的，再垫一层白会糊成一团半透明的记号笔。
	 */
	const needsBacklight = (color: string) => {
		const rgb = parseRgb(color);
		return rgb ? relLum(rgb) < 0.3 : true;
	};

	const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		const color = strokeColor(stroke);
		const backlight = needsBacklight(color);

		if (stroke.kind === 'pen') {
			if (stroke.points.length === 0) return;
			if (stroke.points.length === 1) {
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(stroke.points[0][0], stroke.points[0][1], stroke.width / 2, 0, Math.PI * 2);
				ctx.fill();
				return;
			}
			// 深色墨：近白垫底 + 淡晕记号笔；浅色墨：只画主笔，保持锐利
			if (backlight) {
				ctx.strokeStyle = withAlpha('#ffffff', 0.4);
				ctx.lineWidth = stroke.width + 3.2;
				strokePath(ctx, stroke);
				ctx.stroke();

				ctx.strokeStyle = withAlpha(color, 0.15);
				ctx.lineWidth = stroke.width * 2;
				strokePath(ctx, stroke);
				ctx.stroke();
			}

			ctx.strokeStyle = color;
			ctx.lineWidth = stroke.width;
			strokePath(ctx, stroke);
			ctx.stroke();
			return;
		}

		if (backlight) paintShape(ctx, stroke, withAlpha('#ffffff', 0.45), stroke.width + 3, false);
		paintShape(ctx, stroke, color, stroke.width, true);
	};

	/**
	 * 墨迹存的是**文档坐标**（client + scroll），画布仍贴视口。
	 * 绘制前整体平移 −scroll，于是墨迹钉在内容上：滚页面时跟着内容一起走，
	 * 而不是像贴纸一样黏在屏幕中央。滚动只需重绘一次（rAF 合并）。
	 */
	const paintInk = () => {
		if (!inkCtx) return;
		inkCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		inkCtx.save();
		inkCtx.translate(-window.scrollX, -window.scrollY);
		for (const stroke of strokes) drawStroke(inkCtx, stroke);
		if (draft) drawStroke(inkCtx, draft);
		inkCtx.restore();
	};

	const scheduleInk = () => {
		if (inkRaf) return;
		inkRaf = requestAnimationFrame(() => {
			inkRaf = 0;
			paintInk();
		});
	};

	const syncHistoryButtons = () => {
		const empty = strokes.length === 0;
		for (const button of [undoBtn, clearBtn]) {
			if (!button) continue;
			button.dataset.disabled = empty ? 'true' : 'false';
			button.disabled = empty;
		}
	};

	/* ══════════════ 工具状态 ══════════════ */
	let tool: Tool = 'none';
	let shapeKind: ShapeKind = 'arrow';

	const announce = (message: string) => {
		if (statusEl) statusEl.textContent = message;
	};

	const toolLabel: Record<Exclude<Tool, 'none'>, string> = {
		pen: '画笔已开启，按住拖动即可批注；按 Esc 退出',
		shape: '图形已开启，按住拖动绘制；按 Esc 退出',
		torch: '手电筒已开启，移动鼠标照亮局部；按 Esc 退出',
	};

	const setTool = (next: Tool) => {
		tool = next;
		root.dataset.tool = next;
		root.dataset.draw = next === 'pen' || next === 'shape' ? 'true' : 'false';
		root.dataset.torch = next === 'torch' ? 'true' : 'false';
		if (next !== 'pen' && next !== 'shape' && draft) {
			draft = null;
			drawing = false;
			activePointer = null;
			scheduleInk();
		}
		for (const button of toolButtons) {
			button.setAttribute('aria-pressed', String(button.dataset.pkTool === next));
		}
		if (next === 'torch') startTorch();
		else stopTorch();
		if (next !== 'none' && inkCanvas) inkCanvas.style.cursor = next === 'torch' ? 'default' : 'crosshair';
		announce(next === 'none' ? '已退出演示工具，页面恢复浏览' : toolLabel[next]);
	};

	/* ══════════════ 手电筒 ══════════════ */
	/** 最近一次指针位置（拖尾、手电筒共用），脱离事件时也有落点 */
	const graphPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	let torchRaf = 0;
	let torchTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	let torchPos = { ...torchTarget };

	const torchFrame = () => {
		if (!torchEl) {
			torchRaf = 0;
			return;
		}
		torchPos.x += (torchTarget.x - torchPos.x) * 0.34;
		torchPos.y += (torchTarget.y - torchPos.y) * 0.34;
		const radius = torchEl.offsetWidth / 2 || 160;
		torchEl.style.transform = `translate3d(${torchPos.x - radius}px, ${torchPos.y - radius}px, 0)`;
		torchRaf = requestAnimationFrame(torchFrame);
	};

	const startTorch = () => {
		if (torchRaf) return;
		torchTarget = { ...graphPointer };
		torchPos = { ...torchTarget };
		torchRaf = requestAnimationFrame(torchFrame);
	};

	const stopTorch = () => {
		if (!torchRaf) return;
		cancelAnimationFrame(torchRaf);
		torchRaf = 0;
	};

	/* ══════════════ 指针事件 ══════════════ */
	const onPointerMove = (event: PointerEvent) => {
		const { clientX: x, clientY: y } = event;
		graphPointer.x = x;
		graphPointer.y = y;
		if (tool === 'torch') {
			torchTarget.x = x;
			torchTarget.y = y;
		}
		pushTrail(x, y);
	};

	const beginStroke = (event: PointerEvent) => {
		if (tool !== 'pen' && tool !== 'shape') return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		refreshColors();
		drawing = true;
		activePointer = event.pointerId;
		// 文档坐标：+scroll，滚动后墨迹仍钉在内容上
		const point: Point = [event.clientX + window.scrollX, event.clientY + window.scrollY];
		draft =
			tool === 'pen'
				? { kind: 'pen', preset: inkPreset, width: inkWidth, points: [point] }
				: { kind: shapeKind, preset: inkPreset, width: inkWidth, from: point, to: point };
		inkCanvas?.setPointerCapture?.(event.pointerId);
		scheduleInk();
	};

	const extendStroke = (event: PointerEvent) => {
		if (!drawing || !draft) return;
		if (activePointer !== null && event.pointerId !== activePointer) return;
		const point: Point = [event.clientX + window.scrollX, event.clientY + window.scrollY];
		if (draft.kind === 'pen') {
			const last = draft.points[draft.points.length - 1];
			if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < 1.1) return;
			draft.points.push(point);
		} else {
			draft.to = point;
		}
		scheduleInk();
	};

	const finishStroke = () => {
		if (!draft) {
			drawing = false;
			activePointer = null;
			return;
		}
		const finished = draft;
		draft = null;
		drawing = false;
		activePointer = null;
		const tinyPen = finished.kind === 'pen' && finished.points.length < 2;
		const tinyShape =
			finished.kind !== 'pen' &&
			Math.hypot(finished.to[0] - finished.from[0], finished.to[1] - finished.from[1]) < 6;
		if (!tinyPen && !tinyShape) {
			strokes.push(finished);
			syncHistoryButtons();
		}
		scheduleInk();
	};

	const endStroke = (event: PointerEvent) => {
		if (!drawing && !draft) return;
		if (activePointer !== null && event.pointerId !== activePointer) return;
		finishStroke();
	};

	/* ══════════════ 工具栏 ══════════════ */
	const setOpen = (open: boolean) => {
		root.dataset.open = String(open);
		collapseBtn?.setAttribute('aria-expanded', String(open));
		collapseBtn?.setAttribute('aria-label', open ? '收起演示工具' : '展开演示工具');
		if (collapseBtn) collapseBtn.dataset.tip = open ? '收起工具栏' : '展开演示工具';
		// 收起后置 inert：不只是视觉隐藏，Tab 也不能钻进看不见的按钮
		if (bodyEl) bodyEl.inert = !open;
	};

	collapseBtn?.addEventListener(
		'click',
		() => {
			setOpen(root.dataset.open !== 'true');
		},
		{ signal },
	);

	const flyoutHosts = [
		{ host: shapePanel?.parentElement ?? null, key: 'shape', trigger: root.querySelector<HTMLElement>('[data-pk-tool="shape"]') },
		{ host: colorTrigger?.parentElement ?? null, key: 'color', trigger: colorTrigger },
		{ host: widthTrigger?.parentElement ?? null, key: 'width', trigger: widthTrigger },
	];

	let flyoutTimer = 0;
	// 选中后主动收拢菜单；在指针离开宿主前不再自动弹回（否则刚点完又弹出来）
	let flyoutSuppressed = false;
	const setFlyout = (key: string | null) => {
		if (key) root.dataset.flyout = key;
		else delete root.dataset.flyout;
		for (const item of flyoutHosts) item.trigger?.setAttribute('aria-expanded', String(item.key === key));
	};
	const openFlyout = (key: string) => {
		if (flyoutSuppressed) return;
		window.clearTimeout(flyoutTimer);
		setFlyout(key);
	};
	const closeFlyout = (delay = 0) => {
		window.clearTimeout(flyoutTimer);
		if (delay > 0) flyoutTimer = window.setTimeout(() => setFlyout(null), delay);
		else setFlyout(null);
	};
	const scheduleCloseFlyout = () => closeFlyout(220);
	/**
	 * 选中一项之后：留 ~200ms 让选中态被看见，再走退出动画收起来。
	 * 之前是等指针离开才收，人在看画布、菜单在身后突然消失，显不出任何过渡。
	 */
	const dismissFlyout = () => {
		flyoutSuppressed = true;
		closeFlyout(200);
	};
	for (const item of flyoutHosts) {
		if (!item.host) continue;
		item.host.addEventListener('pointerenter', () => {
			flyoutSuppressed = false;
			openFlyout(item.key);
		}, { signal });
		item.host.addEventListener('pointerleave', scheduleCloseFlyout, { signal });
		item.host.addEventListener('focusin', () => {
			flyoutSuppressed = false;
			openFlyout(item.key);
		}, { signal });
		item.host.addEventListener('focusout', scheduleCloseFlyout, { signal });
	}

	for (const button of toolButtons) {
		button.addEventListener(
			'click',
			() => {
				const next = (button.dataset.pkTool || 'none') as Tool;
				setTool(tool === next ? 'none' : next);
			},
			{ signal },
		);
	}

	for (const button of shapeButtons) {
		button.addEventListener(
			'click',
			() => {
				shapeKind = (button.dataset.pkShape || 'arrow') as ShapeKind;
				for (const item of shapeButtons) {
					item.setAttribute('aria-pressed', String(item === button));
				}
				if (tool !== 'shape') setTool('shape');
				else announce(toolLabel.shape);
				dismissFlyout();
			},
			{ signal },
		);
	}

	for (const button of colorButtons.values()) {
		button.addEventListener(
			'click',
			() => {
				inkPreset = (button.dataset.pkColor || 'ink') as Preset;
				for (const [preset, item] of colorButtons) {
					item.setAttribute('aria-pressed', String(preset === inkPreset));
				}
				refreshColors();
				if (colorTrigger) colorTrigger.dataset.tip = `线条颜色 · ${button.getAttribute('aria-label') ?? ''}`;
				announce(`线条颜色已切换为${button.getAttribute('aria-label') ?? ''}`);
				dismissFlyout();
			},
			{ signal },
		);
	}

	/** 按钮上的线段高度跟着当前线宽走，不展开菜单也能看出粗细 */
	const widthNames: Record<number, string> = { 2: '细', 3: '中', 5: '粗' };
	const syncWidthBar = () => {
		if (widthBarEl) widthBarEl.style.height = `${inkWidth + 1}px`;
		if (widthTrigger) widthTrigger.dataset.tip = `线条粗细 · ${widthNames[inkWidth] ?? ''}`;
	};
	syncWidthBar();
	// 颜色按钮的提示也带上当前色名
	const currentColorLabel = colorButtons.get(inkPreset)?.getAttribute('aria-label') ?? '墨蓝';
	if (colorTrigger) colorTrigger.dataset.tip = `线条颜色 · ${currentColorLabel}`;

	for (const button of widthButtons) {
		button.addEventListener(
			'click',
			() => {
				inkWidth = Number(button.dataset.pkWidth) || 3;
				for (const item of widthButtons) {
					item.setAttribute('aria-pressed', String(item === button));
				}
				syncWidthBar();
				announce(`线条粗细：${(button.textContent ?? '').trim()}`);
				dismissFlyout();
			},
			{ signal },
		);
	}

	/**
	 * 子菜单的 hover 意图（图形 / 颜色 / 粗细共用一套）。
	 *
	 * 子菜单挂在按钮左侧、中间留 8px 空档。纯 CSS :hover 在这里会死锁：
	 * 指针进空档 → :hover 失效 → 子菜单 pointer-events 立刻变 none → 指针落到子菜单上
	 * 也不算命中 → 菜单消失，只能靠点击「钉住」。改成脚本给 open 状态 + 220ms 宽限：
	 * 期间子菜单仍可命中，指针一进入就被 pointerenter 接住并取消关闭。
	 * 只用一个 data-flyout 属性 → 同一时刻只会有一个子菜单展开。
	 */
	const undo = () => {
		if (strokes.length === 0) return;
		strokes.pop();
		syncHistoryButtons();
		scheduleInk();
		announce('已撤销上一笔');
	};

	const clearAll = () => {
		if (strokes.length === 0) return;
		strokes.length = 0;
		syncHistoryButtons();
		scheduleInk();
		announce('已清空所有墨迹');
	};

	undoBtn?.addEventListener('click', undo, { signal });
	clearBtn?.addEventListener('click', clearAll, { signal });

	pinBtn?.addEventListener(
		'click',
		() => {
			const pinned = root.dataset.pinned !== 'false';
			root.dataset.pinned = String(!pinned);
			pinBtn.setAttribute('aria-pressed', String(!pinned));
			announce(!pinned ? '工具栏已固定在页面边缘' : '工具栏已取消固定，鼠标靠近右边缘时浮现');
		},
		{ signal },
	);

	/* ══════════════ 键盘 ══════════════ */
	window.addEventListener(
		'keydown',
		(event) => {
			const target = event.target as HTMLElement | null;
			const editing = target?.closest('input, textarea, select, [contenteditable="true"]');
			if (editing) return;

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
				if (strokes.length === 0) return;
				event.preventDefault();
				undo();
				return;
			}
			if (event.metaKey || event.ctrlKey || event.altKey) return;

			switch (event.key) {
				case 'Escape':
					if (tool === 'none') return;
					event.preventDefault();
					setTool('none');
					break;
				case 'b':
				case 'B':
					setTool(tool === 'pen' ? 'none' : 'pen');
					break;
				case 'g':
				case 'G':
					setTool(tool === 'shape' ? 'none' : 'shape');
					break;
				case 'l':
				case 'L':
					setTool(tool === 'torch' ? 'none' : 'torch');
					break;
				default:
			}
		},
		{ signal },
	);

	/* ══════════════ 尺寸 / 主题 ══════════════ */
	let resizeRaf = 0;
	const onResize = () => {
		if (resizeRaf) return;
		resizeRaf = requestAnimationFrame(() => {
			resizeRaf = 0;
			if (trailCanvas) trailCtx = fitCanvas(trailCanvas);
			if (inkCanvas) fitCanvas(inkCanvas);
			trailPoints = [];
			paintInk();
			torchTarget.x = Math.min(torchTarget.x, window.innerWidth);
			torchTarget.y = Math.min(torchTarget.y, window.innerHeight);
		});
	};

	window.addEventListener('resize', onResize, { signal, passive: true });
	// 墨迹是文档坐标，滚动时重绘一次让它停在内容上
	window.addEventListener('scroll', scheduleInk, { signal, passive: true });
	window.addEventListener('pointermove', onPointerMove, { signal, passive: true });
	window.addEventListener('pointerdown', onPointerMove, { signal, passive: true });
	inkCanvas?.addEventListener('pointerdown', beginStroke, { signal });
	window.addEventListener('pointermove', extendStroke, { signal, passive: true });
	window.addEventListener('pointerup', endStroke, { signal, passive: true });
	window.addEventListener('pointercancel', endStroke, { signal, passive: true });
	// 焦点移出窗口 / 触摸设备手势被系统中断时，把未提交的笔画收尾
	window.addEventListener('blur', finishStroke, { signal });

	/** 主题切换：笔迹换到新主题的墨色，精灵缓存作废 */
	const recolor = () => {
		refreshColors();
		trailSprite = null;
		paintInk();
	};

	const themeObserver = new MutationObserver(recolor);
	themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-color-scheme', 'class'] });
	// 系统主题跟随（未显式选主题时，data-theme 不变、色值变）
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', recolor, { signal });
	reduced.addEventListener('change', () => { trailPoints = []; }, { signal });

	syncHistoryButtons();
	paintInk();

	document.addEventListener(
		'astro:before-swap',
		() => {
			controller.abort();
			themeObserver.disconnect();
			window.clearTimeout(flyoutTimer);
			if (trailRaf) cancelAnimationFrame(trailRaf);
			if (inkRaf) cancelAnimationFrame(inkRaf);
			if (resizeRaf) cancelAnimationFrame(resizeRaf);
			stopTorch();
			root.dataset.ready = 'false';
		},
		{ once: true },
	);
}
