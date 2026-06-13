import styles from './WhyUs.module.css';

export default function WhyUs() {
  const reasons = [
    {
      title: 'Nội dung chuẩn Nhật',
      desc: 'Mọi kiến thức về Ojigi, Business Manner hay Rirekisho đều được biên soạn và kiểm chứng bởi các chuyên gia nhân sự Nhật Bản.',
      icon: '✅'
    },
    {
      title: 'Học nhanh, thực tế',
      desc: 'Thay vì lý thuyết dài dòng, ứng dụng cung cấp flashcard trực quan và các tình huống giả lập để bạn có thể áp dụng ngay ngày mai.',
      icon: '⚡'
    },
    {
      title: 'Thiết kế cho SV Việt Nam',
      desc: 'Giải quyết triệt để những bỡ ngỡ, sốc văn hóa đặc thù của người Việt khi lần đầu bước vào môi trường doanh nghiệp Nhật Bản.',
      icon: '🎓'
    }
  ];

  return (
    <div className={styles.whyUsSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Tại sao chọn Nihon Career Ready?</h2>
        <div className={styles.grid}>
          {reasons.map((item, index) => (
            <div key={index} className={styles.featureBox}>
              <div className={styles.icon}>{item.icon}</div>
              <h3 className={styles.boxTitle}>{item.title}</h3>
              <p className={styles.boxDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
