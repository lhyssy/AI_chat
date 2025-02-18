import React from 'react';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import QuickPrompts from './QuickPrompts';

const ChatMessages = ({
  showPrompts,
  messages,
  isLoading,
  onQuickPrompt,
  quickPrompts,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {showPrompts ? (
        <QuickPrompts
          quickPrompts={quickPrompts}
          onQuickPrompt={onQuickPrompt}
        />
      ) : (
        <>
          {messages.map(message => (
            <Message
              key={message.id}
              message={message}
            />
          ))}
          {isLoading && (
            <LoadingIndicator />
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default React.memo(ChatMessages);