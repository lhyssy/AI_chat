import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BillingProvider } from './contexts/BillingContext';
import Navbar from './components/layout/Navbar';
import ChatPage from './pages/chat/ChatPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
import SettingsPage from './pages/user/SettingsPage';
import RechargePage from './pages/billing/RechargePage';
import PrivateRoute from './components/auth/PrivateRoute';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BillingProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recharge"
                element={
                  <PrivateRoute>
                    <RechargePage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </BillingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
