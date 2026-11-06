---
title: '11 业务开发套路：从需求到上线的完整流程与代码模板'
date: 2026-09-13
order: 11
---

> 专栏：[前端转 Java 微服务实战笔记](/columns/frontend-to-java-microservices/) · 第 11 篇 · 发布日期：2026-09-13
> 目录：[专栏目录](/columns/frontend-to-java-microservices/) | 上一篇：[10 排障手册：日志、链路追踪、慢 SQL 与常见故障模式](10-troubleshooting.md) | 下一篇：[12 配置治理与上线：配置中心变更、灰度与回滚](12-config-and-release.md)

---

很多后端日常需求在产品经理口中听起来往往轻描淡写：“就加一个字段、列表加个筛选项嘛”。但当真正深入企业级微服务工程着手实现时，你会发现：SQL 变更、实体类 Entity、入参 BO、出参 VO、Mapper XML 映射、数据权限注解、事务边界、单元测试以及影响面梳理，整整一条垂直切片链路缺一不可。

漏掉其中任何一环，就会引发极其典型的线上故障：“列表有值但详情页面是空的”、“前端传了筛选条件但后台根本不生效”、“本地开发与测试环境一切正常，上线发布后普通员工越权查到了全公司数据”。

本文以一个典型的真实业务需求为切入点，把从需求拆解、契约翻译、代码落盘到验证上线的完整流水线完整走一遍。核心不在于死记硬背某套具体的业务逻辑，而是沉淀出一套**拿到需求后按图索骥的标准化工程套路**：每一步修改哪些层级、最容易在哪个死角踩坑、以及如何进行闭环自测。

---

## 本文贯穿的实战需求单

> **需求背景**：设备管理列表需要支持按照「排放标准」进行筛选，并在表格列和详情面板中完整展示该字段。
> **验收标准**：
> 1. 列表传参 `emissionLevel=国六` 时，仅筛选返回符合该标准的设备；
> 2. 设备详情能够正确展示该字段；
> 3. 导出 Excel 表格包含该列数据且数据字典翻译正确；
> 4. 存量历史数据的该字段为 NULL 时，现有查询与业务逻辑不受任何影响。

需求体量很小，但麻雀虽小五脏俱全。它会把 Entity、BO、VO、Mapper、XML、SQL DDL、数据权限、联调自测与影响面分析完整串联起来，是建立后端工程肌肉记忆的最佳模板。

---

## 前端经验向后端分层的认知迁移

| 前端高频动作 | 对应后端微服务动作 | 关键思维差异与注意点 |
|---|---|---|
| 需求评审时约定 TS 接口定义 | 定义 Controller 的 REST URL、入参 BO、出参 VO 及 `R<T>` / `PageResult<T>` | 后端接口契约一旦发布，Web、App、OpenAPI 乃至第三方系统都可能接入，变更和改名字段的成本远高于前端私有组件 |
| 在组件库里找相似模板复制修改 | 全局搜索相似业务的 Controller / Service / Mapper 模板 | 避免从零盲目编写，优先对齐当前业务子模块既有的分层与注解规范 |
| 修改公共工具函数前全局搜 usages | 修改 BO / VO / Entity 属性前全局检索 usages 引用 | 改名字段或变更数据类型是破坏性变更，新增可空字段才是安全的平滑升级 |
| 本地联调时紧盯 DevTools Network | 启动服务集群 + 发起调用 + 查看 p6spy 真实输出 SQL | 后端不能只看 HTTP 200，必须确认 SQL 经过插件改写后的真实形态 |
| 上线发布前执行回归测试脚本 | Maven 多模块定向编译 + 显式运行单元测试 + 输出影响面清单 | 企业级父 POM 默认常配置跳过测试，本地与流水线需显式启用验证 |

---

## 第一步：把产品需求翻译为接口契约

在进入代码编码前，首先在需求单中锁定四项契约要素：

```text
请求路径：GET /api/device/list（沿用既有设备分页查询端点）
查询入参：DeviceQuery 实体新增 emissionLevel 属性（String 类型，等值匹配，非必填）
响应出参：DeviceView 实体新增 emissionLevel 属性（String 类型，允许为 null）
向后兼容：数据库存量历史记录为 NULL；前端不传该参数时，查询行为与现有逻辑完全等价
```

