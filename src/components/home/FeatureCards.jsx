import { BookOpen, Award, FileText, Users, Sparkles } from 'lucide-react';
import styles from './FeatureCards.module.css';

export default function FeatureCards({ onViewChange }) {
  const features = [
    {
      id: 'dictionary',
      title: 'Sổ tay văn hóa',
      desc: 'Cẩm nang tra cứu nhanh bằng flashcard lật về Ojigi, danh thiếp, chỗ ngồi và trang phục.',
      icon: BookOpen,
      graphic: '📚'
    },
    {
      id: 'roleplay',
      title: 'Thử thách tình huống',
      desc: 'Giả lập các tình huống giao tiếp, báo cáo thực tế ở công sở Nhật Bản.',
      icon: Award,
      graphic: '🎯'
    },
    {
      id: 'cvbuilder',
      title: 'Tạo CV (Rirekisho)',
      desc: 'Điền thông tin từng bước, tự động căn chỉnh và tải xuống mẫu CV chuẩn Nhật Bản.',
      icon: FileText,
      graphic: '📝'
    },
    {
      id: 'community',
      title: 'Góc Senpai',
      desc: 'Cộng đồng chia sẻ kinh nghiệm, Q&A và kết nối cùng các anh chị đi trước.',
      icon: Users,
      graphic: '🤝'
    }
  ];

  return (
    <div className={styles.featuresSection}>
      <h2 className={styles.sectionTitle}>Chìa khóa mở cửa <span style={{ color: 'var(--jp-red)' }}>Thành công</span></h2>
      <div className={styles.grid}>
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div 
              key={feat.id} 
              className={styles.card}
              onClick={() => onViewChange(feat.id)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={28} />
              </div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <p className={styles.cardDesc}>{feat.desc}</p>
              
              {/* Decorative Graphic */}
              <div className={styles.bentoGraphic} style={{ fontSize: '8rem' }}>
                {feat.graphic}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
