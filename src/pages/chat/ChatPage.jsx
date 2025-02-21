import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, SYSTEM_PROMPTS, EXPORT_FORMATS } from '../../config/api';
import { sendMessageToAI } from '../../services/aiService';
import { exportChat, generateShareLink, copyToClipboard, searchChatHistory } from '../../utils/chatUtils';
import { getBalance, getUsageStats, createRechargeOrder, checkOrderStatus, calculateMessageCost, checkBalanceSufficient, updateUsageStats } from '../../services/billingService';
import { websocketService } from '../../services/websocketService';
import BillingCard from '../../components/billing/BillingCard';
import RechargeModal from '../../components/billing/RechargeModal';
import ChatHistory from '../../components/chat/ChatHistory';
import { createWechatPayOrder, createAlipayOrder, checkPaymentStatus } from '../../services/paymentService';
import { saveChat, getChat } from '../../services/chatHistoryService';

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
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

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

  // 加载对话历史
  const loadChatHistory = useCallback((chatId) => {
    if (!chatId) return;
    const chat = getChat(chatId);
    if (chat) {
      setMessages(chat.messages || []);
      setShowPrompts(false);
      setCurrentChatId(chatId);
    }
  }, []);

  // 保存当前对话
  const saveCurrentChat = useCallback(async () => {
    if (messages.length === 0) return;

    const chatData = {
      id: currentChatId,
      messages,
      title: messages[0]?.content.slice(0, 50) + '...',
      model: selectedModel.id
    };

    const chatId = await saveChat(chatData);
    if (!currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [messages, currentChatId, selectedModel]);

  // 监听消息变化,自动保存
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
  }, [messages, saveCurrentChat]);

  // 事件处理
  const handleModelChange = useCallback((e) => {
    const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
    if (model) {
      setSelectedModel(model);
      localStorage.setItem('lastUsedModel', model.id);
    }
  }, []);

  useEffect(() => {
    // 连接WebSocket
    websocketService.connect();

    // 添加消息处理器
    const handleWebSocketMessage = (data) => {
      if (data.type === 'message') {
        // 处理接收到的消息
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now(),
          role: 'assistant',
          content: data.content
        }]);
      }
    };

    websocketService.addMessageHandler(handleWebSocketMessage);

    // 清理函数
    return () => {
      websocketService.removeMessageHandler(handleWebSocketMessage);
      websocketService.disconnect();
    };
  }, []);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      setShowPrompts(false);

      // 添加用户消息到消息列表
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: message,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      // 检查余额是否足够
      const estimatedCost = calculateMessageCost(message, selectedModel);
      const hasSufficientBalance = await checkBalanceSufficient(estimatedCost);
      
      if (!hasSufficientBalance) {
        setError('余额不足，请充值后继续使用');
        setShowRechargeModal(true);
        return;
      }

      // 通过WebSocket发送消息
      websocketService.sendMessage({
        type: 'chat',
        content: message,
        modelId: selectedModel.id,
        messageHistory: messages.slice(-10) // 只发送最近10条消息作为上下文
      });

      // 等待AI响应
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('请求超时，请重试'));
        }, 30000); // 30秒超时

        const messageHandler = (data) => {
          if (data.type === 'chat_response') {
            clearTimeout(timeout);
            websocketService.removeMessageHandler(messageHandler);
            resolve(data);
          }
        };

        websocketService.addMessageHandler(messageHandler);
      });

      // 添加AI响应到消息列表
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        sender: 'ai',
        model: selectedModel.name
      };
      setMessages(prev => [...prev, aiMessage]);

      // 更新使用统计
      if (response.usage) {
        await updateUsageStats(response.usage);
        const newUsageStats = await getUsageStats();
        setUsage(newUsageStats);
        
        // 更新余额
        const newBalance = await getBalance();
        setBalance(newBalance);
      }

      // 保存对话
      await saveCurrentChat();

    } catch (error) {
      console.error('发送消息失败:', error);
      setError(error.message || '发送消息失败，请重试');
      
      // 添加错误消息到消息列表
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `发生错误: ${error.message || '请求失败，请重试'}`,
        sender: 'ai',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleQuickPrompt = useCallback((prompt) => {
    setInputMessage(prompt.title);
    handleSendMessage();
  }, [handleSendMessage]);

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

  const handleRecharge = async (data) => {
    try {
      let orderResult;
      if (data.paymentMethod === 'wechat') {
        orderResult = await createWechatPayOrder(data.amount);
      } else if (data.paymentMethod === 'alipay') {
        orderResult = await createAlipayOrder(data.amount);
      }
      
      // TODO: 处理支付结果
      console.log('支付订单创建成功:', orderResult);
      
    } catch (error) {
      console.error('创建支付订单失败:', error);
    }
  };

  // 处理新对话
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setShowPrompts(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 */}
      <div className={`w-64 bg-white border-r border-gray-200 flex flex-col ${showSidebar ? '' : 'hidden'}`}>
        <ChatHistory
          onSelectChat={loadChatHistory}
          selectedChatId={currentChatId}
          onNewChat={handleNewChat}
        />
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">AI Chat</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedModel.id}
              onChange={handleModelChange}
              className="form-select rounded-lg border-gray-300 text-sm"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 flex">
          {/* 聊天消息区域 */}
          <div className="flex-1 flex flex-col">
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

          {/* 右侧账单信息 */}
          <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            <BillingCard />
          </div>
        </div>
      </div>

      {/* 充值模态框 */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </div>
  );
};

export default ChatPage;