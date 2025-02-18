import { API_CONFIG, BILLING_CONFIG } from '../config/api';

// 计算token数量
const countTokens = (text) => {
  // 简单估算:中文字符按2个token,英文和数字按1个token
  const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
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

// 查询账户余额
export const getBalance = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/billing/balance`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`
      }
    });
    
    if (!response.ok) throw new Error('获取余额失败');
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('获取余额错误:', error);
    throw error;
  }
};

// 查询使用统计
export const getUsageStats = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/billing/usage?start=${startDate}&end=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`
        }
      }
    );
    
    if (!response.ok) throw new Error('获取使用统计失败');
    return await response.json();
  } catch (error) {
    console.error('获取使用统计错误:', error);
    throw error;
  }
};

// 创建充值订单
export const createRechargeOrder = async (amount, paymentMethod) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/billing/recharge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, paymentMethod })
    });
    
    if (!response.ok) throw new Error('创建充值订单失败');
    return await response.json();
  } catch (error) {
    console.error('创建充值订单错误:', error);
    throw error;
  }
};

// 查询订单状态
export const checkOrderStatus = async (orderId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/billing/order/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`
        }
      }
    );
    
    if (!response.ok) throw new Error('查询订单状态失败');
    return await response.json();
  } catch (error) {
    console.error('查询订单状态错误:', error);
    throw error;
  }
};

// 计算本次对话费用
export const calculateMessageCost = (modelId, message, response) => {
  const inputTokens = countTokens(message);
  const outputTokens = countTokens(response);
  return calculateCost(modelId, inputTokens, outputTokens);
};

// 检查余额是否足够
export const checkBalanceSufficient = async (modelId, estimatedTokens) => {
  try {
    const balance = await getBalance();
    const estimatedCost = calculateCost(modelId, estimatedTokens, estimatedTokens * 2);
    return balance >= estimatedCost;
  } catch (error) {
    console.error('检查余额错误:', error);
    throw error;
  }
}; 