import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  TrendingUp, 
  Linkedin, 
  Youtube, 
  Instagram 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
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
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Content Dashboard</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Linkedin size={16} />
          <Youtube size={16} />
          <Instagram size={16} />
        </div>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            AI-powered content analysis for social media optimization
          </p>
        </div>
      </div>
    </div>
  );
}