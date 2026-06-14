import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero({ onViewChange }) {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContentWrapper}>
        <div className={styles.textContent}>
          <div className={styles.tagWrapper}>
            <span className={styles.tag}><Sparkles size={14} style={{ marginRight: '6px' }} /> ỨNG DỤNG CHO SINH VIÊN VIỆT NAM</span>
          </div>
          <h1 className={styles.title}>
            Bệ phóng vững chắc tới <br />
            <span className={styles.textGradient}>Công sở Nhật Bản</span>
          </h1>
          <p className={styles.subtitle}>
            Trải nghiệm học tập văn hóa doanh nghiệp Nhật Bản theo phong cách hoàn toàn mới. Nắm bắt quy tắc, luyện tập tình huống và tạo CV Rirekisho chỉ trong vài phút.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.btnPrimary} onClick={() => onViewChange('survey')}>
              Bắt đầu hành trình <ArrowRight size={18} />
            </button>
            <button className={styles.btnSecondary} onClick={() => onViewChange('dictionary')}>
              Khám phá Sổ tay
            </button>
          </div>
        </div>

        <div className={styles.illustration}>
          {/* Glassmorphism Cards */}
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
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Điểm văn hóa</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Hạng S (Xuất sắc)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
