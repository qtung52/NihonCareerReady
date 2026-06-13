import { ArrowRight } from 'lucide-react';
import styles from './CTABanner.module.css';

export default function CTABanner({ onViewChange }) {
  return (
    <div className={styles.ctaSection}>
      <div className={styles.banner}>
        <h2 className={styles.title}>Bắt đầu hành trình của bạn ngay hôm nay</h2>
        <button className={styles.btnLarge} onClick={() => onViewChange('survey')}>
          Làm bài Test Miễn Phí <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
