import React from 'react';
import PropTypes from 'prop-types';
import CodeBlock from './CodeBlock';
import MessageStatus from './MessageStatus';

const Message = React.memo(({ message, onRetry }) => {
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

  const isUser = message.sender === 'user';
  const containerClasses = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
  const messageClasses = `max-w-[70%] rounded-lg p-4 ${
    isUser
      ? 'bg-purple-600 text-white rounded-br-none'
      : 'bg-gray-100 text-gray-900 rounded-bl-none'
  }`;

  return (
    <div className={containerClasses}>
      <div className="flex flex-col">
        <div className={messageClasses}>
          {renderMessage(message.content)}
          {message.model && (
            <div className="mt-2 text-xs opacity-70">
              使用模型: {message.model}
            </div>
          )}
        </div>
        {message.status && (
          <MessageStatus
            status={message.status}
            error={message.error}
            onRetry={() => onRetry?.(message)}
          />
        )}
      </div>
    </div>
  );
});

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(['user', 'ai']).isRequired,
    model: PropTypes.string,
    status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'error']),
    error: PropTypes.string
  }).isRequired,
  onRetry: PropTypes.func
};

Message.displayName = 'Message';

export default Message; 