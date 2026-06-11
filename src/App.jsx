import React, { useState, useEffect } from 'react';
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

// Defaults imported from component files (SVG-free, 100% JSON-safe for localStorage)
const DEFAULT_DICT = MANNERS_DATA;
const DEFAULT_ROLEPLAY = SCENARIOS;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('auth');

  // Dynamic Content States — initialized with clean defaults
  const [dictionary, setDictionary] = useState([]);
  const [roleplay, setRoleplay] = useState([]);

  // Roadmap & Survey states
  const [surveyScore, setSurveyScore] = useState(null);
  const [surveyRoadmap, setSurveyRoadmap] = useState(null);

  // Load user session on mount
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

    // Load custom dictionary or fallback to defaults
    const localDict = localStorage.getItem('nihon_dict');
    if (localDict) {
      try {
        setDictionary(JSON.parse(localDict));
      } catch (e) {
        setDictionary(DEFAULT_DICT);
        localStorage.setItem('nihon_dict', JSON.stringify(DEFAULT_DICT));
      }
    } else {
      setDictionary(DEFAULT_DICT);
      localStorage.setItem('nihon_dict', JSON.stringify(DEFAULT_DICT));
    }

    // Load custom roleplay or fallback to defaults
    const localRole = localStorage.getItem('nihon_role');
    if (localRole) {
      try {
        setRoleplay(JSON.parse(localRole));
      } catch (e) {
        setRoleplay(DEFAULT_ROLEPLAY);
        localStorage.setItem('nihon_role', JSON.stringify(DEFAULT_ROLEPLAY));
      }
    } else {
      setRoleplay(DEFAULT_ROLEPLAY);
      localStorage.setItem('nihon_role', JSON.stringify(DEFAULT_ROLEPLAY));
    }
  }, []);

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
    }
  };

  const handleAddDictionary = (newItem) => {
    const updated = [...dictionary, newItem];
    setDictionary(updated);
    localStorage.setItem('nihon_dict', JSON.stringify(updated));
  };

  const handleDeleteDictionary = (id) => {
    const updated = dictionary.filter(item => item.id !== id);
    setDictionary(updated);
    localStorage.setItem('nihon_dict', JSON.stringify(updated));
  };

  const handleAddRoleplay = (newScenario) => {
    const updated = [...roleplay, newScenario];
    setRoleplay(updated);
    localStorage.setItem('nihon_role', JSON.stringify(updated));
  };

  const handleUpdateRoleplay = (updatedScenario) => {
    const updated = roleplay.map(item => item.id === updatedScenario.id ? updatedScenario : item);
    setRoleplay(updated);
    localStorage.setItem('nihon_role', JSON.stringify(updated));
  };

  const handleDeleteRoleplay = (id) => {
    const updated = roleplay.filter(item => item.id !== id);
    setRoleplay(updated);
    localStorage.setItem('nihon_role', JSON.stringify(updated));
  };

  const handleSurveyComplete = (roadmap, score) => {
    setSurveyRoadmap(roadmap);
    setSurveyScore(score);
    setActiveView('home');
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
        background: '#fff',
        marginTop: '3rem'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} Nihon Career Ready. Thiết kế theo phong cách Wa-Minimalism tối giản Nhật Bản.</p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Dành riêng cho sinh viên Việt Nam bước chân vào môi trường chuyên nghiệp.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
