---
title: '07 数据访问：MyBatis-Plus、XML、分页与插件链'
date: 2026-07-19
order: 7
---

> 专栏：[前端转 Java 微服务实战笔记](/columns/frontend-to-java-microservices/) · 第 07 篇 · 发布日期：2026-07-19
> 目录：[专栏目录](/columns/frontend-to-java-microservices/) | 上一篇：[06 认证与权限：Sa-Token、登录态与权限来源](06-auth-and-permission.md) | 下一篇：[08 跨服务调用：Dubbo 的 api 模块、Provider/Consumer 与超时排错](08-dubbo.md)

第 06 篇理清了“谁能调这个接口”的权限关卡；这一篇我们要深入持久层回答：“接口放行之后，数据库里到底发生了什么”。

核心结论先亮在这里：**你在 Java 代码或 XML 映射文件里手写的 SQL，与数据库最终真实执行的 SQL 往往不是同一句。** 中间会完整经过一条串联起来的 MyBatis-Plus 拦截器链。

今天我们就顺着一条真实的设备列表查询，拆解 Entity/BO/VO 的对象分层防线、动态 SQL 映射、自动分页机制以及插件链改写 SQL 的完整黑盒。

---

## 1. 概念校准：前端经验与持久层对象映射

习惯了 Prisma、TypeORM 或纯 TypeScript 开发的前端同学，第一眼看到后端的对象定义常会觉得有些啰嗦：

| 前端经验 | 示例系统持久层对应 | 职责定位说明 |
|---|---|---|
| Prisma / TypeORM 的 Model Entity | MyBatis-Plus 的 `Entity` | 与数据库物理表结构严格 1:1 映射 |
| 前端表单模型 / 请求参数类型 | `Bo`（Business Object / Query） | 专职接收客户端请求参数，承载 `@NotBlank` 等入参校验规则 |
| 接口返回给前端的视图模型 / TS `interface` | `Vo`（View Object） | 对外暴露的视图对象，承载敏感字段裁剪、字典转义与 Excel 导出注解 |
| 跨微服务网络传输的类型定义 | `Dto`（Data Transfer Object） | 存放于 `api-*` 模块中，专供 Dubbo RPC 跨进程传输 |
| 列表接口返回结构 `{ list, total }` | `PageResult`（`rows` + `total`） | 后端统一的分页响应包装体 |
| 分页参数 `pageNum=1&pageSize=10` | `PageRequest` | 前端分页入参封装对象 |
| Express 中间件修改请求对象 | MyBatis 插件链改写 SQL | 在运行期通过 AST 语法树动态改写发往数据库的 SQL 文本 |

**核心心智差异**：TypeScript 的类型在编译后会被完全擦除（Type Erasure），运行时并不存在真实的内存开销；而 Java 后端的这套分层不只是“类型标注”，而是**真实存在于运行期内存中的对象转换防线**。

---

## 2. 真实链路剖析：一条设备列表查询

我们以一个典型的生产接口为例：`GET /equipment/device/list?pageNum=1&pageSize=10&vin=xxx`。

### 2.1 Controller 层：协议解析与安全守卫

```java
@SaCheckPermission(value = {"device:query", "device:app:add"}, mode = SaMode.OR)
@GetMapping("/list")
public PageResult<DeviceView> list(DeviceQuery query, PageRequest page) {
    return deviceService.selectDeviceList(query, page);
}
```

注意细节：
- `query` 和 `page` **没有加 `@RequestBody` 注解**，Spring MVC 会自动将 URL 中的 query string 提取并注入到对象的同名属性中（GET 请求的标准写法）；
- 返回类型是强类型的 `PageResult<DeviceView>`，而不是底层的数据库实体；
- 接口级权限注解 `@SaCheckPermission` 挂载在这一层，拦截在进入 Service 之前。

### 2.2 Service 层：业务编排与批量数据回填

```java
Page<DeviceView> result = baseMapper.selectDeviceDetailPage(page.build(), query);
fillTerminalRelations(result.getRecords());
fillFactorySerialNums(result.getRecords());
fillControllerAndScreenCount(result.getRecords());
fillGb32960Info(result.getRecords());
fillOtaOnlineStatus(result.getRecords());
return PageResult.build(result);
```

