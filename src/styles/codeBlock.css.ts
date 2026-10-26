import { globalStyle, keyframes } from '@vanilla-extract/css';
import { breakpoints, vars } from './theme.css';

/**
 * 代码块外壳样式（配合 src/plugins/rehype-code-block.mjs）。
 *
 * 结构：
 *   .code-block
 *     .code-block__bar      顶部栏（语言名 + 复制按钮）
 *       .code-block__lang
 *       .code-block__copy
 *     pre.astro-code        原来的高亮块
 *
 * 主题色一律走 vars，深色模式自动跟随。
 */

/**
 * 复制图标用 CSS mask + data-URI 画，而不是每个按钮内联一个 <svg>：
 * 全站 1324 个代码块，内联 SVG 会凭空多出上百 KB 且内容完全重复；
 * 放到样式表里只需定义一次，按钮里 0 字节。
 */
const COPY_ICON =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='11' height='11' rx='2'/%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/%3E%3C/svg%3E\")";

const CHECK_ICON =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")";

/** 折叠栏的指示箭头（向下）。展开时由 transform 转 180°，不另存一份图标。 */
const CHEVRON_ICON =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";


const copiedPop = keyframes({
	'0%': { transform: 'scale(1)' },
	'45%': { transform: 'scale(1.18)' },
	'100%': { transform: 'scale(1)' },
});

/* ── 外壳 ── */
globalStyle('.code-block', {
	position: 'relative',
	margin: `0 0 ${vars.space.xl}`,
	borderRadius: vars.radius.md,
	border: `1px solid ${vars.color.border}`,
	// 顶部栏要盖住 pre 的圆角，否则会露出一条缝
	overflow: 'hidden',
	// 底色**跟随 Shiki 主题**：rehype-code-block 把 pre 行内样式里的
	// Shiki 变量提升到外壳（--shiki-light-bg / --shiki-dark-bg）——
	// 自定义属性只向下继承，父级读不到 pre 上的原始变量，所以必须提升。
	// 明暗切换时外壳与代码区永远同色，不会「上下两块颜色对不上」。
	// 回退值对应 github-light / github-dark（astro.config shikiConfig）。
	vars: {
		// --code-block-bg 只是个中间变量：折叠渐隐（见下方 pre::after）要跟
		// 同色渐变，直接从同一个变量取，就不必再抄一遍四象限的色值。
		'--code-block-bg': 'var(--shiki-light-bg, #fff)',
		// 折叠栏的两个颜色也走变量。原因不只是复用：折叠栏的结构规则挂在
		// `html.has-js .code-block[data-code-fold]` 这种高权重选择器下，
		// 深色覆盖与 :hover 若直接写 color/background 会被它压住
		// （曾经踩过：深色下折叠栏文字仍是浅色主题的深蓝，几乎看不见）。
		// 颜色拆成低权重规则 + 继承变量后，主题与 hover 都能正常覆盖。
		'--code-fold-surface': 'rgba(0, 0, 0, 0.04)',
		'--code-fold-text': 'rgba(52, 62, 78, 0.8)',
	},
	background: 'var(--code-block-bg)',
	boxShadow: vars.shadow.card,
});

/**
 * 外壳底色的完整四象限：显式 light / 显式 dark / 依照系统 × 浅·深。
 * 「依照系统」时 appearance.ts 会 removeAttribute('data-theme')，
 * 走 :root:not([data-theme]) 的 media 分支 —— 此前缺 dark 分支，
 * 系统深色下外壳永远回退浅色 #fff，顶栏（半透明叠色）呈现成白色。
 */
globalStyle(':root[data-theme="light"] .code-block', {
	vars: {
		'--code-block-bg': 'var(--shiki-light-bg, #fff)',
		'--code-fold-surface': 'rgba(0, 0, 0, 0.04)',
		'--code-fold-text': 'rgba(52, 62, 78, 0.8)',
	},
});

globalStyle(':root[data-theme="dark"] .code-block', {
	vars: {
		'--code-block-bg': 'var(--shiki-dark-bg, #24292e)',
		'--code-fold-surface': 'rgba(255, 255, 255, 0.06)',
		'--code-fold-text': 'rgba(226, 230, 235, 0.7)',
	},
});

globalStyle(':root:not([data-theme]) .code-block', {
	'@media': {
		'(prefers-color-scheme: light)': {
			vars: {
				'--code-block-bg': 'var(--shiki-light-bg, #fff)',
				'--code-fold-surface': 'rgba(0, 0, 0, 0.04)',
				'--code-fold-text': 'rgba(52, 62, 78, 0.8)',
			},
		},
		'(prefers-color-scheme: dark)': {
			vars: {
				'--code-block-bg': 'var(--shiki-dark-bg, #24292e)',
				'--code-fold-surface': 'rgba(255, 255, 255, 0.06)',
				'--code-fold-text': 'rgba(226, 230, 235, 0.7)',
			},
		},
	},
});

