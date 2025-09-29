# TIS控制台优化指南

本文档描述了对TIS控制台项目进行的性能和用户体验优化。

## 已完成的优化

### 1. 依赖包升级
- Angular 12.0.0 → 12.2.16
- Chart.js 2.9.3 → 3.9.1 (包含适配器)
- @antv/g6 3.0.4 → 4.8.24
- jQuery 3.3.1 → 3.7.1
- 其他关键依赖包升级到兼容的最新版本

### 2. 代码质量工具
- 添加了ESLint配置替代已废弃的TSLint
- 集成Prettier代码格式化
- 配置Husky Git钩子
- 启用TypeScript严格模式

### 3. 组件生命周期管理
- 创建了`BaseComponent`类来统一管理订阅
- 防止内存泄露问题
- 所有新组件都应继承`BaseComponent`

### 4. 用户体验组件
- 创建了骨架屏组件(`SkeletonLoaderComponent`)
- 创建了加载状态组件(`LoadingStateComponent`)
- 提供一致的加载体验

### 5. 构建优化
- 优化Bundle大小限制
- 启用更激进的构建优化
- 配置TypeScript严格模式

## 使用指南

### 组件生命周期管理

所有需要处理订阅的组件都应该继承`BaseComponent`:

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent extends BaseComponent implements OnInit {
  
  constructor(private someService: SomeService) {
    super();
  }

  ngOnInit() {
    // 使用takeUntil自动管理订阅
    this.someService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // 处理数据
      });
  }
}
```

### 骨架屏使用

```html
<tis-skeleton-loader [loading]="isLoading" [rows]="5">
  <div>实际内容</div>
</tis-skeleton-loader>
```

### 加载状态使用

```html
<tis-loading-state 
  [state]="loadingState"
  loadingText="正在加载数据..."
  errorTitle="加载失败"
  errorMessage="无法加载数据，请检查网络连接">
  <div>成功加载的内容</div>
</tis-loading-state>
```

```typescript
export class ExampleComponent {
  loadingState: LoadingState = 'loading';

  loadData() {
    this.loadingState = 'loading';
    this.dataService.getData()
      .subscribe({
        next: data => {
          this.loadingState = 'success';
        },
        error: err => {
          this.loadingState = 'error';
        }
      });
  }
}
```

## 安装新依赖

运行以下命令安装升级的依赖：

```bash
npm install
```

## 代码格式化

新的代码格式化工具已配置，使用以下命令：

```bash
# 格式化所有代码
npm run format

# 检查格式化
npm run format:check

# 代码质量检查
npm run lint
```

## 构建命令

现有的构建命令保持不变：

```bash
# 开发环境 (ARM64)
npm run ng:serve-jit-arm64

# 开发环境 (AMD64)
npm run ng:serve-jit-amd64

# 生产构建
npm run ng:serve-aot
```

## 注意事项

1. **TypeScript严格模式**: 启用了严格模式，可能需要修复一些类型错误
2. **Chart.js升级**: Chart.js 3.x有破坏性变更，需要更新图表配置
3. **ESLint**: 替代了TSLint，需要修复新的代码质量问题

## 后续优化建议

1. **Angular版本升级**: 考虑升级到Angular 17+获得更好性能
2. **虚拟滚动**: 对长列表实现虚拟滚动
3. **懒加载**: 进一步拆分模块实现懒加载
4. **状态管理**: 引入NgRx或类似状态管理库