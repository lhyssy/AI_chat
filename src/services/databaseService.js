import mongoose from 'mongoose';
import { DB_CONFIG, DB_STATUS, DB_ERROR_CODES } from '../config/database';

class DatabaseService {
  constructor() {
    this.status = DB_STATUS.DISCONNECTED;
    this.connection = null;
    this.connectionPromise = null;
  }

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.status = DB_STATUS.CONNECTING;

    try {
      this.connectionPromise = mongoose.connect(DB_CONFIG.URL, DB_CONFIG.OPTIONS);
      this.connection = await this.connectionPromise;
      this.status = DB_STATUS.CONNECTED;
      
      console.log('MongoDB connected successfully');
      
      // 设置连接事件监听器
      mongoose.connection.on('error', this.handleError.bind(this));
      mongoose.connection.on('disconnected', this.handleDisconnect.bind(this));
      
      return this.connection;
    } catch (error) {
      this.status = DB_STATUS.ERROR;
      this.handleError(error);
      throw error;
    }
  }

  async disconnect() {
    if (this.status === DB_STATUS.CONNECTED) {
      try {
        await mongoose.disconnect();
        this.status = DB_STATUS.DISCONNECTED;
        this.connection = null;
        this.connectionPromise = null;
        console.log('MongoDB disconnected successfully');
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  handleError(error) {
    this.status = DB_STATUS.ERROR;
    console.error('MongoDB connection error:', error);
    
    // 处理特定错误
    if (error.code === DB_ERROR_CODES.DUPLICATE_KEY) {
      console.error('Duplicate key error');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error - check MongoDB connection');
    }
  }

  handleDisconnect() {
    this.status = DB_STATUS.DISCONNECTED;
    console.log('MongoDB disconnected');
    
    // 自动重连逻辑
    if (process.env.NODE_ENV === 'production') {
      console.log('Attempting to reconnect...');
      this.connect().catch(console.error);
    }
  }

  getStatus() {
    return this.status;
  }

  isConnected() {
    return this.status === DB_STATUS.CONNECTED;
  }

  // 通用CRUD操作
  async create(collection, data) {
    try {
      const result = await mongoose.connection.collection(collection).insertOne(data);
      return result.insertedId;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async findOne(collection, query) {
    try {
      return await mongoose.connection.collection(collection).findOne(query);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async find(collection, query, options = {}) {
    try {
      const { 
        skip = 0, 
        limit = DB_CONFIG.QUERY_OPTIONS.DEFAULT_PAGE_SIZE,
        sort = DB_CONFIG.QUERY_OPTIONS.DEFAULT_SORT 
      } = options;

      return await mongoose.connection.collection(collection)
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(Math.min(limit, DB_CONFIG.QUERY_OPTIONS.MAX_PAGE_SIZE))
        .toArray();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async update(collection, query, update) {
    try {
      const result = await mongoose.connection.collection(collection)
        .updateOne(query, { $set: update });
      return result.modifiedCount;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(collection, query) {
    try {
      const result = await mongoose.connection.collection(collection)
        .deleteOne(query);
      return result.deletedCount;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

// 创建单例实例
const databaseService = new DatabaseService();

export default databaseService; 