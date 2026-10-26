/**
 * 超高代码块的折叠 / 展开行为。
 *
 * ## 为什么还需要这个脚本（构建期不是已经标好了吗）
 *
 * rehype-code-block.mjs 在构建期按「逻辑行数 × 固定行高」估算块高，只能
 * 判断「大概率超高」。真正决定是否溢出的是**浏览器里的实际排版**：
 *
 * - 代码开了 `wrap`，一行长命令在手机上会折成三四行，逻辑行数少但极高；
 * - 网页字体加载前后的行高、浏览器默认字号、用户缩放都会改变块高。
 *
 * 所以运行期用真实 `scrollHeight` 复核一遍：多标的撤掉、漏标的补上
 * （含补建折叠栏）。构建期的估算只负责**首屏**：让绝大多数超高块在
 * 第一帧就是折叠态，不出现「先摊开再收起」的跳动。
 *
 * ## 三个关键做法
 *
 * 1. **事件委托 + 只测量一次**。站点开了 ClientRouter（视图过渡），
 *    跨页导航时 document 不重建，重复绑定会一次点击触发多次；
 *    而 astro:page-load 在首次加载时也会触发，所以测量要幂等。
 * 2. **先写后读再写**。给所有待测块打上折叠标记 → 统一读一次尺寸
 *    （只触发一次同步布局）→ 再统一改状态。逐块读写的写法在代码块
 *    密集的文章里会引发 N 次强制重排。
 * 3. **裁剪高度不在 JS 里复刻**。上限来自 CSS（还可能带媒体查询），
 *    所以测量时直接让 CSS 生效再读 clientHeight，避免两处常量漂移。
 */
(function () {
	if (window.__codeBlockFoldReady) return;
	window.__codeBlockFoldReady = true;

	var FOLD_ATTR = 'data-code-fold';
	var OPEN_CLASS = 'is-fold-open';
	var FOOT_CLASS = 'code-block__fold';
	var LABEL_COLLAPSED = '展开全部';
	var LABEL_EXPANDED = '收起';
	/** 1px 级的舍入误差不算溢出（clientHeight / scrollHeight 都是整数）。 */
	var TOLERANCE = 2;

	/** 已经量过的块。换页是新 DOM，自然为空；resize 时手动清空重来。 */
	var measured = new WeakSet();

	function labelOf(button) {
		return button.querySelector('.' + FOOT_CLASS + '-label') || button;
	}

	/** 折叠栏缺失时补建（窄屏换行才溢出的块，构建期不会给它生成）。 */
	function ensureFooter(block) {
		var existing = block.querySelector(':scope > .' + FOOT_CLASS);
		if (existing) return existing;

		var button = document.createElement('button');
		button.type = 'button';
		button.className = FOOT_CLASS;
		button.setAttribute('data-code-fold-toggle', '');
		// 和构建期生成的折叠栏一致：界面元素不进搜索索引
		button.setAttribute('data-pagefind-ignore', '');
		button.setAttribute('aria-expanded', 'false');

		var label = document.createElement('span');
		label.className = FOOT_CLASS + '-label';
		label.textContent = LABEL_COLLAPSED;
		button.appendChild(label);

		block.appendChild(button);
		return button;
	}

	/**
	 * 复核一批块是否需要折叠。
	 *
	 * 已展开的块直接跳过：它必然是超高的（否则当初不会出现折叠栏），
	 * 而在这里把它临时折起来再展开，会让读者的阅读位置闪一下。
	 */
	function evaluateAll(root) {
		var nodes = (root || document).querySelectorAll('.code-block');
		if (!nodes.length) return;

		var pending = [];
		for (var i = 0; i < nodes.length; i += 1) {
			var block = nodes[i];
			if (measured.has(block) || block.classList.contains(OPEN_CLASS)) continue;
			var pre = block.querySelector('pre');
			if (!pre) continue;
			pending.push({ block: block, pre: pre });
		}
		if (!pending.length) return;

		// 先写：全部按折叠态渲染，才能量出「超出多少」
		for (var w = 0; w < pending.length; w += 1) {
			pending[w].block.setAttribute(FOLD_ATTR, '');
		}

		// 再读：连续读取不会重复重排（浏览器缓存了上次布局）
		for (var r = 0; r < pending.length; r += 1) {
			pending[r].clipped = pending[r].pre.clientHeight;
			pending[r].full = pending[r].pre.scrollHeight;
		}

		// 最后写：定状态
		for (var c = 0; c < pending.length; c += 1) {
			var item = pending[c];
			// 隐藏容器（折叠面板、未激活的 tab）里量不到尺寸，
			// 保持构建期结论，且不记为已测 —— 以后再有机会重新量。
			if (!item.clipped) continue;

			measured.add(item.block);
			if (item.full - item.clipped <= TOLERANCE) {
				// 实际并没超出上限：撤掉折叠态，别留一条点了只会抖一下的折叠栏
				item.block.removeAttribute(FOLD_ATTR);
			} else {
				ensureFooter(item.block);
			}
		}
	}

	var resizeTimer = 0;
	function scheduleReevaluate() {
		if (resizeTimer) window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(function () {
			resizeTimer = 0;
			measured = new WeakSet();
			evaluateAll(document);
		}, 150);
	}

	/**
	 * 点击折叠栏。事件委托挂在 document 上，跨页导航后依然有效；
	 * 用 closest 找按钮，箭头图标与文字都能点到。
	 */
	document.addEventListener('click', function (event) {
		var button = event.target.closest('[data-code-fold-toggle]');
		if (!button) return;

		var block = button.closest('.code-block');
		if (!block) return;

		var open = block.classList.toggle(OPEN_CLASS);
		button.setAttribute('aria-expanded', open ? 'true' : 'false');
		labelOf(button).textContent = open ? LABEL_EXPANDED : LABEL_COLLAPSED;

		if (open) return;

		/**
		 * 收起后整块高度骤减：如果读者是在很靠下的位置点的「收起」，
		 * 折叠栏会被顶到视口上方，看起来像「点了之后内容凭空消失」。
		 * 只在整块已经跑到视口外时把它的下沿拉回来，不居中、不加平滑滚动。
		 */
		if (block.getBoundingClientRect().bottom < 0) {
			block.scrollIntoView({ block: 'nearest' });
		}
	});

	function boot() {
		evaluateAll(document);
	}

	// 网页字体到位后行高才最终确定，重新量一次
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(scheduleReevaluate, function () {});
	}
	window.addEventListener('resize', scheduleReevaluate, { passive: true });

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot, { once: true });
	} else {
		boot();
	}

	// ClientRouter：每次换页都是全新 DOM。astro:page-load 在首次加载时也会触发，
	// 靠 measured 去重，不会白量第二遍。
	document.addEventListener('astro:page-load', boot);
})();
