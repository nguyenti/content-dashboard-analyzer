import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import './Layout.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/content', icon: FileText, label: 'Content' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        {children}
      </main>
    </div>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="headerContent">
          <div className="logoSection">
            <div className="logoGradient"></div>
            <span className="logoText">Analytics</span>
          </div>
          <nav className="nav">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `navLink ${
                    isActive
                      ? 'active'
                      : 'inactive'
                  }`
                }
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="searchInput">
            <Search size={18} className="searchIcon" />
            <input
              type="text"
              placeholder="Search..."
            />
          </div>
          <button className="actionButton">
            <Bell size={20} className="bellIcon" />
          </button>
          <UserMenu />
          <div className="mobileMenuToggle">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="actionButton"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobileMenu">
          <nav className="mobileNav">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `mobileNavLink ${
                    isActive
                      ? 'active'
                      : 'inactive'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Layout;