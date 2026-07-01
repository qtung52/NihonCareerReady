import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, MessageSquare, Tag, MessageCircle, Trash2, X, Briefcase, ChevronDown, ChevronUp, Heart, Search, MoreVertical, Edit3, Image as ImageIcon, RefreshCw, Bookmark, ThumbsUp } from 'lucide-react';
import { getSharedArray, isSupabaseEnabled, setSharedArray, deleteFileByUrlFromSupabase } from '../lib/sharedStore';
import CustomDropdown from './CustomDropdown';
import ImageUploadCropModal from './ImageUploadCropModal';
import styles from './Community.module.css';

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

// Format absolute time to a Vietnamese-style locale string
function formatAbsoluteTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date)) return isoString;
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'popular', label: 'Yêu thích nhất' },
  { value: 'replies', label: 'Thảo luận nhiều' }
];

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

export default function Community({ currentUser, onViewProfile, onUpdateProfile, onViewChange }) {
  const [threads, setThreads] = useState([]);

  // Fetch JLPT level helper
  const getUserJlptLevel = (email) => {
    const u = users.find(user => user.email === email);
    return u?.jlptLevel || null;
  };

  // Bookmark / Save Thread helper
  const handleSaveThread = (threadId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để lưu câu hỏi!");
      return;
    }
    if (typeof onUpdateProfile !== 'function') return;

    const savedList = currentUser.savedThreads || [];
    const isSaved = savedList.includes(threadId);
    const updatedSaved = isSaved
      ? savedList.filter(id => id !== threadId)
      : [...savedList, threadId];
    
    onUpdateProfile({
      savedThreads: updatedSaved
    });
  };
  const [activeTag, setActiveTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Post question form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('culture-shock');
  const [newImage, setNewImage] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false);



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
  const [editingThreadImage, setEditingThreadImage] = useState(null);
  const [isCreatePostCropperOpen, setIsCreatePostCropperOpen] = useState(false);
  const [isEditPostCropperOpen, setIsEditPostCropperOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);
  const [isDeleteConfirmClosing, setIsDeleteConfirmClosing] = useState(false);  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewClosing, setIsPreviewClosing] = useState(false);

  const handleClosePreview = () => {
    setIsPreviewClosing(true);
    setTimeout(() => {
      setPreviewImage(null);
      setIsPreviewClosing(false);
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          handleClosePreview();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  const [syncStatus, setSyncStatus] = useState('loading'); // loading | online | offline
  const [users, setUsers] = useState([]);
  const isMountedRef = useRef(true);

  const loadThreads = async ({ silent = false } = {}) => {
    if (!silent) setSyncStatus('loading');
    try {
      const sharedThreads = await getSharedArray('threads', INITIAL_THREADS);
      const sharedUsers = await getSharedArray('users', []);
      if (!isMountedRef.current) return;
      setThreads(sharedThreads);
      setUsers(sharedUsers);
      setSyncStatus(isSupabaseEnabled ? 'online' : 'local');
    } catch {
      if (!isMountedRef.current) return;
      const localThreads = localStorage.getItem('nihon_threads');
      const fallbackThreads = localThreads ? JSON.parse(localThreads) : INITIAL_THREADS;
      setThreads(fallbackThreads);
      localStorage.setItem('nihon_threads', JSON.stringify(fallbackThreads));
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadThreads();
    const interval = setInterval(() => loadThreads({ silent: true }), 300000); // 5 minutes

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll and expand focused thread from localStorage
  useEffect(() => {
    const focusThreadId = localStorage.getItem('active_thread_focus');
    if (focusThreadId && threads.length > 0) {
      localStorage.removeItem('active_thread_focus');
      const tid = parseInt(focusThreadId);
      if (!isNaN(tid)) {
        setExpandedThreads(prev => ({
          ...prev,
          [tid]: true
        }));
        setTimeout(() => {
          const element = document.getElementById(`thread-card-${tid}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add(styles.highlightedCard);
            setTimeout(() => {
              element.classList.remove(styles.highlightedCard);
            }, 3000);
          }
        }, 500);
      }
    }
  }, [threads]);

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

  const handleCloseCreateModal = () => {
    setIsCreateModalClosing(true);
    setTimeout(() => {
      setIsCreateModalOpen(false);
      setIsCreateModalClosing(false);
    }, 300);
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
      image: newImage,
      answers: []
    };

    const updated = [newThread, ...threads];
    saveThreads(updated);
    
    setNewTitle('');
    setNewContent('');
    setNewImage(null);
    handleCloseCreateModal();
  };

  const handleStartEditThread = (thread) => {
    setEditingThreadId(thread.id);
    setEditingThreadTitle(thread.title);
    setEditingThreadContent(thread.content);
    setEditingThreadTag(thread.tag);
    setEditingThreadImage(thread.image || null);
    setActiveMenu(null); // close dropdown
  };

  const handleSaveEditThread = (threadId) => {
    if (!editingThreadTitle.trim() || !editingThreadContent.trim()) return;
    const matchedTopic = FORUM_TOPICS.find(t => t.id === editingThreadTag);
    const updated = threads.map(t => {
      if (t.id === threadId) {
        if (t.image && t.image !== editingThreadImage) {
          if (t.image.includes('/storage/v1/object/public/images/')) {
            deleteFileByUrlFromSupabase(t.image);
          }
        }
        return {
          ...t,
          title: editingThreadTitle.trim(),
          content: editingThreadContent.trim(),
          tag: editingThreadTag,
          tagName: matchedTopic ? matchedTopic.name : t.tagName,
          image: editingThreadImage,
          isEdited: true,
          editedAt: new Date().toISOString()
        };
      }
      return t;
    });
    saveThreads(updated);
    setEditingThreadId(null);
    setEditingThreadImage(null);
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
              content: editingReplyContent.trim(),
              isEdited: true,
              editedAt: new Date().toISOString()
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
    setDeleteConfirmData({
      type: 'thread',
      threadId,
      title: 'Xóa câu hỏi',
      text: 'Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.'
    });
  };

  const handleDeleteReply = (threadId, replyId) => {
    setDeleteConfirmData({
      type: 'reply',
      threadId,
      replyId,
      title: 'Xóa câu trả lời',
      text: 'Bạn có chắc chắn muốn xóa câu trả lời này không? Hành động này không thể hoàn tác.'
    });
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmClosing(true);
    setTimeout(() => {
      setDeleteConfirmData(null);
      setIsDeleteConfirmClosing(false);
    }, 200);
  };

  const executeDeleteAction = () => {
    if (!deleteConfirmData) return;
    const { type, threadId, replyId } = deleteConfirmData;

    if (type === 'thread') {
      const targetThread = threads.find(t => t.id === threadId);
      if (targetThread && targetThread.image) {
        if (targetThread.image.includes('/storage/v1/object/public/images/')) {
          deleteFileByUrlFromSupabase(targetThread.image);
        }
      }
      const updated = threads.filter(t => t.id !== threadId);
      saveThreads(updated);
    } else if (type === 'reply') {
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
    handleCloseDeleteConfirm();
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
    const u = users.find(user => user.email === email);
    const avatar = u?.avatar || (email === 'admin@nihon.com' ? '🦊' : '🧑‍💻');

    if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('/'))) {
      return <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
    }
    return <span style={{ fontSize: size }}>{avatar}</span>;
  };

  const getUserRole = (email, fallbackRole) => {
    const userObj = users.find(u => u.email === email);
    if (userObj) {
      if (userObj.customRole) return userObj.customRole;
      if (userObj.isAdmin) return 'Quản trị viên';
      if (userObj.isSenpai) return 'Senpai';
      return 'Học viên';
    }
    return fallbackRole || 'Học viên';
  };

  const getSenpaiTrustInfo = (email) => {
    const u = users.find(user => user.email === email);
    if (!u || (!u.isSenpai && !u.isAdmin && u.customRole !== 'Senpai')) {
      return null;
    }

    let totalReplies = 0;
    let totalHelpfulVotes = 0;
    
    threads.forEach(thread => {
      (thread.answers || []).forEach(answer => {
        if (answer.authorEmail === email) {
          totalReplies += 1;
          if (Array.isArray(answer.helpfulVotes)) {
            totalHelpfulVotes += answer.helpfulVotes.length;
          }
        }
      });
    });

    const score = (totalReplies * 5) + (totalHelpfulVotes * 10);
    
    let badgeText = "Senpai Mới";
    let badgeBg = "rgba(149, 165, 166, 0.1)"; 
    let badgeBorder = "1px solid #7f8c8d";
    let badgeColor = "#7f8c8d";
    if (score >= 50) {
      badgeText = "★ Senpai Uy Tín";
      badgeBg = "rgba(188, 0, 45, 0.08)"; 
      badgeBorder = "1px solid var(--jp-red)";
      badgeColor = "var(--jp-red)";
    } else if (score >= 15) {
      badgeText = "★ Hoạt Động Tích Cực";
      badgeBg = "rgba(15, 44, 89, 0.08)"; 
      badgeBorder = "1px solid var(--jp-blue)";
      badgeColor = "var(--jp-blue)";
    }

    return {
      score,
      badgeText,
      badgeBg,
      badgeBorder,
      badgeColor,
      selfDeclaredExperience: u.selfDeclaredExperience || "",
      totalReplies,
      totalHelpfulVotes
    };
  };

  const renderSenpaiNametag = (email, fallbackRole) => {
    const role = getUserRole(email, fallbackRole);
    const trust = getSenpaiTrustInfo(email);

    if (!trust) {
      const isAdmin = role === 'Quản trị viên';
      return (
        <span className={`${styles.replyRole} ${isAdmin ? styles.admin : ''}`}>
          {role}
        </span>
      );
    }

    const tooltipText = `Điểm hoạt động Senpai: ${trust.score}đ (+${trust.totalReplies * 5}đ từ ${trust.totalReplies} câu trả lời, +${trust.totalHelpfulVotes * 10}đ từ ${trust.totalHelpfulVotes} lượt bầu Hữu ích)`;

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        {trust.selfDeclaredExperience && (
          <span style={{ 
            fontSize: '0.72rem', 
            background: 'var(--jp-soft-surface)', 
            border: '1px solid var(--jp-border)', 
            padding: '0.1rem 0.4rem', 
            borderRadius: '4px',
            color: 'var(--jp-text-muted)',
            fontWeight: 500
          }} title="Kinh nghiệm tự khai">
            💼 {trust.selfDeclaredExperience}
          </span>
        )}
        <span 
          title={tooltipText}
          style={{ 
            fontSize: '0.72rem', 
            background: trust.badgeBg, 
            border: trust.badgeBorder, 
            color: trust.badgeColor, 
            padding: '0.1rem 0.45rem', 
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'help',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          {trust.badgeText} ({trust.score}đ)
        </span>
      </span>
    );
  };

  const handleHelpfulVote = async (threadId, replyId) => {
    if (!currentUser) return;
    const freshThreads = await getSharedArray('threads', []);
    const updated = freshThreads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          answers: (t.answers || []).map(ans => {
            if (ans.id === replyId) {
              const votes = Array.isArray(ans.helpfulVotes) ? ans.helpfulVotes : [];
              const userEmail = currentUser.email;
              const hasVoted = votes.includes(userEmail);
              const updatedVotes = hasVoted 
                ? votes.filter(email => email !== userEmail) 
                : [...votes, userEmail];
              return {
                ...ans,
                helpfulVotes: updatedVotes
              };
            }
            return ans;
          })
        };
      }
      return t;
    });

    saveThreads(updated);
  };


  const handleReplyTextChange = (threadId, val) => {
    setReplyTexts(prev => ({
      ...prev,
      [threadId]: val
    }));
  };

  const filteredThreads = threads
    .filter(t => {
      const matchesTag = activeTag === 'all' 
        || (activeTag === 'saved' ? (currentUser?.savedThreads || []).includes(t.id) : t.tag === activeTag);
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Góc Senpai - Kouhai</h2>
        <p className={styles.subtitle}>Diễn đàn thảo luận thời gian thực. Hỏi đáp và chia sẻ kinh nghiệm văn hóa doanh nghiệp Nhật Bản với cộng đồng.</p>

        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.85rem',
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

      <div className={styles.layout}>
        {/* Left Side: Threads List */}
        <div className={styles.mainFeed}>
          {/* Create Post Box (Quick Question Design from Screenshot) */}
          <div className={styles.quickQuestionContainer}>
            <div className={styles.quickQuestionWrapper}>
              <div className={styles.qCircleIcon}>
                {renderAvatar(currentUser?.email, '1.1rem')}
              </div>
              <input
                type="text"
                className={styles.quickQuestionInput}
                placeholder={`Bạn đang muốn hỏi gì, ${currentUser ? currentUser.name : 'hợp tác viên'}?`}
                onClick={() => setIsCreateModalOpen(true)}
                readOnly
              />
              <button
                type="button"
                className={styles.quickQuestionBtn}
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Đăng
              </button>
            </div>
          </div>

          <div className={styles.filters}>
            <button className={`${styles.filterBtn} ${activeTag === 'all' ? styles.active : ''}`} onClick={() => setActiveTag('all')}>Tất cả</button>
            {FORUM_TOPICS.map(topic => (
              <button 
                key={topic.id} 
                className={`${styles.filterBtn} ${activeTag === topic.id ? styles.active : ''}`} 
                onClick={() => setActiveTag(topic.id)}
              >
                {topic.name}
              </button>
            ))}
            {currentUser && (
              <button 
                className={`${styles.filterBtn} ${activeTag === 'saved' ? styles.active : ''}`} 
                onClick={() => setActiveTag('saved')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Bookmark size={12} /> Đã lưu
              </button>
            )}
          </div>

          {/* Search & Sort Bar */}
          <div className={styles.searchSortBar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm kiếm câu hỏi, từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.sortBox} ref={sortDropdownRef}>
              <span className={styles.sortLabel}>Sắp xếp:</span>
              <div className={styles.customDropdown}>
                <button
                  type="button"
                  className={styles.dropdownToggle}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>
                    {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Mới nhất'}
                  </span>
                  <ChevronDown size={16} className={`${styles.dropdownChevron} ${isSortOpen ? styles.chevronOpen : ''}`} />
                </button>
                {isSortOpen && (
                  <div className={styles.dropdownMenu}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.dropdownOption} ${sortBy === opt.value ? styles.activeOption : ''}`}
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadThreads()}
              className={styles.refreshBtn}
              title="Làm mới bài viết"
            >
              <RefreshCw size={16} className={syncStatus === 'loading' ? styles.spin : ''} />
            </button>
          </div>

          <div className={styles.threadsList}>
            {filteredThreads.map(thread => {
              const canDeleteThread = currentUser && (currentUser.isAdmin || currentUser.email === thread.authorEmail);
              const likesList = thread.likes || [];
              const isLiked = currentUser ? likesList.includes(currentUser.email) : false;
              const likesCount = likesList.length;
              
              if (editingThreadId === thread.id) {
                return (
                  <div key={thread.id} className={styles.editBox}>
                    <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--jp-border)', paddingBottom: '0.5rem' }}>
                      Chỉnh sửa câu hỏi
                    </h3>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Chủ đề</label>
                      <CustomDropdown
                        options={FORUM_TOPICS.map(topic => ({ value: topic.id, label: topic.name }))}
                        value={editingThreadTag}
                        onChange={setEditingThreadTag}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tiêu đề câu hỏi</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={editingThreadTitle} 
                        onChange={(e) => setEditingThreadTitle(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nội dung chi tiết</label>
                      <textarea 
                        className={styles.formTextarea} 
                        value={editingThreadContent} 
                        onChange={(e) => setEditingThreadContent(e.target.value)}
                      />
                    </div>
                    {editingThreadImage && (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={editingThreadImage} alt="Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImageBtn} onClick={() => setEditingThreadImage(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span 
                        className={styles.imageUploadLabel} 
                        style={{ display: 'inline-flex', cursor: 'pointer', gap: '0.5rem', alignItems: 'center' }}
                        onClick={() => setIsEditPostCropperOpen(true)}
                      >
                        <ImageIcon size={20} className={styles.uploadIcon} /> Thêm hoặc thay đổi ảnh minh họa
                      </span>
                    </div>
                    <div className={styles.editActions}>
                      <button className={styles.btnOutline} onClick={() => setEditingThreadId(null)}>Hủy</button>
                      <button className={styles.btnPrimary} onClick={() => handleSaveEditThread(thread.id)}>Lưu</button>
                    </div>
                  </div>
                );
              }

              const threadJlpt = getUserJlptLevel(thread.authorEmail);
              return (
                <div key={thread.id} id={`thread-card-${thread.id}`} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.authorInfo}>
                      <div 
                        className={styles.avatar}
                        onClick={() => onViewProfile && onViewProfile(thread.authorEmail, thread.author, getUserRole(thread.authorEmail))}
                        title="Xem thông tin người dùng"
                      >
                        {renderAvatar(thread.authorEmail, '1rem')}
                      </div>
                      <div className={styles.authorDetails}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span 
                            className={styles.authorName}
                            onClick={() => onViewProfile && onViewProfile(thread.authorEmail, thread.author, getUserRole(thread.authorEmail))}
                            title="Xem thông tin người dùng"
                          >
                            {thread.author}
                          </span>
                          {threadJlpt && threadJlpt !== 'Chưa có' && (
                            <span className={styles.jlptBadge}>{threadJlpt}</span>
                          )}
                          {renderSenpaiNametag(thread.authorEmail)}
                        </div>
                        <div className={styles.postMeta}>
                          <span>{timeAgo(thread.date)} ({formatAbsoluteTime(thread.date)})</span>
                          {thread.isEdited && (
                            <>
                              <span>•</span>
                              <span className={styles.editedLabel} title={`Chỉnh sửa lúc: ${formatAbsoluteTime(thread.editedAt)}`}>
                                (đã chỉnh sửa {timeAgo(thread.editedAt)})
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className={styles.postTag}>
                            <Tag size={12} />
                            {thread.tagName}
                          </span>
                        </div>
                      </div>
                    </div>
                    {currentUser && (currentUser.email === thread.authorEmail || currentUser.isAdmin) && (
                      <div className={styles.moreMenu}>
                        <button 
                          className={styles.menuBtn}
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
                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                              <button 
                                className={styles.dropdownItem}
                                onClick={() => handleStartEditThread(thread)}
                              >
                                <Edit3 size={14} /> Sửa bài
                              </button>
                              <button 
                                className={`${styles.dropdownItem} ${styles.delete}`}
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
                  <h3 className={styles.postTitle}>{thread.title}</h3>
                  <p className={styles.postContent}>{thread.content}</p>
                  
                  {thread.image && (
                    <img 
                      src={thread.image} 
                      alt="Attached" 
                      className={styles.postImage} 
                      onClick={() => setPreviewImage(thread.image)}
                      title="Click để phóng to ảnh"
                      style={{ cursor: 'zoom-in' }}
                    />
                  )}

                  <div className={styles.postActions}>
                    <button
                      onClick={() => handleLikeThread(thread.id)}
                      className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                      title={isLiked ? "Bỏ thích" : "Thích câu hỏi này"}
                    >
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>Thích {likesCount > 0 && `(${likesCount})`}</span>
                    </button>

                    <button 
                      className={`${styles.actionBtn} ${expandedThreads[thread.id] ? styles.repliesOpen : ''}`}
                      onClick={() => toggleExpand(thread.id)}
                    >
                      <MessageSquare size={18} className={expandedThreads[thread.id] ? styles.iconOpen : ''} /> 
                      <span>Trả lời {thread.answers.length > 0 && `(${thread.answers.length})`}</span>
                    </button>

                    <button
                      onClick={() => handleSaveThread(thread.id)}
                      className={`${styles.actionBtn} ${(currentUser?.savedThreads || []).includes(thread.id) ? styles.saved : ''}`}
                      title={(currentUser?.savedThreads || []).includes(thread.id) ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi"}
                    >
                      <Bookmark size={18} fill={(currentUser?.savedThreads || []).includes(thread.id) ? 'currentColor' : 'none'} />
                      <span>{(currentUser?.savedThreads || []).includes(thread.id) ? 'Đã lưu' : 'Lưu'}</span>
                    </button>
                  </div>
                  
                  <div className={`${styles.repliesWrapper} ${expandedThreads[thread.id] ? styles.expanded : ''}`}>
                    <div className={styles.repliesSection}>
                      {thread.answers.map((ans) => {
                        const canDeleteReply = currentUser && (currentUser.isAdmin || currentUser.email === ans.authorEmail);
                        const displayRole = getUserRole(ans.authorEmail, ans.role);
                        const isAdmin = displayRole === 'Quản trị viên';
                        const isSenpai = displayRole.includes('Senpai') || displayRole.includes('Tech Lead') || displayRole.includes('Leader');
                        
                        if (editingReplyId === ans.id) {
                          return (
                            <div key={ans.id || `ans-${Math.random()}`} className={styles.replyCard}>
                              <div 
                                className={styles.replyAvatar}
                                onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                                title="Xem thông tin người dùng"
                              >
                                {renderAvatar(ans.authorEmail, '0.9rem')}
                              </div>
                              <div className={styles.replyContentWrapper}>
                                <div className={styles.replyContent} style={{width: '100%'}}>
                                  <textarea
                                    className={styles.formTextarea}
                                    value={editingReplyContent}
                                    onChange={(e) => setEditingReplyContent(e.target.value)}
                                    style={{ minHeight: '60px', marginBottom: '0.5rem' }}
                                  />
                                  <div className={styles.editActions}>
                                    <button className={styles.btnOutline} onClick={() => setEditingReplyId(null)}>Hủy</button>
                                    <button className={styles.btnPrimary} onClick={() => handleSaveEditReply(thread.id, ans.id)}>Lưu</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const replyJlpt = getUserJlptLevel(ans.authorEmail);
                        return (
                          <div key={ans.id || `ans-${Math.random()}`} className={styles.replyCard}>
                            <div 
                              className={styles.replyAvatar}
                              onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                              title="Xem thông tin người dùng"
                            >
                              {renderAvatar(ans.authorEmail, '0.9rem')}
                            </div>
                            <div className={styles.replyContentWrapper}>
                              <div className={styles.replyContent}>
                                <div className={styles.replyHeader}>
                                  <span 
                                    className={styles.replyAuthor}
                                    onClick={() => onViewProfile && onViewProfile(ans.authorEmail, ans.author, displayRole)}
                                    title="Xem thông tin người dùng"
                                  >
                                    {ans.author}
                                  </span>
                                  {replyJlpt && replyJlpt !== 'Chưa có' && (
                                    <span className={styles.jlptBadge}>{replyJlpt}</span>
                                  )}
                                  {renderSenpaiNametag(ans.authorEmail, ans.role)}
                                </div>
                                <p className={styles.replyText}>{ans.content}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                  <button
                                    onClick={() => handleHelpfulVote(thread.id, ans.id)}
                                    className={`${styles.helpfulBtn} ${ans.helpfulVotes?.includes(currentUser?.email) ? styles.helpfulActive : ''}`}
                                    title="Đánh giá câu trả lời hữu ích"
                                  >
                                    <ThumbsUp size={12} className={styles.helpfulIcon} />
                                    <span>Hữu ích</span>
                                    {ans.helpfulVotes?.length > 0 && (
                                      <span className={styles.helpfulCount}>{ans.helpfulVotes.length}</span>
                                    )}
                                  </button>
                                </div>

                                {/* Reply Action menu dropdown inside replyContent */}
                                {currentUser && (currentUser.email === ans.authorEmail || currentUser.isAdmin) && (
                                  <div className={styles.moreMenu}>
                                    <button 
                                      className={styles.menuBtn}
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
                                        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                          <button 
                                            className={styles.dropdownItem}
                                            onClick={() => handleStartEditReply(ans)}
                                          >
                                            <Edit3 size={12} /> Sửa
                                          </button>
                                          <button 
                                            className={`${styles.dropdownItem} ${styles.delete}`}
                                            onClick={() => { setActiveMenu(null); handleDeleteReply(thread.id, ans.id); }}
                                          >
                                            <Trash2 size={12} /> Xóa
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className={styles.replyMeta}>
                                <span>{timeAgo(ans.date)} ({formatAbsoluteTime(ans.date)})</span>
                                {ans.isEdited && (
                                  <>
                                    <span>•</span>
                                    <span className={styles.editedLabel} title={`Chỉnh sửa lúc: ${formatAbsoluteTime(ans.editedAt)}`}>
                                      (đã chỉnh sửa {timeAgo(ans.editedAt)})
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  
                      {/* Reply Form */}
                      <div className={styles.replyInput}>
                        <div className={styles.replyAvatar}>
                          {renderAvatar(currentUser?.email, '0.9rem')}
                        </div>
                        <div className={styles.inputField}>
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={replyTexts[thread.id] || ''}
                            onChange={(e) => handleReplyTextChange(thread.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddReply(thread.id);
                            }}
                          />
                          <button
                            className={styles.sendBtn}
                            onClick={() => handleAddReply(thread.id)}
                            title="Gửi bình luận"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredThreads.length === 0 && (
              <div className={styles.emptyState}>
                Chưa có chủ đề nào thuộc danh mục này. Hãy là người đầu tiên đặt câu hỏi!
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Pop-up Modal to Post Question */}
      {isCreateModalOpen && createPortal(
        <div 
          className={`modal-overlay ${isCreateModalClosing ? 'closing' : ''}`} 
          onClick={handleCloseCreateModal}
          style={{ zIndex: 1100 }}
        >
          <div 
            className={`modal-content ${isCreateModalClosing ? 'closing' : ''}`} 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '600px', 
              padding: 0, 
              borderRadius: '16px', 
              border: '1px solid var(--jp-border)',
              overflow: 'hidden',
              boxShadow: 'var(--jp-shadow-lg)',
              background: 'var(--jp-card-bg)',
              position: 'relative'
            }}
          >
            <div className={styles.modalHeader}>
              <h3>Đăng câu hỏi mới</h3>
              <button className={styles.modalCloseBtn} onClick={handleCloseCreateModal} title="Đóng">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePost} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Chủ đề thảo luận</label>
                <CustomDropdown
                  options={FORUM_TOPICS.map(topic => ({ value: topic.id, label: topic.name }))}
                  value={newTag}
                  onChange={setNewTag}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tiêu đề câu hỏi / Thắc mắc</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn thắc mắc của bạn..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nội dung chi tiết</label>
                <textarea
                  className={styles.formTextarea}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Mô tả chi tiết câu hỏi, bối cảnh tình huống để Senpai dễ trả lời nhé..."
                  required
                  style={{ minHeight: '150px' }}
                />
              </div>

              {newImage && (
                <div className={styles.imagePreviewWrapper}>
                  <img src={newImage} alt="Preview" className={styles.imagePreview} />
                  <button type="button" className={styles.removeImageBtn} onClick={() => setNewImage(null)}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className={styles.modalFooter}>
                <span className={styles.imageUploadLabel} onClick={() => setIsCreatePostCropperOpen(true)} style={{ cursor: 'pointer' }}>
                  <ImageIcon size={20} className={styles.uploadIcon} /> Thêm ảnh minh họa
                </span>
                <button type="submit" className={styles.submitBtnInline}>
                  <Send size={16} /> Đăng câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ImageUploadCropModal
        isOpen={isCreatePostCropperOpen}
        onClose={() => setIsCreatePostCropperOpen(false)}
        onSave={(url) => setNewImage(url)}
        aspectRatio={0}
        cropShape="rect"
      />

      <ImageUploadCropModal
        isOpen={isEditPostCropperOpen}
        onClose={() => setIsEditPostCropperOpen(false)}
        onSave={(url) => setEditingThreadImage(url)}
        aspectRatio={0}
        cropShape="rect"
      />

      {deleteConfirmData && createPortal(
        <div 
          className={`${styles.confirmModalOverlay} ${isDeleteConfirmClosing ? styles.closing : ''}`}
          onClick={handleCloseDeleteConfirm}
        >
          <div 
            className={`${styles.confirmModalContent} ${isDeleteConfirmClosing ? styles.closing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--jp-red)' }}>
              <div style={{
                background: 'var(--jp-soft-red)',
                padding: '0.85rem',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(188, 0, 45, 0.1)'
              }}>
                <Trash2 size={28} />
              </div>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--jp-text)' }}>
              {deleteConfirmData.title}
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.88rem', color: 'var(--jp-text-muted)', lineHeight: '1.5' }}>
              {deleteConfirmData.text}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
              <button 
                type="button" 
                className={styles.confirmCancelBtn} 
                onClick={handleCloseDeleteConfirm}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className={styles.confirmDeleteBtn} 
                onClick={executeDeleteAction}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {previewImage && createPortal(
        <div 
          className={`${styles.imageLightboxOverlay} ${isPreviewClosing ? styles.closing : ''}`}
          onClick={handleClosePreview}
        >
          <button className={styles.lightboxCloseBtn} onClick={handleClosePreview} title="Đóng (Esc)">
            <X size={24} />
          </button>
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              className={`${styles.lightboxImage} ${isPreviewClosing ? styles.closing : ''}`} 
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
