export const WS_CONFIG = {
  // 重连配置
  RECONNECT: {
    MAX_ATTEMPTS: 5,
    MIN_DELAY: 1000,
    MAX_DELAY: 30000
  },
  
  // 消息队列配置
  QUEUE: {
    MAX_SIZE: 50
  },
  
  // WebSocket事件类型
  EVENT_TYPES: {
    AUTH: 'auth',
    MESSAGE: 'message',
    ERROR: 'error',
    PING: 'ping',
    PONG: 'pong'
  },
  
  // 错误码
  ERROR_CODES: {
    CONNECTION_REFUSED: 'ECONNREFUSED',
    TIMEOUT: 'ETIMEDOUT'
  }
}; 