这段代码展现了一个非常经典的微服务性能设计模式：**主查询只查主表及最核心的关联表，其余扩展字段在 Service 层通过批量查询并在内存中回填**，坚决避免在 SQL 中无休止地 LEFT JOIN 大表。
如果把终端关系、出厂序列号、OTA 状态全部塞进单条 SQL 进行笛卡尔积关联，主表数据量大时数据库的 JOIN 性能会急剧恶化；拆解为“主查询 + 批量内存回填”，既保证了分页效率，又让每个维度的回填逻辑易于做单独的缓存优化。

### 2.3 Mapper 接口与 XML 动态映射

```java
@DataScope({
    @DataScopeColumn(key = "deptName", value = "d.create_dept", dimension = DataScopeDimension.DEPT),
    @DataScopeColumn(key = "userName", value = "d.create_by", dimension = DataScopeDimension.DEPT),
    @DataScopeColumn(key = "modelName", value = "d.model_id", dimension = DataScopeDimension.MODEL),
    @DataScopeColumn(key = "deviceCategoryName", value = "m.device_category",
                dimension = DataScopeDimension.DEVICE_CATEGORY)
})
Page<DeviceView> selectDeviceDetailPage(
    Page<Device> page, @Param("query") DeviceQuery query);
```

复杂的联表查询逻辑下沉到对应的 XML 映射文件中：

```xml
<select id="selectDeviceDetailPage" resultMap="DeviceResult">
    SELECT d.id, d.vin, d.model_id, m.model_name, ...
    FROM device d
    LEFT JOIN device_model m ON d.model_id = m.id AND m.del_flag = '0'
    LEFT JOIN device_terminal t ON t.device_id = d.id AND t.del_flag = '0'
</select>
```

使用 `resultMap` 将 `model_name` 这类跨表字段精准映射到 `DeviceView` 对应的属性上，绝不依赖模糊的自动猜测。

---

## 3. Entity / BO / VO / DTO：为什么不能直接把实体暴露给前端？

### 3.1 四类对象的具体分工

| 模型类型 | 示例类名 | 核心职责与特征 |
|---|---|---|
| **Entity（实体）** | `Device` | 严格映射底层数据库表字段，标注 `@TableName`、`@TableId`、`@TableLogic`（逻辑删除） |
| **BO / Query（入参对象）** | `DeviceQuery` | 接收前端传入的过滤参数，标注 JSR-303 校验注解与 `@AutoMapper(target = Device.class)` |
| **VO（视图对象）** | `DeviceView` | 返回给前端展示或 Excel 导出的强类型视图，标注 `@ExcelProperty`、`@Translation` 字典翻译注解 |
| **DTO（数据传输对象）** | `api-*` 下的 `UserDto` | 微服务之间跨进程 RPC 传输契约，必须实现 `Serializable` |

实体只负责忠实反映数据库物理表结构：

```java
@TableName("device")
public class Device {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    @TableLogic
    private String delFlag;
}
```

查询对象负责入参接收与格式校验：

```java
@Data
@AutoMapper(target = Device.class)
public class DeviceQuery {
    @NotBlank(message = "VIN 不能为空")
    @Length(max = 17)
    private String vin;
    private Long modelId;
}
```

视图对象负责对外展示形态：

```java
@Data
public class DeviceView {
    @ExcelProperty("VIN")
    private String vin;
    @Translation(type = TransConstant.DICT, mapper = "deviceCategory")
    private String deviceCategoryName;
}
```

### 3.2 为什么严禁直接把 Entity 当作入参或返回值？

1. **泄露敏感与审计字段**：数据库里的 `del_flag`、`create_by`、`update_by`、`tenant_id` 属于内部技术实现，前端不需要也不该感知。
2. **避免表结构成为公共契约**：如果直接返回实体，一旦数据库为了优化执行分表或改动列名，前端所有依赖页面会全部崩塌。VO 作为防线提供了稳定的接口契约。
3. **数据形态与字典转义**：数据库存储的是原始状态码（如 `status = '1'`），而前端列表往往需要显示经过翻译的中文含义（如 `启用`）。
4. **防范 Mass Assignment（对象批量赋值攻击）**：如果直接拿 `Device` 实体接收 HTTP 请求体，黑客抓包可以在 JSON 里恶意传入 `tenant_id` 或 `del_flag`，在执行更新时覆盖内部字段造成越权。

