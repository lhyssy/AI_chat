# AI Chat Web API 文档

## 基础配置

```javascript
BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.siliconflow.com/v1'
API_KEY: process.env.REACT_APP_API_KEY
```

## API 接口列表

### 1. 用户认证

#### 1.1 用户登录
- **路径**: `/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **响应**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

#### 1.2 用户注册
- **路径**: `/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

### 2. AI 对话

#### 2.1 发送消息
- **路径**: `/chat/completions`
- **方法**: POST
- **请求头**:
  ```json
  {
    "Authorization": "Bearer ${API_KEY}",
    "Content-Type": "application/json"
  }
  ```
- **请求体**:
  ```json
  {
    "model": "string",
    "messages": [
      {
        "role": "system|user|assistant",
        "content": "string"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "presence_penalty": 0,
    "frequency_penalty": 0,
    "stream": false
  }
  ```

### 3. 计费系统

#### 3.1 查询余额
- **路径**: `/billing/balance`
- **方法**: GET
- **响应**:
  ```json
  {
    "balance": "number"
  }
  ```

#### 3.2 查询使用统计
- **路径**: `/billing/usage`
- **方法**: GET
- **参数**:
  - start: string (YYYY-MM-DD)
  - end: string (YYYY-MM-DD)
- **响应**:
  ```json
  {
    "totalCost": "number",
    "conversationCount": "number",
    "modelUsage": {
      "model_id": "number"
    }
  }
  ```

#### 3.3 创建充值订单
- **路径**: `/billing/recharge`
- **方法**: POST
- **请求体**:
  ```json
  {
    "amount": "number",
    "paymentMethod": "string"
  }
  ```

### 4. 支付系统

#### 4.1 创建微信支付订单
- **路径**: `/payment/wechat/create`
- **方法**: POST
- **请求体**:
  ```json
  {
    "amount": "number",
    "orderId": "string",
    "notifyUrl": "string"
  }
  ```

#### 4.2 创建支付宝订单
- **路径**: `/payment/alipay/create`
- **方法**: POST
- **请求体**:
  ```json
  {
    "amount": "number",
    "orderId": "string",
    "notifyUrl": "string",
    "returnUrl": "string"
  }
  ```

#### 4.3 查询支付状态
- **路径**: `/payment/{paymentMethod}/query/{orderId}`
- **方法**: GET
- **响应**:
  ```json
  {
    "status": "success|pending|failed",
    "paidAmount": "number",
    "paidTime": "string"
  }
  ```

## 错误处理

### 错误响应格式
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### 常见错误代码
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 429: 请求频率超限
- 500: 服务器内部错误

## 待实现接口

### 1. 用户系统
- [ ] 用户信息更新
- [ ] 密码重置
- [ ] 邮箱验证
- [ ] 第三方登录

### 2. 对话系统
- [ ] 流式响应
- [ ] 对话记录同步
- [ ] 文件处理
- [ ] 语音转文字

### 3. 团队功能
- [ ] 团队创建
- [ ] 成员管理
- [ ] 权限控制
- [ ] 资源共享

## 更新日志

### 2024-03-14
- 创建API文档
- 记录现有接口
- 标注待实现接口 