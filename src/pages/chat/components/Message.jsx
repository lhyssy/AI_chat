import React from 'react';
import CodeBlock from '../../../components/chat/CodeBlock';

const Message = React.memo(({ message }) => {
  const renderMessage = (content) => {
    const parts = [];
    let currentIndex = 0;
    
    // 匹配代码块
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 添加代码块前的文本
      if (match.index > currentIndex) {
        parts.push(
          <p key={currentIndex} className="whitespace-pre-wrap">
            {content.slice(currentIndex, match.index)}
          </p>
        );
      }
      
      // 添加代码块
      parts.push(
        <CodeBlock
          key={match.index}
          language={match[1] || 'text'}
          code={match[2]}
        />
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // 添加剩余文本
    if (currentIndex < content.length) {
      parts.push(
        <p key={currentIndex} className="whitespace-pre-wrap">
          {content.slice(currentIndex)}
        </p>
      );
    }
    
    return parts;
  };

  return (
    <div
      className={`mb-6 ${
        message.sender === 'user' ? 'text-right' : 'text-left'
      }`}
    >
      <div
        className={`inline-block max-w-lg px-6 py-3 rounded-2xl ${
          message.sender === 'user'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
            : message.isError
            ? 'bg-red-50 text-red-600 shadow-md'
            : 'bg-white text-gray-800 shadow-md'
        } transform transition-all duration-300 hover:scale-[1.01]`}
      >
        {message.sender === 'ai' && (
          <div className="text-xs text-gray-500 mb-1">
            使用模型: {message.model}
          </div>
        )}
        <div className="text-base">{renderMessage(message.content)}</div>
        {message.file && (
          <div className="mt-2 text-sm text-gray-200 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {message.file.name}
          </div>
        )}
      </div>
    </div>
  );
});

export default Message;