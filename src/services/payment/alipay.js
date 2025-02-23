import { API_CONFIG } from '../../config/api';

// 创建支付宝支付订单
export const createAlipayOrder = async (amount, orderId) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/payment/alipay/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        orderId,
        notifyUrl: `${window.location.origin}/payment/alipay/notify`,
        returnUrl: `${window.location.origin}/payment/alipay/return`
      })
    });

    if (!response.ok) {
      throw new Error('创建支付宝支付订单失败');
    }

    const data = await response.json();
    return {
      payUrl: data.payUrl,  // 支付宝支付链接
      orderId: data.orderId,
      amount: data.amount
    };
  } catch (error) {
    console.error('支付宝支付订单创建失败:', error);
    throw error;
  }
}; 