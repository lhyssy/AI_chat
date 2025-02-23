// 缓存配置
export const CACHE_CONFIG = {
  EXPIRY: 5 * 60 * 1000, // 5分钟缓存过期
};

// 重试配置
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,      // 最大重试次数
  BASE_DELAY: 2000,     // 基础重试延迟（毫秒）
};

// 消息配置
export const MESSAGE_CONFIG = {
  MAX_HISTORY: 10,      // 保留最近消息数量
  MAX_TOKENS: 500,      // 每条消息最大token数
};

// 模型配置
export const MODEL_CONFIG = {
  'deepseek-v3': {
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.5,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
    timeout: 30000
  },
  'qwen': {
    temperature: 0.7,
    max_tokens: 3000,
    top_p: 0.9,
    presence_penalty: 0.2,
    frequency_penalty: 0.2,
    timeout: 25000
  },
  'default': {
    temperature: 0.8,
    max_tokens: 2500,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    timeout: 20000
  }
};

// 系统提示词
export const SYSTEM_PROMPTS = {
  DEFAULT: `你是一个专业的AI助手，请遵循以下原则回答问题：
1. 回答要专业、准确、有深度，避免泛泛而谈
2. 采用结构化的方式组织内容，使用标题、列表等
3. 对技术问题，需要提供代码示例和最佳实践
4. 解释专业术语时要通俗易懂
5. 回答要有逻辑性，先分析问题，再给出解决方案
6. 在合适的地方引用权威资料或文档
7. 对复杂问题，要分步骤详细说明
8. 主动提供相关的扩展知识和建议
9. 保持回答的连贯性，注意上下文
10. 鼓励用户提出问题，保持互动性`
}; 