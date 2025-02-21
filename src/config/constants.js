// 环境配置
export const ENV = {
  DEV: process.env.NODE_ENV === 'development',
  PROD: process.env.NODE_ENV === 'production',
  TEST: process.env.NODE_ENV === 'test'
};

// API配置
export const API = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.siliconflow.com/v1',
  API_KEY: process.env.REACT_APP_API_KEY,
  TIMEOUT: 30000,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// 模型配置
export const MODELS = {
  'deepseek-ai/DeepSeek-R1': {
    name: 'DeepSeek R1',
    description: '高性能大语言模型',
    maxTokens: 4096,
    pricing: {
      input: 4,  // ¥4/M tokens
      output: 16 // ¥16/M tokens
    }
  },
  'deepseek-ai/DeepSeek-V3': {
    name: 'DeepSeek V3',
    description: '经济型大语言模型',
    maxTokens: 4096,
    pricing: {
      input: 2,  // ¥2/M tokens
      output: 8  // ¥8/M tokens
    }
  }
};

// 文件上传配置
export const UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md', '.json', '.csv', '.js', '.jsx', '.ts', '.tsx', '.html', '.css'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
};

// 充值配置
export const PAYMENT = {
  PACKAGES: [
    { id: 1, name: '基础套餐', amount: 50, description: '适合轻度使用', bonus: 0 },
    { id: 2, name: '标准套餐', amount: 100, description: '适合日常使用', bonus: 10 },
    { id: 3, name: '专业套餐', amount: 200, description: '适合频繁使用', bonus: 25 },
    { id: 4, name: '企业套餐', amount: 500, description: '适合团队使用', bonus: 75 }
  ],
  METHODS: [
    { id: 'wechat', name: '微信支付', icon: 'WechatIcon' },
    { id: 'alipay', name: '支付宝', icon: 'AlipayIcon' }
  ]
};

// 路由配置
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password'
};

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  THEME: 'app_theme',
  CHAT_HISTORY: 'chat_history'
};

// 错误码
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  INSUFFICIENT_BALANCE: 4001,
  INVALID_TOKEN: 4002,
  RATE_LIMIT_EXCEEDED: 4003
}; 