import { API_CONFIG } from '../config/api';

// 缓存最近的响应
const responseCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存过期

// 重试配置
const RETRY_COUNT = 2;               // 最大重试次数
const RETRY_DELAY = 2000;           // 重试延迟时间（毫秒）

// 计算请求的缓存键
const getCacheKey = (model, messages) => {
  const lastMessage = messages[messages.length - 1].content;
  return `${model}_${lastMessage}`;
};

// 清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, {timestamp}] of responseCache) {
    if (now - timestamp > CACHE_EXPIRY) {
      responseCache.delete(key);
    }
  }
};

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 发送单次请求
const sendSingleRequest = async (requestBody, controller) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal,
    cache: 'no-cache',
    keepalive: true,
    priority: 'high'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `请求失败 (${response.status})`);
  }

  return response.json();
};

export const sendMessageToAI = async (message, modelId, messageHistory = []) => {
  let lastError = null;
  
  try {
    // 优化消息历史处理
    const MAX_HISTORY_MESSAGES = 10;  // 保留最近10条消息
    const MAX_TOKENS_PER_MESSAGE = 500;  // 每条消息最大token数

    // 处理消息历史，确保不超过token限制
    const processedHistory = messageHistory.slice(-MAX_HISTORY_MESSAGES).map(msg => {
      let content = msg.content;
      if (content.length > MAX_TOKENS_PER_MESSAGE) {
        content = content.substring(0, MAX_TOKENS_PER_MESSAGE) + "...";
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: content
      };
    });

    // 构建消息数组，包含更多上下文信息
    const messages = [
      {
        role: "system",
        content: `你是一个专业的AI助手，请遵循以下原则回答问题：
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
      },
      // 添加会话主题和目标（如果存在）
      ...(messageHistory.length > 0 ? [{
        role: "system",
        content: `当前会话主题: ${messageHistory[0].content.substring(0, 100)}...`
      }] : []),
      ...processedHistory,
      {
        role: "user",
        content: message
      }
    ];

    // 根据不同模型优化参数
    const modelConfig = {
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

    const getModelType = (modelId) => {
      const id = modelId.toLowerCase();
      if (id.includes('deepseek')) return 'deepseek-v3';
      if (id.includes('qwen')) return 'qwen';
      return 'default';
    };

    const config = modelConfig[getModelType(modelId)];
    const requestBody = {
      model: modelId,
      messages: messages,
      ...config,
      stream: false
    };

    // 重试逻辑
    for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
          const data = await sendSingleRequest(requestBody, controller);
          clearTimeout(timeoutId);

          if (!data.choices?.[0]?.message?.content) {
            throw new Error('AI 响应格式无效');
          }

          // 处理响应内容
          const responseText = data.choices[0].message.content;
          return {
            text: responseText,
            model: modelId,
            usage: data.usage,
            metadata: {
              modelType: getModelType(modelId),
              responseLength: responseText.length,
              tokensUsed: data.usage?.total_tokens || 0,
              attemptCount: attempt + 1
            }
          };
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error;
        
        // 详细的错误处理
        const errorMessage = (() => {
          if (error.name === 'AbortError') {
            return `请求超时 (${config.timeout}ms)，请重试或尝试使用其他模型`;
          }
          if (error.message.includes('Failed to fetch')) {
            return '网络连接失败，请检查网络后重试';
          }
          if (error.message.includes('rate_limit')) {
            return '请求频率过高，请稍后重试';
          }
          if (error.message.includes('invalid_api_key')) {
            return 'API密钥无效，请检查配置';
          }
          return error.message || '请求失败，请稍后重试';
        })();
        
        if (attempt === RETRY_COUNT) {
          console.error('所有重试都失败:', {
            modelId,
            error: errorMessage,
            attempts: attempt + 1
          });
          throw new Error(errorMessage);
        }
        
        const retryDelay = RETRY_DELAY * (attempt + 1); // 递增重试延迟
        console.log(`第 ${attempt + 1} 次请求失败: ${errorMessage}，${retryDelay}ms 后重试...`);
        await delay(retryDelay);
      }
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请重试或尝试使用其他模型');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络后重试');
    }
    console.error('请求错误:', error);
    throw new Error(lastError?.message || '请求失败，请稍后重试');
  }
}; 