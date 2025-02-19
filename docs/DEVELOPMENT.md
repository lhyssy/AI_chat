# AI Chat Web 开发指南

## 项目设置

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- React >= 18.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm start
```

### 生产环境构建
```bash
npm run build
```

## 项目结构

```
ai-chat-web/
├── docs/                 # 项目文档
├── public/              # 静态资源
└── src/
    ├── components/      # 通用组件
    │   ├── auth/        # 认证相关组件
    │   ├── billing/     # 计费相关组件
    │   ├── chat/        # 聊天相关组件
    │   └── payment/     # 支付相关组件
    ├── config/          # 配置文件
    ├── pages/           # 页面组件
    │   ├── auth/        # 认证页面
    │   └── chat/        # 聊天页面
    ├── services/        # API服务
    ├── styles/          # 样式文件
    └── utils/           # 工具函数
```

## 开发规范

### 1. 代码风格

#### 1.1 命名规范
- 组件：使用 PascalCase（如 `ChatInput.jsx`）
- 函数和变量：使用 camelCase（如 `handleSubmit`）
- 常量：使用 UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- 文件名：使用 PascalCase 或 kebab-case（根据内容类型）

#### 1.2 组件规范
```javascript
// 函数组件模板
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // 状态和副作用
  
  // 事件处理函数
  
  // 渲染函数
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func
};

export default React.memo(ComponentName);
```

#### 1.3 样式规范
- 使用 Tailwind CSS 工具类
- 自定义样式使用 CSS Module
- 遵循 BEM 命名规范（对于自定义类名）

### 2. 性能优化

#### 2.1 React 优化
- 使用 React.memo() 避免不必要的重渲染
- 使用 useMemo 和 useCallback 缓存值和函数
- 使用 React.lazy 和 Suspense 实现代码分割

#### 2.2 资源优化
- 图片使用 WebP 格式
- 使用适当的图片尺寸
- 实现懒加载

#### 2.3 状态管理
- 合理使用 Context API
- 避免状态提升过高
- 使用 useReducer 管理复杂状态

### 3. 安全实践

#### 3.1 数据安全
- 敏感信息不存储在前端
- 使用 HTTPS
- 实现 XSS 防护

#### 3.2 API 安全
- 实现请求签名
- 添加请求超时
- 实现错误重试

### 4. 测试规范

#### 4.1 单元测试
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

#### 4.2 集成测试
- 测试组件交互
- 测试 API 调用
- 测试路由跳转

### 5. Git 工作流

#### 5.1 分支管理
- main: 主分支
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: 修复分支
- release/*: 发布分支

#### 5.2 提交规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建

### 6. 文档规范

#### 6.1 代码注释
```javascript
/**
 * 组件描述
 * @param {string} prop1 - 参数描述
 * @param {function} prop2 - 参数描述
 * @returns {JSX.Element} 返回的JSX元素
 */
```

#### 6.2 API文档
- 接口名称
- 请求方法
- 参数说明
- 返回值
- 示例

## 最佳实践

### 1. 组件设计
- 单一职责原则
- 组件尽可能小且可复用
- 使用 PropTypes 或 TypeScript 定义类型

### 2. 状态管理
- 使用 useState 管理简单状态
- 使用 useReducer 管理复杂状态
- 使用 Context 管理全局状态

### 3. 性能优化
- 使用 React.memo 优化函数组件
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存函数

### 4. 错误处理
- 使用 ErrorBoundary 捕获错误
- 实现优雅的错误展示
- 记录错误日志

## 更新日志

### 2024-03-14
- 创建开发指南文档
- 添加代码规范
- 添加最佳实践指南 