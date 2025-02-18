import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, SYSTEM_PROMPTS, EXPORT_FORMATS } from '../../config/api';
import { sendMessageToAI } from '../../services/aiService';
import { exportChat, generateShareLink, copyToClipboard, searchChatHistory } from '../../utils/chatUtils';
import { getBalance, getUsageStats, createRechargeOrder, checkOrderStatus, calculateMessageCost, checkBalanceSufficient } from '../../services/billingService';
import BillingCard from '../../components/billing/BillingCard';
import RechargeModal from '../../components/billing/RechargeModal';

// 导入子组件
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { quickPrompts } from './constants';

const ChatPage = () => {
  // 状态管理
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [balance, setBalance] = useState(0);
  const [usage, setUsage] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 计算派生状态
  const filteredHistoryMemo = React.useMemo(() => {
    if (!searchTerm) return chatHistory;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return chatHistory.filter(item => 
      item.title?.toLowerCase().includes(lowerSearchTerm) ||
      item.preview?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, chatHistory]);

  // 加载聊天历史
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        // 从localStorage获取所有聊天记录
        const history = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('chat_')) {
            const chatData = JSON.parse(localStorage.getItem(key));
            if (chatData) {
              history.push({
                id: key.replace('chat_', ''),
                title: chatData.title || '未命名对话',
                preview: chatData.messages?.[0]?.content || '',
                timestamp: chatData.timestamp || new Date().toISOString(),
                messageCount: chatData.messages?.length || 0
              });
            }
          }
        }
        // 按时间倒序排序
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setChatHistory(history);
      } catch (error) {
        console.error('加载聊天历史失败:', error);
        setError('加载聊天历史失败');
      }
    };

    loadChatHistory();
  }, []);

  // 副作用
  useEffect(() => {
    // 滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 加载上次使用的模型
    const lastModel = localStorage.getItem('lastUsedModel');
    if (lastModel) {
      const model = AVAILABLE_MODELS.find(m => m.id === lastModel);
      if (model) setSelectedModel(model);
    }
  }, []);

  useEffect(() => {
    // 获取账户余额和使用统计
    const fetchBillingInfo = async () => {
      try {
        const [balanceData, usageData] = await Promise.all([
          getBalance(),
          getUsageStats()
        ]);
        setBalance(balanceData);
        setUsage(usageData);
      } catch (err) {
        setError('获取账户信息失败');
      }
    };
    fetchBillingInfo();
  }, []);

  // 事件处理
  const handleModelChange = useCallback((e) => {
    const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
    if (model) {
      setSelectedModel(model);
      localStorage.setItem('lastUsedModel', model.id);
    }
  }, []);

  const handleQuickPrompt = useCallback((prompt) => {
    setInputMessage(prompt.title);
    setShowPrompts(false);
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setShowPrompts(false);

    const newMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage('');

    try {
      // 尝试检查余额，如果失败也允许发送消息
      try {
        const estimatedCost = calculateMessageCost(inputMessage, selectedModel);
        const isBalanceSufficient = await checkBalanceSufficient(estimatedCost);
        if (!isBalanceSufficient) {
          console.warn('余额不足，但仍继续处理消息');
        }
      } catch (balanceError) {
        console.warn('检查余额失败:', balanceError);
      }

      const response = await sendMessageToAI(inputMessage, selectedModel.id, messages);
      const aiMessage = {
        id: Date.now(),
        content: response.text,
        sender: 'ai',
        model: selectedModel.name,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // 保存对话到本地存储
      const chatId = `chat_${Date.now()}`;
      const chatData = {
        id: chatId,
        title: inputMessage.slice(0, 20) + (inputMessage.length > 20 ? '...' : ''),
        messages: finalMessages,
        timestamp: new Date().toISOString(),
        modelId: selectedModel.id
      };
      localStorage.setItem(chatId, JSON.stringify(chatData));

      // 更新聊天历史
      setChatHistory(prev => [{
        id: chatId,
        title: chatData.title,
        preview: inputMessage,
        timestamp: chatData.timestamp,
        messageCount: finalMessages.length
      }, ...prev]);

    } catch (err) {
      console.error('发送消息错误:', err);
      setError(err.message || '发送消息失败，请重试');
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: '抱歉，处理您的消息时出现错误。请重试。',
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, selectedModel, messages]);

  const handleFileSelect = useCallback(async (files) => {
    setUploadError('');
    // 处理文件上传逻辑...
  }, []);

  const handleFileError = useCallback((error) => {
    setUploadError(error);
  }, []);

  const handleResizeMouseDown = useCallback((e) => {
    setIsDragging(true);
    // 处理拖拽调整大小逻辑...
  }, []);

  const handleExport = useCallback(async (format) => {
    try {
      await exportChat(messages, format);
      setShowExportModal(false);
    } catch (err) {
      setError('导出失败，请重试');
    }
  }, [messages]);

  const handleRecharge = useCallback(async (amount) => {
    try {
      const order = await createRechargeOrder(amount);
      // 处理充值订单...
    } catch (err) {
      setError('创建充值订单失败');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen hardware-accelerated">
      {/* 主内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧边栏 */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <BillingCard
            balance={balance}
            usage={usage}
            onRecharge={() => setShowRechargeModal(true)}
          />
          
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
          
          {/* 搜索框和历史记录列表 */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索对话历史..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 scroll-container custom-scrollbar-optimize">
              <div className="space-y-3">
                {filteredHistoryMemo.map(item => (
                  <div 
                    key={item.id}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer message-appear-optimize scroll-item"
                    onClick={() => {
                      const chatData = JSON.parse(localStorage.getItem(`chat_${item.id}`));
                      if (chatData) {
                        setMessages(chatData.messages);
                        setShowPrompts(false);
                      }
                    }}
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{item.preview}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.messageCount} 条消息
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <ChatMessages
            showPrompts={showPrompts}
            messages={messages}
            isLoading={isLoading}
            onQuickPrompt={handleQuickPrompt}
            quickPrompts={quickPrompts}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            showFileUpload={showFileUpload}
            onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
            onFileSelect={handleFileSelect}
            onFileError={handleFileError}
            uploadError={uploadError}
            isDragging={isDragging}
            onResizeMouseDown={handleResizeMouseDown}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 right-4 p-4 bg-red-100 text-red-700 rounded-lg error-state-optimize">
          {error}
        </div>
      )}

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

      {/* 充值模态框 */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRecharge={handleRecharge}
      />
    </div>
  );
};

export default React.memo(ChatPage);