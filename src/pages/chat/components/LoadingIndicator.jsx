import React from 'react';

const LoadingIndicator = () => (
  <div className="flex items-center justify-center text-gray-500 my-6">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"></div>
      </div>
    </div>
    <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-medium">
      AI 正在思考中...
    </span>
  </div>
);

export default React.memo(LoadingIndicator);