/**
 * kl-* 组件套件唯一入口。
 *
 * 装载方式（LessonLayout / kit 页）：**裸** <script>（不带任何属性！
 * 带属性会变 is:inline，TS import 运行时会炸）：
 *
 *   <script>
 *     import '../kit/index';
 *   </script>
 *
 * 数据装载约定「光 DOM 子节点即数据」：
 *   散文写标记（pagefind 可索引）；结构化数据用
 *   <script type="application/json"> 子节点（MDX 里 JSON 需写成
 *   {`…`} 模板字面量表达式，或经 Astro 门面组件 set:html 注入）；
 *   标量走属性。对外事件 kl:* 前缀。
 */
import './elements/kl-term';
import './elements/kl-term-annotate';
import './elements/kl-glossary';
import './elements/kl-stage-stepper';
import './elements/kl-byte-strip';
import './elements/kl-flow-map';
import './elements/kl-instr-stepper';
import './elements/kl-memory-map';

export {};
