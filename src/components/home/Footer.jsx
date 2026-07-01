import { BookOpen, Award, Users, Code2, MessageCircle, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Logo" className={styles.logoImg}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span>From Uni to Japan</span>
            </div>
            <p className={styles.tagline}>
              Ứng dụng hỗ trợ sinh viên Việt Nam chuẩn bị hành trang văn hóa và kỹ năng giao tiếp khi bước vào môi trường công sở Nhật Bản.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} title="GitHub" aria-label="GitHub">
                <Code2 size={16} />
              </a>
              <a href="#" className={styles.socialIcon} title="Liên hệ" aria-label="Liên hệ">
                <MessageCircle size={16} />
              </a>
              <a href="#" className={styles.socialIcon} title="Email" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Tính năng */}
          <div className={styles.linkGroup}>
            <span className={styles.linkTitle}>Tính năng</span>
            <a href="#" className={styles.link}>
              <BookOpen size={13} style={{ marginRight: '6px', flexShrink: 0 }} />Sổ tay & Luyện tập
            </a>
            <a href="#" className={styles.link}>
              <Award size={13} style={{ marginRight: '6px', flexShrink: 0 }} />Trắc nghiệm văn hóa
            </a>
            <a href="#" className={styles.link}>
              <Users size={13} style={{ marginRight: '6px', flexShrink: 0 }} />Góc Senpai - Kouhai
            </a>
          </div>

          {/* Thông tin */}
          <div className={styles.linkGroup}>
            <span className={styles.linkTitle}>Thông tin</span>
            <a href="#about" className={styles.link}>Về chúng tôi</a>
            <a href="#contact" className={styles.link}>Liên hệ</a>
            <a href="#privacy" className={styles.link}>Chính sách bảo mật</a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © 2026 From Uni to Japan. All rights reserved.
          </span>
          <span className={styles.madeWith}>
            Làm bằng ❤️ cho sinh viên Việt Nam
          </span>
        </div>
      </div>
    </footer>
  );
}
