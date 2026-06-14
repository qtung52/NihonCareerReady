import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Key, Save, AlertCircle, CheckCircle2, Upload, Camera, ChevronDown, X, RotateCw, RefreshCw, Minus, Plus } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';
import styles from './Profile.module.css';

const AVATARS = [
  { id: 'avatar-1', emoji: '🧑‍💻', name: 'Developer Senpai' },
  { id: 'avatar-2', emoji: '👩‍💼', name: 'Office Lady' },
  { id: 'avatar-3', emoji: '👨‍💼', name: 'Salaryman' },
  { id: 'avatar-4', emoji: '🦊', name: 'Kitsune Mask' },
  { id: 'avatar-5', emoji: '🏮', name: 'Chochin Lantern' },
  { id: 'avatar-6', emoji: '🌸', name: 'Sakura' },
  { id: 'avatar-7', emoji: '🏯', name: 'Castle' },
  { id: 'avatar-8', emoji: '🐱', name: 'Maneki Neko' },
];

const CAREER_GOALS = [
  {
    category: "💻 IT & Công nghệ",
    options: [
      { value: "IT Communicator (Comtor)", label: "IT Communicator (Comtor)" },
      { value: "Software Engineer (Japan)", label: "Kỹ sư phần mềm (Bridge SE / Developer)" },
      { value: "Business Analyst (BA)", label: "Phân tích nghiệp vụ (BA)" },
      { value: "QA/QC Engineer", label: "Kỹ sư kiểm thử phần mềm (QA/QC)" },
      { value: "IT Project Manager", label: "Quản lý dự án IT (IT PM)" },
      { value: "Data Analyst / Data Scientist", label: "Phân tích dữ liệu / Data Scientist" },
      { value: "UI/UX Designer", label: "Thiết kế giao diện (UI/UX Designer)" },
      { value: "Network / Infrastructure Engineer", label: "Kỹ sư hạ tầng / Mạng máy tính" }
    ]
  },
  {
    category: "🌏 Kinh doanh & Thương mại",
    options: [
      { value: "International Business Specialist", label: "Kinh doanh Quốc tế (International Business)" },
      { value: "Import-Export & Logistics Officer", label: "Xuất Nhập Khẩu & Logistics" },
      { value: "Global Marketing Executive", label: "Marketing toàn cầu (Global Marketing)" },
      { value: "Sales Manager / Business Development", label: "Kinh doanh & Phát triển thị trường (BDM)" },
      { value: "E-Commerce & Digital Marketing Specialist", label: "E-Commerce & Tiếp thị số" },
      { value: "Supply Chain Manager", label: "Quản lý chuỗi cung ứng (Supply Chain)" },
      { value: "Purchasing & Procurement Officer", label: "Mua hàng & Đấu thầu (Procurement)" }
    ]
  },
  {
    category: "💴 Tài chính & Kế toán",
    options: [
      { value: "Accountant / Auditor (Japan)", label: "Kế toán / Kiểm toán viên Nhật Bản" },
      { value: "Financial Analyst", label: "Phân tích tài chính (Financial Analyst)" },
      { value: "Banking & Finance Officer", label: "Ngân hàng & Tài chính quốc tế" },
      { value: "Tax Consultant / CPA", label: "Tư vấn thuế / Kế toán công chứng (CPA)" }
    ]
  },
  {
    category: "🏨 Du lịch & Khách sạn",
    options: [
      { value: "Hotel & Hospitality Manager", label: "Quản lý Khách sạn & Dịch vụ (Hospitality)" },
      { value: "Tourism & Travel Consultant", label: "Hướng dẫn viên / Tư vấn Du lịch Nhật Bản" },
      { value: "Restaurant & F&B Manager", label: "Quản lý Nhà hàng & F&B" },
      { value: "Airline Ground Staff / Cabin Crew", label: "Nhân viên Hàng không / Tiếp viên" }
    ]
  },
  {
    category: "📚 Ngôn ngữ & Giáo dục",
    options: [
      { value: "Japanese Teacher / Interpreter", label: "Giảng viên / Phiên dịch viên tiếng Nhật" },
      { value: "Professional Translator (JP-VI)", label: "Biên / Phiên dịch chuyên nghiệp (Nhật - Việt)" },
      { value: "Education Consultant (Study Abroad Japan)", label: "Tư vấn du học Nhật Bản" },
      { value: "Content Creator / Media (Japan)", label: "Sáng tạo nội dung / Truyền thông Nhật Bản" }
    ]
  },
  {
    category: "🏢 Nhân sự & Hành chính",
    options: [
      { value: "Human Resources (HR) Specialist", label: "Nhân sự (HR) / Tuyển dụng quốc tế" },
      { value: "General Affairs / Admin Officer", label: "Hành chính tổng hợp" },
      { value: "Legal / Compliance Officer", label: "Pháp lý & Tuân thủ (Legal/Compliance)" }
    ]
  },
  {
    category: "⚙️ Sản xuất & Kỹ thuật",
    options: [
      { value: "Manufacturing Engineer (Monozukuri)", label: "Kỹ sư sản xuất (Monozukuri)" },
      { value: "Quality Control Manager", label: "Quản lý chất lượng (Quality Control)" },
      { value: "Mechanical / Electrical Engineer", label: "Kỹ sư cơ điện / Tự động hóa" }
    ]
  },
  {
    category: "🌟 Khác",
    options: [
      { value: "Entrepreneur / Startup Japan", label: "Khởi nghiệp tại Nhật Bản (Startup)" },
      { value: "Other", label: "Lĩnh vực khác" }
    ]
  }
];

