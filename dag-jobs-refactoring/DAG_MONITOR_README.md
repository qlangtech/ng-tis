# DAG 可视化监控界面实施文档

## 功能概述

本次实施完成了第 15 节"DAG 可视化监控界面"，为 TIS 工作流添加了完整的 DAG 可视化监控功能。用户可以实时查看工作流执行状态、DAG 拓扑图、节点执行详情、等待队列、执行队列和历史记录。

## 实施内容

### 1. 新增文件

#### 服务类
- **`src/service/dag.monitor.service.ts`** - DAG 监控服务
  - 封装所有监控相关的 API 调用
  - 定义数据模型和接口
  - 提供节点状态颜色和图标映射

#### 核心组件
- **`src/offline/workflow.dag.monitor.component.ts`** - DAG 监控主页面
  - 工作流实例状态概览
  - DAG 图展示
  - 节点详情抽屉
  - 队列和历史标签页
  - 自动刷新功能
  - 停止工作流功能

#### 可视化组件
- **`src/common/dag-graph-viewer.component.ts`** - DAG 图渲染组件
  - 使用 @antv/g6 渲染 DAG 图
  - 节点状态着色
  - 节点点击事件
  - 缩放和平移功能
  - 自适应画布

#### 详情组件
- **`src/common/node-execution-detail.component.ts`** - 节点执行详情组件
  - 显示节点执行信息
  - 显示执行日志
  - 重试失败节点
  - 刷新日志功能

#### 队列组件
- **`src/common/waiting-queue-viewer.component.ts`** - 等待队列组件
  - 显示所有 WAITING 状态的节点
  - 等待时长统计
  - 自动刷新

- **`src/common/running-queue-viewer.component.ts`** - 执行队列组件
  - 显示所有 RUNNING 状态的节点
  - 执行时长统计
  - Worker 地址显示
  - 自动刷新

#### 历史组件
- **`src/common/workflow-history-list.component.ts`** - 工作流历史列表组件
  - 分页显示历史记录
  - 状态筛选
  - 停止运行中的实例
  - 查看实例详情

### 2. 修改的文件

- **`src/common/common.module.ts`** - 注册 DAG 监控组件
- **`src/offline/offline.module.ts`** - 注册主监控页面组件，导入必要的 ng-zorro 模块
- **`src/offline/offline-routing.module.ts`** - 添加监控页面路由

## 功能特性

### 1. 工作流实例监控
- ✅ 实时显示工作流状态（WAITING/RUNNING/SUCCEED/FAILED/STOPPED）
- ✅ 显示开始时间、执行时长
- ✅ 自动刷新（每 5 秒）
- ✅ 停止运行中的工作流

### 2. DAG 图可视化
- ✅ 使用 @antv/g6 渲染 DAG 拓扑图
- ✅ 节点状态着色：
  - WAITING = 灰色
  - RUNNING = 蓝色
  - SUCCEED = 绿色
  - FAILED = 红色
  - STOPPED = 橙色
- ✅ 节点点击查看详情
- ✅ 缩放、平移、适应画布功能

### 3. 节点执行详情
- ✅ 显示节点基本信息（名称、ID、状态）
- ✅ 显示执行时间和时长
- ✅ 显示 Worker 地址
- ✅ 显示重试次数
- ✅ 显示执行结果和错误信息
- ✅ 显示执行日志
- ✅ 重试失败节点

### 4. 等待队列监控
- ✅ 显示所有等待执行的节点
- ✅ 显示等待时长
- ✅ 按工作流过滤
- ✅ 自动刷新

### 5. 执行队列监控
- ✅ 显示所有正在执行的节点
- ✅ 显示执行时长
- ✅ 显示 Worker 地址
- ✅ 按 Worker 过滤
- ✅ 自动刷新

### 6. 执行历史查询
- ✅ 分页显示历史记录
- ✅ 按状态筛选
- ✅ 显示触发方式
- ✅ 停止运行中的实例
- ✅ 查看实例详情

## 使用方法

### 访问监控页面

**路由路径**: `/offline/wf_monitor/{instanceId}`

**访问方式**:
1. 从工作流历史列表点击"查看"
2. 从执行队列/等待队列点击实例 ID
3. 直接访问 URL

### 监控功能操作

#### 1. 查看 DAG 图
- 页面自动加载 DAG 拓扑图
- 节点颜色表示当前状态
- 点击节点查看详情

#### 2. 控制自动刷新
- 使用页面右上角的开关控制自动刷新
- 开启后每 5 秒自动更新数据
- 关闭后需手动点击"刷新"按钮

#### 3. 查看节点详情
- 点击 DAG 图中的节点
- 右侧抽屉显示节点详情
- 查看执行日志
- 重试失败节点

#### 4. 停止工作流
- 点击"停止工作流"按钮
- 确认后停止当前实例
- 所有运行中的节点将被停止

#### 5. 查看队列
- 切换到"等待队列"标签查看等待节点
- 切换到"执行队列"标签查看运行节点
- 队列会自动刷新

