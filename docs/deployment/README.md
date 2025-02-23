# 部署指南

## 环境要求

### 硬件要求

- CPU: 2核心以上
- 内存: 4GB以上
- 硬盘: 20GB以上

### 软件要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- Git
- Docker (可选)

## 部署方式

### Vercel 部署

1. **准备工作**
   - Vercel 账号
   - GitHub 仓库
   - 环境变量配置

2. **部署步骤**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel

   # 登录 Vercel
   vercel login

   # 部署项目
   vercel
   ```

3. **环境变量配置**
   ```env
   # API 配置
   REACT_APP_API_BASE_URL=https://api.example.com
   REACT_APP_API_KEY=your_api_key

   # 数据库配置
   MONGODB_URI=mongodb+srv://...
   MONGODB_DATABASE=ai_chat

   # WebSocket 配置
   REACT_APP_WS_URL=wss://ws.example.com

   # 支付配置
   WECHAT_APP_ID=your_wechat_app_id
   ALIPAY_APP_ID=your_alipay_app_id
   ```

### Docker 部署

1. **构建镜像**
   ```bash
   # 构建前端镜像
   docker build -t ai-chat-web:latest .

   # 构建后端镜像
   docker build -t ai-chat-api:latest ./server
   ```

2. **使用 Docker Compose**
   ```yaml
   version: '3.8'

   services:
     web:
       image: ai-chat-web:latest
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - REACT_APP_API_BASE_URL=http://api:4000
       depends_on:
         - api
         - mongodb

     api:
       image: ai-chat-api:latest
       ports:
         - "4000:4000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongodb:27017/ai_chat
       depends_on:
         - mongodb

     mongodb:
       image: mongo:5
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

   volumes:
     mongodb_data:
   ```

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

### 传统部署

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **使用 PM2 运行**
   ```bash
   # 安装 PM2
   npm install -g pm2

   # 启动服务
   pm2 start npm --name "ai-chat-web" -- start
   ```

## 数据库配置

### MongoDB Atlas

1. **创建集群**
   - 选择云服务商和地区
   - 选择集群配置
   - 设置访问权限

2. **连接配置**
   ```javascript
   const CONNECTION_OPTIONS = {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
     family: 4,
     maxPoolSize: 10,
     minPoolSize: 1
   };
   ```

3. **数据备份**
   ```bash
   # 备份数据
   mongodump --uri="mongodb+srv://..."

   # 恢复数据
   mongorestore --uri="mongodb+srv://..."
   ```

## 性能优化

### 前端优化

1. **资源优化**
   - 启用 Gzip 压缩
   - 使用 CDN 加速
   - 图片懒加载

2. **代码优化**
   - 代码分割
   - 路由懒加载
   - 组件按需加载

3. **缓存策略**
   - 浏览器缓存
   - Service Worker
   - 本地存储

### 后端优化

1. **数据库优化**
   - 索引优化
   - 查询优化
   - 连接池配置

2. **API 优化**
   - 响应压缩
   - 请求缓存
   - 限流控制

3. **WebSocket 优化**
   - 心跳检测
   - 断线重连
   - 消息队列

## 监控告警

### 性能监控

1. **前端监控**
   ```javascript
   // 性能指标监控
   const metrics = {
     FCP: performance.getEntriesByType('paint'),
     LCP: new PerformanceObserver(),
     FID: new PerformanceObserver()
   };
   ```

2. **后端监控**
   ```javascript
   // API 响应时间监控
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.url} - ${duration}ms`);
     });
     next();
   });
   ```

### 错误监控

1. **Sentry 配置**
   ```javascript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV
   });
   ```

2. **日志收集**
   ```javascript
   // 错误日志记录
   const logger = winston.createLogger({
     level: 'error',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log' })
     ]
   });
   ```

## 安全配置

### SSL 证书

1. **申请证书**
   - 使用 Let's Encrypt
   - 配置自动续期

2. **Nginx 配置**
   ```nginx
   server {
     listen 443 ssl;
     server_name example.com;

     ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

     location / {
       proxy_pass http://localhost:3000;
     }
   }
   ```

### 安全策略

1. **CORS 配置**
   ```javascript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS.split(','),
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **安全中间件**
   ```javascript
   app.use(helmet());
   app.use(rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   }));
   ```

## 故障处理

### 常见问题

1. **数据库连接失败**
   - 检查连接字符串
   - 验证网络连接
   - 检查防火墙设置

2. **内存溢出**
   - 增加 Node.js 内存限制
   - 优化内存使用
   - 添加监控告警

3. **性能问题**
   - 检查数据库查询
   - 优化代码逻辑
   - 增加缓存机制

### 恢复流程

1. **数据备份恢复**
   ```bash
   # 备份数据
   mongodump --out ./backup

   # 恢复数据
   mongorestore --drop ./backup
   ```

2. **服务重启**
   ```bash
   # 重启所有服务
   pm2 restart all

   # 查看日志
   pm2 logs
   ``` 