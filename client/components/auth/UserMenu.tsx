import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './UserMenu.module.css';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626'; // Red
      case 'user': return '#059669';  // Green  
      case 'viewer': return '#7c3aed'; // Purple
      default: return '#6b7280';      // Gray
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.name || user.email}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {getInitials(user.name, user.email)}
          </div>
        )}
        
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user.name || user.email}
          </span>
          <span 
            className={styles.roleBadge}
            style={{ backgroundColor: getRoleBadgeColor(user.role) }}
          >
            {user.role}
          </span>
        </div>

        <svg 
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.menu}>
            <div className={styles.userDetails}>
              <div className={styles.email}>{user.email}</div>
              <div className={styles.joinDate}>
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
              {user.last_login && (
                <div className={styles.lastLogin}>
                  Last login: {new Date(user.last_login).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className={styles.divider} />
            
            <button 
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile/settings if you have those pages
              }}
            >
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>

            <button 
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings if you have that page
              }}
            >
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            
            <div className={styles.divider} />
            
            <button 
              className={`${styles.menuItem} ${styles.logoutItem}`}
              onClick={handleLogout}
            >
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};