/* 复制按钮默认隐藏，等 JS 给 <html> 打上 .has-js 才显示。
 * 见文件末尾的说明。 */
globalStyle('.code-block__copy', {
	display: 'none',
});

/**
 * 让 pre 彻底「融进」外壳：去掉自己那份边框、圆角、外边距和底色。
 *
 * ⚠️ 三个属性都要 `!important`，因为 Shiki 把主题底色写成了行内 style
 * （`style="background-color:#fff;--shiki-dark-bg:#24292e"`），
 * 行内样式的优先级高于任何外部选择器 —— 不加 !important 就会在
 * 外壳内部再出现一块自己的底色和圆角，正是「块里套块」的成因。
 * 底色统一由外壳的 background-color 承担。
 *
 * padding 保留在 pre 上（而非移到外壳）：代码要贴着顶部栏往下留白，
 * 而顶部栏自己已有 padding，两者分开处理更直观。
 */
globalStyle('.code-block > pre', {
	margin: '0 !important',
	border: 'none !important',
	borderRadius: '0 !important',
	// 用 transparent 而不是 inherit 之类：外壳的底色已经画好了，
	// 这里只要「什么都不画」，深浅两套主题都不用额外处理。
	backgroundColor: 'transparent !important',
});

/* ── 顶部栏 ── */
/**
 * 顶部栏不用页面色板里的 backgroundElevated，而是给代码区底色叠一层
 * 半透明黑/白。原因：代码区底色来自 Shiki 主题（github-light/dark），
 * 和站点自己的 surface/background 是两套色系；用站点色会显得「贴上去的
 * 一块」，转换主题时尤其突兀。用 rgba 叠加则任何主题下都能自然分出层次。
 */
globalStyle('.code-block__bar', {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: vars.space.md,
	padding: `0.35rem 0.5rem 0.35rem ${vars.space.lg}`,
	// 浅色代码底(#fff)上叠 4% 黑 → 极淡的灰；深色底上叠 22% 白 → 提亮一档
	backgroundColor: 'rgba(0, 0, 0, 0.04)',
	borderBottom: '1px solid rgba(127, 127, 127, 0.18)',
	// 代码块本身是可选中的，但工具栏不该被一起选走（否则复制文本会混入语言名）
	userSelect: 'none',
});

globalStyle(':root[data-theme="dark"] .code-block__bar', {
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
});

globalStyle(':root:not([data-theme]) .code-block__bar', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			backgroundColor: 'rgba(255, 255, 255, 0.06)',
		},
	},
});

/**
 * 顶部栏里的文字同理：不用站点的 textMuted（深色下偏蓝灰，压在 GitHub
 * 深色底上发闷），改用跟随 Shiki 前景色的半透明版本。
 */
globalStyle('.code-block__lang', {
	fontFamily: vars.font.mono,
	fontSize: '0.72rem',
	fontWeight: 600,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: 'rgba(60, 70, 85, 0.62)',
});

globalStyle(':root[data-theme="dark"] .code-block__lang', {
	color: 'rgba(225, 228, 232, 0.58)',
});

globalStyle(':root:not([data-theme]) .code-block__lang', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			color: 'rgba(225, 228, 232, 0.58)',
		},
	},
});

/* ── 复制按钮 ── */
/* 文字色跟随顶部栏（与语言名同一档），所以和 lang 一样按主题分别给值。
 * display 由文件末尾「默认隐藏 / .has-js 显示」两条规则管理，这里不写。 */
globalStyle('.code-block__copy', {
	alignItems: 'center',
	gap: '0.35rem',
	padding: '0.3rem 0.6rem',
	border: 'none',
	borderRadius: vars.radius.sm,
	background: 'transparent',
	color: 'rgba(60, 70, 85, 0.62)',
	fontFamily: vars.font.body,
	fontSize: '0.78rem',
	lineHeight: 1.4,
	cursor: 'pointer',
	transition: 'background-color 160ms ease, color 160ms ease',
	'@media': {
		// 小屏只留图标，省出横向空间给代码
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			fontSize: 0,
			gap: 0,
			padding: '0.3rem 0.45rem',
		},
	},
});

globalStyle(':root[data-theme="dark"] .code-block__copy', {
	color: 'rgba(225, 228, 232, 0.58)',
});

globalStyle(':root:not([data-theme]) .code-block__copy', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			color: 'rgba(225, 228, 232, 0.58)',
		},
	},
});

/* hover/focus 用中性灰白叠加，不用站点的 accent 蓝 —— 压在两套 Shiki
 * 主题色上都更稳，且不会在深色代码底上显得刺眼。 */
globalStyle('.code-block__copy:hover', {
	backgroundColor: 'rgba(127, 127, 127, 0.16)',
	color: 'inherit',
});