审视现有的设备列表 Controller 接口实现：

```java
@SaCheckPermission(value = {"device:query", "device:app:add"}, mode = SaMode.OR)
@GetMapping("/list")
public PageResult<DeviceView> list(DeviceQuery query, PageRequest pageRequest) {
    return deviceService.selectDeviceList(query, pageRequest);
}
```

**契约分析结论**：本次改动**无需新增 URL 路由，也无需新增全新的权限标识符**。新增字段直接注入现有出入参 DTO 中，前端仅需在列表表头增加一列、筛选表单增加一个下拉框即可。

---

## 第二步：找相似实现，判断“到底需要修改几层”

顺着 `Controller -> Service -> ServiceImpl -> Mapper -> XML` 的链路通读一次现有实现。在 ServiceImpl 内部通常只有简洁的组装调用：

```java
Page<DeviceView> page = baseMapper.selectDevicePage(pageRequest.build(), query);
// ... 针对复杂字段进行内存回填或字典翻译
return PageResult.build(page);
```

此时需要快速评估改动的波及层次：**“纯粹加筛选”与“加全新字段并落库”所修改的层数截然不同**：

- **场景 A：仅新增筛选过滤条件**
  若底层数据库表与 Java Entity 中早已存在对应字段，仅仅是列表接口未暴露筛选能力，通常**只需要在 MyBatis XML 的 `<where>` 标签中追加 `<if>` 节点**。
- **场景 B：新增全新字段并涉及存储与展示**
  必须完整经历：DDL 变更脚本 -> Java Entity -> 入参 BO -> 出参 VO -> XML resultMap -> XML 多处 SELECT 投影 -> XML WHERE 过滤。

**核心判断口诀**：
- **只过滤不展示**：只动 XML 中的 WHERE 条件；
- **只读取展示不入库**：VO + XML SELECT 列清单；
- **全生命周期存储展示**：DDL 脚本 + Entity + BO + VO + XML。

---

## 第三步：编写可回滚的 DDL 变更脚本

在项目的数据库脚本目录中，按日期和需求命名，例如 `20260101_device_add_emission_level.sql`：

```sql
-- 设备表新增「排放标准」字段
-- 对应字典编码：emission_level（非必传）
ALTER TABLE device
    ADD COLUMN emission_level VARCHAR(50) NULL
    COMMENT '排放标准--对应字典 emission_level' AFTER energy_type;

-- 必须同步保留回滚脚本：
-- ALTER TABLE device DROP COLUMN emission_level;
```

数据库设计规范要点：
1. **强制编写可回滚语句**：在脚本注释中明确附带对应的 `DROP COLUMN` 撤销语句；
2. **明确默认值与 NULL 兼容性**：新字段务必声明为 `NULL`，确保历史存量数据在无需洗数据的情况下不受阻碍；
3. **索引预先评估**：若该字段属于全系统高基数且高频等值筛选列，评估是否纳入联合索引；若初期数据量较小且筛选频次低，切忌盲目添加索引。

---

## 第四步：Entity、BO、VO 三层类定义

### 1. 持久化实体类 Entity

```java
@TableName("device")
public class Device extends BaseEntity {
    // ... 原有字段定义

    /** 排放标准 字典类型：emission_level */
    private String emissionLevel;
}
```

字段名遵循小驼峰命名，MyBatis-Plus 会自动将其映射为数据库下划线字段 `emission_level`。由于继承了 `BaseEntity`，公共审计字段（`createBy`、`createDept`、`createTime`、`updateBy`、`updateTime`）会由框架的元对象处理器自动注入，**千万不要在业务代码中手工写 setter 赋值**。

### 2. 业务入参对象 BO / Query

```java
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = Device.class, reverseConvertGenerate = false)
public class DeviceQuery extends BaseEntity {

    /** 排放标准 字典类型：emission_level */
    @Xss(message = "排放标准不能包含脚本字符")
    @Length(max = 50, message = "排放标准长度不能超过{max}个字符")
    private String emissionLevel;
}
```

