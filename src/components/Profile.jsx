import React, { useState } from 'react';
import { User, Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

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

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'Tên hiển thị không được để trống.' });
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

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ tất cả các trường mật khẩu.' });
      return;
    }

    // Get database from localStorage to verify and save
    const users = JSON.parse(localStorage.getItem('users') || '[]');
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
    localStorage.setItem('users', JSON.stringify(users));

    // Update session info
    onUpdateProfile({ password: newPassword });

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassMsg({ type: 'success', text: 'Thay đổi mật khẩu thành công!' });
    setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
  };

  return (
    <div className="profile-container">
      <div className="section-header">
        <h2 className="section-title">Cài đặt Tài khoản - Profile Setting</h2>
        <p className="section-subtitle">Chỉnh sửa hồ sơ cá nhân và quản lý bảo mật tài khoản.</p>
      </div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Card: Personal Information */}
        <div className="card-face" style={{ padding: '2rem', height: 'fit-content', background: '#fff', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius)', transform: 'none', position: 'relative', display: 'block' }}>
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
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ảnh đại diện (Avatar Emoji)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jp-blue-light)', borderRadius: '50%', border: '2px solid var(--jp-blue)' }}>
                  {avatar}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.emoji)}
                      style={{
                        fontSize: '1.5rem',
                        padding: '0.3rem',
                        border: avatar === av.emoji ? '2px solid var(--jp-red)' : '1px solid var(--jp-border)',
                        background: avatar === av.emoji ? '#fff5f5' : '#fff',
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
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--jp-border)', borderRadius: '4px', background: '#f1f5f9', cursor: 'not-allowed' }}
              />
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
                <option value="IT Communicator (Comtor)">IT Communicator (Comtor)</option>
                <option value="Software Engineer (Japan)">Kỹ sư phần mềm (Bridge SE / Developer)</option>
                <option value="Business Analyst (BA)">Phân tích nghiệp vụ (BA)</option>
                <option value="Foreign Trade Specialist">Nhân viên Xuất Nhập Khẩu</option>
                <option value="Japanese Teacher / Interpreter">Giảng viên / Phiên dịch viên tiếng Nhật</option>
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
        <div className="card-face" style={{ padding: '2rem', height: 'fit-content', background: '#fff', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius)', transform: 'none', position: 'relative', display: 'block' }}>
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

            <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', color: 'var(--jp-red)', borderColor: 'var(--jp-red)' }}>
              <Key size={16} /> Thay đổi mật khẩu
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
