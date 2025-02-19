# AI Chat Web

基于 React 和 Node.js 构建的现代化 AI 聊天应用。

## 功能特点

- 🤖 多模型支持 - 支持多种主流大语言模型
- 💬 实时对话 - 流畅的对话体验
- 📝 聊天记录 - 本地保存对话历史
- 🔍 智能搜索 - 快速检索历史对话
- 📤 导出分享 - 支持多种格式导出
- 🎨 现代界面 - 简洁美观的用户界面
- 📱 响应式设计 - 完美支持移动端

## 技术栈

- **前端框架**: React 18
- **UI 框架**: Material UI
- **状态管理**: React Context + Hooks
- **样式方案**: Tailwind CSS
- **构建工具**: Vite
- **后端框架**: Node.js + Express
- **数据库**: MongoDB
- **API**: RESTful + WebSocket

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0

### 安装

1. 克隆项目
```bash
git clone https://github.com/yourusername/ai-chat-web.git
cd ai-chat-web
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填写必要的配置信息
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 项目结构

```
ai-chat-web/
├── docs/                 # 项目文档
│   ├── DEVELOPMENT.md   # 开发指南
│   └── PROJECT_STATUS.md# 项目状态
├── public/              # 静态资源
└── src/
    ├── components/      # 通用组件
    ├── config/          # 配置文件
    ├── pages/           # 页面组件
    ├── services/        # API服务
    ├── styles/          # 样式文件
    └── utils/           # 工具函数
```

## 开发文档

- [开发指南](docs/DEVELOPMENT.md) - 详细的开发规范和最佳实践
- [项目状态](docs/PROJECT_STATUS.md) - 功能清单和开发计划

## 功能演示

### 对话界面
![对话界面](docs/images/chat-interface.png)

### 历史记录
![历史记录](docs/images/chat-history.png)

### 设置面板
![设置面板](docs/images/settings-panel.png)

## 部署

### Docker 部署

1. 构建镜像
```bash
docker build -t ai-chat-web .
```

2. 运行容器
```bash
docker run -p 3000:3000 ai-chat-web
```

### 传统部署

1. 构建项目
```bash
npm run build
```

2. 使用 PM2 运行
```bash
pm2 start npm --name "ai-chat-web" -- start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新历史。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目负责人: Your Name
- Email: your.email@example.com
- 项目主页: https://github.com/yourusername/ai-chat-web

## 致谢

感谢所有为这个项目做出贡献的开发者！
