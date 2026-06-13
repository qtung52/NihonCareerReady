import Hero from './home/Hero';
import FeatureCards from './home/FeatureCards';
import WhyUs from './home/WhyUs';
import CTABanner from './home/CTABanner';
import Footer from './home/Footer';

export default function Home({ score, roadmap, onViewChange }) {
  return (
    <div className="home-page">
      <Hero onViewChange={onViewChange} />
      
      {/* Recommended Roadmap Section if survey completed */}
      {roadmap && roadmap.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 2rem' }}>
          <div style={{ background: 'var(--jp-card-bg)', border: '1px solid var(--jp-border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--jp-red)' }}>✅</span> Lộ trình học tập đề xuất của bạn (Điểm: {score}/5)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {roadmap.map((task, idx) => (
                <div key={idx} style={{ background: 'var(--jp-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--jp-border)' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--jp-text)' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', margin: 0 }}>{task.desc}</p>
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
