import { WS_CONFIG } from './config';

export class WebSocketErrorHandler {
  constructor(isProduction = process.env.NODE_ENV === 'production') {
    this.isProduction = isProduction;
  }

  handleError(error) {
    if (this.isProduction) {
      this.handleProductionError(error);
    } else {
      this.handleDevelopmentError(error);
    }
  }

  handleProductionError(error) {
    const { ERROR_CODES } = WS_CONFIG;
    
    switch (error.code) {
      case ERROR_CODES.CONNECTION_REFUSED:
        console.error('无法连接到WebSocket服务器');
        break;
      case ERROR_CODES.TIMEOUT:
        console.error('WebSocket连接超时');
        break;
      default:
        console.error('WebSocket错误:', error);
    }
    
    this.reportError(error);
  }

  handleDevelopmentError(error) {
    console.error('WebSocket开发环境错误:', error);
  }

  reportError(error) {
    // 错误上报
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }
} 