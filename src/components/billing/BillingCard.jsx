import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBilling } from '../../contexts/BillingContext';

const BillingCard = () => {
  const { user } = useAuth();
  const { balance, usage, loading, error } = useBilling();

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>加载账单信息失败</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">账户余额</h3>
        <p className="mt-1 text-3xl font-bold text-purple-600">
          ¥{balance?.amount?.toFixed(2) || '0.00'}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-500">本月使用情况</h4>
        <dl className="mt-2 space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">消费金额</dt>
            <dd className="text-sm font-medium text-gray-900">
              ¥{usage?.monthlySpending?.toFixed(2) || '0.00'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">对话次数</dt>
            <dd className="text-sm font-medium text-gray-900">
              {usage?.monthlyChats || 0}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">总字数</dt>
            <dd className="text-sm font-medium text-gray-900">
              {usage?.monthlyTokens?.toLocaleString() || 0}
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={() => window.location.href = '/recharge'}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        充值
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p>当前费率：</p>
        <ul className="mt-1 space-y-1">
          {Object.entries(balance?.rates || {}).map(([model, rate]) => (
            <li key={model}>
              {model}: ¥{rate}/1K tokens
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BillingCard; 