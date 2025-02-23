export * from './core';
export * from './wechat';
export * from './alipay';
export * from './billing';
export * from './utils';

// 支付服务配置
export const PaymentConfig = {
  // 支付超时时间（分钟）
  TIMEOUT: 30,
  // 最小充值金额
  MIN_RECHARGE: 1,
  // 最大充值金额
  MAX_RECHARGE: 100000,
  // 支付结果轮询间隔（秒）
  POLL_INTERVAL: 3
}; 