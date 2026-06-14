import { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Survey from './components/Survey';
import Dictionary, { MANNERS_DATA } from './components/Dictionary';
import RolePlay, { SCENARIOS } from './components/RolePlay';
import CVBuilder from './components/CVBuilder';
import Community from './components/Community';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import ChatBox from './components/ChatBox';
import { getSharedArray, seedSharedArray, setSharedArray } from './lib/sharedStore';

const DEFAULT_DICT = MANNERS_DATA;
const DEFAULT_ROLEPLAY = SCENARIOS;

const viewToHash = (view) => {
  if (view === 'community') return 'senpai';
  return view;
};

const hashToView = (hash) => {
  if (hash === 'senpai') return 'community';
  return hash;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState(() => {
    const session = localStorage.getItem('session_user');
    if (session) {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validHashes = ['home', 'survey', 'dictionary', 'roleplay', 'cvbuilder', 'senpai', 'profile', 'admin'];
      if (hash && validHashes.includes(hash)) {
        return hashToView(hash);
      }
      return 'home';
    }
    return 'auth';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('nihon_theme') || 'light');

  // Dynamic Content States — initialized with clean defaults
  const [dictionary, setDictionary] = useState([]);
  const [roleplay, setRoleplay] = useState([]);

  // Roadmap & Survey states
  const [surveyScore, setSurveyScore] = useState(null);
  const [surveyRoadmap, setSurveyRoadmap] = useState(null);
  
  // Profile Popup Viewer State
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileModalClosing, setProfileModalClosing] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nihon_theme', theme);
  }, [theme]);

  // Scroll to top on tab/view switch
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  // Sync URL hash to activeView state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validHashes = ['auth', 'home', 'survey', 'dictionary', 'roleplay', 'cvbuilder', 'senpai', 'profile', 'admin'];
      if (hash && validHashes.includes(hash)) {
        setActiveView(hashToView(hash));
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync activeView state to URL hash
  useEffect(() => {
    if (activeView) {
      const targetHash = viewToHash(activeView);
      const currentHash = window.location.hash.replace('#/', '').replace('#', '');
      if (currentHash !== targetHash) {
        window.location.hash = `#/${targetHash}`;
      }
    }
  }, [activeView]);

  // Load user session and shared content on mount
  useEffect(() => {
    const session = localStorage.getItem('session_user');
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        
        // Auto-sync roles and profile fields from the database so users don't have to re-login
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const dbUser = users.find(u => u.email === parsedUser.email);
        if (dbUser) {
          parsedUser.isAdmin = !!dbUser.isAdmin;
          parsedUser.isSenpai = !!dbUser.isSenpai;
          parsedUser.name = dbUser.name || parsedUser.name;
          parsedUser.avatar = dbUser.avatar || parsedUser.avatar || '🧑‍💻';
          parsedUser.bio = dbUser.bio || parsedUser.bio || '';
          parsedUser.careerGoal = dbUser.careerGoal || parsedUser.careerGoal || 'Software Engineer (Japan)';
          localStorage.setItem('session_user', JSON.stringify(parsedUser));
        }

        setCurrentUser(parsedUser);
        
        // Load active view from hash on initial load
        const hash = window.location.hash.replace('#/', '').replace('#', '');
        const validHashes = ['home', 'survey', 'dictionary', 'roleplay', 'cvbuilder', 'senpai', 'profile', 'admin'];
        if (hash && validHashes.includes(hash)) {
          setActiveView(hashToView(hash));
        } else {
          setActiveView('home');
        }
      } catch (e) {
        localStorage.removeItem('session_user');
      }
    }

    seedSharedArray('dictionary', DEFAULT_DICT).then(setDictionary);
    seedSharedArray('roleplay', DEFAULT_ROLEPLAY).then(setRoleplay);
  }, []);

  useEffect(() => {
    if (activeView !== 'dictionary' && activeView !== 'roleplay' && activeView !== 'cvbuilder' && activeView !== 'admin') return;

    let isMounted = true;
    
    const refreshSharedContent = async () => {
      const dictData = await getSharedArray('dictionary', []);
      const roleData = await getSharedArray('roleplay', []);
      const usersData = await getSharedArray('users', []);
      
      if (!isMounted) return;
      if (Array.isArray(dictData) && dictData.length > 0) setDictionary(dictData);
      if (Array.isArray(roleData) && roleData.length > 0) setRoleplay(roleData);
      
      if (currentUser && Array.isArray(usersData)) {
        const freshUserData = usersData.find(u => u.email === currentUser.email);
        if (freshUserData) {
          const hasChanged = 
            freshUserData.isAdmin !== currentUser.isAdmin ||
            freshUserData.isSenpai !== currentUser.isSenpai ||
            freshUserData.name !== currentUser.name ||
            freshUserData.avatar !== currentUser.avatar ||
            freshUserData.bio !== currentUser.bio ||
            freshUserData.careerGoal !== currentUser.careerGoal;

          if (hasChanged) {
            const updatedUser = { 
              ...currentUser, 
              isAdmin: !!freshUserData.isAdmin, 
              isSenpai: !!freshUserData.isSenpai,
              name: freshUserData.name || currentUser.name,
              avatar: freshUserData.avatar || currentUser.avatar || '🧑‍💻',
              bio: freshUserData.bio || currentUser.bio || '',
              careerGoal: freshUserData.careerGoal || currentUser.careerGoal || 'Software Engineer (Japan)'
            };
            setCurrentUser(updatedUser);
            localStorage.setItem('session_user', JSON.stringify(updatedUser));
          }
        }
      }
    };

    refreshSharedContent();
    const interval = setInterval(refreshSharedContent, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeView, currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveView('survey');
  };

  const handleLogout = () => {
    localStorage.removeItem('session_user');
    setCurrentUser(null);
    setActiveView('auth');
    setSurveyScore(null);
    setSurveyRoadmap(null);
  };

  const handleUpdateProfile = async (updatedFields) => {
    const updatedUser = {
      ...currentUser,
      ...updatedFields
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('session_user', JSON.stringify(updatedUser));

    // Update in database list
    const users = await getSharedArray('users', []);
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...updatedFields
      };
    } else {
      users.push({
        email: currentUser.email,
        password: currentUser.password || 'admin123',
        isAdmin: !!currentUser.isAdmin,
        isSenpai: !!currentUser.isSenpai,
        ...updatedFields
      });
    }
    await setSharedArray('users', users);

    // If name was updated, sync with community threads and replies
    if (updatedFields.name) {
      const threads = await getSharedArray('threads', []);
      const updatedThreads = threads.map(t => {
        let threadChanged = false;
        let newAuthor = t.author;
        if (t.authorEmail === currentUser.email) {
          newAuthor = updatedFields.name;
          threadChanged = true;
        }
        
        const updatedAnswers = t.answers.map(ans => {
          if (ans.authorEmail === currentUser.email) {
            return { ...ans, author: updatedFields.name };
          }
          return ans;
        });

        const answersChanged = JSON.stringify(t.answers) !== JSON.stringify(updatedAnswers);

        if (threadChanged || answersChanged) {
          return {
            ...t,
            author: newAuthor,
            answers: updatedAnswers
          };
        }
        return t;
      });

      await setSharedArray('threads', updatedThreads);
    }
  };

  const handleAddDictionary = (newItem) => {
    const updated = [...dictionary, newItem];
    setDictionary(updated);
    setSharedArray('dictionary', updated);
  };

  const handleUpdateDictionary = (updatedItem) => {
    const updated = dictionary.map(item => item.id === updatedItem.id ? updatedItem : item);
    setDictionary(updated);
    setSharedArray('dictionary', updated);
  };

  const handleDeleteDictionary = (id) => {
    const updated = dictionary.filter(item => item.id !== id);
    setDictionary(updated);
    setSharedArray('dictionary', updated);
  };

  const handleAddRoleplay = (newScenario) => {
    const updated = [...roleplay, newScenario];
    setRoleplay(updated);
    setSharedArray('roleplay', updated);
  };

  const handleUpdateRoleplay = (updatedScenario) => {
    const updated = roleplay.map(item => item.id === updatedScenario.id ? updatedScenario : item);
    setRoleplay(updated);
    setSharedArray('roleplay', updated);
  };

  const handleDeleteRoleplay = (id) => {
    const updated = roleplay.filter(item => item.id !== id);
    setRoleplay(updated);
    setSharedArray('roleplay', updated);
  };

  const handleSurveyComplete = (roadmap, score) => {
    setSurveyRoadmap(roadmap);
    setSurveyScore(score);
    setActiveView('home');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const maskEmail = (email) => {
    if (!email) return 'Ẩn danh';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.slice(0, Math.min(3, local.length)) + '****';
    const domainParts = domain.split('.');
    const maskedDomain = '***.' + domainParts[domainParts.length - 1];
    return `${maskedLocal}@${maskedDomain}`;
  };

  const handleCloseProfileModal = () => {
    setProfileModalClosing(true);
    setTimeout(() => {
      setProfileModalUser(null);
      setProfileModalClosing(false);
    }, 300);
  };

  const handleOpenProfileModal = async (email, fallbackName = '', fallbackRole = '') => {
    setProfileModalClosing(false);

    const users = await getSharedArray('users', []);
    const matchedUser = users.find(u => u.email === email);
    if (matchedUser) {
      setProfileModalUser({
        name: matchedUser.name || fallbackName,
        email: matchedUser.email,
        avatar: matchedUser.avatar || '🧑‍💻',
        bio: matchedUser.bio || 'Chưa cập nhật giới thiệu bản thân.',
        careerGoal: matchedUser.careerGoal || 'Học viên Nihon Career Ready',
        role: matchedUser.isAdmin ? 'Quản trị viên' : matchedUser.isSenpai ? 'Senpai' : 'Học viên'
      });
    } else if (email === 'admin@nihon.com') {
      setProfileModalUser({
        name: 'Admin Senpai',
        email: 'admin@nihon.com',
        avatar: '🦊',
        bio: 'Quản trị viên hệ thống Nihon Career Ready. Rất vui được hỗ trợ và định hướng văn hóa cho các bạn Kouhai.',
        careerGoal: 'Lãnh đạo Giáo dục / Nhân sự Nhật Bản',
        role: 'Quản trị viên'
      });
    } else {
      // User not found in store — use fallback info from the post/comment metadata
      const isSenpaiRole = fallbackRole && (
        fallbackRole.includes('Senpai') ||
        fallbackRole.includes('Tech Lead') ||
        fallbackRole.includes('Leader')
      );
      setProfileModalUser({
        name: fallbackName,
        email: email || '',
        avatar: '🧑‍💻',
        bio: 'Chưa cập nhật giới thiệu bản thân.',
        careerGoal: isSenpaiRole ? 'Senpai / Cố vấn chuyên môn' : 'Học viên Nihon Career Ready',
        role: fallbackRole || 'Học viên'
      });
    }
  };


  const renderView = () => {
    if (!currentUser) {
      return <Auth onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;
    }

    switch (activeView) {
      case 'home':
        return (
          <Home
            score={surveyScore}
            roadmap={surveyRoadmap}
            onViewChange={setActiveView}
          />
        );
      case 'survey':
        return <Survey onComplete={handleSurveyComplete} />;
      case 'dictionary':
        return <Dictionary dictionary={dictionary} />;
      case 'roleplay':
        return <RolePlay roleplay={roleplay} />;
      case 'cvbuilder':
        return <CVBuilder />;
      case 'community':
        return <Community currentUser={currentUser} onViewProfile={handleOpenProfileModal} />;
      case 'profile':
        return <Profile currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'admin':
        return currentUser.isAdmin ? (
          <AdminPanel
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            dictionary={dictionary}
            roleplay={roleplay}
            onAddDictionary={handleAddDictionary}
            onUpdateDictionary={handleUpdateDictionary}
            onDeleteDictionary={handleDeleteDictionary}
            onAddRoleplay={handleAddRoleplay}
            onUpdateRoleplay={handleUpdateRoleplay}
            onDeleteRoleplay={handleDeleteRoleplay}
            onViewProfile={handleOpenProfileModal}
          />
        ) : (
          <Home score={surveyScore} roadmap={surveyRoadmap} onViewChange={setActiveView} />
        );
      default:
        return (
          <Home
            score={surveyScore}
            roadmap={surveyRoadmap}
            onViewChange={setActiveView}
          />
        );
    }
  };

  return (
    <div>
      {currentUser && (
        <Navbar
          activeView={activeView}
          onViewChange={setActiveView}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      
      <main className={(activeView === 'home' || activeView === 'cvbuilder' || !currentUser) ? '' : 'container'} style={(activeView === 'home' || activeView === 'cvbuilder' || !currentUser) ? { padding: 0 } : { paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div key={activeView} className="page-transition">
          {renderView()}
        </div>
      </main>
      
      {currentUser && activeView !== 'home' && (
        <footer style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          borderTop: '1px solid var(--jp-border)',
          color: 'var(--jp-text-muted)',
          fontSize: '0.85rem',
          background: 'var(--jp-card-bg)',
          marginTop: '3rem'
        }}>
          <div className="container">
            <p>© {new Date().getFullYear()} Nihon Career Ready. Thiết kế theo phong cách Wa-Minimalism tối giản Nhật Bản.</p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Dành riêng cho sinh viên Việt Nam bước chân vào môi trường chuyên nghiệp.</p>
          </div>
        </footer>
      )}

      {/* Profile Viewer Popup Modal */}
      {profileModalUser && (
        <div className={`modal-overlay ${profileModalClosing ? 'closing' : ''}`} onClick={handleCloseProfileModal} style={{ zIndex: 1100 }}>
          <div 
            className={`modal-content ${profileModalClosing ? 'closing' : ''}`} 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '440px', 
              padding: 0, 
              borderRadius: '16px', 
              border: '1px solid var(--jp-border)',
              overflow: 'hidden',
              boxShadow: 'var(--jp-shadow-lg)',
              background: 'var(--jp-card-bg)',
              position: 'relative'
            }}
          >
            {/* Banner */}
            <div 
              style={{ 
                height: '110px', 
                background: 'linear-gradient(135deg, var(--jp-blue) 0%, #1a3a6c 100%)', 
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Artistic Japanese red sun accent in the background */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '-20px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(188, 0, 45, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-50px',
                  right: '-10px',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(79, 142, 247, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />
              {/* Close button */}
              <button 
                onClick={handleCloseProfileModal} 
                style={{ 
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  minHeight: 'unset',
                  minWidth: 'unset',
                  padding: 0,
                  aspectRatio: '1 / 1',
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)', 
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar container overlapping the banner */}
            <div 
              style={{ 
                position: 'absolute',
                top: '65px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90px',
                height: '90px',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                border: '4px solid var(--jp-card-bg)',
                background: 'var(--jp-card-bg)',
                boxShadow: '0 8px 24px rgba(15, 44, 89, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '3.8rem',
                zIndex: 2,
                boxSizing: 'border-box',
                flexShrink: 0
              }}
            >
              {profileModalUser.avatar?.startsWith('data:image') ? (
                <img src={profileModalUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                profileModalUser.avatar || '🧑‍💻'
              )}
            </div>

            {/* Card Body */}
            <div style={{ padding: '55px 2rem 2.25rem 2rem', background: 'var(--jp-card-bg)' }}>
              {/* User Name & Role Tag */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.35rem 0', fontFamily: 'var(--font-japanese)' }}>
                  {profileModalUser.name}
                </h3>
                <span 
                  className={profileModalUser.role === 'Quản trị viên' ? 'admin-rgb-tag' : ''}
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.8rem',
                    borderRadius: '20px',
                    background: profileModalUser.role !== 'Quản trị viên' && (profileModalUser.role?.includes('Senpai') || profileModalUser.role?.includes('Tech Lead') || profileModalUser.role?.includes('Leader')) ? 'var(--jp-blue)' : profileModalUser.role !== 'Quản trị viên' ? 'var(--jp-border)' : undefined, 
                    color: profileModalUser.role !== 'Quản trị viên' && (profileModalUser.role?.includes('Senpai') || profileModalUser.role?.includes('Tech Lead') || profileModalUser.role?.includes('Leader')) ? 'white' : profileModalUser.role !== 'Quản trị viên' ? 'var(--jp-text-muted)' : undefined,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    letterSpacing: '0.03em'
                  }}
                >
                  {profileModalUser.role}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Career Goal */}
                <div style={{ background: 'var(--jp-soft-surface)', borderLeft: '4px solid var(--jp-blue)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Định hướng mục tiêu
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--jp-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} style={{ color: 'var(--jp-blue)' }} /> {profileModalUser.careerGoal}
                  </span>
                </div>

                {/* Bio */}
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                    Mô tả bản thân
                  </span>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--jp-text)', 
                    margin: 0, 
                    background: 'var(--jp-soft-surface)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: '8px', 
                    lineHeight: '1.5', 
                    fontStyle: 'italic', 
                    border: '1px solid var(--jp-border)' 
                  }}>
                    "{profileModalUser.bio}"
                  </p>
                </div>

                {/* Masked Email */}
                <div style={{ borderTop: '1px solid var(--jp-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', fontWeight: 600 }}>
                    Email liên hệ (Đã ẩn)
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--jp-text)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--jp-soft-surface)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                    🔒 {maskEmail(profileModalUser.email)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Assistant */}
      <ChatBox currentUser={currentUser} />
    </div>
  );
}

export default App;
