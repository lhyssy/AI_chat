import sgMail from '@sendgrid/mail';
import apiClient from './apiService';

sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

export const sendVerificationEmail = async (email, code) => {
  try {
    const msg = {
      to: email,
      from: 'noreply@your-domain.com', // 替换为您已验证的发件人邮箱
      subject: '验证码 - AI Chat',
      text: `您的验证码是: ${code}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>AI Chat 验证码</h1>
          <p>您好，</p>
          <p>您的验证码是：</p>
          <h2 style="color: #4CAF50; font-size: 24px; padding: 10px; background: #f5f5f5; text-align: center;">
            ${code}
          </h2>
          <p>验证码有效期为10分钟。</p>
          <p>如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: 'noreply@your-domain.com',
      subject: '密码重置 - AI Chat',
      text: `请点击以下链接重置密码: ${resetUrl}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>AI Chat 密码重置</h1>
          <p>您好，</p>
          <p>您请求了密码重置。请点击以下按钮重置密码：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              重置密码
            </a>
          </div>
          <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
          <p>${resetUrl}</p>
          <p>链接有效期为1小时。</p>
          <p>如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('发送重置密码邮件失败:', error);
    throw error;
  }
}; 