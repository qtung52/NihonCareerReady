import React from 'react';
import { BookOpen, Award, FileText, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home({ score, roadmap, onViewChange }) {
  return (
    <div>
      {/* Hero Banner with Flat Design vector illustration */}
      <div className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">ỨNG DỤNG CHO SINH VIÊN VIỆT NAM</span>
          <h1 className="hero-title">Chuẩn bị Hành trang Công sở Nhật Bản</h1>
          <p className="hero-subtitle">
            Học tập các quy tắc ứng xử chuẩn Nhật, rèn luyện tình huống thực tế và tạo CV Rirekisho đúng chuẩn một cách nhanh chóng, tối giản.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => onViewChange('survey')}>
              Làm bài Test Đánh Giá <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => onViewChange('dictionary')}>
              Xem Sổ Tay
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <svg viewBox="0 0 200 120" className="hero-img-svg">
            {/* Background elements */}
            <circle cx="100" cy="60" r="50" fill="rgba(15, 44, 89, 0.03)" />
            <circle cx="160" cy="30" r="15" fill="rgba(188, 0, 45, 0.08)" />
            
            {/* Flat design office scene */}
            {/* Table */}
            <rect x="30" y="85" width="140" height="6" fill="var(--jp-blue)" rx="2" />
            <rect x="50" y="91" width="6" height="25" fill="var(--jp-blue)" />
            <rect x="144" y="91" width="6" height="25" fill="var(--jp-blue)" />

            {/* Laptop */}
            <rect x="85" y="70" width="30" height="15" fill="var(--jp-border)" rx="1" />
            <line x1="80" y1="85" x2="120" y2="85" stroke="var(--jp-text-muted)" strokeWidth="2" />

            {/* Character 1 (Kouhai / Student) */}
            <circle cx="60" cy="50" r="10" fill="var(--jp-text)" />
            <path d="M45 85 Q60 60 75 85" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
            <path d="M52 65 Q60 55 68 65" stroke="var(--jp-text)" strokeWidth="2" fill="none" />

            {/* Character 2 (Senpai / Colleague) */}
            <circle cx="140" cy="45" r="10" fill="var(--jp-red)" />
            <path d="M125 85 Q140 55 155 85" fill="var(--jp-red-hover)" stroke="var(--jp-red)" strokeWidth="2" />
            
            {/* Bowing guideline arc */}
            <path d="M80 40 Q100 25 120 40" fill="none" stroke="var(--jp-red)" strokeWidth="2" strokeDasharray="3 3" />
            <text x="92" y="22" fontSize="6" fill="var(--jp-red)" fontWeight="bold">Ojigi Bow</text>
          </svg>
        </div>
      </div>

      {/* Recommended Roadmap Section if survey completed */}
      {roadmap && roadmap.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius-lg)', padding: '2rem', marginBottom: '3rem', boxShadow: 'var(--jp-shadow-sm)' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-japanese)' }}>
            <CheckCircle2 style={{ color: 'var(--jp-red)' }} /> Lộ trình học tập đề xuất của bạn (Điểm kiểm tra: {score}/5)
          </h3>
          <div className="roadmap-container" style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {roadmap.map((task, idx) => (
              <div key={idx} className="roadmap-card" style={{ margin: 0 }}>
                <div className="roadmap-details">
                  <h4 style={{ fontSize: '0.95rem' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.8rem' }}>{task.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Feature Buttons Grid */}
      <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-japanese)' }}>
        Khối chức năng chính
      </h3>
      <div className="feature-grid">
        <div className="feature-card red-theme" onClick={() => onViewChange('dictionary')}>
          <div className="icon-wrapper">
            <BookOpen size={24} />
          </div>
          <h4 className="feature-title">Sổ tay văn hóa</h4>
          <p className="feature-desc">Cẩm nang tra cứu nhanh bằng flashcard lật về Ojigi, danh thiếp, chỗ ngồi và trang phục.</p>
        </div>

        <div className="feature-card blue-theme" onClick={() => onViewChange('roleplay')}>
          <div className="icon-wrapper">
            <Award size={24} />
          </div>
          <h4 className="feature-title">Thử thách tình huống</h4>
          <p className="feature-desc">Giả lập các tình huống giao tiếp, báo cáo thực tế ở công sở Nhật Bản.</p>
        </div>

        <div className="feature-card red-theme" onClick={() => onViewChange('cvbuilder')}>
          <div className="icon-wrapper">
            <FileText size={24} />
          </div>
          <h4 className="feature-title">Tạo CV (Rirekisho)</h4>
          <p className="feature-desc">Điền thông tin từng bước, tự động căn chỉnh và tải xuống mẫu CV Nhật Bản A4.</p>
        </div>

        <div className="feature-card blue-theme" onClick={() => onViewChange('community')}>
          <div className="icon-wrapper">
            <Users size={24} />
          </div>
          <h4 className="feature-title">Senpai - Kouhai</h4>
          <p className="feature-desc">Góc hỏi đáp, thảo luận về những cú sốc văn hóa và kinh nghiệm thực chiến từ Senpai.</p>
        </div>
      </div>
    </div>
  );
}
