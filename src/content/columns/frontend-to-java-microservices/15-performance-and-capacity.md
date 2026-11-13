---
title: '15 性能与容量：慢 SQL、缓存、批处理、连接池'
date: 2026-11-10
order: 15
---

> 专栏：[前端转 Java 微服务实战笔记](/columns/frontend-to-java-microservices/) · 第 15 篇 · 发布日期：2026-11-10
> 目录：[专栏目录](/columns/frontend-to-java-microservices/) | 上一篇：[14 事务与一致性：@Transactional 的边界、分布式事务是否真的启用](14-transaction-and-consistency.md) | 下一篇：已是最后一篇

---

这是系列的最后一篇。前面 14 篇解决的核心问题是"对不对"，本篇要解决的是"快不快、撑不撑得住"。

接口变慢从来不是一个单一原因造成的，而是请求链路上某一段出了瓶颈。先通过分段计时精准定位到那一段，再决定是加索引、加缓存、改批量，还是扩容机器——顺序反了，优化就变成了盲目试错。

---

## 前端经验的对照与迁移

| 前端性能优化手段 | 后端对应机制 | 共同原则 |
|---|---|---|
| Performance 面板分段看 DNS / TTFB / 渲染各占多少 | 网关耗时、服务耗时、RPC 耗时、SQL 耗时逐段计时 | 不测量就不优化 |
| `useMemo` / 组件级本地缓存 | Caffeine 进程内缓存 | 速度快，但多实例间会不一致 |
| localStorage / 远端缓存 | Redis + Spring Cache | 有序列化开销和一致性成本 |
| 列表虚拟滚动（只渲染可视区域） | 数据库分页、流式导出 | 不要一次把大数据集全部搬进内存 |
| 请求防抖（debounce） | 服务端限流 / 幂等设计 | 前端防抖只是体验优化，挡不住并发 |

一句话总结：**先回答"慢在哪一段"，再决定用什么手段优化。**

---

## 一、性能定位的标准流程：五段计时法

遇到接口变慢，按以下五段逐层切分，基本不会跑偏：

| 段 | 观测什么 | 常用工具 |
|---|---|---|
| 1. 网络 / 调用方 | 是 DNS 解析、网关入口排队还是客户端等待 | 浏览器 Network 面板、curl 计时 |
| 2. 网关 | 总耗时、是否被过滤器拖慢 | 网关 `[PLUS]` 结束日志中的 URL + 耗时 |
| 3. 服务业务代码 | 业务方法本身的执行耗时 | `info.log`、方法前后手动打点日志、断点调试 |
| 4. 下游依赖 | RPC / HTTP / Redis 等外部等待 | `DUBBO - 服务响应 ... SpendTime`、异常日志 |
| 5. 数据库 | SQL 执行次数与单条耗时 | p6spy 输出、`EXPLAIN` |

判断口诀：**网关耗时 ≈ 服务耗时 + 网络传输；服务耗时 ≈ 自身计算 + 下游调用 + SQL 执行。** 先做减法定位瓶颈段，不要一上来就加索引。

举个实际例子：网关记录总耗时 800ms，服务日志显示业务方法本身只花了 120ms，RPC `SpendTime` 记录了 650ms——瓶颈显然在下游 Provider，不在网关，也不在 SQL。反过来，如果服务耗时 700ms、p6spy 单条 SQL 耗时 600ms，这时才轮到分析执行计划。**没有观测数据，性能优化只能靠猜**——这也是第 10 篇先系统讲日志与 p6spy 的原因。

---

## 二、慢 SQL 分析：从 p6spy 到执行计划

### 1. 获取真实执行 SQL

通过数据源配置开启 p6spy：

```yaml
spring:
  datasource:
    dynamic:
      # 性能分析插件（有性能损耗，不建议生产环境长期开启）
      p6spy: true
```

p6spy 输出的是**经过 MyBatis-Plus 全部拦截器改写后的最终 SQL**，包括多租户、数据权限、分页等插件自动拼接的条件。排查完成后应及时关闭，不能将其当作常驻能力。