globalStyle('.code-block__copy:focus-visible', {
	outline: 'none',
	boxShadow: vars.shadow.focus,
});

/* 图标用 mask 上色：currentColor 让它跟随按钮文字色，明暗主题都不用改 */
globalStyle('.code-block__copy::before', {
	content: '',
	width: '0.85rem',
	height: '0.85rem',
	flexShrink: 0,
	backgroundColor: 'currentColor',
	WebkitMask: `${COPY_ICON} center / contain no-repeat`,
	mask: `${COPY_ICON} center / contain no-repeat`,
	'@media': {
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			width: '0.95rem',
			height: '0.95rem',
		},
	},
});

/**
 * 复制成功：换对勾 + 弹一下。
 *
 * 这里**不用**站点的 accent 蓝：顶部栏整体已经改成跟随 Shiki 主题的中性色，
 * 单独一个蓝字压在与站点色系无关的 GitHub 底上会显得突兀（尤其深色下）。
 * 改成把当前主题的前景色提到接近不透明 —— 对比度够，也不破坏色系一致性。
 */
globalStyle('.code-block.is-copied .code-block__copy', {
	color: 'rgba(36, 41, 46, 0.92)',
});

globalStyle(':root[data-theme="dark"] .code-block.is-copied .code-block__copy', {
	color: 'rgba(225, 228, 232, 0.92)',
});

globalStyle(':root:not([data-theme]) .code-block.is-copied .code-block__copy', {
	'@media': {
		'(prefers-color-scheme: dark)': {
			color: 'rgba(225, 228, 232, 0.92)',
		},
	},
});

globalStyle('.code-block.is-copied .code-block__copy::before', {
	WebkitMaskImage: CHECK_ICON,
	maskImage: CHECK_ICON,
	animation: `${copiedPop} 320ms ease`,
	'@media': {
		// 尊重系统的减少动态偏好
		'(prefers-reduced-motion: reduce)': {
			animation: 'none',
		},
	},
});

/**
 * JS 就绪后才显示复制按钮（code-copy.js 会给 <html> 加 .has-js）。
 *
 * 为什么不用 <noscript><style>：实测在 BaseHead 的 <noscript> 里放
 * 带 is:inline 的 <style>，会破坏 Astro 的模板解析 —— 后续
 * `{noindex && <meta …>}` 会整段变成字面文本漏进 HTML（236 页全中）。
 *
 * 这个方向还比「无 JS 时藏起来」更好：按钮只在确实能点的时候出现，
 * 不会出现「看得见但点了没反应」的状态。
 */
globalStyle('html.has-js .code-block__copy', {
	display: 'inline-flex',
});

/* ── 超高折叠 ── */
/**
 * 折叠栏默认不显示：无 JS 时它点了没反应，不如不出现。
 * 结构见 src/plugins/rehype-code-block.mjs（构建期生成）与
 * public/js/code-block-fold.js（窄屏换行才溢出时补建）。
 *
 *   .code-block[data-code-fold]          这个块超出高度上限，可折叠
 *   .code-block.is-fold-open             用户已展开
 *   > pre                                折叠时被裁剪的那一段
 *   > .code-block__fold                  底部折叠栏（整条可点）
 */
globalStyle('.code-block__fold', {
	display: 'none',
});

/**
 * 折叠态裁剪。
 *
 * 挂在 `html.has-js` 下是**无障碍底线**：脚本没跑时完全不裁剪，
 * 读者不会遇到「代码被截断却点不开」的死路；而 has-js 由 BaseHead 的
 * 首屏内联脚本在首次绘制前就打上，所以正常访问下第一帧就是折叠态，
 * 不会「先整段摊开再刷地收起来」。
 *
 * --code-fold-h 由构建期按 astro.config 的 maxHeight 下发；回退值 420px
 * 与 rehype-code-block.mjs 的 DEFAULT_MAX_HEIGHT 一致，只兜运行期补建的块。
 * 再套一层 min(…, 62vh)：横屏手机这类矮视口上，420px 会独占整屏，
 * 压到六成屏高才留得住上下文。运行期量的是 CSS 算完的真实高度，
 * 所以这层裁剪不让构建期与运行期产生分歧。
 * box-sizing 用 border-box，让「最大高度」等于肉眼看到的整块高度。
 *
 * position: relative 是为了让下面的渐隐能钉在裁剪后的下沿。
 */
globalStyle('html.has-js .code-block[data-code-fold]:not(.is-fold-open) > pre', {
	maxHeight: 'min(var(--code-fold-h, 420px), 62vh)',
	boxSizing: 'border-box',
	overflow: 'hidden',
	position: 'relative',
	'@media': {
		// 打印时不该藏内容：展开全文，折叠栏也一并去掉
		print: {
			maxHeight: 'none',
			overflow: 'visible',
		},
	},
});

