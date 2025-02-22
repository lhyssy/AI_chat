import { API } from '../config/constants';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.messageHandlers = new Set();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  connect() {
    // 根据环境使用不同的WebSocket服务器
    const wsUrl = this.isProduction
      ? `wss://${process.env.REACT_APP_API_BASE_URL.replace('https://', '')}/ws`
      : 'ws://localhost:3001/ws';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // 发送认证信息
        if (this.isProduction) {
          this.ws.send(JSON.stringify({
            type: 'auth',
            token: localStorage.getItem('auth_token')
          }));
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.isProduction) {
          // 生产环境错误处理
          this.handleProductionError(error);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  handleProductionError(error) {
    // 生产环境特定的错误处理
    if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到WebSocket服务器');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('WebSocket连接超时');
    }
    
    // 可以添加错误上报逻辑
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageData = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      if (this.isProduction) {
        messageData.token = localStorage.getItem('auth_token');
      }
      
      this.ws.send(JSON.stringify(messageData));
    } else {
      console.warn('WebSocket is not connected');
      // 可以实现消息队列，等连接恢复后发送
      this.queueMessage(message);
    }
  }

  queueMessage(message) {
    // 实现简单的消息队列
    if (!this.messageQueue) {
      this.messageQueue = [];
    }
    
    if (this.messageQueue.length < 50) { // 限制队列大小
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    if (this.messageQueue && this.messageQueue.length > 0) {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.sendMessage(message);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.messageHandlers.clear();
    this.messageQueue = [];
  }
}

export const websocketService = new WebSocketService(); 