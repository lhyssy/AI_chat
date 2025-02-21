import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/auth/PrivateRoute';
import { ROUTES } from './config/constants';

// 页面组件
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/auth/ProfilePage';

// 样式
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 公开路由 */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            
            {/* 受保护路由 */}
            <Route
              path={ROUTES.CHAT}
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
