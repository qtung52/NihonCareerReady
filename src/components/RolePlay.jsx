import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';

// SVG illustrations rendered by scenario id — không lưu vào localStorage
function ScenarioIllustration({ id }) {
  if (id === 1) return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <rect x="10" y="70" width="80" height="20" rx="3" fill="var(--jp-blue)" />
      <rect x="25" y="30" width="18" height="40" fill="var(--jp-border)" />
      <circle cx="34" cy="21" r="8" fill="var(--jp-text)" />
      <rect x="55" y="24" width="18" height="46" fill="var(--jp-border)" />
      <circle cx="64" cy="15" r="8" fill="var(--jp-red)" />
      <path d="M 52 38 L 42 38" stroke="var(--jp-red)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 48 35 L 42 38 L 48 41" stroke="var(--jp-red)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <text x="53" y="52" fontSize="6" fill="var(--jp-red)" fontWeight="bold">Task Mới!</text>
    </svg>
  );
  if (id === 2) return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <rect x="10" y="45" width="80" height="30" fill="var(--jp-blue-light)" rx="5" />
      <rect x="15" y="50" width="20" height="15" fill="#fff" rx="2" />
      <rect x="40" y="50" width="20" height="15" fill="#fff" rx="2" />
      <rect x="65" y="50" width="20" height="15" fill="#fff" rx="2" />
      <circle cx="50" cy="58" r="4" fill="var(--jp-red)" />
      <line x1="20" y1="80" x2="80" y2="80" stroke="var(--jp-text)" strokeWidth="3" />
      <text x="28" y="35" fontSize="7.5" fill="var(--jp-red)" fontWeight="bold">Trễ Giờ (Chikoku)</text>
    </svg>
  );
  if (id === 3) return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <rect x="30" y="25" width="40" height="60" fill="var(--jp-blue)" rx="3" />
      <rect x="38" y="33" width="24" height="17" fill="#fff" rx="2" />
      <circle cx="44" cy="67" r="4" fill="var(--jp-red)" />
      <circle cx="56" cy="67" r="4" fill="#2ecc71" />
      <text x="40" y="44" fontSize="7" fill="var(--jp-red)" fontWeight="bold">1000¥</text>
    </svg>
  );
  if (id === 4) return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <rect x="20" y="30" width="60" height="50" rx="3" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
      <line x1="30" y1="45" x2="70" y2="45" stroke="var(--jp-border)" strokeWidth="2" />
      <line x1="30" y1="55" x2="70" y2="55" stroke="var(--jp-border)" strokeWidth="2" />
      <circle cx="50" cy="20" r="7" fill="var(--jp-text)" />
      <path d="M42 90 L50 70 L58 90" fill="var(--jp-border)" />
      <text x="34" y="64" fontSize="6" fill="var(--jp-red)" fontWeight="bold">Báo Cáo</text>
    </svg>
  );
  if (id === 5) return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <circle cx="50" cy="35" r="15" fill="var(--jp-blue-light)" stroke="var(--jp-blue)" strokeWidth="2" />
      <path d="M35 80 Q50 60 65 80" fill="none" stroke="var(--jp-text)" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="75" stroke="var(--jp-text)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 60 L50 50 L68 60" fill="none" stroke="var(--jp-text)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="35" r="5" fill="var(--jp-red)" />
      <text x="32" y="95" fontSize="6.5" fill="var(--jp-blue)" fontWeight="bold">Chào Hỏi Cúi</text>
    </svg>
  );
  // Default for admin-added
  return (
    <svg viewBox="0 0 100 100" width="100%" height="140">
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--jp-red)" strokeWidth="3" />
      <text x="50" y="55" fontSize="28" textAnchor="middle" fill="var(--jp-blue)" fontWeight="bold">?</text>
    </svg>
  );
}

