import React, { useRef, useCallback } from 'react';
import FileUpload from '../../../components/chat/FileUpload';

const ChatInput = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  isLoading,
  showFileUpload,
  onToggleFileUpload,
  onFileSelect,
  onFileError,
  uploadError,
  isDragging,
  onResizeMouseDown,
}) => {
  const textareaRef = useRef(null);

  const handleTextareaChange = useCallback((e) => {
    onInputChange(e.target.value);
  }, [onInputChange]);

  return (
    <div className="p-4 border-t border-gray-200 animate-gpu">
      <div className="flex flex-col gap-2">
        {/* 拖拽调整高度的手柄 */}
        <div 
          className={`resize-handle w-full flex items-center justify-center transition-all duration-200 ${
            isDragging ? 'active' : ''
          }`}
          onMouseDown={onResizeMouseDown}
          onMouseEnter={() => {
            if (textareaRef.current) {
              textareaRef.current.classList.add('resize-hover');
            }
          }}
          onMouseLeave={() => {
            if (textareaRef.current) {
              textareaRef.current.classList.remove('resize-hover');
            }
          }}
        >
          <div className={`resize-handle-bar transition-all duration-200 ${isDragging ? 'active' : ''}`} />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onToggleFileUpload}
            className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
            title="上传文件"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onSendMessage(e);
              }
            }}
            className={`chat-input flex-1 p-3 border rounded-lg resize-none transition-all duration-200 ${
              isDragging ? 'dragging shadow-lg' : ''
            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            placeholder="输入消息,按Enter发送,Shift+Enter换行..."
            style={{ 
              minHeight: '50px', 
              maxHeight: '400px',
              lineHeight: '1.5',
              overflowY: 'auto',
              transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`px-4 py-2 rounded-lg button-optimize hover-scale-optimize ${
              isLoading ? 'bg-gray-400' : 'bg-purple-600'
            } text-white self-end`}
          >
            {isLoading ? (
              <div className="spin-optimize">
                <LoadingSpinner />
              </div>
            ) : (
              '发送'
            )}
          </button>
        </div>

        {showFileUpload && (
          <div className="mt-2">
            <FileUpload
              onFileSelect={onFileSelect}
              onError={onFileError}
            />
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg
    className="w-5 h-5 text-white icon-optimize"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default React.memo(ChatInput);