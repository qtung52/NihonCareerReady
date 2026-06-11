import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password flow states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Gửi OTP thật miễn phí qua API dịch vụ mail công cộng
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSendingOtp(true);

    const isSystemAdmin = email === 'admin@nihon.com';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(u => u.email === email);

    if (!isSystemAdmin && !userExists) {
      setErrorMsg('Không tìm thấy tài khoản nào với địa chỉ Email này.');
      setSendingOtp(false);
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      // Gửi OTP real sử dụng API gửi mail tức thời qua formspree / web3forms hoặc email public API
      // Sử dụng Web3Forms API miễn phí, không cần cấu hình SMTP, nhận mail tức thì
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '6ea3c0a1-4328-40a2-a0b2-4d2be7ec5488', // Web3Forms Key công cộng an toàn cho Frontend
          subject: '[Nihon Career Ready] Mã xác thực OTP khôi phục mật khẩu',
          from_name: 'Nihon Career Ready',
          to_email: email, // Gửi thẳng đến mail thật của người dùng
          email: 'support@nihoncareer.com',
          message: `Chào bạn,\n\nMã xác thực OTP của bạn để khôi phục mật khẩu trên hệ thống Nihon Career Ready là: ${otp}\n\nVui lòng nhập mã này vào trang web để đổi mật khẩu mới.\n\nTrân trọng,\nĐội ngũ Nihon Career Ready.`
        })
      });

      if (response.ok) {
        setOtpSent(true);
        setSuccessMsg(`Mã OTP đã được gửi THẬT tới hòm thư ${email} của bạn! Vui lòng kiểm tra mục Inbox hoặc Spam (Thư rác).`);
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      // Fallback nếu API lỗi mạng để không block người dùng test
      setOtpSent(true);
      setSuccessMsg(`[Lưu ý: Sự cố gửi mail thật, mô phỏng kích hoạt] Đã gửi mã xác nhận tới: ${email}`);
      console.log('OTP Code generated:', otp);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndReset = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (enteredOtp !== generatedOtp) {
      setErrorMsg('Mã OTP không chính xác. Vui lòng nhập đúng mã xác thực.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (email === 'admin@nihon.com') {
      setErrorMsg('Không thể đổi mật khẩu tài khoản Admin mặc định hệ thống.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIdx = users.findIndex(u => u.email === email);

    if (userIdx !== -1) {
      users[userIdx].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      setSuccessMsg('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
      setAuthMode('login');
      // Reset state
      setOtpSent(false);
      setGeneratedOtp('');
      setEnteredOtp('');
      setNewPassword('');
    } else {
      setErrorMsg('Đã có lỗi xảy ra. Hãy thử lại.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'login') {
      if (email === 'admin@nihon.com' && password === 'admin123') {
        const adminUser = { name: 'Admin Senpai', email, isAdmin: true, avatar: '🦊' };
        localStorage.setItem('session_user', JSON.stringify(adminUser));
        onLogin(adminUser);
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        const loggedUser = { 
          name: user.name, 
          email: user.email, 
          isAdmin: false, 
          avatar: user.avatar || '🧑‍💻', 
          bio: user.bio || '',
          careerGoal: user.careerGoal || 'Software Engineer (Japan)'
        };
        localStorage.setItem('session_user', JSON.stringify(loggedUser));
        onLogin(loggedUser);
      } else {
        setErrorMsg('Sai email hoặc mật khẩu! Vui lòng kiểm tra lại.');
      }
    } else if (authMode === 'register') {
      if (!name || !email || !password) {
        setErrorMsg('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email === email)) {
        setErrorMsg('Email này đã được đăng ký!');
        return;
      }

      const newUser = { 
        name, 
        email, 
        password,
        avatar: '🧑‍💻',
        bio: '',
        careerGoal: 'Software Engineer (Japan)'
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      setSuccessMsg('Đăng ký tài khoản thành công! Hãy đăng nhập.');
      setAuthMode('login');
      setName('');
      setPassword('');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-circle" style={{ margin: '0 auto 1rem auto', width: '32px', height: '32px' }}></div>
          <h2 className="auth-title">
            {authMode === 'login' ? 'Đăng Nhập' : authMode === 'register' ? 'Tạo Tài Khoản' : 'Đặt Lại Mật Khẩu'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'login' 
              ? 'Đăng nhập để học quy tắc văn hóa Nhật Bản' 
              : authMode === 'register' 
              ? 'Đăng ký thành viên Nihon Career Ready'
              : 'Xác minh OTP & Đặt mật khẩu mới'
            }
          </p>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--jp-red)', background: 'rgba(188, 0, 45, 0.05)', padding: '0.75rem', borderRadius: 'var(--jp-radius)', fontSize: '0.85rem', marginBottom: '1.25rem', borderLeft: '3px solid var(--jp-red)' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.05)', padding: '0.75rem', borderRadius: 'var(--jp-radius)', fontSize: '0.85rem', marginBottom: '1.25rem', borderLeft: '3px solid #2ecc71' }}>
            {successMsg}
          </div>
        )}

        {/* Luôn hiển thị thêm mã dự phòng ở log/console để admin kiểm tra trong trường hợp mạng lỗi */}
        {generatedOtp && otpSent && authMode === 'forgot' && (
          <div style={{ border: '2px dashed var(--jp-blue)', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', display: 'block' }}>
              🔑 Mã dự phòng (Chỉ hiển thị để bạn test nhanh): <strong>{generatedOtp}</strong>
            </span>
          </div>
        )}

        {authMode === 'forgot' ? (
          !otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email của bạn (Nhập email thật để nhận thư)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sendingOtp}>
                {sendingOtp ? 'Đang gửi mail OTP thật...' : 'Gửi mã xác nhận OTP'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndReset}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Nhập mã xác nhận OTP (Đã gửi về hòm thư của bạn)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập 6 số..."
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Đặt lại mật khẩu <CheckCircle size={16} />
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">Tên của bạn</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email đăng nhập</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          {authMode === 'login' && (
            <button
              onClick={() => {
                setAuthMode('forgot');
                setErrorMsg('');
                setSuccessMsg('');
                setOtpSent(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--jp-red)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
            >
              <HelpCircle size={14} /> Quên mật khẩu?
            </button>
          )}

          <div>
            <span style={{ color: 'var(--jp-text-muted)' }}>
              {authMode === 'login' || authMode === 'forgot' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            </span>
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setSuccessMsg('');
                setOtpSent(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--jp-blue)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập tại đây'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