// Static default data — SVG-free, JSON-safe
export const SCENARIOS = [
  {
    id: 1,
    title: "Tình huống 1: Sếp giao task gấp khi đang có task quan trọng khác",
    description: "Bạn đang tập trung hoàn thành báo cáo số liệu kinh doanh sắp đến hạn nộp vào lúc 4h chiều nay. Đột nhiên, Trưởng phòng đi tới bàn làm việc và giao cho bạn một việc khẩn cấp khác: kiểm tra lại slide thuyết trình cho khách hàng vào sáng mai.",
    options: [
      {
        letter: "A",
        text: "Nhận việc ngay lập tức mà không nói gì, tự nhủ sẽ cố gắng làm tăng ca cả hai việc để kịp tiến độ.",
        isCorrect: false,
        explanation: "Trong văn hóa Nhật, việc đồng ý mà không lượng sức mình dễ dẫn đến đổ vỡ tiến độ của cả hai việc. Đây là hành động thiếu trách nhiệm đối với tiến độ chung của nhóm."
      },
      {
        letter: "B",
        text: "Báo cáo cụ thể: 'Tôi đang làm báo cáo kinh doanh nộp lúc 4h chiều nay. Tôi có thể làm việc mới này ngay sau 4h, hoặc sếp có muốn tôi đổi thứ tự ưu tiên làm việc này trước không?'",
        isCorrect: true,
        explanation: "Quy tắc ứng xử đúng chuẩn! Đây là cách giao tiếp rõ ràng theo tinh thần Hou-Ren-So. Sếp sẽ nắm bắt được tình trạng công việc của bạn và đưa ra quyết định sắp xếp ưu tiên chính xác nhất."
      },
      {
        letter: "C",
        text: "Từ chối thẳng thắn: 'Em đang bận làm báo cáo gấp rồi sếp ơi, sếp nhờ anh/chị khác làm giúp em nhé!'",
        isCorrect: false,
        explanation: "Từ chối trực diện mà không đưa ra giải pháp thay thế hoặc giải thích khéo léo sẽ gây cảm giác thiếu hợp tác và thô lỗ trong giao tiếp công sở Nhật."
      }
    ]
  },
  {
    id: 2,
    title: "Tình huống 2: Đi làm muộn do tàu điện bị trễ chuyến",
    description: "Sáng nay trên đường đi làm, tuyến tàu điện ngầm bạn đi gặp sự cố kỹ thuật và bị trễ 15 phút. Theo tính toán, bạn chắc chắn sẽ đến văn phòng muộn khoảng 10 phút so với giờ làm việc chính thức.",
    options: [
      {
        letter: "A",
        text: "Gửi tin nhắn nhanh vào nhóm Chat chung (Zalo/Slack): 'Em bị trễ tàu nên tới muộn tí nhé mọi người.'",
        isCorrect: false,
        explanation: "Nhắn tin qua ứng dụng chat cá nhân/nhóm một cách cẩu thả khi đi muộn thường bị coi là thiếu tôn trọng. Giao tiếp khi đi muộn cần chính xác và nghiêm túc."
      },
      {
        letter: "B",
        text: "Gọi điện thoại trực tiếp cho người quản lý trực tiếp trước giờ làm việc, xin lỗi, báo rõ lý do (trễ tàu) và đưa ra thời gian chính xác dự kiến sẽ có mặt.",
        isCorrect: true,
        explanation: "Hoàn hảo! Người Nhật cực kỳ coi trọng thời gian. Bạn cần gọi điện trực tiếp, xin lỗi trước, nêu lý do khách quan rõ ràng và đưa ra mốc thời gian ước lượng chính xác để cấp trên chủ động sắp xếp công việc."
      },
      {
        letter: "C",
        text: "Cứ lẳng lặng đi vào chỗ ngồi làm việc khi tới nơi, cuối ngày làm bù 10 phút để không ai phàn nàn.",
        isCorrect: false,
        explanation: "Tự ý đi muộn mà không thông báo là lỗi vi phạm kỷ luật lao động cực kỳ nghiêm trọng tại Nhật. Việc làm bù cuối ngày không thể khỏa lấp lỗi không thông báo trước."
      }
    ]
  },
  {
    id: 3,
    title: "Tình huống 3: Sếp nhờ mua nước và bảo giữ lại tiền thừa",
    description: "Sếp đưa cho bạn tờ tiền 1,000 Yên và nhờ bạn xuống máy bán nước tự động ở sảnh mua một chai trà xanh (giá 150 Yên). Sếp bảo: 'Không cần thối lại đâu, cứ giữ lấy tiền thừa uống nước nhé!'.",
    options: [
      {
        letter: "A",
        text: "Vui vẻ nhận lời, cảm ơn sếp rối rít và cất 850 Yên tiền thừa vào ví riêng của mình.",
        isCorrect: false,
        explanation: "Ngay cả khi sếp nói xã giao như vậy, việc nhận trực tiếp tiền thừa từ việc công vụ mang tính cá nhân là không nên. Nó dễ gây ra ấn tượng bạn là người tham lam chi li nhỏ nhặt."
      },
      {
        letter: "B",
        text: "Mang nước lên cho sếp, lịch sự trả lại 850 Yên tiền thừa kèm hóa đơn. Nếu sếp nhất quyết không nhận, xin phép dùng số tiền đó mua trà nước đặt ở phòng sinh hoạt chung cho cả văn phòng.",
        isCorrect: true,
        explanation: "Hành động vô cùng tinh tế và chuyên nghiệp! Điều này thể hiện sự minh bạch về tài chính và tinh thần tập thể cao, khiến sếp cực kỳ nể phục sự trung thực của bạn."
      },
      {
        letter: "C",
        text: "Mua thêm nhiều món đồ ăn vặt đắt tiền khác cho đủ 1,000 Yên để sếp không cần phải nhận lại tiền thừa.",
        isCorrect: false,
        explanation: "Tự ý tiêu tiền của sếp vào việc khác mà không có sự đồng ý trước là hành động cực kỳ tối kỵ, vi phạm lòng tin và sự tôn trọng cơ bản."
      }
    ]
  },
  {
    id: 4,
    title: "Tình huống 4: Phát hiện báo cáo của đồng nghiệp có sai sót nghiêm trọng",
    description: "Khi xem lại tài liệu nội bộ, bạn phát hiện báo cáo của một đồng nghiệp cùng phòng (không phải sếp bạn) có con số thống kê sai, có thể ảnh hưởng tới quyết định của ban giám đốc trong cuộc họp chiều nay.",
    options: [
      {
        letter: "A",
        text: "Im lặng và coi như không biết vì đó không phải việc của mình. Tránh rắc rối không cần thiết.",
        isCorrect: false,
        explanation: "Im lặng khi biết sai sót có thể gây hại cho cả nhóm là thiếu tinh thần trách nhiệm. Trong môi trường Nhật, lợi ích tập thể luôn được đặt trên lợi ích cá nhân."
      },
      {
        letter: "B",
        text: "Trực tiếp nhắn tin riêng cho đồng nghiệp đó một cách tế nhị: cho biết bạn vừa đọc báo cáo và muốn hỏi lại vài con số để đảm bảo mình không hiểu nhầm.",
        isCorrect: true,
        explanation: "Đây là cách xử lý tinh tế nhất! Bạn giúp đồng nghiệp chỉnh sửa kịp thời mà không làm mất mặt họ trước đám đông. Tinh thần này gọi là 'Mentsu' (面子) – giữ thể diện cho người khác."
      },
      {
        letter: "C",
        text: "Lên gặp ngay sếp trưởng và báo cáo: 'Sếp ơi, báo cáo của anh/chị X có số liệu sai hết rồi ạ!'",
        isCorrect: false,
        explanation: "Chỉ ra lỗi sai của đồng nghiệp trực tiếp trước mặt cấp trên mà không báo trước sẽ làm mất mặt người đó và tạo ra mâu thuẫn nội bộ không đáng có."
      }
    ]
  },
  {
    id: 5,
    title: "Tình huống 5: Bị giới thiệu nhầm tên trong buổi gặp khách hàng",
    description: "Trong buổi gặp mặt khách hàng quan trọng lần đầu tiên, sếp bạn lỡ giới thiệu nhầm tên bạn với khách hàng người Nhật. Khách hàng đã cúi chào và gọi bạn bằng cái tên sai đó.",
    options: [
      {
        letter: "A",
        text: "Im lặng và chấp nhận cái tên sai đó trong suốt buổi họp để không làm sếp mất mặt.",
        isCorrect: false,
        explanation: "Im lặng suốt buổi họp sẽ khiến khách hàng tiếp tục gọi sai tên và tạo ra sự nhầm lẫn còn lớn hơn về sau. Sự thật sẽ lộ ra và có thể gây mất lòng tin về tính chuyên nghiệp."
      },
      {
        letter: "B",
        text: "Chờ đến khoảnh khắc phù hợp (ví dụ lúc trao danh thiếp), nhẹ nhàng cúi đầu và tự giới thiệu lại tên chính xác của mình một cách lịch sự, tự nhiên.",
        isCorrect: true,
        explanation: "Đây là cách xử lý khéo léo nhất! Bạn tự nhiên đính chính thông tin mà không cần nhắc đến lỗi của sếp, giúp buổi họp tiến triển suôn sẻ và xây dựng hình ảnh chuyên nghiệp với khách hàng."
      },
      {
        letter: "C",
        text: "Ngắt lời ngay: 'Xin lỗi sếp ơi, sếp nhầm tên em rồi! Em là [Tên Bạn] ạ.'",
        isCorrect: false,
        explanation: "Ngắt lời và chỉ ra lỗi của sếp ngay trước mặt khách hàng quan trọng là hành động thất lễ, làm mất mặt cả sếp lẫn công ty trong buổi gặp đầu tiên."
      }
    ]
  }
];

