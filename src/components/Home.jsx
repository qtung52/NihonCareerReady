import { useEffect } from 'react';
import Hero from './home/Hero';
import FeatureCards from './home/FeatureCards';
import WhyUs from './home/WhyUs';
import CTABanner from './home/CTABanner';
import Footer from './home/Footer';

export default function Home({ score, roadmap, onViewChange, currentUser }) {
  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!revealEls.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <Hero onViewChange={onViewChange} currentUser={currentUser} />

      {/* Recommended Roadmap Section if survey completed */}
      {roadmap && roadmap.length > 0 && (
        <div className="reveal-on-scroll" style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 2rem' }}>
          <div style={{
            background: 'var(--jp-card-bg)',
            border: '1px solid var(--jp-border)',
            borderRadius: '20px',
            padding: '2rem 2.5rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '4px',
              height: '100%', background: 'linear-gradient(180deg, var(--jp-red), var(--jp-blue))',
              borderRadius: '4px 0 0 4px'
            }} />
            <h3 style={{
              color: 'var(--jp-blue)', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '1.25rem', fontWeight: 800
            }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--jp-red), #c0392b)',
                color: 'white', borderRadius: '10px',
                padding: '4px 10px', fontSize: '0.78rem', fontWeight: 700
              }}>✅ Điểm: {score}/5</span>
              Lộ trình học tập đề xuất của bạn
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              position: 'relative'
            }}>
              {roadmap.map((task, idx) => (
                <div key={idx} style={{
                  background: 'var(--jp-bg)',
                  padding: '1.5rem',
                  borderRadius: '14px',
                  border: '1px solid var(--jp-border)',
                  position: 'relative',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'default'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    fontSize: '2.5rem', fontWeight: 900, opacity: 0.06,
                    lineHeight: 1, color: 'var(--jp-blue)', userSelect: 'none',
                    fontFamily: 'Georgia, serif'
                  }}>{idx + 1}</div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--jp-text)', fontWeight: 700 }}>
                    {task.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    {task.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <FeatureCards onViewChange={onViewChange} />
      <WhyUs />
      <CTABanner onViewChange={onViewChange} />
      <Footer />
    </div>
  );
}
