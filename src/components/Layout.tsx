import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Book, 
  Wind, 
  Activity, 
  Phone, 
  User, 
  LogOut, 
  Menu, 
  X,
  BrainCircuit
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface LayoutProps {
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    StorageService.logout();
    onLogout();
    navigate('/');
  };

  const navItems = [
    { to: '/chat', label: 'Chat Companion', icon: MessageSquare },
    { to: '/journal', label: 'Mood Journal', icon: Book },
    { to: '/mindfulness', label: 'Mindfulness', icon: Wind },
    { to: '/test', label: 'Assessment', icon: Activity },
    { to: '/sos', label: 'Emergency (SOS)', icon: Phone, alert: true },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden font-sans">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-md shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-surface shadow-xl transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-700 flex items-center space-x-3">
            <BrainCircuit className="text-primary" size={32} />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              MindBase
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}
                  ${item.alert ? 'text-red-400 hover:text-red-300' : ''}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-background">
        <div className="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8 min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;