import React, { useState } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

// SVG icons rendered by category — không lưu vào localStorage
function CategoryIcon({ category, id }) {
  if (category === 'ojigi') {
    const deg = id?.includes('15') ? 15 : id?.includes('45') ? 45 : 30;
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <circle cx="50" cy="22" r="10" fill="var(--jp-blue)" />
        <line x1="50" y1="32" x2="50" y2="62" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="62" x2="40" y2="85" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="62" x2="60" y2="85" stroke="var(--jp-blue)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="42" x2="30" y2={42 + deg} stroke="var(--jp-red)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="42" x2="70" y2={42 + deg * 0.3} stroke="var(--jp-red)" strokeWidth="4" strokeLinecap="round" />
        <text x="68" y="28" fontSize="9" fill="var(--jp-red)" fontWeight="bold">{deg}°</text>
      </svg>
    );
  }
  if (category === 'meishi') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="15" y="32" width="70" height="44" rx="3" fill="none" stroke="var(--jp-blue)" strokeWidth="3" />
        <line x1="22" y1="45" x2="55" y2="45" stroke="var(--jp-red)" strokeWidth="2" />
        <line x1="22" y1="55" x2="45" y2="55" stroke="var(--jp-border)" strokeWidth="2" />
        <circle cx="72" cy="50" r="8" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
        <path d="M68 50 L71 53 L76 47" stroke="var(--jp-blue)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 82 Q50 72 78 82" fill="none" stroke="var(--jp-text-muted)" strokeWidth="2" />
      </svg>
    );
  }
  if (category === 'seating') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <rect x="10" y="15" width="80" height="70" rx="4" fill="none" stroke="var(--jp-border)" strokeWidth="2" />
        <rect x="20" y="25" width="60" height="50" rx="3" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
        <text x="50" y="47" fontSize="7" fill="var(--jp-red)" textAnchor="middle" fontWeight="bold">KAMIZA</text>
        <text x="50" y="58" fontSize="6" fill="var(--jp-text-muted)" textAnchor="middle">(Ghế danh dự)</text>
      </svg>
    );
  }
  if (category === 'dresscode') {
    return (
      <svg viewBox="0 0 100 100" width="60" height="60">
        <path d="M32 20 L68 20 L72 35 L60 40 L60 85 L40 85 L40 40 L28 35 Z" fill="var(--jp-blue)" />
        <path d="M43 20 L50 40 L57 20 Z" fill="#fff" />
        <rect x="47" y="42" width="6" height="30" fill="var(--jp-red)" rx="2" />
      </svg>
    );
  }
  // Default (admin-added cards)
  return (
    <svg viewBox="0 0 100 100" width="60" height="60">
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--jp-red)" strokeWidth="3" />
      <path d="M30 50 L45 65 L70 35" fill="none" stroke="var(--jp-blue)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Static default data — SVG-free, JSON-safe
