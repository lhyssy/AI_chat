import { API_CONFIG } from '../../config/api';

// 支付状态枚举
export const PaymentStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
};

// 支付方式枚举
export const PaymentMethod = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay'
};

// 生成订单号
export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORDER${timestamp}${random}`;
};

// 查询支付状态
export const checkPaymentStatus = async (orderId, paymentMethod) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/payment/${paymentMethod}/query/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('查询支付状态失败');
    }

    const data = await response.json();
    return {
      status: data.status,
      paidAmount: data.paidAmount,
      paidTime: data.paidTime
    };
  } catch (error) {
    console.error('查询支付状态失败:', error);
    throw error;
  }
}; 