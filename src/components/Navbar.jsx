import React, { useState } from 'react';
import { Moon, Sun, LogOut, Settings, Menu, X, Home, BookOpen, Trophy, FileText, MessageSquare, User, ChevronRight } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ activeView, onViewChange, currentUser, onLogout, theme, onToggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'dictionary', label: 'Sổ tay văn hóa' },
    { id: 'community', label: 'Senpai - Kouhai' },
  ];

  const handleLinkClick = (viewId) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  const getRoleLabel = (user) => {
    if (!user) return '';
    if (user.isAdmin) return 'QUẢN TRỊ VIÊN';
    if (user.isSenpai) return 'SENPAI';
    return 'HỌC VIÊN';
  };

  const getNavIcon = (itemId) => {
    switch (itemId) {
      case 'home': return <Home size={18} className={styles.navLinkIcon} />;
      case 'dictionary': return <BookOpen size={18} className={styles.navLinkIcon} />;


      case 'community': return <MessageSquare size={18} className={styles.navLinkIcon} />;
      case 'profile': return <User size={18} className={styles.navLinkIcon} />;
      case 'admin': return <Settings size={18} className={styles.navLinkIcon} />;
      default: return null;
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Mobile Menu Button Left */}
        {currentUser && (
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Logo Left */}
        <a
          href="#home"
          className={styles.logo}
          onClick={(e) => { e.preventDefault(); handleLinkClick(currentUser ? 'home' : 'auth'); }}
        >
          <img src="/logo.png" alt="7UP Logo" className={styles.brandIcon} />
          <span>From Uni to Japan</span>
        </a>

        {/* Menu Center */}
        {currentUser && (
          <ul className={`${styles.menu} ${isMobileMenuOpen ? styles.menuMobileOpen : ''}`}>
            {/* Mobile User Header */}
            <li className={styles.mobileOnlyItem} style={{ width: '100%' }}>
              <div className={styles.menuUserHeader}>
                <div className={styles.menuAvatar}>
                  {currentUser.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
                    <img src={currentUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    currentUser.avatar || '🧑‍💻'
                  )}
                </div>
                <div className={styles.menuUserInfo}>
                  <span className={styles.menuUserName}>{currentUser.name}</span>
                  <span className={styles.menuUserRole}>{getRoleLabel(currentUser)}</span>
                </div>
              </div>
            </li>

            {navItems.map((item) => {
              const isActive = activeView === item.id || (item.id === 'home' && activeView === 'survey');
              return (
                <li key={item.id} style={{ width: '100%' }}>
                  <button
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={() => handleLinkClick(item.id)}
                  >
                    {getNavIcon(item.id)}
                    <span>{item.label}</span>
                    <ChevronRight size={16} className={styles.navLinkChevron} />
                  </button>
                </li>
              );
            })}
            <li className={styles.mobileOnlyItem} style={{ width: '100%' }}>
              <button
                className={styles.navLink}
                onClick={() => handleLinkClick('profile')}
              >
                <User size={18} className={styles.navLinkIcon} />
                <span>Hồ sơ cá nhân</span>
                <ChevronRight size={16} className={styles.navLinkChevron} />
              </button>
            </li>
            {currentUser.isAdmin && (
              <li className={styles.mobileOnlyItem} style={{ width: '100%' }}>
                <button
                  className={styles.navLink}
                  onClick={() => handleLinkClick('admin')}
                >
                  <Settings size={18} className={styles.navLinkIcon} />
                  <span>Cấu hình Admin</span>
                  <ChevronRight size={16} className={styles.navLinkChevron} />
                </button>
              </li>
            )}
            <li className={styles.mobileOnlyItem} style={{ width: '100%' }}>
              <button
                className={`${styles.navLink} ${styles.mobileLogout}`}
                onClick={onLogout}
              >
                <LogOut size={18} className={styles.navLinkIcon} />
                <span>Đăng xuất</span>
                <ChevronRight size={16} className={styles.navLinkChevron} />
              </button>
            </li>
          </ul>
        )}

        {/* Right Section */}
        <div className={styles.rightSection}>
          <button
            className={styles.themeToggle}
            onClick={onToggleTheme}
            title={`Chuyển sang nền ${theme === 'light' ? 'tối' : 'sáng'}`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {currentUser ? (
            <>
              <div
                className={styles.userProfile}
                onClick={() => handleLinkClick('profile')}
                title="Cài đặt tài khoản"
              >
                <div className={styles.avatar}>
                  {currentUser.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
                    <img src={currentUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    currentUser.avatar || '🧑‍💻'
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{currentUser.name}</span>
                  <span
                    className={`${styles.userRole} ${currentUser.isAdmin ? 'admin-rgb-tag' : ''}`}
                    style={currentUser.isAdmin ? { padding: '2px 8px', borderRadius: '12px', display: 'inline-block', textAlign: 'center', marginTop: '2px' } : {}}
                  >
                    {getRoleLabel(currentUser)}
                  </span>
                </div>
              </div>

              {currentUser.isAdmin && (
                <button
                  className={styles.logoutBtn}
                  onClick={() => handleLinkClick('admin')}
                  title="Admin Panel"
                >
                  <Settings size={20} />
                </button>
              )}

              <button
                className={styles.logoutBtn}
                onClick={onLogout}
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button className={styles.navLink} onClick={() => handleLinkClick('auth')}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