export const MANNERS_DATA = [
  {
    id: 'ojigi-15',
    category: 'ojigi',
    titleJp: '会釈 (Meshaku)',
    titleVi: 'Cúi chào xã giao - 15 độ',
    frontDesc: 'Cúi chào nhẹ nhàng khi gặp nhau ở hành lang, thang máy hoặc chào hỏi đồng nghiệp cùng cấp.',
    dos: [
      'Gập người góc khoảng 15 độ.',
      'Hai tay đặt tự nhiên bên sườn (nam) hoặc chụm trước đùi (nữ).',
      'Đứng lại chào rồi đi tiếp, tránh vừa đi vừa cúi đầu.'
    ],
    donts: [
      'Không cúi đầu quá nhanh hoặc quá hời hợt.',
      'Không vừa đi vừa cúi đầu.',
      'Không nhìn chằm chằm vào mặt đối phương khi đang cúi.'
    ]
  },
  {
    id: 'ojigi-30',
    category: 'ojigi',
    titleJp: '敬礼 (Keirei)',
    titleVi: 'Cúi chào kính trọng - 30 độ',
    frontDesc: 'Chào hỏi cấp trên, khách hàng, đối tác hoặc khi bắt đầu cuộc họp trang trọng.',
    dos: [
      'Cúi gập lưng góc khoảng 30 độ.',
      'Lưng thẳng, cổ thẳng theo trục sống lưng.',
      'Dành khoảng 1 giây ở vị trí cúi thấp rồi từ từ đứng lên.'
    ],
    donts: [
      'Không cong lưng hoặc ngẩng cổ nhìn lên.',
      'Không chắp hai tay trước ngực kiểu Phật giáo.',
      'Không chào quá vội vàng.'
    ]
  },
  {
    id: 'ojigi-45',
    category: 'ojigi',
    titleJp: '最敬礼 (Saikeirei)',
    titleVi: 'Cúi chào trang trọng nhất - 45 độ',
    frontDesc: 'Dùng khi muốn bày tỏ lòng biết ơn sâu sắc, xin lỗi chân thành hoặc chào đón bậc bề trên.',
    dos: [
      'Cúi gập sâu góc từ 45 đến 90 độ.',
      'Giữ tư thế cúi sâu trong khoảng 2–3 giây để thể hiện sự chân thành.',
      'Tập trung toàn bộ ý chí hướng về đối phương.'
    ],
    donts: [
      'Không ngẩng mặt lên quá nhanh.',
      'Không nói lời xin lỗi/cảm ơn khi đang ở tư thế cúi thấp (nói trước rồi cúi sau).'
    ]
  },
  {
    id: 'meishi-1',
    category: 'meishi',
    titleJp: '名刺交換 (Meishi Koukan)',
    titleVi: 'Cách trao danh thiếp',
    frontDesc: 'Nghi thức bắt buộc khi gặp đối tác kinh doanh lần đầu. Thể hiện sự tôn trọng tuyệt đối.',
    dos: [
      'Dùng cả hai tay nâng danh thiếp hướng về phía đối phương.',
      'Mặt chữ ngửa lên và đầu chữ hướng về đối phương.',
      'Chủ động đưa thấp hơn vị trí danh thiếp của đối tác để tỏ ý khiêm nhường.'
    ],
    donts: [
      'Không dùng một tay đưa danh thiếp.',
      'Không che khuất logo hoặc thông tin trên danh thiếp bằng ngón tay.',
      'Không viết đè lên danh thiếp đã nhận.'
    ]
  },
  {
    id: 'meishi-2',
    category: 'meishi',
    titleJp: '名刺の置き方 (Meishi Okikata)',
    titleVi: 'Cách đặt danh thiếp trên bàn họp',
    frontDesc: 'Sau khi nhận danh thiếp, không được cất ngay vào ví mà phải đặt trên bàn họp đúng quy tắc.',
    dos: [
      'Đặt danh thiếp lên trên chiếc hộp đựng danh thiếp (Meishiire) của bạn.',
      'Xếp danh thiếp theo vị trí ngồi của đối tác để dễ nhớ tên.',
      'Đặt ở phía bên trái vị trí ngồi của bạn.'
    ],
    donts: [
      'Tuyệt đối không đè tài liệu hay tách trà lên trên danh thiếp đối tác.',
      'Không nghịch danh thiếp hoặc uốn cong danh thiếp trong cuộc họp.'
    ]
  },
  {
    id: 'seating-1',
    category: 'seating',
    titleJp: '上座と下座 (Kamiza & Shimoza)',
    titleVi: 'Vị trí ghế ngồi danh dự',
    frontDesc: 'Quy tắc phân chia chỗ ngồi trong phòng họp, ô tô, thang máy thể hiện thứ bậc lễ nghi.',
    dos: [
      'Kamiza (Ghế tôn kính) là ghế ở xa cửa ra vào nhất.',
      'Shimoza (Ghế thấp kém) là ghế nằm sát cửa, chịu trách nhiệm đón tiếp, gọi món hoặc bấm thang máy.',
      'Mời khách hàng hoặc sếp lớn vào ngồi ở vị trí Kamiza trước.'
    ],
    donts: [
      'Người trẻ/người mới không được tự ý ngồi vào vị trí trong cùng khi chưa được mời.',
      'Đừng đứng chắn trước mặt người ngồi ở Kamiza.'
    ]
  },
  {
    id: 'dresscode-1',
    category: 'dresscode',
    titleJp: '身だしなみ (Midashinami)',
    titleVi: 'Trang phục công sở chuẩn mực',
    frontDesc: 'Trang phục chỉnh tề (Midashinami) thể hiện tinh thần ngăn nắp, lịch sự và tôn trọng tổ chức.',
    dos: [
      'Mặc bộ vest công sở tối màu (Recruit Suit: đen, navy, xám đậm).',
      'Ủi phẳng áo sơ mi trắng, cài kín nút cổ.',
      'Tóc gọn gàng, móng tay cắt ngắn sạch sẽ, nước hoa nhẹ hoặc không dùng.'
    ],
    donts: [
      'Không đi giày bẩn, giày da sờn rách.',
      'Không đeo đồ trang sức quá lòe loẹt, nổi bật.',
      'Tránh nhuộm tóc màu quá sáng khi phỏng vấn hoặc mới vào công ty.'
    ]
  },
  {
    id: 'meishi-3',
    category: 'meishi',
    titleJp: '電話応対 (Denwa Outai)',
    titleVi: 'Nhận điện thoại công sở',
    frontDesc: 'Quy tắc trả lời điện thoại chuyên nghiệp khi đối tác/khách hàng gọi tới văn phòng.',
    dos: [
      'Nhấc máy nhanh trước tiếng chuông thứ 3.',
      'Nói lời chào tiêu chuẩn và xác nhận tên công ty/bộ phận rõ ràng.',
      'Ghi chép thông tin người gọi và cúp máy sau khi đối phương cúp.'
    ],
    donts: [
      'Không để chuông reo quá 3 lần mà không xin lỗi vì sự chậm trễ.',
      'Không cúp máy trước đối tác.',
      'Không ăn uống hoặc nhai kẹo khi nghe điện thoại.'
    ]
  },
  {
    id: 'seating-2',
    category: 'seating',
    titleJp: '乗り物の席 (Norimono no Seki)',
    titleVi: 'Thứ tự chỗ ngồi trong ô tô / thang máy',
    frontDesc: 'Khi đi cùng sếp hay khách hàng bằng taxi/ô tô công ty, thứ tự ngồi rất quan trọng.',
    dos: [
      'Trong taxi: Ghế sau bên trái (nhìn từ trong ra) là ghế danh dự nhất, dành cho khách/sếp.',
      'Trong thang máy: Người mới phải đứng gần bảng điều khiển để bấm tầng và giữ cửa cho mọi người.',
      'Mời khách lên xe hoặc vào thang máy trước, bạn lên sau cùng.'
    ],
    donts: [
      'Không tự ý chọn ngồi ghế sau bên trái khi đi cùng cấp trên.',
      'Không bỏ tay khỏi nút giữ cửa thang máy khi mọi người chưa vào hết.'
    ]
  },
  {
    id: 'dresscode-2',
    category: 'dresscode',
    titleJp: 'ビジネスカジュアル (Business Casual)',
    titleVi: 'Trang phục Business Casual',
    frontDesc: 'Nhiều công ty Nhật hiện đại cho phép mặc Business Casual nhưng vẫn cần giữ chuẩn mực nhất định.',
    dos: [
      'Áo sơ mi có cổ, quần âu hoặc chân váy công sở dưới đầu gối.',
      'Giày da hoặc giày lịch sự, gọn gàng, sạch sẽ.',
      'Màu sắc trung tính: be, trắng, xanh nhạt, xám.'
    ],
    donts: [
      'Không mặc Jeans, áo thun in hình, giày thể thao khi không được phép.',
      'Không để lộ vai hoặc mặc váy quá ngắn trong giờ làm việc.',
      'Không mặc quần áo nhàu nát, bẩn dù là Business Casual.'
    ]
  }
];

