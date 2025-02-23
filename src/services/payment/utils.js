// 格式化金额
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount);
};

// 格式化日期
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
};

// 验证订单号格式
export const validateOrderId = (orderId) => {
  return /^ORDER\d{13}\d{3}$/.test(orderId);
};

// 验证金额
export const validateAmount = (amount) => {
  return amount > 0 && amount <= 100000; // 限制单次支付金额不超过10万
}; 