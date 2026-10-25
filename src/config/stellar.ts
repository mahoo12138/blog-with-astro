import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export type MenuId = 'post' | 'columns' | 'explore' | 'about' | 'rss' | 'wiki' | 'notebooks';
export type SidebarWidgetId = 'welcome' | 'recent' | 'related' | 'timeline' | 'media' | 'toc' | 'ghrepo' | 'heatmap' | 'goods-stats' | 'gallery-info' | 'gallery-albums' | 'column-posts' | 'travel-stats' | 'travel-recent' | 'archives-stats' | 'site-info' | 'lab-demos' | 'tool-catalog' | 'recent-columns' | 'lesson-catalog';
// 只保留真实存在的内容树节点：此前 wiki / notebooks / notes / note / author / error_page
// 六个键指向不存在的内容，属于失效配置，已删除。
export type SiteTreeKey = 'home' | 'index_blog' | 'index_topic' | 'explore' | 'gallery' | 'post' | 'topic' | 'column' | 'page' | 'travel' | 'archives' | 'lab' | 'tools' | 'learn';

export interface MenubarItem {
	id: MenuId;
	theme: string;
	icon: string;
	title: string;
	url: string;
}

export interface SidebarWidgetConfig {
	id: SidebarWidgetId;
	layout: SidebarWidgetId;
	title?: string;
	body?: string;
	limit?: number;
}

interface FooterSocialItem {
	title: string;
	url: string;
	icon: string;
}

interface FooterSitemapGroup {
	title: string;
	items: { label: string; url: string }[];
}

export type SidebarWidgetRef = SidebarWidgetId | (Partial<SidebarWidgetConfig> & { id?: SidebarWidgetId; override?: SidebarWidgetId });
export type SidebarValue = SidebarWidgetRef | SidebarWidgetRef[] | string | null | undefined;

interface SiteTreeEntry {
	menuId: MenuId;
	leftbar: SidebarValue;
	rightbar: SidebarValue;
}