前端类比：你不会把后端返回的原始数据直接不做任何处理就塞给组件展示，中间总有一层 `mapApiToViewModel`。VO 就是后端的这层模型防线。

### 3.3 对象转换工具与 BaseMapper

在进行写操作持久化时，通用规范采用 `BeanMapper` 进行对象转换：

```java
Device device = BeanMapper.convert(query, Device.class);
if (device == null) {
    throw new ServiceException("设备不存在");
}
device.setUpdateTime(LocalDateTime.now());
deviceMapper.updateById(device);
```

而在查询时，项目扩展了增强型的 `BaseMapper<T, V>`，原生支持 `selectVoById`、`selectVoList`、`selectVoPage`，能在单表查询时省去手工转换的开销：

```java
public interface DeviceMapper extends BaseMapper<Device, DeviceView> {
    Page<DeviceView> selectDeviceDetailPage(
        Page<Device> page, @Param("query") DeviceQuery query);
}
```

---

## 4. `@Select` 注解与 XML 映射的选择取舍

在日常开发中，应该把 SQL 写在注解里还是 XML 里？

| 业务场景 | 业界最佳实践推荐 | 原因说明 |
|---|---|---|
| 单表标准 CRUD | 直接调用 `BaseMapper` 原生方法 | 框架自动生成 SQL，零开发成本 |
| 条件极简的单表查询 | 接口方法头上直接写 `@Select("...")` | 简单直观，少维护一个文件 |
| 多表 JOIN、动态 `<if>`、复杂 `resultMap` | 编写独立 XML 映射文件 | 动态条件和字段映射结构清晰，易于维护排查 |
| 需被数据权限与租户拦截改写的复杂查询 | XML 配合 Mapper 上的 `@DataScope` | 字段别名和表别名在 XML 里最容易对齐 |

规范约定：
- XML 路径必须符合约定：`<module>/src/main/resources/mapper/<domain>/XxxMapper.xml`；
- XML 根节点的 `namespace` 必须是对应 Mapper 接口的全限定类名；
- `<select id="...">` 的 `id` 必须与 Mapper 接口方法名严格一致；
- 关联查询返回 VO 时，明确使用 `resultMap`，避免使用 `resultType` 引发同名自动映射错误。

---

## 5. `PageRequest` 是如何变成底层 `LIMIT` 的？

前端传进来的分页对象 `PageRequest` 仅包含基础入参：

```java
public class PageRequest {
    private Integer pageSize;
    private Integer pageNum;
    private String orderByColumn;
    private String isAsc;
}
```

它的 `build()` 方法提供了防御兜底逻辑：

```java
public Page<DeviceView> build() {
    int current = pageNum == null || pageNum <= 0 ? 1 : pageNum;
    int size = pageSize == null ? 10 : pageSize;
    return new Page<>(current, size);
}
```

- 默认保证 `pageNum = 1`、`pageSize = 10`；
- 防御非法负数或零值；
- 自动将驼峰命名的排序列名（如 `createTime`）安全转换为下划线数据库列名并追加排序方向。

底层的 `PaginationInnerInterceptor` 分页拦截器感知到方法入参包含了 `Page` 对象后，会自动执行两个动作：
1. 先行生成一条 `SELECT COUNT(1) FROM ...` 查询，查出总记录数赋值给 `total`；
2. 在主查询 SQL 尾部自动挂载 `LIMIT ?, ?`，完成物理级分页。

拦截器注册顺序示意：

```java
MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
interceptor.addInnerInterceptor(tenantInterceptor);
interceptor.addInnerInterceptor(analyticsTableNameInterceptor);
interceptor.addInnerInterceptor(dataPermissionInterceptor);
interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
```

最终包装为规范的 `PageResult` 返回给前端：

```json
{ "total": 100, "rows": [...], "code": 200, "msg": "查询成功" }
```

