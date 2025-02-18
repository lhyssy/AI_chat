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
    // 检查参数
    if (!message || !modelId) {
      throw new Error('缺少必要参数');
    }

    // 构建消息历史，只保留最近的2条消息以减少请求数据量
    const messages = [
      {
        role: "system",
        content: "你是一个有帮助的AI助手，请用中文简洁地回答用户的问题。回答要精确、简短。"
      },
      ...messageHistory.slice(-2),
      {
        role: "user",
        content: message
      }
    ];

    // 检查缓存
    const cacheKey = getCacheKey(modelId, messages);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_EXPIRY) {
      console.log('使用缓存的响应');
      return cachedResponse.content;
    }

    // 清理过期缓存
    cleanExpiredCache();

    // 根据不同模型优化参数
    const isDeepSeekV3 = modelId.toLowerCase().includes('deepseek-v3');
    const requestBody = {
      model: modelId,
      messages: messages,
      temperature: isDeepSeekV3 ? 0.3 : 0.7,
      max_tokens: isDeepSeekV3 ? 500 : 1000,
      top_p: isDeepSeekV3 ? 0.5 : 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      stream: false
    };

    // 重试逻辑
    for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(`请求超时 (尝试 ${attempt + 1}/${RETRY_COUNT + 1})`);
        }, isDeepSeekV3 ? 30000 : 20000);

        try {
          console.log(`开始第 ${attempt + 1} 次请求`);
          const data = await sendSingleRequest(requestBody, controller);
          clearTimeout(timeoutId);

          if (!data?.choices?.[0]?.message?.content) {
            throw new Error('AI 响应格式无效');
          }

          const content = data.choices[0].message.content;

          // 缓存响应
          responseCache.set(cacheKey, {
            content,
            timestamp: Date.now()
          });

          console.log('请求成功');
          return content;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        lastError = error;
        console.error(`第 ${attempt + 1} 次请求失败:`, error);

        if (attempt === RETRY_COUNT) {
          throw new Error(getErrorMessage(error));
        }

        console.log(`等待 ${RETRY_DELAY}ms 后重试...`);
        await delay(RETRY_DELAY);
      }
    }
  } catch (error) {
    console.error('请求最终失败:', error);
    throw new Error(getErrorMessage(error));
  }
};

// 获取友好的错误消息
const getErrorMessage = (error) => {
  if (error.name === 'AbortError') {
    return '请求超时，请重试或尝试使用其他模型';
  }
  if (error.message.includes('Failed to fetch')) {
    return '网络连接失败，请检查网络后重试';
  }
  if (error.message.includes('API key')) {
    return 'API 密钥无效，请联系管理员';
  }
  if (error.message.includes('Rate limit')) {
    return '请求过于频繁，请稍后再试';
  }
  return error.message || '请求失败，请稍后重试';
}; 