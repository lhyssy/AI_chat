// MongoDB配置
export const DB_CONFIG = {
  // 数据库连接URL (使用MongoDB Atlas)
  URL: process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_chat?retryWrites=true&w=majority',
  
  // 数据库名称
  DATABASE: 'ai_chat',
  
  // 连接选项
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority'
  },
  
  // 集合名称
  COLLECTIONS: {
    USERS: 'users',
    CHATS: 'chats',
    MESSAGES: 'messages',
    USAGE_STATS: 'usage_stats',
    PAYMENTS: 'payments'
  },
  
  // 索引配置
  INDEXES: {
    USERS: {
      email: 1,
      username: 1
    },
    CHATS: {
      userId: 1,
      createdAt: -1
    },
    MESSAGES: {
      chatId: 1,
      createdAt: 1
    }
  }
};

// 数据库连接状态
export const DB_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  CONNECTING: 'connecting'
};

// 数据库错误码
export const DB_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  AUTH_FAILED: 'AUTH_FAILED'
};

// 数据库查询选项
export const QUERY_OPTIONS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT: { createdAt: -1 }
}; 