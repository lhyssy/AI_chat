import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBalance, getUsageStats } from '../services/billingService';

const BillingContext = createContext();

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

export const BillingProvider = ({ children }) => {
  const [balance, setBalance] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balanceData, usageData] = await Promise.all([
        getBalance(),
        getUsageStats()
      ]);
      setBalance(balanceData);
      setUsage(usageData);
    } catch (err) {
      setError(err.message || '获取账单信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchBillingInfo();
  }, []);

  // 定期更新（每5分钟）
  useEffect(() => {
    const interval = setInterval(fetchBillingInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const updateBalance = async (amount) => {
    setBalance(prev => ({
      ...prev,
      amount: (prev?.amount || 0) + amount
    }));
  };

  const updateUsage = async (newUsage) => {
    setUsage(prev => ({
      ...prev,
      monthlyChats: (prev?.monthlyChats || 0) + 1,
      monthlyTokens: (prev?.monthlyTokens || 0) + newUsage.tokens,
      monthlySpending: (prev?.monthlySpending || 0) + newUsage.cost
    }));
  };

  return (
    <BillingContext.Provider
      value={{
        balance,
        usage,
        loading,
        error,
        updateBalance,
        updateUsage,
        refreshBillingInfo: fetchBillingInfo
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}; 