### 2. EXPLAIN 执行计划的四个关键字段

| 字段 | 含义 | 判断标准 |
|---|---|---|
| `type` | 连接类型 | `ALL` 全表扫描、`index` 全索引扫描需警惕；`ref`、`range`、`eq_ref` 较健康 |
| `key` | 实际命中的索引 | `NULL` 说明没走任何索引 |
| `rows` | 优化器预估扫描行数 | 与实际返回行数差距越大越可疑 |
| `Extra` | 附加执行信息 | `Using filesort`（排序未走索引）、`Using temporary`（创建临时表）、`Using index condition`（索引下推） |

### 3. 三类高频低效写法

**第一类：N+1 问题——循环内逐条查库**

```java
for (String vin : vins) {
    DeviceView vo = mapper.selectByVin(vin); // 每条记录触发一次独立 SQL
}
```

修复方式：一次 `IN` 批量查回所有结果，再在内存中按 Key 组装。超大列表需进一步分批（如每批 500-1000 条）。示例系统中有一个通用的分批查询服务，按固定批大小切分、并行执行后合并结果：

```java
public class BatchQueryService {
    private static final int DEFAULT_BATCH_SIZE = 500;
    private static final int QUERY_TIMEOUT_SECONDS = 10;
    private static final int DIRECT_EXECUTION_THRESHOLD = 2000;

    public <T, R> T executeBatchQuery(
            Collection<String> vins, int batchSize, BatchQueryHandler<T, R> handler) {
        // 按 batchSize 切分、并行执行，最后合并结果
    }
}
```

它的价值不在于"多线程一定更快"，而是将 N+1 问题从"每条记录一次网络往返"收敛为"每批一次"，并且对批大小和超时设置了明确上限。

**第二类：多表 JOIN 返回过多列或过多行**

只 `SELECT` 实际需要的列；在分页执行前先缩小驱动表的结果集；确认所有关联字段都有索引；`LEFT JOIN` 后在 `WHERE` 子句中过滤右表字段时要特别注意——这种写法容易退化为内连接并丢失左表不匹配的行，需分清条件应放在 `ON` 还是 `WHERE` 中。

**第三类：循环内逐条更新**

改为批量 `UPDATE` / `saveBatch`，或先收集全部 ID 一次性更新。但要注意事务边界：不要把数千条更新包在一个超长事务中。

---

## 三、缓存体系：快，但一致性需要自己负责

### 1. 三层缓存架构

| 缓存层 | 技术实现 | 典型使用场景 |
|---|---|---|
| Spring Cache（Redis 为主） | `RedisCacheManager`：Redisson + Caffeine 本地装饰 + 事务感知 | 公共缓存模块 |
| 纯本地 Caffeine | 进程内缓存，TTL 自行设置 | 设备基础信息 30 分钟（`VehicleDebugServiceImpl`）、实时工况 1 分钟（`IndicatorServiceImpl`） |
| 分布式锁 / 结构 | Redisson | 命令下发、等待回执、并发控制 |

`RedisCacheManager` 的核心组装逻辑：

```java
private Cache createMap(String name, CacheConfig config, int local) {
    RMap<Object, Object> map = RedisUtils.getClient().getMap(name);

    Cache cache = new RedissonCache(map, allowNullValues);
    if (local == 1) {
        cache = new CaffeineCacheDecorator(name, cache);   // 本地一级缓存装饰
    }
    if (transactionAware) {
        cache = new TransactionAwareCacheDecorator(cache); // 事务感知装饰
    }
    return cache;
}
```

默认 `transactionAware = true`：**缓存的 put / evict 操作会延迟到事务提交后才真正执行**，避免出现"事务回滚了但缓存已经被更新"的不一致问题。

### 2. 缓存一致性策略：更新后失效，而非双写

标准写法是 `@Cacheable` 负责读取、`@CacheEvict` 负责写后失效。例如角色自定义权限的读取：

```java
@Cacheable(cacheNames = CacheKeys.ROLE_CUSTOM,
           key = "#roleId", condition = "#roleId != null")
public String getRoleCustom(Long roleId) {
    ...
}
```

