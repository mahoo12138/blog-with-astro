---
title: '10 排障手册：日志、链路追踪、慢 SQL 与常见故障模式'
date: 2026-08-30
order: 10
---

> 专栏：[前端转 Java 微服务实战笔记](/columns/frontend-to-java-microservices/) · 第 10 篇 · 发布日期：2026-08-30
> 目录：[专栏目录](/columns/frontend-to-java-microservices/) | 上一篇：[09 租户隔离与数据权限：自动拼 WHERE 的黑魔法](09-tenant-and-data-permission.md) | 下一篇：[11 业务开发套路：从需求到上线的完整流程与代码模板](11-business-development-playbook.md)

---

线上排障最贵的成本往往不是修复代码，而是快速定位。同一份报错堆栈，经验丰富的排查者十分钟就能找到根因，而新手可能翻了一下午代码还在盲目乱猜。两者的核心差别通常不在于记住了多少异常类名，而在于**有没有一套固化且高效的逐层定位顺序**。

在前端开发中，排查接口异常有非常成熟的条件反射：先按 F12 打开 DevTools 的 Network 面板看接口发出去了没有、HTTP 状态码是多少、耗时大头在 TTFB 还是 Content Download；报错了去 Sentry 看异常堆栈的第一行业务代码，靠 sourcemap 把打包混淆后的 `vendor.js:1:23456` 映射回本地源码。

切换到后端分布式微服务后，链路被切分到了不同机器、不同服务和不同进程中。本文基于这套典型的 Spring Cloud 企业级示例工程，系统性梳理日志分布、无 traceId 场景下的请求串联技巧、慢 SQL 定位五步法，以及 RPC 与网关的高频故障排查模式。

---

## 建立分层排障的心智模型

把前端常用的排障工具与后端微服务体系做个直观对照：

| 前端工具与阶段 | 对应后端机制（本示例系统） | 核心回答的排障问题 |
|---|---|---|
| Chrome DevTools Network 面板 | 网关 `[PLUS]` 请求拦截日志 | 请求究竟进来了没有？总耗时多少？ |
| Network Response 响应体 | 统一返回体中的 `code` / `msg` | 故障到底发生在网关前置、鉴权校验还是下游业务逻辑？ |
| Sentry 异常捕获与堆栈 | 服务本地 `error.log` + `Caused by` 根因链 | 具体哪个微服务内部哪行代码抛出了未捕获异常？ |
| SourceMap 源码映射 | traceId 链路追踪（如 SkyWalking `[%tid]`） | 一次前端点击发起的调用链，横跨了哪几个服务节点？ |

**核心原则：先定层级，再入细节。** 遇到线上告警或前端接口报错，千万不要一上来就打开 IDEA 盲目通读业务代码。那无异于前端页面渲染白屏时，不去检查控制台报错和网络请求，直接去逐行阅读数十个 React/Vue 组件源码。

---

## 生产日志全景布局

在典型的微服务工程中，不同层级的组件有各自专门的日志输出策略与存储路径：

| 日志类别 | 物理位置 / 配置开关 | 核心输出内容 | 是否包含 traceId |
|---|---|---|---|
| 网关请求日志 | `GatewayLogFilter`，开关 `spring.cloud.gateway.requestLog` | `[PLUS]开始请求 => URL[...]`、`[PLUS]结束请求 => 耗时:[...]ms` | 无 |
| 服务文件日志 | `logs/<服务名>/console.log`、`info.log`、`error.log` | 业务过程日志、完整异常栈 | 默认无 |
| 控制台日志 | SkyWalking 日志布局 `[%tid]` | 与文件日志基本相同，额外携带 traceId | 挂载 agent 后有 |
| SQL 真实日志 | 配置中心 `datasource-config.yaml` 的 `p6spy: true` | 经插件改写并填充真实参数后的执行 SQL 与耗时 | 无 |
| RPC 调用日志 | `RpcLogFilter`，开关 `dubbo.custom.request-log` | 远程接口名、方法名、RPC 往返耗时、远程异常 | 默认无 |
| 集中式收集 | Logstash JSON 布局（地址默认为 `none`） | 结构化 JSON 格式日志，供 ELK 采集 | 依赖配置 |

