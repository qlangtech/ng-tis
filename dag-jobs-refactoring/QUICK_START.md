# 工作流定时调度配置 - 快速启动指南

## 快速测试步骤

### 1. 启动前端开发服务器

```bash
cd /Users/mozhenghua/j2ee_solution/project/tis-console
npm run ng:serve-jit-amd64
```

访问: http://localhost:4200

### 2. 访问调度配置页面

方式一：通过工作流列表
1. 访问 http://localhost:4200/offline/wf
2. 找到任意工作流
3. 点击操作按钮 → 选择"调度配置"

方式二：直接访问 URL
```
http://localhost:4200/offline/wf_profile/{工作流名称}/schedule
```

### 3. 配置定时调度

1. **开启定时调度开关**
2. **选择快捷选项或输入 Cron 表达式**
   - 快捷选项：每分钟、每小时、每天凌晨2点等
   - 手动输入：例如 `0 0 2 * * ?`
3. **查看预览** - 系统会显示未来 5 次执行时间
4. **保存配置**

## 常用 Cron 表达式

| 描述 | Cron 表达式 |
|------|------------|
| 每分钟执行 | `0 * * * * ?` |
| 每小时执行 | `0 0 * * * ?` |
| 每天凌晨2点 | `0 0 2 * * ?` |
| 每周一凌晨2点 | `0 0 2 ? * MON` |
| 每月1号凌晨2点 | `0 0 2 1 * ?` |
| 每30分钟 | `0 0/30 * * * ?` |

## 验证功能

- [ ] 页面正常加载
- [ ] 开关可以切换
- [ ] 快捷选项可以点击
- [ ] Cron 表达式输入框有实时验证
- [ ] 预览显示未来 5 次执行时间
- [ ] 无效表达式显示错误提示
- [ ] 保存按钮在有效时可点击
- [ ] 保存成功后显示提示

## 故障排查

### 编译错误
```bash
npx tsc --noEmit
```

### 查看日志
打开浏览器开发者工具 (F12) 查看控制台日志

### 常见问题

1. **页面 404**
   - 检查路由配置是否正确
   - 确认工作流名称是否存在

2. **保存失败**
   - 检查后端 API 是否正常
   - 查看网络请求响应

3. **预览不显示**
   - 检查 Cron 表达式格式
   - 查看浏览器控制台错误

## 文件位置

- 主组件: `src/offline/workflow.schedule.config.component.ts`
- Cron 输入: `src/common/cron-expression-input.component.ts`
- Cron 预览: `src/common/cron-expression-preview.component.ts`
- 服务类: `src/service/workflow.schedule.service.ts`

## 联系方式

如有问题，请查看详细文档: `WORKFLOW_SCHEDULE_README.md`