前端 Table 分页组件直接对接 `total` 与 `rows`。

---

## 6. 插件链：为什么最终 SQL 和你写的不一样？

MyBatis-Plus 的拦截器链是**严格按注册顺序自左向右执行的**：

```mermaid
flowchart LR
    A[你写的原始 SQL] --> B[多租户插件]
    B --> C[分析库表名插件]
    C --> D[数据权限插件]
    D --> E[分页插件]
    E --> F[乐观锁插件]
    F --> G[最终执行的 SQL]
```

| 拦截插件 | 拦截后追加或改写了什么 | 生效前置条件 |
|---|---|---|
| **多租户 `TenantLineInnerInterceptor`** | 在 SQL 末尾强制拼接 `AND tenant_id = ?` | 只有该 Bean 存在时生效（若配置 `tenant.enable=false` 则跳过） |
| **分析库表名 `AnalyticsTableNameInterceptor`** | 动态替换跨库 catalog/db 名称 | **仅处理以 `.AnalyticsMapper` 或 `.MetricMapper` 结尾的接口**，普通业务 Mapper 不受影响 |
| **数据权限 `DataScopeInterceptor`** | 根据当前登录用户的部门树与角色范围追加 `AND (d.dept_id IN (...))` | Mapper 方法上标注了 `@DataScope` 时生效 |
| **分页 `PaginationInnerInterceptor`** | 统计 `COUNT` 并追加 `LIMIT ?, ?` | 方法入参带有 `Page` 对象 |
| **乐观锁 `OptimisticLockerInnerInterceptor`** | 更新时追加 `WHERE version = ?` 并将版本号加 1 | 实体属性打上 `@Version` |

### 6.1 在控制台观察改写后的真实 SQL

在本地开启了 p6spy 的环境下，控制台会输出改写后的完整语句：

```text
-- 1. 你在 XML 里写的原始模板：
SELECT d.id, ... FROM device d
LEFT JOIN device_model m ON ...

-- 2. 数据权限插件改写后（自动注入当前登录人的部门范围）：
SELECT d.id, ... FROM device d
LEFT JOIN device_model m ON ...
WHERE (d.create_dept IN (100, 101))

-- 3. 分页插件最后追加：
... LIMIT 10 OFFSET 0
```

排查技巧：
1. 先查看是否打印了先行的 `COUNT(1)` 查询，核实总数是否符合预期；
2. 再查看带 `LIMIT` 的查询，重点确认 `WHERE` 子句里是否被自动追加了租户或部门限制；
3. 如果一条数据原本存在却查不出，90% 的原因是数据权限拦截器自动把范围缩限到了当前账号无法触达的部门下。

---

## 7. 新增字段与新增查询的标准化 Checklist

### 7.1 新增一个业务字段的标准流程

1. **数据库 DDL 脚本**：编写 `ALTER TABLE` 语句，置于独立 SQL 目录，要求允许为 NULL 保证历史数据兼容；
2. **Entity 实体类**：增加对应属性，确认 `@TableField` 命名匹配；
3. **入参 BO 类**：若前端允许传入该字段，补充进 BO 类并标注必要格式校验；
4. **出参 VO 类**：若前端需要展示或导出，补充进 VO 类，按需标注 `@ExcelProperty` 或 `@Translation`；
5. **Mapper XML 映射**：在 `<resultMap>` 中补充字段映射，并在 `<select>` 的查询列中带上新字段（**极易漏项，漏了查出来就是 null**）；
6. **前端接口契约同步**：确认大整数 ID 转字符串（防 JS 精度丢失）、时间格式以及空值处理；
7. **联调验证**：编译工程，发起真实请求，通过 p6spy 查看 SQL 中该字段是否被正确检索并返回。

### 7.2 新增一个查询接口的标准流程

1. 判断是单表还是多表：单表优先复用 `BaseMapper` 自带方法；
2. 多表联查在 XML 中编写，确保 `namespace`、`id`、`resultMap` 三件套与 Java 接口完全对齐；
3. 需数据权限隔离的，在 Mapper 方法加上 `@DataScope`，且注解声明的字段别名必须与 XML 里的表别名严格一致（如 `d.create_dept`）；
4. 分页方法第一个参数使用 `Page<T>`，Service 中调用 `page.build()`；
5. Controller 返回统一的 `PageResult.build(page)`；
6. 验证：确认 COUNT 查询与 LIMIT 改写均按预期生效。