export default function Dictionary({ dictionary = MANNERS_DATA }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [flippedCards, setFlippedCards] = useState({});

  const handleCardClick = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'ojigi', label: 'Cúi chào (Ojigi)' },
    { id: 'meishi', label: 'Danh thiếp & Giao tiếp' },
    { id: 'seating', label: 'Ghế ngồi (Kamiza)' },
    { id: 'dresscode', label: 'Trang phục' }
  ];

  const filteredData = activeCategory === 'all'
    ? dictionary
    : dictionary.filter(item => item.category === activeCategory);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.8rem', color: 'var(--jp-blue)', position: 'relative', paddingBottom: '0.5rem' }}>
          Từ điển Quy tắc Công sở - Business Manner
        </h2>
        <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>
          Học văn hóa chuẩn Nhật qua thẻ ghi nhớ thông minh. Nhấp vào thẻ để lật xem chi tiết Nên (Do) và Tránh (Don't).
        </p>
      </div>

      <div className="filter-tabs" style={{ gap: '0.5rem', marginBottom: '2.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: activeCategory === cat.id ? 'none' : '1px solid var(--jp-border)',
              background: activeCategory === cat.id ? 'var(--jp-red)' : '#fff',
              color: activeCategory === cat.id ? '#fff' : 'var(--jp-blue)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tối ưu hóa UI lưới Flashcard gọn gàng hơn */}
      <div className="flashcard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="flashcard-container"
            onClick={() => handleCardClick(item.id)}
            style={{
              height: '420px',
              perspective: '1000px',
              cursor: 'pointer'
            }}
          >
            <div className={`flashcard ${flippedCards[item.id] ? 'flipped' : ''}`} style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d'
            }}>
              {/* Front Face - Sạch sẽ hơn */}
              <div className="card-face card-front" style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: '#ffffff',
                border: '1px solid var(--jp-border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-badge" style={{
                    fontSize: '0.65rem',
                    background: 'var(--jp-blue-light)',
                    color: 'var(--jp-blue)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {item.category.toUpperCase()}
                  </span>
                  <HelpCircle size={14} style={{ color: 'var(--jp-text-muted)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
                  <CategoryIcon category={item.category} id={item.id} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h4 className="card-title-jp" style={{
                    fontSize: '1.1rem',
                    color: 'var(--jp-red)',
                    marginBottom: '0.25rem',
                    fontWeight: 700
                  }}>{item.titleJp}</h4>
                  <h5 className="card-title-vi" style={{
                    fontSize: '0.9rem',
                    color: 'var(--jp-blue)',
                    fontWeight: 600,
                    margin: 0
                  }}>{item.titleVi}</h5>
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--jp-text-muted)',
                  textAlign: 'center',
                  margin: '0.5rem 0 0 0',
                  lineHeight: '1.4'
                }}>
                  {item.frontDesc}
                </p>

                <div style={{
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: 'var(--jp-red)',
                  fontWeight: 600,
                  borderTop: '1px solid var(--jp-border)',
                  paddingTop: '0.5rem'
                }}>
                  Click để xem chi tiết
                </div>
              </div>

              {/* Back Face - Dễ nhìn, màu sắc Do/Don't dịu mát */}
              <div className="card-face card-back" style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: '#ffffff',
                border: '1px solid var(--jp-border)',
                borderRadius: '12px',
                padding: '1rem',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <h4 style={{ 
                    color: 'var(--jp-blue)', 
                    fontSize: '0.95rem', 
                    fontWeight: 700, 
                    marginBottom: '0.75rem', 
                    borderBottom: '1px solid var(--jp-border)', 
                    paddingBottom: '0.4rem',
                    textAlign: 'center'
                  }}>
                    {item.titleVi}
                  </h4>

                  <div className="card-do-dont">
                    {/* DO - Nền dịu nhẹ */}
                    <div className="dos" style={{
                      background: 'rgba(46, 204, 113, 0.06)',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      marginBottom: '0.6rem',
                      borderLeft: '3px solid #2ecc71'
                    }}>
                      <h5 style={{
                        fontSize: '0.75rem',
                        color: '#27ae60',
                        fontWeight: 700,
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Check size={12} strokeWidth={3} /> NÊN LÀM
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.7rem', color: '#2c3e50', lineHeight: '1.4' }}>
                        {(item.dos || []).map((doItem, index) => (
                          <li key={index} style={{ marginBottom: '2px' }}>{doItem}</li>
                        ))}
                      </ul>
                    </div>

                    {/* DONT - Nền dịu nhẹ */}
                    <div className="donts" style={{
                      background: 'rgba(188, 0, 45, 0.05)',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--jp-red)'
                    }}>
                      <h5 style={{
                        fontSize: '0.75rem',
                        color: 'var(--jp-red)',
                        fontWeight: 700,
                        margin: '0 0 0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <X size={12} strokeWidth={3} /> TRÁNH LÀM
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.7rem', color: '#2c3e50', lineHeight: '1.4' }}>
                        {(item.donts || []).map((dontItem, index) => (
                          <li key={index} style={{ marginBottom: '2px' }}>{dontItem}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: 'var(--jp-text-muted)',
                  borderTop: '1px solid var(--jp-border)',
                  paddingTop: '0.5rem'
                }}>
                  Click để quay lại
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
