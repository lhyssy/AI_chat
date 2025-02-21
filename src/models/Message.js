import mongoose from 'mongoose';
import { DB_CONFIG } from '../config/database';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  model: {
    type: String,
    required: true
  },
  tokens: {
    input: {
      type: Number,
      default: 0
    },
    output: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  cost: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  error: {
    code: String,
    message: String
  }
}, {
  timestamps: true
});

// 索引
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });

// 计算消息成本
messageSchema.methods.calculateCost = function(pricing) {
  const { input, output } = this.tokens;
  const inputCost = (input / 1000) * pricing.input;
  const outputCost = (output / 1000) * pricing.output;
  this.cost = inputCost + outputCost;
  return this.cost;
};

// 更新令牌计数
messageSchema.methods.updateTokenCount = function(counts) {
  this.tokens = {
    input: counts.input || 0,
    output: counts.output || 0,
    total: (counts.input || 0) + (counts.output || 0)
  };
};

// 静态方法：获取聊天历史
messageSchema.statics.getChatHistory = async function(chatId, options = {}) {
  const {
    limit = DB_CONFIG.QUERY_OPTIONS.DEFAULT_PAGE_SIZE,
    skip = 0,
    sort = { createdAt: 1 }
  } = options;

  return this.find({ chatId })
    .sort(sort)
    .skip(skip)
    .limit(Math.min(limit, DB_CONFIG.QUERY_OPTIONS.MAX_PAGE_SIZE))
    .exec();
};

// 静态方法：获取用户的所有消息
messageSchema.statics.getUserMessages = async function(userId, options = {}) {
  const {
    limit = DB_CONFIG.QUERY_OPTIONS.DEFAULT_PAGE_SIZE,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  return this.find({ userId })
    .sort(sort)
    .skip(skip)
    .limit(Math.min(limit, DB_CONFIG.QUERY_OPTIONS.MAX_PAGE_SIZE))
    .exec();
};

const Message = mongoose.model('Message', messageSchema);

export default Message; 