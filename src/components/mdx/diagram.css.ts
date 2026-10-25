import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

/**
 * Diagram Standard v1 —— 教学示意图的唯一视觉与几何标准
 *
 * 1. 单一坐标系：一个 SVG viewBox（= 设计尺寸）承载全部节点与箭头；
 *    节点用 <foreignObject> 装 HTML（可换行、吃主题 token），随画布等比缩放。
 * 2. 语义角色 → 色彩（禁止在 MDX 里写死 hex）：
 *      instr 蓝 / gap 琥珀 / target 青绿 / formula 中性强调 / neutral 弱面
 *    全部走 theme 的 tone.*，明暗主题自动切换。
 * 3. 盒：radius.md、1px 边（fg 34%）、fg 10% 淡底；标题 11px/700、副题 10px；
 *    居中、padding 6/8、文字可换行。
 * 4. 箭头：1.7px、textMuted、6×7 实心三角；只允许 from/at/to/len 语义声明，
 *    端点由节点几何算出 —— 手写 x/y 一律不允许。
 * 5. 内存/字节布局：pxPerByte + span[start,end]，盒宽与边界天然成正比。
 *
 * 新增图形只写「节点 + 箭头 + 注记」，样式与对齐由本文件与 Diagram.astro 保证。
 */

export const scroll = style({
	overflowX: 'auto',
	margin: `0 0 ${vars.space.lg}`,
	// 窄屏横向可滚动时，右缘渐隐作为「还有内容」的提示。
	'@media': {
		'(max-width: 560px)': {
			maskImage: 'linear-gradient(to right, #000 86%, transparent)',
			WebkitMaskImage: 'linear-gradient(to right, #000 86%, transparent)',
		},
	},
});

// 宽高与可读性下限由组件按图幅内联（0.88×设计宽），低于下限交给 scroll 横向滚动。
export const svg = style({
	display: 'block',
	width: '100%',
	height: 'auto',
	margin: '0 auto',
	color: vars.color.textMuted,
});

export const node = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '3px',
	width: '100%',
	height: '100%',
	boxSizing: 'border-box',
	padding: '6px 8px',
	textAlign: 'center',
	lineHeight: 1.3,
	borderRadius: vars.radius.md,
	border: '1px solid transparent',
	overflow: 'hidden',
});

export const title = style({
	display: 'block',
	fontSize: '11px',
	fontWeight: 700,
	lineHeight: 1.3,
	color: 'inherit',
});

export const sub = style({
	display: 'block',
	fontSize: '10px',
	fontWeight: 400,
	lineHeight: 1.35,
	opacity: 0.78,
	whiteSpace: 'pre-line',
});

// 语义角色
const toneRoles = {
	instr: { fg: vars.tone.info.fg, bg: vars.tone.info.bg },
	gap: { fg: vars.tone.warning.fg, bg: vars.tone.warning.bg },
	target: { fg: vars.tone.success.fg, bg: vars.tone.success.bg },
} as const;

for (const [role, c] of Object.entries(toneRoles)) {
	globalStyle(`${node}[data-role="${role}"]`, {
		color: c.fg,
		background: c.bg,
		borderColor: `color-mix(in srgb, ${c.fg} 34%, transparent)`,
	});
}

globalStyle(`${node}[data-role="formula"]`, {
	color: vars.color.textStrong,
	background: vars.color.surfaceMuted,
	borderColor: vars.color.border,
});
globalStyle(`${node}[data-role="neutral"]`, {
	color: vars.color.text,
	background: vars.color.surfaceMuted,
	borderColor: vars.color.border,
});

// 公式条标题略大，承担结论层
globalStyle(`${node}[data-role="formula"] ${title}`, { fontSize: '12px' });

// 箭头
export const arrowLine = style({
	stroke: 'currentColor',
	strokeWidth: 1.7,
	strokeLinecap: 'round',
});

export const arrowHead = style({ fill: 'currentColor' });

export const arrowLabel = style({
	fill: vars.color.textMuted,
	fontSize: '10.5px',
	fontWeight: 700,
});

// 注记（图内说明文字）
export const note = style({
	fontSize: '10px',
	lineHeight: 1.4,
	color: vars.color.textMeta,
});
