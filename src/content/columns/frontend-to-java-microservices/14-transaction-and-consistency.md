---
title: '14 事务与一致性：@Transactional 的边界、分布式事务是否真的启用'
date: 2026-11-01
order: 14
---

> 专栏：[前端转 Java 微服务实战笔记](/columns/frontend-to-java-microservices/) · 第 14 篇 · 发布日期：2026-11-01
> 目录：[专栏目录](/columns/frontend-to-java-microservices/) | 上一篇：[13 独当一面：复杂问题拆解与跨团队协作](13-standalone-collaboration.md) | 下一篇：[15 性能与容量：慢 SQL、缓存、批处理、连接池](15-performance-and-capacity.md)

---

事务是后端开发中最容易被"想当然"的一块：注解加上去了，就以为一定生效；服务拆成微服务了，就以为分布式事务组件一定在兜底。这一篇只聚焦两件事：**`@Transactional` 到底管得了什么、管不了什么**，以及**跨服务的数据一致性在实际工程中靠什么来保障**。

如果你正在参与多数据源的业务开发，或者正准备把单体应用拆分成微服务，这里梳理的边界判断思路会比单纯记住几个注解更有长期价值。

---

## 前端直觉到后端事务的思维对照

| 前端直觉 | 后端对应机制 | 关键差异 |
|---|---|---|
| 一个页面里连续调 3 个接口，失败后手动撤销 UI 状态 | 一个本地事务里写 3 张表，失败由数据库保证整体回滚 | 后端回滚由数据库引擎保证原子性，不依赖代码手工补偿 |
| 提交表单后按钮置灰防重复点击 | 防重复提交注解 + 数据库唯一索引 + 业务幂等设计 | 前端防抖只是用户体验优化，服务端必须自己兜底防重 |
| 带版本号的乐观更新（冲突提示用户刷新） | MyBatis-Plus `@Version` 乐观锁 | 冲突检测发生在数据库层面，不在浏览器端 |
| 多个微前端应用各自提交数据，靠事件总线最终一致 | 跨服务各自本地事务 + 补偿 / 消息机制 | 没有一个"全局回滚"按钮 |

一句话总结：**`@Transactional` 只管当前进程、当前数据库连接、当前线程的一次方法调用；跨服务之间不存在免费的一致性保障。**

---

## 一、事务边界：什么该包进去，什么不该包

### 必须包在同一个事务中的场景

| 场景 | 典型例子 | 原因 |
|---|---|---|
| 同库多表写入 | 用户表 + 角色关联 + 岗位关联 + 项目关联 | 任何一张写失败，其余必须全部回滚 |
| 主数据 + 明细数据 | 订单主表 + 订单明细、设备主表 + 关联附件 | 不允许出现"有主记录无明细"的脏状态 |
| 状态流转 + 日志记录 | 修改业务状态的同时写操作日志 | 状态和审计记录必须保持同步 |
| 校验 + 写入 | 先查重再插入 | 缩小"先查后改"之间的并发窗口 |

一个典型的生产案例是 `UserServiceImpl#insertUser`：用户表、岗位关联表、角色关联表、项目关联表必须一起成功或一起失败：

```java
@Override
@Transactional(rollbackFor = Exception.class)
public int insertUser(UserBo user) {
    User entity = BeanMapper.convert(user, User.class);
    int rows = baseMapper.insert(entity);   // 用户主表
    user.setUserId(entity.getUserId());
    insertUserPost(user, false);            // 岗位关联
    insertUserRole(user, false);            // 角色关联
    insertUserProject(user, false);         // 项目关联
    return rows;
}
```

四张表要么全部成功，要么全部回滚。注解中的 `rollbackFor = Exception.class` 是生产代码中的常见惯例——Spring 默认只在 `RuntimeException` 和 `Error` 时回滚，显式声明后能覆盖受检异常（Checked Exception）。

### 不应该包进事务的操作

