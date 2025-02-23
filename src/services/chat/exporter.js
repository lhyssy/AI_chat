import { EXPORT_FORMATS } from './config';

export class ChatExporter {
  // 导出为JSON格式
  exportToJson(chats) {
    return JSON.stringify(chats, null, 2);
  }

  // 导出为Markdown格式
  exportToMarkdown(chats) {
    return chats.map(chat => {
      let markdown = `# ${chat.title}\n\n`;
      markdown += `- 创建时间：${new Date(chat.createdAt).toLocaleString()}\n`;
      markdown += `- 更新时间：${new Date(chat.updatedAt).toLocaleString()}\n`;
      markdown += `- 分类：${chat.category}\n`;
      
      if (chat.tags?.length) {
        markdown += `- 标签：${chat.tags.join(', ')}\n`;
      }
      
      markdown += '\n## 对话内容\n\n';
      
      chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? '我' : 'AI';
        markdown += `### ${role}\n\n${msg.content}\n\n`;
      });
      
      return markdown;
    }).join('\n---\n\n');
  }

  // 导出对话
  export(chats, format = EXPORT_FORMATS.JSON) {
    switch (format) {
      case EXPORT_FORMATS.JSON:
        return this.exportToJson(chats);
      case EXPORT_FORMATS.MARKDOWN:
        return this.exportToMarkdown(chats);
      default:
        throw new Error('不支持的导出格式');
    }
  }
} 