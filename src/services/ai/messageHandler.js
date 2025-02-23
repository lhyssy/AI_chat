import { MESSAGE_CONFIG, SYSTEM_PROMPTS } from './config';

export class MessageHandler {
  constructor() {
    this.maxHistory = MESSAGE_CONFIG.MAX_HISTORY;
    this.maxTokens = MESSAGE_CONFIG.MAX_TOKENS;
  }

  // 处理消息历史
  processHistory(messageHistory) {
    return messageHistory
      .slice(-this.maxHistory)
      .map(msg => this.processMessage(msg));
  }

  // 处理单条消息
  processMessage(message) {
    let content = message.content;
    if (content.length > this.maxTokens) {
      content = content.substring(0, this.maxTokens) + "...";
    }
    return {
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: content
    };
  }

  // 构建完整的消息数组
  buildMessages(message, messageHistory = []) {
    const messages = [
      // 系统提示词
      {
        role: "system",
        content: SYSTEM_PROMPTS.DEFAULT
      }
    ];

    // 如果有会话历史，添加会话主题
    if (messageHistory.length > 0) {
      messages.push({
        role: "system",
        content: `当前会话主题: ${messageHistory[0].content.substring(0, 100)}...`
      });
    }

    // 添加处理后的历史消息
    messages.push(...this.processHistory(messageHistory));

    // 添加当前消息
    messages.push({
      role: "user",
      content: message
    });

    return messages;
  }
} 