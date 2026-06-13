import { useState } from 'react';
import { Lock, Mail, User, ArrowRight, HelpCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { getSharedArray, isSupabaseEnabled, setSharedArray } from '../lib/sharedStore';

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
  const [showPassword, setShowPassword] = useState(false);
  
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

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    
    let label = 'Yếu';
    let color = 'weak';
    if (score === 2) {
      label = 'Trung bình';
      color = 'medium';
    } else if (score === 3) {
      label = 'Mạnh';
      color = 'strong';
    }
    return { score, label, color };
  };

  const strength = getPasswordStrength(password);

  // Bước 1: Tìm tài khoản theo email → lấy câu hỏi bảo mật
  const handleFindAccount = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (email !== 'admin@nihon.com' && !gmailRegex.test(email)) {
      setErrorMsg('Email tìm kiếm phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
      return;
    }

    const users = await getSharedArray('users', []);
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
  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const users = await getSharedArray('users', []);
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
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    const users = await getSharedArray('users', []);
    const userIdx = users.findIndex(u => u.email === foundUserEmail);

    if (userIdx !== -1) {
      users[userIdx].password = newPassword;
      await setSharedArray('users', users);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Regex check strict @gmail.com format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (authMode === 'login') {
      if (email === 'admin@nihon.com' && password === 'admin123') {
        const adminUser = { 
          name: 'Admin Senpai', 
          email, 
          isAdmin: true, 
          avatar: '🦊',
          bio: 'Quản trị viên hệ thống Nihon Career Ready. Rất vui được hỗ trợ và định hướng văn hóa cho các bạn Kouhai.',
          careerGoal: 'Lãnh đạo Giáo dục / Nhân sự Nhật Bản'
        };
        localStorage.setItem('session_user', JSON.stringify(adminUser));
        onLogin(adminUser);
        return;
      }

      if (!gmailRegex.test(email)) {
        setErrorMsg('Email đăng nhập phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
        return;
      }

      const users = await getSharedArray('users', []);
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        const loggedUser = { 
          name: user.name, 
          email: user.email, 
          isAdmin: !!user.isAdmin, 
          isSenpai: !!user.isSenpai,
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

      if (password.length < 6) {
        setErrorMsg('Mật khẩu đăng ký phải từ 6 ký tự trở lên.');
        return;
      }

      const users = await getSharedArray('users', []);
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
      await setSharedArray('users', users);

      setSuccessMsg('Đăng ký tài khoản kèm câu hỏi bảo mật thành công! Hãy đăng nhập.');
      setAuthMode('login');
      setName('');
      setPassword('');
      setSecurityAnswer('');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* Left Side: Promo panel (Desktop only, styled with linear-gradients & Wa-Minimalism aesthetics) */}
        <div className="auth-promo">
          <div className="auth-promo-logo">
            <div className="logo-circle" style={{ width: '22px', height: '22px', border: '2px solid white', boxShadow: 'none' }}></div>
            <span>Nihon Career Ready</span>
          </div>

          <div style={{ zIndex: 1 }}>
            <span className="auth-promo-tag">KỸ NĂNG & VĂN HÓA CÔNG SỞ NHẬT</span>
            <h1 className="auth-promo-quote">
              Chìa khóa mở cánh cửa sự nghiệp chuyên nghiệp tại Nhật Bản
            </h1>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '380px' }}>
              Học tập các quy tắc ứng xử, viết Rirekisho chuẩn JIS, và luyện tập thử thách thực tế cùng Senpai hỗ trợ bởi Trợ lý AI.
            </p>
          </div>

          <div style={{ fontSize: '0.78rem', opacity: 0.6, zIndex: 1 }}>
            © {new Date().getFullYear()} Nihon Career Ready. Thiết kế tối giản tinh tế.
          </div>
          <div className="auth-promo-wave" />
        </div>

        {/* Right Side: Form panel */}
        <div className="auth-form-side">
          <div className="auth-header">
            <h2 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
              {authMode === 'login' ? 'Đăng Nhập' : authMode === 'register' ? 'Tạo Tài Khoản' : 'Khôi Phục'}
            </h2>
            <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>
              {authMode === 'login' 
                ? 'Đăng nhập để tiếp tục học quy tắc văn hóa Nhật Bản' 
                : authMode === 'register' 
                ? 'Đăng ký tài khoản thành viên mới'
                : 'Khôi phục mật khẩu thông qua câu hỏi bảo mật'
              }
            </p>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--jp-red)', background: 'rgba(188, 0, 45, 0.05)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem', borderLeft: '3px solid var(--jp-red)', lineHeight: '1.4' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.05)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem', borderLeft: '3px solid #2ecc71', lineHeight: '1.4' }}>
              {successMsg}
            </div>
          )}

          {authMode === 'forgot' ? (
            !userFound ? (
              // Step 1: Input email to search
              <form onSubmit={handleFindAccount}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email tài khoản</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      className="form-input form-input-icon-left"
                      placeholder="user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px' }}>
                  Tìm tài khoản <ArrowRight size={15} />
                </button>
              </form>
            ) : !answerVerified ? (
              // Step 2: Answer security question
              <form onSubmit={handleVerifyAnswer}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--jp-soft-surface)', borderLeft: '3px solid var(--jp-blue)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', display: 'block', marginBottom: '0.2' }}>Câu hỏi bảo mật của bạn:</span>
                    <strong style={{ color: 'var(--jp-text)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🔒 {userQuestion}</strong>
                  </div>
                  <label className="form-label">Câu trả lời bảo mật</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập câu trả lời bí mật..."
                    value={userAnswerInput}
                    onChange={(e) => setUserAnswerInput(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px' }}>
                  Xác nhận câu trả lời <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              // Step 3: Set new password
              <form onSubmit={handleResetPassword}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Mật khẩu mới</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input form-input-icon-both"
                      placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="pwd-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px' }}>
                  Cập nhật mật khẩu <CheckCircle size={15} />
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit}>
              {authMode === 'register' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Họ và Tên</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        className="form-input form-input-icon-left"
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chọn câu hỏi bảo mật</label>
                    <select 
                      className="form-input"
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      style={{ padding: '0.55rem 0.85rem', height: '42px' }}
                    >
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Câu trả lời bảo mật</label>
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
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    className="form-input form-input-icon-left"
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: authMode === 'register' ? '0.75rem' : '1.25rem' }}>
                <label className="form-label">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jp-text-muted)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input form-input-icon-both"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="pwd-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter for Register Mode */}
                {authMode === 'register' && password && (
                  <div className="password-strength-container">
                    <div className="password-strength-label">
                      <span>Độ bảo mật mật khẩu:</span>
                      <strong className={`strength-${strength.color}`} style={{ 
                        color: strength.color === 'weak' ? 'var(--jp-red)' : strength.color === 'medium' ? '#f1c40f' : '#2ecc71'
                      }}>{strength.label}</strong>
                    </div>
                    <div className="password-strength-bars">
                      <div className={`password-strength-bar ${strength.score >= 1 ? strength.color : ''}`} />
                      <div className={`password-strength-bar ${strength.score >= 2 ? strength.color : ''}`} />
                      <div className={`password-strength-bar ${strength.score >= 3 ? strength.color : ''}`} />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px', marginTop: '0.5rem' }}>
                {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Switch flow link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem' }}>
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
    </div>
  );
}


