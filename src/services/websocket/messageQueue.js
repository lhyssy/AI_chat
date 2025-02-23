import { WS_CONFIG } from './config';

export class MessageQueue {
  constructor() {
    this.queue = [];
    this.maxSize = WS_CONFIG.QUEUE.MAX_SIZE;
  }

  enqueue(message) {
    if (this.queue.length < this.maxSize) {
      this.queue.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    console.warn('消息队列已满，消息被丢弃');
    return false;
  }

  dequeue() {
    return this.queue.shift();
  }

  clear() {
    this.queue = [];
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  size() {
    return this.queue.length;
  }

  peek() {
    return this.queue[0];
  }

  getAll() {
    return [...this.queue];
  }
} 