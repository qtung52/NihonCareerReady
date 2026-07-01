import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, HelpCircle, Trophy, Star, RefreshCw, Info } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';
import { MANNERS_DATA } from '../data/mannersData';

// Confetti-like Canvas Animation component
function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c'];
    const particles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (particles.some(p => p.y < canvas.height)) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999
      }}
    />
  );
}

// CategoryIcon SVG drawing helper
function CategoryIcon({ category, id }) {
  if (category === 'ojigi') {
    const deg = id?.includes('15') ? 15 : id?.includes('45') ? 45 : 30;
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <circle cx="50" cy="22" r="10" fill="var(--jp-blue)" />
        <line x1="50" y1="32" x2="50" y2="62" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="62" x2="40" y2="85" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="62" x2="60" y2="85" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="42" x2="30" y2={42 + deg} stroke="var(--jp-red)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="42" x2="70" y2={42 + deg * 0.3} stroke="var(--jp-red)" strokeWidth="4" strokeLinecap="round" />
        <text x="68" y="28" fontSize="9" fill="var(--jp-red)" fontWeight="bold">{deg}°</text>
      </svg>
    );
  }
  if (category === 'meishi') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="15" y="32" width="70" height="44" rx="3" fill="none" stroke="var(--jp-blue)" strokeWidth="3" />
        <line x1="22" y1="45" x2="55" y2="45" stroke="var(--jp-red)" strokeWidth="2" />
        <line x1="22" y1="55" x2="45" y2="55" stroke="var(--jp-border)" strokeWidth="2" />
        <circle cx="72" cy="50" r="8" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M68 50 L71 53 L76 47" stroke="var(--jp-blue)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 82 Q50 72 78 82" fill="none" stroke="var(--jp-text-muted)" strokeWidth="2" />
      </svg>
    );
  }
  if (category === 'seating') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="10" y="15" width="80" height="70" rx="4" fill="none" stroke="var(--jp-border)" strokeWidth="2" />
        <rect x="20" y="25" width="60" height="50" rx="3" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
        <text x="50" y="47" fontSize="7" fill="var(--jp-red)" textAnchor="middle" fontWeight="bold">KAMIZA</text>
        <text x="50" y="58" fontSize="6" fill="var(--jp-text-muted)" textAnchor="middle">(Ghế danh dự)</text>
      </svg>
    );
  }
  if (category === 'dresscode') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <path d="M32 20 L68 20 L72 35 L60 40 L60 85 L40 85 L40 40 L28 35 Z" fill="var(--jp-blue)" />
        <path d="M43 20 L50 40 L57 20 Z" fill="#fff" />
        <rect x="47" y="42" width="6" height="30" fill="var(--jp-red)" rx="2" />
      </svg>
    );
  }
  if (category === 'nomikai') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <path d="M30 45 L42 45 L38 75 L30 75 Z" fill="none" stroke="var(--jp-blue)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 52 L36 52" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M30 62 L35 62" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M26 50 C22 50 22 65 26 65" fill="none" stroke="var(--jp-blue)" strokeWidth="2.5" />
        <path d="M70 45 L58 45 L62 75 L70 75 Z" fill="none" stroke="var(--jp-blue)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 52 L64 52" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M70 62 L65 62" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M74 50 C78 50 78 65 74 65" fill="none" stroke="var(--jp-blue)" strokeWidth="2.5" />
        <path d="M50 35 L50 42" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
        <path d="M43 38 L48 41" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
        <path d="M57 38 L52 41" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === 'email_phone') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="15" y="25" width="50" height="32" rx="3" fill="none" stroke="var(--jp-blue)" strokeWidth="3" />
        <path d="M15 28 L40 45 L65 28" fill="none" stroke="var(--jp-blue)" strokeWidth="2.5" />
        <rect x="50" y="45" width="32" height="42" rx="5" fill="var(--jp-surface)" stroke="var(--jp-blue)" strokeWidth="3" />
        <circle cx="66" cy="80" r="3" fill="var(--jp-red)" />
        <line x1="56" y1="52" x2="76" y2="52" stroke="var(--jp-text-muted)" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="60" x2="70" y2="60" stroke="var(--jp-text-muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === 'omiyage') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="22" y="32" width="56" height="46" rx="3" fill="none" stroke="var(--jp-blue)" strokeWidth="3" />
        <line x1="22" y1="55" x2="78" y2="55" stroke="var(--jp-red)" strokeWidth="3" />
        <line x1="50" y1="32" x2="50" y2="78" stroke="var(--jp-red)" strokeWidth="3" />
        <path d="M50 55 C42 45 42 65 50 55" fill="none" stroke="var(--jp-red)" strokeWidth="2.5" />
        <path d="M50 55 C58 45 58 65 50 55" fill="none" stroke="var(--jp-red)" strokeWidth="2.5" />
        <circle cx="50" cy="55" r="4" fill="var(--jp-red)" />
      </svg>
    );
  }
  if (category === 'workrules') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="25" y="25" width="50" height="58" rx="4" fill="none" stroke="var(--jp-border)" strokeWidth="2" />
        <path d="M42 25 L42 18 L58 18 L58 25 Z" fill="var(--jp-blue)" />
        <circle cx="50" cy="21" r="2" fill="#fff" />
        <line x1="42" y1="40" x2="65" y2="40" stroke="var(--jp-text-muted)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="52" x2="65" y2="52" stroke="var(--jp-text-muted)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="64" x2="65" y2="64" stroke="var(--jp-text-muted)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 38 L35 41 L39 36" fill="none" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 50 L35 53 L39 48" fill="none" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 62 L35 65 L39 60" fill="none" stroke="var(--jp-red)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="60" height="60">
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--jp-red)" strokeWidth="3" />
      <path d="M30 50 L45 65 L70 35" fill="none" stroke="var(--jp-blue)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dictionary({ dictionary = MANNERS_DATA }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [practiceItem, setPracticeItem] = useState(null);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // New States for Pronunciation & Difficulty & Timer
  const [audioListenedCount, setAudioListenedCount] = useState(() => {
    try {
      const val = localStorage.getItem('nihon_audio_listened_count');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium'); // easy, medium, hard, extreme
  const [timeLeft, setTimeLeft] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const [cardsFlipped, setCardsFlipped] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('nihon_cards_flipped'));
      return Array.isArray(val) ? Array.from(new Set(val)) : [];
    } catch {
      return [];
    }
  });

  const [challengesCompleted, setChallengesCompleted] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('nihon_challenges_completed'));
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      const val = JSON.parse(localStorage.getItem('nihon_bookmarked_cards'));
      return Array.isArray(val) ? val : [];
    } catch {
      return [];
    }
  });

  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [dbUsersList, setDbUsersList] = useState([]);
  const [showLeaderboardInfo, setShowLeaderboardInfo] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [isLeaderboardClosing, setIsLeaderboardClosing] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [isBadgesClosing, setIsBadgesClosing] = useState(false);
  const [isDifficultyClosing, setIsDifficultyClosing] = useState(false);
  const [isPracticeClosing, setIsPracticeClosing] = useState(false);
  const [cardQuizStates, setCardQuizStates] = useState({});

  const handleCloseLeaderboard = () => {
    setIsLeaderboardClosing(true);
    setTimeout(() => {
      setShowLeaderboardModal(false);
      setIsLeaderboardClosing(false);
    }, 250);
  };

  const handleCloseBadgesModal = () => {
    setIsBadgesClosing(true);
    setTimeout(() => {
      setShowBadgesModal(false);
      setIsBadgesClosing(false);
    }, 250);
  };

  const handleCloseDifficultyModal = () => {
    setIsDifficultyClosing(true);
    setTimeout(() => {
      setShowDifficultyModal(false);
      setIsDifficultyClosing(false);
    }, 250);
  };


  const syncScoreToSharedStore = async (newScore, completedList) => {
    try {
      const session = JSON.parse(localStorage.getItem('session_user'));
      if (!session || !session.email) return;

      const users = await getSharedArray('users', []);
      const nextUsers = users.map(u =>
        (u.email && u.email.trim().toLowerCase() === session.email.trim().toLowerCase())
          ? { ...u, challengeScore: newScore, challengesCompleted: completedList }
          : u
      );
      await setSharedArray('users', nextUsers);
      setDbUsersList(nextUsers);
    } catch (e) {
      console.warn("Failed to sync score to shared store:", e);
    }
  };

  const syncFlippedToSharedStore = async (flippedList) => {
    try {
      const session = JSON.parse(localStorage.getItem('session_user'));
      if (!session || !session.email) return;

      const users = await getSharedArray('users', []);
      const nextUsers = users.map(u =>
        (u.email && u.email.trim().toLowerCase() === session.email.trim().toLowerCase())
          ? { ...u, flippedCards: flippedList }
          : u
      );
      await setSharedArray('users', nextUsers);
      setDbUsersList(nextUsers);
    } catch (e) {
      console.warn("Failed to sync flipped cards to shared store:", e);
    }
  };

  // Sync with Supabase on mount
  useEffect(() => {
    const loadSharedUsers = async () => {
      try {
        const users = await getSharedArray('users', []);
        setDbUsersList(users);

        const session = JSON.parse(localStorage.getItem('session_user'));
        if (session && session.email && users.length > 0) {
          const userDb = users.find(u => u.email && u.email.trim().toLowerCase() === session.email.trim().toLowerCase());
          if (userDb) {
            if (Array.isArray(userDb.flippedCards)) {
              setCardsFlipped(prev => {
                const merged = Array.from(new Set([...prev, ...userDb.flippedCards]));
                if (merged.length > userDb.flippedCards.length) {
                  syncFlippedToSharedStore(merged);
                }
                return merged;
              });
            }
            if (Array.isArray(userDb.challengesCompleted)) {
              setChallengesCompleted(prev => {
                if (prev.length === 0) {
                  return userDb.challengesCompleted;
                } else if (prev.length > userDb.challengesCompleted.length) {
                  const newScore = prev.reduce((acc, c) => acc + c.score, 0);
                  syncScoreToSharedStore(newScore, prev);
                  return prev;
                } else {
                  return userDb.challengesCompleted;
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load shared users:", e);
      }
    };
    loadSharedUsers();
  }, []);

  const getCardGroupCategory = (item) => {
    const id = item?.id || '';
    const cat = item?.category || '';

    if (id.startsWith('workrules-highcontext') || id.startsWith('dresscode-temiyage') || cat === 'highcontext') {
      return 'highcontext';
    }
    if (id.startsWith('ojigi') || id.startsWith('meishi-1') || id.startsWith('meishi-2') || id.startsWith('meishi-aisatsu') || id.startsWith('seating') || cat === 'ojigi') {
      return 'ojigi';
    }
    if (id.startsWith('meishi-hourenso') || id.startsWith('dresscode-5s') || id.startsWith('dresscode-officecasual') || id.startsWith('dresscode-2') || id.startsWith('meishi-mail') || id.startsWith('meishi-3') || id.startsWith('email') || cat === 'hourenso') {
      return 'hourenso';
    }
    if (id.startsWith('meishi-nomikai') || id.startsWith('nomikai') || cat === 'nomikai') {
      return 'nomikai';
    }
    return cat;
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      highcontext: 'High-Context',
      ojigi: 'Cúi chào & Nghi lễ',
      hourenso: 'Báo cáo (HouRenSo)',
      nomikai: 'Tiệc rượu (Nomikai)'
    };
    return labels[cat] || (cat || '').toUpperCase();
  };

  const leaderboard = useMemo(() => {
    const myTotalScore = challengesCompleted.reduce((acc, c) => acc + c.score, 0);
    let list = dbUsersList;
    if (!list || list.length === 0) {
      try {
        list = JSON.parse(localStorage.getItem('users')) || [];
      } catch { }
    }

    let currentUserEmail = '';
    try {
      const session = JSON.parse(localStorage.getItem('session_user'));
      if (session) {
        currentUserEmail = session.email || '';
      }
    } catch (e) { }

    const ADMIN_EMAILS = ['admin@nihon.com', 'admin@nihon.edu.vn'];

    const mapped = list
      .filter(u => {
        const email = (u.email || '').trim().toLowerCase();
        return !ADMIN_EMAILS.includes(email);
      })
      .map(u => {
        const isMe = (currentUserEmail && u.email && u.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase());
        const score = isMe ? myTotalScore : (u.challengeScore !== undefined ? u.challengeScore : 0);

        return {
          name: u.name || 'Học viên ẩn danh',
          avatar: u.avatar || '🧑‍💻',
          score,
          isMe
        };
      });

    return mapped.sort((a, b) => b.score - a.score);
  }, [challengesCompleted, dbUsersList]);

  const cardsFlippedCount = useMemo(() => {
    const flippedList = Array.from(new Set(cardsFlipped || []));
    const allItems = Array.isArray(dictionary) ? dictionary : MANNERS_DATA;
    return flippedList.filter(id => allItems.some(item => item.id === id)).length;
  }, [cardsFlipped, dictionary]);

  const filteredData = (Array.isArray(dictionary) ? dictionary : MANNERS_DATA).filter(item => {
    if (!item) return false;
    const itemGroupCategory = getCardGroupCategory(item);
    const matchesCat = activeCategory === 'all' || itemGroupCategory === activeCategory;
    const matchesBookmark = !showOnlyBookmarked || (Array.isArray(bookmarkedCards) && bookmarkedCards.includes(item.id));
    const matchesSearch = (item.titleVi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.titleJp || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.frontDesc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesBookmark && matchesSearch;
  });

  const badgesList = useMemo(() => [
    {
      id: 'novice',
      icon: '🌱',
      name: 'Tân binh nhập môn',
      desc: 'Lật xem tối thiểu 1 thẻ học',
      check: () => cardsFlippedCount >= 1,
      color: '#27ae60',
      bg: 'rgba(46, 204, 113, 0.1)'
    },
    {
      id: 'diligent',
      icon: '📚',
      name: 'Học viên cần cù',
      desc: 'Lật xem tối thiểu 10 thẻ học',
      check: () => cardsFlippedCount >= 10,
      color: '#2980b9',
      bg: 'rgba(52, 152, 219, 0.1)'
    },
    {
      id: 'scholar',
      icon: '🧠',
      name: 'Uyên bác lễ nghi',
      desc: 'Lật xem tất cả các thẻ học',
      check: () => cardsFlippedCount >= (Array.isArray(dictionary) ? dictionary : MANNERS_DATA).length,
      color: '#e67e22',
      bg: 'rgba(230, 126, 34, 0.1)'
    },
    {
      id: 'challenger_1',
      icon: '🎯',
      name: 'Chiến binh thử thách',
      desc: 'Hoàn thành tối thiểu 1 thử thách',
      check: () => challengesCompleted.length >= 1,
      color: '#9b59b6',
      bg: 'rgba(155, 89, 182, 0.1)'
    },
    {
      id: 'challenger_5',
      icon: '👑',
      name: 'Bậc thầy lễ nghi',
      desc: 'Hoàn thành tối thiểu 5 thử thách',
      check: () => challengesCompleted.length >= 5,
      color: '#8e44ad',
      bg: 'rgba(142, 68, 173, 0.1)'
    },
    {
      id: 'challenger_15',
      icon: '🔥',
      name: 'Kẻ chinh phục',
      desc: 'Hoàn thành tối thiểu 15 thử thách',
      check: () => challengesCompleted.length >= 15,
      color: '#e74c3c',
      bg: 'rgba(231, 76, 60, 0.1)'
    },
    {
      id: 'perfect',
      icon: '⭐',
      name: 'Hoàn hảo 100%',
      desc: 'Đạt điểm tối đa ở một thử thách bất kỳ',
      check: () => challengesCompleted.some(c => c.score === c.total),
      color: '#f1c40f',
      bg: 'rgba(241, 196, 15, 0.1)'
    },
    {
      id: 'legend',
      icon: '💎',
      name: 'Huyền thoại văn hóa',
      desc: 'Tổng điểm tích lũy đạt từ 50đ trở lên',
      check: () => challengesCompleted.reduce((acc, c) => acc + c.score, 0) >= 50,
      color: '#1abc9c',
      bg: 'rgba(26, 188, 156, 0.1)'
    },
    {
      id: 'ambassador',
      icon: '💖',
      name: 'Sứ giả văn hóa',
      desc: 'Lưu tối thiểu 5 thẻ học yêu thích',
      check: () => bookmarkedCards.length >= 5,
      color: '#d35400',
      bg: 'rgba(211, 84, 0, 0.1)'
    },
    {
      id: 'speed_runner',
      icon: '⚡',
      name: 'Thần tốc lễ nghi',
      desc: 'Hoàn thành thử thách ở chế độ Khó hoặc Cực Khó',
      check: () => challengesCompleted.some(c => c.difficulty === 'hard' || c.difficulty === 'extreme'),
      color: '#f39c12',
      bg: 'rgba(243, 156, 18, 0.1)'
    },
    {
      id: 'perfect_extreme',
      icon: '🛡️',
      name: 'Vô địch tuyệt đối',
      desc: 'Đạt điểm tuyệt đối (20/20) ở chế độ Cực Khó',
      check: () => challengesCompleted.some(c => c.difficulty === 'extreme' && c.score === c.total && c.total >= 20),
      color: '#2c3e50',
      bg: 'rgba(44, 62, 80, 0.1)'
    },
    {
      id: 'points_100',
      icon: '✨',
      name: 'Học giả kiên trì',
      desc: 'Đạt tổng điểm tích lũy từ 100đ trở lên',
      check: () => challengesCompleted.reduce((acc, c) => acc + c.score, 0) >= 100,
      color: '#9b59b6',
      bg: 'rgba(155, 89, 182, 0.1)'
    },
    {
      id: 'pronunciation_master',
      icon: '🗣️',
      name: 'Nhà ngôn ngữ học',
      desc: 'Nghe phát âm tiếng Nhật tối thiểu 10 lần',
      check: () => audioListenedCount >= 10,
      color: '#00bcd4',
      bg: 'rgba(0, 188, 212, 0.1)'
    },
    {
      id: 'survivor_extreme',
      icon: '🔥',
      name: 'Sinh tử vô song',
      desc: 'Đạt tối thiểu 10 điểm trong chế độ Cực Khó mà không làm kết thúc giữa chừng',
      check: () => challengesCompleted.some(c => c.difficulty === 'extreme' && c.score >= 10),
      color: '#c0392b',
      bg: 'rgba(192, 57, 43, 0.1)'
    }
  ], [cardsFlippedCount, challengesCompleted, bookmarkedCards, dictionary, audioListenedCount]);

  useEffect(() => {
    localStorage.setItem('nihon_cards_flipped', JSON.stringify(cardsFlipped));
    const session = JSON.parse(localStorage.getItem('session_user'));
    if (session && session.email && cardsFlipped) {
      syncFlippedToSharedStore(cardsFlipped);
    }
  }, [cardsFlipped]);

  useEffect(() => {
    localStorage.setItem('nihon_challenges_completed', JSON.stringify(challengesCompleted));
  }, [challengesCompleted]);

  useEffect(() => {
    localStorage.setItem('nihon_bookmarked_cards', JSON.stringify(bookmarkedCards));
  }, [bookmarkedCards]);

  // Timer Effect
  useEffect(() => {
    if (!practiceItem || practiceItem.id !== 'general-challenge' || isQuizFinished || selectedOptionIdx !== null) {
      return;
    }

    if (timeLeft === null) return;

    if (timeLeft === 0) {
      // Time is up!
      playBeep('incorrect');
      setSelectedOptionIdx(-1); // special index to show incorrect

      if (selectedDifficulty === 'extreme') {
        setTimeout(() => {
          setIsQuizFinished(true);
          setChallengesCompleted(prevChallenges => {
            const newChallenge = { 
              cardId: 'general-challenge', 
              score: quizScore, 
              total: practiceItem.scenarios.length, 
              difficulty: 'extreme', 
              isTerminated: true 
            };
            const nextList = [...prevChallenges, newChallenge];
            const newTotalScore = nextList.reduce((acc, c) => {
              const mult = c.difficulty === 'easy' ? 1.0 : c.difficulty === 'medium' ? 1.5 : c.difficulty === 'hard' ? 2.0 : c.difficulty === 'extreme' ? 3.0 : 1.0;
              return acc + Math.round(c.score * mult);
            }, 0);
            syncScoreToSharedStore(newTotalScore, nextList);
            return nextList;
          });
        }, 1500);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, practiceItem, currentScenarioIdx, selectedOptionIdx, isQuizFinished, selectedDifficulty, quizScore]);



  const playJapaneseVoice = (text) => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      // Remove romaji in parentheses for cleaner pronunciation
      const cleanText = text.split('(')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);

      setAudioListenedCount(prev => {
        const nextVal = prev + 1;
        localStorage.setItem('nihon_audio_listened_count', nextVal);
        return nextVal;
      });
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  const playBeep = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.25);
      } else if (type === 'incorrect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("AudioContext play error:", e);
    }
  };

  const startGeneralChallenge = (diff = 'medium') => {
    const list = Array.isArray(dictionary) ? dictionary : MANNERS_DATA;
    const allScenarios = [];
    list.forEach(item => {
      if (item.scenarios && item.scenarios.length > 0) {
        item.scenarios.forEach(scen => {
          allScenarios.push({
            ...scen,
            cardTitle: item.titleVi,
            cardId: item.id
          });
        });
      }
    });

    if (allScenarios.length === 0) {
      alert("Chưa có câu hỏi thử thách nào!");
      return;
    }

    let limit = 10;
    if (diff === 'easy') limit = 5;
    else if (diff === 'medium') limit = 10;
    else if (diff === 'hard') limit = 15;
    else if (diff === 'extreme') limit = 20;

    const shuffled = [...allScenarios].sort(() => 0.5 - Math.random()).slice(0, Math.min(limit, allScenarios.length));
    
    setSelectedDifficulty(diff);
    setPracticeItem({
      id: 'general-challenge',
      titleVi: `Thử thách tổng hợp - Chế độ ${diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Trung bình' : diff === 'hard' ? 'Khó' : 'Cực khó'}`,
      titleJp: '総合的なビジネスマナー',
      scenarios: shuffled
    });
    setCurrentScenarioIdx(0);
    setSelectedOptionIdx(null);
    setQuizScore(0);
    setIsQuizFinished(false);
    setShowHint(false);

    if (diff === 'easy') {
      setTimeLeft(null);
    } else if (diff === 'medium') {
      setTimeLeft(25);
    } else if (diff === 'hard') {
      setTimeLeft(15);
    } else if (diff === 'extreme') {
      setTimeLeft(10);
    }
  };

  const startPractice = (item) => {
    setSelectedDifficulty('normal');
    setTimeLeft(null);
    setShowHint(false);
    setPracticeItem(item);
    setCurrentScenarioIdx(0);
    setSelectedOptionIdx(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const handleSelectOption = (idx) => {
    setSelectedOptionIdx(idx);
    const isCorrect = practiceItem.scenarios[currentScenarioIdx].correctOption === idx;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      playBeep('correct');
    } else {
      playBeep('incorrect');
      if (selectedDifficulty === 'hard') {
        // Penalty for wrong answers in Hard mode
        setQuizScore(prev => Math.max(0, prev - 0.5));
      }

      if (selectedDifficulty === 'extreme') {
        // Sudden death! End challenge immediately
        setTimeout(() => {
          setIsQuizFinished(true);
          setChallengesCompleted(prevChallenges => {
            const newChallenge = { 
              cardId: 'general-challenge', 
              score: quizScore, 
              total: practiceItem.scenarios.length, 
              difficulty: 'extreme', 
              isTerminated: true 
            };
            const nextList = [...prevChallenges, newChallenge];
            const newTotalScore = nextList.reduce((acc, c) => {
              const mult = c.difficulty === 'easy' ? 1.0 : c.difficulty === 'medium' ? 1.5 : c.difficulty === 'hard' ? 2.0 : c.difficulty === 'extreme' ? 3.0 : 1.0;
              return acc + Math.round(c.score * mult);
            }, 0);
            syncScoreToSharedStore(newTotalScore, nextList);
            return nextList;
          });
        }, 1500);
      }
    }
  };

  const handleNextScenario = () => {
    if (currentScenarioIdx < practiceItem.scenarios.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setShowHint(false);
      
      // Reset timer for next question
      if (selectedDifficulty === 'easy') setTimeLeft(null);
      else if (selectedDifficulty === 'medium') setTimeLeft(25);
      else if (selectedDifficulty === 'hard') setTimeLeft(15);
      else if (selectedDifficulty === 'extreme') setTimeLeft(10);
    } else {
      const cardId = practiceItem.id;
      const total = practiceItem.scenarios.length;
      const score = quizScore;

      setChallengesCompleted(prevChallenges => {
        const newChallenge = { 
          cardId, 
          score, 
          total, 
          difficulty: cardId === 'general-challenge' ? selectedDifficulty : 'normal' 
        };
        const nextList = [...prevChallenges, newChallenge];
        const newTotalScore = nextList.reduce((acc, c) => {
          const mult = c.difficulty === 'easy' ? 1.0 : c.difficulty === 'medium' ? 1.5 : c.difficulty === 'hard' ? 2.0 : c.difficulty === 'extreme' ? 3.0 : 1.0;
          return acc + Math.round(c.score * mult);
        }, 0);
        syncScoreToSharedStore(newTotalScore, nextList);
        return nextList;
      });
      setIsQuizFinished(true);
    }
  };

  const resetPractice = () => {
    setCurrentScenarioIdx(0);
    setSelectedOptionIdx(null);
    setQuizScore(0);
    setIsQuizFinished(false);
    setShowHint(false);
    if (practiceItem && practiceItem.id === 'general-challenge') {
      if (selectedDifficulty === 'easy') setTimeLeft(null);
      else if (selectedDifficulty === 'medium') setTimeLeft(25);
      else if (selectedDifficulty === 'hard') setTimeLeft(15);
      else if (selectedDifficulty === 'extreme') setTimeLeft(10);
    } else {
      setTimeLeft(null);
    }
  };

  const closePractice = () => {
    setIsPracticeClosing(true);
    setTimeout(() => {
      setPracticeItem(null);
      setTimeLeft(null);
      setIsPracticeClosing(false);
    }, 250);
  };

  const handleCardClick = (id) => {
    setFlippedCards(prev => {
      const isNowFlipped = !prev[id];
      if (isNowFlipped) {
        setCardsFlipped(fList => fList.includes(id) ? fList : [...fList, id]);
      }
      return {
        ...prev,
        [id]: isNowFlipped
      };
    });
  };

  const featuredTopics = [
    {
      id: 'highcontext',
      title: 'High-Context',
      subtitle: 'Giao tiếp ẩn ý',
      jpName: '空気を読む',
      desc: 'Nghệ thuật thấu hiểu ý nhị, đọc vị nét mặt & tông giọng chốn công sở Nhật.',
      icon: '🤐',
      gradient: 'linear-gradient(135deg, #1abc9c, #16a085)',
      onClick: () => {
        setActiveCategory(prev => prev === 'highcontext' ? 'all' : 'highcontext');
      }
    },
    {
      id: 'ojigi',
      title: 'Ojigi',
      subtitle: 'Văn hóa Cúi chào',
      jpName: 'お辞儀',
      desc: 'Các góc cúi chào chuẩn (15°, 30°, 45°) tương ứng với từng tình huống xã giao.',
      icon: '🙇‍♂️',
      gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      onClick: () => {
        setActiveCategory(prev => prev === 'ojigi' ? 'all' : 'ojigi');
      }
    },
    {
      id: 'hourenso',
      title: 'HouRenSo',
      subtitle: 'Báo cáo & Thảo luận',
      jpName: '報連相',
      desc: 'Xương sống giao tiếp nhóm: Báo cáo (Hou), Liên lạc (Ren), Thảo luận (So).',
      icon: '📞',
      gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
      onClick: () => {
        setActiveCategory(prev => prev === 'hourenso' ? 'all' : 'hourenso');
      }
    },
    {
      id: 'nomikai',
      title: 'Nomikai',
      subtitle: 'Tiệc rượu công sở',
      jpName: '飲み会',
      desc: 'Gắn kết đồng nghiệp sếp - lính qua các bữa tiệc giao lưu sau giờ làm việc.',
      icon: '🍻',
      gradient: 'linear-gradient(135deg, #f1c40f, #f39c12)',
      onClick: () => {
        setActiveCategory(prev => prev === 'nomikai' ? 'all' : 'nomikai');
      }
    }
  ];

  const generalChallengeRecord = useMemo(() => {
    const list = challengesCompleted.filter(c => c.cardId === 'general-challenge');
    if (list.length === 0) return null;
    return list.reduce((max, c) => c.score > max.score ? c : max, list[0]);
  }, [challengesCompleted]);

  const handleStartCardQuiz = (e, cardId) => {
    e.stopPropagation();
    setCardQuizStates(prev => ({
      ...prev,
      [cardId]: {
        currentIdx: 0,
        selectedOpt: null,
        score: 0,
        isFinished: false
      }
    }));
  };

  const handleCardQuizAnswer = (e, cardId, optIdx, isCorrect) => {
    e.stopPropagation();
    setCardQuizStates(prev => {
      const state = prev[cardId];
      if (!state || state.selectedOpt !== null) return prev;

      const newScore = isCorrect ? state.score + 1 : state.score;
      playBeep(isCorrect ? 'correct' : 'incorrect');

      return {
        ...prev,
        [cardId]: {
          ...state,
          selectedOpt: optIdx,
          score: newScore
        }
      };
    });
  };

  const handleCardQuizNext = (e, cardId, scenarios) => {
    e.stopPropagation();
    setCardQuizStates(prev => {
      const state = prev[cardId];
      if (!state) return prev;

      if (state.currentIdx < scenarios.length - 1) {
        return {
          ...prev,
          [cardId]: {
            ...state,
            currentIdx: state.currentIdx + 1,
            selectedOpt: null
          }
        };
      } else {
        const finalScore = state.score;
        const total = scenarios.length;

        setChallengesCompleted(prevChallenges => {
          const newChallenge = { cardId, score: finalScore, total };
          const nextList = [...prevChallenges, newChallenge];
          const newTotalScore = nextList.reduce((acc, c) => acc + c.score, 0);
          syncScoreToSharedStore(newTotalScore, nextList);
          return nextList;
        });

        return {
          ...prev,
          [cardId]: {
            ...state,
            isFinished: true
          }
        };
      }
    });
  };

  const handleCardQuizReset = (e, cardId) => {
    e.stopPropagation();
    setCardQuizStates(prev => ({
      ...prev,
      [cardId]: {
        currentIdx: 0,
        selectedOpt: null,
        score: 0,
        isFinished: false
      }
    }));
  };

  const handleCardQuizClose = (e, cardId) => {
    e.stopPropagation();
    setCardQuizStates(prev => {
      const copy = { ...prev };
      delete copy[cardId];
      return copy;
    });
  };

  return (
    <div>
      <ConfettiCanvas active={isQuizFinished && quizScore === practiceItem?.scenarios?.length} />

      <div className="section-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 className="section-title" style={{ fontSize: '2.2rem', color: 'var(--jp-text)', fontWeight: 800 }}>
          Sổ tay Văn hóa <span style={{ color: 'var(--jp-red)' }}>Nhật Bản</span>
        </h2>
        <p className="section-subtitle" style={{ fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Học văn hóa chuẩn Nhật qua Flashcard 3D thông minh. Lật thẻ để khám phá các quy tắc "bất thành văn" chốn công sở.
        </p>
      </div>

      {/* Progress Dashboard */}
      <div className="progress-dashboard" style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Flipped Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            📖 Thẻ đã học (Flipped)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--jp-text)', lineHeight: 1 }}>
              {cardsFlippedCount}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--jp-text-muted)', fontWeight: 600 }}>
              / {(Array.isArray(dictionary) ? dictionary : MANNERS_DATA).length}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--jp-bg)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${(Array.isArray(dictionary) ? dictionary : MANNERS_DATA).length ? Math.min(100, Math.round(cardsFlippedCount / (Array.isArray(dictionary) ? dictionary : MANNERS_DATA).length * 100)) : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--jp-blue) 0%, #2ecc71 100%)',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>

        {/* General Challenge record */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            🎯 Thử thách tổng hợp
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--jp-red)', lineHeight: 1 }}>
              {generalChallengeRecord ? `${Math.round(generalChallengeRecord.score * (generalChallengeRecord.difficulty === 'easy' ? 1.0 : generalChallengeRecord.difficulty === 'medium' ? 1.5 : generalChallengeRecord.difficulty === 'hard' ? 2.0 : generalChallengeRecord.difficulty === 'extreme' ? 3.0 : 1.0))}` : '0'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--jp-text-muted)', fontWeight: 600 }}>
              {generalChallengeRecord ? `điểm (${generalChallengeRecord.score}/${generalChallengeRecord.total} câu - ${generalChallengeRecord.difficulty === 'easy' ? 'Dễ' : generalChallengeRecord.difficulty === 'medium' ? 'T.Bình' : generalChallengeRecord.difficulty === 'hard' ? 'Khó' : 'Cực khó'})` : 'kỷ lục'}
            </span>
          </div>
          <button
            onClick={() => setShowDifficultyModal(true)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              background: 'linear-gradient(135deg, var(--jp-red) 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(188, 0, 45, 0.25)',
              transition: 'all 0.25s ease',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(188, 0, 45, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(188, 0, 45, 0.25)';
            }}
          >
            🎯 Làm thử thách tổng hợp
          </button>
        </div>

        {/* Medals and badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              🏆 Danh hiệu đạt được
            </span>
            <button
              onClick={() => setShowBadgesModal(true)}
              className="badges-guide-btn"
            >
              Cách nhận danh hiệu
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
            {badgesList.filter(b => b.check()).length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--jp-text-muted)', fontStyle: 'italic' }}>
                Chưa mở khóa danh hiệu nào.
              </span>
            ) : (
              badgesList.filter(b => b.check()).map(badge => (
                <span
                  key={badge.id}
                  style={{
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    background: badge.bg,
                    color: badge.color,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {badge.icon} {badge.name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Leaderboard Mini widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', fontWeight: 700 }}>
                🏆 Bảng xếp hạng Thử thách
              </span>
              <span
                onClick={() => setShowLeaderboardInfo(prev => !prev)}
                style={{
                  background: 'var(--jp-blue-light)',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  aspectRatio: '1 / 1',
                  padding: 0,
                  fontSize: '0.6rem',
                  color: 'var(--jp-blue)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0
                }}
                title="Cách tính điểm"
              >
                i
              </span>
              {showLeaderboardInfo && (
                <div style={{
                  position: 'absolute',
                  top: '22px',
                  left: 0,
                  zIndex: 50,
                  background: 'var(--jp-card-bg)',
                  border: '1px solid var(--jp-border)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  width: '220px',
                  fontSize: '0.72rem',
                  color: 'var(--jp-text)',
                  lineHeight: 1.5
                }} onClick={(e) => e.stopPropagation()}>
                  <strong style={{ color: 'var(--jp-blue)', display: 'block', marginBottom: '0.4rem' }}>💡 Cách tính điểm</strong>
                  <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                    <li>Mỗi câu đúng = <strong>+1 điểm</strong></li>
                    <li>Điểm cộng dồn từ tất cả lần thi</li>
                    <li>Thi lại để cải thiện điểm số</li>
                    <li>Bấm <strong>"🎯 Làm thử thách tổng hợp"</strong> để bắt đầu tích lũy điểm</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến trình học và các thử thách đã lưu không?')) {
                  setCardsFlipped([]);
                  setChallengesCompleted([]);
                  setBookmarkedCards([]);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.7rem',
                color: 'var(--jp-text-muted)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--jp-red)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--jp-text-muted)'}
            >
              Đặt lại
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            background: 'var(--jp-soft-surface)',
            padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid var(--jp-border)'
          }}>
            {leaderboard.slice(0, 3).map((u, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: u.isMe ? 'var(--jp-red)' : 'var(--jp-text)',
                  fontWeight: u.isMe ? 800 : 500,
                  padding: '2px 0'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', maxWidth: '80%' }}>
                  <span style={{ minWidth: '16px', display: 'inline-block', flexShrink: 0 }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {u.avatar && (u.avatar.startsWith('data:') || u.avatar.startsWith('http') || u.avatar.startsWith('https')) ? (
                      <img
                        src={u.avatar}
                        alt="avatar"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          display: 'inline-block',
                          border: '1px solid var(--jp-border)'
                        }}
                      />
                    ) : (
                      <span>{u.avatar || '🧑‍💻'}</span>
                    )}
                  </span>
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {u.name && u.name.startsWith('data:image') ? 'Học viên' : u.name}
                  </span>
                </span>
                <span style={{ fontWeight: 700 }}>
                  {u.score}đ
                </span>
              </div>
            ))}

            {leaderboard.length > 3 && (
              <button
                onClick={() => setShowLeaderboardModal(true)}
                className="leaderboard-view-more"
              >
                <span>Xem thêm ({leaderboard.length - 3} học viên)</span>
                <span style={{ fontSize: '0.8rem' }}>→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Topics filter grid */}
      <div className="featured-topics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {featuredTopics.map(topic => {
          const isActive = activeCategory === topic.id;
          return (
            <div
              key={topic.id}
              onClick={topic.onClick}
              className="featured-topic-card hover-scale"
              style={{
                background: 'var(--jp-card-bg)',
                borderRadius: '16px',
                border: isActive ? '2px solid var(--jp-red)' : '1px solid var(--jp-border)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive ? '0 8px 24px rgba(188, 0, 45, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                aspectRatio: '1 / 1',
                flexShrink: 0,
                borderRadius: '50%',
                background: topic.gradient,
                opacity: 0.15,
                zIndex: 0
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                <span style={{
                  fontSize: '2rem',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  background: topic.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {topic.icon}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--jp-text)' }}>
                    {topic.title}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--jp-text-muted)', display: 'block', fontWeight: 600 }}>
                    {topic.subtitle} • {topic.jpName}
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--jp-text-muted)', lineHeight: '1.4', zIndex: 1 }}>
                {topic.desc}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px dashed var(--jp-border)',
                paddingTop: '0.6rem',
                marginTop: 'auto',
                fontSize: '0.72rem',
                color: isActive ? 'var(--jp-red)' : 'var(--jp-blue)',
                fontWeight: 700
              }}>
                <span>{isActive ? '✓ Đang lọc chủ đề' : 'Xem thẻ học nhanh'}</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Search & Filter Bar */}
      <div style={{
        background: 'var(--jp-card-bg)',
        padding: '1.25rem',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        marginBottom: '3rem',
        border: '1px solid var(--jp-border)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '280px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tình huống, quy tắc (VD: cúi chào, danh thiếp...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '12px',
              border: '2px solid var(--jp-border)',
              fontSize: '1.05rem',
              background: 'var(--jp-bg)',
              color: 'var(--jp-text)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--jp-blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--jp-border)'}
          />
        </div>

        {/* Bookmark filter button */}
        <button
          onClick={() => setShowOnlyBookmarked(prev => !prev)}
          style={{
            padding: '0.9rem 1.5rem',
            borderRadius: '12px',
            border: showOnlyBookmarked ? 'none' : '2px solid var(--jp-border)',
            background: showOnlyBookmarked ? 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)' : 'var(--jp-surface)',
            color: showOnlyBookmarked ? '#fff' : 'var(--jp-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: showOnlyBookmarked ? '0 4px 15px rgba(241, 196, 15, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!showOnlyBookmarked) e.target.style.borderColor = 'var(--jp-blue)';
          }}
          onMouseLeave={(e) => {
            if (!showOnlyBookmarked) e.target.style.borderColor = 'var(--jp-border)';
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={showOnlyBookmarked ? '#fff' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{showOnlyBookmarked ? 'Đang hiện Thẻ Đã Lưu' : 'Thẻ Đã Lưu'}</span>
        </button>
      </div>

      {/* Flashcard Grid */}
      <div className="flashcard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredData.map((item) => {
          const isStarred = bookmarkedCards.includes(item.id);

          return (
            <div
              key={item.id}
              className="flashcard-container"
              onClick={() => handleCardClick(item.id)}
              style={{
                height: '420px',
                perspective: '1000px',
                cursor: 'pointer',
                transform: 'scale(1) translateZ(0)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                borderRadius: '12px',
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'subpixel-antialiased'
              }}
            >
              <div className={`flashcard ${flippedCards[item.id] ? 'flipped' : ''}`} style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d'
              }}>
                {/* Front Face */}
                <div className="card-face card-front" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: '#ffffff',
                  border: '1px solid var(--jp-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-badge" style={{
                      fontSize: '0.65rem',
                      background: 'var(--jp-blue-light)',
                      color: 'var(--jp-blue)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      {getCategoryLabel(getCardGroupCategory(item))}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookmarkedCards(prev => isStarred ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                      }}
                      className="card-bookmark-btn"
                      style={{
                        color: isStarred ? '#f1c40f' : 'var(--jp-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1 / 1',
                        padding: 0
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill={isStarred ? '#f1c40f' : 'none'} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                    <CategoryIcon category={item.category} id={item.id} />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                      <h4 className="card-title-jp" style={{
                        fontSize: '1.25rem',
                        color: 'var(--jp-red)',
                        margin: 0,
                        fontWeight: 700
                      }}>{item.titleJp}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playJapaneseVoice(item.titleJp);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--jp-red)',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        title="Nghe phát âm"
                      >
                        🔊
                      </button>
                    </div>
                    <h5 className="card-title-vi" style={{
                      fontSize: '0.95rem',
                      color: 'var(--jp-blue)',
                      fontWeight: 600,
                      margin: 0
                    }}>{item.titleVi}</h5>
                  </div>

                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--jp-text-muted)',
                    textAlign: 'center',
                    margin: '0.5rem 0',
                    lineHeight: '1.4'
                  }}>
                    {item.frontDesc}
                  </p>

                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    color: 'var(--jp-text-muted)',
                    fontWeight: 600,
                    borderTop: '1px solid var(--jp-border)',
                    paddingTop: '0.75rem',
                    marginTop: 'auto'
                  }}>
                    📖 Nhấn để xem quy tắc NÊN / TRÁNH LÀM
                  </div>
                </div>

                {/* Back Face - Dễ nhìn, hỗ trợ làm thử thách trực tiếp */}
                <div className="card-face card-back" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: 'var(--jp-card-bg)',
                  border: '1px solid var(--jp-border)',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box'
                }}>
                  {/* Absolute Golden Star Bookmark */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookmarkedCards(prev => isStarred ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                    }}
                    className="card-bookmark-btn"
                    style={{
                      color: isStarred ? '#f1c40f' : 'var(--jp-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      aspectRatio: '1 / 1',
                      padding: 0
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill={isStarred ? '#f1c40f' : 'none'} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>

                  {cardQuizStates[item.id] ? (
                    // QUIZ UI inside Card Back
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
                      <div>
                        {/* Quiz Title & Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--jp-border)', paddingBottom: '0.4rem', marginBottom: '0.6rem', paddingRight: '40px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--jp-red)' }}>🎯 Thử thách</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--jp-text-muted)', fontWeight: 600 }}>
                            Câu {cardQuizStates[item.id].isFinished ? item.scenarios.length : cardQuizStates[item.id].currentIdx + 1}/{item.scenarios.length}
                          </span>
                        </div>

                        {!cardQuizStates[item.id].isFinished ? (
                          // Active Scenario Question
                          <div>
                            <p style={{
                              fontSize: '0.78rem',
                              lineHeight: '1.4',
                              color: 'var(--jp-text)',
                              margin: '0 0 0.8rem 0',
                              fontWeight: 600,
                              maxHeight: '110px',
                              overflowY: 'auto',
                              paddingRight: '4px'
                            }}>
                              {item.scenarios[cardQuizStates[item.id].currentIdx].situation}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                              {item.scenarios[cardQuizStates[item.id].currentIdx].options.map((option, oIdx) => {
                                const isSelected = cardQuizStates[item.id].selectedOpt === oIdx;
                                const isCorrect = item.scenarios[cardQuizStates[item.id].currentIdx].correctOption === oIdx;
                                const hasAnswered = cardQuizStates[item.id].selectedOpt !== null;

                                let btnBg = 'var(--jp-surface)';
                                let btnBorder = '1px solid var(--jp-border)';
                                let btnColor = 'var(--jp-text)';

                                if (hasAnswered) {
                                  if (isCorrect) {
                                    btnBg = 'rgba(46, 204, 113, 0.15)';
                                    btnBorder = '1px solid #2ecc71';
                                    btnColor = '#27ae60';
                                  } else if (isSelected) {
                                    btnBg = 'rgba(188, 0, 45, 0.1)';
                                    btnBorder = '1px solid var(--jp-red)';
                                    btnColor = 'var(--jp-red)';
                                  } else {
                                    btnBg = 'var(--jp-surface)';
                                    btnColor = 'var(--jp-text-muted)';
                                    btnBorder = '1px solid var(--jp-border)';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={(e) => handleCardQuizAnswer(e, item.id, oIdx, isCorrect)}
                                    disabled={hasAnswered}
                                    style={{
                                      width: '100%',
                                      padding: '0.55rem 0.75rem',
                                      borderRadius: '8px',
                                      border: btnBorder,
                                      background: btnBg,
                                      color: btnColor,
                                      fontSize: '0.72rem',
                                      fontWeight: isSelected || (hasAnswered && isCorrect) ? 700 : 500,
                                      textAlign: 'left',
                                      cursor: hasAnswered ? 'default' : 'pointer',
                                      transition: 'all 0.15s ease',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    {oIdx === 0 ? 'A. ' : oIdx === 1 ? 'B. ' : 'C. '} {option}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {cardQuizStates[item.id].selectedOpt !== null && (
                              <div style={{
                                marginTop: '0.8rem',
                                padding: '0.55rem 0.75rem',
                                background: 'var(--jp-blue-light)',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--jp-blue)',
                                maxHeight: '90px',
                                overflowY: 'auto'
                              }}>
                                <p style={{ margin: 0, fontSize: '0.68rem', lineHeight: '1.35', color: 'var(--jp-text)' }}>
                                  💡 <strong>Giải thích:</strong> {item.scenarios[cardQuizStates[item.id].currentIdx].explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Quiz Finished Score Summary
                          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.4rem' }}>
                              {cardQuizStates[item.id].score === item.scenarios.length ? '🎉' : '👍'}
                            </span>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--jp-text)' }}>
                              Thử thách hoàn thành!
                            </h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)', margin: '0 0 0.75rem 0' }}>
                              Bạn đúng <strong>{cardQuizStates[item.id].score}/{item.scenarios.length}</strong> câu
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--jp-red)', fontWeight: 700, margin: '0 0 1.25rem 0' }}>
                              +{cardQuizStates[item.id].score}đ tích lũy xếp hạng!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--jp-border)', paddingTop: '0.5rem', marginTop: 'auto' }}>
                        {!cardQuizStates[item.id].isFinished ? (
                          <>
                            <button
                              onClick={(e) => handleCardQuizClose(e, item.id)}
                              style={{
                                flex: 1,
                                padding: '0.45rem 0',
                                borderRadius: '8px',
                                border: '1px solid var(--jp-border)',
                                background: 'none',
                                color: 'var(--jp-text-muted)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Thoát
                            </button>
                            {cardQuizStates[item.id].selectedOpt !== null && (
                              <button
                                onClick={(e) => handleCardQuizNext(e, item.id, item.scenarios)}
                                style={{
                                  flex: 2,
                                  padding: '0.45rem 0',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'var(--jp-blue)',
                                  color: 'white',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {cardQuizStates[item.id].currentIdx < item.scenarios.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => handleCardQuizClose(e, item.id)}
                              style={{
                                flex: 1,
                                padding: '0.45rem 0',
                                borderRadius: '8px',
                                border: '1px solid var(--jp-border)',
                                background: 'none',
                                color: 'var(--jp-text-muted)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Xem Quy tắc
                            </button>
                            <button
                              onClick={(e) => handleCardQuizReset(e, item.id)}
                              style={{
                                flex: 1,
                                padding: '0.45rem 0',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--jp-red)',
                                color: 'white',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Làm lại
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    // REGULAR DO/DONT LISTS UI
                    <>
                      <div>
                        <h4 style={{
                          color: 'var(--jp-blue)',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          marginBottom: '0.6rem',
                          borderBottom: '1px solid var(--jp-border)',
                          paddingBottom: '0.35rem',
                          textAlign: 'center',
                          paddingRight: '24px'
                        }}>
                          {item.titleVi}
                        </h4>

                        <div className="card-do-dont">
                          {/* DO - Nền dịu nhẹ */}
                          <div className="dos" style={{
                            background: 'rgba(46, 204, 113, 0.06)',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                            borderLeft: '3px solid #2ecc71'
                          }}>
                            <h5 style={{
                              fontSize: '0.7rem',
                              color: '#27ae60',
                              fontWeight: 700,
                              margin: '0 0 0.2rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Check size={11} strokeWidth={3} /> NÊN LÀM
                            </h5>
                            <ul style={{ margin: 0, paddingLeft: '0.85rem', fontSize: '0.68rem', color: 'var(--jp-text)', lineHeight: '1.35', maxHeight: '72px', overflowY: 'auto' }}>
                              {(item.dos || []).map((doItem, index) => (
                                <li key={index} style={{ marginBottom: '2px' }}>{doItem}</li>
                              ))}
                            </ul>
                          </div>

                          {/* DONT - Nền dịu nhẹ */}
                          <div className="donts" style={{
                            background: 'rgba(188, 0, 45, 0.05)',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '6px',
                            borderLeft: '3px solid var(--jp-red)'
                          }}>
                            <h5 style={{
                              fontSize: '0.7rem',
                              color: 'var(--jp-red)',
                              fontWeight: 700,
                              margin: '0 0 0.2rem 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <X size={11} strokeWidth={3} /> TRÁNH LÀM
                            </h5>
                            <ul style={{ margin: 0, paddingLeft: '0.85rem', fontSize: '0.68rem', color: 'var(--jp-text)', lineHeight: '1.35', maxHeight: '72px', overflowY: 'auto' }}>
                              {(item.donts || []).map((dontItem, index) => (
                                <li key={index} style={{ marginBottom: '2px' }}>{dontItem}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Challenge start trigger or default footer */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--jp-border)', paddingTop: '0.4rem', marginTop: 'auto' }}>
                        {item.scenarios && item.scenarios.length > 0 && (
                          <button
                            onClick={(e) => handleStartCardQuiz(e, item.id)}
                            style={{
                              width: '100%',
                              padding: '0.45rem 0',
                              background: 'var(--jp-blue-light)',
                              color: 'var(--jp-blue)',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(15, 44, 89, 0.08)'}
                            onMouseLeave={(e) => e.target.style.background = 'var(--jp-blue-light)'}
                          >
                            🎯 Làm thử thách riêng ({item.scenarios.length} câu)
                          </button>
                        )}

                        <div style={{
                          textAlign: 'center',
                          fontSize: '0.68rem',
                          color: 'var(--jp-text-muted)',
                          paddingTop: '2px'
                        }}>
                          Click vào vùng trống để lật lại mặt trước
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quiz Modal/Overlay */}
      {practiceItem && createPortal(
        <div
          className="challenge-overlay"
          onClick={closePractice}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            animation: isPracticeClosing ? 'challengeFadeOut 0.25s ease-in forwards' : 'challengeFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div
            className="challenge-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'var(--jp-card-bg)',
              border: '1px solid var(--jp-border)',
              borderRadius: '20px',
              padding: '1.75rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: isPracticeClosing ? 'popDownOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'popDown 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}
          >
            <button
              className="close-btn"
              onClick={closePractice}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--jp-text-muted)'
              }}
            >
              &times;
            </button>

            {!isQuizFinished ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--jp-red)', fontWeight: 800 }}>
                      {practiceItem.id === 'general-challenge' ? '🏆 THỬ THÁCH TỔNG HỢP' : '🎯 LUYỆN TẬP'}
                    </span>
                    {practiceItem.id === 'general-challenge' && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: 'white',
                        background: selectedDifficulty === 'easy' ? '#27ae60' : selectedDifficulty === 'medium' ? '#2980b9' : selectedDifficulty === 'hard' ? '#e67e22' : '#c0392b',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {selectedDifficulty === 'easy' ? 'Dễ' : selectedDifficulty === 'medium' ? 'Trung bình' : selectedDifficulty === 'hard' ? 'Khó' : 'Cực khó'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--jp-text)' }}>
                    {practiceItem.titleVi}
                  </h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--jp-text-muted)', alignItems: 'center' }}>
                    <span>Tình huống {currentScenarioIdx + 1}/{practiceItem.scenarios.length}</span>
                    {timeLeft !== null && (
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: timeLeft <= 4 ? 'var(--jp-red)' : 'var(--jp-blue)',
                        background: timeLeft <= 4 ? 'rgba(231, 76, 60, 0.15)' : 'var(--jp-blue-light)',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ⏱️ {timeLeft}s
                      </span>
                    )}
                    <span>Đúng: {quizScore}/{currentScenarioIdx + (selectedOptionIdx !== null ? 1 : 0)}</span>
                  </div>

                  {/* Visual Timer Progress Bar */}
                  {timeLeft !== null && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--jp-bg)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
                      <div style={{
                        width: `${(timeLeft / (selectedDifficulty === 'medium' ? 25 : selectedDifficulty === 'hard' ? 15 : 10)) * 100}%`,
                        height: '100%',
                        background: timeLeft > 10 ? '#2ecc71' : timeLeft > 4 ? '#f39c12' : '#e74c3c',
                        transition: 'width 1s linear'
                      }} />
                    </div>
                  )}
                </div>

                {/* Specific mode notifications */}
                {selectedDifficulty === 'extreme' && !isQuizFinished && (
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#c0392b',
                    background: 'rgba(192, 57, 43, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(192, 57, 43, 0.2)',
                    textAlign: 'center'
                  }}>
                    💀 SINH TỬ: Bất kỳ câu trả lời sai hoặc hết giờ nào cũng sẽ kết thúc thử thách!
                  </div>
                )}
                {selectedDifficulty === 'hard' && !isQuizFinished && (
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#e67e22',
                    background: 'rgba(230, 126, 34, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(230, 126, 34, 0.2)',
                    textAlign: 'center'
                  }}>
                    🔥 PHẠT ĐIỂM: Hãy cẩn thận, trả lời sai hoặc hết giờ sẽ bị trừ 0.5 câu đúng!
                  </div>
                )}

                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0, color: 'var(--jp-text)', fontWeight: 600 }}>
                  {practiceItem.scenarios[currentScenarioIdx].situation}
                </p>

                {/* Hint Button in Easy Mode */}
                {selectedDifficulty === 'easy' && selectedOptionIdx === null && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      onClick={() => setShowHint(prev => !prev)}
                      style={{
                        background: 'rgba(241, 196, 15, 0.12)',
                        border: '1px solid #f1c40f',
                        color: '#d35400',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      💡 {showHint ? 'Ẩn Gợi ý' : 'Xem Gợi ý'}
                    </button>
                  </div>
                )}

                {/* Hint text box */}
                {showHint && selectedOptionIdx === null && (
                  <div style={{
                    background: 'rgba(241, 196, 15, 0.05)',
                    border: '1px dashed #f1c40f',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                    color: 'var(--jp-text)'
                  }}>
                    <strong style={{ color: '#d35400' }}>💡 Gợi ý:</strong> {practiceItem.scenarios[currentScenarioIdx].explanation}
                  </div>
                )}

                {/* Time out warning text */}
                {selectedOptionIdx === -1 && (
                  <div style={{
                    background: 'rgba(231, 76, 60, 0.08)',
                    border: '1px solid var(--jp-red)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--jp-red)',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    ⏰ ĐÃ HẾT GIỜ! Bạn không trả lời kịp tình huống này.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {practiceItem.scenarios[currentScenarioIdx].options.map((option, idx) => {
                    const isSelected = selectedOptionIdx === idx;
                    const isCorrect = practiceItem.scenarios[currentScenarioIdx].correctOption === idx;
                    const hasAnswered = selectedOptionIdx !== null;

                    let btnBg = 'var(--jp-surface)';
                    let btnBorder = '1px solid var(--jp-border)';
                    let btnColor = 'var(--jp-text)';

                    if (hasAnswered) {
                      if (isCorrect) {
                        btnBg = 'rgba(46, 204, 113, 0.15)';
                        btnBorder = '1px solid #2ecc71';
                        btnColor = '#27ae60';
                      } else if (isSelected) {
                        btnBg = 'rgba(188, 0, 45, 0.1)';
                        btnBorder = '1px solid var(--jp-red)';
                        btnColor = 'var(--jp-red)';
                      } else {
                        btnBg = 'var(--jp-surface)';
                        btnColor = 'var(--jp-text-muted)';
                        btnBorder = '1px solid var(--jp-border)';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={hasAnswered}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: btnBorder,
                          background: btnBg,
                          color: btnColor,
                          fontSize: '0.85rem',
                          fontWeight: isSelected || (hasAnswered && isCorrect) ? 700 : 500,
                          textAlign: 'left',
                          cursor: hasAnswered ? 'default' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {idx === 0 ? 'A. ' : idx === 1 ? 'B. ' : 'C. '} {option}
                      </button>
                    );
                  })}
                </div>

                {selectedOptionIdx !== null && selectedOptionIdx !== -1 && (
                  <div style={{
                    background: 'var(--jp-soft-surface)',
                    border: '1px solid var(--jp-border)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    lineHeight: '1.4',
                    color: 'var(--jp-text)'
                  }}>
                    <strong style={{ display: 'block', color: 'var(--jp-blue)', marginBottom: '0.25rem' }}>
                      💡 Giải thích chi tiết:
                    </strong>
                    {practiceItem.scenarios[currentScenarioIdx].explanation}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--jp-border)', paddingTop: '0.75rem' }}>
                  <button
                    disabled={selectedOptionIdx === null}
                    onClick={handleNextScenario}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: selectedOptionIdx === null ? 'var(--jp-border)' : 'var(--jp-blue)',
                      color: selectedOptionIdx === null ? 'var(--jp-text-muted)' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: selectedOptionIdx === null ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'background 0.2s'
                    }}
                  >
                    {currentScenarioIdx === practiceItem.scenarios.length - 1 ? 'Xem kết quả' : 'Tình huống tiếp theo'} &rarr;
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.2rem' }}>
                  {quizScore === practiceItem.scenarios.length ? '🎉' : quizScore > 0 ? '👍' : '😢'}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--jp-text)' }}>
                  Thử thách kết thúc!
                </h3>
                
                <div style={{
                  background: 'var(--jp-soft-surface)',
                  border: '1px solid var(--jp-border)',
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--jp-text-muted)' }}>Độ khó:</span>
                    <strong style={{
                      color: selectedDifficulty === 'easy' ? '#27ae60' : selectedDifficulty === 'medium' ? '#2980b9' : selectedDifficulty === 'hard' ? '#e67e22' : selectedDifficulty === 'extreme' ? '#c0392b' : 'var(--jp-text)'
                    }}>
                      {selectedDifficulty === 'easy' ? '🌱 Dễ (x1.0)' : selectedDifficulty === 'medium' ? '📚 Trung bình (x1.5)' : selectedDifficulty === 'hard' ? '🔥 Khó (x2.0)' : selectedDifficulty === 'extreme' ? '💀 Cực khó (x3.0)' : 'Luyện tập'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--jp-text-muted)' }}>Số câu đúng:</span>
                    <strong>{quizScore}/{practiceItem.scenarios.length}</strong>
                  </div>
                  {practiceItem.id === 'general-challenge' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px solid var(--jp-border)', paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--jp-text-muted)', fontWeight: 700 }}>Điểm tích lũy:</span>
                      <strong style={{ color: 'var(--jp-red)', fontSize: '1rem' }}>
                        +{Math.round(quizScore * (selectedDifficulty === 'easy' ? 1.0 : selectedDifficulty === 'medium' ? 1.5 : selectedDifficulty === 'hard' ? 2.0 : selectedDifficulty === 'extreme' ? 3.0 : 1.0))}đ
                      </strong>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--jp-text-muted)', margin: '0.5rem 0' }}>
                  {quizScore === practiceItem.scenarios.length ? 'Xuất sắc! Bạn đã làm chủ hoàn toàn các tình huống này.' : 'Hãy tiếp tục rèn luyện để nâng cao kỹ năng ứng xử nhé!'}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%', maxWidth: '350px' }}>
                  <button
                    onClick={closePractice}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: '1px solid var(--jp-border)',
                      background: 'none',
                      color: 'var(--jp-text)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--jp-bg)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Xem sổ tay
                  </button>
                  <button
                    onClick={resetPractice}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--jp-red) 0%, #c0392b 100%)',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(188, 0, 45, 0.2)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Leaderboard Modal Portal */}
      {showLeaderboardModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: isLeaderboardClosing ? 'fadeOut 0.25s ease-in forwards' : 'fadeIn 0.25s ease-out forwards'
          }}
          onClick={handleCloseLeaderboard}
        >
          <div
            className="leaderboard-modal-card"
            style={{
              width: '90%',
              maxWidth: '450px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.15)',
              padding: '1.75rem',
              color: 'var(--jp-text)',
              animation: isLeaderboardClosing ? 'scaleDown 0.25s ease-in forwards' : 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              position: 'relative',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <span
              onClick={handleCloseLeaderboard}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                aspectRatio: '1 / 1',
                padding: 0,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--jp-text-muted)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 0.1)';
                e.target.style.color = 'var(--jp-red)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.05)';
                e.target.style.color = 'var(--jp-text-muted)';
              }}
            >
              ✕
            </span>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🏆</span>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--jp-blue)',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Bảng Xếp Hạng Lễ Nghi
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--jp-text-muted)',
                margin: '4px 0 0 0'
              }}>
                Nền tảng NihonBot · Học viên xuất sắc nhất
              </p>
            </div>

            {/* Leaderboard List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              paddingRight: '4px',
              marginRight: '-4px'
            }}>
              {leaderboard.map((u, idx) => {
                const isMe = u.isMe;
                const isTop3 = idx < 3;
                return (
                  <div
                    key={idx}
                    className={`leaderboard-modal-item ${isMe ? 'is-me' : isTop3 ? 'top-three' : ''}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      color: isMe ? 'var(--jp-red)' : 'var(--jp-text)',
                      fontWeight: isMe ? 800 : 500,
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '24px',
                        fontWeight: 800,
                        fontSize: isTop3 ? '1.15rem' : '0.8rem',
                        color: 'var(--jp-text-muted)'
                      }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </span>
                      {u.avatar && (u.avatar.startsWith('data:') || u.avatar.startsWith('http') || u.avatar.startsWith('https')) ? (
                        <img
                          src={u.avatar}
                          alt="avatar"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid var(--jp-border)'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '1.25rem' }}>{u.avatar || '🧑‍💻'}</span>
                      )}
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px'
                      }}>
                        {u.name && u.name.startsWith('data:image') ? 'Học viên' : u.name}
                        {isMe && <span style={{
                          fontSize: '0.62rem',
                          background: 'var(--jp-red)',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          marginLeft: '6px',
                          fontWeight: 700
                        }}>Bạn</span>}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{u.score}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)' }}>điểm</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.7rem',
              color: 'var(--jp-text-muted)'
            }}>
              💡 Tích lũy thêm điểm bằng cách tham gia Thử thách tổng hợp!
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Badges Modal Portal */}
      {showBadgesModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: isBadgesClosing ? 'fadeOut 0.25s ease-in forwards' : 'fadeIn 0.25s ease-out forwards'
          }}
          onClick={handleCloseBadgesModal}
        >
          <div
            className="leaderboard-modal-card"
            style={{
              width: '90%',
              maxWidth: '450px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.15)',
              padding: '1.75rem',
              color: 'var(--jp-text)',
              animation: isBadgesClosing ? 'scaleDown 0.25s ease-in forwards' : 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              position: 'relative',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <span
              onClick={handleCloseBadgesModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                aspectRatio: '1 / 1',
                padding: 0,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--jp-text-muted)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 0.1)';
                e.target.style.color = 'var(--jp-red)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.05)';
                e.target.style.color = 'var(--jp-text-muted)';
              }}
            >
              ✕
            </span>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🏆</span>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--jp-blue)',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Danh Sách Danh Hiệu
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--jp-text-muted)',
                margin: '4px 0 0 0'
              }}>
                Tích lũy tiến độ học tập để mở khóa
              </p>
            </div>

            {/* Badges List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingRight: '4px',
              marginRight: '-4px'
            }}>
              {badgesList.map((badge) => {
                const isUnlocked = badge.check();
                return (
                  <div
                    key={badge.id}
                    className="leaderboard-modal-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      opacity: isUnlocked ? 1 : 0.5,
                      border: isUnlocked ? `1px solid ${badge.color}33` : '1px solid var(--jp-border)',
                      background: isUnlocked ? `${badge.color}08` : 'var(--jp-surface)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '1.6rem',
                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isUnlocked ? badge.bg : 'var(--jp-bg)',
                        border: isUnlocked ? `1px solid ${badge.color}1a` : 'none'
                      }}>
                        {badge.icon}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: isUnlocked ? badge.color : 'var(--jp-text)'
                        }}>
                          {badge.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)' }}>
                          {badge.desc}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#27ae60',
                          background: 'rgba(46, 204, 113, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '20px'
                        }}>
                          Đã mở khóa
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: 'var(--jp-text-muted)',
                          background: 'var(--jp-bg)',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          🔒 Khóa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Difficulty Selection Modal Portal */}
      {showDifficultyModal && createPortal(
        <div
          className="challenge-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: isDifficultyClosing ? 'challengeFadeOut 0.25s ease-in forwards' : 'challengeFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          onClick={handleCloseDifficultyModal}
        >
          <div
            className="leaderboard-modal-card challenge-modal-card"
            style={{
              width: '90%',
              maxWidth: '480px',
              borderRadius: '24px',
              padding: '1.75rem',
              color: 'var(--jp-text)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: isDifficultyClosing ? 'popDownOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'popDown 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <span
              onClick={handleCloseDifficultyModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                aspectRatio: '1 / 1',
                padding: 0,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--jp-text-muted)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 0.1)';
                e.target.style.color = 'var(--jp-red)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.05)';
                e.target.style.color = 'var(--jp-text-muted)';
              }}
            >
              ✕
            </span>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎯</span>
              <h3 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--jp-red)',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Chọn Độ Khó Thử Thách
              </h3>
              <p style={{
                fontSize: '0.78rem',
                color: 'var(--jp-text-muted)',
                margin: '4px 0 0 0'
              }}>
                Quy tắc càng khó, điểm tích lũy nhận được càng cao!
              </p>
            </div>

            {/* Difficulty Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  id: 'easy',
                  name: 'Dễ',
                  icon: '🌱',
                  desc: '5 câu • Không thời gian • Có nút xem Gợi ý',
                  mult: 'x1.0 điểm',
                  color: '#27ae60',
                  bg: 'rgba(46, 204, 113, 0.08)'
                },
                {
                  id: 'medium',
                  name: 'Trung bình',
                  icon: '📚',
                  desc: '10 câu • 25 giây/câu • Không xem gợi ý',
                  mult: 'x1.5 điểm',
                  color: '#2980b9',
                  bg: 'rgba(52, 152, 219, 0.08)'
                },
                {
                  id: 'hard',
                  name: 'Khó',
                  icon: '🔥',
                  desc: '15 câu • 15 giây/câu • Sai bị trừ 0.5 câu',
                  mult: 'x2.0 điểm',
                  color: '#e67e22',
                  bg: 'rgba(230, 126, 34, 0.08)'
                },
                {
                  id: 'extreme',
                  name: 'Cực khó (Sinh tử)',
                  icon: '💀',
                  desc: '20 câu • 10 giây/câu • Trả lời sai 1 câu = Thất bại ngay',
                  mult: 'x3.0 điểm',
                  color: '#c0392b',
                  bg: 'rgba(192, 57, 43, 0.08)'
                }
              ].map((diff) => (
                <div
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    border: selectedDifficulty === diff.id ? `2px solid ${diff.color}` : '2px solid var(--jp-border)',
                    background: selectedDifficulty === diff.id ? diff.bg : 'var(--jp-surface)',
                    transform: selectedDifficulty === diff.id ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedDifficulty === diff.id ? `0 6px 15px ${diff.color}15` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{diff.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: diff.color }}>{diff.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)' }}>{diff.desc}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'white',
                    background: diff.color,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {diff.mult}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleCloseDifficultyModal}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--jp-border)',
                  background: 'none',
                  color: 'var(--jp-text)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--jp-bg)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowDifficultyModal(false);
                  startGeneralChallenge(selectedDifficulty);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--jp-red) 0%, #c0392b 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(188, 0, 45, 0.2)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔥 Bắt đầu
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Keyframe animations and dark mode overrides for modal and dashboard */}
      <style>{`
        @keyframes popDown {
          0% {
            opacity: 0;
            transform: translateY(-120px) scale(0.85);
            filter: blur(8px);
          }
          65% {
            opacity: 1;
            transform: translateY(12px) scale(1.02);
            filter: none;
          }
          85% {
            transform: translateY(-4px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .challenge-overlay {
          animation: challengeFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes challengeFadeIn {
          from {
            background: rgba(15, 23, 42, 0);
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }
          to {
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        }

        .challenge-modal-card {
          animation: popDown 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleDown {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }

        /* Progress Dashboard glassmorphism themes */
        .progress-dashboard {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        }
        :root[data-theme="dark"] .progress-dashboard {
          background: rgba(26, 29, 46, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        /* Leaderboard Modal glassmorphism themes */
        .leaderboard-modal-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        :root[data-theme="dark"] .leaderboard-modal-card {
          background: rgba(26, 29, 46, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Modal list items themes */
        .leaderboard-modal-item {
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .leaderboard-modal-item.top-three {
          background: rgba(255, 255, 255, 0.6);
        }
        .leaderboard-modal-item.is-me {
          background: linear-gradient(135deg, rgba(188, 0, 45, 0.08) 0%, rgba(188, 0, 45, 0.03) 100%);
          border: 1px solid rgba(188, 0, 45, 0.2);
          box-shadow: 0 4px 15px rgba(188, 0, 45, 0.05);
        }

        :root[data-theme="dark"] .leaderboard-modal-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        :root[data-theme="dark"] .leaderboard-modal-item.top-three {
          background: rgba(255, 255, 255, 0.07);
        }
        :root[data-theme="dark"] .leaderboard-modal-item.is-me {
          background: linear-gradient(135deg, rgba(232, 54, 93, 0.15) 0%, rgba(232, 54, 93, 0.05) 100%);
          border: 1px solid rgba(232, 54, 93, 0.3);
          box-shadow: 0 4px 15px rgba(232, 54, 93, 0.08);
        }

        /* Leaderboard View More button styling */
        .leaderboard-view-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          margin-top: 0.6rem;
          padding: 0.5rem 1rem;
          background: rgba(52, 152, 219, 0.08);
          border: 1px solid rgba(52, 152, 219, 0.18);
          color: var(--jp-blue);
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .leaderboard-view-more:hover {
          background: var(--jp-blue);
          color: white;
          border-color: var(--jp-blue);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
        }

        .leaderboard-view-more:active {
          transform: translateY(0);
        }

        /* Dark mode overrides */
        :root[data-theme="dark"] .leaderboard-view-more {
          background: rgba(52, 152, 219, 0.12);
          border: 1px solid rgba(52, 152, 219, 0.25);
          color: #3498db;
        }

        :root[data-theme="dark"] .leaderboard-view-more:hover {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        /* Badges Guide Button styling */
        .badges-guide-btn {
          background: rgba(52, 152, 219, 0.08);
          border: 1px solid rgba(52, 152, 219, 0.2);
          color: var(--jp-blue);
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: auto;
          text-decoration: none;
        }

        .badges-guide-btn:hover {
          background: var(--jp-blue);
          color: white;
          border-color: var(--jp-blue);
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
        }

        .badges-guide-btn:active {
          transform: scale(0.98);
        }

        /* Dark mode overrides */
        :root[data-theme="dark"] .badges-guide-btn {
          background: rgba(52, 152, 219, 0.12);
          border: 1px solid rgba(52, 152, 219, 0.25);
          color: #3498db;
        }

        :root[data-theme="dark"] .badges-guide-btn:hover {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        /* Card Bookmark Button styling */
        .card-bookmark-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--jp-border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          aspect-ratio: 1 / 1;
          flex-shrink: 0;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
          z-index: 10;
        }

        /* Dark mode overrides */
        :root[data-theme="dark"] .card-bookmark-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        :root[data-theme="dark"] .card-bookmark-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}
