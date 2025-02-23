import { WS_CONFIG } from './config';
import { WebSocketErrorHandler } from './errorHandler';
import { MessageQueue } from './messageQueue';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.messageHandlers = new Set();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.errorHandler = new WebSocketErrorHandler(this.isProduction);
    this.messageQueue = new MessageQueue();
  }

  connect() {
    const wsUrl = this.isProduction
      ? `wss://${process.env.REACT_APP_API_BASE_URL.replace('https://', '')}/ws`
      : 'ws://localhost:3001/ws';

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      this.errorHandler.handleError(error);
      this.handleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  handleOpen() {
    console.log('WebSocket已连接');
    this.reconnectAttempts = 0;
    
    if (this.isProduction) {
      this.sendAuthMessage();
    }

    this.processMessageQueue();
  }

  handleClose() {
    console.log('WebSocket已断开');
    this.handleReconnect();
  }

  handleError(error) {
    this.errorHandler.handleError(error);
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(data));
    } catch (error) {
      console.error('解析WebSocket消息错误:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= WS_CONFIG.RECONNECT.MAX_ATTEMPTS) {
      console.log('达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      WS_CONFIG.RECONNECT.MIN_DELAY * Math.pow(2, this.reconnectAttempts),
      WS_CONFIG.RECONNECT.MAX_DELAY
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${WS_CONFIG.RECONNECT.MAX_ATTEMPTS})`);
      this.connect();
    }, delay);
  }

  sendAuthMessage() {
    this.sendMessage({
      type: WS_CONFIG.EVENT_TYPES.AUTH,
      token: localStorage.getItem('auth_token')
    });
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
      console.warn('WebSocket未连接，消息已加入队列');
      this.messageQueue.enqueue(message);
    }
  }

  processMessageQueue() {
    while (!this.messageQueue.isEmpty()) {
      const message = this.messageQueue.dequeue();
      this.sendMessage(message);
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
    this.messageQueue.clear();
  }
}

export const websocketService = new WebSocketService(); 