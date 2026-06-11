import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, HelpCircle, CheckCircle, ShieldQuestion } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "Tên thú cưng đầu tiên của bạn là gì?",
  "Trường tiểu học của bạn tên là gì?",
  "Thành phố nơi bạn đã sinh ra là gì?",
  "Món ăn yêu thích nhất của bạn là gì?",
  "Tên thần tượng thời thơ ấu của bạn là gì?"
];

export default function Auth({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration security question states
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Forgot password flow states
  const [userFound, setUserFound] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [answerVerified, setAnswerVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [foundUserEmail, setFoundUserEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Bước 1: Tìm tài khoản theo email → lấy câu hỏi bảo mật
  const handleFindAccount = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (email !== 'admin@nihon.com' && !gmailRegex.test(email)) {
      setErrorMsg('Email tìm kiếm phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === email);

    if (found) {
      if (!found.securityQuestion) {
        setErrorMsg('Tài khoản này chưa thiết lập câu hỏi bảo mật. Vui lòng liên hệ quản trị viên.');
        return;
      }
      setFoundUserEmail(found.email);
      setUserQuestion(found.securityQuestion);
      setUserFound(true);
    } else if (email === 'admin@nihon.com') {
      setErrorMsg('Tài khoản Admin không thể khôi phục qua câu hỏi bảo mật.');
    } else {
      setErrorMsg('Không tìm thấy tài khoản nào khớp với Email này.');
    }
  };

  // Bước 2: Xác minh câu trả lời bí mật
  const handleVerifyAnswer = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === foundUserEmail);

    if (!found) {
      setErrorMsg('Không tìm thấy tài khoản.');
      return;
    }

    if (found.securityAnswer?.trim().toLowerCase() === userAnswerInput.trim().toLowerCase()) {
      setAnswerVerified(true);
      setSuccessMsg('Trả lời đúng! Vui lòng nhập mật khẩu mới.');
    } else {
      setErrorMsg('Câu trả lời không đúng. Vui lòng thử lại.');
    }
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIdx = users.findIndex(u => u.email === foundUserEmail);

    if (userIdx !== -1) {
      users[userIdx].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      setSuccessMsg('Đặt lại mật khẩu thành công! Hãy đăng nhập.');
      setTimeout(() => {
        setAuthMode('login');
        setUserFound(false);
        setAnswerVerified(false);
        setUserAnswerInput('');
        setNewPassword('');
        setFoundUserEmail('');
        setUserQuestion('');
      }, 1500);
    } else {
      setErrorMsg('Không tìm thấy tài khoản để cập nhật.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Regex check strict @gmail.com format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (authMode === 'login') {
      if (email === 'admin@nihon.com' && password === 'admin123') {
        const adminUser = { name: 'Admin Senpai', email, isAdmin: true, avatar: '🦊' };
        localStorage.setItem('session_user', JSON.stringify(adminUser));
        onLogin(adminUser);
        return;
      }

      if (!gmailRegex.test(email)) {
        setErrorMsg('Email đăng nhập phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
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
      if (!name || !email || !password || !securityAnswer) {
        setErrorMsg('Vui lòng điền đầy đủ tất cả thông tin.');
        return;
      }

      if (!gmailRegex.test(email)) {
        setErrorMsg('Email đăng ký phải đúng định dạng @gmail.com (Ví dụ: user@gmail.com)');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email === email)) {
        setErrorMsg('Email này đã được đăng ký!');
        return;
      }

      if (users.some(u => u.name.trim().toLowerCase() === name.trim().toLowerCase()) || name.trim().toLowerCase() === 'admin senpai') {
        setErrorMsg('Tên hiển thị này đã tồn tại! Vui lòng chọn tên khác.');
        return;
      }

      const newUser = { 
        name, 
        email, 
        password,
        avatar: '🧑‍💻',
        bio: '',
        careerGoal: 'Software Engineer (Japan)',
        securityQuestion,
        securityAnswer
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      setSuccessMsg('Đăng ký tài khoản kèm câu hỏi bảo mật thành công! Hãy đăng nhập.');
      setAuthMode('login');
      setName('');
      setPassword('');
      setSecurityAnswer('');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-circle" style={{ margin: '0 auto 1rem auto', width: '32px', height: '32px' }}></div>
          <h2 className="auth-title">
            {authMode === 'login' ? 'Đăng Nhập' : authMode === 'register' ? 'Tạo Tài Khoản' : 'Khôi Phục Mật Khẩu'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'login' 
              ? 'Đăng nhập để học quy tắc văn hóa Nhật Bản' 
              : authMode === 'register' 
              ? 'Đăng ký thành viên Nihon Career Ready'
              : 'Xác minh danh tính qua câu hỏi bảo mật'
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

        {authMode === 'forgot' ? (
          !userFound ? (
            // Bước 1: Nhập email để tìm tài khoản
            <form onSubmit={handleFindAccount}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email tài khoản của bạn</label>
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Tìm tài khoản <ArrowRight size={16} />
              </button>
            </form>
          ) : !answerVerified ? (
            // Bước 2: Trả lời câu hỏi bảo mật
            <form onSubmit={handleVerifyAnswer}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(var(--jp-blue-rgb, 37,99,235), 0.07)', borderLeft: '3px solid var(--jp-blue)', padding: '0.75rem 1rem', borderRadius: 'var(--jp-radius)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Câu hỏi bảo mật của bạn:</span>
                  <strong style={{ color: 'var(--jp-text)', fontSize: '0.9rem' }}>🔒 {userQuestion}</strong>
                </div>
                <label className="form-label">Câu trả lời của bạn</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập câu trả lời bí mật..."
                  value={userAnswerInput}
                  onChange={(e) => setUserAnswerInput(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', display: 'block', marginTop: '0.5rem' }}>
                  Nhập đúng câu trả lời bạn đã đặt khi đăng ký.
                </span>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Xác nhận câu trả lời <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            // Bước 3: Đặt mật khẩu mới
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Đặt mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Mật khẩu mới tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Cập nhật mật khẩu mới <CheckCircle size={16} />
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <>
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

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Chọn câu hỏi bảo mật (Dùng để lấy lại mật khẩu)</label>
                  <select 
                    className="form-input"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                  >
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Câu trả lời bí mật</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập câu trả lời để khôi phục sau này..."
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                  />
                </div>
              </>
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
                setUserFound(false);
                setAnswerVerified(false);
                setUserAnswerInput('');
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
                setUserFound(false);
                setAnswerVerified(false);
                setUserAnswerInput('');
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
