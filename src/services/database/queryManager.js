import mongoose from 'mongoose';
import { QUERY_OPTIONS } from './config';

export class QueryManager {
  constructor(connection) {
    this.connection = connection;
  }

  // 创建文档
  async create(collection, data) {
    try {
      const result = await mongoose.connection
        .collection(collection)
        .insertOne(data);
      return result.insertedId;
    } catch (error) {
      throw error;
    }
  }

  // 查找单个文档
  async findOne(collection, query) {
    try {
      return await mongoose.connection
        .collection(collection)
        .findOne(query);
    } catch (error) {
      throw error;
    }
  }

  // 查找多个文档
  async find(collection, query, options = {}) {
    try {
      const { 
        skip = 0, 
        limit = QUERY_OPTIONS.DEFAULT_PAGE_SIZE,
        sort = QUERY_OPTIONS.DEFAULT_SORT 
      } = options;

      return await mongoose.connection
        .collection(collection)
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(Math.min(limit, QUERY_OPTIONS.MAX_PAGE_SIZE))
        .toArray();
    } catch (error) {
      throw error;
    }
  }

  // 更新文档
  async update(collection, query, update) {
    try {
      const result = await mongoose.connection
        .collection(collection)
        .updateOne(query, { $set: update });
      return result.modifiedCount;
    } catch (error) {
      throw error;
    }
  }

  // 删除文档
  async delete(collection, query) {
    try {
      const result = await mongoose.connection
        .collection(collection)
        .deleteOne(query);
      return result.deletedCount;
    } catch (error) {
      throw error;
    }
  }

  // 批量创建
  async bulkCreate(collection, documents) {
    try {
      const result = await mongoose.connection
        .collection(collection)
        .insertMany(documents);
      return result.insertedIds;
    } catch (error) {
      throw error;
    }
  }

  // 批量更新
  async bulkUpdate(collection, operations) {
    try {
      const result = await mongoose.connection
        .collection(collection)
        .bulkWrite(operations);
      return result.modifiedCount;
    } catch (error) {
      throw error;
    }
  }

  // 聚合查询
  async aggregate(collection, pipeline) {
    try {
      return await mongoose.connection
        .collection(collection)
        .aggregate(pipeline)
        .toArray();
    } catch (error) {
      throw error;
    }
  }

  // 计数查询
  async count(collection, query) {
    try {
      return await mongoose.connection
        .collection(collection)
        .countDocuments(query);
    } catch (error) {
      throw error;
    }
  }

  // 判断文档是否存在
  async exists(collection, query) {
    try {
      const count = await this.count(collection, query);
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
} 