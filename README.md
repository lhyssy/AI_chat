# AI Chat Web

基于 React 和 Node.js 构建的现代化 AI 聊天应用。

## 项目概述

AI Chat Web 是一个功能丰富的人工智能聊天平台，支持多种大语言模型，提供实时对话、历史记录管理、数据分析等功能。本项目采用现代化的技术栈和架构设计，致力于提供最佳的用户体验。

## 功能特性

### 核心功能
- 🤖 **多模型支持**
  - DeepSeek、Qwen等主流模型
  - 智能模型切换
  - 参数可视化配置

- 💬 **实时对话**
  - 流式响应
  - 打字机效果
  - WebSocket长连接

- 📝 **对话管理**
  - 本地历史记录
  - 云端同步
  - 全文搜索

- 💰 **支付系统**
  - 余额管理
  - 多种支付方式
  - 使用统计

### 技术特性
- 🎨 **现代化UI**
  - 响应式设计
  - 深色模式
  - 主题定制

- 🔒 **安全性**
  - 数据加密
  - 访问控制
  - 防护措施

- 🚀 **高性能**
  - 快速响应
  - 并发支持
  - 资源优化

## 技术栈

### 前端
- React 18
- Material UI
- Tailwind CSS
- WebSocket

### 后端
- Node.js
- Express
- MongoDB
- WebSocket

### 部署
- Docker
- Vercel
- MongoDB Atlas

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0

### 安装步骤

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

### 生产部署

1. 构建项目
```bash
npm run build
```

2. 启动服务
```bash
npm start
```

## 项目文档

### 开发文档
- [需求文档](docs/REQUIREMENTS.md) - 详细的功能需求和用户体验说明
- [API文档](docs/api/README.md) - API接口说明和示例
- [开发指南](docs/development/README.md) - 开发规范和最佳实践
- [部署指南](docs/deployment/README.md) - 部署流程和配置说明

### 架构文档
- [系统架构](docs/architecture/README.md) - 系统整体架构设计
- [数据模型](docs/architecture/database.md) - 数据库设计说明
- [接口设计](docs/architecture/api-design.md) - API接口设计原则

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目主页：[GitHub](https://github.com/yourusername/ai-chat-web)
- 问题反馈：[Issues](https://github.com/yourusername/ai-chat-web/issues)
- 技术支持：[Discussions](https://github.com/yourusername/ai-chat-web/discussions)

## 致谢

感谢所有为这个项目做出贡献的开发者！
