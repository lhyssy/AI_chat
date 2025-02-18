import React from 'react';
import { BILLING_CONFIG } from '../../config/api';

const BillingCard = ({ balance = 0, usage = null, onRecharge }) => {
  // 设置默认值，避免空值
  const defaultUsage = {
    totalCost: 0,
    conversationCount: 0,
    modelUsage: {}
  };

  // 合并默认值和实际值
  const safeUsage = usage ? {
    ...defaultUsage,
    ...usage
  } : defaultUsage;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">账户余额</h3>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            ¥{balance.toFixed(2)}
          </p>
        </div>
        <button
          onClick={onRecharge}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
        >
          充值
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">本月使用情况</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">消费金额</p>
              <p className="text-lg font-semibold text-gray-900">
                ¥{safeUsage.totalCost.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">对话次数</p>
              <p className="text-lg font-semibold text-gray-900">
                {safeUsage.conversationCount}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">模型使用明细</h4>
          <div className="space-y-2">
            {Object.entries(safeUsage.modelUsage).map(([modelId, tokens]) => {
              const model = BILLING_CONFIG[modelId];
              if (!model) return null;
              
              const cost = (tokens * model.pricePerToken / 1000).toFixed(2);
              
              return (
                <div key={modelId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{model.name}</p>
                    <p className="text-xs text-gray-500">{tokens.toLocaleString()} tokens</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">¥{cost}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillingCard); 