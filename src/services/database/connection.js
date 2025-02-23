import mongoose from 'mongoose';
import { DB_STATUS, CONNECTION_OPTIONS } from './config';
import { DatabaseErrorHandler } from './errorHandler';

export class DatabaseConnection {
  constructor() {
    this.status = DB_STATUS.DISCONNECTED;
    this.connection = null;
    this.connectionPromise = null;
    this.errorHandler = new DatabaseErrorHandler();
  }

  // 获取连接URL
  getConnectionUrl() {
    const { MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE } = process.env;
    return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  }

  // 连接数据库
  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.status = DB_STATUS.CONNECTING;

    try {
      this.connectionPromise = mongoose.connect(
        this.getConnectionUrl(),
        CONNECTION_OPTIONS
      );

      this.connection = await this.connectionPromise;
      this.status = DB_STATUS.CONNECTED;
      
      console.log('MongoDB connected successfully');
      
      // 设置连接事件监听器
      this.setupEventListeners();
      
      return this.connection;
    } catch (error) {
      this.status = DB_STATUS.ERROR;
      throw this.errorHandler.handleError(error);
    }
  }

  // 断开连接
  async disconnect() {
    if (this.status === DB_STATUS.CONNECTED) {
      try {
        await mongoose.disconnect();
        this.status = DB_STATUS.DISCONNECTED;
        this.connection = null;
        this.connectionPromise = null;
        console.log('MongoDB disconnected successfully');
      } catch (error) {
        throw this.errorHandler.handleError(error);
      }
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    mongoose.connection.on('error', (error) => {
      this.status = DB_STATUS.ERROR;
      this.errorHandler.handleError(error);
    });

    mongoose.connection.on('disconnected', () => {
      this.status = DB_STATUS.DISCONNECTED;
      console.log('MongoDB disconnected');
      
      // 生产环境自动重连
      if (process.env.NODE_ENV === 'production') {
        console.log('Attempting to reconnect...');
        this.connect().catch(error => {
          this.errorHandler.handleError(error);
        });
      }
    });
  }

  // 获取连接状态
  getStatus() {
    return this.status;
  }

  // 检查是否已连接
  isConnected() {
    return this.status === DB_STATUS.CONNECTED;
  }

  // 获取原始连接实例
  getConnection() {
    return this.connection;
  }

  // 添加错误监听器
  addErrorListener(listener) {
    this.errorHandler.addErrorListener(listener);
  }

  // 移除错误监听器
  removeErrorListener(listener) {
    this.errorHandler.removeErrorListener(listener);
  }
} 