### 1. 网关 `[PLUS]` 日志

网关通过全局过滤器记录进出请求：

```java
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    if (!properties.getRequestLog()) {
        return chain.filter(exchange);
    }
    String url = request.getMethod().name() + " " + path;
    log.info("[PLUS]开始请求 => URL[{}],参数类型[param],参数:[{}]", url, params);
    exchange.getAttributes().put(START_TIME, System.currentTimeMillis());
    return chain.filter(exchange).then(Mono.fromRunnable(() ->
        log.info("[PLUS]结束请求 => URL[{}],耗时:[{}]毫秒", url, elapsed)));
}

@Override
public int getOrder() {
    return Ordered.LOWEST_PRECEDENCE;
}
```

一次完整的请求生命周期会在网关控制台输出成对日志：

```text
[PLUS]开始请求 => URL[GET /api/device/list],参数类型[param],参数:[{"pageNum":["1"],"pageSize":["10"]}]
[PLUS]结束请求 => URL[GET /api/device/list],耗时:[83]毫秒
```

这里有三个必须了解的工程细节：

1. **没有用户信息与 traceId**：过滤器的顺序设置为 `Ordered.LOWEST_PRECEDENCE`（最低优先级），在网关负载均衡选择好后端实例后才触发。负载均衡过程可能引发响应式线程上下文切换，无法直接获取业务用户身份。
2. **入参全量明文打印**：Query 参数会以 JSON 原样打入日志。在包含手机号、密码等敏感字段时需特别注意，通常更推荐在联调与测试环境开启。
3. **“结束请求”不一定会输出**：如果浏览器客户端在传输完成前强行断开连接（如用户快速刷新或关掉页面），或者过滤器链中途发生短路抛出未捕获异常，Mono 结束回调可能不会被执行。“只有开始没有结束”本身就是排查网络截断的重要信号。

### 2. 服务文件日志规则

各微服务的基础 logback 配置通常通过 Maven 占位符管理日志根目录：

```xml
<property name="log.path" value="logs/${project.artifactId}"/>
```

例如网关输出到 `logs/gateway-service/`，系统服务输出到 `logs/system-service/`。三个滚动日志文件的接收规则截然不同：

| 日志文件 | 接收日志级别 | 滚动与保留周期 |
|---|---|---|
| `console.log` | INFO 及以上级别（包含 WARN、ERROR） | 按天滚动，通常保留 1 天 |
| `info.log` | **精确匹配 INFO 级别**（通过 ThresholdFilter 过滤） | 按天压缩（gz），保留 60 天 |
| `error.log` | **精确匹配 ERROR 级别** | 按天压缩（gz），保留 60 天 |

这揭示了一个经典误区：**很多工程师在 `info.log` 中搜索 WARN 日志一无所获，以为系统完全正常**。实际上生产框架中的大量告警只会进入 `console.log`，而异常堆栈请务必直接去 `error.log` 查看。

### 3. traceId 的实际存在条件

普通文件日志中默认的日志格式为：

```text
%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

**默认格式中并未包含 traceId。** 只有切换为 SkyWalking 的 `TraceIdPatternLogbackLayout` 时，输出模板中才带有 `[%tid]` 标识。

这意味着排查时需要区分现实：
- 若 JVM 启动参数明确挂载了 SkyWalking JavaAgent（`-javaagent:/path/to/skywalking-agent.jar`），控制台日志每行头部会带有真实全局唯一的 traceId，可直接在 APM 系统中串联调用全链路；
- 若没有挂载 Agent，`%tid` 通常输出 `TID:N/A` 或空白字符。此时如果依赖文件排查，必须掌握“时间戳 + 关键业务参数”的关联定位法。

### 4. p6spy SQL 执行日志

在数据持久层，调试 SQL 的关键开关位于 `datasource-config.yaml`：

```yaml
spring:
  datasource:
    dynamic:
      p6spy: true
