# WebSocket 实时推送功能实施文档

## 功能概述

本次实施完成了第 16 节"WebSocket 实时推送"，为 TIS 工作流监控添加了 WebSocket 实时推送功能。客户端可以订阅工作流实例，实时接收节点状态变化和工作流完成事件。

## 实施内容

### 1. 新增文件

#### 后端类
- **`WorkflowMonitorWebSocketServlet.java`** - WebSocket Servlet
  - 配置 WebSocket 端点 `/ws/workflow/monitor`
  - 设置超时和消息大小限制
  - 注册 WebSocket 处理器

- **`WorkflowMonitorWebSocketHandler.java`** - WebSocket 处理器
  - 管理客户端连接和订阅
  - 处理订阅/取消订阅消息
  - 推送节点状态变化
  - 推送工作流完成事件
  - 心跳检测机制

- **`WorkflowWebSocketNotifier.java`** - WebSocket 通知工具类
  - 提供便捷的推送方法
  - 封装消息格式
  - 简化调用接口

## 功能特性

### 1. 连接管理
- ✅ 支持多客户端并发连接
- ✅ 自动清理断开的连接
- ✅ 连接状态跟踪

### 2. 订阅机制
- ✅ 客户端可订阅特定工作流实例
- ✅ 支持订阅多个实例
- ✅ 支持取消订阅
- ✅ 自动清理订阅关系

### 3. 实时推送
- ✅ 节点状态变化推送
- ✅ 工作流完成事件推送
- ✅ 仅推送给订阅的客户端
- ✅ 包含详细信息（时间、状态、错误等）

### 4. 心跳检测
- ✅ 每 30 秒发送心跳
- ✅ 检测连接活性
- ✅ 支持客户端 ping/pong

### 5. 错误处理
- ✅ 消息格式验证
- ✅ 异常捕获和日志记录
- ✅ 友好的错误提示

## 使用方法

### 后端调用

#### 1. 推送节点状态变化

```java
// 简单推送
WorkflowWebSocketNotifier.notifyNodeStatusChange(instanceId, nodeId, "RUNNING");

// 带详细信息
JSONObject details = new JSONObject();
details.put("workerAddress", "192.168.1.100:8080");
WorkflowWebSocketNotifier.notifyNodeStatusChange(instanceId, nodeId, "RUNNING", details);

// 使用便捷方法
WorkflowWebSocketNotifier.notifyNodeStarted(instanceId, nodeId, "192.168.1.100:8080");
WorkflowWebSocketNotifier.notifyNodeSucceeded(instanceId, nodeId, 5000L);
WorkflowWebSocketNotifier.notifyNodeFailed(instanceId, nodeId, "Task execution failed");
```

#### 2. 推送工作流完成

```java
// 简单推送
WorkflowWebSocketNotifier.notifyWorkflowCompletion(instanceId, "SUCCEED");

// 带详细信息
JSONObject details = new JSONObject();
details.put("totalDuration", 60000L);
details.put("nodeCount", 10);
WorkflowWebSocketNotifier.notifyWorkflowCompletion(instanceId, "SUCCEED", details);
```

#### 3. 查询连接状态

```java
// 获取活跃连接数
int sessionCount = WorkflowWebSocketNotifier.getActiveSessionCount();

// 获取实例订阅数
int subscriberCount = WorkflowWebSocketNotifier.getSubscriptionCount(instanceId);
```

### 前端客户端

#### 1. 建立连接

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/workflow/monitor');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

#### 2. 订阅工作流实例

```javascript
// 订阅
ws.send(JSON.stringify({
  type: 'subscribe',
  instanceId: 12345
}));

// 取消订阅
ws.send(JSON.stringify({
  type: 'unsubscribe',
  instanceId: 12345
}));
```

#### 3. 心跳检测

```javascript
// 发送 ping
ws.send(JSON.stringify({
  type: 'ping'
}));

// 接收 pong
// 服务器会自动响应 pong 消息
```

#### 4. 处理推送消息

```javascript
function handleMessage(message) {
  switch (message.type) {
    case 'connected':
      console.log('Connected:', message.data);
      break;
      
    case 'subscribed':
      console.log('Subscribed:', message.data);
      break;
      
    case 'nodeStatusChange':
      console.log('Node status changed:', message);
      updateNodeStatus(message.nodeId, message.status, message.details);
      break;
      
    case 'workflowCompletion':
      console.log('Workflow completed:', message);
      showWorkflowResult(message.status, message.details);
      break;
      
    case 'heartbeat':
      console.log('Heartbeat received');
      break;
      
    case 'pong':
      console.log('Pong received');
      break;
      
    case 'error':
      console.error('Error:', message.error);
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
  }
}
```

## 消息格式

### 客户端发送

#### 订阅消息
```json
{
  "type": "subscribe",
  "instanceId": 12345
}
```

#### 取消订阅消息
```json
{
  "type": "unsubscribe",
  "instanceId": 12345
}
```

#### Ping 消息
```json
{
  "type": "ping"
}
```

### 服务器推送

#### 连接成功
```json
{
  "type": "connected",
  "data": "Welcome to workflow monitor",
  "timestamp": 1706598000000
}
```

