import { BookOpen, Award, Users } from 'lucide-react';
import styles from './FeatureCards.module.css';

export default function FeatureCards({ onViewChange }) {
  const features = [
    {
      id: 'dictionary',
      title: 'Sổ tay & Luyện tập',
      desc: 'Cẩm nang tra cứu văn hóa tích hợp các tình huống thực hành trắc nghiệm tương tác.',
      icon: BookOpen,
      graphic: '📚'
    },
    {
      id: 'survey',
      title: 'Trắc nghiệm văn hóa',
      desc: 'Đánh giá mức độ hiểu biết văn hóa doanh nghiệp Nhật và nhận lộ trình học tập đề xuất.',
      icon: Award,
      graphic: '🎯'
    },
    {
      id: 'community',
      title: 'Góc Senpai - Kouhai',
      desc: 'Cộng đồng chia sẻ kinh nghiệm, Q&A và kết nối cùng các anh chị đi trước.',
      icon: Users,
      graphic: '🤝'
    }
  ];

  return (
    <div className={`${styles.featuresSection} reveal-on-scroll`}>
      <h2 className={styles.sectionTitle}>
        Chìa khóa mở cửa <span style={{ color: 'var(--jp-red)' }}>Thành công</span>
      </h2>
      <div className={styles.grid}>
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className={styles.card}
              onClick={() => onViewChange(feat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onViewChange(feat.id)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={26} />
              </div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <p className={styles.cardDesc}>{feat.desc}</p>

              {/* Decorative Graphic */}
              <div className={styles.bentoGraphic} style={{ fontSize: '8rem', lineHeight: 1 }}>
                {feat.graphic}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