```

p6spy 的 appender 默认被配置为 `StdoutLogger`，即真实 SQL 会**直接打到标准输出（Console 或 Docker 容器标准日志）**，**通常不会落入本地 `logs/*.log` 物理文件**。如果在服务日志文件里搜不到 SQL 是正常的，MyBatis 原生 SQL 日志通常被关闭（`NoLoggingImpl`），观察 SQL 需直接查看容器输出或本地 IDE 终端。

更重要的是：p6spy 打印的 SQL 是经过所有 MyBatis-Plus 拦截器（多租户、数据权限、分页等）改写后的最终执行 SQL，包含了填充进 `?` 的实际入参。

### 5. RPC 调用日志

RPC 拦截器 `RpcLogFilter` 在服务提供方（Provider）和服务消费方（Consumer）双向生效：

```java
@Activate(group = {CommonConstants.PROVIDER, CommonConstants.CONSUMER},
          order = Integer.MAX_VALUE)
public class RpcLogFilter implements Filter {
    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) {
        String baselog = "Client[" + client + "],InterfaceName=["
            + invocation.getInvoker().getInterface().getSimpleName()
            + "],MethodName=[" + invocation.getMethodName() + "]";
        log.info("DUBBO - 服务调用: {}", baselog);
        // 执行真实 RPC 调用并记录耗时；异常情况强制以 log.error 记录
    }
}
```

日志级别开关由 `dubbo.custom.request-log` 控制。标准模式下输出方法名与耗时，full 模式下会进一步打印参数与返回值：

```text
DUBBO - 服务调用: Client[consumer],InterfaceName=[UserRpcService],MethodName=[getUserInfo]
DUBBO - 服务响应: Client[consumer],InterfaceName=[UserRpcService],MethodName=[getUserInfo],SpendTime=[22ms]
DUBBO - 服务异常: ...,Exception=org.apache.dubbo.rpc.RpcException: ...
```

当 RPC 调用发生严重异常时，固定使用 `log.error` 打印，必然会落入下游或上游的 `error.log`。

---

## 典型调用链日志特征与三步对齐法

以一次完整的“网关 (gateway-service) -> 设备服务 (equipment-service) -> 系统服务 (system-service RPC) -> MySQL”调用为例：

```text
# gateway-service: logs/gateway-service/info.log
10:21:03.118 [PLUS]开始请求 => URL[GET /api/device/list],参数类型[param],参数:[{"pageNum":["1"]}]
10:21:03.201 [PLUS]结束请求 => URL[GET /api/device/list],耗时:[83]毫秒

# equipment-service: logs/equipment-service/info.log
10:21:03.140 DUBBO - 服务调用: Client[consumer],InterfaceName=[UserRpcService],MethodName=[getUserInfo]
10:21:03.162 DUBBO - 服务响应: ...,SpendTime=[22ms]
10:21:03.170 | 6 | statement | SELECT ... WHERE tenant_id = ? AND ...

# system-service: logs/system-service/info.log
10:21:03.145 DUBBO - 服务调用: Client[provider],InterfaceName=[UserRpcService],MethodName=[getUserInfo]
10:21:03.160 DUBBO - 服务响应: ...,SpendTime=[15ms]
```

### 无 traceId 时的三步定位法

在未搭建全局分布式链路追踪系统时，可以利用这套标准化三步法精准串联全流程：

1. **第一步：抓网关入口锚点**
   在 `logs/gateway-service/info.log` 中搜索 `[PLUS]`，获取接口路径、请求开始毫秒时间戳以及网关记录的总耗时。
2. **第二步：利用业务唯一特征参数下沉**
   诸如 `pageNum=1` 这类参数无法区分并发请求，但订单编号、设备编码、业务记录主键 ID 具有强唯一性。若接口仅有普通分页参数，则以网关开始时间的前后 2 秒作为时间窗口，检索下游各服务的 `error.log` 与 `info.log`。
3. **第三步：逐段耗时做时间减法**
   从上往下拆解：网关记录总耗时 83ms；下游设备服务消费方记录 Dubbo 耗时 22ms；系统服务内部 SQL 执行耗时 6ms。
   计算耗时差值：$83 - 22 - 6 = 55\text{ms}$。这 55ms 的大部分开销必然消耗在网关路由过滤、序列化传输，或者下游尚未打日志的业务处理逻辑中。**差值区间就是最嫌疑的代码段**，无需全盘通读。

特别注意：在集群多副本部署环境下，网关请求由负载均衡轮询分发，务必先确认流量路由到了哪个 Pod 或主机，避免在机器 A 上找机器 B 的请求。

---

## RPC 四类经典故障模式

微服务之间远程调用的典型故障通常可以归纳为四种模式：

| 典型日志特征 | 故障核心原因 | 优先排查动作 |
|---|---|---|
| `No provider available from registry ... for service ...` | 消费方在服务注册中心找不到匹配的服务提供者 | 检查注册中心是否存在该接口实例；Provider 是否成功启动并暴露；双方 namespace/group 是否完全一致 |
| `Invoke remote method timeout` / `TimeoutException` | RPC 调用等待服务端回包超时 | Provider 内部执行耗时与慢 SQL；网络抖动；配置的超时阈值是否偏低；线程池是否排队 |
| `RejectedExecutionException` / `Thread pool is exhausted` | Provider 线程池被打满，拒绝新请求 | Provider 当前 CPU 负载、下游依赖慢请求、抓取 `jstack` 线程栈；切忌盲目直接扩容线程池 |
| `Connection refused` / `RemotingException` | 传输层网络阻断或端口无法连通 | Provider 进程存活性、物理端口监听状态、注册到注册中心的 IP 是否为局域网互通地址（多网卡/容器常见） |

### 针对性排查思路

1. **`No provider available`**
   通常在日志中以 `RpcException` 形式抛出，网关层对应报 HTTP 500。
   排查清单：在注册中心查询目标接口实例列表；检查 Provider 启动日志中带有 `@DubboService` 的类是否被 Spring 扫描注入；核对双方接口包名（全限定名）、版本号 `version` 与分组 `group` 是否一致。若 Consumer 配置了 `check=false`，启动时不会强制校验，只有发起真实 RPC 调用时才会暴露该异常。
2. **RPC 调用超时（Timeout）**
   观察 Consumer 报错日志中的耗时是否恰好等于配置的超时值（如 3000ms）。
   若 Consumer 侧耗时达到 3000ms，需立即对比 Provider 端同一时间戳的 `DUBBO - 服务响应`：若 Provider 记录的耗时同样接近 3000ms，说明瓶颈在服务端处理慢（如锁竞争、慢 SQL）；若 Provider 记录的耗时仅有几十毫秒，但 Consumer 发生超时，则需排查网络链路、网络丢包或序列化/反序列化性能。
3. **线程池耗尽（Thread pool exhausted）**
   典型表象并非单点报错，而是短时间内伴随 Provider 响应时间大幅飙升，并集中抛出拒绝执行异常。定位动作应首先通过 `jstack <pid>` 抓取 JVM 线程栈，观察绝大多数业务工作线程卡在数据库连接、外部 HTTP 依赖还是等待互斥锁。
4. **网络拒绝与不可达（Connection refused）**
   常见于服务注册到了非互通的虚拟网卡 IP（如 Docker 内部子网 IP 或 VPN 虚拟网卡），导致 Consumer 尝试向不可达 IP 建立 TCP 连接。使用 `netstat` 或 `Test-NetConnection` 验证实际端口连通性。

---

## 慢 SQL 诊断与分析五步法

后端业务接口变慢，80% 以上的原因集中在数据库持久层。定位慢 SQL 建议严格按照以下五步执行：

1. **确认 p6spy 开启状态**：检查 `datasource-config.yaml` 中的 `p6spy: true`。该配置在数据源初始化时装配，修改后通常需要重启服务。
2. **提取真实执行 SQL**：在容器或控制台输出中过滤 p6spy 的格式化日志，挑选耗时明显偏高（如 > 200ms）的完整 SQL 语句。注意不要手工拼接参数，必须直接复制 p6spy 输出中已经填入真实入参的语句。
3. **在目标数据库执行 EXPLAIN 分析**：
   ```sql
   EXPLAIN SELECT * FROM sys_device WHERE tenant_id = '000000' AND status = 1 ORDER BY create_time DESC;
   ```
   重点剖析执行计划中的关键字段：
   - `type`：连接类型。`ALL` 为危险的全表扫描，`index` 为全索引扫描，`range`、`ref`、`eq_ref` 为正常健康的索引范围或等值查找。
   - `key`：实际使用的索引名称。若为 `NULL`，说明没有匹配上任何索引。
   - `rows`：优化器预估需扫描的行数。若返回 10 条数据但预估扫描数达数十万行，说明索引选择度严重不足。
   - `Extra`：包含 `Using filesort`（文件排序）或 `Using temporary`（内存/磁盘临时表）时，在大数据量下通常极易成为性能瓶颈。
4. **厘清根因归属**：
   - **索引缺失或失效**：未命中索引、联合索引顺序违背最左前缀原则、或字段隐式类型转换（如 VARCHAR 传数字）；
   - **深分页与大数据量**：`LIMIT 100000, 10` 扫描过多无用行，需重构为延迟关联或基于子查询主键遍历；
   - **多租户与权限改写干扰**：MyBatis-Plus 自动拼装的 `tenant_id` 是否被纳入联合索引？数据权限拼装的复杂 `OR` 条件是否迫使数据库优化器放弃了原本的最优索引？
5. **回归验证与索引复测**：根据分析结果调整索引后，重新调用业务接口，验证 p6spy 执行耗时与数据库 `EXPLAIN` 的 `key` 及 `rows` 是否发生实质性改善。

---

## 常见线上故障速查表

| 故障现象 | 最可能发生的原因 | 第一步排查动作 |
|---|---|---|
| **HTTP 401 Unauthorized** | 请求未携带 Token、Token 已过期失效、接口未加入网关白名单 | 查看网关日志是否在鉴权过滤器处拦截；检查 Header 中是否包含有效 `Authorization` 及 `clientid` |
| **HTTP 403 Forbidden** | 用户已正常登录，但当前分配的角色缺乏目标接口所需的权限字符串 | 检查 Controller 接口上的 `@SaCheckPermission` 定义与数据库菜单权限标识的配置一致性 |
| **HTTP 404 Not Found** | 网关路由规则未命中；`StripPrefix` 截取后路径错误；后端服务无健康实例 | 核对 `gateway.routes` 断言配置、注册中心健康实例状态及实际 Controller 路径 |
| **配置变更未生效** | Nacos DataId、Namespace 或 Group 配置错误；本地存在旧版本配置缓存 | 检查服务启动日志打印的实际加载配置源列表，以及配置中心对应命名空间中的发布状态 |
| **`tenant_id = NULL` 查无数据** | 租户插件已启用，但在多线程、异步任务或跨微服务 RPC 场景下丢失了 ThreadLocal 上下文 | 在 p6spy 真实 SQL 日志中确认 `tenant_id` 条件的填充值；排查代码是否涉及线程切换 |
| **`No provider available`** | 服务提供者未注册、服务下线、或 Dubbo 接口版本与环境分组不匹配 | 检查注册中心对应接口的 Provider 列表；查看 Provider 启动日志中是否打印成功暴露服务 |
| **RPC 远程调用超时** | 下游服务内部执行耗时过高、线程池排队、网络链路抖动、超时时间设置偏短 | 查看 Provider 侧同时间段日志及慢 SQL；核对配置中心下发的实际 `timeout` 数值 |
| **本地服务注册干扰环境** | 本地调试实例默认连接公用注册中心，导致线上网关将真实流量负载均衡到了个人开发电脑 | 统一修改本地 `spring.cloud.nacos.discovery.namespace` 为个人独立隔离空间 |

---

## 五分钟快速定位标准流程

面对线上紧急报障，遵循规范化流程能够显著缩短排查耗时：

### 第一阶段：标准化信息采集（0-30 秒）

```text
环境：开发 / 测试 / 生产
时间戳：2026-11-06 10:21:03（尽可能精确到秒级）
接口路径：GET /api/device/list
请求租户与用户：tenant_id=000000, user_id=1024
响应状态：HTTP 500 / 统一错误码 {"code": 500, "msg": "系统繁忙"}
业务参数（脱敏）：pageNum=1, status=1
是否稳定复现：是 / 偶发
```

### 第二阶段：依据状态码定层级（30 秒 - 2 分钟）

1. **401/403**：直接定位网关与安全拦截组件，查看网关日志；
2. **404**：直接排查网关路由配置表与服务注册健康状态；
3. **5xx**：定位下游微服务执行层，按时间戳检索目标服务的 `error.log`；
4. **200 但数据不符合预期**：业务逻辑或数据库插件改写问题，直接查看 p6spy 最终 SQL。

### 第三阶段：多端检索实用命令示例

在 PowerShell 终端下，可通过原生指令快速过滤各服务日志：

```powershell
# 1. 检索网关最近 30 条请求拦截日志
Select-String -Path "logs\gateway-service\info.log" -Pattern "\[PLUS\]" | Select-Object -Last 30

# 2. 批量扫描所有微服务 error.log 中的高频核心异常
Get-ChildItem -Path logs -Recurse -Filter error.log |
  Select-String -Pattern "DUBBO - 服务异常|Timeout|No provider|RejectedExecution|Connection refused" -Context 0,8

# 3. 检查常见服务端口监听状态
netstat -ano | findstr ":8080 :8081 :8082 :8083"
```

---

## 思考与实践自测

**Q1：为什么网关 `[PLUS]` 日志里无法直接获取到登录用户的 `userId`？**
因为本系统中 `GatewayLogFilter` 的执行顺序被设置为 `Ordered.LOWEST_PRECEDENCE`（最低优先级），在网关完成服务发现与负载均衡之后触发。响应式 WebFlux 在负载均衡和路由转发过程中可能发生线程切换，使得请求上下文中的部分安全信息无法在末端过滤器中稳定读取。

**Q2：微服务目录下的 `info.log` 没有任何报错，能说明系统运行平稳没有异常吗？**
不能。在示例系统的 Logback 配置中，`info.log` 配置了只过滤并接收 `INFO` 级别的日志，所有 `ERROR` 级别异常都会分流至 `error.log`，而系统警告只会记录在 `console.log`。判断系统健康状况必须三者结合查看。

**Q3：为什么排查数据查询问题时，不能直接拿 Mapper 里的 XML SQL 到数据库中执行？**
因为底层持久层框架（如 MyBatis-Plus）注入了多租户和数据权限拦截器。真实发送给 MySQL 引擎执行的 SQL 往往被自动拼接了 `tenant_id`、组织权限等附加条件，只有通过 p6spy 捕获到的最终改写 SQL，才能精准反映数据库的真实执行计划。

**Q4：为什么消费方在调用时抛出 `No provider available`，但查看注册中心发现提供者实例明明是健康上线的？**
应重点检查三处匹配条件：第一，Consumer 与 Provider 配置的 Dubbo `group`（分组）与 `version`（版本）是否完全一致；第二，接口类的全限定包名与方法签名是否完全相同；第三，是否由微服务的多网卡或虚拟容器网卡造成了注册 IP 无法跨节点直接连通。

---

## 下一步

掌握了微服务运行态的日志与排障全景后，我们就可以在安全可控的前提下开展业务开发。在下一篇中，我们将把前面所学（环境、网关、权限、持久层、RPC）串联成一套标准可复用的业务开发套路：从需求评审、接口设计、增删改查脚手架编写，到多租户与数据权限联调自测。