`DeptServiceImpl#updateDept` 在部门更新时同时失效"单个部门"和"部门树"两级缓存：

```java
@Caching(evict = {
    @CacheEvict(cacheNames = CacheKeys.DEPT, key = "#bo.deptId"),
    @CacheEvict(cacheNames = CacheKeys.DEPT_AND_CHILD, allEntries = true)
})
@Override
@Transactional(rollbackFor = Exception.class)
public int updateDept(DeptBo bo) {
    ...
}
```

优先采用"更新数据库 -> 失效缓存"策略，而不是"更新数据库 + 更新缓存"。双写策略在高并发环境下会出现旧值覆盖新值的竞态问题。删除缓存失败时需要有兜底方案（重试或延迟双删），并接受短暂的数据不一致窗口。

### 3. 多租户对缓存 Key 的影响

在多租户场景下，`TenantCacheManager` 会自动在 cacheName 前拼接 `tenantId + ":"`；当无法获取租户上下文时会回退到默认租户并打印 error 日志：

```java
@Override
public Cache getCache(String name) {
    if (StringUtils.contains(name, GlobalConstants.GLOBAL_CACHE_KEY)) {
        return super.getCache(name);
    }
    String tenantId = TenantContext.getTenantId();
    if (StringUtils.isBlank(tenantId)) {
        tenantId = TenantConstants.DEFAULT_TENANT_ID;
        log.error("无法获取有效的租户id -> Null");
    }
    return super.getCache(tenantId + ":" + name);
}
```

这意味着：
- 排查缓存问题时，不能只按业务名搜索 Redis Key，必须带上租户前缀；
- 异步线程如果丢失了租户上下文，可能会读写到默认租户的缓存空间中；
- 全局共享缓存需要使用对应的全局标记显式跳过租户前缀拼接。

### 4. 缓存三大经典问题

- **穿透**：查询不存在的数据，每次都穿透到数据库。应对方式：缓存空值（`allowNullValues=true`）、入参校验拦截、布隆过滤器；
- **击穿**：热点 Key 过期瞬间大量请求同时回源。应对方式：加互斥锁、逻辑过期续期、`sync=true`（取决于缓存实现）；
- **雪崩**：大量 Key 同时过期导致缓存层集体失效。应对方式：TTL 加随机抖动、分批预热、多级缓存。

---

## 四、批处理：批量大小与内存风险控制

### 1. `saveBatch` 的正确使用姿势

在 `PriceHoursServiceImpl` 中有 `saveBatch(entityList)` 的典型用法（如时段电价批量保存）。使用时需注意三点：

1. **显式指定 batchSize**，不要依赖框架默认值；
2. **明确事务边界**：外层有 `@Transactional` 才能保证"全成或全败"，否则可能出现部分成功；
3. **不要盲目追求大批量**：行宽、索引数量、binlog 大小都会影响实际性能，500-1000 一批通常是合理的起点。

```java
List<PriceHours> entityList = bo.getItems().stream()
    .map(item -> convert(bo, item))
    .collect(Collectors.toList());
saveBatch(entityList, 500);
```

### 2. 大规模导入的并行与事务设计

`DeviceServiceImpl` 中的设备资产批量导入实现了一种可参考的并行导入架构：按业务主键哈希分桶、8 线程并行执行、每桶独立事务、`finally` 块中确保线程池关闭。

```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.setCorePoolSize(8);
executor.setMaxPoolSize(8);
executor.setQueueCapacity(1000);
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
executor.initialize();

try {
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
} finally {
    executor.shutdown();
}
```

这种设计解决的核心矛盾是"超大导入在单事务中锁持有时间过长 + 一条失败导致全量回滚"，代价是接受**部分成功**的可能性，因此必须配套成功/失败计数与结果文件。

分桶的意义在于：相同业务键固定落入同一个桶，桶内串行保证数据正确性，桶间并行提升吞吐量，同时降低跨桶死锁的概率。