规范约束：
- 列表查询入参**绝对不能声明 `@NotBlank` 或 `@NotNull`**，否则前端如果不传筛选参数，请求将直接被 Hibernate Validator 拦截并报 HTTP 400；
- 入参建议挂载 `@Xss` 防护注解，杜绝脚本注入；
- 类头部的 `@AutoMapper` 声明了与目标 Entity 的自动映射机制，为后续调用 `BeanMapper.convert` 提供支持。

### 3. 视图展示对象 VO / View

```java
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = Device.class)
public class DeviceView implements Serializable {

    /** 排放标准 字典类型：emission_level */
    @ExcelProperty(value = "排放标准", converter = ExcelDictConvert.class, order = 21)
    @ExcelDictFormat(dictType = "emission_level")
    private String emissionLevel;
}
```

规范约束：
- 若该视图支持 EasyExcel 导出，使用 `@ExcelProperty` 并显式指定排序列号 `order`，避免与既有列次序冲突；
- 通过 `@ExcelDictFormat` 声明字典编码，导出时 EasyExcel 会自动将 `"6"` 翻译为 `"国六"`；
- 若前端需要直接展示中文文本，可参考系统通用的 `@Translation` 注解模式定义专用的 `emissionLevelName` 冗余属性。

---

## 第五步：Mapper 接口与 XML 映射（最容易遗漏的死角）

若在已有 Mapper 接口上复用查询，方法签名无需变更；若新增数据权限相关的复杂多表查询，需完整声明 `@DataScope`：

```java
@DataScope({
    @DataColumn(key = "deptName", value = "e.create_dept", dimension = DataScopeDimension.DEPT),
    @DataColumn(key = "userName", value = "e.create_by", dimension = DataScopeDimension.DEPT),
    @DataColumn(key = "modelName", value = "e.model_id", dimension = DataScopeDimension.VEHICLE_MODEL),
    @DataColumn(key = "categoryName", value = "m.category", dimension = DataScopeDimension.DEVICE_CATEGORY)
})
Page<DeviceView> selectDevicePage(Page<Device> page, @Param("bo") DeviceQuery query);
```

> **重点警示**：`@DataScope` 注解必须严格参照同模块既有方法对齐配置。漏掉该注解时，接口在本地联调与单元测试中能正常查出数据，**但上线后数据权限控制直接失效，导致越权数据被全部查出**。

在对应的 Mapper XML 文件中，通常需要**同步修改四处**：

### 1. resultMap 结果映射集
```xml
<result property="emissionLevel" column="emission_level"/>
```

### 2. 列表查询语句的 SELECT 投影列
```xml
e.emission_level,
```

### 3. 详情、基础信息、导出等其他查询的 SELECT 投影列
在手工维护 XML 的大型项目中，针对同一张业务表往往存在 `selectDeviceDetail`、`selectDeviceExportList`、`selectByVin` 等多条独立的 SQL 语句：
```xml
e.emission_level,
```

### 4. WHERE 动态过滤条件
```xml
<if test="bo.emissionLevel != null and bo.emissionLevel != ''">
    AND e.emission_level = #{bo.emissionLevel}
</if>
```

SQL 编写关键规范：
- 精确值匹配务必使用 `=`，只有模糊搜索才使用 `LIKE CONCAT('%', #{...}, '%')`；
- 始终使用预编译占位符 `#{}`，坚决禁止使用字符串拼接 `${}`，防范 SQL 注入风险；
- 多表联查时必须带上正确的表别名（如主表 `e.`，字典或关联表 `m.`）。

---

## 第六步：Service 业务逻辑与 Controller 控制层

### 1. Service 业务接口与实现层

```java
// Service 接口定义
PageResult<DeviceView> selectDevicePage(DeviceQuery query, PageRequest pageRequest);
Boolean insertDevice(DeviceQuery query);

// ServiceImpl 业务实现
@Override
public PageResult<DeviceView> selectDevicePage(DeviceQuery query, PageRequest pageRequest) {
    Page<DeviceView> page = baseMapper.selectDevicePage(pageRequest.build(), query);
    // 按业务场景按需组装：关联对象回填、在线状态计算等
    return PageResult.build(page);
}

@Override
public Boolean insertDevice(DeviceQuery query) {
    Device add = BeanMapper.convert(query, Device.class);
    validEntityBeforeSave(add); // 执行唯一性与前置业务规则校验
    return baseMapper.insert(add) > 0;
}
```

