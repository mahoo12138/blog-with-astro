/**
 * 工具箱（/tools）注册表。
 *
 * 设计约定（加新工具只看这一节就够了）：
 *
 *   1. 分类登记在 toolCategories，工具登记在 toolEntries，
 *      页面骨架与左侧分类栏都从这里读，不各自维护一份清单。
 *   2. 每个工具是一个独立组件（src/components/tools/<Name>.astro），
 *      在 src/pages/tools/index.astro 的 panels 表里注册；
 *      组件内部脚本遵循「自执行一次 + astro:page-load 重挂」的
 *      ClientRouter 约定（见 src/scripts/timestamp.ts）。
 *   3. 分类 status: 'planned' 表示还在路上 —— 分类栏置灰并标
 *      「即将上线」，不做可点击的空壳（禁用态必须给出原因）。
 *   4. 所有工具默认纯前端本地运行、不上传数据；页面文案如是说，
 *      新工具若打破这个承诺，必须在 description 里写清楚。
 */

export type ToolCategoryId = 'dev' | 'text' | 'image';

export interface ToolCategory {
	id: ToolCategoryId;
	title: string;
	description: string;
	status: 'active' | 'planned';
}

export interface ToolEntry {
	/** 面板锚点 id（页面上是 #tool-<id>），也是工具的稳定标识 */
	id: string;
	categoryId: ToolCategoryId;
	title: string;
	description: string;
	tags: string[];
	/** YYYY-MM-DD */
	updatedAt: string;
}

export const toolsPageConfig = {
	title: '工具箱',
	description: '在线时间戳转换等开发小工具：开箱即用，全部在浏览器本地运行，不上传任何数据。',
};

export const toolCategories: ToolCategory[] = [
	{ id: 'dev', title: '开发工具', description: '写代码时顺手要用的东西。', status: 'active' },
	{ id: 'text', title: '文本工具', description: '文本处理与格式化。', status: 'planned' },
	{ id: 'image', title: '图片工具', description: '图片压缩与格式转换。', status: 'planned' },
];

export const toolEntries: ToolEntry[] = [
	{
		id: 'timestamp',
		categoryId: 'dev',
		title: '时间戳转换',
		description: 'Unix 时间戳与日期时间双向互转，自动识别秒与毫秒，支持 ISO 8601 与相对时间。',
		tags: ['Unix', '时区', '互转'],
		updatedAt: '2026-10-21',
	},
];

export function getToolsByCategory(categoryId: ToolCategoryId) {
	return toolEntries.filter((tool) => tool.categoryId === categoryId);
}