### 3. Excel 导出的内存溢出风险

`ExcelUtil.exportExcel(list, ...)` 的常见实现是先把整个 `List` 查入内存再写文件。几万行数据加上多列宽文本字段很容易触发 OOM。大数据量导出应改为分页查询、流式写入。

此外要注意导出工具可能吞掉内部异常并返回 `null`，业务代码必须做空值判断：

```java
byte[] bytes = ExcelUtil.exportToBytes(rows, "导入结果", ResultRow.class);
if (bytes == null || bytes.length == 0) {
    log.error("导出结果为空，{} 行明细未生成", rows.size());
} else {
    upload(bytes);
}
```

如果不判空，后续上传只会报"文件内容为空"，真正的导出失败原因就被淹没了。

---

## 五、连接池与异步线程池

### 1. HikariCP 连接池的参数解读

```yaml
hikari:
  maxPoolSize: 20
  minIdle: 10
  connectionTimeout: 30000
  validationTimeout: 5000
  idleTimeout: 600000
  maxLifetime: 1800000
  keepaliveTime: 30000
```

关键容量换算：**每个服务实例最多 20 个连接 x 实例数**。如果部署了 8 个实例，就是 160 个并发数据库连接，必须小于数据库的 `max_connections` 上限并留出余量给运维工具和监控系统。

连接泄漏的典型日志表现是 `Connection is not available, request timed out after 30000ms`，症状是**所有接口都变慢或超时**，而不仅仅是某一个接口慢。常见原因包括：事务方法内做远程调用、ResultSet 或 Stream 没有关闭、长事务、单批次过大。

动态数据源的 `strict: true` 配置会在匹配不到目标数据源时直接抛出异常，避免静默连接到错误的数据库。

### 2. 异步线程池配置

设备模块的异步配置：核心线程 10、最大线程 40、队列容量 1000、拒绝策略 `CallerRunsPolicy`（队列满时由调用者线程执行，形成天然反压）。`@Primary` 使其成为默认的 `@Async` 执行器：

```java
@Primary
@Bean("batchQueryExecutor")
public ThreadPoolTaskExecutor batchQueryExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(40);
    executor.setQueueCapacity(1000);
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    executor.initialize();
    return executor;
}
```

`@Async` 的常见陷阱（呼应第 9 篇和第 14 篇）：
- **自调用失效**：与 `@Transactional` 相同机制，`this.asyncMethod()` 绕过了 AOP 代理；
- **租户/用户上下文丢失**：ThreadLocal 不跨线程传递，必须显式传参或使用 `TenantContext.dynamic`；
- **事务不传播**：异步方法中的写操作运行在独立事务中，与主线程事务无关；
- **异常静默丢失**：异步方法的异常不会返回给调用方，必须在方法内部自行记录日志或触发补偿。

正确的异步触发姿势是 `@Async` 搭配 `@TransactionalEventListener(AFTER_COMMIT)`：**确保主事务提交成功后再触发异步操作**，避免主事务回滚而异步已执行的不一致。例如 `VehicleSyncListener`：

```java
@Async
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
public void onVehicleDataSync(VehicleSyncEvent event) {
    if (event == null || CollUtil.isEmpty(event.vins())) {
        return;
    }
    try {
        vehicleSyncService.syncByVins(event.vins());
    } catch (Exception e) {
        log.error("车辆外部数据同步异常, vins={}", event.vins().size(), e);
    }
}
```

---

## 六、"压测通过，线上仍然慢"的常见原因