---

## 8. 练习与自检

### 练习建议（耗时约 40 分钟）

1. 在项目中找到设备分页查询的 `DeviceResult`（`resultMap`），找出 3 个不属于 `device` 主表的字段，说明它们分别来自哪张关联表。
2. 尝试使用 `pageNum=0&pageSize=1000` 作为参数调用一次分页接口，观察控制台由 p6spy 打印出的实际 `LIMIT` 语句，体会 `build()` 的兜底效果。
3. 打开控制台日志，找到某次列表查询所触发的 `COUNT` 与 `LIMIT` 两条 SQL，明确区分出哪一部分是手写的、哪一部分是插件追加的。
4. 在一个 Mapper 查询方法上临时添加或移除 `@DataScope` 注解，对比两次调用所生成的 SQL 中 `WHERE` 条件的差异。

### 自检问题

1. **为什么在 Controller 层直接将持久层的 Entity 实体类作为接口响应体返回是不推荐的？**
   答：直接返回 Entity 会将数据库的物理表结构与外部接口强耦合，任何内部表重构都会破坏前端契约；同时会暴露逻辑删除位（`del_flag`）、租户 ID 等内部审计字段，且无法进行字典值翻译脱敏与灵活的视图字段裁剪。

2. **前端传来的 `PageRequest` 为什么不能直接作为参数传给 Mapper XML 里的 SQL 语句？**
   答：`PageRequest` 只是包含前端参数的简单 POJO。必须调用 `page.build()` 将其转换成 MyBatis-Plus 原生的 `Page` 对象，这样分页拦截器（`PaginationInnerInterceptor`）才能在底层识别并自动拦截该方法，完成执行 COUNT 总数统计与动态追加 LIMIT 物理分页的逻辑。

3. **方法上的 `@DataScope` 注解究竟是在哪一层生效的？它改动了什么？**
   答：它在持久层的 MyBatis 拦截器（`DataScopeInterceptor`）中生效。拦截器在 SQL 执行前读取注解中声明的部门/用户列，并从当前登录人的上下文中取出其被授权的数据范围，利用 AST 语法树动态在原 SQL 的 `WHERE` 子句中追加部门 ID 或用户 ID 的过滤条件。

4. **为什么在普通的设备列表查询日志里，完全看不到针对分析库表名的动态替换？**
   答：因为 `AnalyticsTableNameInterceptor` 插件在设计时增加了严格的类名过滤规则，它只针对以 `.AnalyticsMapper` 或 `.MetricMapper` 结尾的大数据分析接口生效，普通业务 Mapper 会直接被跳过以保证执行性能。

5. **在日常需求中为一个现有业务表新增一个展示字段，后端最少需要修改哪几处代码？**
   答：最少需要修改 4 处：执行数据库 DDL 添加字段、在对应的 Entity 类中增加属性、在出参 VO 类中增加展示属性，并在对应 Mapper XML 的 `resultMap` 与 `SELECT` 投影列表中补齐该字段（若前端还要支持传参过滤，则还需在入参 BO 类及 XML 的 `<where>` 动态条件中追加）。

---

## 9. 下一篇预告

单个微服务内部的增删改查我们已经彻底掌握。但在分布式微服务架构下，数据通常切分在不同的服务和数据库中。

比如：设备服务想要知道设备绑定的车主信息，而车主属于系统服务；想要触发审批，审批在工作流服务……
**既然微服务之间不能直接跨数据库写 JOIN，那服务之间是如何像调用本地方法一样远程互相“喊话”的？为什么服务间不用 HTTP/JSON，而必须使用 Dubbo RPC？遇到“本地跑着正常，联调却报没有 Provider”该如何排查？**

下一篇，我们将进入跨服务通信核心区：**[08 跨服务调用：Dubbo 的 api 模块、Provider/Consumer 与超时排错](08-dubbo.md)**。
