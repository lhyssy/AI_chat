import { DB_ERROR_CODES } from './config';

export class DatabaseErrorHandler {
  constructor() {
    this.errorListeners = new Set();
  }

  // 添加错误监听器
  addErrorListener(listener) {
    this.errorListeners.add(listener);
  }

  // 移除错误监听器
  removeErrorListener(listener) {
    this.errorListeners.delete(listener);
  }

  // 处理错误
  handleError(error) {
    console.error('MongoDB error:', error);

    // 根据错误类型处理
    const errorType = this.getErrorType(error);
    const errorMessage = this.getErrorMessage(error, errorType);

    // 通知所有监听器
    this.notifyListeners(error, errorType, errorMessage);

    return {
      type: errorType,
      message: errorMessage,
      originalError: error
    };
  }

  // 获取错误类型
  getErrorType(error) {
    if (error.code === DB_ERROR_CODES.DUPLICATE_KEY) {
      return 'DUPLICATE_KEY';
    }
    if (error.name === DB_ERROR_CODES.NETWORK_ERROR) {
      return 'NETWORK_ERROR';
    }
    if (error.name === DB_ERROR_CODES.TIMEOUT) {
      return 'TIMEOUT';
    }
    return 'UNKNOWN';
  }

  // 获取错误消息
  getErrorMessage(error, type) {
    switch (type) {
      case 'DUPLICATE_KEY':
        return '数据重复，请检查输入';
      case 'NETWORK_ERROR':
        return '网络连接错误，请检查数据库连接';
      case 'TIMEOUT':
        return '数据库操作超时，请重试';
      default:
        return error.message || '未知数据库错误';
    }
  }

  // 通知所有错误监听器
  notifyListeners(error, type, message) {
    this.errorListeners.forEach(listener => {
      try {
        listener({
          type,
          message,
          originalError: error,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error in database error listener:', e);
      }
    });
  }
} 