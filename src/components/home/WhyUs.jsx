import { useEffect, useRef } from 'react';
import styles from './WhyUs.module.css';

export default function WhyUs() {
  const stepsRef = useRef(null);
  const sectionRef = useRef(null);

  const terms = [
    { jp: 'おもてなし', r: 'Omotenashi', desc: 'Tinh thần phục vụ tận tâm' },
    { jp: '改善', r: 'Kaizen', desc: 'Không ngừng cải tiến' },
    { jp: '報連相', r: 'Hou-Ren-So', desc: 'Báo cáo - Liên lạc - Bàn bạc' },
    { jp: '和', r: 'Wa', desc: 'Sự hòa hợp tập thể' },
    { jp: '根回し', r: 'Nemawashi', desc: 'Tạo sự đồng thuận ngầm' },
    { jp: '本音と建前', r: 'Honne & Tatemae', desc: 'Cảm xúc thật & Thể diện' },
  ];

  // Duplicate terms for seamless infinite loop (need exact double)
  const marqueeTerms = [...terms, ...terms];

  // IntersectionObserver for timeline steps and section
  useEffect(() => {
    const stepsEl = stepsRef.current;
    const sectionEl = sectionRef.current;
    if (!stepsEl || !sectionEl) return;

    const stepEls = stepsEl.querySelectorAll('[data-step]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate the steps container (triggers line animation)
            stepsEl.classList.add(styles['is-visible']);

            // Stagger each step icon
            stepEls.forEach((stepEl, i) => {
              setTimeout(() => {
                stepEl.classList.add(styles['is-visible']);
              }, i * 180);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(stepsEl);
    return () => observer.disconnect();
  }, []);

  // Section scroll-reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`${styles.cultureSection} reveal-on-scroll`} ref={sectionRef}>
      <h2 className={styles.sectionTitle}>Giải mã Văn hóa Doanh nghiệp</h2>

      {/* Marquee: duplicate set so translateX(-50%) seamlessly loops */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {marqueeTerms.map((term, idx) => (
            <div key={idx} className={styles.termCard}>
              <div className={styles.jpText}>{term.jp}</div>
              <div className={styles.rText}>{term.r}</div>
              <div className={styles.descText}>{term.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Journey Timeline */}
      <div className={styles.journeyContainer}>
        <h2 className={styles.journeyTitle}>Chuẩn bị sẵn sàng cho mọi cột mốc</h2>
        <div className={styles.steps} ref={stepsRef}>
          <div className={styles.step} data-step>
            <div className={styles.stepIcon}>🎓</div>
            <div className={styles.stepTitle}>Sinh viên</div>
            <div className={styles.stepDesc}>Học hỏi & Định hướng</div>
          </div>

          <div className={styles.stepLine}></div>

          <div className={styles.step} data-step>
            <div className={styles.stepIcon}>🌱</div>
            <div className={styles.stepTitle}>Thực tập sinh (Intern)</div>
            <div className={styles.stepDesc}>Trải nghiệm thực tế</div>
          </div>

          <div className={styles.stepLine}></div>

          <div className={styles.step} data-step>
            <div className={styles.stepIcon}>💼</div>
            <div className={styles.stepTitle}>Nhân viên (Shain)</div>
            <div className={styles.stepDesc}>Làm việc chuyên nghiệp</div>
          </div>
        </div>
      </div>
    </div>
  );
}
