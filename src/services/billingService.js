import axios from 'axios';
import { BILLING_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 计算token数量
const countTokens = (text) => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  // 简单估算:中文字符按2个token,英文和数字按1个token
  const chineseRegex = /[\u4e00-\u9fa5]/g;
  const chineseMatches = text.match(chineseRegex);
  const chineseCount = chineseMatches ? chineseMatches.length : 0;
  const otherCount = text.length - chineseCount;
  return chineseCount * 2 + otherCount;
};

// 计算费用
const calculateCost = (modelId, inputTokens, outputTokens) => {
  const model = BILLING_CONFIG[modelId];
  if (!model) return 0;

  const inputCost = (inputTokens * model.inputPrice) / 1000;
  const outputCost = (outputTokens * model.outputPrice) / 1000;
  
  return inputCost + outputCost;
};

// 获取账户余额
export const getBalance = async () => {
  try {
    const response = await api.get('/billing/balance');
    return response.data;
  } catch (error) {
    console.error('获取余额失败:', error);
    throw new Error(error.response?.data?.message || '获取余额失败');
  }
};

// 获取使用统计
export const getUsageStats = async () => {
  try {
    const response = await api.get('/billing/usage');
    return response.data;
  } catch (error) {
    console.error('获取使用统计失败:', error);
    throw new Error(error.response?.data?.message || '获取使用统计失败');
  }
};

// 更新使用统计
export const updateUsageStats = async (usage) => {
  try {
    const response = await api.post('/billing/usage', usage);
    return response.data;
  } catch (error) {
    console.error('更新使用统计失败:', error);
    throw new Error(error.response?.data?.message || '更新使用统计失败');
  }
};

// 创建充值订单
export const createRechargeOrder = async (amount, paymentMethod) => {
  try {
    const response = await api.post('/billing/recharge', {
      amount,
      paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('创建充值订单失败:', error);
    throw new Error(error.response?.data?.message || '创建充值订单失败');
  }
};

// 检查订单状态
export const checkOrderStatus = async (orderId) => {
  try {
    const response = await api.get(`/billing/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('检查订单状态失败:', error);
    throw new Error(error.response?.data?.message || '检查订单状态失败');
  }
};

// 计算消息成本
export const calculateMessageCost = (message, model) => {
  if (!message || !model) return 0;
  
  // 使用GPT-3 tokenizer计算token数量
  const inputTokens = countTokens(message);
  // 预估输出token数为输入的1.5倍
  const estimatedOutputTokens = Math.ceil(inputTokens * 1.5);
  
  return calculateCost(model.id, inputTokens, estimatedOutputTokens);
};

// 检查余额是否足够
export const checkBalanceSufficient = async (cost) => {
  try {
    const balance = await getBalance();
    return balance.amount >= cost;
  } catch (error) {
    console.error('检查余额失败:', error);
    throw new Error(error.response?.data?.message || '检查余额失败');
  }
};

// 获取计费配置
export const getBillingConfig = () => {
  return BILLING_CONFIG;
};

// 获取消费记录
export const getBillingHistory = async (params) => {
  try {
    const response = await api.get('/billing/history', { params });
    return response.data;
  } catch (error) {
    console.error('获取消费记录失败:', error);
    throw new Error(error.response?.data?.message || '获取消费记录失败');
  }
};

// 导出账单
export const exportBillingReport = async (params) => {
  try {
    const response = await api.get('/billing/export', {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `账单报告_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('导出账单失败:', error);
    throw new Error(error.response?.data?.message || '导出账单失败');
  }
}; 