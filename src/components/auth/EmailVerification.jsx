import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { sendVerificationCode, verifyEmailCode } from '../../services/authService';

const EmailVerification = ({ email, onVerified, onError }) => {
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    try {
      setIsSending(true);
      setError('');
      await sendVerificationCode(email);
      startCountdown();
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }

    try {
      setError('');
      await verifyEmailCode(email, code);
      onVerified?.();
    } catch (err) {
      setError(err.message);
      onError?.(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="请输入验证码"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={6}
        />
        <button
          onClick={handleSendCode}
          disabled={isSending || countdown > 0}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            isSending || countdown > 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isSending
            ? '发送中...'
            : countdown > 0
            ? `${countdown}秒后重试`
            : '发送验证码'}
        </button>
      </div>

      <button
        onClick={handleVerify}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        验证
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

EmailVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onVerified: PropTypes.func,
  onError: PropTypes.func
};

export default EmailVerification; 