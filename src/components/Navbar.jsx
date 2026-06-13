import { Moon, Sun, LogOut, Settings } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ activeView, onViewChange, currentUser, onLogout, theme, onToggleTheme }) {
  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'dictionary', label: 'Sổ tay văn hóa' },
    { id: 'roleplay', label: 'Thử thách' },
    { id: 'cvbuilder', label: 'Tạo CV (Rirekisho)' },
    { id: 'community', label: 'Senpai - Kouhai' },
  ];

  const handleLinkClick = (viewId) => {
    onViewChange(viewId);
  };

  const getRoleLabel = (user) => {
    if (!user) return '';
    if (user.isAdmin) return 'QUẢN TRỊ VIÊN';
    if (user.isSenpai) return 'SENPAI';
    return 'HỌC VIÊN';
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo Left */}
        <a 
          href="#home" 
          className={styles.logo} 
          onClick={(e) => { e.preventDefault(); handleLinkClick(currentUser ? 'home' : 'auth'); }}
        >
          <div className={styles.dot}></div>
          <span>Nihon Career Ready</span>
        </a>

        {/* Menu Center */}
        {currentUser && (
          <ul className={styles.menu}>
            {navItems.map((item) => {
              const isActive = activeView === item.id || (item.id === 'home' && activeView === 'survey');
              return (
                <li key={item.id}>
                  <button
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={() => handleLinkClick(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
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
                onClick={() => onViewChange('profile')}
                title="Cài đặt tài khoản"
              >
                <div className={styles.avatar}>
                  {currentUser.avatar?.startsWith('data:image') ? (
                    <img src={currentUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    currentUser.avatar || '🧑‍💻'
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{currentUser.name}</span>
                  <span className={styles.userRole}>{getRoleLabel(currentUser)}</span>
                </div>
              </div>
              
              {currentUser.isAdmin && (
                <button 
                  className={styles.logoutBtn}
                  onClick={() => onViewChange('admin')}
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
            <button className={styles.navLink} onClick={() => onViewChange('auth')}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
