# API 文档

## 服务接口

### AI 服务

#### 发送消息

```typescript
interface SendMessageParams {
  message: string;
  modelId: string;
  messageHistory?: Message[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface MessageResponse {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  metadata: {
    modelType: string;
    responseLength: number;
    tokensUsed: number;
  };
}

async function sendMessage(params: SendMessageParams): Promise<MessageResponse>
```

### 聊天服务

#### 获取所有对话

```typescript
interface Chat {
  id: string;
  title: string;
  messages: Message[];
  preview: string;
  category: string;
  tags: string[];
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

function getAllChats(): Chat[]
```

#### 保存对话

```typescript
interface SaveChatParams {
  id?: string;
  title?: string;
  messages: Message[];
  category?: string;
  tags?: string[];
}

function saveChat(chat: SaveChatParams): Chat
```

#### 删除对话

```typescript
function deleteChats(chatIds: string[]): void
```

#### 搜索对话

```typescript
function searchChats(query: string): Chat[]
```

### 支付服务

#### 创建支付订单

```typescript
interface CreateOrderParams {
  amount: number;
  orderId: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  codeUrl?: string;  // 微信支付
  payUrl?: string;   // 支付宝支付
}

async function createWechatPayOrder(params: CreateOrderParams): Promise<OrderResponse>
async function createAlipayOrder(params: CreateOrderParams): Promise<OrderResponse>
```

#### 查询支付状态

```typescript
interface PaymentStatus {
  status: 'success' | 'pending' | 'failed';
  paidAmount: number;
  paidTime: string;
}

async function checkPaymentStatus(orderId: string, paymentMethod: string): Promise<PaymentStatus>
```

### WebSocket 服务

#### 连接管理

```typescript
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

class WebSocketService {
  connect(): void;
  disconnect(): void;
  sendMessage(message: WebSocketMessage): void;
  addMessageHandler(handler: (message: WebSocketMessage) => void): void;
  removeMessageHandler(handler: (message: WebSocketMessage) => void): void;
}
```

### 数据库服务

#### 基础操作

```typescript
interface QueryOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

class DatabaseService {
  async connect(): Promise<void>;
  async disconnect(): Promise<void>;
  async create(collection: string, data: any): Promise<string>;
  async findOne(collection: string, query: any): Promise<any>;
  async find(collection: string, query: any, options?: QueryOptions): Promise<any[]>;
  async update(collection: string, query: any, update: any): Promise<number>;
  async delete(collection: string, query: any): Promise<number>;
}
```

## WebSocket 事件

### 事件类型

```typescript
enum WebSocketEventType {
  AUTH = 'auth',
  MESSAGE = 'message',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}
```

### 认证事件

```json
{
  "type": "auth",
  "token": "jwt_token_here",
  "timestamp": "2024-02-22T14:30:00.000Z"
}
```

### 消息事件

```json
{
  "type": "message",
  "data": {
    "content": "消息内容",
    "role": "user",
    "chatId": "chat_id_here"
  },
  "timestamp": "2024-02-22T14:30:00.000Z"
}
```

## 错误处理

### 错误码

```typescript
enum ErrorCode {
  INVALID_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMIT = 429,
  INTERNAL_ERROR = 500
}
```

### 错误响应格式

```json
{
  "error": {
    "code": 400,
    "message": "错误描述",
    "details": {
      "field": "具体错误字段",
      "reason": "具体错误原因"
    }
  }
}
```

## 安全认证

### JWT 认证

所有 API 请求需要在 Header 中携带 JWT Token：

```http
Authorization: Bearer <token>
```

### API 密钥认证

AI 模型相关请求需要在 Header 中携带 API Key：

```http
X-API-Key: <api_key>
``` 