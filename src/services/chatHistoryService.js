import { v4 as uuidv4 } from 'uuid';

// 对话分类
export const CHAT_CATEGORIES = {
  GENERAL: '通用对话',
  TECHNICAL: '技术咨询',
  BUSINESS: '商务咨询',
  CREATIVE: '创意写作',
  ANALYSIS: '数据分析',
  TRANSLATION: '翻译助手',
  OTHERS: '其他'
};

// 预设标签
export const DEFAULT_TAGS = [
  '重要',
  '待处理',
  '已完成',
  '参考',
  '项目相关',
  '学习笔记',
  '问题解决'
];

// 本地存储键
const STORAGE_KEY = 'ai_chat_history';
const TAGS_KEY = 'ai_chat_tags';

// 初始化本地存储
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TAGS_KEY)) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(DEFAULT_TAGS));
  }
};

// 获取所有对话
export const getAllChats = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

// 获取单个对话
export const getChat = (chatId) => {
  const chats = getAllChats();
  return chats.find(chat => chat.id === chatId);
};

// 保存对话
export const saveChat = (chatData) => {
  const chats = getAllChats();
  const now = new Date().toISOString();
  
  // 如果是新对话
  if (!chatData.id) {
    const newChat = {
      id: uuidv4(),
      title: chatData.title || '新对话',
      messages: chatData.messages || [],
      category: chatData.category || CHAT_CATEGORIES.GENERAL,
      tags: chatData.tags || [],
      starred: false,
      preview: generatePreview(chatData.messages),
      messageCount: chatData.messages?.length || 0,
      createdAt: now,
      updatedAt: now
    };
    chats.unshift(newChat);
  } else {
    // 更新现有对话
    const index = chats.findIndex(chat => chat.id === chatData.id);
    if (index !== -1) {
      chats[index] = {
        ...chats[index],
        ...chatData,
        preview: generatePreview(chatData.messages || chats[index].messages),
        messageCount: chatData.messages?.length || chats[index].messageCount,
        updatedAt: now
      };
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  return chatData.id || chats[0].id;
};

// 删除对话
export const deleteChats = async (chatIds) => {
  const chats = getAllChats();
  const updatedChats = chats.filter(chat => !chatIds.includes(chat.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
};

// 切换对话星标状态
export const toggleChatStar = async (chatId) => {
  const chats = getAllChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  if (index !== -1) {
    chats[index].starred = !chats[index].starred;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
};

// 搜索对话
export const searchChats = (query, filters = {}) => {
  let chats = getAllChats();
  
  // 应用搜索查询
  if (query) {
    const lowerQuery = query.toLowerCase();
    chats = chats.filter(chat => 
      chat.title.toLowerCase().includes(lowerQuery) ||
      chat.preview.toLowerCase().includes(lowerQuery) ||
      chat.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // 应用分类过滤
  if (filters.category) {
    chats = chats.filter(chat => chat.category === filters.category);
  }
  
  // 应用标签过滤
  if (filters.tags && filters.tags.length > 0) {
    chats = chats.filter(chat => 
      filters.tags.every(tag => chat.tags.includes(tag))
    );
  }
  
  // 应用星标过滤
  if (filters.starred) {
    chats = chats.filter(chat => chat.starred);
  }
  
  return chats;
};

// 获取所有标签
export const getAllTags = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(TAGS_KEY));
};

// 添加新标签
export const addTag = (tag) => {
  const tags = getAllTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }
};

// 导出对话
export const exportChats = async (chatIds, format = 'json') => {
  const chats = getAllChats().filter(chat => chatIds.includes(chat.id));
  
  if (format === 'json') {
    return JSON.stringify(chats, null, 2);
  } else if (format === 'markdown') {
    return chats.map(chat => {
      let markdown = `# ${chat.title}\n\n`;
      markdown += `分类：${chat.category}\n`;
      markdown += `标签：${chat.tags.join(', ')}\n`;
      markdown += `创建时间：${new Date(chat.createdAt).toLocaleString()}\n`;
      markdown += `更新时间：${new Date(chat.updatedAt).toLocaleString()}\n\n`;
      markdown += `## 对话内容\n\n`;
      
      chat.messages.forEach(msg => {
        markdown += `### ${msg.sender === 'user' ? '用户' : 'AI'}\n`;
        markdown += `${msg.content}\n\n`;
      });
      
      return markdown;
    }).join('\n---\n\n');
  }
  
  throw new Error('不支持的导出格式');
};

// 生成对话预览
const generatePreview = (messages) => {
  if (!messages || messages.length === 0) return '';
  const lastMessage = messages[messages.length - 1];
  return lastMessage.content.slice(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
}; 