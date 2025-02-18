import React, { useState, useEffect } from 'react';
import { CHAT_CATEGORIES, getAllChats, searchChats, deleteChats, toggleChatStar, getAllTags } from '../../services/chatHistoryService';

const ChatHistory = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // 加载对话列表
  useEffect(() => {
    loadChats();
    setAvailableTags(getAllTags());
  }, []);

  // 加载对话
  const loadChats = () => {
    try {
      const filters = {
        category: selectedCategory,
        tags: selectedTags,
        starred: showStarredOnly
      };
      const filteredChats = searchChats(searchQuery, filters);
      setChats(filteredChats);
    } catch (error) {
      console.error('加载对话失败:', error);
    }
  };

  // 监听筛选条件变化
  useEffect(() => {
    loadChats();
  }, [searchQuery, selectedCategory, selectedTags, showStarredOnly]);

  // 处理对话选择
  const handleChatSelect = (chatId) => {
    onSelectChat(chatId);
  };

  // 处理批量选择
  const handleBulkSelect = (chatId) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        return prev.filter(id => id !== chatId);
      }
      return [...prev, chatId];
    });
  };

  // 处理批量删除
  const handleBulkDelete = async () => {
    if (window.confirm('确定要删除选中的对话吗？')) {
      try {
        await deleteChats(selectedChats);
        setSelectedChats([]);
        loadChats();
      } catch (error) {
        console.error('批量删除失败:', error);
      }
    }
  };

  // 处理导出
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const exportData = await exportChats(selectedChats, format);
      const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chats_export_${new Date().toISOString()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索和过滤区域 */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索对话..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">所有分类</option>
            {Object.entries(CHAT_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>

          <div className="flex-1 flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowStarredOnly(prev => !prev)}
            className={`p-2 rounded-lg ${
              showStarredOnly ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedChats.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            已选择 {selectedChats.length} 个对话
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              导出 JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={isExporting}
              className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              导出 Markdown
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              删除
            </button>
          </div>
        </div>
      )}

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              selectedChatId === chat.id ? 'bg-purple-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedChats.includes(chat.id)}
                onChange={() => handleBulkSelect(chat.id)}
                className="mt-1"
              />
              
              <div className="flex-1" onClick={() => handleChatSelect(chat.id)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{chat.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChatStar(chat.id).then(loadChats);
                    }}
                    className={`p-1 rounded-full ${
                      chat.starred ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
                
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {chat.preview}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {chat.category}
                  </span>
                  {chat.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>{new Date(chat.updatedAt).toLocaleString()}</span>
                  <span className="mx-2">·</span>
                  <span>{chat.messageCount} 条消息</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 