export default function RolePlay({ roleplay = SCENARIOS }) {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleOptionClick = (opt) => {
    if (selectedOption) return; // Prevent changing answer after selection

    setSelectedOption(opt);

    const key = currentScenarioIdx;
    if (!attempted[key]) {
      setAttempted(prev => ({ ...prev, [key]: true }));
      if (opt.isCorrect) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentScenarioIdx < roleplay.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentScenarioIdx(0);
    setSelectedOption(null);
    setScore(0);
    setAttempted({});
    setIsCompleted(false);
  };

  const currentScenario = roleplay[currentScenarioIdx];
  if (!currentScenario) return null;

  // Calculate progress based on current index AND whether an option is selected
  const progressPercentage = ((currentScenarioIdx + (selectedOption ? 1 : 0)) / roleplay.length) * 100;

  return (
    <div className="rp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 className="section-title">Thử thách Tình huống - Role-play</h2>
        <p className="section-subtitle">Thực hành giải quyết các bài toán giao tiếp ứng xử chuẩn Nhật Bản.</p>
      </div>

      {isCompleted ? (
        <div className="rp-gamified-card rp-results-screen" style={{ textAlign: 'center', padding: '3rem 2rem', animation: 'fadeInUp 0.5s ease-out forwards' }}>
          <div style={{ marginBottom: '2rem' }}>
            {score === roleplay.length ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', marginBottom: '1rem' }}>
                <CheckCircle2 size={70} />
              </div>
            ) : score >= roleplay.length / 2 ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(52, 152, 219, 0.1)', color: 'var(--jp-blue)', marginBottom: '1rem' }}>
                <CheckCircle2 size={70} />
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(188, 0, 45, 0.1)', color: 'var(--jp-red)', marginBottom: '1rem' }}>
                <RefreshCw size={70} />
              </div>
            )}

            <h2 style={{ fontSize: '2rem', color: 'var(--jp-blue)', fontFamily: 'var(--font-japanese)', marginBottom: '0.5rem' }}>
              Hoàn thành Thử thách!
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--jp-text-muted)', marginBottom: '2rem' }}>
              Điểm số của bạn: <strong style={{ color: 'var(--jp-red)', fontSize: '1.5rem' }}>{score} / {roleplay.length}</strong>
            </p>

            <p style={{ fontSize: '1.05rem', color: 'var(--jp-text)', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              {score === roleplay.length
                ? "Tuyệt vời! Bạn đã nắm bắt hoàn hảo các quy tắc ứng xử nơi công sở Nhật Bản. Giữ vững phong độ này nhé!"
                : score >= roleplay.length / 2
                  ? "Khá lắm! Bạn đã có những hiểu biết cơ bản tốt, nhưng hãy tiếp tục ôn luyện để xử lý mượt mà hơn nhé."
                  : "Đừng nản chí! Văn hóa Nhật có nhiều quy tắc ẩn, hãy thử lại và đọc kỹ phần giải thích để tiến bộ hơn."}
            </p>

            <button className="btn btn-primary" onClick={handleRetry} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} /> Làm lại từ đầu
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar & Score */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--jp-text-muted)', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
                Câu hỏi {currentScenarioIdx + 1} / {roleplay.length}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--jp-blue)' }}>
                Điểm: <span style={{ color: 'var(--jp-red)', fontSize: '1.2rem', marginLeft: '4px' }}>{score}</span>
              </span>
            </div>
            <div className="rp-progress-container">
              <div className="rp-progress-fill" style={{ '--progress': `${progressPercentage}%` }}></div>
            </div>
          </div>

          <div className="rp-gamified-card" style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}>
            {/* Illustration */}
            <div className="rp-gamified-illustration">
              {currentScenario.imageUrl ? (
                <img
                  src={currentScenario.imageUrl}
                  alt="Minh họa tình huống"
                  style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                />
              ) : (
                <ScenarioIllustration id={currentScenario.id} />
              )}
            </div>

            {/* Content: Title, Desc, Options */}
            <div className="rp-gamified-content">
              <h3 className="rp-gamified-title">{currentScenario.title}</h3>
              <p className="rp-gamified-desc">{currentScenario.description}</p>

              <div className="rp-options-grid">
                {(currentScenario.options || []).map((opt, idx) => {
                  let optionClass = "rp-gamified-option";
                  if (selectedOption) {
                    if (opt.letter === selectedOption.letter) {
                      optionClass += opt.isCorrect ? " selected-correct" : " selected-incorrect";
                    } else if (opt.isCorrect) {
                      // Reveal the correct option in green even if they didn't pick it
                      optionClass += " selected-correct";
                    } else {
                      optionClass += " disabled";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      className={optionClass}
                      onClick={() => handleOptionClick(opt)}
                      disabled={!!selectedOption}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="rp-gamified-option-letter">{opt.letter || String.fromCharCode(65 + idx)}</div>
                      <div className="rp-gamified-option-text">{opt.text}</div>
                    </button>
                  );
                })}
              </div>

              {/* Inline Slide-up Feedback */}
              {selectedOption && (
                <div className="rp-inline-feedback">
                  <div className={`rp-feedback-header ${selectedOption.isCorrect ? 'correct' : 'incorrect'}`}>
                    {selectedOption.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    <span>{selectedOption.isCorrect ? 'ĐÁP ÁN ĐÚNG! (正解)' : 'CHƯA CHÍNH XÁC! (間違った答え)'}</span>
                  </div>
                  <div className="rp-feedback-body">
                    <p style={{ color: 'var(--jp-text)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {selectedOption.explanation}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {currentScenarioIdx < roleplay.length - 1 ? (
                        <button className="btn btn-primary" onClick={handleNext} style={{ padding: '0.6rem 1.5rem' }}>
                          Câu tiếp theo
                        </button>
                      ) : (
                        <button className="btn btn-primary" onClick={handleNext} style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center' }}>
                          Hoàn tất
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
