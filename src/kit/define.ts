/**
 * 自定义元素幂等注册。
 *
 * ClientRouter 换页 + 模块重复求值场景下 customElements.define 会抛
 * NotAllowedError，这里统一守卫。命名约定：kl- 前缀（knowledge lesson）。
 */
export function defineElement(name: string, ctor: CustomElementConstructor): void {
	if (customElements.get(name)) return;
	customElements.define(name, ctor);
}
