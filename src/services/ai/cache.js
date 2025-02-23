import { CACHE_CONFIG } from './config';

class ResponseCache {
  constructor() {
    this.cache = new Map();
  }

  // 生成缓存键
  generateKey(model, messages) {
    const lastMessage = messages[messages.length - 1].content;
    return `${model}_${lastMessage}`;
  }

  // 获取缓存
  get(model, messages) {
    const key = this.generateKey(model, messages);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.EXPIRY) {
      return cached.data;
    }
    
    return null;
  }

  // 设置缓存
  set(model, messages, data) {
    const key = this.generateKey(model, messages);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    for (const [key, {timestamp}] of this.cache) {
      if (now - timestamp > CACHE_CONFIG.EXPIRY) {
        this.cache.delete(key);
      }
    }
  }

  // 清除所有缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存大小
  size() {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache(); 