| 操作类型 | 不应包含的原因 | 正确做法 |
|---|---|---|
| RPC / HTTP 远程调用 | 远程服务不受本地事务控制；长调用会持续占用数据库连接 | 放到事务外执行，或改为"本地先落库 + 异步补偿" |
| 文件上传 / OSS | 上传耗时长且可能超时，无法随数据库回滚 | 先上传文件、再写业务表；失败留下的垃圾文件由定时清理任务处理 |
| 发送消息 / MQ | 消息一旦发出无法撤回 | 在事务提交后再发送（事务同步器 / Outbox 模式） |
| 大批量循环写入 | 事务过长、行锁范围大、数据库连接长时间被占用 | 分批提交，每批一个短事务 |
| 纯查询操作 | 不必要地占用事务资源和连接 | 只读查询不加事务；确需一致性快照读时再使用只读事务 |

判断口诀：**"这个操作能不能随数据库一起撤销？"如果不能，就不应该塞进事务。**

还有一个反直觉但非常实际的连锁效应：假设事务方法内部调用了一个远程接口，该接口超时 3 秒、重试 3 次，那么数据库连接就被白白占用近 10 秒。在并发流量上升后，HikariCP 连接池会先于业务逻辑被耗尽，表现为**所有接口都变慢或超时**，而不仅仅是这一个接口慢。这也是第 15 篇讨论连接池问题时的常见根因之一。

---

## 二、五种经典的事务失效场景

| 序号 | 表面现象 | 根本原因 | 修复方法 |
|---|---|---|---|
| 1 | 方法 A 调用本类方法 B，B 抛异常但 A 的数据没有回滚 | 自调用走 `this` 引用，绕过了 Spring AOP 代理，`@Transactional` 注解不被拦截 | 将方法 B 拆到另一个 Bean 中；或注入自身代理（不推荐） |
| 2 | 主线程回滚了，但异步线程写入的数据仍然存在 | `@Async` 在另一个线程、另一条数据库连接上执行，不共享主线程事务 | 事务提交后再触发异步；异步方法自行实现幂等与补偿 |
| 3 | 本地事务回滚了，但 RPC 下游已经成功写入 | RPC 是跨进程调用，下游有自己独立的事务 | 不要指望本地事务覆盖远程调用；用幂等 + 补偿 / 对账 |
| 4 | 异常被 `catch` 吞掉后事务没有回滚 | 异常没有抛出方法边界，事务拦截器感知不到 | 在 catch 块中重新抛出，或通过 `TransactionAspectSupport` 显式标记回滚 |
| 5 | 传播级别或只读属性配置错误，写操作没生效或报错 | `readOnly=true` 下执行写操作、`NOT_SUPPORTED` 挂起了事务、`REQUIRES_NEW` 开了新连接 | 写方法不设 `readOnly`；传播级别按"是否需要独立提交"来选择，默认 `REQUIRED` 覆盖多数场景 |

另外两条经常被忽略的细节：

- `@Transactional` 注解标记在 `private` 或 `final` 方法上时，CGLIB 代理无法生成子类覆盖，注解完全不会生效；
- 同一个类中两个 `@Transactional` 方法互相调用时，内层方法的传播行为会与外层合并（而非独立），开发者很容易误以为"内层可以独立回滚"。

这些都不是"Spring 框架的 Bug"，而是**注解生效的前提是方法调用经过了代理对象，而自调用天然绕过了代理**这一底层机制的直接体现。

此外，在事务方法内部如果把异常 `catch` 后继续执行后续写操作，前面的写入并不会自动被撤销。事务的提交/回滚只发生在方法**正常返回**或**异常穿出代理边界**的那一刻。

---

## 三、Seata 在示例系统中的真实装配状态

先直接给出结论：**依赖在 classpath 上、YAML 配置项存在、但默认全部关闭、业务代码中没有分布式事务注解。**

### 1. 开关默认关闭

```yaml
seata:
  enabled: false
  enable-auto-data-source-proxy: false
```

### 2. 数据源代理跟随开关联动

```yaml
spring:
  datasource:
    dynamic:
      seata: ${seata.enabled}
```

`seata: false` 时，动态数据源不会被 Seata 代理包装；`enable-auto-data-source-proxy: false` 进一步关闭了 Seata Starter 的自动代理，避免双重代理问题。这意味着在默认配置下，**所有 SQL 操作走的都是普通的本地事务，没有 AT 模式的分支事务注册**。

