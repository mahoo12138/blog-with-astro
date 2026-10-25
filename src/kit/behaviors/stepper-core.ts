/**
 * 步进状态机（kl-stage-stepper / kl-instr-stepper 共享）。
 *
 * 只管 index 推进与重置，不管渲染 —— 两个元素的数据形状差异大，
 * 各自渲染自己的面板，这里避免合并成「配置地狱」。
 */

export interface StepperOptions {
	/** 阶段总数 */
	count: number;
	/** 初始索引（-1 表示尚未开始，reset 也回到这里） */
	initial?: number;
	/** 索引变化回调 */
	onChange(index: number): void;
}

export interface Stepper {
	index(): number;
	/** 推进到下一步（到头循环回起点） */
	next(): void;
	/** 回到初始态 */
	reset(): void;
}

export function createStepper({ count, initial = -1, onChange }: StepperOptions): Stepper {
	let current = initial;

	return {
		index: () => current,
		next() {
			current = current >= count - 1 ? 0 : current + 1;
			onChange(current);
		},
		reset() {
			current = initial;
			onChange(current);
		},
	};
}