#### 订阅成功
```json
{
  "type": "subscribed",
  "data": "Subscribed to instance 12345",
  "timestamp": 1706598000000
}
```

#### 节点状态变化
```json
{
  "type": "nodeStatusChange",
  "instanceId": 12345,
  "nodeId": "node_001",
  "status": "RUNNING",
  "details": {
    "workerAddress": "192.168.1.100:8080",
    "startTime": 1706598000000
  },
  "timestamp": 1706598000000
}
```

#### 工作流完成
```json
{
  "type": "workflowCompletion",
  "instanceId": 12345,
  "status": "SUCCEED",
  "details": {
    "totalDuration": 60000,
    "nodeCount": 10
  },
  "timestamp": 1706598000000
}
```

#### 心跳
```json
{
  "type": "heartbeat",
  "data": 1706598000000,
  "timestamp": 1706598000000
}
```

#### Pong
```json
{
  "type": "pong",
  "data": "pong",
  "timestamp": 1706598000000
}
```

#### 错误
```json
{
  "type": "error",
  "error": "instanceId is required",
  "timestamp": 1706598000000
}
```

## 技术要点

### 1. 并发安全
- 使用 `CopyOnWriteArraySet` 存储会话
- 使用 `ConcurrentHashMap` 存储订阅关系
- 线程安全的消息推送

### 2. 资源管理
- 连接断开时自动清理订阅
- 定时清理无效连接
- 心跳检测保持连接活性

### 3. 性能优化
- 仅推送给订阅的客户端
- 异步消息发送
- 批量推送支持

### 4. 错误处理
- 消息发送失败自动重试
- 异常捕获和日志记录
- 连接异常自动清理

## 配置说明

### WebSocket 配置

在 `WorkflowMonitorWebSocketServlet` 中配置：

```java
// 空闲超时（10 分钟）
factory.getPolicy().setIdleTimeout(600000);

// 最大文本消息大小（1MB）
factory.getPolicy().setMaxTextMessageSize(1024 * 1024);

// 最大二进制消息大小（1MB）
factory.getPolicy().setMaxBinaryMessageSize(1024 * 1024);
```

### 心跳间隔

在 `WorkflowMonitorWebSocketHandler` 中配置：

```java
// 心跳间隔（30 秒）
heartbeatScheduler.scheduleAtFixedRate(() -> {
    sendHeartbeat();
}, 30, 30, TimeUnit.SECONDS);
```

## 集成到前端

在第 15 节创建的 DAG 监控组件中集成 WebSocket：

```typescript
// 在 workflow.dag.monitor.component.ts 中
private ws: WebSocket | null = null;

ngOnInit(): void {
  this.connectWebSocket();
  // ... 其他初始化代码
}

connectWebSocket(): void {
  const wsUrl = `ws://${window.location.host}/ws/workflow/monitor`;
  this.ws = new WebSocket(wsUrl);

  this.ws.onopen = () => {
    console.log('WebSocket connected');
    // 订阅当前工作流实例
    this.ws?.send(JSON.stringify({
      type: 'subscribe',
      instanceId: this.instanceId
    }));
  };

  this.ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    this.handleWebSocketMessage(message);
  };

  this.ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  this.ws.onclose = () => {
    console.log('WebSocket closed');
    // 可以实现自动重连
  };
}

handleWebSocketMessage(message: any): void {
  switch (message.type) {
    case 'nodeStatusChange':
      // 更新 DAG 图中的节点状态
      this.updateNodeStatus(message.nodeId, message.status);
      break;
    case 'workflowCompletion':
      // 显示工作流完成结果
      this.showCompletionResult(message.status);
      break;
  }
}

ngOnDestroy(): void {
  if (this.ws) {
    this.ws.close();
  }
}
```

## 测试

### 手动测试

1. 启动 TIS 服务
2. 打开浏览器开发者工具
3. 执行以下 JavaScript 代码：

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/workflow/monitor');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({type: 'subscribe', instanceId: 1}));
};

ws.onmessage = (e) => {
  console.log('Received:', JSON.parse(e.data));
};
```

4. 在后端触发工作流执行
5. 观察控制台输出的推送消息

### 集成测试

创建测试类 `WorkflowWebSocketTest.java`（任务 16.7）

## 注意事项

1. **WebSocket 端点**
   - URL: `/ws/workflow/monitor`
   - 协议: `ws://` (开发) 或 `wss://` (生产)

2. **连接限制**
   - 默认空闲超时: 10 分钟
   - 建议实现客户端自动重连

3. **消息大小**
   - 最大消息大小: 1MB
   - 超大消息需要分片发送

4. **性能考虑**
   - 大量客户端时考虑消息队列
   - 实现消息批量推送
   - 监控连接数和推送频率

5. **安全性**
   - 生产环境使用 WSS (WebSocket Secure)
   - 实现身份认证和授权
   - 验证订阅权限

## 后续优化

1. 添加消息压缩
2. 实现消息持久化
3. 支持消息重放
4. 添加消息优先级
5. 实现集群模式下的消息广播
6. 添加监控指标（连接数、消息量等）

## 相关文档

- [Jetty WebSocket 文档](https://www.eclipse.org/jetty/documentation/current/websocket-intro.html)
- [WebSocket API 规范](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 作者

百岁 (mozhenghua)

## 更新日期

2026-01-30