### 3. Maven 依赖确实存在

公共事务模块中引入了完整的 Seata 依赖体系：

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
<dependency>
  <groupId>io.seata</groupId>
  <artifactId>seata-spring-boot-starter</artifactId>
</dependency>
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-filter-seata</artifactId>
</dependency>
```

但对应的自动配置类只是一个空壳：

```java
@AutoConfiguration
public class SeataConfig {
}
```

依赖存在于 classpath，不代表分布式事务能力被实际启用。

### 4. 业务代码中无 `@GlobalTransactional`

通读示例系统的业务代码，几乎找不到任何 `@GlobalTransactional` 注解。跨服务调用入口也没有显式开启全局事务。也就是说，即使手动将 `seata.enabled` 改为 true，现有业务也不会自动变成分布式事务——必须在跨服务入口方法上显式添加注解，并且各参与数据库要有 `undo_log` 回滚日志表，Seata Server（TC 事务协调器）也必须可用。

综合可证实的事实：
- **已确认**：默认关闭、数据源代理关闭、依赖在 classpath 上、无全局事务注解；
- **需以实际环境验证**：各环境配置中心里 `seata.enabled` 的实际值、动态数据源是否真的未被代理、Seata Server 是否在运行、各参与库是否存在 `undo_log` 表。这些不能只看配置模板下结论。

如果未来确实要启用 Seata AT 模式，最小前置条件是：Seata Server 可用 + 每个参与库有 `undo_log` 表 + 数据源代理开启 + 入口方法声明 `@GlobalTransactional` + 明确的超时时间与回滚策略。缺少任何一项，事务要么不生效，要么回滚不完整。

---

## 四、跨服务数据一致性：工程上的现实做法

在没有全局事务的环境下，跨服务的数据一致性通常靠"本地事务 + 幂等 + 补偿/重试 + 最终一致"来保障。

### 模式 1：本地事务 + 唯一约束 + 幂等返回

跨服务创建账号是一个典型场景。`UserRpcServiceImpl#getOrCreateUserId` 在 Provider 侧的本地事务中先查后插，利用唯一索引在并发冲突时兜底重查：

```java
@Override
@Transactional(rollbackFor = Exception.class)
public Long getOrCreateUserId(UserRpcBo bo) {
    return TenantContext.dynamic(bo.getTenantId(), () -> {
        User exist = userMapper.selectOne(new LambdaQueryWrapper<User>()
            .select(User::getUserId)
            .eq(User::getUserName, bo.getUserName()));
        if (exist != null) {
            return exist.getUserId();          // 已存在，直接返回，天然幂等
        }
        try {
            return insertUser(bo);              // 依赖 user_name 唯一索引
        } catch (DuplicateKeyException e) {
            return queryIdByName(bo.getUserName()); // 并发冲突后兜底重查
        }
    });
}
```

实现要点：
- 方法上的 `@Transactional` 是 **Provider 侧的本地事务**，不跨服务；
- 先查用户，存在就直接返回 ID（天然幂等）；
- 不存在则执行插入，依赖数据库唯一索引保证不会重复；捕获 `DuplicateKeyException` 后兜底重查，确保并发场景下返回同一个 ID；
- 通过 `TenantContext.dynamic(tenantId, ...)` 显式指定租户上下文，避免依赖调用方线程的 ThreadLocal 传递。

这是跨服务写操作中最实用的设计模式：**幂等键 + 唯一索引 + 冲突后重查**。但需要确认一个前提：`user_name` 字段在数据库中**是否真的有唯一索引**，需要通过 DDL 确认。没有唯一索引的情况下，`DuplicateKeyException` 永远不会被触发，兜底逻辑形同虚设。

### 模式 2：本地落库 + 异步补偿

1. 先在本地数据库写入业务记录（状态标记为 `PENDING`），提交本地事务；
2. 事务提交成功后再发送 MQ 消息或调用远程接口；
3. 远程调用成功后将状态更新为 `SUCCESS`，失败则更新为 `FAILED` 并进入重试队列；
4. 对账定时任务扫描 `PENDING` / `FAILED` 状态的记录，按幂等键进行重放。

