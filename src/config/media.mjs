/**
 * 图片等静态资源的访问规则（唯一真源）。
 *
 * 全站只有三种取图方式，靠 **URL 前缀**区分；写法在 Markdown、MDX、
 * frontmatter、组件 props 里完全一致，不需要记三套 API：
 *
 *   1. external   https://cdn.example.com/a.png     完整外链，原样输出
 *   2. store      store:images/posts/a.webp         omni-store 静态发布空间内的相对路径
 *   3. local      local:brand/logo.svg              项目 public/ 下本地素材的相对路径
 *
 * 裸相对路径（`./a.png`）保持原语义：相对**当前内容文件**，交给 Astro 图片管线，
 * 它不属于上面三种，也不受本文件约束。
 *
 * 为什么用「前缀」而不是「另一个 props」：前缀在 Markdown 原生 `![]()` 里也成立，
 * 而 props 只对组件生效。同一个字符串搬去 frontmatter 的 `cover:` 或数据文件里
 * 依然有效，不需要每处都换写法。
 */

/**
 * omni-store 静态发布的 `base_url`，形如 `https://files.example.com/assets/ast-xxxxxxxx/`。
 *
 * 这是**公开标识**，不是密码；末尾斜杠可有可无，解析时会归一化。
 * 未配置时 `store:` 引用会直接构建失败（不会静默产出断链），
 * 需要临时切换环境（本地 omni-store 实例 / 预发域名）时用环境变量覆盖：
 *
 *   MEDIA_STORE_BASE=http://127.0.0.1:8080/assets/ast-xxxx/ pnpm dev
 *
 * 生成方式：omni-store 后台「存储源 → 静态访问」发布后，接口返回的 base_url
 * （`public_origin + /assets/{public_asset_id}/`）。
 */
export const mediaConfig = {
	storeBase: process.env.MEDIA_STORE_BASE ?? '',

	/**
	 * 本地素材根，映射到 `public/<localRoot>`。
	 *
	 * 放在 public 下是刻意的：同一串地址在 frontmatter、MDX、数据文件里都能用，
	 * 不依赖 import 相对路径。代价是走不到 Astro 的图片优化（不生成多尺寸、
	 * 不加哈希），所以「常改的小图 / 站点自有图标」放这里，
	 * 「文章配图」放 omni-store。
	 */
	localRoot: '/images',

	/**
	 * 正文里 Markdown 语法的图片（`![]()`）自动补 lazy/async，
	 * 并把**第一张**标成 eager + fetchpriority=high（它通常就是首屏 LCP 图）。
	 *
	 * 显式写了 `loading=` 的图片不覆盖。
	 */
	lazyBodyImages: true,
};
