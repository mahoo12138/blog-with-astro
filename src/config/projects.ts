import snapshotData from '../data/projects.json';
import { selectProjectRepositories, validateProjectsSnapshot } from '../utils/project-data.mjs';

export const projectGroups = [
  { id: 'apps', title: '应用与工具' },
  { id: 'frameworks', title: '框架与语言' },
  { id: 'experiments', title: '实验与模拟' },
  { id: 'sites', title: '站点与展示' },
  { id: 'derived', title: '学习与派生' },
  { id: 'other', title: '其他项目' },
] as const;
export type ProjectGroup = typeof projectGroups[number]['id'];
interface ProjectEditorial { title: string; group: ProjectGroup; description: string; stack: string[]; note?: string; }

// 中文简介根据公开 README 整理；只表达用途，不把路线图写成已交付功能。
// API 同步只更新 metadata snapshot，不覆盖这里的编辑内容。新仓库自动归入“其他项目”。
const editorial: Record<string, ProjectEditorial> = {
  pontis: { title: 'Pontis', group: 'apps', description: '自托管的跨浏览器书签同步平台，把 Go 服务端、Web 控制台和浏览器扩展连接起来，也提供可配置的新标签页。', stack: ['Go', 'React', 'TypeScript', 'SQLite'], note: 'Alpha 阶段，重要书签请保留独立备份。' },
  'omni-store': { title: 'OmniStore', group: 'apps', description: '以本地目录为真实数据源的轻量自部署存储中心，统一管理文件、分享、图床、WebDAV 与可选 S3 接口。', stack: ['Go', 'React', 'SQLite'] },
  madoc: { title: 'Madoc', group: 'apps', description: '面向个人与小团队的自部署协同工作区，将 Markdown 文档、Excalidraw 白板、实时协作和本地附件放在一起。', stack: ['Go', 'React', 'Yjs', 'SQLite'], note: '早期试用阶段，重要内容请保留独立备份。' },
  havit: { title: 'Havit', group: 'apps', description: '个人与家庭的资产台账，记录物品、存放位置、消耗品和借出情况，把提醒、凭证与备份一起整理。', stack: ['Go', 'TypeScript', 'SQLite'] },
  taptype: { title: 'TapType', group: 'apps', description: '以打字练习为核心的学习平台，包含错题复习、练习目标、成就和实时打字统计。', stack: ['Go', 'React', 'TypeScript'], note: '基于 qwerty-learner 的重构与后端扩展。' },
  'douyin-keeper': { title: 'Douyin Keeper', group: 'apps', description: '多账号抖音火花维护工具，围绕好友同步、互动任务和执行记录，逐步连接 Web 管理端与微信小程序。', stack: ['Go', 'React', 'Taro', 'PostgreSQL'] },
  cormijs: { title: 'cormi', group: 'frameworks', description: '以 Cordis 为插件宿主、参考 Umi 开发体验的 TypeScript 应用框架。通过 preset 组合 React 与 Vite，核心不绑定具体前端方案。', stack: ['TypeScript', 'Cordis', 'React', 'Vite'], note: '框架实验；仓库名为 cormijs。' },
  numen: { title: 'Numen', group: 'frameworks', description: 'Cordis 原生、插件优先的个人自动化运行时，探索把服务、设备与数据连接成可以编排和执行的自动化流程。', stack: ['TypeScript', 'Cordis', 'SQLite'] },
  tynel: { title: 'Tynel', group: 'frameworks', description: '学习与研究型 TypeScript-to-native 编译器。复用 tsgo 前端与 Go 编译器后端，探索从受限 TypeScript 子集生成原生程序。', stack: ['Go', 'TypeScript', '编译器'], note: '研究原型，并非完整 TypeScript 实现。' },
  'fly-brain': { title: 'Fly Brain', group: 'experiments', description: '果蝇具身仿真实验，探索神经连接组、MuJoCo 物理环境与交互可视化之间的联动。', stack: ['Python', 'MuJoCo', '神经仿真'], note: '实验与复现项目，不代表完成了全脑功能仿真。' },
  'mahoo-solar': { title: 'Mahoo Solar', group: 'experiments', description: '公寓光伏数字孪生，用三维场景呈现太阳轨迹、建筑遮挡与天气，并探索光伏功率估算和家庭能源遥测。', stack: ['React', 'Three.js', 'SunCalc'] },
  'xiangqi-arena': { title: 'Xiangqi Arena', group: 'experiments', description: '让大语言模型在中国象棋棋盘上对弈。TypeScript 棋规引擎负责合法走法与记谱，界面保存多棋局和对弈过程。', stack: ['Vue', 'TypeScript', 'Pinia', 'IndexedDB'] },
  resume: { title: 'Resume', group: 'sites', description: '由 Markdown 驱动的个人简历站点，使用 Nuxt 生成静态页面，统一维护经历与技能，并提供适合打印的布局。', stack: ['Nuxt', 'TypeScript', 'Markdown'] },
  'blog-with-astro': { title: 'Mahoo Space', group: 'sites', description: '这个博客的源代码。基于 Astro 组织技术文章、系列专栏与生活记录，让内容和独立小页面留在同一个空间里。', stack: ['Astro', 'TypeScript', 'MDX'] },
};

validateProjectsSnapshot(snapshotData);
export const projectsSnapshot = snapshotData;
export const projects = selectProjectRepositories(snapshotData.repositories).map(repo => {
  const copy = editorial[repo.name.toLowerCase()];
  return {
    ...repo,
    title: copy?.title ?? repo.name,
    group: copy?.group ?? (repo.fork ? 'derived' : 'other'),
    summary: copy?.description ?? (repo.description || '项目说明见 GitHub 仓库。'),
    stack: copy?.stack ?? (repo.language ? [repo.language] : []),
    note: copy?.note,
  };
}).sort((a, b) => b.pushedAt.localeCompare(a.pushedAt) || a.fullName.localeCompare(b.fullName, 'en'));
export type Project = typeof projects[number];
