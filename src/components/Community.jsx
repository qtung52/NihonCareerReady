import { useState, useEffect } from 'react';
import { Send, MessageSquare, Tag, MessageCircle, Trash2, X, Briefcase, ChevronDown, ChevronUp, Heart, Search, MoreVertical, Edit3 } from 'lucide-react';
import { getSharedArray, isSupabaseEnabled, setSharedArray } from '../lib/sharedStore';

export const FORUM_TOPICS = [
  { id: 'culture-shock', name: 'Sốc văn hóa', colorClass: 'culture-shock' },
  { id: 'interview', name: 'Phỏng vấn / Shukatsu', colorClass: 'interview' },
  { id: 'tips', name: 'Mẹo làm việc', colorClass: 'tips' },
  { id: 'office-etiquette', name: 'Ứng xử công sở', colorClass: 'office-etiquette' },
  { id: 'communication', name: 'Kỹ năng giao tiếp', colorClass: 'communication' },
  { id: 'business-japanese', name: 'Tiếng Nhật công sở', colorClass: 'business-japanese' },
  { id: 'career-guidance', name: 'Định hướng sự nghiệp', colorClass: 'career-guidance' }
];

const INITIAL_THREADS = [
  {
    id: 1,
    tag: 'culture-shock',
    tagName: 'Sốc văn hóa',
    title: "Văn hóa Nomikai (Tiệc rượu công sở) - Có bắt buộc tham gia không?",
    author: "Kouhai_K9",
    authorEmail: "kouhai@nihon.com",
    date: "2026-06-11T07:40:00Z", // Fixed ISO string representing a past time
    content: "Mọi người ơi, em chuẩn bị đi thực tập ở một công ty Nhật. Em nghe bảo đi làm bên Nhật tối ngày phải đi nhậu với sếp đúng không ạ? Em không biết uống bia rượu thì có sao không và có quy tắc gì đặc biệt khi rót bia cho sếp không ạ?",
    likes: ["minh@nihon.com", "trang@nihon.com"],
    answers: [
      {
        id: 101,
        author: "Senpai_Minh_N3",
        authorEmail: "minh@nihon.com",
        role: "Senpai (3 năm kinh nghiệm)",
        date: "2026-06-11T09:40:00Z", // Fixed ISO string representing a past time
        content: "Chào em. Hiện nay văn hóa Nhật cũng thoáng hơn rồi, nếu không uống được rượu em cứ mạnh dạn gọi nước ngọt/trà ô long nhé, không ai ép đâu. Tuy nhiên có vài quy tắc cực kỳ quan trọng: 1. Đợi sếp hô 'Kanpai' nâng ly xong mình mới uống. 2. Khi rót bia cho sếp, phải cầm chai bằng cả 2 tay, nhãn chai hướng lên trên để sếp nhìn rõ nhãn hiệu. 3. Khi chạm cốc, hãy để cốc của mình thấp hơn cốc của sếp một chút nhé!"
      }
    ]
  },
  {
    id: 2,
    tag: 'interview',
    tagName: 'Phỏng vấn / Shukatsu',
    title: "Sốc văn hóa khi tự ý sửa lỗi báo cáo mà không nói sếp",
    author: "Thu_Trang_2k3",
    authorEmail: "trang@nihon.com",
    date: "2026-06-10T17:40:00Z", // Fixed ISO string representing a past time
    content: "Em mới đi làm tuần đầu, lỡ tay nhập sai một số liệu nhỏ trong báo cáo. Em tự phát hiện ra và sửa lại ngay lập tức. Nhưng lúc sếp phát hiện em tự sửa mà không báo cáo, sếp đã mắng em rất nghiêm trọng trước văn phòng. Em thấy rất tủi thân, lỗi nhỏ thôi mà sếp làm quá vậy ạ?",
    likes: ["hieu@nihon.com"],
    answers: [
      {
        id: 102,
        author: "Senpai_Hieu_FPT",
        authorEmail: "hieu@nihon.com",
        role: "Tech Lead",
        date: "2026-06-10T21:40:00Z", // Fixed ISO string representing a past time
        content: "Hi em, sếp mắng là đúng đấy! Trong môi trường Nhật, sự trung thực và tính minh bạch là số 1. Quy tắc Hou-Ren-So quy định rõ: khi phát hiện lỗi (dù cực nhỏ), việc đầu tiên là phải báo cáo ngay cho cấp trên để họ biết tình hình. Việc em tự ý sửa mà không báo cáo bị coi là tự tiện và che giấu thông tin (Houchi). Đừng buồn nhé, hãy rút kinh nghiệm và chủ động báo cáo nhiều hơn."
      }
    ]
  }
];

