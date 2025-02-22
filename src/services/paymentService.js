import { API_CONFIG } from '../config/api';

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
      status: data.status,  // success, pending, failed
      paidAmount: data.paidAmount,
      paidTime: data.paidTime
    };
  } catch (error) {
    console.error('查询支付状态失败:', error);
    throw error;
  }
};

// 生成订单号
export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORDER${timestamp}${random}`;
}; 