import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import Mindfulness from './pages/Mindfulness';
import Test from './pages/Test';
import SOS from './pages/SOS';
import Profile from './pages/Profile';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const user = StorageService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading MindBase...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Auth onLogin={handleLogin} /> : <Navigate to="/chat" />} 
        />
        
        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/mindfulness" element={<Mindfulness />} />
          <Route path="/test" element={<Test />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="*" element={<Navigate to="/chat" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;