| 原因 | 典型表现 | 如何核实 |
|---|---|---|
| 数据量与分布不同 | 测试库数据少，线上走全表扫描或排序 | 对比线上 `EXPLAIN` 的 `rows` 与索引选择性 |
| 缓存命中率低 | Redis 或本地缓存命中少，大量回源数据库 | 统计命中率、检查 Key 是否带租户前缀、TTL 是否合理 |
| 下游限流或超时 | RPC / HTTP 等待时间高，错误率上升 | 查看 `SpendTime`、超时配置、下游容量水位 |
| 日志或 p6spy 开销 | 开启详细日志后整体性能劣化 | 检查 `requestLog`、`logging.level`、p6spy 是否在生产环境开启 |
| 连接池容量 x 实例数超限 | 服务扩容后数据库连接被打满 | HikariCP 20 x 实例数 vs 数据库 `max_connections` |
| 冷启动 / JIT / GC | 刚发布后第一批请求明显偏慢，随后恢复 | 启动耗时统计、GC 日志、预热请求 |
| 隐藏 N+1 | 小数据量时 SQL 条数少不显眼，线上数据量放大后爆发 | 统计 p6spy 中单次请求触发的 SQL 总条数，而不只看单条耗时 |

最后一条最容易被忽略：**压测关注的是平均响应时间，线上要关注的是 SQL 执行次数。** 一次请求触发 200 条 SQL，测试库只有 1000 行数据时可能每条都很快；线上 100 万行数据时就是灾难。

---

## 专栏总结：15 篇的知识地图

| 学习阶段 | 对应文章 | 核心用途 |
|---|---|---|
| 心智模型与全景地图 | 01-02 | 建立 Spring Boot / 微服务的基础认知框架 |
| 跑通环境与请求链路 | 03-06 | 模块依赖地图、本地启动、网关路由、认证鉴权 |
| 数据持久层与跨服务 | 07-09 | MyBatis-Plus / XML、Dubbo RPC、多租户与数据权限 |
| 排障能力与开发套路 | 10-11 | 日志体系 / 慢 SQL / RPC 故障模式；需求到上线的标准模板 |
| 上线治理与高阶能力 | 12-15 | 配置治理与灰度、跨团队协作、事务边界、性能优化 |

后续学习建议：

1. **按 01 到 09 的顺序通读**，建立完整的链路认知；10 以后根据实际工作需要按需查阅。第 10 篇适合当作案头排障手册，11 至 15 篇适合接到具体任务时对照参考。
2. **每篇的练习至少动手做一道**，尤其是第 7 篇的查询改造和第 11 篇的完整需求流程。
3. **持续维护自己的 Runbook**：把专栏没有覆盖到的线上问题，按第 13 篇的"问题卡片"格式沉淀下来，积累属于自己的排障知识库。

---

## 思考与实践自测

**Q1：接口变慢了，应该先加索引还是先加缓存？**
先分段计时定位瓶颈。如果确认是 SQL 慢且执行计划存在问题，优先优化 SQL 和索引；如果是重复查询导致的重复回源，再考虑引入缓存。顺序反了会掩盖真正的性能问题。

**Q2：`@CacheEvict` 在事务回滚时会把缓存删掉吗？**
默认不会。`RedisCacheManager` 配置了事务感知装饰器，evict 操作会延迟到事务提交后才执行。

**Q3：为什么异步方法里查不到租户的数据？**
租户 ID 存储在 ThreadLocal 中，`@Async` 切换到了新线程。必须显式传递租户参数或使用 `TenantContext.dynamic` 显式指定租户上下文。

**Q4：`saveBatch` 一定是在一个事务中执行吗？**
不一定。取决于外层是否声明了 `@Transactional`。没有外层事务包裹时，可能出现分批提交和部分成功的情况。

**Q5：p6spy 可以在生产环境一直开着吗？**
不建议。配置注释中已明确说明存在性能损耗。生产环境应关闭或仅按需短时开启用于排查，排查完毕后及时恢复。

---

## 结语

到这里，15 篇的主线就完整了。

回顾整个系列的学习路径：**看懂请求链路 -> 能独立修改代码 -> 会系统排查问题 -> 会安全变更配置 -> 能推动跨团队协作 -> 能承担性能优化**。

真正的"独当一面"从来不是记住所有技术细节的答案，而是面对一个从未遇过的新问题时，知道应该先看哪一层、用什么证据支撑判断、找谁确认关键信息、以及怎么安全地变更和回退。

希望这套笔记能帮助每一位从前端转型后端的开发者，在企业级微服务系统中更快地建立起工程自信。