实现规范：
- 分页请求统一通过 `pageRequest.build()` 转换为 MyBatis-Plus 的 `Page<T>`，返回统一封装为 `PageResult.build(page)`；
- DTO 间转换优先使用映射工具，杜绝手工书写大量冗长的 getter/setter；
- 核心业务校验（如重名检测、状态机流转）写在 Service 内部，Controller 仅负责参数接收与协议适配。

### 2. Controller 接口层

```java
@SaCheckPermission("device:query")
@GetMapping("/page")
public PageResult<DeviceView> page(DeviceQuery query, PageRequest pageRequest) {
    return deviceService.selectDevicePage(query, pageRequest);
}

@SaCheckPermission("device:add")
@Log(title = "设备管理", businessType = BusinessType.INSERT)
@RepeatSubmit()
@PostMapping()
public R<Void> add(@Validated @RequestBody DeviceQuery query) {
    return toAjax(deviceService.insertDevice(query));
}
```

设计约定：
- **读操作**：配置 `@SaCheckPermission`，返回 `PageResult<T>`，无需记录操作日志 `@Log`；
- **写操作**：配置权限、`@Log` 操作日志与 `@RepeatSubmit` 防重复提交，返回统一 `R<Void>` 包装；
- 统一使用 `BaseController#toAjax` 将 Boolean 状态映射为前端标准响应。

---

## 第七步：权限、租户与边界核对

### 1. 权限矩阵确认
- 若沿用现有列表查询，权限标识符 `device:query` 已存在，**无需在数据库中新建菜单或权限节点**；
- 若需求明确要求拆分为全新独立子页面，则需在 `system-service` 的菜单权限表中插入新的权限记录并分配给对应角色；
- 若原有接口声明了 `mode = SaMode.OR`（如同时支持 App 端权限），新增或修改时需显式保持对齐。

### 2. 多租户隔离核验
- 若当前微服务已开启多租户插件（`tenant.enable=true`），XML 中**严禁手工书写 `AND tenant_id = #{tenantId}`**，MyBatis-Plus 租户拦截器会自动注入该条件；
- 涉及写操作或后台异步处理时，务必核实调用链路是否会丢失 `TenantContext`（参考第 9 篇避坑指南）。

---

## 第八步：全流程自测体系（由底向上逐层闭环）

开发完成后，按照自底向上的顺序进行闭环自测：

### 1. 模块定向编译构建

```powershell
./mvnw.cmd -pl equipment-service -am compile
```

### 2. 运行单元测试（显式开启测试开关）

```powershell
./mvnw.cmd -pl equipment-service -am "-DskipTests=false" test
```

### 3. 接口功能多维度自测矩阵

在请求头中携带有效的认证 Token 与 `clientid`，通过接口工具验证以下用例：
1. **不传参回归测试**：入参为空对象，验证接口返回数据与改动前完全一致；
2. **等值命中测试**：传入 `emissionLevel=国六`，验证返回列表均属于国六设备；
3. **详情页面核验**：调用详情接口，确认返回体中包含该字段及正确属性值；
4. **Excel 导出验证**：触发导出接口，检查生成的 Excel 中表头位置、数据行及字典翻译；
5. **入参健壮性校验**：传入超长字符串或 `<script>` 恶意标签，验证是否返回友好的校验错误提示，而不是直接抛出 500 异常。

### 4. SQL 实际形态验证

查看服务控制台的 p6spy 日志，确认：
- 生成的真实 SQL 中准确拼接了 `AND e.emission_level = '国六'`；
- 租户隔离条件与数据权限条件依然健全存在；
- 分页 `LIMIT` 逻辑执行无误。

---

## 第九步：影响面深度分析

像前端在修改公共底层组件前必须全局搜索引用一样，后端修改任何对象前也需要进行六层搜索确认：

