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
  // 开发环境下返回模拟响应
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟

    // 根据不同模型生成不同风格的回复
    let response = '';
    const modelName = modelId.toLowerCase();

    if (modelName.includes('deepseek')) {
      response = `使用模型: DeepSeek R1 70B\n\n您好！让我来详细分析一下这个问题：\n\n1. 核心要点分析：\n   - ${message} 涉及到的主要问题\n   - 需要考虑的关键因素\n   - 可能存在的挑战\n\n2. 解决方案：\n   a) 短期策略：\n      - 立即可以采取的行动\n      - 快速见效的方法\n   b) 长期策略：\n      - 持续优化的方向\n      - 需要逐步实施的计划\n\n3. 具体实施建议：\n   - 第一步：...\n   - 第二步：...\n   - 第三步：...\n\n4. 注意事项：\n   - 实施过程中需要注意的关键点\n   - 可能遇到的问题及解决方案\n\n5. 补充说明：\n   - 相关的最佳实践\n   - 参考资料和文档\n\n希望这个分析对您有帮助。如果您需要更详细的信息或有任何疑问，请随时告诉我。`;
    } else if (modelName.includes('qwen')) {
      response = `使用模型: Qwen 2.5 72B\n\n让我从专业的角度为您分析这个问题：\n\n【问题分析】\n${message} 这个问题涉及以下几个维度：\n1. 技术层面\n2. 业务层面\n3. 用户体验层面\n\n【解决方案】\n基于我的分析，建议采用以下解决方案：\n\n1. 技术实现\n   * 核心架构\n   * 关键组件\n   * 性能优化\n\n2. 业务流程\n   * 流程优化\n   * 数据处理\n   * 监控反馈\n\n3. 用户体验提升\n   * 交互设计\n   * 界面优化\n   * 性能体验\n\n【实施步骤】\n1. 前期准备\n   - 需求分析\n   - 技术选型\n   - 资源评估\n\n2. 开发阶段\n   - 架构设计\n   - 功能实现\n   - 测试验证\n\n3. 部署运维\n   - 环境部署\n   - 监控告警\n   - 性能优化\n\n【最佳实践】\n* 开发规范\n* 代码审查\n* 持续集成\n* 自动化测试\n\n如果您需要更具体的建议或有任何疑问，我很乐意为您进一步解答。`;
    } else {
      response = `使用模型: ${modelId}\n\n感谢您的提问！这是一个很好的问题，让我们深入探讨：\n\n1. 背景分析\n   - 当前状况\n   - 存在的问题\n   - 影响因素\n\n2. 技术方案\n   - 架构设计\n   - 核心算法\n   - 性能优化\n\n3. 实现步骤\n   - 环境准备\n   - 开发流程\n   - 部署方案\n\n4. 最佳实践\n   - 编码规范\n   - 测试策略\n   - 运维建议\n\n5. 注意事项\n   - 安全考虑\n   - 扩展性设计\n   - 维护建议\n\n6. 参考资源\n   - 技术文档\n   - 相关案例\n   - 学习资料\n\n希望这些信息对您有帮助！如果您需要更详细的说明或有其他问题，请随时询问。`;
    }

    return {
      text: response,
      model: modelId,
      usage: {
        promptTokens: 150,
        completionTokens: 800,
        totalTokens: 950
      }
    };
  }

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

    // 检查缓存
    const cacheKey = getCacheKey(modelId, messages);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_EXPIRY) {
      return cachedResponse.content;
    }

    // 清理过期缓存
    cleanExpiredCache();

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
          const content = {
            text: responseText,
            model: modelId,
            usage: data.usage,
            timestamp: Date.now(),
            metadata: {
              modelType: getModelType(modelId),
              responseLength: responseText.length,
              tokensUsed: data.usage?.total_tokens || 0,
              attemptCount: attempt + 1
            }
          };

          // 缓存响应
          responseCache.set(cacheKey, {
            content,
            timestamp: Date.now()
          });

          return content;
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