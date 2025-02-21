import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // 重定向到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户登录
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // 保存认证信息
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('登录失败:', error);
    throw new Error(error.response?.data?.message || '登录失败，请检查邮箱和密码');
  }
};

// 用户注册
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    // 保存认证信息
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('注册失败:', error);
    throw new Error(error.response?.data?.message || '注册失败，请稍后重试');
  }
};

// 发送验证码
export const sendVerificationCode = async (email) => {
  try {
    await api.post('/auth/send-verification-code', { email });
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw new Error(error.response?.data?.message || '发送验证码失败，请稍后重试');
  }
};

// 验证邮箱验证码
export const verifyEmailCode = async (email, code) => {
  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  } catch (error) {
    console.error('验证码验证失败:', error);
    throw new Error(error.response?.data?.message || '验证码验证失败');
  }
};

// 重置密码
export const resetPassword = async (email, code, newPassword) => {
  try {
    await api.post('/auth/reset-password', { email, code, newPassword });
  } catch (error) {
    console.error('重置密码失败:', error);
    throw new Error(error.response?.data?.message || '重置密码失败');
  }
};

// 更新用户信息
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    const updatedUser = response.data;
    
    // 更新本地存储的用户信息
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw new Error(error.response?.data?.message || '更新用户信息失败');
  }
};

// 更改密码
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  } catch (error) {
    console.error('更改密码失败:', error);
    throw new Error(error.response?.data?.message || '更改密码失败');
  }
};

// 退出登录
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('退出登录失败:', error);
  } finally {
    // 清除本地存储的认证信息
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 检查用户是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
}; 