import { API } from '../config/constants';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Set();
    this.messageQueue = [];
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.heartbeatInterval = null;
    this.lastPingTime = null;
    this.baseUrl = process.env.REACT_APP_WS_URL;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem('auth_token');
    const url = `${this.baseUrl}?token=${token}`;

    try {
      console.log('正在连接WebSocket...', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.processMessageQueue();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        if (event.code !== 1000) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            this.lastPingTime = Date.now();
            return;
          }

          this.messageHandlers.forEach(handler => {
            try {
              handler(data);
            } catch (err) {
              console.error('消息处理器错误:', err);
            }
          });
        } catch (error) {
          console.error('解析消息失败:', error);
        }
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('重连次数超过最大限制');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`${delay}ms后尝试重连... (第${this.reconnectAttempts}次)`);
    setTimeout(() => this.connect(), delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.lastPingTime = Date.now();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const now = Date.now();
        if (this.lastPingTime && (now - this.lastPingTime > 10000)) {
          console.warn('心跳超时，重新连接');
          this.reconnect();
          return;
        }

        this.sendMessage({ type: 'ping' });
      }
    }, 5000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('发送消息失败:', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      console.warn('WebSocket未连接，消息已加入队列');
      this.queueMessage(message);
      this.connect();
      return false;
    }
  }

  queueMessage(message) {
    const MAX_QUEUE_SIZE = 50;
    if (this.messageQueue.length < MAX_QUEUE_SIZE) {
      this.messageQueue.push({
        message,
        timestamp: Date.now()
      });
    } else {
      console.warn('消息队列已满，丢弃最早的消息');
      this.messageQueue.shift();
      this.messageQueue.push({
        message,
        timestamp: Date.now()
      });
    }
  }

  processMessageQueue() {
    const MAX_RETRY_TIME = 5 * 60 * 1000; // 5分钟
    const now = Date.now();
    
    this.messageQueue = this.messageQueue.filter(item => {
      if (now - item.timestamp > MAX_RETRY_TIME) {
        console.warn('消息超时，已从队列中移除');
        return false;
      }
      
      if (this.sendMessage(item.message)) {
        return false; // 发送成功，从队列中移除
      }
      return true; // 发送失败，保留在队列中
    });
  }
}

export const websocketService = new WebSocketService(); 