import styles from './WhyUs.module.css';

export default function WhyUs() {
  const terms = [
    { jp: 'おもてなし', r: 'Omotenashi', desc: 'Tinh thần phục vụ tận tâm' },
    { jp: '改善', r: 'Kaizen', desc: 'Không ngừng cải tiến' },
    { jp: '報連相', r: 'Hou-Ren-So', desc: 'Báo cáo - Liên lạc - Bàn bạc' },
    { jp: '和', r: 'Wa', desc: 'Sự hòa hợp tập thể' },
    { jp: '根回し', r: 'Nemawashi', desc: 'Tạo sự đồng thuận ngầm' },
    { jp: '本音と建前', r: 'Honne & Tatemae', desc: 'Cảm xúc thật & Thể diện' },
  ];

  return (
    <div className={styles.cultureSection}>
      <h2 className={styles.sectionTitle}>Giải mã Văn hóa Doanh nghiệp</h2>
      
      {/* Marquee Scrolling Text */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {/* Render 3 sets to ensure seamless infinite loop */}
          {[...terms, ...terms, ...terms].map((term, idx) => (
            <div key={idx} className={styles.termCard}>
              <div className={styles.jpText}>{term.jp}</div>
              <div className={styles.rText}>{term.r}</div>
              <div className={styles.descText}>{term.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Journey */}
      <div className={styles.journeyContainer}>
        <h2 className={styles.journeyTitle}>Chuẩn bị sẵn sàng cho mọi cột mốc</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🎓</div>
            <div className={styles.stepTitle}>Sinh viên</div>
            <div className={styles.stepDesc}>Học hỏi & Định hướng</div>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🌱</div>
            <div className={styles.stepTitle}>Thực tập sinh (Intern)</div>
            <div className={styles.stepDesc}>Trải nghiệm thực tế</div>
          </div>
          <div className={styles.stepLine}></div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>💼</div>
            <div className={styles.stepTitle}>Nhân viên (Shain)</div>
            <div className={styles.stepDesc}>Làm việc chuyên nghiệp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
