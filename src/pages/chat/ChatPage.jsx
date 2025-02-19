import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, SYSTEM_PROMPTS, EXPORT_FORMATS } from '../../config/api';
import { sendMessageToAI } from '../../services/aiService';
import { exportChat, generateShareLink, copyToClipboard, searchChatHistory } from '../../utils/chatUtils';
import { getBalance, getUsageStats, createRechargeOrder, checkOrderStatus, calculateMessageCost, checkBalanceSufficient } from '../../services/billingService';
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

  const handleQuickPrompt = useCallback((prompt) => {
    setInputMessage(prompt.title);
    handleSendMessage();
  }, []);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // 检查余额
    const estimatedCost = calculateMessageCost(inputMessage, selectedModel);
    try {
      const hasEnoughBalance = await checkBalanceSufficient(estimatedCost);
      if (!hasEnoughBalance) {
        setShowRechargeModal(true);
        return;
      }
    } catch (error) {
      console.warn('余额检查失败:', error);
      // 继续发送消息,不阻止用户使用
    }

    setIsLoading(true);
    setShowPrompts(false);

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await sendMessageToAI(inputMessage, selectedModel.id, messages);
      
      if (!response || !response.text) {
        throw new Error('AI 响应格式无效');
      }

      const aiMessage = {
        id: Date.now(),
        content: response.text,
        sender: 'ai',
        model: selectedModel.id,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 如果是新对话,保存对话
      if (!currentChatId) {
        saveCurrentChat();
      }
      
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          content: `抱歉，处理您的消息时出现错误：${error.message}`,
          sender: 'ai',
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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

  // 处理对话选择
  const handleSelectChat = (chatId) => {
    loadChatHistory(chatId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className={`w-80 flex flex-col ${showSidebar ? '' : 'hidden'}`}>
        {/* 对话历史 */}
        <div className="flex-1 overflow-hidden">
          <ChatHistory
            onSelectChat={handleSelectChat}
            selectedChatId={currentChatId}
            onNewChat={handleNewChat}
          />
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 顶部工具栏 */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4 justify-between">
          <button
            onClick={() => setShowSidebar(prev => !prev)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <select
              value={selectedModel.id}
              onChange={(e) => {
                const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
                setSelectedModel(model);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>

            {currentChatId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const chat = getChat(currentChatId);
                    if (chat) {
                      const blob = new Blob([JSON.stringify(chat, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `chat_${chat.title}_${new Date().toISOString()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="导出对话"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const chat = getChat(currentChatId);
                    if (chat) {
                      const url = `${window.location.origin}/chat/share/${chat.id}`;
                      navigator.clipboard.writeText(url).then(() => {
                        alert('分享链接已复制到剪贴板');
                      });
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="分享对话"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 消息列表 */}
        <ChatMessages
          showPrompts={showPrompts}
          messages={messages}
          isLoading={isLoading}
          onQuickPrompt={handleQuickPrompt}
          quickPrompts={quickPrompts}
          messagesEndRef={messagesEndRef}
        />

        {/* 输入区域 */}
        <ChatInput
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

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