# 工作流定时调度配置功能

## 功能概述

本次实施完成了第 14 节"定时调度配置界面"，为 TIS 工作流添加了定时调度配置功能。用户可以通过可视化界面配置工作流的定时执行计划。

## 实施内容

### 1. 新增文件

#### 前端组件
- **`src/common/cron-expression-input.component.ts`** - Cron 表达式输入组件
  - 提供 Cron 表达式输入框
  - 实时验证表达式格式
  - 提供快捷选项（每分钟、每小时、每天等）
  - 显示友好的错误提示

- **`src/common/cron-expression-preview.component.ts`** - Cron 表达式预览组件
  - 显示未来 5 次执行时间
  - 使用 cron-parser 库实时计算
  - 格式化显示时间

- **`src/offline/workflow.schedule.config.component.ts`** - 工作流调度配置主组件
  - 定时调度开关
  - 集成 Cron 输入和预览组件
  - 保存和加载配置
  - 表单验证

#### 服务类
- **`src/service/workflow.schedule.service.ts`** - 工作流调度服务
  - 封装 API 调用
  - 保存调度配置
  - 加载调度配置
  - 验证 Cron 表达式

#### 测试文件
- **`src/offline/workflow.schedule.config.component.spec.ts`** - 单元测试

### 2. 修改的文件

- **`src/common/common.module.ts`** - 注册 Cron 组件
- **`src/offline/offline.module.ts`** - 注册调度配置组件，导入必要的 ng-zorro 模块
- **`src/offline/offline-routing.module.ts`** - 添加调度配置路由
- **`src/offline/workflow.component.ts`** - 在工作流列表中添加"调度配置"菜单项
- **`package.json`** - 添加 cron-parser 依赖

### 3. 依赖包

- **cron-parser** (^4.9.0) - 用于解析和验证 Cron 表达式

## 使用方法

### 访问调度配置页面

1. 进入工作流管理页面 (`/offline/wf`)
2. 在工作流列表中，点击某个工作流的操作按钮
3. 在下拉菜单中选择"调度配置"
4. 或直接访问 URL: `/offline/wf_profile/{workflowName}/schedule`

### 配置定时调度

1. **启用定时调度**
   - 打开"启用定时调度"开关

2. **输入 Cron 表达式**
   - 手动输入 Cron 表达式
   - 或点击快捷选项（每分钟、每小时、每天凌晨2点等）
   - 系统会实时验证表达式格式

3. **预览执行时间**
   - 输入有效的 Cron 表达式后，下方会显示未来 5 次执行时间
   - 可以确认调度计划是否符合预期

4. **保存配置**
   - 点击"保存配置"按钮
   - 系统会验证配置并保存到数据库

### Cron 表达式格式

格式：`秒 分 时 日 月 周`

#### 特殊字符
- `*` - 任意值
- `?` - 不指定值（仅用于日和周）
- `-` - 范围，例如: 10-12
- `,` - 列举，例如: MON,WED,FRI
- `/` - 增量，例如: 0/15（每15分钟）

#### 示例
- `0 0 2 * * ?` - 每天凌晨2点执行
- `0 0/30 * * * ?` - 每30分钟执行一次
- `0 0 2 ? * MON` - 每周一凌晨2点执行
- `0 0 2 1 * ?` - 每月1号凌晨2点执行
- `0 0 * * * ?` - 每小时整点执行
- `0 * * * * ?` - 每分钟执行一次

## API 接口

### 保存工作流调度配置
```
POST /coredefine/corenodemanage.ajax
参数:
  - action: workflow_action
  - emethod: doSaveWorkflow
  - id: 工作流ID
  - name: 工作流名称
  - enableSchedule: 是否启用调度 (true/false)
  - scheduleCron: Cron 表达式
```

### 加载工作流信息
```
POST /coredefine/corenodemanage.ajax
参数:
  - action: workflow_action
  - emethod: doGetWorkflow
  - name: 工作流名称
```

## 技术要点

### 组件通信
- 使用 Angular 的 `ControlValueAccessor` 实现表单控件
- 使用 `@Input` 和 `@Output` 进行父子组件通信

### 表单验证
- 实时验证 Cron 表达式格式
- 使用 ng-zorro-antd 的表单验证状态
- 保存前进行完整性检查

### 错误处理
- 友好的错误提示
- 处理 API 调用失败的情况
- 处理数组类型的错误消息

### UI 设计
- 使用 ng-zorro-antd 组件库
- 响应式布局
- 清晰的视觉反馈

## 编译和运行

### 编译项目
```bash
cd /Users/mozhenghua/j2ee_solution/project/tis-console
npx tsc --noEmit  # 类型检查
npm run ng:serve-jit-amd64  # 开发模式运行
```

### 构建生产版本
```bash
npm run ng:serve-aot  # 生产构建
```

## 测试

### 运行单元测试
```bash
npm test
```

### 手动测试清单
- [ ] 打开工作流列表页面
- [ ] 点击"调度配置"菜单项
- [ ] 开启定时调度开关
- [ ] 输入有效的 Cron 表达式
- [ ] 验证预览时间显示正确
- [ ] 输入无效的 Cron 表达式
- [ ] 验证错误提示显示
- [ ] 点击快捷选项
- [ ] 验证表达式自动填充
- [ ] 保存配置
- [ ] 重新加载页面验证配置已保存
- [ ] 关闭定时调度开关并保存

## 后续工作

本次实施完成了前端界面部分，后续需要：

1. **后端实现** (第 13 节已完成)
   - WorkflowAction 的 doSaveWorkflow 方法
   - WorkflowAction 的 doGetWorkflow 方法
   - 数据库字段支持

2. **调度执行** (第 15-16 节)
   - PowerJob 集成
   - 定时任务调度
   - 执行状态监控

3. **监控界面** (第 15 节)
   - DAG 可视化
   - 执行状态实时更新
   - 执行历史查询

## 注意事项

1. **Cron 表达式格式**
   - 使用标准的 6 位 Cron 表达式（秒 分 时 日 月 周）
   - 注意日和周字段的互斥关系

2. **时区问题**
   - 当前使用服务器时区
   - 后续可能需要支持用户时区配置

3. **权限控制**
   - 需要确保用户有权限修改工作流配置
   - 建议添加权限检查

4. **性能考虑**
   - Cron 表达式验证在客户端进行
   - 避免频繁的 API 调用

## 相关文档

- [TIS 开发文档](https://tis.pub/docs/develop/compile-running/)
- [cron-parser 文档](https://github.com/harrisiirak/cron-parser)
- [ng-zorro-antd 文档](https://ng.ant.design/)
- [Angular 表单文档](https://angular.io/guide/forms)

## 作者

百岁 (mozhenghua)

## 更新日期

2026-01-30