1. **字段层**：全局检索 `emissionLevel` 与 `emission_level`，避免出现同名歧义或旧有废弃字段；
2. **类模型层**：检索 `DeviceView` 与 `DeviceQuery` 的被引用点，确认内部维保、统计分析等下游模块是否受到破坏；
3. **XML 映射层**：搜索 `resultMap="DeviceResult"`，检查是否存在同名但在不同命名空间下的 Mapper XML，防止遗漏修改；
4. **跨服务 RPC 层**：确认该 VO 是否暴露在 `api-module` 跨服务依赖包中。若属于跨服务对象，变更属于分布式破坏性变更，需同步发布新版本契约；
5. **导入导出链路**：由于系统导入通常使用专用的 `DeviceImportView`，加在 `DeviceView` 上的字段**不会自动生效于导入模板**，若需求包含导入需同步改动；
6. **前端联动层**：核对前端项目中的 TS 类型定义、搜索表单、表格 Column 配置及空值处理。

**标准影响面结论模板**：
> “本次变更为向下兼容的新增可空字段；影响范围限定在设备模块列表查询、详情展示与 Excel 导出；无跨微服务 RPC 契约变更；需前端同步更新类型定义、搜索表单与表格列渲染 4 处。”

---

## 第十步：代码提交与上线纪律

```powershell
# 1. 检查变动文件清单
git status --short

# 2. 检查格式与空白符问题
git diff --check

# 3. 定向核对本次任务相关代码
git diff -- equipment-service/
```

代码提交红线：
- **精准提交**：严格只提交当前需求关联的 Entity、BO、VO、Mapper、XML、ServiceImpl、Controller 以及 SQL 变更脚本；
- **坚决不提交垃圾文件**：严禁提交 `target/` 目录、`.idea/`、本地日志文件、本地配置以及包含生产连接串与私密密码的代码；
- **提交信息语义化**：遵循语义化提交规范，如 `feat(equipment): 设备列表支持按排放标准筛选及展示`，坚决避免无意义的“fix bug”、“update”。

---

## 避坑速查表

| 常见失误 | 导致的线上后果 | 标准应对规范 |
|---|---|---|
| 仅修改了列表 SELECT，遗漏了详情 SELECT | 列表能够看到数据，点击进入详情却为空白 | 全局搜索 `resultMap`，逐一补齐该 Mapper XML 下所有手写的投影列 |
| 在查询 Query 字段上声明了 `@NotBlank` | 前端用户不勾选该筛选条件时，接口直接报 HTTP 400 | 查询入参对象只做长度或防 XSS 校验，绝不加必填限制 |
| 新增 Mapper 查询方法时漏标 `@DataScope` | 接口能够正常查出数据，但越权访问其他部门数据 | 严格对齐模块内同类业务查询的方法注解声明 |
| 修改了 BO/VO 的既有字段名 | 造成前后端序列化异常或前端白屏 | 始终保持字段增量兼容，严禁直接更名已上线字段 |
| 仅跑单元测试但未注意用例已默认被跳过 | 遗留潜在破坏性回归故障 | 执行 Maven 命令时显式携带 `-DskipTests=false` |

---

## 思考与实践自测

**Q1：为什么本次在设备列表中新增一个字段，却不需要动 Controller 和 Service 接口的方法签名？**
因为接口设计遵循了面向对象封装契约，入参使用 `DeviceQuery`，出参使用 `DeviceView`。新增属性直接内聚在 DTO 类中，Spring MVC 的参数解析器与 Jackson 序列化器会自动适配新字段，方法入参与返回值无需改变。

**Q2：在 XML 映射中，`#{}` 与 `${}` 有什么本质区别？为什么拼接查询条件必须用 `#{}`？**
`#{}` 会被底层 JDBC 处理为预编译占位符 `?`，由数据库驱动负责转义与类型绑定，能彻底免疫 SQL 注入；而 `${}` 是原样纯文本字符串替换，容易被恶意输入拼接为破坏性 SQL。

**Q3：为什么开发完成后只在本地用管理员账号测通过是不够的？**
因为超级管理员账号通常在 `@DataScope` 拦截器中拥有全量放行逻辑。如果方法遗漏了 `@DataScope` 注解，管理员测试能正常拿到数据，而普通受限部门账号在线上运行时，本该生效的数据范围过滤却全部失效，形成越权漏洞。

---

## 下一步

掌握了单业务模块的垂直切片开发套路之后，代码还需要被正确发布到运行环境中。在下一篇中，我们将深入微服务的配置治理与发布上线：配置从代码仓库迁移到 Nacos 配置中心的动态生效机制、配置变更的风险分级、以及线上灰度与回滚的标准操作范式。
