// 数据库状态
export const DB_STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

// 数据库错误码
export const DB_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
  NETWORK_ERROR: 'MongoNetworkError',
  TIMEOUT: 'MongoTimeoutError'
};

// 查询选项
export const QUERY_OPTIONS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT: { createdAt: -1 }
};

// 连接选项
export const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000
}; 