import type { ExploreIconImageKey } from '../assets/explore-icons';

export type ExploreContentLayoutKey = 'default' | 'wide' | 'blank';
export type ExploreRouteKind = 'generated' | 'file';

// 分组只服务于入口页的阅读结构，不改变子页面路由或独立主题。
export const exploreGroups = [
	{ id: 'life', title: '日常与心绪' },
	{ id: 'objects', title: '物件与折腾' },
	{ id: 'moments', title: '影像与足迹' },
	{ id: 'building', title: '创造与实践' },
] as const;
export type ExploreGroupId = typeof exploreGroups[number]['id'];

interface ExploreItemBase {
	group: ExploreGroupId;
	title: string;
	description: string;
	href: string;
	icon: ExploreIconImageKey;
	openInNewTab?: boolean;
}

export interface ExploreInternalItem extends ExploreItemBase {
	layout: ExploreContentLayoutKey;
	routeKind?: ExploreRouteKind;
	external?: false;
}

export interface ExploreExternalItem extends ExploreItemBase {
	external: true;
	layout?: never;
	openInNewTab: true;
}

export type ExploreItem = ExploreInternalItem | ExploreExternalItem;

export interface ExplorePageConfig {
	title: string;
	description: string;
	items: ExploreItem[];
}

export const explorePageConfig: ExplorePageConfig = {
	title: '探索',
	description: '一些独立的小页面、记录和生活入口。',
	items: [
		{
			title: '碎碎念',
			group: 'life',
			description: '记录自己的奇思妙想',
			href: 'https://memos.mahoo12138.cn/',
			icon: 'memos',
			external: true,
			openInNewTab: true,
		},
		{
			title: '恋爱纪念日',
			group: 'life',
			description: '记录自己的恋爱纪念日',
			href: '/love/',
			icon: 'love',
			layout: 'blank',
			routeKind: 'file',
		},
		{
			title: '我的好物',
			group: 'objects',
			description: '我购置的一些觉得好用的东西',
			href: '/my-goods/',
			icon: 'goods',
			layout: 'default',
			routeKind: 'file',
		},
		{
			title: '玩机岁月',
			group: 'objects',
			description: '十四年间陪我走过的手机们',
			href: '/phones/',
			icon: 'phone',
			layout: 'wide',
			routeKind: 'file',
		},
		{
			title: '我的相册',
			group: 'moments',
			description: '我的日常生活记录',
			href: '/gallery/',
			icon: 'photo',
			layout: 'wide',
			routeKind: 'file',
		},
		{
			title: '旅行地图',
			group: 'moments',
			description: '点亮过的城市与时间',
			href: '/travel/',
			icon: 'travel',
			layout: 'wide',
			routeKind: 'file',
		},
		{
			title: '我的项目',
			group: 'building',
			description: '最近在做的应用、工具与技术实验',
			href: '/projects/',
			icon: 'projects',
			layout: 'default',
			routeKind: 'file',
		},
		{
			title: '工具箱',
			group: 'building',
			description: '时间戳转换等开发小工具，开箱即用、本地运行',
			href: '/tools/',
			icon: 'tools',
			layout: 'default',
			routeKind: 'file',
		},
		{
			title: '实验室',
			group: 'building',
			description: '用代码做的小实验：可视化、物理仿真、交互式 toy',
			href: '/lab/',
			icon: 'lab',
			layout: 'default',
			routeKind: 'file',
		},
		{
			title: '学苑',
			group: 'building',
			description: '一个领域，一课讲透。图文并茂、带动画与可动手演示的深度课程',
			href: '/learn/',
			icon: 'learn',
			layout: 'default',
			routeKind: 'file',
		},
	],
};

function normalizeExploreHref(href: string) {
	return href.replace(/^\/|\/$/g, '');
}

export function getExploreRouteParam(item: ExploreInternalItem) {
	return normalizeExploreHref(item.href);
}

export function getExploreInternalItems() {
	return explorePageConfig.items.filter((item): item is ExploreInternalItem => !item.external && Boolean(item.layout));
}

export function getGeneratedExploreInternalItems() {
	return getExploreInternalItems().filter((item) => item.routeKind !== 'file');
}

export function getExploreInternalItemByHref(href: string) {
	const routeParam = normalizeExploreHref(href);
	return getExploreInternalItems().find((item) => getExploreRouteParam(item) === routeParam);
}