#### 6. 查看历史
- 切换到"执行历史"标签
- 使用状态筛选器过滤记录
- 点击实例 ID 查看详情

## API 接口

### 监控相关 API

所有 API 端点: `/coredefine/corenodemanage.ajax`

#### 1. 查询工作流实例状态
```
action=workflow_action
emethod=getWorkflowInstance
instanceId={instanceId}
```

#### 2. 查询 DAG 拓扑结构
```
action=workflow_action
emethod=getDAGTopology
instanceId={instanceId}
```

#### 3. 查询节点执行状态列表
```
action=workflow_action
emethod=getNodeExecutions
instanceId={instanceId}
```

#### 4. 查询节点执行详情
```
action=workflow_action
emethod=getNodeExecutionDetail
executionId={executionId}
```

#### 5. 查询节点执行日志
```
action=workflow_action
emethod=getNodeExecutionLog
executionId={executionId}
```

#### 6. 查询等待队列
```
action=workflow_action
emethod=getWaitingQueue
workflowId={workflowId} (可选)
```

#### 7. 查询执行队列
```
action=workflow_action
emethod=getRunningQueue
workerId={workerId} (可选)
```

#### 8. 查询工作流历史
```
action=workflow_action
emethod=getWorkflowHistory
workflowId={workflowId}
page={page}
pageSize={pageSize}
status={status} (可选)
```

#### 9. 停止工作流实例
```
action=workflow_action
emethod=stopWorkflowInstance
instanceId={instanceId}
```

#### 10. 重试失败节点
```
action=workflow_action
emethod=retryFailedNode
executionId={executionId}
```

## 技术要点

### 1. DAG 图渲染
- 使用 @antv/g6 图可视化库
- Dagre 布局算法自动排列节点
- 支持拖拽、缩放、平移

### 2. 状态管理
- 使用 Angular 组件状态管理
- 自动刷新机制（setInterval）
- 组件销毁时清理定时器

### 3. 实时更新
- 当前使用轮询方式（每 5 秒）
- 后续可升级为 WebSocket 推送

### 4. 错误处理
- 统一的错误提示
- 处理数组类型的错误消息
- API 调用失败的友好提示

### 5. 性能优化
- 按需加载组件
- 分页加载历史记录
- 可控的自动刷新

## 数据模型

### NodeStatus (节点状态)
```typescript
enum NodeStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}
```

### WorkflowStatus (工作流状态)
```typescript
enum WorkflowStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}
```

### DAGNode (DAG 节点)
```typescript
interface DAGNode {
  id: string;
  name: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  workerAddress?: string;
  retryCount?: number;
  errorMessage?: string;
}
```

### WorkflowInstance (工作流实例)
```typescript
interface WorkflowInstance {
  id: number;
  workflowId: number;
  workflowName: string;
  status: WorkflowStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  triggerType?: string;
  context?: Record<string, any>;
}
```

## 编译和运行

### 编译检查
```bash
cd /Users/mozhenghua/j2ee_solution/project/tis-console
npx tsc --noEmit
```

### 开发模式运行
```bash
npm run ng:serve-jit-amd64
```

访问: http://localhost:4200/offline/wf_monitor/{instanceId}

### 生产构建
```bash
npm run ng:serve-aot
```

## 测试

### 手动测试清单
- [ ] 访问监控页面，页面正常加载
- [ ] DAG 图正确渲染，节点状态着色正确
- [ ] 点击节点，详情抽屉正常打开
- [ ] 节点详情显示完整信息
- [ ] 执行日志正常显示
- [ ] 自动刷新开关正常工作
- [ ] 等待队列正常显示
- [ ] 执行队列正常显示
- [ ] 历史列表正常显示和分页
- [ ] 状态筛选正常工作
- [ ] 停止工作流功能正常
- [ ] 重试失败节点功能正常

## 后续工作

### 第 16 节: WebSocket 实时推送
- 替换轮询为 WebSocket 推送
- 实时推送节点状态变化
- 实时推送工作流完成事件

### 优化建议
1. 添加节点执行时间线图
2. 添加关键路径高亮
3. 添加节点依赖关系展示
4. 添加执行统计图表
5. 支持导出监控数据
6. 添加告警配置

## 注意事项

1. **依赖 @antv/g6**
   - 项目已包含此依赖
   - 版本: ^4.8.24

2. **后端 API**
   - 需要后端实现对应的 API 接口
   - 参考第 13 节的 API 实现

3. **性能考虑**
   - 大型 DAG 图可能影响渲染性能
   - 建议限制节点数量或使用虚拟滚动

4. **浏览器兼容性**
   - 需要现代浏览器支持
   - 建议使用 Chrome、Firefox、Edge

## 相关文档

- [TIS 开发文档](https://tis.pub/docs/develop/compile-running/)
- [@antv/g6 文档](https://g6.antv.vision/)
- [ng-zorro-antd 文档](https://ng.ant.design/)

## 作者

百岁 (mozhenghua)

## 更新日期

2026-01-30
