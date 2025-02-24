// SiliconFlow API配置
export const SILICONFLOW_CONFIG = {
  API_KEY: 'sk-fc51cb84938a4c3b8957f83f15b3e1be',
  BASE_URL: 'https://api.siliconflow.cn/v1',
  MODELS: {
    CHAT: [
      'deepseek-ai/deepseek-chat-67b',
      'deepseek-ai/deepseek-coder-33b',
      'qwen/qwen-72b-chat',
      'qwen/qwen-14b-chat',
    ]
  }
};

// API请求头配置
export const getHeaders = () => ({
  'Authorization': `Bearer ${SILICONFLOW_CONFIG.API_KEY}`,
  'Content-Type': 'application/json'
});

// 模型默认参数
export const DEFAULT_MODEL_PARAMS = {
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  stream: true
}; 