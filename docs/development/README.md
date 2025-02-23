# 开发指南

## 开发环境设置

### 必要条件

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- Git

### 推荐工具

- VS Code
- MongoDB Compass
- Postman

### VS Code 插件

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens

## 项目结构

```
ai-chat-web/
├── docs/                 # 项目文档
│   ├── api/             # API 文档
│   ├── architecture/    # 架构设计文档
│   ├── development/     # 开发指南
│   └── deployment/      # 部署指南
├── public/              # 静态资源
└── src/
    ├── components/      # 通用组件
    │   ├── auth/        # 认证相关组件
    │   ├── chat/        # 聊天相关组件
    │   ├── common/      # 公共组件
    │   └── layout/      # 布局组件
    ├── config/          # 配置文件
    ├── contexts/        # React Context
    ├── hooks/           # 自定义 Hooks
    ├── pages/           # 页面组件
    ├── services/        # 服务层
    │   ├── ai/          # AI 服务
    │   ├── chat/        # 聊天服务
    │   ├── database/    # 数据库服务
    │   ├── payment/     # 支付服务
    │   └── websocket/   # WebSocket 服务
    ├── styles/          # 样式文件
    └── utils/           # 工具函数
```

## 开发规范

### 代码风格

1. **命名规范**
   - 组件：PascalCase (如 `ChatMessage.tsx`)
   - 工具函数：camelCase (如 `formatDate.ts`)
   - 常量：UPPER_SNAKE_CASE (如 `MAX_RETRY_COUNT`)
   - CSS 类名：kebab-case (如 `chat-container`)

2. **文件组织**
   - 相关文件放在同一目录
   - 每个组件一个目录
   - 包含 index.ts 导出

3. **注释规范**
   - 组件头部必须添加功能说明
   - 复杂逻辑需要详细注释
   - 导出的函数需要 JSDoc 注释

### Git 工作流

1. **分支管理**
   - main: 主分支，用于生产环境
   - develop: 开发分支，用于测试环境
   - feature/*: 功能分支
   - bugfix/*: 修复分支
   - release/*: 发布分支

2. **提交规范**
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```

   类型（type）：
   - feat: 新功能
   - fix: 修复
   - docs: 文档
   - style: 格式
   - refactor: 重构
   - test: 测试
   - chore: 构建

3. **代码审查**
   - 提交前自测
   - 遵循 PR 模板
   - 及时回复评论

### 组件开发

1. **组件结构**
   ```typescript
   // 类型定义
   interface Props {
     // ...
   }

   // 组件实现
   export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
     // 状态管理
     const [state, setState] = useState();

     // 副作用
     useEffect(() => {
       // ...
     }, []);

     // 事件处理
     const handleEvent = () => {
       // ...
     };

     // 渲染
     return (
       // ...
     );
   };
   ```

2. **状态管理**
   - 使用 React Context 管理全局状态
   - 使用 Hooks 管理局部状态
   - 避免状态提升过深

3. **性能优化**
   - 使用 React.memo 优化渲染
   - 使用 useMemo 和 useCallback
   - 避免不必要的重渲染

### 服务开发

1. **服务结构**
   ```typescript
   // 配置
   const CONFIG = {
     // ...
   };

   // 类实现
   class Service {
     private config;

     constructor() {
       this.config = CONFIG;
     }

     public async method() {
       try {
         // ...
       } catch (error) {
         this.handleError(error);
       }
     }

     private handleError(error: Error) {
       // ...
     }
   }

   // 导出单例
   export const service = new Service();
   ```

2. **错误处理**
   - 统一的错误处理机制
   - 错误日志记录
   - 用户友好的错误提示

3. **接口设计**
   - RESTful API 设计
   - 统一的响应格式
   - 完善的参数验证

## 测试规范

### 单元测试

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    const { container } = render(<Component />);
    expect(container).toMatchSnapshot();
  });

  it('should handle events', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Component onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 集成测试

```typescript
describe('Service', () => {
  beforeAll(() => {
    // 设置测试环境
  });

  afterAll(() => {
    // 清理测试环境
  });

  it('should perform operation', async () => {
    const result = await service.method();
    expect(result).toBeDefined();
  });
});
```

## 调试技巧

1. **React Developer Tools**
   - 组件树检查
   - 状态查看
   - 性能分析

2. **Chrome DevTools**
   - Network 面板监控请求
   - Console 查看日志
   - Performance 分析性能

3. **日志工具**
   - 开发环境详细日志
   - 生产环境错误追踪
   - 性能监控

## 发布流程

1. **版本管理**
   - 遵循语义化版本
   - 更新 CHANGELOG.md
   - 标记版本标签

2. **构建检查**
   - 代码质量检查
   - 单元测试
   - 构建验证

3. **部署步骤**
   - 备份数据
   - 执行部署
   - 验证功能 