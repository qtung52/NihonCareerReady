import { useState, useEffect } from 'react';
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

// Defaults imported from component files (SVG-free, 100% JSON-safe for localStorage)
const DEFAULT_DICT = MANNERS_DATA;
const DEFAULT_ROLEPLAY = SCENARIOS;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('auth');
  const [theme, setTheme] = useState(() => localStorage.getItem('nihon_theme') || 'light');

  // Dynamic Content States — initialized with clean defaults
  const [dictionary, setDictionary] = useState([]);
  const [roleplay, setRoleplay] = useState([]);

  // Roadmap & Survey states
  const [surveyScore, setSurveyScore] = useState(null);
  const [surveyRoadmap, setSurveyRoadmap] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nihon_theme', theme);
  }, [theme]);

  // Load user session and shared content on mount
  useEffect(() => {
    const session = localStorage.getItem('session_user');
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
        setActiveView('home');
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
      
      if (!isMounted) return;
      if (Array.isArray(dictData) && dictData.length > 0) setDictionary(dictData);
      if (Array.isArray(roleData) && roleData.length > 0) setRoleplay(roleData);
    };

    refreshSharedContent();
    const interval = setInterval(refreshSharedContent, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeView]);

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

  const handleUpdateProfile = (updatedFields) => {
    const updatedUser = {
      ...currentUser,
      ...updatedFields
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('session_user', JSON.stringify(updatedUser));

    // Update in database list
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex(u => u.email === currentUser.email);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          ...updatedFields
        };
        localStorage.setItem('users', JSON.stringify(users));
        setSharedArray('users', users);
      }

    // If name was updated, sync with community threads and replies
    if (updatedFields.name) {
      const threads = JSON.parse(localStorage.getItem('nihon_threads') || '[]');
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

      localStorage.setItem('nihon_threads', JSON.stringify(updatedThreads));
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

  const renderView = () => {
    if (!currentUser) {
      return <Auth onLogin={handleLogin} />;
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
        return <Community currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'admin':
        return currentUser.isAdmin ? (
          <AdminPanel
            dictionary={dictionary}
            roleplay={roleplay}
            onAddDictionary={handleAddDictionary}
            onUpdateDictionary={handleUpdateDictionary}
            onDeleteDictionary={handleDeleteDictionary}
            onAddRoleplay={handleAddRoleplay}
            onUpdateRoleplay={handleUpdateRoleplay}
            onDeleteRoleplay={handleDeleteRoleplay}
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
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="container" style={{ padding: '2rem 1rem 4rem 1rem' }}>
        {renderView()}
      </main>
      
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

      {/* Floating Chat Assistant */}
      <ChatBox currentUser={currentUser} />
    </div>
  );
}

export default App;
