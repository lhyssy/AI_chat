export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.siliconflow.com/v1',
  API_KEY: process.env.REACT_APP_API_KEY
};

export const MODEL_CATEGORIES = {
  FEATURED: 'Featured Models',
  DEEPSEEK: 'DeepSeek Models',
  QWEN: 'Qwen Models',
  META: 'Meta/Llama Models',
  OTHERS: 'Other Models'
};

export const AVAILABLE_MODELS = [
  // Featured Models
  {
    id: 'THUDM/glm-4-9b-chat',
    name: 'GLM-4 9B Chat',
    description: '智谱AI最新通用对话大模型',
    category: MODEL_CATEGORIES.FEATURED
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen 2.5 72B',
    description: '通义千问最强大模型',
    category: MODEL_CATEGORIES.FEATURED
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3',
    description: 'DeepSeek最新版对话模型',
    category: MODEL_CATEGORIES.FEATURED
  },
  
  // DeepSeek Models
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    description: 'DeepSeek基础对话模型',
    category: MODEL_CATEGORIES.DEEPSEEK
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    name: 'DeepSeek R1 70B',
    description: 'DeepSeek 70B大规模模型',
    category: MODEL_CATEGORIES.DEEPSEEK
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    name: 'DeepSeek R1 Qwen 7B',
    description: 'DeepSeek Qwen蒸馏模型',
    category: MODEL_CATEGORIES.DEEPSEEK
  },
  
  // Qwen Models
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen 2.5 72B',
    description: '通义千问2.5 72B指令模型',
    category: MODEL_CATEGORIES.QWEN
  },
  {
    id: 'Qwen/Qwen2.5-32B-Instruct',
    name: 'Qwen 2.5 32B',
    description: '通义千问2.5 32B指令模型',
    category: MODEL_CATEGORIES.QWEN
  },
  {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen 2.5 7B',
    description: '通义千问2.5 7B指令模型',
    category: MODEL_CATEGORIES.QWEN
  },
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen 2.5 Coder 32B',
    description: '通义千问2.5编程专用模型',
    category: MODEL_CATEGORIES.QWEN
  },
  
  // Meta/Llama Models
  {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    name: 'Llama 3 70B',
    description: 'Meta最新Llama 3系列70B模型',
    category: MODEL_CATEGORIES.META
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    name: 'Llama 3 8B',
    description: 'Meta最新Llama 3系列8B模型',
    category: MODEL_CATEGORIES.META
  },
  
  // Other Models
  {
    id: 'google/gemma-2-9b-it',
    name: 'Gemma 9B',
    description: 'Google Gemma系列模型',
    category: MODEL_CATEGORIES.OTHERS
  },
  {
    id: 'internlm/internlm2_5-20b-chat',
    name: 'InternLM 2.5 20B',
    description: '书生浦语2.5系列20B模型',
    category: MODEL_CATEGORIES.OTHERS
  }
];

// 添加标题生成的系统提示
export const SYSTEM_PROMPTS = {
  TITLE_GENERATOR: "请为这个对话生成一个简短的标题（不超过20个字），准确概括对话的主要内容。只返回标题文本，不需要任何解释或其他内容。",
  CHAT_ASSISTANT: "你是一个有帮助的AI助手，请用中文回答用户的问题。"
};

// 添加导出格式选项
export const EXPORT_FORMATS = {
  JSON: 'json',
  MARKDOWN: 'markdown',
  TXT: 'txt'
};

// 添加分享选项
export const SHARE_OPTIONS = {
  COPY_LINK: 'copy_link',
  EXPORT_FILE: 'export_file'
};

// 计费配置
export const BILLING_CONFIG = {
  // GPT-3.5 模型
  'gpt-3.5-turbo': {
    name: 'GPT-3.5',
    pricePerToken: 0.002, // 每1000 tokens的价格（美元）
    contextWindow: 4096,
    inputPrice: 0.0015,   // 输入价格
    outputPrice: 0.002    // 输出价格
  },
  // GPT-4 模型
  'gpt-4': {
    name: 'GPT-4',
    pricePerToken: 0.03,  // 每1000 tokens的价格（美元）
    contextWindow: 8192,
    inputPrice: 0.03,     // 输入价格
    outputPrice: 0.06     // 输出价格
  },
  // Claude 模型
  'claude-2': {
    name: 'Claude 2',
    pricePerToken: 0.01,  // 每1000 tokens的价格（美元）
    contextWindow: 100000,
    inputPrice: 0.008,    // 输入价格
    outputPrice: 0.012    // 输出价格
  }
};

// 支付方式
export const PAYMENT_METHODS = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BANK_CARD: 'bank_card'
};

// 充值套餐
export const RECHARGE_PACKAGES = [
  {
    id: 'basic',
    name: '基础套餐',
    amount: 50,
    bonus: 0,
    description: '适合轻度使用者'
  },
  {
    id: 'pro',
    name: '专业套餐',
    amount: 200,
    bonus: 20,
    description: '赠送20元额度'
  },
  {
    id: 'enterprise',
    name: '企业套餐',
    amount: 1000,
    bonus: 150,
    description: '赠送150元额度'
  }
]; 