/**
 * 下沿渐隐：被裁断的那一行如果硬切，看起来像渲染坏了；
 * 渐到外壳底色就自然得多。颜色直接取 --code-block-bg，
 * 明暗主题与文章所用 Shiki 主题都能自动跟上，不用再写四象限。
 *
 * 起点用「同色 0%」而不是关键字 transparent：CSS 渐变虽按预乘 alpha
 * 插值，但不同引擎在深色底上仍会有肉眼可辨的发灰，锁住色相最稳。
 */
globalStyle('html.has-js .code-block[data-code-fold]:not(.is-fold-open) > pre::after', {
	content: '""',
	position: 'absolute',
	inset: 'auto 0 0 0',
	height: '3.25rem',
	pointerEvents: 'none',
	background:
		'linear-gradient(to bottom, color-mix(in srgb, var(--code-block-bg) 0%, transparent), var(--code-block-bg) 88%)',
});

/**
 * 折叠栏本体（结构与排版）。
 *
 * 视觉上刻意和顶部栏同款（同透明度叠色、同一条淡灰分隔线），
 * 让代码块上下「封边」，中间才是内容 —— 否则底部单拎一条色带
 * 会像贴上去的补丁。
 *
 * ⚠️ 这里只放「结构」，颜色单独写在下面那条低权重规则里：
 * 这个选择器为了表达「只有可折叠且挂了 JS 的块才显示」带了三个复合条件，
 * 权重高到会压住 `:root[data-theme=dark] …` 和 `…:hover` 这类正常覆盖，
 * 颜色塞进来就会变成「深色模式下仍是浅色文字」的暗坑。
 */
globalStyle('html.has-js .code-block[data-code-fold] .code-block__fold', {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '0.4rem',
	boxSizing: 'border-box',
	width: '100%',
	// 与顶部栏（39.25px）等高的「封边」：上下两条一样厚，代码区才像被框住
	height: '2.5rem',
	padding: `0 ${vars.space.lg}`,
	margin: 0,
	border: 'none',
	borderTop: '1px solid rgba(127, 127, 127, 0.18)',
	fontFamily: vars.font.body,
	fontSize: '0.75rem',
	fontWeight: 500,
	lineHeight: 1,
	letterSpacing: '0.04em',
	cursor: 'pointer',
	// 和顶部栏一致：折叠栏属于界面，复制代码时不该被一起选中
	userSelect: 'none',
	'@media': {
		// 小屏文字略收一点，高度不动 —— 40px 正好是个好按的目标
		[`screen and (max-width: ${breakpoints.mobile})`]: {
			fontSize: '0.72rem',
			letterSpacing: '0.03em',
		},
		print: {
			display: 'none',
		},
	},
});

/* 颜色走外壳下发的变量，权重故意压低，主题与 hover 才盖得住。
 * --code-fold-text 比顶部语言名更实一档：那是元信息，这是可点的动作；
 * 0.8 的档位在 #f5f5f5 上约 5.5:1，深色下约 5.9:1，都过 AA。 */
globalStyle('.code-block__fold', {
	backgroundColor: 'var(--code-fold-surface)',
	color: 'var(--code-fold-text)',
	transition: `background-color ${vars.motion.durationFast} ${vars.motion.ease}, color ${vars.motion.durationFast} ${vars.motion.ease}`,
});

/* hover 与复制按钮同一套中性叠色，不引入站点 accent：
 * 这层灰压在 Shiki 的两套主题底上都稳，深色下也不刺眼。 */
globalStyle('.code-block__fold:hover', {
	backgroundColor: 'rgba(127, 127, 127, 0.16)',
});

globalStyle('.code-block__fold:focus-visible', {
	outline: 'none',
	boxShadow: vars.shadow.focus,
	// 焦点环压在长方形按钮上时，圆角要跟着收一点才不显脏
	borderRadius: vars.radius.sm,
});

/**
 * 指示图标：向下箭头 = 「还有内容，往下展开」；展开后转 180° 指向回收。
 * 用 mask + currentColor 上色，按钮文字色一变图标就跟着变，
 * 明暗两套主题不用各画一份（与复制按钮的图标同一条路线）。
 */
globalStyle('.code-block__fold::after', {
	content: '""',
	width: '0.8rem',
	height: '0.8rem',
	flexShrink: 0,
	backgroundColor: 'currentColor',
	WebkitMask: `${CHEVRON_ICON} center / contain no-repeat`,
	mask: `${CHEVRON_ICON} center / contain no-repeat`,
	transition: `transform ${vars.motion.durationBase} ${vars.motion.ease}`,
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			transition: 'none',
		},
	},
});

globalStyle('.code-block.is-fold-open .code-block__fold::after', {
	transform: 'rotate(180deg)',
});

