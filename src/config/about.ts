/**
 * 关于页内容基于用户提供的个人介绍，非技能熟练度评估，也不推断新的个人经历。
 * 内容来源：https://mahoo12138.github.io/blog-with-hexo/（2026-10-19 读取）
 * 人格数据是自述的测试记录，不自动随时间改写。
 */
export const aboutProfile = {
	name: 'Mahoo',
	greeting: '一个兴趣广泛、喜欢折腾的 00 后。',
	introduction: '做 Web 前端，也做自己的 Prompt 微调工程师。',
	bio: '我是一名前端切图仔，代码力一般，不擅长算法。喜欢尝试各种东西，也常常只有三分钟热度；面向大模型编程，是我折腾方式的一部分。',
	description: '我是 Mahoo，一名喜欢折腾的 Web 前端开发者。这里分享我的兴趣、技能、INTP-A 测试记录，以及这个博客会写的内容。',
	writingArchive: 'https://mahoo12138.github.io/blog-with-hexo/',
} as const;

export const aboutInterests = [
	{ title: '日常番与音乐', text: '非典型二次元，喜欢看日常番，也喜欢听音乐。' },
	{ title: '跑步与骑行', text: '离开屏幕以后，喜欢跑步和骑行。' },
	{ title: '游戏里的日常', text: 'Minecraft 火柴盒建造师，也玩蛋仔派对。' },
] as const;

export const aboutSkills = [
	{ title: '编程语言', items: ['TypeScript', 'JavaScript', 'Golang', 'Kotlin'] },
	{ title: '开发框架', items: ['Vue.js', 'React.js', 'Next.js', 'Nest.js', 'Tailwind CSS', 'Flutter'] },
	{ title: '生产力工具', items: ['Git', 'VS Code', 'Docker', 'Jenkins', 'Blender'] },
] as const;

export const aboutPersonality = {
	type: 'INTP-A',
	name: '逻辑学家',
	note: '一次人格测试的记录。把它当作认识自己的一个切面，而不是固定的标签。',
	illustration: '/images/about/intp-logician-s1-male.svg',
	illustrationSource: 'https://www.16personalities.com/static/images/personality-types/avatars/intp-logician-s1-male.svg',
	traits: [
		{ dimension: '能量', preference: '内向', value: 57 },
		{ dimension: '心智', preference: '天马行空', value: 71 },
		{ dimension: '天性', preference: '理性思考', value: 82 },
		{ dimension: '应对方式', preference: '随机应变', value: 71 },
		{ dimension: '身份特征', preference: '自信果断', value: 60 },
	],
} as const;

export const aboutWriting = [
	{ title: '技术思考与实践', text: '不限于前端开发，记录尝试、解决问题和实现想法的过程。' },
	{ title: '观察与思考', text: '对社会、政治、科技的观察和思考。' },
	{ title: '生活与自我探索', text: '生活随笔，以及和自己有关的一些想法。' },
	{ title: '游戏与音乐', text: '偶尔也会写写游戏、音乐相关的内容。' },
] as const;
