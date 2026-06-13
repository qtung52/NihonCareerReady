import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.dot}></div>
              <span>Nihon Career Ready</span>
            </div>
            <p className={styles.tagline}>
              Ứng dụng hỗ trợ sinh viên Việt Nam chuẩn bị hành trang văn hóa và kỹ năng giao tiếp khi bước vào môi trường công sở Nhật Bản.
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <span className={styles.linkTitle}>Thông tin</span>
              <a href="#about" className={styles.link}>Về chúng tôi</a>
              <a href="#contact" className={styles.link}>Liên hệ</a>
              <a href="#privacy" className={styles.link}>Chính sách bảo mật</a>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <span className={styles.copyright}>&copy; 2026 Nihon Career Ready. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