关键顺序：**先落库、后调用**。如果反过来（先调远程、再落库），一旦本地数据库写入失败，远程已经执行的写操作就没有任何痕迹可供补偿。

### 模式 3：失败回滚与兜底策略

- **同库多表**：交给 `@Transactional` 统一回滚，不要手写"反向删除"逻辑；
- **跨服务**：本地能回滚的先回滚；远程不能回滚的，通过补偿接口撤销（补偿接口也必须设计为幂等）；
- **补偿也失败**：进入死信队列或人工工单，不要无限重试打爆下游服务；
- **消息重复**：消费端必须按业务唯一键去重，不能假设 MQ 只投递一次。

关于防重复提交注解需要单独说明：它拦截的是**同一个用户在短时间内的重复提交**，底层基于 Redis 实现；但它**不是**业务幂等，也挡不住 MQ 重投、服务自动重试、跨实例并发请求。真正的幂等必须依靠数据库唯一索引或业务幂等键。

---

## 五、事务、锁与并发控制

### 乐观锁：插件装了，但业务层面未启用

MyBatis-Plus 的拦截器链中通常会注册乐观锁插件：

```java
MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
```

但在这套示例系统的业务实体中，几乎没有字段标注了 `@Version` 注解——只有代码生成器的模板中带有该注解。

这意味着：**插件生效的前提是实体类中有 `@Version` 标注的字段，并且更新操作走 MyBatis-Plus 内置的 `updateById` / `update` 方法**。如果使用自定义 XML 编写的 `UPDATE` 语句，乐观锁插件不会自动在 WHERE 子句中追加版本条件。要真正启用乐观锁，必须同时完成三件事：数据库加版本列、实体加注解、确保更新路径走 MP 内置方法。

### "先查后改"的并发竞态陷阱

```text
请求 A：SELECT 发现用户名不存在
请求 B：SELECT 发现用户名不存在
请求 A：INSERT 成功
请求 B：INSERT 成功（或抛唯一键冲突异常）
```

单纯依靠 `SELECT` 判断是否存在，在并发环境下是完全挡不住的。三层防线：

1. **数据库唯一索引**：最后一道硬约束，必须有；
2. **捕获冲突异常**：像 `getOrCreateUserId` 那样捕获 `DuplicateKeyException` 后兜底重查；
3. **短事务**：把"查 + 写"放在一个尽量短的事务中，严禁在事务中做远程调用拉长事务持有时间。

行锁 `SELECT ... FOR UPDATE` 也可以使用，但它只在事务存续期间有效，且会放大锁竞争影响并发吞吐。能用唯一索引解决的场景，优先用唯一索引。

---

## 思考与实践自测

**Q1：`@Transactional` 能覆盖 RPC 下游的写入吗？**
不能。它只管理当前 JVM 进程的当前数据源连接；下游服务运行在独立进程中，拥有独立的事务。

**Q2：同一个类中方法自调用，为什么事务注解会失效？**
Spring 事务基于 AOP 动态代理实现。`this.methodB()` 直接走的是原始对象引用，绕过了代理增强，注解因此不会被拦截执行。

**Q3：在事务方法中捕获异常后不抛出，事务还会回滚吗？**
不会。事务拦截器只在异常穿出代理边界时才触发回滚。需要在 catch 块中重新抛出异常，或通过 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()` 显式标记回滚。

**Q4：这套示例系统当前是分布式事务吗？**
默认不是。`seata.enabled: false`、数据源代理关闭、业务代码中没有 `@GlobalTransactional` 注解。各环境的实际配置值需以配置中心为准。

**Q5：防重复提交注解能替代幂等设计吗？**
不能。它只拦截同一用户短时间内的重复提交（基于 Redis 限时 Key），无法防御 MQ 消息重投、服务重试策略触发的重复调用、以及跨实例的并发请求。

---

## 下一步

理解了事务边界与一致性保障的现实做法后，最后一篇将从一次接口变慢的现象出发，系统梳理性能优化的完整工具箱：连接池配置与泄漏排查、多级缓存体系与一致性策略、批量写入与导出的内存风险控制，以及"压测通过但线上仍然慢"的常见原因分析。
