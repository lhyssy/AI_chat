import React, { useState } from 'react';
import { RECHARGE_PACKAGES, PAYMENT_METHODS } from '../../config/api';

const RechargeModal = ({ isOpen, onClose, onRecharge }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  if (!isOpen) return null;

  const handleRecharge = () => {
    const amount = selectedPackage ? selectedPackage.amount : Number(customAmount);
    if (!amount || !selectedPayment) return;
    
    onRecharge({
      amount,
      paymentMethod: selectedPayment,
      packageId: selectedPackage?.id
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">账户充值</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 充值套餐 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">选择充值套餐</h3>
          <div className="grid grid-cols-2 gap-4">
            {RECHARGE_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setCustomAmount('');
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedPackage?.id === pkg.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">{pkg.name}</span>
                  {pkg.bonus > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      送{pkg.bonus}元
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">¥{pkg.amount}</p>
                <p className="text-xs text-gray-500">{pkg.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义金额 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">自定义金额</h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedPackage(null);
              }}
              min="1"
              step="1"
              className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors"
              placeholder="输入充值金额"
            />
          </div>
        </div>

        {/* 支付方式 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">选择支付方式</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedPayment(value)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedPayment === value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex flex-col items-center">
                  {value === 'wechat' && (
                    <svg className="w-6 h-6 text-gray-700 mb-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.5,7A8.5,8.5 0 0,1 17,15.5A8.5,8.5 0 0,1 8.5,24A8.5,8.5 0 0,1 0,15.5A8.5,8.5 0 0,1 8.5,7M8.5,9A6.5,6.5 0 0,0 2,15.5A6.5,6.5 0 0,0 8.5,22A6.5,6.5 0 0,0 15,15.5A6.5,6.5 0 0,0 8.5,9M15.5,0A8.5,8.5 0 0,1 24,8.5A8.5,8.5 0 0,1 15.5,17A8.5,8.5 0 0,1 7,8.5A8.5,8.5 0 0,1 15.5,0M15.5,2A6.5,6.5 0 0,0 9,8.5A6.5,6.5 0 0,0 15.5,15A6.5,6.5 0 0,0 22,8.5A6.5,6.5 0 0,0 15.5,2" />
                    </svg>
                  )}
                  {value === 'alipay' && (
                    <svg className="w-6 h-6 text-gray-700 mb-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7,2H17A5,5 0 0,1 22,7V17A5,5 0 0,1 17,22H7A5,5 0 0,1 2,17V7A5,5 0 0,1 7,2M7,4A3,3 0 0,0 4,7V17A3,3 0 0,0 7,20H17A3,3 0 0,0 20,17V7A3,3 0 0,0 17,4H7M8,6H16A2,2 0 0,1 18,8V16A2,2 0 0,1 16,18H8A2,2 0 0,1 6,16V8A2,2 0 0,1 8,6M9,8A1,1 0 0,0 8,9V15A1,1 0 0,0 9,16H15A1,1 0 0,0 16,15V9A1,1 0 0,0 15,8H9M9,10H15V14H9V10" />
                    </svg>
                  )}
                  {value === 'bank_card' && (
                    <svg className="w-6 h-6 text-gray-700 mb-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                  )}
                  <span className="text-xs font-medium text-gray-700">
                    {value === 'wechat' && '微信支付'}
                    {value === 'alipay' && '支付宝'}
                    {value === 'bank_card' && '银行卡'}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* 确认按钮 */}
        <button
          onClick={handleRecharge}
          disabled={!selectedPayment || (!selectedPackage && !customAmount)}
          className={`w-full py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
            selectedPayment && (selectedPackage || customAmount)
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          确认充值
          {selectedPackage?.amount || customAmount ? ` ¥${selectedPackage?.amount || customAmount}` : ''}
        </button>
      </div>
    </div>
  );
};

export default React.memo(RechargeModal); 