const getCareerGoalLabel = (val) => {
  for (const group of CAREER_GOALS) {
    const found = group.options.find(opt => opt.value === val);
    if (found) return found.label;
  }
  return val;
};

export default function Profile({ currentUser, onUpdateProfile }) {
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '🧑‍💻');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [careerGoal, setCareerGoal] = useState(currentUser.careerGoal || 'Software Engineer (Japan)');
  
  // Cropper modal states
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isCropperClosing, setIsCropperClosing] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');

  const handleCroppedAvatar = (croppedDataUrl) => {
    setIsCropperClosing(true);
    setTimeout(() => {
      setAvatar(croppedDataUrl);
      setIsCropperOpen(false);
      setIsCropperClosing(false);
    }, 300);
  };

  const handleCloseCropper = () => {
    setIsCropperClosing(true);
    setTimeout(() => {
      setIsCropperOpen(false);
      setIsCropperClosing(false);
    }, 300);
  };
  
  // Custom dropdown state & ref
  const [isCareerGoalOpen, setIsCareerGoalOpen] = useState(false);
  const careerGoalDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (careerGoalDropdownRef.current && !careerGoalDropdownRef.current.contains(event.target)) {
        setIsCareerGoalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Message feedback
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'Tên hiển thị không được để trống.' });
      return;
    }

    const users = await getSharedArray('users', []);
    const isNameTaken = users.some(u => u.email !== currentUser.email && u.name.trim().toLowerCase() === displayName.trim().toLowerCase());
    if (isNameTaken || displayName.trim().toLowerCase() === 'admin senpai') {
      setProfileMsg({ type: 'error', text: 'Tên hiển thị này đã tồn tại! Vui lòng chọn tên khác.' });
      return;
    }

    await onUpdateProfile({
      name: displayName,
      avatar,
      bio,
      careerGoal
    });
    setProfileMsg({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
    setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ tất cả các trường mật khẩu.' });
      return;
    }

    // Get database from localStorage to verify and save
    const users = await getSharedArray('users', []);
    const userIdx = users.findIndex(u => u.email === currentUser.email);

    if (userIdx === -1) {
      setPassMsg({ type: 'error', text: 'Tài khoản không tồn tại.' });
      return;
    }

    if (users[userIdx].password !== oldPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải dài từ 6 ký tự trở lên.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }

    // Update inside list
    users[userIdx].password = newPassword;
    await setSharedArray('users', users);

    // Update session info
    await onUpdateProfile({ password: newPassword });

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassMsg({ type: 'success', text: 'Thay đổi mật khẩu thành công!' });
    setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Vui lòng chọn file hình ảnh hợp lệ (jpg, png,...)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target.result);
      setIsCropperOpen(true);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.coverPhoto}>
        {/* Beautiful cover photo banner */}
      </div>

      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          {avatar.startsWith('data:image') ? (
            <img src={avatar} alt="avatar" className={styles.avatarImage} />
          ) : (
            avatar
          )}
        </div>
        <div className={styles.userInfoHeader}>
          <h2 className={styles.userName}>{displayName || currentUser.name}</h2>
          <div className={styles.userRole}>
            <span className={`${styles.roleBadge} ${currentUser.isAdmin ? styles.adminBadge : currentUser.isSenpai ? styles.senpaiBadge : styles.studentBadge}`}>
              {currentUser.isAdmin ? 'Quản trị viên (Admin)' : currentUser.isSenpai ? 'Senpai' : 'Học viên'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.bentoGrid}>
        
        {/* Top Full Width Card: Avatar Edit */}
        <div className={`${styles.bentoCard} ${styles.avatarCard}`}>
          <h3 className={styles.cardTitle}>
             <Camera size={20} /> Ảnh đại diện (Avatar)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className={styles.avatarList}>
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatar(av.emoji)}
                    className={`${styles.avatarOption} ${avatar === av.emoji ? styles.selected : ''}`}
                    title={av.name}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
              <div>
                <label className={styles.uploadLabel}>
                  <Upload size={16} /> Tải ảnh từ máy (Max 2MB)
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
          </div>
        </div>

        {/* Left Card: Personal Information */}
        <div className={`${styles.bentoCard} ${styles.infoCard}`}>
          <h3 className={styles.cardTitle}>
            <User size={20} /> Thông tin cá nhân
          </h3>

          {profileMsg.text && (
            <div className={`${styles.messageBox} ${profileMsg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateInfo}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên hiển thị</label>
              <input
                type="text"
                className={styles.formInput}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị của bạn..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Địa chỉ Email (Không thể thay đổi)</label>
              <input
                type="text"
                className={styles.formInput}
                value={currentUser.email}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vai trò hiện tại (Role)</label>
              <div className={styles.roleBox}>
                <span className={`${styles.roleTag} ${currentUser.isAdmin ? styles.adminTag : currentUser.isSenpai ? styles.senpaiTag : styles.studentTag}`}>
                  {currentUser.isAdmin ? 'Quản trị viên (Admin)' : currentUser.isSenpai ? 'Senpai' : 'Học viên'}
                </span>
                <span className={styles.roleDesc}>
                  {currentUser.isAdmin ? 'Bạn có toàn quyền truy cập Admin Panel.' : currentUser.isSenpai ? 'Bạn là thành viên có kinh nghiệm được chia sẻ kiến thức.' : 'Thành viên học tập bình thường.'}
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mục tiêu nghề nghiệp</label>
              <div className={styles.customDropdown} ref={careerGoalDropdownRef}>
                <button
                  type="button"
                  className={styles.dropdownToggle}
                  onClick={() => setIsCareerGoalOpen(!isCareerGoalOpen)}
                >
                  <span>{getCareerGoalLabel(careerGoal)}</span>
                  <ChevronDown size={16} className={`${styles.dropdownChevron} ${isCareerGoalOpen ? styles.chevronOpen : ''}`} />
                </button>
                {isCareerGoalOpen && (
                  <div className={styles.dropdownMenu}>
                    {CAREER_GOALS.map((group, gIdx) => (
                      <div key={gIdx} className={styles.dropdownGroup}>
                        <div className={styles.dropdownGroupHeader}>{group.category}</div>
                        {group.options.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`${styles.dropdownOption} ${careerGoal === opt.value ? styles.activeOption : ''}`}
                            onClick={() => {
                              setCareerGoal(opt.value);
                              setIsCareerGoalOpen(false);
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mô tả bản thân (Bio)</label>
              <textarea
                className={styles.formTextarea}
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hãy giới thiệu ngắn gọn về bản thân hoặc định hướng công việc của bạn..."
              />
            </div>

            <button type="submit" className={styles.btnPrimary}>
              <Save size={18} /> Lưu thông tin hồ sơ
            </button>
          </form>
        </div>

        {/* Right Card: Security & Password */}
        <div className={`${styles.bentoCard} ${styles.securityCard}`}>
          <div>
            <h3 className={styles.cardTitle}>
              <Key size={20} /> Đổi mật khẩu tài khoản
            </h3>

            {passMsg.text && (
              <div className={`${styles.messageBox} ${passMsg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                {passMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>

              <button type="submit" className={styles.btnOutline}>
                <Key size={18} /> Thay đổi mật khẩu
              </button>
            </form>
          </div>

          {/* Setup / Change Security Question */}
          <SecurityQuestionSection currentUser={currentUser} onUpdateProfile={onUpdateProfile} />
        </div>

      </div>

      {isCropperOpen && createPortal(
        <AvatarCropperModal
          src={rawImageSrc}
          isClosing={isCropperClosing}
          onClose={handleCloseCropper}
          onSave={handleCroppedAvatar}
        />,
        document.body
      )}
    </div>
  );
}

// Sub-component for clean organization of the Security Question Form
const SECURITY_QUESTIONS = [
  "Tên thú cưng đầu tiên của bạn là gì?",
  "Trường tiểu học của bạn tên là gì?",
  "Thành phố nơi bạn đã sinh ra là gì?",
  "Món ăn yêu thích nhất của bạn là gì?",
  "Tên thần tượng thời thơ ấu của bạn là gì?"
];

function SecurityQuestionSection({ currentUser, onUpdateProfile }) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const dbUser = users.find(u => u.email === currentUser.email) || {};

  const [question, setQuestion] = useState(dbUser.securityQuestion || SECURITY_QUESTIONS[0]);
  const [answer, setAnswer] = useState(dbUser.securityAnswer || '');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [isSecurityQuestionOpen, setIsSecurityQuestionOpen] = useState(false);
  const securityQuestionDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (securityQuestionDropdownRef.current && !securityQuestionDropdownRef.current.contains(event.target)) {
        setIsSecurityQuestionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!answer.trim()) {
      setMsg({ type: 'error', text: 'Câu trả lời không được để trống.' });
      return;
    }

    const latestUsers = await getSharedArray('users', users);
    const updatedUsers = latestUsers.map(u => {
      if (u.email === currentUser.email) {
        return { ...u, securityQuestion: question, securityAnswer: answer.trim() };
      }
      return u;
    });

    await setSharedArray('users', updatedUsers);
    
    // Sync into currentUser session state
    onUpdateProfile({
      securityQuestion: question,
      securityAnswer: answer.trim()
    });

    setMsg({ type: 'success', text: 'Cập nhật câu hỏi bảo mật thành công!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div style={{ paddingTop: '1.5rem', marginTop: 'auto' }}>
      <h3 className={styles.cardTitle} style={{ fontSize: '1.15rem' }}>
        <User size={18} /> Câu hỏi bảo mật reset password
      </h3>
      
      {msg.text && (
        <div className={`${styles.messageBox} ${msg.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSaveQuestion}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Chọn câu hỏi</label>
          <div className={styles.customDropdown} ref={securityQuestionDropdownRef}>
            <button
              type="button"
              className={styles.dropdownToggle}
              onClick={() => setIsSecurityQuestionOpen(!isSecurityQuestionOpen)}
            >
              <span>{question}</span>
              <ChevronDown size={16} className={`${styles.dropdownChevron} ${isSecurityQuestionOpen ? styles.chevronOpen : ''}`} />
            </button>
            {isSecurityQuestionOpen && (
              <div className={styles.dropdownMenu}>
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.dropdownOption} ${question === q ? styles.activeOption : ''}`}
                    onClick={() => {
                      setQuestion(q);
                      setIsSecurityQuestionOpen(false);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Câu trả lời</label>
          <input
            type="text"
            className={styles.formInput}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Nhập câu trả lời để lấy lại mật khẩu sau này..."
            required
          />
        </div>

        <button type="submit" className={styles.btnPrimary}>
          <Save size={18} /> Lưu câu hỏi bảo mật
        </button>
      </form>
    </div>
  );
}

/* Avatar Cropper Modal Component */
function AvatarCropperModal({ src, isClosing, onClose, onSave }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setOffset({ x: 0, y: 0 });
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 150; // Output avatar size
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Center of canvas: (75, 75)
    ctx.translate(75, 75);

    // Apply flip
    ctx.scale(flipH ? -1 : 1, 1);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Ratio of canvas size (150px) to UI crop area (250px) is 0.6
    const ratio = 150 / 250;

    // Apply offset (scaled to canvas size)
    ctx.translate(offset.x * ratio, offset.y * ratio);

    // Draw the image centered
    const displayedWidth = imgElement.clientWidth;
    const displayedHeight = imgElement.clientHeight;

    // Apply zoom
    ctx.scale(zoom, zoom);

    ctx.drawImage(
      imgElement,
      (-displayedWidth / 2) * ratio,
      (-displayedHeight / 2) * ratio,
      displayedWidth * ratio,
      displayedHeight * ratio
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedDataUrl);
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${styles.cropperModalContent} ${isClosing ? 'closing' : ''}`}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa Ảnh Đại Diện</h3>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div
            className={styles.cropWrapper}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={src}
              alt="To crop"
              className={styles.cropImageElement}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
              }}
            />
            <div className={styles.cropCircleOverlay} />
          </div>

          <div className={styles.controlsContainer}>
            <div className={styles.zoomControl}>
              <Minus size={16} />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.zoomSlider}
              />
              <Plus size={16} />
            </div>

            <div className={styles.toolRow}>
              <button
                type="button"
                className={styles.btnTool}
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
              >
                <RotateCw size={12} /> Xoay 90°
              </button>
              <button
                type="button"
                className={styles.btnTool}
                onClick={() => setFlipH((prev) => !prev)}
              >
                Lật ngang
              </button>
              <button
                type="button"
                className={styles.btnTool}
                onClick={handleReset}
              >
                <RefreshCw size={12} /> Đặt lại
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Hủy
          </button>
          <button type="button" className={styles.btnSave} onClick={handleSave}>
            Cắt & Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
