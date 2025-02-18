import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, SYSTEM_PROMPTS, EXPORT_FORMATS } from '../../config/api';
import { sendMessageToAI } from '../../services/aiService';
import { exportChat, generateShareLink, copyToClipboard, searchChatHistory, formatDateTime } from '../../utils/chatUtils';

// 提取 QuickPrompt 组件为独立组件以优化性能
const QuickPrompt = React.memo(({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full group hover:scale-[1.02] relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <div className="w-12 h-12 mb-4 text-gray-600 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-2.5 group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
));

// 提取消息组件为独立组件
const Message = React.memo(({ message }) => (
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
      <div className="text-base whitespace-pre-wrap">{message.content}</div>
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
));

// 提取历史记录项组件
const HistoryItem = React.memo(({ item, onSelect, onExport, onShare }) => (
  <div className="relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
    <div onClick={onSelect} className="p-3 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
          {item.model}
        </span>
      </div>
      <p className="text-xs text-gray-500">{formatDateTime(item.timestamp)}</p>
      <p className="text-sm text-gray-700 line-clamp-2 mt-1">{item.preview}</p>
    </div>
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={onExport}
        className="p-1 text-gray-500 hover:text-purple-600 rounded"
        title="导出对话"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button
        onClick={onShare}
        className="p-1 text-gray-500 hover:text-purple-600 rounded ml-1"
        title="分享对话"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>
  </div>
));

// 提取加载指示器组件
const LoadingIndicator = React.memo(() => (
  <div className="flex items-center justify-center text-gray-500 my-6">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse"></div>
      </div>
    </div>
    <div className="ml-3 flex flex-col">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-medium">
        AI 正在思考中...
      </span>
      <span className="text-xs text-gray-500 mt-1">
        使用模型: {selectedModel?.name}
      </span>
    </div>
  </div>
));

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 加载上次使用的模型
    const lastUsedModelId = localStorage.getItem('lastUsedModel');
    if (lastUsedModelId) {
      const model = AVAILABLE_MODELS.find(m => m.id === lastUsedModelId);
      if (model) {
        setSelectedModel(model);
      }
    }

    // 加载聊天历史记录
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  const quickPrompts = [
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "写一个待办事项清单",
      description: "为个人项目或任务制定清单"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "生成邮件回复",
      description: "回复工作邮件"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "总结文章或文本",
      description: "为我总结一段文字"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "AI 工作原理",
      description: "了解 AI 的技术能力"
    }
  ];

  const addToHistory = (message) => {
    const historyItem = {
      id: Date.now(),
      model: selectedModel.name,
      preview: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [historyItem, ...prev]);
    // 保存到localStorage
    localStorage.setItem('chatHistory', JSON.stringify([historyItem, ...chatHistory]));
  };

  // 使用 useMemo 优化过滤历史记录
  const filteredHistoryMemo = useMemo(() => {
    return searchChatHistory(chatHistory, searchTerm);
  }, [chatHistory, searchTerm]);

  // 使用 useCallback 优化事件处理函数
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    setShowPrompts(false);
    setError('');

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      file: selectedFile
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const messageHistory = messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
        .slice(-10);

      const aiResponse = await sendMessageToAI(inputMessage, selectedModel.id, messageHistory);
      
      if (!aiResponse) {
        throw new Error('未收到AI的回复');
      }

      const aiMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedModel.name
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // 生成对话标题
      const title = await generateTitle(finalMessages);
      
      // 保存对话历史
      const chatId = Date.now();
      const chatData = {
        messages: finalMessages,
        title,
        id: chatId,
        model: selectedModel.name,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
      
      // 更新历史记录列表
      const historyItem = {
        id: chatId,
        title,
        model: selectedModel.name,
        preview: inputMessage.substring(0, 50) + (inputMessage.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [historyItem, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

    } catch (error) {
      console.error('Error getting AI response:', error);
      setError(error.message || '请稍后重试');
      const errorMessage = {
        id: Date.now() + 1,
        content: `抱歉，发生了错误：${error.message || '请稍后重试'}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, selectedFile, messages, selectedModel, chatHistory]);

  const handleModelChange = useCallback((e) => {
    const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
    setSelectedModel(model);
    localStorage.setItem('lastUsedModel', e.target.value);
  }, []);

  // 使用 useEffect 优化滚动行为
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Enter 发送消息
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSendMessage(e);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleSendMessage]);

  // 添加自动保存草稿功能
  useEffect(() => {
    const saveDraft = () => {
      if (inputMessage.trim()) {
        localStorage.setItem('messageDraft', inputMessage);
      } else {
        localStorage.removeItem('messageDraft');
      }
    };

    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [inputMessage]);

  // 加载保存的草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem('messageDraft');
    if (savedDraft) {
      setInputMessage(savedDraft);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt.description);
    setShowPrompts(false);
  };

  const clearHistory = () => {
    // 清除所有聊天记录
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chat_')) {
        localStorage.removeItem(key);
      }
    });
    // 清除历史记录列表
    localStorage.removeItem('chatHistory');
    setChatHistory([]);
  };

  // 自动生成对话标题
  const generateTitle = async (messages) => {
    try {
      const conversationSummary = messages
        .map(msg => msg.content)
        .join('\n');
      
      const titleResponse = await sendMessageToAI(
        conversationSummary,
        selectedModel.id,
        [{ role: 'system', content: SYSTEM_PROMPTS.TITLE_GENERATOR }]
      );

      return titleResponse || '新对话';
    } catch (error) {
      console.error('Error generating title:', error);
      return '新对话';
    }
  };

  // 处理导出
  const handleExport = async (format) => {
    if (!selectedChat) return;
    
    const chatData = JSON.parse(localStorage.getItem(`chat_${selectedChat.id}`) || '[]');
    exportChat(chatData, selectedChat.title, format);
    setShowExportModal(false);
  };

  // 处理分享
  const handleShare = async (chatId) => {
    const shareLink = generateShareLink(chatId);
    const success = await copyToClipboard(shareLink);
    
    if (success) {
      // 显示成功提示
      alert('分享链接已复制到剪贴板！');
    } else {
      alert('复制失败，请手动复制链接');
    }
  };

  return (
    <div className="flex flex-col h-screen hardware-accelerated">
      {/* 主内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧边栏 */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 space-y-4">
            {/* 模型选择下拉框 */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择模型</label>
              <select
                value={selectedModel.id}
                onChange={handleModelChange}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(MODEL_CATEGORIES).map(([key, categoryName]) => (
                  <optgroup key={key} label={categoryName}>
                    {AVAILABLE_MODELS
                      .filter(model => model.category === categoryName)
                      .map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{selectedModel.description}</p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
          
          {/* 搜索框 */}
          <div className="px-4 py-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索对话历史..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 历史对话列表 */}
          <div className="flex-1 overflow-y-auto p-4 scroll-container custom-scrollbar-optimize">
            <div className="space-y-3">
              {filteredHistoryMemo.map(item => (
                <div 
                  key={item.id}
                  className="message-appear-optimize scroll-item"
                >
                  <HistoryItem
                    item={item}
                    onSelect={() => {
                      const chatData = JSON.parse(localStorage.getItem(`chat_${item.id}`));
                      if (chatData) {
                        setMessages(chatData.messages);
                        setShowPrompts(false);
                      }
                    }}
                    onExport={() => {
                      setSelectedChat(item);
                      setShowExportModal(true);
                    }}
                    onShare={() => handleShare(item.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={clearHistory}
              className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              清除历史记录
            </button>
          </div>
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          {/* 消息列表 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {showPrompts ? (
              <div className="max-w-3xl mx-auto">
                <div className="mb-12 text-center">
                  <h1 className="text-5xl font-bold mb-4 tracking-tight">
                    Hi there, {' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
                      John
                    </span>
                  </h1>
                  <h2 className="text-4xl font-semibold mb-6">
                    What{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
                      would you like to know
                    </span>
                    ?
                  </h2>
                  <p className="text-lg text-gray-600">
                    使用下方的常用提示或输入您自己的问题
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {quickPrompts.map((prompt, index) => (
                    <QuickPrompt
                      key={index}
                      {...prompt}
                      onClick={() => handlePromptClick(prompt)}
                    />
                  ))}
                </div>
              </div>
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

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-200 animate-gpu">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                className="flex-1 p-2 border rounded-lg input-optimize"
                placeholder="输入消息..."
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`px-4 py-2 rounded-lg button-optimize hover-scale-optimize ${
                  isLoading ? 'bg-gray-400' : 'bg-purple-600'
                } text-white`}
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
          </div>
        </div>
      </div>

      {/* 快捷提示区域 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar-optimize">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full whitespace-nowrap hover-scale-optimize"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 right-4 p-4 bg-red-100 text-red-700 rounded-lg error-state-optimize">
          {error}
        </div>
      )}

      {/* 移动端优化 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white mobile-optimize">
        {/* 移动端的额外控件 */}
      </div>

      {/* 导出模态框 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">导出对话</h3>
            <div className="space-y-3">
              {Object.values(EXPORT_FORMATS).map(format => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                >
                  导出为 {format.toUpperCase()} 格式
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// LoadingSpinner 组件
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

export default React.memo(ChatPage); 