// Calculate relative time (e.g. "2 giờ trước") from a fixed date
function timeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date)) return isoString;

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) return 'Vừa xong';
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

// Mask email for privacy: nguyen.van.a@gmail.com → ngu****@***.com
function maskEmail(email) {
  if (!email) return 'Ẩn danh';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.slice(0, Math.min(3, local.length)) + '****';
  const domainParts = domain.split('.');
  const maskedDomain = '***.' + domainParts[domainParts.length - 1];
  return `${maskedLocal}@${maskedDomain}`;
}

export default function Community({ currentUser, onViewProfile }) {
  const [threads, setThreads] = useState([]);
  const [activeTag, setActiveTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Post question form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('culture-shock');

  // Reply state
  const [replyTexts, setReplyTexts] = useState({});
  const [expandedThreads, setExpandedThreads] = useState({});

  const toggleExpand = (threadId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  // Edit & Dropdown Action Menu states
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editingThreadTitle, setEditingThreadTitle] = useState('');
  const [editingThreadContent, setEditingThreadContent] = useState('');
  const [editingThreadTag, setEditingThreadTag] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

  const [syncStatus, setSyncStatus] = useState('loading'); // loading | online | offline
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadThreads = async ({ silent = false } = {}) => {
      if (!silent) setSyncStatus('loading');
      try {
        const sharedThreads = await getSharedArray('threads', INITIAL_THREADS);
        const sharedUsers = await getSharedArray('users', []);
        if (!isMounted) return;
        setThreads(sharedThreads);
        setUsers(sharedUsers);
        setSyncStatus(isSupabaseEnabled ? 'online' : 'local');
      } catch {
        if (!isMounted) return;
        const localThreads = localStorage.getItem('nihon_threads');
        const fallbackThreads = localThreads ? JSON.parse(localThreads) : INITIAL_THREADS;
        setThreads(fallbackThreads);
        localStorage.setItem('nihon_threads', JSON.stringify(fallbackThreads));
        setSyncStatus('offline');
      }
    };

    loadThreads();
    const interval = setInterval(() => loadThreads({ silent: true }), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const saveThreads = async (updatedThreads) => {
    setThreads(updatedThreads);
    localStorage.setItem('nihon_threads', JSON.stringify(updatedThreads));
    try {
      const target = await setSharedArray('threads', updatedThreads);
      setSyncStatus(target === 'supabase' ? 'online' : target === 'local-api' ? 'local' : 'offline');
    } catch {
      setSyncStatus('offline');
    }
  };

  const handlePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedTopic = FORUM_TOPICS.find(t => t.id === newTag);
    const newThread = {
      id: Date.now(),
      tag: newTag,
      tagName: matchedTopic ? matchedTopic.name : 'Khác',
      title: newTitle,
      author: currentUser ? currentUser.name : "Học viên ẩn danh",
      authorEmail: currentUser ? currentUser.email : "anonymous@nihon.com",
      date: new Date().toISOString(),
      content: newContent,
      answers: []
    };

    const updated = [newThread, ...threads];
    saveThreads(updated);
    
    setNewTitle('');
    setNewContent('');
  };

  const handleStartEditThread = (thread) => {
    setEditingThreadId(thread.id);
    setEditingThreadTitle(thread.title);
    setEditingThreadContent(thread.content);
    setEditingThreadTag(thread.tag);
    setActiveMenu(null); // close dropdown
  };

  const handleSaveEditThread = (threadId) => {
    if (!editingThreadTitle.trim() || !editingThreadContent.trim()) return;
    const matchedTopic = FORUM_TOPICS.find(t => t.id === editingThreadTag);
    const updated = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          title: editingThreadTitle.trim(),
          content: editingThreadContent.trim(),
          tag: editingThreadTag,
          tagName: matchedTopic ? matchedTopic.name : t.tagName
        };
      }
      return t;
    });
    saveThreads(updated);
    setEditingThreadId(null);
  };

  const handleStartEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyContent(reply.content);
    setActiveMenu(null); // close dropdown
  };

  const handleSaveEditReply = (threadId, replyId) => {
    if (!editingReplyContent.trim()) return;
    const updated = threads.map(t => {
      if (t.id === threadId) {
        const updatedAnswers = t.answers.map(ans => {
          if (ans.id === replyId) {
            return {
              ...ans,
              content: editingReplyContent.trim()
            };
          }
          return ans;
        });
        return {
          ...t,
          answers: updatedAnswers
        };
      }
      return t;
    });
    saveThreads(updated);
    setEditingReplyId(null);
  };

  const handleAddReply = (threadId) => {
    const text = replyTexts[threadId];
    if (!text || !text.trim()) return;

    const updated = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          answers: [
            ...t.answers,
            {
              id: Date.now() + Math.random(),
              author: currentUser ? currentUser.name : "Thành viên",
              authorEmail: currentUser ? currentUser.email : "anonymous@nihon.com",
              role: currentUser && currentUser.isAdmin ? "Quản trị viên" : currentUser && currentUser.isSenpai ? "Senpai" : "Học viên",
              date: new Date().toISOString(),
              content: text.trim()
            }
          ]
        };
      }
      return t;
    });

    saveThreads(updated);
    setReplyTexts(prev => ({
      ...prev,
      [threadId]: ''
    }));
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: true
    }));
  };

  const handleDeleteThread = (threadId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
      const updated = threads.filter(t => t.id !== threadId);
      saveThreads(updated);
    }
  };

  const handleDeleteReply = (threadId, replyId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu trả lời này không?")) {
      const updated = threads.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            answers: t.answers.filter(ans => ans.id !== replyId)
          };
        }
        return t;
      });
      saveThreads(updated);
    }
  };

  const handleLikeThread = (threadId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích câu hỏi!");
      return;
    }
    const userEmail = currentUser.email;
    const updated = threads.map(t => {
      if (t.id === threadId) {
        const likes = t.likes || [];
        const isLiked = likes.includes(userEmail);
        const updatedLikes = isLiked 
          ? likes.filter(email => email !== userEmail) 
          : [...likes, userEmail];
        return {
          ...t,
          likes: updatedLikes
        };
      }
      return t;
    });
    saveThreads(updated);
  };

  const renderAvatar = (email, size = '16px') => {
    if (email === 'admin@nihon.com') {
      return <span style={{ fontSize: size }}>🦊</span>;
    }
    const u = users.find(user => user.email === email);
    const avatar = u?.avatar || '🧑‍💻';
    if (avatar.startsWith('data:')) {
      return <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
    }
    return <span style={{ fontSize: size }}>{avatar}</span>;
  };

  const getUserRole = (email, fallbackRole) => {
    const userObj = users.find(u => u.email === email);
    if (userObj) {
      if (userObj.isAdmin) return 'Quản trị viên';
      if (userObj.isSenpai) return 'Senpai';
      return 'Học viên';
    }
    return fallbackRole || 'Học viên';
  };


  const handleReplyTextChange = (threadId, val) => {
    setReplyTexts(prev => ({
      ...prev,
      [threadId]: val
    }));
  };

  const filteredThreads = threads
    .filter(t => {
      const matchesTag = activeTag === 'all' || t.tag === activeTag;
      const matchesSearch = searchQuery.trim() === '' || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        const aLikes = a.likes?.length || 0;
        const bLikes = b.likes?.length || 0;
        return bLikes - aLikes;
      }
      if (sortBy === 'replies') {
        const aReplies = a.answers?.length || 0;
        const bReplies = b.answers?.length || 0;
        return bReplies - aReplies;
      }
      if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      }
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Góc Senpai - Kouhai</h2>
        <p className="section-subtitle">Diễn đàn thảo luận thời gian thực. Nơi hỏi đáp và chia sẻ kinh nghiệm văn hóa doanh nghiệp Nhật.</p>
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.78rem',
          color: syncStatus === 'online' || syncStatus === 'local' ? '#27ae60' : syncStatus === 'loading' ? 'var(--jp-text-muted)' : 'var(--jp-red)',
          fontWeight: 600
        }}>
          {syncStatus === 'online'
            ? 'Đang đồng bộ qua Supabase'
            : syncStatus === 'local'
            ? 'Đang đồng bộ qua API local'
            : syncStatus === 'loading'
            ? 'Đang tải dữ liệu cộng đồng...'
            : 'Community API chưa bật - đang dùng dữ liệu riêng trên trình duyệt này'}
        </p>
      </div>

      <div className="community-layout">
        {/* Left Side: Threads List */}
        <div>
          <div className="filter-tabs" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <button className={`tab-btn ${activeTag === 'all' ? 'active' : ''}`} onClick={() => setActiveTag('all')}>Tất cả</button>
            {FORUM_TOPICS.map(topic => (
              <button 
                key={topic.id} 
                className={`tab-btn ${activeTag === topic.id ? 'active' : ''}`} 
                onClick={() => setActiveTag(topic.id)}
              >
                {topic.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm kiếm câu hỏi, từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', borderRadius: '30px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '0.3rem 2rem 0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', height: 'auto', border: '1px solid var(--jp-border)' }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="popular">Yêu thích nhất</option>
                <option value="replies">Thảo luận nhiều</option>
              </select>
            </div>
          </div>

          <div className="question-list">
            {filteredThreads.map(thread => {
              const canDeleteThread = currentUser && (currentUser.isAdmin || currentUser.email === thread.authorEmail);
              const likesList = thread.likes || [];
              const isLiked = currentUser ? likesList.includes(currentUser.email) : false;
              const likesCount = likesList.length;
              
              if (editingThreadId === thread.id) {
                return (
                  <div key={thread.id} className="q-card">
                    <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--jp-border)', paddingBottom: '0.5rem' }}>
                      Chỉnh sửa câu hỏi
                    </h3>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Chủ đề</label>
                      <select 
                        className="form-input" 
                        value={editingThreadTag} 
                        onChange={(e) => setEditingThreadTag(e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                      >
                        {FORUM_TOPICS.map(topic => (
                          <option key={topic.id} value={topic.id}>{topic.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tiêu đề câu hỏi</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingThreadTitle} 
                        onChange={(e) => setEditingThreadTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Nội dung chi tiết</label>
                      <textarea 
                        className="form-textarea" 
                        value={editingThreadContent} 
                        onChange={(e) => setEditingThreadContent(e.target.value)}
                        style={{ minHeight: '120px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setEditingThreadId(null)}>Hủy</button>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleSaveEditThread(thread.id)}>Lưu</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={thread.id} className="q-card">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`q-tag ${thread.tag}`}>
                        <Tag size={10} style={{ marginRight: '3px', display: 'inline' }} />
                        {thread.tagName}
                      </span>
                      <span className="q-meta" style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', verticalAlign: 'middle' }}>
                        Đăng bởi{' '}
                        <div 
                          style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--jp-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                          onClick={() => onViewProfile && onViewProfile(thread.authorEmail, thread.author, getUserRole(thread.authorEmail))}
                          title="Xem thông tin người dùng"
                        >
                          {renderAvatar(thread.authorEmail, '10px')}
                        </div>
                        <strong 
                          style={{ cursor: 'pointer', color: 'var(--jp-blue)', textDecoration: 'underline' }}
                          onClick={() => onViewProfile && onViewProfile(thread.authorEmail, thread.author, getUserRole(thread.authorEmail))}
                          title="Xem thông tin người dùng"
                        >
                          {thread.author}
                        </strong>{' '}
                        • {timeAgo(thread.date) || thread.date}
                      </span>
                    </div>
                    {currentUser && (currentUser.email === thread.authorEmail || currentUser.isAdmin) && (
                      <div className="action-menu-container">
                        <button 
                          className="action-dropdown-btn"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveMenu(activeMenu?.type === 'thread' && activeMenu.id === thread.id ? null : { type: 'thread', id: thread.id });
                          }}
                          title="Hành động"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {activeMenu?.type === 'thread' && activeMenu.id === thread.id && (
                          <>
                            <div 
                              style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} 
                              onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} 
                            />
                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="action-dropdown-item"
                                onClick={() => handleStartEditThread(thread)}
                              >
                                <Edit3 size={14} /> Sửa bài
                              </button>
                              <button 
                                className="action-dropdown-item delete"
                                onClick={() => { setActiveMenu(null); handleDeleteThread(thread.id); }}
                              >
                                <Trash2 size={14} /> Xóa bài
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="q-title">{thread.title}</h3>
                  <p className="q-content">{thread.content}</p>

                  <div className="q-answers" style={{ borderTop: '1px solid var(--jp-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => handleLikeThread(thread.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          color: isLiked ? 'var(--jp-red)' : 'var(--jp-text-muted)',
                          padding: 0
                        }}
                        className="like-btn"
                        title={isLiked ? "Bỏ thích" : "Thích câu hỏi này"}
                      >
                        <Heart size={16} fill={isLiked ? 'var(--jp-red)' : 'none'} style={{ transition: 'fill 0.2s' }} />
                        <span style={{ fontWeight: 600 }}>Thích ({likesCount})</span>
                      </button>

                      <div 
                        style={{ fontSize: '0.85rem', color: 'var(--jp-blue)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                        onClick={() => toggleExpand(thread.id)}
                      >
                        <MessageSquare size={16} /> Trả lời ({thread.answers.length})
                        <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
                          {expandedThreads[thread.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                    </div>
                    
                    {expandedThreads[thread.id] && (
                      <div className="answers-dropdown-container">
                        {thread.answers.map((ans) => {
                          const canDeleteReply = currentUser && (currentUser.isAdmin || currentUser.email === ans.authorEmail);
                          const displayRole = getUserRole(ans.authorEmail, ans.role);
                          const isAdmin = displayRole === 'Quản trị viên';
                          const isSenpai = displayRole.includes('Senpai') || displayRole.includes('Tech Lead') || displayRole.includes('Leader');
                          
                          if (editingReplyId === ans.id) {
                            return (
                              <div key={ans.id || `ans-${Math.random()}`} className="fb-comment-wrapper" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                <div 
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--jp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}
                                  onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                                  title="Xem thông tin người dùng"
                                >
                                  {renderAvatar(ans.authorEmail, '16px')}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                                  <div style={{ width: '100%' }}>
                                    <textarea
                                      className="form-textarea"
                                      value={editingReplyContent}
                                      onChange={(e) => setEditingReplyContent(e.target.value)}
                                      style={{ minHeight: '60px', fontSize: '0.85rem', width: '100%', marginBottom: '0.5rem', background: 'var(--jp-surface-raised)' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setEditingReplyId(null)}>Hủy</button>
                                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleSaveEditReply(thread.id, ans.id)}>Lưu</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={ans.id || `ans-${Math.random()}`} className="fb-comment-wrapper" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                              <div 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--jp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}
                                onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                                title="Xem thông tin người dùng"
                              >
                                {renderAvatar(ans.authorEmail, '16px')}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 'calc(100% - 40px)', position: 'relative', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                                  <div className="fb-comment-bubble" style={{ background: 'var(--jp-surface-raised)', padding: '8px 12px', borderRadius: '18px', display: 'inline-block', flex: 1 }}>
                                    <span 
                                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}
                                      onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                                      title="Xem thông tin người dùng"
                                    >
                                      <strong style={{ fontSize: '0.85rem' }}>{ans.author}</strong>
                                      <span 
                                        className={isAdmin ? 'admin-rgb-tag' : ''}
                                        style={{ 
                                          fontSize: '0.65rem', 
                                          background: !isAdmin && isSenpai ? 'var(--jp-blue)' : !isAdmin ? 'var(--jp-border)' : undefined, 
                                          color: !isAdmin && isSenpai ? 'white' : !isAdmin ? 'var(--jp-text-muted)' : undefined, 
                                          padding: '2px 6px', 
                                          borderRadius: '12px',
                                          fontWeight: !isAdmin ? 'normal' : undefined,
                                          border: 'none'
                                      }}>
                                        {displayRole}
                                      </span>
                                    </span>
                                    <p className="ans-body" style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{ans.content}</p>
                                  </div>
                                  
                                  {/* Reply Action menu dropdown */}
                                  {currentUser && (currentUser.email === ans.authorEmail || currentUser.isAdmin) && (
                                    <div className="action-menu-container" style={{ alignSelf: 'center' }}>
                                      <button 
                                        className="action-dropdown-btn"
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setActiveMenu(activeMenu?.type === 'reply' && activeMenu.id === ans.id ? null : { type: 'reply', id: ans.id });
                                        }}
                                        title="Hành động"
                                      >
                                        <MoreVertical size={14} />
                                      </button>
                                      
                                      {activeMenu?.type === 'reply' && activeMenu.id === ans.id && (
                                        <>
                                          <div 
                                            style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} 
                                            onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} 
                                          />
                                          <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                              className="action-dropdown-item"
                                              onClick={() => handleStartEditReply(ans)}
                                            >
                                              <Edit3 size={12} /> Sửa trả lời
                                            </button>
                                            <button 
                                              className="action-dropdown-item delete"
                                              onClick={() => { setActiveMenu(null); handleDeleteReply(thread.id, ans.id); }}
                                            >
                                              <Trash2 size={12} /> Xóa trả lời
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', marginTop: '4px' }}>
                                  <span style={{ color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>{timeAgo(ans.date) || ans.date}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    
                    {/* Reply Form */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--jp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {renderAvatar(currentUser?.email, '16px')}
                      </div>
                      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.85rem', borderRadius: '20px', paddingRight: '40px', background: 'var(--jp-surface-raised)', border: 'none' }}
                          placeholder="Viết bình luận..."
                          value={replyTexts[thread.id] || ''}
                          onChange={(e) => handleReplyTextChange(thread.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReply(thread.id);
                          }}
                        />
                        <button
                          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--jp-blue)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                          onClick={() => handleAddReply(thread.id)}
                          title="Gửi bình luận"
                        >
                          <Send size={16} />
                        </button>
                      </div>                    </div>
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredThreads.length === 0 && (
              <p style={{ color: 'var(--jp-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                Chưa có chủ đề nào thuộc danh mục này. Hãy là người đầu tiên đặt câu hỏi!
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Post Question Form */}
        <div className="add-q-card">
          <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--jp-border)', paddingBottom: '0.5rem' }}>
            Đặt câu hỏi cho Senpai
          </h3>
          <form onSubmit={handlePost}>
            <div className="form-group">
              <label className="form-label">Chủ đề</label>
              <select className="form-input" value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                {FORUM_TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Tiêu đề câu hỏi</label>
              <input
                type="text"
                className="form-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Cách rót bia cho khách trong Nomikai..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung chi tiết</label>
              <textarea
                className="form-textarea"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Mô tả chi tiết tình huống thắc mắc..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <Send size={14} /> Đăng câu hỏi
            </button>
          </form>
        </div>
      </div>


    </div>
  );
}
