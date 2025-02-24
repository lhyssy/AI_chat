import { SILICONFLOW_CONFIG, getHeaders, DEFAULT_MODEL_PARAMS } from '../config/siliconflow';

class SiliconFlowService {
  constructor() {
    this.baseUrl = SILICONFLOW_CONFIG.BASE_URL;
  }

  // 获取支持的模型列表
  async getModels() {
    try {
      return SILICONFLOW_CONFIG.MODELS.CHAT;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }

  // 发送聊天请求
  async sendMessage(messages, modelId = SILICONFLOW_CONFIG.MODELS.CHAT[0], params = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: modelId,
          messages,
          ...DEFAULT_MODEL_PARAMS,
          ...params
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      // 处理流式响应
      if (params.stream || DEFAULT_MODEL_PARAMS.stream) {
        return response.body;
      }

      return await response.json();
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 处理流式响应
  async *handleStreamResponse(response) {
    const reader = response.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.error('解析响应数据失败:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const siliconFlowService = new SiliconFlowService(); 