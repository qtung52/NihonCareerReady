import { useState } from 'react';
import { Lock, Mail, User, ArrowRight, HelpCircle, CheckCircle, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';
import styles from './Auth.module.css';

const SECURITY_QUESTIONS = [
  "Tên thú cưng đầu tiên của bạn là gì?",
  "Trường tiểu học của bạn tên là gì?",
  "Thành phố nơi bạn đã sinh ra là gì?",
  "Món ăn yêu thích nhất của bạn là gì?",
  "Tên thần tượng thời thơ ấu của bạn là gì?"
];

export default function Auth({ onLogin, theme, onToggleTheme }) {
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
    let color = styles.barWeak;
    if (score === 2) {
      label = 'Trung bình';
      color = styles.barMedium;
    } else if (score === 3) {
      label = 'Mạnh';
      color = styles.barStrong;
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
    <div className={styles.authWrapper}>
      <div className={styles.authContainer}>
        
        {/* Left Side: Promo panel */}
        <div className={styles.authPromo}>
          <div className={styles.authPromoLogo}>
            <div className={styles.logoCircle}>
              <span className={styles.logoDot}></span>
            </div>
            <span>Nihon Career Ready</span>
          </div>

          <div className={styles.authPromoMain}>
            <span className={styles.authPromoTag}>KỸ NĂNG & VĂN HÓA CÔNG SỞ NHẬT</span>
            <h1 className={styles.authPromoQuote}>
              Chìa khóa mở cánh cửa sự nghiệp chuyên nghiệp tại Nhật Bản
            </h1>
            <p className={styles.authPromoDesc}>
              Học tập các quy tắc ứng xử, viết Rirekisho chuẩn JIS, và luyện tập thử thách thực tế cùng Senpai hỗ trợ bởi Trợ lý AI.
            </p>

            {/* Feature Showcase Mockups */}
            <div className={styles.featureShowcase}>
              {/* Card 1: Etiquette */}
              <div className={`${styles.mockCard} ${styles.cardEtiquette}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardBadge}>Thử thách ứng xử</span>
                  <span className={styles.cardStatus}>Đang học</span>
                </div>
                <p className={styles.cardTitle}>Văn hóa rượu bia Nomikai</p>
                <div className={styles.cardAction}>
                  <span className={styles.actionIcon}>🍻</span>
                  <span className={styles.actionText}>Quy tắc rót bia cho sếp chuẩn Nhật</span>
                </div>
              </div>

              {/* Card 2: AI Senpai Feedback */}
              <div className={`${styles.mockCard} ${styles.cardAI}`}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.cardBadge} ${styles.aiBadge}`}>Trợ lý AI Senpai</span>
                  <span className={styles.cardPulse}></span>
                </div>
                <p className={styles.cardContent}>"Rirekisho của bạn đã chuẩn phong cách Keigo. Hãy điều chỉnh thêm phần PR bản thân..."</p>
                <div className={styles.cardFooter}>
                  <span className={styles.aiAvatar}>🤖</span>
                  <span className={styles.aiName}>AI Mentor Feedback</span>
                </div>
              </div>

              {/* Card 3: CV Progress */}
              <div className={`${styles.mockCard} ${styles.cardCV}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardBadge}>Trình tạo CV (JIS)</span>
                  <span className={styles.cardPercent}>85%</span>
                </div>
                <div className={styles.cvProgress}>
                  <div className={styles.cvProgressBar} style={{ width: '85%' }}></div>
                </div>
                <div className={styles.cvTarget}>
                  <span>LINE Corp (Tokyo)</span>
                  <span>Ứng tuyển Dev</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.authPromoFooter}>
            © {new Date().getFullYear()} Nihon Career Ready. Thiết kế tối giản tinh tế.
          </div>
        </div>

        {/* Right Side: Form panel */}
        <div className={styles.authFormSide}>
          {/* Floating Theme Toggle */}
          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={onToggleTheme}
            title={`Chuyển sang nền ${theme === 'light' ? 'tối' : 'sáng'}`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className={styles.formContainer}>
            <div className={styles.authHeader}>
              <h2 className={styles.authTitle}>
                {authMode === 'login' ? 'Đăng Nhập' : authMode === 'register' ? 'Tạo Tài Khoản' : 'Khôi Phục'}
              </h2>
              <p className={styles.authSubtitle}>
                {authMode === 'login' 
                  ? 'Chào mừng bạn quay lại với Nihon Career Ready' 
                  : authMode === 'register' 
                  ? 'Đăng ký tài khoản thành viên mới'
                  : 'Khôi phục mật khẩu thông qua câu hỏi bảo mật'
                }
              </p>
            </div>

            {/* Social Logins */}
            {authMode === 'login' && (
              <>
                <div className={styles.socialButtons}>
                  <button 
                    type="button" 
                    className={styles.socialBtn}
                    onClick={() => alert('Đăng nhập bằng Google đang bảo trì, vui lòng dùng Email / Mật khẩu!')}
                  >
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15 1 12 1 7.24 1 3.2 3.76 1.34 7.78l3.86 3c.9-2.7 3.42-4.74 6.8-4.74z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-4.97 3.7-8.62z"/>
                      <path fill="#FBBC05" d="M5.2 14.78c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.34 7.42C.48 9.17 0 11.03 0 12.6c0 1.57.48 3.43 1.34 5.18l3.86-3z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.38 0-5.9-2.04-6.8-4.74L1.34 16.64C3.2 20.66 7.24 23 12 23z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button 
                    type="button" 
                    className={styles.socialBtn}
                    onClick={() => alert('Đăng nhập bằng GitHub đang bảo trì, vui lòng dùng Email / Mật khẩu!')}
                  >
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
                <div className={styles.divider}>
                  <span>Hoặc đăng nhập bằng Email</span>
                </div>
              </>
            )}

            {errorMsg && (
              <div className={`${styles.messageBox} ${styles.errorBox}`}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className={`${styles.messageBox} ${styles.successBox}`}>
                {successMsg}
              </div>
            )}

            {authMode === 'forgot' ? (
              !userFound ? (
                // Step 1: Input email to search
                <form onSubmit={handleFindAccount}>
                  <div className={styles.formGroup}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      className={`${styles.floatingInput} ${email ? styles.hasValue : ''}`}
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className={styles.floatingLabel}>Email tài khoản</label>
                  </div>
                  <button type="submit" className={styles.btnPrimary}>
                    Tìm tài khoản <ArrowRight size={18} />
                  </button>
                </form>
              ) : !answerVerified ? (
                // Step 2: Answer security question
                <form onSubmit={handleVerifyAnswer}>
                  <div className={styles.securityQuestionDisplay}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Câu hỏi bảo mật của bạn:</span>
                    <strong style={{ color: 'var(--jp-text)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔒 {userQuestion}</strong>
                  </div>
                  <div className={styles.formGroup}>
                    <HelpCircle size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={`${styles.floatingInput} ${userAnswerInput ? styles.hasValue : ''}`}
                      placeholder=" "
                      value={userAnswerInput}
                      onChange={(e) => setUserAnswerInput(e.target.value)}
                      required
                    />
                    <label className={styles.floatingLabel}>Câu trả lời bảo mật</label>
                  </div>
                  <button type="submit" className={styles.btnPrimary}>
                    Xác nhận câu trả lời <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                // Step 3: Set new password
                <form onSubmit={handleResetPassword}>
                  <div className={styles.formGroup}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.floatingInput} ${newPassword ? styles.hasValue : ''}`}
                      placeholder=" "
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <label className={styles.floatingLabel}>Mật khẩu mới</label>
                    <button
                      type="button"
                      className={styles.pwdToggleBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit" className={styles.btnPrimary}>
                    Cập nhật mật khẩu <CheckCircle size={18} />
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleSubmit}>
                {authMode === 'register' && (
                  <>
                    <div className={styles.formGroup}>
                      <User size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.floatingInput} ${name ? styles.hasValue : ''}`}
                        placeholder=" "
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <label className={styles.floatingLabel}>Họ và Tên</label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.selectLabel}>Chọn câu hỏi bảo mật</label>
                      <select 
                        className={styles.selectInput}
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                      >
                        {SECURITY_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <HelpCircle size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`${styles.floatingInput} ${securityAnswer ? styles.hasValue : ''}`}
                        placeholder=" "
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                      <label className={styles.floatingLabel}>Câu trả lời bảo mật</label>
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    className={`${styles.floatingInput} ${email ? styles.hasValue : ''}`}
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label className={styles.floatingLabel}>Email đăng nhập</label>
                </div>

                <div className={styles.formGroup}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.floatingInput} ${password ? styles.hasValue : ''}`}
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label className={styles.floatingLabel}>Mật khẩu</label>
                  <button
                    type="button"
                    className={styles.pwdToggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter for Register Mode */}
                {authMode === 'register' && password && (
                  <div className={styles.passwordStrength}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--jp-text-muted)' }}>Độ bảo mật mật khẩu:</span>
                      <strong style={{ color: strength.color === styles.barWeak ? '#ef4444' : strength.color === styles.barMedium ? '#eab308' : '#22c55e' }}>{strength.label}</strong>
                    </div>
                    <div className={styles.passwordStrengthBars}>
                      <div className={`${styles.strengthBar} ${strength.score >= 1 ? strength.color : ''}`} />
                      <div className={`${styles.strengthBar} ${strength.score >= 2 ? strength.color : ''}`} />
                      <div className={`${styles.strengthBar} ${strength.score >= 3 ? strength.color : ''}`} />
                    </div>
                  </div>
                )}

                <button type="submit" className={styles.btnPrimary}>
                  {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Switch flow link */}
            <div className={styles.linksContainer}>
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
                  className={styles.forgotLink}
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
                  className={styles.switchLink}
                >
                  {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập tại đây'}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}



