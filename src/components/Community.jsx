import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Tag, User, MessageCircle, Trash2, X, Briefcase, FileText } from 'lucide-react';

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

// Format timestamp: Date → 'DD/MM/YYYY lúc HH:mm (X phút/giờ trước)'
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return isoString;
  
  const pad = (n) => String(n).padStart(2, '0');
  const calendarStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} lúc ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  let relativeStr = '';
  if (diffSec < 60) {
    relativeStr = 'vừa xong';
  } else if (diffMin < 60) {
    relativeStr = `${diffMin} phút trước`;
  } else if (diffHr < 24) {
    relativeStr = `${diffHr} giờ trước`;
  } else {
    relativeStr = `${diffDay} ngày trước`;
  }

  return `${calendarStr} (${relativeStr})`;
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

  useEffect(() => {
    const localThreads = localStorage.getItem('nihon_threads');
    if (localThreads) {
      setThreads(JSON.parse(localThreads));
    } else {
      setThreads(INITIAL_THREADS);
      localStorage.setItem('nihon_threads', JSON.stringify(INITIAL_THREADS));
    }
  }, []);

  const saveThreads = (updatedThreads) => {
    setThreads(updatedThreads);
    localStorage.setItem('nihon_threads', JSON.stringify(updatedThreads));
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
              role: currentUser && currentUser.isAdmin ? "Senpai (Quản trị viên)" : "Kouhai (Học viên)",
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

  const openUserProfile = (email, name, role) => {
    // Check if looking at admin
    if (email === 'admin@nihon.com') {
      setSelectedUserProfile({
        name: 'Admin Senpai',
        email: 'admin@nihon.com',
        avatar: '🦊',
        bio: 'Quản trị viên hệ thống Nihon Career Ready. Rất vui được hỗ trợ và định hướng văn hóa cho các bạn Kouhai.',
        careerGoal: 'Lãnh đạo Giáo dục / Nhân sự Nhật Bản',
        isAdmin: true
      });
      return;
    }

    const usersList = JSON.parse(localStorage.getItem('users') || '[]');
    const matchedUser = usersList.find(u => u.email === email);

    if (matchedUser) {
      setSelectedUserProfile({
        name: matchedUser.name || name,
        email: matchedUser.email,
        avatar: matchedUser.avatar || '🧑‍💻',
        bio: matchedUser.bio || 'Chưa cập nhật giới thiệu bản thân.',
        careerGoal: matchedUser.careerGoal || 'Học viên Nihon Career Ready',
        isAdmin: false
      });
    } else {
      // Fallback if user doesn't exist in current db (e.g. initial static threads data)
      const safeEmail = email || '';
      setSelectedUserProfile({
        name: name,
        email: safeEmail,
        avatar: safeEmail.includes('minh') ? '👨‍💼' : safeEmail.includes('hieu') ? '🦊' : '🧑‍💻',
        bio: 'Senpai giàu kinh nghiệm chia sẻ bài học về kỹ năng giao tiếp và ứng xử doanh nghiệp Nhật Bản.',
        careerGoal: role || 'Senpai / Cố vấn chuyên môn',
        isAdmin: typeof role === 'string' && (role.includes('Senpai') || role.includes('Tech Lead'))
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
                          onClick={() => openUserProfile(thread.authorEmail, thread.author, 'Học viên')}
                          title="Xem thông tin người dùng"
                        >
                          {thread.author}
                        </strong>{' '}
                        • {formatDate(thread.date) || thread.date}
                      </span>
                    </div>
                    {canDeleteThread && (
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        style={{ border: 'none', background: 'none', color: 'var(--jp-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem' }}
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={14} /> Xóa
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
                      // Phân quyền chuẩn: Chỉ chủ sở hữu bình luận hoặc Admin mới được xóa
                      const canDeleteReply = currentUser && (currentUser.isAdmin || currentUser.email === ans.authorEmail);
                      
                      return (
                        <div key={ans.id || `ans-${Math.random()}`} className="ans-card">
                          <div className="ans-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span 
                              style={{ cursor: 'pointer' }}
                              onClick={() => openUserProfile(ans.authorEmail, ans.author, ans.role)}
                              title="Xem thông tin người dùng"
                            >
                              <span style={{ fontSize: '1rem', marginRight: '4px' }}>🧑‍💻</span>
                              <strong style={{ color: 'var(--jp-blue)', textDecoration: 'underline' }}>{ans.author}</strong>{' '}
                              <span className="ans-badge" style={{ background: ans.role.includes('Senpai') || ans.role.includes('Lead') ? '#bc002d' : 'var(--jp-blue)' }}>{ans.role}</span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>{formatDate(ans.date) || ans.date}</span>
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
              <div style={{ fontSize: '3.5rem', width: '80px', height: '80px', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jp-blue-light)', borderRadius: '50%', border: '2px solid var(--jp-blue)' }}>
                {selectedUserProfile.avatar}
              </div>
              <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                {selectedUserProfile.name}
              </h3>
              <span className="ans-badge" style={{ background: selectedUserProfile.isAdmin ? '#bc002d' : 'var(--jp-blue)', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '10px' }}>
                {selectedUserProfile.isAdmin ? 'Senpai Cố Vấn' : 'Kouhai Thành Viên'}
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
                <p style={{ fontSize: '0.8rem', color: 'var(--jp-text)', margin: '0.2rem 0 0 0', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', lineHeight: '1.4', fontStyle: 'italic' }}>
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
