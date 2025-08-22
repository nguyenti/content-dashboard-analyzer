import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  TrendingUp, 
  Linkedin, 
  Youtube, 
  Instagram,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Menu size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                <span className="text-xl text-gray-800 font-normal">Content Analytics</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const navigationItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/content', icon: FileText, label: 'Content' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <span className="text-xl text-gray-800 font-normal">Analytics</span>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <Linkedin className="text-blue-600" size={14} />
              <Youtube className="text-red-500" size={14} />
              <Instagram className="text-pink-500" size={14} />
            </div>
            <span className="text-xs text-blue-700 font-medium">3 accounts connected</span>
          </div>
        </div>
      </div>
      
      <nav className="px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">
            Powered by Claude AI
          </div>
          <p className="text-xs text-gray-500">
            Intelligent content insights
          </p>
        </div>
      </div>
    </div>
  );
}