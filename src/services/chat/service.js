import { v4 as uuidv4 } from 'uuid';
import { CHAT_CATEGORIES } from './config';
import { chatStorage } from './storage';
import { ChatExporter } from './exporter';

class ChatService {
  constructor() {
    this.exporter = new ChatExporter();
  }

  // 获取所有对话
  getAllChats() {
    return chatStorage.getAllChats();
  }

  // 获取单个对话
  getChat(chatId) {
    const chats = this.getAllChats();
    return chats.find(chat => chat.id === chatId);
  }

  // 保存对话
  saveChat(chat) {
    const chats = this.getAllChats();
    const now = new Date().toISOString();

    if (chat.id) {
      // 更新现有对话
      const index = chats.findIndex(c => c.id === chat.id);
      if (index !== -1) {
        chats[index] = {
          ...chats[index],
          ...chat,
          preview: chatStorage.generatePreview(chat.messages),
          updatedAt: now
        };
      }
    } else {
      // 创建新对话
      chats.unshift({
        id: uuidv4(),
        title: chat.title || '新对话',
        messages: chat.messages || [],
        preview: chatStorage.generatePreview(chat.messages),
        category: chat.category || CHAT_CATEGORIES.GENERAL,
        tags: chat.tags || [],
        isStarred: false,
        createdAt: now,
        updatedAt: now
      });
    }

    chatStorage.saveChats(chats);
    return chat.id ? chat : chats[0];
  }

  // 删除对话
  deleteChats(chatIds) {
    let chats = this.getAllChats();
    chats = chats.filter(chat => !chatIds.includes(chat.id));
    chatStorage.saveChats(chats);
  }

  // 切换对话标星状态
  toggleChatStar(chatId) {
    const chats = this.getAllChats();
    const index = chats.findIndex(chat => chat.id === chatId);
    if (index !== -1) {
      chats[index].isStarred = !chats[index].isStarred;
      chats[index].updatedAt = new Date().toISOString();
      chatStorage.saveChats(chats);
    }
  }

  // 搜索对话
  searchChats(query) {
    const chats = this.getAllChats();
    const lowerQuery = query.toLowerCase();
    return chats.filter(chat => {
      const titleMatch = chat.title.toLowerCase().includes(lowerQuery);
      const messageMatch = chat.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );
      const tagMatch = chat.tags?.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || messageMatch || tagMatch;
    });
  }

  // 获取所有标签
  getAllTags() {
    return chatStorage.getAllTags();
  }

  // 添加新标签
  addTag(tag) {
    const tags = this.getAllTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      chatStorage.saveTags(tags);
    }
    return tags;
  }

  // 导出对话
  exportChats(chatIds, format) {
    const chats = this.getAllChats().filter(chat => chatIds.includes(chat.id));
    return this.exporter.export(chats, format);
  }
}

export const chatService = new ChatService(); 