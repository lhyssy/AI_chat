import { API_CONFIG } from '../../config/api';

// 创建微信支付订单
export const createWechatPayOrder = async (amount, orderId) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/payment/wechat/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        orderId,
        notifyUrl: `${window.location.origin}/payment/wechat/notify`
      })
    });

    if (!response.ok) {
      throw new Error('创建微信支付订单失败');
    }

    const data = await response.json();
    return {
      codeUrl: data.codeUrl,  // 二维码链接
      orderId: data.orderId,
      amount: data.amount
    };
  } catch (error) {
    console.error('微信支付订单创建失败:', error);
    throw error;
  }
}; 