export const stellarConfig = {
	logo: {
		title: SITE_TITLE,
		subtitle: SITE_DESCRIPTION,
		url: '/',
	},
	menubar: {
		// 实验室 / 学苑已并入「探索」（见 src/config/explore.ts），顶栏只留 4 个一级入口。
		columns: 4,
		items: [
			{
				id: 'post',
				theme: '#1BCDFC',
				icon: 'stellar:menu-post',
				title: '博客',
				url: '/',
			},
			{
				id: 'columns',
				theme: '#FA6400',
				icon: 'stellar:menu-columns',
				title: '专栏',
				url: '/columns',
			},
			{
				id: 'explore',
				theme: '#32B67A',
				icon: 'solar:planet-bold-duotone',
				title: '探索',
				url: '/explore',
			},
			{
				id: 'about',
				theme: '#F44336',
				icon: 'stellar:menu-about',
				title: '关于',
				url: '/about',
			},
			// {
			// 	id: 'rss',
			// 	theme: '#FFB300',
			// 	icon: 'stellar:menu-rss',
			// 	title: 'RSS',
			// 	url: '/rss.xml',
			// },
		] satisfies MenubarItem[],
	},
	footer: {
		content: `© {year} {site.title}. Built with Astro · Inspired by Stellar.`,
		sitemap: [
			{
				title: '内容',
				items: [
					{ label: '近期发布', url: '/' },
					{ label: '归档', url: '/archives' },
					{ label: '分类', url: '/categories' },
					{ label: '标签', url: '/tags' },
					{ label: '探索', url: '/explore' },
				],
			},
			{
				title: '站点',
				items: [
					{ label: '专栏', url: '/columns' },
					{ label: '工具箱', url: '/tools' },
					{ label: '实验室', url: '/lab' },
					{ label: '学苑', url: '/learn' },
					{ label: '关于', url: '/about' },
					{ label: 'RSS', url: '/rss.xml' },
				],
			},
			{
				title: '其他',
				items: [
					{ label: '隐私政策', url: '/privacy' },
					{ label: '服务条款', url: '/terms' },
				],
			},
		] satisfies FooterSitemapGroup[],
		social: [
			{
				title: 'RSS',
				url: '/rss.xml',
				icon: 'default:rss',
			},
			{
				title: 'About',
				url: '/about',
				icon: 'stellar:menu-about',
			},
			{
				title: 'Columns',
				url: '/columns',
				icon: 'stellar:menu-columns',
			},
		] satisfies FooterSocialItem[],
	},
	widgets: {
		welcome: { id: 'welcome', layout: 'welcome', title: '欢迎', body: '这里是静态内容与长期写作的整理地。' },
		recent: { id: 'recent', layout: 'recent', title: '最近更新', limit: 8 },
		related: { id: 'related', layout: 'recent', title: '相关文章', limit: 5 },
		timeline: { id: 'timeline', layout: 'timeline', title: '近期动态', limit: 3 },
		media: { id: 'media', layout: 'media', title: '精选文章' },
		toc: { id: 'toc', layout: 'toc', title: '本文目录' },
		ghrepo: { id: 'ghrepo', layout: 'ghrepo', title: '仓库' },
		heatmap: { id: 'heatmap', layout: 'heatmap', title: '热力图', limit: 8 },
		'goods-stats': { id: 'goods-stats', layout: 'goods-stats', title: '好物统计' },
		'gallery-info': { id: 'gallery-info', layout: 'gallery-info', title: '我的相册', body: '这里是我的日常生活记录，用镜头记下每一个小确幸。' },
		'gallery-albums': { id: 'gallery-albums', layout: 'gallery-albums', title: '相册列表' },
		// 专栏简介卡片已下线：其信息（标题/篇数/简介）在专栏导读页正文头部已完整呈现，
		// 侧栏再复述一遍是冗余；只保留专栏目录。
		'column-posts': { id: 'column-posts', layout: 'column-posts', title: '专栏目录' },
		// 专栏维度的最近更新：按末章发布时间倒序列**专栏**，与 recent（文章）语义不同
		'recent-columns': { id: 'recent-columns', layout: 'recent-columns', title: '最近更新', limit: 6 },
		'travel-stats': { id: 'travel-stats', layout: 'travel-stats', title: '足迹统计' },
		'travel-recent': { id: 'travel-recent', layout: 'travel-recent', title: '最近点亮', limit: 6 },
		'archives-stats': { id: 'archives-stats', layout: 'archives-stats', title: '归档统计' },
		'site-info': { id: 'site-info', layout: 'site-info', title: '技术信息' },
		'lab-demos': { id: 'lab-demos', layout: 'lab-demos', title: '实验目录' },
		'tool-catalog': { id: 'tool-catalog', layout: 'tool-catalog', title: '工具分类' },
		'lesson-catalog': { id: 'lesson-catalog', layout: 'lesson-catalog', title: '课程目录' },
	} satisfies Record<SidebarWidgetId, SidebarWidgetConfig>,
	siteTree: {
		home: { menuId: 'post', leftbar: ['welcome', 'recent'], rightbar: ['heatmap', 'site-info'] },
		index_blog: { menuId: 'post', leftbar: ['welcome', 'recent'], rightbar: null },
		// 专栏目录页：右栏是「最近更新」的**专栏**（按末章时间倒序），
		// 与左栏 recent（最近更新的独立文章）刻意不同名同页并存。
		index_topic: { menuId: 'columns', leftbar: ['welcome', 'recent'], rightbar: ['recent-columns'] },
		explore: { menuId: 'explore', leftbar: ['welcome', 'recent'], rightbar: null },
		gallery: { menuId: 'explore', leftbar: ['gallery-info', 'gallery-albums'], rightbar: null },
		post: { menuId: 'post', leftbar: ['related', 'recent'], rightbar: ['ghrepo', 'toc'] },
		topic: { menuId: 'post', leftbar: ['related', 'recent'], rightbar: ['ghrepo', 'toc'] },
		column: { menuId: 'columns', leftbar: ['column-posts'], rightbar: ['toc'] },
		travel: { menuId: 'explore', leftbar: ['travel-stats', 'travel-recent'], rightbar: null },
		archives: { menuId: 'post', leftbar: ['welcome', 'recent'], rightbar: ['archives-stats'] },
		// 实验室：左栏换成「实验室简介 + demo 目录」，沿用 welcome 挂件但覆写文案。
		// 已并入探索，menuId 跟探索高亮。
		lab: { menuId: 'explore', leftbar: [{ id: 'welcome', title: '实验室', body: '用代码做的小实验，点击即可进入。' }, 'lab-demos'], rightbar: null },
		// 工具箱：左栏是工具分类目录（同实验室的「demo 目录」模式）
		tools: { menuId: 'explore', leftbar: [{ id: 'welcome', title: '工具箱', body: '开箱即用的小工具，全部本地运行。' }, 'tool-catalog'], rightbar: null },
		// 学苑：左栏是课程目录（同实验室/工具箱的目录模式），已并入探索
		learn: { menuId: 'explore', leftbar: [{ id: 'welcome', title: '学苑', body: '一个领域，一课讲透。图文、动画、可动手。' }, 'lesson-catalog'], rightbar: null },
		page: { menuId: 'about', leftbar: ['recent'], rightbar: ['timeline'] },
	} satisfies Record<SiteTreeKey, SiteTreeEntry>,
};

function parseSidebarValue(value: SidebarValue): SidebarWidgetRef[] {
	if (value == null) {
		return [];
	}
	if (Array.isArray(value)) {
		return value;
	}
	if (typeof value === 'string') {
		return value.split(',').map((item) => item.trim()).filter(Boolean) as SidebarWidgetId[];
	}
	return [value];
}

export function resolveSidebarWidgets(value: SidebarValue): SidebarWidgetConfig[] {
	const widgets: SidebarWidgetConfig[] = [];

	for (const widgetRef of parseSidebarValue(value)) {
		if (typeof widgetRef === 'string') {
			widgets.push(stellarConfig.widgets[widgetRef] as SidebarWidgetConfig);
			continue;
		}

		const id = widgetRef.override ?? widgetRef.id;
		if (!id) {
			continue;
		}

		const baseWidget = stellarConfig.widgets[id] as SidebarWidgetConfig;
		widgets.push({
			...baseWidget,
			...widgetRef,
			id,
			layout: widgetRef.layout ?? baseWidget.layout,
		});
	}

	return widgets;
}

export function resolveShellConfig(siteTree: SiteTreeKey = 'page', overrides: { menuId?: MenuId; leftbar?: SidebarValue; rightbar?: SidebarValue } = {}) {
	const entry = stellarConfig.siteTree[siteTree] ?? stellarConfig.siteTree.page;

	return {
		menuId: overrides.menuId ?? entry.menuId,
		leftbar: resolveSidebarWidgets(overrides.leftbar ?? entry.leftbar),
		rightbar: resolveSidebarWidgets(overrides.rightbar ?? entry.rightbar),
	};
}
