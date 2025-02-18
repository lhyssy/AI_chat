import { EXPORT_FORMATS } from '../config/api';

// 生成导出文件名
export const generateExportFileName = (title, format) => {
  const date = new Date().toISOString().split('T')[0];
  return `${title || 'chat'}-${date}.${format}`;
};

// 将对话导出为不同格式
export const exportChat = (messages, title, format) => {
  let content = '';
  const fileName = generateExportFileName(title, format);

  switch (format) {
    case EXPORT_FORMATS.MARKDOWN:
      content = `# ${title || '对话记录'}\n\n` +
        messages.map(msg => {
          const role = msg.sender === 'user' ? '用户' : 'AI';
          const model = msg.model ? `(使用模型: ${msg.model})` : '';
          return `## ${role} ${model}\n${msg.content}\n`;
        }).join('\n');
      break;

    case EXPORT_FORMATS.TXT:
      content = `${title || '对话记录'}\n\n` +
        messages.map(msg => {
          const role = msg.sender === 'user' ? '用户' : 'AI';
          const model = msg.model ? `(使用模型: ${msg.model})` : '';
          return `${role} ${model}:\n${msg.content}\n`;
        }).join('\n');
      break;

    case EXPORT_FORMATS.JSON:
    default:
      content = JSON.stringify({
        title,
        timestamp: new Date().toISOString(),
        messages: messages
      }, null, 2);
      break;
  }

  // 创建并下载文件
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 生成分享链接
export const generateShareLink = (chatId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/chat/share/${chatId}`;
};

// 复制文本到剪贴板
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// 搜索对话历史
export const searchChatHistory = (history, searchTerm) => {
  if (!searchTerm) return history;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return history.filter(item => 
    item.title?.toLowerCase().includes(lowerSearchTerm) ||
    item.preview.toLowerCase().includes(lowerSearchTerm)
  );
};

// 格式化日期时间
export const formatDateTime = (timestamp) => {
  if (!timestamp) {
    return '未知时间';
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return '无效时间';
    }
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('格式化时间错误:', error);
    return '无效时间';
  }
}; 