import { RETRY_CONFIG } from './config';
import { responseCache } from './cache';
import { MessageHandler } from './messageHandler';
import { ApiHandler } from './apiHandler';

class AIService {
  constructor() {
    this.messageHandler = new MessageHandler();
    this.apiHandler = new ApiHandler();
  }

  async sendMessage(message, modelId, messageHistory = []) {
    let lastError = null;
    responseCache.cleanup();

    // 构建消息
    const messages = this.messageHandler.buildMessages(message, messageHistory);

    // 检查缓存
    const cachedResponse = responseCache.get(modelId, messages);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 构建请求体
    const requestBody = this.apiHandler.buildRequestBody(modelId, messages);

    // 重试逻辑
    for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const config = this.apiHandler.getModelConfig(modelId);
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
          const response = await this.apiHandler.sendRequest(requestBody, controller);
          
          // 缓存响应
          responseCache.set(modelId, messages, response);
          
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error;
        
        if (attempt === RETRY_CONFIG.MAX_ATTEMPTS) {
          console.error('所有重试都失败:', {
            modelId,
            error: this.apiHandler.getErrorMessage(error),
            attempts: attempt + 1
          });
          throw new Error(this.apiHandler.getErrorMessage(error));
        }
        
        const retryDelay = this.apiHandler.getRetryDelay(attempt);
        console.log(`第 ${attempt + 1} 次请求失败: ${this.apiHandler.getErrorMessage(error)}，${retryDelay}ms 后重试...`);
        await this.apiHandler.delay(retryDelay);
      }
    }
  }
}

export const aiService = new AIService(); 