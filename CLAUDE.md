# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于Angular 12的TIS(数据集成平台)前端控制台项目，主要用于数据同步、ETL处理和集群管理的Web界面。


## 开发环境设置

### 依赖安装
```bash
npm install
```

为了加快安装速度，可以使用预打包的node_modules：
```bash
# 下载并解压预打包的node_modules
# https://tis-release.oss-cn-beijing.aliyuncs.com/tis-console-ng-node-modules.tar
```

### 常用开发命令

#### 开发环境运行
```bash
# 基于系统架构选择相应命令
npm run ng:serve-jit-arm64    # ARM64架构(M1/M2 Mac)
npm run ng:serve-jit-amd64    # AMD64架构(Intel Mac/x86)
```

#### 生产环境打包
```bash
npm run ng:serve-aot          # AOT编译生产环境打包
```

#### 代码检查和构建
```bash
npm run lint                  # TypeScript代码检查
npm run build                # TypeScript编译
npm run build:watch          # 监听模式编译
```

#### 测试命令
```bash
npm run test                 # 运行测试
npm run test:once           # 单次运行测试
npm run e2e                 # 端到端测试
```

## 架构概述

### 模块化结构
项目采用Angular模块化架构，主要模块包括：

- **base**: 基础应用管理模块 (`/base`)
- **common**: 通用组件和服务 (`src/common/`)
- **datax**: DataX数据同步模块 (`/x/:name`)
- **offline**: 离线任务模块 (`/offline`)
- **runtime**: 核心运行时组件和路由 (`src/runtime/`)
- **user**: 用户权限管理模块 (`/usr`)

### 路由配置
- `/` - 首页欢迎界面
- `/base` - 基础应用管理
- `/usr` - 用户权限管理 
- `/offline` - 离线模块
- `/c/:name` - 索引控制台(Core)
- `/x/:name` - DataX控制台

### 技术栈
- **框架**: Angular 12 + TypeScript 4.2
- **UI库**: ng-zorro-antd 12.0 (Ant Design for Angular)
- **图表**: ng2-charts, Chart.js, @antv/g6
- **代码编辑器**: CodeMirror
- **构建工具**: Angular CLI
- **代理配置**: 开发环境通过proxy.conf.json代理到后端服务

### 代理服务配置
开发环境代理配置：
- `/tjs` -> `http://localhost:8080` (主要后端服务)
- `/tis-assemble` -> `http://localhost:8083` (装配服务)

### 样式和主题
- 主要样式文件：`src/theme.less`
- 支持Font Awesome图标和自定义TIS图标
- 使用LESS预处理器

### 重要的开发约定
- 组件命名遵循Angular风格指南
- 使用TSLint进行代码质量检查(最大行长度500字符)
- 跳过大部分单元测试生成(skipTests: true)
- 支持AOT和JIT编译模式

### 环境配置
- 开发环境配置：`src/environments/environment.ts`
- 生产环境配置：`src/environments/environment.prod.ts`

### 国际化
- 默认中文语言环境(zh_CN)
- 使用Angular i18n支持
