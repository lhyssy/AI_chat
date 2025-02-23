import { API_CONFIG } from '../../config/api';
import { MODEL_CONFIG, RETRY_CONFIG } from './config';

export class ApiHandler {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.apiKey = API_CONFIG.API_KEY;
  }

  // 获取模型配置
  getModelConfig(modelId) {
    const modelType = this.getModelType(modelId);
    return MODEL_CONFIG[modelType];
  }

  // 获取模型类型
  getModelType(modelId) {
    const id = modelId.toLowerCase();
    if (id.includes('deepseek')) return 'deepseek-v3';
    if (id.includes('qwen')) return 'qwen';
    return 'default';
  }

  // 构建请求体
  buildRequestBody(modelId, messages) {
    const config = this.getModelConfig(modelId);
    return {
      model: modelId,
      messages,
      ...config,
      stream: false
    };
  }

  // 发送单次请求
  async sendRequest(requestBody, controller) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
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
      throw await this.handleRequestError(response);
    }

    const data = await response.json();
    return this.processResponse(data, requestBody.model);
  }

  // 处理请求错误
  async handleRequestError(response) {
    let errorMessage = '请求失败';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || `请求失败 (${response.status})`;
    } catch (e) {
      errorMessage = `请求失败 (${response.status})`;
    }
    return new Error(errorMessage);
  }

  // 处理响应数据
  processResponse(data, modelId) {
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('AI 响应格式无效');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: modelId,
      metadata: {
        modelType: this.getModelType(modelId),
        responseLength: data.choices[0].message.content.length,
        tokensUsed: data.usage?.total_tokens || 0
      }
    };
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取重试延迟时间
  getRetryDelay(attempt) {
    return RETRY_CONFIG.BASE_DELAY * Math.pow(2, attempt);
  }

  // 处理错误消息
  getErrorMessage(error) {
    if (error.name === 'AbortError') {
      return `请求超时，请重试或尝试使用其他模型`;
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
  }
} 