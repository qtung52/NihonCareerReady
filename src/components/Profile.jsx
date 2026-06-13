import { useState } from 'react';
import { User, Key, Save, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';

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

export default function Profile({ currentUser, onUpdateProfile }) {
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '🧑‍💻');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [careerGoal, setCareerGoal] = useState(currentUser.careerGoal || 'Software Engineer (Japan)');
  
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

    onUpdateProfile({
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
    onUpdateProfile({ password: newPassword });

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
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-container">
      <div className="section-header">
        <h2 className="section-title">Cài đặt Tài khoản - Profile Setting</h2>
        <p className="section-subtitle">Chỉnh sửa hồ sơ cá nhân và quản lý bảo mật tài khoản.</p>
      </div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Card: Personal Information */}
        <div className="card-face profile-card" style={{ padding: '2rem', height: 'fit-content', background: 'var(--jp-card-bg)', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius)', transform: 'none', position: 'relative', display: 'block' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--jp-blue)', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '2px solid var(--jp-red)', paddingBottom: '0.5rem' }}>
            <User size={20} /> Thông tin cá nhân
          </h3>

          {profileMsg.text && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--jp-radius)',
              background: profileMsg.type === 'success' ? '#e6f4ea' : '#fce8e6',
              color: profileMsg.type === 'success' ? '#137333' : '#c5221f',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateInfo}>
            {/* Avatar Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ảnh đại diện (Avatar)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jp-blue-light)', borderRadius: '50%', border: '2px solid var(--jp-blue)', overflow: 'hidden' }}>
                  {avatar.startsWith('data:image') ? (
                    <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    avatar
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {AVATARS.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatar(av.emoji)}
                        style={{
                          fontSize: '1.5rem',
                          padding: '0.3rem',
                          border: avatar === av.emoji ? '2px solid var(--jp-red)' : '1px solid var(--jp-border)',
                          background: avatar === av.emoji ? 'var(--jp-soft-red)' : 'var(--jp-surface-raised)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                        title={av.name}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'var(--jp-surface-raised)', border: '1px dashed var(--jp-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--jp-text-muted)', transition: 'all 0.2s' }} className="hover-scale">
                      <Upload size={14} /> Tải ảnh lên (Max 2MB)
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Tên hiển thị</label>
              <input
                type="text"
                className="form-control"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị của bạn..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
                required
              />
            </div>

            {/* Email (Readonly) */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, color: 'var(--jp-text-muted)' }}>Địa chỉ Email (Không thể thay đổi)</label>
              <input
                type="text"
                className="form-control"
                value={currentUser.email}
                disabled
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px', background: 'var(--jp-surface-raised)', cursor: 'not-allowed' }}
              />
            </div>

            {/* Role (Readonly) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--jp-text-muted)' }}>Vai trò hiện tại (Role)</label>
              <div style={{
                padding: '0.75rem',
                border: '1px solid var(--jp-border)',
                borderRadius: '4px',
                background: 'var(--jp-surface-raised)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span 
                  className={currentUser.isAdmin ? 'admin-rgb-tag' : ''}
                  style={{ 
                  background: !currentUser.isAdmin && currentUser.isSenpai ? 'var(--jp-blue)' : !currentUser.isAdmin ? '#eee' : undefined, 
                  color: !currentUser.isAdmin && currentUser.isSenpai ? 'white' : !currentUser.isAdmin ? '#666' : undefined,
                  fontSize: '0.85rem', 
                  padding: '4px 12px', 
                  borderRadius: '12px',
                  fontWeight: !currentUser.isAdmin ? 'normal' : undefined,
                  display: 'inline-block'
                }}>
                  {currentUser.isAdmin ? 'Quản trị viên (Admin)' : currentUser.isSenpai ? 'Senpai' : 'Học viên'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)', fontStyle: 'italic' }}>
                  {currentUser.isAdmin ? 'Bạn có toàn quyền truy cập Admin Panel.' : currentUser.isSenpai ? 'Bạn là thành viên có kinh nghiệm được chia sẻ kiến thức.' : 'Thành viên học tập bình thường.'}
                </span>
              </div>
            </div>

            {/* Career Path */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Mục tiêu nghề nghiệp</label>
              <select
                className="form-control"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
              >
                {/* Nhóm IT & Công nghệ */}
                <optgroup label="💻 IT & Công nghệ">
                  <option value="IT Communicator (Comtor)">IT Communicator (Comtor)</option>
                  <option value="Software Engineer (Japan)">Kỹ sư phần mềm (Bridge SE / Developer)</option>
                  <option value="Business Analyst (BA)">Phân tích nghiệp vụ (BA)</option>
                  <option value="QA/QC Engineer">Kỹ sư kiểm thử phần mềm (QA/QC)</option>
                  <option value="IT Project Manager">Quản lý dự án IT (IT PM)</option>
                  <option value="Data Analyst / Data Scientist">Phân tích dữ liệu / Data Scientist</option>
                  <option value="UI/UX Designer">Thiết kế giao diện (UI/UX Designer)</option>
                  <option value="Network / Infrastructure Engineer">Kỹ sư hạ tầng / Mạng máy tính</option>
                </optgroup>

                {/* Nhóm Kinh doanh & Thương mại */}
                <optgroup label="🌏 Kinh doanh & Thương mại">
                  <option value="International Business Specialist">Kinh doanh Quốc tế (International Business)</option>
                  <option value="Import-Export & Logistics Officer">Xuất Nhập Khẩu & Logistics</option>
                  <option value="Global Marketing Executive">Marketing toàn cầu (Global Marketing)</option>
                  <option value="Sales Manager / Business Development">Kinh doanh & Phát triển thị trường (BDM)</option>
                  <option value="E-Commerce & Digital Marketing Specialist">E-Commerce & Tiếp thị số</option>
                  <option value="Supply Chain Manager">Quản lý chuỗi cung ứng (Supply Chain)</option>
                  <option value="Purchasing & Procurement Officer">Mua hàng & Đấu thầu (Procurement)</option>
                </optgroup>

                {/* Nhóm Tài chính & Kế toán */}
                <optgroup label="💴 Tài chính & Kế toán">
                  <option value="Accountant / Auditor (Japan)">Kế toán / Kiểm toán viên Nhật Bản</option>
                  <option value="Financial Analyst">Phân tích tài chính (Financial Analyst)</option>
                  <option value="Banking & Finance Officer">Ngân hàng & Tài chính quốc tế</option>
                  <option value="Tax Consultant / CPA">Tư vấn thuế / Kế toán công chứng (CPA)</option>
                </optgroup>

                {/* Nhóm Du lịch & Khách sạn */}
                <optgroup label="🏨 Du lịch & Khách sạn">
                  <option value="Hotel & Hospitality Manager">Quản lý Khách sạn & Dịch vụ (Hospitality)</option>
                  <option value="Tourism & Travel Consultant">Hướng dẫn viên / Tư vấn Du lịch Nhật Bản</option>
                  <option value="Restaurant & F&B Manager">Quản lý Nhà hàng & F&B</option>
                  <option value="Airline Ground Staff / Cabin Crew">Nhân viên Hàng không / Tiếp viên</option>
                </optgroup>

                {/* Nhóm Ngôn ngữ & Giáo dục */}
                <optgroup label="📚 Ngôn ngữ & Giáo dục">
                  <option value="Japanese Teacher / Interpreter">Giảng viên / Phiên dịch viên tiếng Nhật</option>
                  <option value="Professional Translator (JP-VI)">Biên / Phiên dịch chuyên nghiệp (Nhật - Việt)</option>
                  <option value="Education Consultant (Study Abroad Japan)">Tư vấn du học Nhật Bản</option>
                  <option value="Content Creator / Media (Japan)">Sáng tạo nội dung / Truyền thông Nhật Bản</option>
                </optgroup>

                {/* Nhóm Nhân sự & Hành chính */}
                <optgroup label="🏢 Nhân sự & Hành chính">
                  <option value="Human Resources (HR) Specialist">Nhân sự (HR) / Tuyển dụng quốc tế</option>
                  <option value="General Affairs / Admin Officer">Hành chính tổng hợp</option>
                  <option value="Legal / Compliance Officer">Pháp lý & Tuân thủ (Legal/Compliance)</option>
                </optgroup>

                {/* Nhóm Sản xuất & Kỹ thuật */}
                <optgroup label="⚙️ Sản xuất & Kỹ thuật">
                  <option value="Manufacturing Engineer (Monozukuri)">Kỹ sư sản xuất (Monozukuri)</option>
                  <option value="Quality Control Manager">Quản lý chất lượng (Quality Control)</option>
                  <option value="Mechanical / Electrical Engineer">Kỹ sư cơ điện / Tự động hóa</option>
                </optgroup>

                {/* Khác */}
                <optgroup label="🌟 Khác">
                  <option value="Entrepreneur / Startup Japan">Khởi nghiệp tại Nhật Bản (Startup)</option>
                  <option value="Other">Lĩnh vực khác</option>
                </optgroup>
              </select>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Mô tả bản thân (Bio)</label>
              <textarea
                className="form-control"
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hãy giới thiệu ngắn gọn về bản thân hoặc định hướng công việc của bạn..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> Lưu thông tin hồ sơ
            </button>
          </form>
        </div>

        {/* Right Card: Security & Password */}
        <div className="card-face profile-card" style={{ padding: '2rem', height: 'fit-content', background: 'var(--jp-card-bg)', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius)', transform: 'none', position: 'relative', display: 'block' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--jp-blue)', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '2px solid var(--jp-red)', paddingBottom: '0.5rem' }}>
            <Key size={20} /> Đổi mật khẩu tài khoản
          </h3>

          {passMsg.text && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--jp-radius)',
              background: passMsg.type === 'success' ? '#e6f4ea' : '#fce8e6',
              color: passMsg.type === 'success' ? '#137333' : '#c5221f',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {passMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang sử dụng..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', color: 'var(--jp-red)', borderColor: 'var(--jp-red)', marginBottom: '2rem' }}>
              <Key size={16} /> Thay đổi mật khẩu
            </button>
          </form>

          {/* Setup / Change Security Question */}
          <SecurityQuestionSection currentUser={currentUser} onUpdateProfile={onUpdateProfile} />
        </div>

      </div>
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
    <div style={{ borderTop: '1px dashed var(--jp-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--jp-blue)', marginBottom: '1rem', fontSize: '1.1rem' }}>
        <User size={18} /> Câu hỏi bảo mật reset password
      </h3>
      
      {msg.text && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--jp-radius)',
          background: msg.type === 'success' ? '#e6f4ea' : '#fce8e6',
          color: msg.type === 'success' ? '#137333' : '#c5221f',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSaveQuestion}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Chọn câu hỏi</label>
          <select
            className="form-control"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
          >
            {SECURITY_QUESTIONS.map((q, idx) => (
              <option key={idx} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Câu trả lời</label>
          <input
            type="text"
            className="form-control"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Nhập câu trả lời để lấy lại mật khẩu sau này..."
            style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px' }}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
          <Save size={16} /> Lưu câu hỏi bảo mật
        </button>
      </form>
    </div>
  );
}
