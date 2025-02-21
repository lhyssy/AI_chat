import { API_CONFIG } from '../config/api';
import apiClient from './apiService';

// 创建微信支付订单
export const createWechatPayment = async (amount, description) => {
  try {
    const response = await apiClient.post('/api/payment/wechat/create', {
      amount,
      description
    });
    
    return response.data;
  } catch (error) {
    console.error('创建微信支付订单失败:', error);
    throw error;
  }
};

// 创建支付宝支付订单
export const createAlipayPayment = async (amount, description) => {
  try {
    const response = await apiClient.post('/api/payment/alipay/create', {
      amount,
      description
    });
    
    return response.data;
  } catch (error) {
    console.error('创建支付宝订单失败:', error);
    throw error;
  }
};

// 查询支付状态
export const checkPaymentStatus = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/payment/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('检查支付状态失败:', error);
    throw error;
  }
};

// 获取支付历史
export const getPaymentHistory = async (params) => {
  try {
    const response = await apiClient.get('/api/payment/history', { params });
    return response.data;
  } catch (error) {
    console.error('获取支付历史失败:', error);
    throw error;
  }
};

// 轮询支付状态
export const pollPaymentStatus = (orderId, callback, interval = 3000) => {
  const timer = setInterval(async () => {
    try {
      const status = await checkPaymentStatus(orderId);
      if (status.paid) {
        clearInterval(timer);
        callback(null, status);
      }
    } catch (error) {
      clearInterval(timer);
      callback(error);
    }
  }, interval);

  return () => clearInterval(timer);
};

// 生成订单号
export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORDER${timestamp}${random}`;
}; 