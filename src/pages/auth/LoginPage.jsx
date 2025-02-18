import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string().email('无效的邮箱地址').required('请输入邮箱'),
    password: Yup.string().required('请输入密码'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitError('');
      // TODO: 调用登录 API
      console.log(values);
      
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 登录成功后跳转到主页
      // TODO: 保存登录状态和token
      navigate('/chat');
    } catch (error) {
      setSubmitError(error.message || '登录失败，请检查邮箱和密码是否正确');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-600 justify-center items-center">
        <div className="max-w-md text-white p-12">
          <h1 className="text-4xl font-bold mb-4">欢迎回来</h1>
          <p className="text-lg mb-8 text-purple-100">登录您的账号，继续智能对话之旅</p>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-purple-100">智能对话</h3>
                <p className="text-sm text-purple-200">实时响应，自然交流</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-purple-100">安全可靠</h3>
                <p className="text-sm text-purple-200">数据加密，隐私保护</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">登录账号</h2>
            <p className="mt-2 text-sm text-gray-600">
              还没有账号？
              <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                立即注册
              </Link>
            </p>
          </div>

          {/* 错误提示 */}
          {submitError && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, getFieldProps }) => (
              <Form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      邮箱地址
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="email"
                        type="email"
                        {...getFieldProps('email')}
                        className={`block w-full px-4 py-3 rounded-lg border ${
                          errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                        } bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                        disabled={isSubmitting}
                      />
                      {errors.email && touched.email && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      密码
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        type="password"
                        {...getFieldProps('password')}
                        className={`block w-full px-4 py-3 rounded-lg border ${
                          errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                        } bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                        disabled={isSubmitting}
                      />
                      {errors.password && touched.password && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.password && touched.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors duration-200"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        记住我
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200">
                        忘记密码？
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                      isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        登录中...
                      </div>
                    ) : '登录'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 