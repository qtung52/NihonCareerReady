import { useState, useEffect } from 'react';
import { Send, MessageSquare, Tag, MessageCircle, Trash2, X, Briefcase } from 'lucide-react';
import { getSharedArray, isSupabaseEnabled, setSharedArray } from '../lib/sharedStore';

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

export default function Community({ currentUser }) {
  const [threads, setThreads] = useState([]);
  const [activeTag, setActiveTag] = useState('all');
  
  // Post question form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('culture-shock');

  // Reply state
  const [replyTexts, setReplyTexts] = useState({});

  // View User Profile Modal State
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
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

    const newThread = {
      id: Date.now(),
      tag: newTag,
      tagName: newTag === 'culture-shock' ? 'Sốc văn hóa' : newTag === 'interview' ? 'Phỏng vấn / Shukatsu' : 'Mẹo làm việc',
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

  const getUserRole = (email, fallbackRole) => {
    const userObj = users.find(u => u.email === email);
    if (userObj) {
      if (userObj.isAdmin) return 'Quản trị viên';
      if (userObj.isSenpai) return 'Senpai';
      return 'Học viên';
    }
    return fallbackRole || 'Học viên';
  };

  const openUserProfile = async (email, name, role) => {
    if (email === 'admin@nihon.com') {
      setSelectedUserProfile({
        name: 'Admin Senpai',
        email: 'admin@nihon.com',
        avatar: '🦊',
        bio: 'Quản trị viên hệ thống Nihon Career Ready. Rất vui được hỗ trợ và định hướng văn hóa cho các bạn Kouhai.',
        careerGoal: 'Lãnh đạo Giáo dục / Nhân sự Nhật Bản',
        role: 'Quản trị viên'
      });
      return;
    }

    const matchedUser = users.find(u => u.email === email);

    if (matchedUser) {
      setSelectedUserProfile({
        name: matchedUser.name || name,
        email: matchedUser.email,
        avatar: matchedUser.avatar || '🧑‍💻',
        bio: matchedUser.bio || 'Chưa cập nhật giới thiệu bản thân.',
        careerGoal: matchedUser.careerGoal || 'Học viên Nihon Career Ready',
        role: getUserRole(email, role)
      });
    } else {
      const safeEmail = email || '';
      setSelectedUserProfile({
        name: name,
        email: safeEmail,
        avatar: safeEmail.includes('minh') ? '👨‍💼' : safeEmail.includes('hieu') ? '🦊' : '🧑‍💻',
        bio: 'Senpai giàu kinh nghiệm chia sẻ bài học về kỹ năng giao tiếp và ứng xử doanh nghiệp Nhật Bản.',
        careerGoal: role || 'Senpai / Cố vấn chuyên môn',
        role: getUserRole(email, role)
      });
    }
  };

  const handleReplyTextChange = (threadId, val) => {
    setReplyTexts(prev => ({
      ...prev,
      [threadId]: val
    }));
  };

  const filteredThreads = activeTag === 'all'
    ? threads
    : threads.filter(t => t.tag === activeTag);

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
          <div className="filter-tabs" style={{ justifyContent: 'flex-start' }}>
            <button className={`tab-btn ${activeTag === 'all' ? 'active' : ''}`} onClick={() => setActiveTag('all')}>Tất cả</button>
            <button className={`tab-btn ${activeTag === 'culture-shock' ? 'active' : ''}`} onClick={() => setActiveTag('culture-shock')}>Sốc văn hóa</button>
            <button className={`tab-btn ${activeTag === 'interview' ? 'active' : ''}`} onClick={() => setActiveTag('interview')}>Phỏng vấn</button>
            <button className={`tab-btn ${activeTag === 'tips' ? 'active' : ''}`} onClick={() => setActiveTag('tips')}>Mẹo làm việc</button>
          </div>

          <div className="question-list">
            {filteredThreads.map(thread => {
              // Phân quyền chuẩn: Chỉ chủ sở hữu bài đăng đó hoặc Admin mới được xóa
              const canDeleteThread = currentUser && (currentUser.isAdmin || currentUser.email === thread.authorEmail);
              
              return (
                <div key={thread.id} className="q-card">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`q-tag ${thread.tag}`}>
                        <Tag size={10} style={{ marginRight: '3px', display: 'inline' }} />
                        {thread.tagName}
                      </span>
                      <span className="q-meta" style={{ marginLeft: '10px' }}>
                        Đăng bởi{' '}
                        <strong 
                          style={{ cursor: 'pointer', color: 'var(--jp-blue)', textDecoration: 'underline' }}
                          onClick={() => openUserProfile(thread.authorEmail, thread.author, getUserRole(thread.authorEmail))}
                          title="Xem thông tin người dùng"
                        >
                          {thread.author}
                        </strong>{' '}
                        • {timeAgo(thread.date) || thread.date}
                      </span>
                    </div>
                    {currentUser && (currentUser.email === thread.authorEmail || currentUser.isAdmin) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteThread(thread.id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--jp-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} /> Xóa bài
                      </button>
                    )}
                  </div>
                  <h3 className="q-title">{thread.title}</h3>
                  <p className="q-content">{thread.content}</p>

                  <div className="q-answers">
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--jp-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MessageSquare size={14} /> Trả lời ({thread.answers.length})
                    </h4>
                    {thread.answers.map((ans) => {
                      const canDeleteReply = currentUser && (currentUser.isAdmin || currentUser.email === ans.authorEmail);
                      const displayRole = getUserRole(ans.authorEmail, ans.role);
                      const isAdmin = displayRole === 'Quản trị viên';
                      const isSenpai = displayRole.includes('Senpai') || displayRole.includes('Tech Lead') || displayRole.includes('Leader');
                      
                      return (
                        <div key={ans.id || `ans-${Math.random()}`} className="ans-card">
                          <div className="ans-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              onClick={() => openUserProfile(ans.authorEmail, ans.author, displayRole)}
                              title="Xem thông tin người dùng"
                            >
                              <strong style={{ color: 'var(--jp-blue)', textDecoration: 'underline' }}>{ans.author}</strong>
                              <span style={{ 
                                  fontSize: '0.7rem', 
                                  background: isAdmin ? 'linear-gradient(135deg, #ff4b4b, #ff904b, #f9cb28, #4bcf6d, #4b90ff, #994bff)' : isSenpai ? 'var(--jp-blue)' : 'var(--jp-border)', 
                                  color: isAdmin || isSenpai ? 'white' : 'var(--jp-text-muted)', 
                                  padding: '2px 8px', 
                                  borderRadius: '12px',
                                  fontWeight: isAdmin ? 'bold' : 'normal',
                                  border: 'none'
                              }}>
                                {displayRole}
                              </span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>{timeAgo(ans.date) || ans.date}</span>
                              {canDeleteReply && (
                                <button
                                  onClick={() => handleDeleteReply(thread.id, ans.id)}
                                  style={{ border: 'none', background: 'none', color: 'var(--jp-red)', cursor: 'pointer', padding: 0 }}
                                  title="Xóa bình luận này"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="ans-body">{ans.content}</p>
                        </div>
                      );
                    })}
                    
                    {/* Reply Form */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px dashed var(--jp-border)', paddingTop: '1rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                        placeholder="Nhập câu trả lời hoặc ý kiến của bạn..."
                        value={replyTexts[thread.id] || ''}
                        onChange={(e) => handleReplyTextChange(thread.id, e.target.value)}
                      />
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => handleAddReply(thread.id)}
                      >
                        <MessageCircle size={14} /> Trả lời
                      </button>
                    </div>
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
                <option value="culture-shock">Sốc văn hóa</option>
                <option value="interview">Phỏng vấn / Shukatsu</option>
                <option value="tips">Mẹo làm việc</option>
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

      {/* Profile Viewer Popup Modal */}
      {selectedUserProfile && (
        <div className="modal-overlay" onClick={() => setSelectedUserProfile(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '2rem', borderRadius: '12px', border: '1px solid var(--jp-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedUserProfile(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--jp-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3.5rem', width: '80px', height: '80px', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jp-blue-light)', borderRadius: '50%', border: '2px solid var(--jp-blue)', overflow: 'hidden' }}>
                {selectedUserProfile.avatar?.startsWith('data:image') ? (
                  <img src={selectedUserProfile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  selectedUserProfile.avatar || '🧑‍💻'
                )}
              </div>
              <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                {selectedUserProfile.name}
              </h3>
              <span className="ans-badge" style={{ 
                background: selectedUserProfile.role === 'Quản trị viên' ? 'linear-gradient(135deg, #ff4b4b, #ff904b, #f9cb28, #4bcf6d, #4b90ff, #994bff)' : (selectedUserProfile.role?.includes('Senpai') || selectedUserProfile.role?.includes('Tech Lead') || selectedUserProfile.role?.includes('Leader')) ? 'var(--jp-blue)' : 'var(--jp-border)', 
                color: selectedUserProfile.role === 'Quản trị viên' || (selectedUserProfile.role?.includes('Senpai') || selectedUserProfile.role?.includes('Tech Lead') || selectedUserProfile.role?.includes('Leader')) ? 'white' : 'var(--jp-text-muted)',
                fontSize: '0.75rem', 
                padding: '4px 12px', 
                borderRadius: '12px',
                fontWeight: selectedUserProfile.role === 'Quản trị viên' ? 'bold' : 'normal',
                boxShadow: selectedUserProfile.role === 'Quản trị viên' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                border: 'none'
              }}>
                {selectedUserProfile.role}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--jp-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Định hướng mục tiêu</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--jp-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <Briefcase size={14} /> {selectedUserProfile.careerGoal}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Mô tả (Bio)</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--jp-text)', margin: '0.2rem 0 0 0', background: 'var(--jp-surface-raised)', padding: '0.75rem', borderRadius: '6px', lineHeight: '1.4', fontStyle: 'italic', border: '1px solid var(--jp-border)' }}>
                  {selectedUserProfile.bio}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Email (Đã ẩn)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--jp-text)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🔒 {maskEmail(selectedUserProfile.email)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
