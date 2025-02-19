import { v4 as uuidv4 } from 'uuid';

// 对话分类
export const CHAT_CATEGORIES = {
  GENERAL: '通用对话',
  TECHNICAL: '技术咨询',
  BUSINESS: '商务咨询',
  DATA_ANALYSIS: '数据分析',
  OTHER: '其他'
};

// 预设标签
export const DEFAULT_TAGS = [
  '重要',
  '待处理',
  '已完成',
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
  const chats = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

// 获取单个对话
export const getChat = (chatId) => {
  const chats = getAllChats();
  return chats.find(chat => chat.id === chatId);
};

// 保存对话
export const saveChat = (chat) => {
  const chats = getAllChats();
  const now = new Date().toISOString();

  if (chat.id) {
    // 更新现有对话
    const index = chats.findIndex(c => c.id === chat.id);
    if (index !== -1) {
      chats[index] = {
        ...chats[index],
        ...chat,
        updatedAt: now
      };
    }
  } else {
    // 创建新对话
    chats.unshift({
      id: uuidv4(),
      title: chat.title || '新对话',
      messages: chat.messages || [],
      category: chat.category || CHAT_CATEGORIES.GENERAL,
      tags: chat.tags || [],
      isStarred: false,
      createdAt: now,
      updatedAt: now
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  return chat.id ? chat : chats[0];
};

// 删除对话
export const deleteChats = (chatIds) => {
  let chats = getAllChats();
  chats = chats.filter(chat => !chatIds.includes(chat.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
};

// 切换对话标星状态
export const toggleChatStar = (chatId) => {
  const chats = getAllChats();
  const index = chats.findIndex(chat => chat.id === chatId);
  if (index !== -1) {
    chats[index].isStarred = !chats[index].isStarred;
    chats[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
};

// 搜索对话
export const searchChats = (query) => {
  const chats = getAllChats();
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
  return tags;
};

// 导出对话
export const exportChats = (chatIds, format = 'json') => {
  const chats = getAllChats().filter(chat => chatIds.includes(chat.id));
  
  if (format === 'json') {
    return JSON.stringify(chats, null, 2);
  }
  
  if (format === 'markdown') {
    return chats.map(chat => {
      let markdown = `# ${chat.title}\n\n`;
      markdown += `- 创建时间：${new Date(chat.createdAt).toLocaleString()}\n`;
      markdown += `- 更新时间：${new Date(chat.updatedAt).toLocaleString()}\n`;
      markdown += `- 分类：${chat.category}\n`;
      if (chat.tags?.length) {
        markdown += `- 标签：${chat.tags.join(', ')}\n`;
      }
      markdown += '\n## 对话内容\n\n';
      
      chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? '我' : 'AI';
        markdown += `### ${role}\n\n${msg.content}\n\n`;
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