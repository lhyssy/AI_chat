// API基础配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws',
  TIMEOUT: 30000,
  VERSION: 'v1'
};

// 可用的AI模型
export const AVAILABLE_MODELS = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '强大的语言模型，适合大多数对话场景',
    maxTokens: 4096,
    inputPrice: 0.002,  // 每1K tokens的价格
    outputPrice: 0.002
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '最先进的语言模型，适合复杂任务',
    maxTokens: 8192,
    inputPrice: 0.03,
    outputPrice: 0.06
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    description: 'Anthropic的先进语言模型',
    maxTokens: 100000,
    inputPrice: 0.008,
    outputPrice: 0.024
  }
];

// 模型分类
export const MODEL_CATEGORIES = {
  CHAT: 'chat',
  CODE: 'code',
  ANALYSIS: 'analysis',
  CREATIVE: 'creative'
};

// 系统预设提示词
export const SYSTEM_PROMPTS = {
  DEFAULT: '我是一个AI助手，我会尽力帮助你。',
  CODE: '我是一个编程助手，专注于提供代码相关的帮助。',
  ANALYSIS: '我是一个数据分析助手，可以帮助你分析数据和解决问题。',
  CREATIVE: '我是一个创意助手，可以帮助你进行创意写作和头脑风暴。'
};

// 导出格式
export const EXPORT_FORMATS = {
  JSON: 'json',
  MARKDOWN: 'markdown',
  TXT: 'txt',
  HTML: 'html'
};

// 计费配置
export const BILLING_CONFIG = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    inputPrice: 0.002,
    outputPrice: 0.002
  },
  'gpt-4': {
    name: 'GPT-4',
    inputPrice: 0.03,
    outputPrice: 0.06
  },
  'claude-2': {
    name: 'Claude 2',
    inputPrice: 0.008,
    outputPrice: 0.024
  }
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'text/plain',
    'text/markdown',
    'application/json',
    'application/pdf',
    'image/png',
    'image/jpeg'
  ],
  MAX_FILES: 5
};

// 错误码配置
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500
};

// WebSocket事件类型
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  ERROR: 'error',
  RECONNECT: 'reconnect',
  TYPING: 'typing'
};

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  SETTINGS: 'settings',
  CHAT_HISTORY: 'chat_history',
  LAST_MODEL: 'last_used_model'
}; 