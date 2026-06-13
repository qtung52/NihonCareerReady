import { BookOpen, Award, FileText, Users } from 'lucide-react';
import styles from './FeatureCards.module.css';

export default function FeatureCards({ onViewChange }) {
  const features = [
    {
      id: 'dictionary',
      title: 'Sổ tay văn hóa',
      desc: 'Cẩm nang tra cứu nhanh bằng flashcard lật về Ojigi, danh thiếp, chỗ ngồi và trang phục.',
      icon: BookOpen,
      isRed: true
    },
    {
      id: 'roleplay',
      title: 'Thử thách tình huống',
      desc: 'Giả lập các tình huống giao tiếp, báo cáo thực tế ở công sở Nhật Bản.',
      icon: Award,
      isRed: false
    },
    {
      id: 'cvbuilder',
      title: 'Tạo CV (Rirekisho)',
      desc: 'Điền thông tin từng bước, tự động căn chỉnh và tải xuống mẫu CV chuẩn Nhật Bản.',
      icon: FileText,
      isRed: true
    },
    {
      id: 'community',
      title: 'Senpai - Kouhai',
      desc: 'Cộng đồng Q&A, chia sẻ kinh nghiệm và giải đáp thắc mắc cùng các Senpai.',
      icon: Users,
      isRed: false
    }
  ];

  return (
    <div className={styles.featuresSection}>
      <h2 className={styles.sectionTitle}>Khối chức năng chính</h2>
      <div className={styles.grid}>
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div 
              key={feat.id} 
              className={`${styles.card} ${feat.isRed ? styles.redAccent : ''}`}
              onClick={() => onViewChange(feat.id)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} />
              </div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <p className={styles.cardDesc}>{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
