import { DatabaseConnection } from './connection';
import { QueryManager } from './queryManager';

class DatabaseService {
  constructor() {
    this.connection = new DatabaseConnection();
    this.queryManager = new QueryManager(this.connection);
  }

  // 连接数据库
  async connect() {
    await this.connection.connect();
  }

  // 断开连接
  async disconnect() {
    await this.connection.disconnect();
  }

  // 获取连接状态
  getStatus() {
    return this.connection.getStatus();
  }

  // 检查是否已连接
  isConnected() {
    return this.connection.isConnected();
  }

  // 添加错误监听器
  addErrorListener(listener) {
    this.connection.addErrorListener(listener);
  }

  // 移除错误监听器
  removeErrorListener(listener) {
    this.connection.removeErrorListener(listener);
  }

  // 创建文档
  async create(collection, data) {
    return await this.queryManager.create(collection, data);
  }

  // 查找单个文档
  async findOne(collection, query) {
    return await this.queryManager.findOne(collection, query);
  }

  // 查找多个文档
  async find(collection, query, options) {
    return await this.queryManager.find(collection, query, options);
  }

  // 更新文档
  async update(collection, query, update) {
    return await this.queryManager.update(collection, query, update);
  }

  // 删除文档
  async delete(collection, query) {
    return await this.queryManager.delete(collection, query);
  }

  // 批量创建
  async bulkCreate(collection, documents) {
    return await this.queryManager.bulkCreate(collection, documents);
  }

  // 批量更新
  async bulkUpdate(collection, operations) {
    return await this.queryManager.bulkUpdate(collection, operations);
  }

  // 聚合查询
  async aggregate(collection, pipeline) {
    return await this.queryManager.aggregate(collection, pipeline);
  }

  // 计数查询
  async count(collection, query) {
    return await this.queryManager.count(collection, query);
  }

  // 判断文档是否存在
  async exists(collection, query) {
    return await this.queryManager.exists(collection, query);
  }
}

export const databaseService = new DatabaseService(); 