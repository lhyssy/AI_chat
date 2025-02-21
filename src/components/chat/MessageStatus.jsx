import React from 'react';
import PropTypes from 'prop-types';

const MessageStatus = ({ status, error, onRetry }) => {
  const renderStatus = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">发送中...</span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm mr-2">{error || '发送失败'}</span>
            <button
              onClick={onRetry}
              className="text-sm text-purple-600 hover:text-purple-700 focus:outline-none"
            >
              重试
            </button>
          </div>
        );

      case 'sent':
        return (
          <div className="flex items-center text-green-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">已发送</span>
          </div>
        );

      case 'delivered':
        return (
          <div className="flex items-center text-green-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">已送达</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-1">
      {renderStatus()}
    </div>
  );
};

MessageStatus.propTypes = {
  status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'error']).isRequired,
  error: PropTypes.string,
  onRetry: PropTypes.func
};

export default MessageStatus; 