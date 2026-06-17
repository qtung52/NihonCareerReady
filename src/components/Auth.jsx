import { useState } from 'react';
import { Lock, Mail, User, ArrowRight, HelpCircle, CheckCircle, Eye, EyeOff, Sun, Moon, Sparkles } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';
import CustomDropdown from './CustomDropdown';
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
    const searchEmail = email.trim().toLowerCase();
    if (searchEmail !== 'admin@nihon.com' && !gmailRegex.test(searchEmail)) {
      setErrorMsg('Email tìm kiếm phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
      return;
    }

    const users = await getSharedArray('users', []);
    const found = users.find(u => (u.email || '').trim().toLowerCase() === searchEmail);

    if (found) {
      if (!found.securityQuestion) {
        setErrorMsg('Tài khoản này chưa thiết lập câu hỏi bảo mật. Vui lòng liên hệ quản trị viên.');
        return;
      }
      setFoundUserEmail(found.email);
      setUserQuestion(found.securityQuestion);
      setUserFound(true);
    } else if (searchEmail === 'admin@nihon.com') {
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
    const searchEmail = (foundUserEmail || '').trim().toLowerCase();
    const found = users.find(u => (u.email || '').trim().toLowerCase() === searchEmail);

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
    const searchEmail = (foundUserEmail || '').trim().toLowerCase();
    const userIdx = users.findIndex(u => (u.email || '').trim().toLowerCase() === searchEmail);

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
    const searchEmail = email.trim().toLowerCase();

    if (authMode === 'login') {
      if (searchEmail === 'admin@nihon.com' && password === 'admin123') {
        const adminUser = {
          name: 'Admin Senpai',
          email: 'admin@nihon.com',
          isAdmin: true,
          avatar: '🦊',
          bio: 'Quản trị viên hệ thống Nihon Career Ready. Rất vui được hỗ trợ và định hướng văn hóa cho các bạn Kouhai.',
          careerGoal: 'Lãnh đạo Giáo dục / Nhân sự Nhật Bản'
        };
        localStorage.setItem('session_user', JSON.stringify(adminUser));
        onLogin(adminUser);
        return;
      }

      if (!gmailRegex.test(searchEmail)) {
        setErrorMsg('Email đăng nhập phải đúng định dạng @gmail.com (Ví dụ: abc@gmail.com)');
        return;
      }

      const users = await getSharedArray('users', []);
      const user = users.find(u => (u.email || '').trim().toLowerCase() === searchEmail && u.password === password);

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
      const trimmedName = name.trim();
      if (!trimmedName || !email || !password || !securityAnswer) {
        setErrorMsg('Vui lòng điền đầy đủ tất cả thông tin.');
        return;
      }

      if (!gmailRegex.test(searchEmail)) {
        setErrorMsg('Email đăng ký phải đúng định dạng @gmail.com (Ví dụ: user@gmail.com)');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Mật khẩu đăng ký phải từ 6 ký tự trở lên.');
        return;
      }

      const users = await getSharedArray('users', []);
      if (users.some(u => (u.email || '').trim().toLowerCase() === searchEmail)) {
        setErrorMsg('Email này đã được đăng ký!');
        return;
      }

      const checkName = trimmedName;
      const isNameTaken = users.some(u => {
        const existingName = (u.name || '').trim();
        return existingName === checkName;
      }) || checkName.toLowerCase() === 'admin senpai';

      if (isNameTaken) {
        setErrorMsg('Tên hiển thị này đã tồn tại! Vui lòng chọn tên khác.');
        return;
      }

      const newUser = {
        name: trimmedName,
        email: searchEmail,
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
          {/* Background Sakura/Particles */}
          <div className={styles.particlesContainer}>
            {[...Array(12)].map((_, i) => {
              // Stable pseudo-random values to prevent rendering jitter when state updates
              const leftPos = (i * 8.3) + ((i * 7) % 6);
              const baseDuration = ((i * 3) % 5) + 6; // base duration: 6 to 10
              const animDelay = ((i * 7) % 5) * 0.8; // delay: 0s to 3.2s
              
              return (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={styles.particle}
                  style={{
                    left: `${leftPos}%`,
                    '--base-duration': baseDuration,
                    animationDelay: `${animDelay}s`
                  }}
                >
                  <path d="M12,3 C12.5,3.5 13.5,4 14.5,3 C16.5,1 19.5,3.5 18.5,7 C17.5,11.5 13.5,18 12,20 C10.5,18 6.5,11.5 5.5,7 C4.5,3.5 7.5,1 9.5,3 C10.5,4 11.5,3.5 12,3 Z" />
                </svg>
              );
            })}
          </div>

          <div className={styles.authPromoLogo}>
            <img src="/logo.png" alt="Logo" className={styles.brandIcon} />
            <span>Nihon Career Ready</span>
          </div>

          <div className={styles.authPromoMain}>
            <div className={styles.tagWrapper}>
              <span className={styles.authPromoTag}>
                <Sparkles size={14} style={{ marginRight: '6px' }} /> ỨNG DỤNG CHO SINH VIÊN VIỆT NAM
              </span>
            </div>
            <h1 className={styles.authPromoQuote}>
              Chào mừng trở lại <br />
              <span className={styles.textGradient}>Nihon Career Ready</span>
            </h1>
            <p className={styles.authPromoDesc}>
              Trải nghiệm học tập văn hóa doanh nghiệp Nhật Bản theo phong cách hoàn toàn mới. Nắm bắt quy tắc, luyện tập tình huống và tạo CV Rirekisho chỉ trong vài phút.
            </p>

            {/* Redesigned Mock UI Preview: 2 floating cards similar to homepage */}
            <div className={styles.featureShowcase}>
              <div className={styles.glassCardPrimary}>
                <div className={styles.mockupHeader}>
                  <div className={styles.mockupAvatar}>👩‍💻</div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.mockupTitle}>Nihon Career Ready</div>
                    <div className={styles.mockupSubtitle}>Hoàn thành lộ trình</div>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '85%' }}></div>
                </div>

                <div className={styles.glassCardSecondary}>
                  <span style={{ fontSize: '1.8rem' }}>💮</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, color: 'var(--jp-text-muted)' }}>Điểm văn hóa</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--jp-text)' }}>Hạng S (Xuất sắc)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
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
              <div className={styles.formBranding}>
                <img src="/logo.png" alt="Logo" className={styles.formBrandIcon} />
                <span className={styles.formBrandingText}>Nihon Career Ready</span>
              </div>
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
                      <CustomDropdown
                        options={SECURITY_QUESTIONS}
                        value={securityQuestion}
                        onChange={setSecurityQuestion}
                      />
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



