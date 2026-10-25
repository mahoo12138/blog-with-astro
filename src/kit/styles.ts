import { vars } from '../styles/theme.css';

/**
 * 构造式样式表助手。
 *
 * 全局主题的 CSS 自定义属性（vars.* → var(--hash)）继承穿透 shadow 边界，
 * 所以 shadow 内可以直接引用 vars.* 吃到 [data-theme] / [data-color-scheme] /
 * prefers-color-scheme 全套切换。
 *
 * 注意：theme.css.ts 的全局样式（*:focus-visible、prefers-reduced-motion 兜底）
 * **不进 shadow DOM**，baseSheet 必须自带等价规则。
 */

export function sheet(strings: TemplateStringsArray, ...values: Array<string | number>): CSSStyleSheet {
	const s = new CSSStyleSheet();
	s.replaceSync(String.raw(strings, ...values));
	return s;
}

/** 所有 kl-* 元素共享的基底样式（模块级缓存，全站只构造一次） */
export const baseSheet = sheet`
	:host {
		display: block;
		margin: 0 0 ${vars.space.xl};
		font-family: ${vars.font.body};
		color: ${vars.color.text};
		line-height: 1.75;
	}
	button, input, select, textarea {
		font: inherit;
		color: inherit;
	}
	button {
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0;
	}
	:host(:focus-visible), :focus-visible {
		outline: 2px solid ${vars.color.accentStrong};
		outline-offset: 3px;
	}
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after {
			animation: none !important;
			transition: none !important;
		}
	}
`;

/** 通用 ghost 按钮（shadow 内控件统一形态：无边框，hover/focus 走 accentSoft 淡晕） */
export const ghostButtonCss = `
	.btn {
		border: none;
		background: transparent;
		color: ${vars.color.accentStrong};
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 6px 12px;
		border-radius: ${vars.radius.pill};
		transition: background ${vars.motion.durationFast} ${vars.motion.ease},
			color ${vars.motion.durationFast} ${vars.motion.ease},
			transform ${vars.motion.durationFast} ${vars.motion.ease};
	}
	.btn:hover { background: ${vars.color.accentSoft}; }
	.btn:active { transform: scale(0.96); }
`;
