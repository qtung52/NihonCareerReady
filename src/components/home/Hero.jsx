import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero({ onViewChange }) {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContentWrapper}>
        {/* Text Content */}
        <div className={styles.textContent}>
          <span className={styles.tag}>ỨNG DỤNG CHO SINH VIÊN VIỆT NAM</span>
          <h1 className={styles.title}>Chuẩn bị Hành trang Công sở Nhật Bản</h1>
          <p className={styles.subtitle}>
            Học tập các quy tắc ứng xử chuẩn Nhật, rèn luyện tình huống thực tế và tạo CV Rirekisho đúng chuẩn một cách nhanh chóng, tối giản.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.btnPrimary} onClick={() => onViewChange('survey')}>
              Làm bài Test Đánh Giá <ArrowRight size={18} />
            </button>
            <button className={styles.btnSecondary} onClick={() => onViewChange('dictionary')}>
              Xem Sổ Tay
            </button>
          </div>
        </div>

        {/* Illustration Mockup */}
        <div className={styles.illustration}>
          <div className={styles.mockupCard}>
            <div className={styles.mockupBadge}>
              N3+
            </div>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupAvatar}>👨‍💼</div>
              <div style={{ flex: 1 }}>
                <div className={`${styles.mockupLine} ${styles.short}`}></div>
                <div className={styles.mockupLine} style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className={styles.mockupLine}></div>
            <div className={styles.mockupLine}></div>
            <div className={`${styles.mockupLine} ${styles.short}`}></div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
              <div style={{ height: '30px', flex: 1, background: 'var(--jp-soft-surface)', borderRadius: '4px' }}></div>
              <div style={{ height: '30px', flex: 1, background: 'var(--jp-soft-surface)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
