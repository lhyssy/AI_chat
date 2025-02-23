import { STORAGE_CONFIG, DEFAULT_TAGS } from './config';

class ChatStorage {
  constructor() {
    this.initStorage();
  }

  // 初始化存储
  initStorage() {
    if (!localStorage.getItem(STORAGE_CONFIG.CHAT_KEY)) {
      localStorage.setItem(STORAGE_CONFIG.CHAT_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_CONFIG.TAGS_KEY)) {
      localStorage.setItem(STORAGE_CONFIG.TAGS_KEY, JSON.stringify(DEFAULT_TAGS));
    }
  }

  // 获取所有对话
  getAllChats() {
    const chats = JSON.parse(localStorage.getItem(STORAGE_CONFIG.CHAT_KEY));
    return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // 保存对话列表
  saveChats(chats) {
    localStorage.setItem(STORAGE_CONFIG.CHAT_KEY, JSON.stringify(chats));
  }

  // 获取所有标签
  getAllTags() {
    return JSON.parse(localStorage.getItem(STORAGE_CONFIG.TAGS_KEY));
  }

  // 保存标签列表
  saveTags(tags) {
    localStorage.setItem(STORAGE_CONFIG.TAGS_KEY, JSON.stringify(tags));
  }

  // 生成对话预览
  generatePreview(messages) {
    if (!messages || messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.slice(0, STORAGE_CONFIG.PREVIEW_LENGTH) + 
           (lastMessage.content.length > STORAGE_CONFIG.PREVIEW_LENGTH ? '...' : '');
  }
}

export const chatStorage = new ChatStorage(); 