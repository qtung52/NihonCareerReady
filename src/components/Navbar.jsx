import { BookOpen, Award, FileText, Users, Home, Settings, LogOut, Moon, Sun } from 'lucide-react';

export default function Navbar({ activeView, onViewChange, currentUser, onLogout, theme, onToggleTheme }) {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'dictionary', label: 'Sổ tay văn hóa', icon: BookOpen },
    { id: 'roleplay', label: 'Thử thách', icon: Award },
    { id: 'cvbuilder', label: 'Tạo CV (Rirekisho)', icon: FileText },
    { id: 'community', label: 'Senpai - Kouhai', icon: Users },
  ];

  const handleLinkClick = (e, viewId) => {
    e.preventDefault();
    onViewChange(viewId);
  };

  return (
    <nav className="navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--jp-nav-bg)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '2px solid var(--jp-red)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
      padding: '0.75rem 0'
    }}>
      <div className="container navbar-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <a 
          href="#home" 
          className="logo" 
          onClick={(e) => handleLinkClick(e, currentUser ? 'home' : 'auth')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--jp-blue)',
            transition: 'color 0.3s ease'
          }}
        >
          <div className="logo-circle" style={{
            width: '18px',
            height: '18px',
            backgroundColor: 'var(--jp-red)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(188, 0, 45, 0.4)'
          }}></div>
          <span style={{ letterSpacing: '-0.5px' }}>Nihon Career Ready</span>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--jp-text-muted)', 
            marginLeft: '4px', 
            fontWeight: 500,
            background: 'var(--jp-blue-light)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>日本キャリア</span>
        </a>

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <ul className="nav-links" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              listStyle: 'none',
              margin: 0,
              padding: 0
            }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id || (item.id === 'home' && activeView === 'survey');
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.52rem 0.78rem',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: isActive ? '#fff' : 'var(--jp-blue)',
                        background: isActive ? 'var(--jp-blue)' : 'transparent',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--jp-blue-light)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <Icon size={15} />
                      {item.label}
                    </a>
                  </li>
                );
              })}
              
              {currentUser.isAdmin && (
                <li>
                  <a
                    href="#admin"
                    className={`nav-link ${activeView === 'admin' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'admin')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      marginLeft: '0.5rem',
                      borderLeft: '1px solid var(--jp-border)',
                      paddingLeft: '1rem',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: activeView === 'admin' ? '#fff' : 'var(--jp-red)',
                      background: activeView === 'admin' ? 'var(--jp-red)' : 'transparent',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (activeView !== 'admin') {
                        e.currentTarget.style.background = 'rgba(188, 0, 45, 0.05)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeView !== 'admin') {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <Settings size={15} />
                    Admin Panel
                  </a>
                </li>
              )}
            </ul>

            {/* Profile trigger card - x10 aesthetics */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.85rem', 
              borderLeft: '1px solid var(--jp-border)', 
              paddingLeft: '1.25rem' 
            }}>
              <button
                onClick={onToggleTheme}
                className="theme-toggle-btn"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--jp-border)',
                  background: 'var(--jp-card-bg)',
                  color: 'var(--jp-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '24px',
                  background: activeView === 'profile' ? 'var(--jp-blue-light)' : 'var(--jp-soft-surface)',
                  border: activeView === 'profile' ? '1px solid var(--jp-blue)' : '1px solid transparent',
                  transition: 'all 0.25s ease'
                }}
                onClick={(e) => handleLinkClick(e, 'profile')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--jp-blue-light)';
                  e.currentTarget.style.borderColor = 'rgba(15, 44, 89, 0.2)';
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'profile') {
                    e.currentTarget.style.background = 'var(--jp-soft-surface)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                title="Xem cài đặt tài khoản"
              >
                <div style={{
                  fontSize: '1.25rem',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--jp-card-bg)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}>
                  {currentUser.avatar || '🧑‍💻'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--jp-blue)' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--jp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>
                    {currentUser.isAdmin ? 'Admin' : 'Học viên'}
                  </span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-outline" 
                style={{ 
                  padding: '0.45rem', 
                  borderRadius: '50%', 
                  border: '1px solid rgba(188, 0, 45, 0.2)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  color: 'var(--jp-red)',
                  background: 'var(--jp-card-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--jp-red)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--jp-card-bg)';
                  e.currentTarget.style.color = 'var(--jp-red)';
                }}
                title="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
