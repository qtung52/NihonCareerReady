import React, { useState } from 'react';
import { Award, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

const QUESTIONS = [
  {
    question: "Ojigi (cúi chào) 30 độ (Keirei) được dùng trong trường hợp nào phù hợp nhất?",
    options: [
      { text: "Chào xã giao hàng ngày với đồng nghiệp cùng cấp (Meshaku - 15 độ).", isCorrect: false },
      { text: "Chào đón khách hàng, đối tác hoặc chào cấp trên khi vào văn phòng.", isCorrect: true },
      { text: "Chào sâu trang trọng khi xin lỗi hoặc cảm ơn sâu sắc (Saikeirei - 45 độ).", isCorrect: false }
    ]
  },
  {
    question: "Khi trao đổi danh thiếp (Meishi Kankan), hành động nào sau đây là đúng chuẩn công sở Nhật?",
    options: [
      { text: "Nhận danh thiếp bằng tay trái, đưa danh thiếp bằng tay phải một cách nhanh chóng.", isCorrect: false },
      { text: "Đưa danh thiếp thấp hơn tầm mắt của đối phương bằng 2 tay và nhận danh thiếp của họ bằng cả 2 tay.", isCorrect: true },
      { text: "Cất ngay danh thiếp đối phương vào túi quần sau khi nhận để tránh thất lạc.", isCorrect: false }
    ]
  },
  {
    question: "Quy tắc chỗ ngồi (Kamiza/Shimoza): Trong phòng họp công sở Nhật, vị trí tôn kính nhất dành cho sếp lớn hoặc khách nằm ở đâu?",
    options: [
      { text: "Gần cửa ra vào nhất để sếp dễ ra vào khi có việc bận.", isCorrect: false },
      { text: "Ở giữa bàn họp, đối diện trực tiếp với cửa ra vào.", isCorrect: false },
      { text: "Ở vị trí sâu nhất trong phòng, xa cửa ra vào nhất.", isCorrect: true }
    ]
  },
  {
    question: "Nguyên tắc báo cáo Hou-Ren-So cực kỳ quan trọng trong doanh nghiệp Nhật. Nó bao gồm những yếu tố nào?",
    options: [
      { text: "Houkoku (Báo cáo) - Renraku (Liên lạc) - Soudan (Thảo luận/Bàn bạc khi có vấn đề).", isCorrect: true },
      { text: "Housou (Phát sóng) - Renzoku (Liên tục) - Souji (Dọn dẹp vệ sinh cuối giờ).", isCorrect: false },
      { text: "Houki (Từ bỏ) - Renchuu (Đám đông) - Souseki (Sắp xếp hồ sơ).", isCorrect: false }
    ]
  },
  {
    question: "Khi đi phỏng vấn tại doanh nghiệp Nhật (Shukatsu), trang phục nào được coi là chuẩn mực (Recruit Suit)?",
    options: [
      { text: "Quần Jeans cá tính phối cùng áo Blazer thời trang màu sáng.", isCorrect: false },
      { text: "Bộ Vest màu tối (đen/navy), áo sơ mi trắng phẳng phiu cài kín cổ, giày da tối màu.", isCorrect: true },
      { text: "Trang phục thoải mái tự do (casual) để thể hiện sự sáng tạo và năng động.", isCorrect: false }
    ]
  }
];

export default function Survey({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (idx) => {
    setSelectedOpt(idx);
  };

  const handleNext = () => {
    if (selectedOpt === null) return;
    
    const isCorrect = QUESTIONS[currentIdx].options[selectedOpt].isCorrect;
    const newAnswers = [...answers, { qIdx: currentIdx, selectedIdx: selectedOpt, isCorrect }];
    setAnswers(newAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
    } else {
      setIsFinished(true);
    }
  };

  const score = answers.filter(a => a.isCorrect).length;
  const progressPercent = ((currentIdx + (selectedOpt !== null ? 1 : 0)) / QUESTIONS.length) * 100;

  const getRoadmap = (scoreValue) => {
    if (scoreValue === 5) {
      return [
        { title: "Nhiệm vụ 1: Ôn luyện nâng cao các tình huống thực tế (Role-play)", desc: "Bạn đã có nền tảng rất vững chắc. Hãy thử thách các tình huống xử lý khó hơn tại doanh nghiệp." },
        { title: "Nhiệm vụ 2: Chuẩn bị hồ sơ Rirekisho", desc: "Tạo một bản CV Rirekisho chuẩn Nhật để sẵn sàng nộp cho nhà tuyển dụng." }
      ];
    } else if (scoreValue >= 3) {
      return [
        { title: "Nhiệm vụ 1: Luyện tập kỹ năng giao tiếp Hou-Ren-So", desc: "Đọc thêm về phương pháp báo cáo chủ động trong sổ tay văn hóa và làm bài tập tình huống liên quan." },
        { title: "Nhiệm vụ 2: Tìm hiểu quy tắc chỗ ngồi Kamiza/Shimoza", desc: "Xem hướng dẫn sơ đồ chỗ ngồi trong văn phòng và xe ô tô để tránh mắc lỗi khi đi cùng sếp." },
        { title: "Nhiệm vụ 3: Hoàn thiện hồ sơ ứng tuyển", desc: "Tạo CV tiếng Nhật chuẩn định dạng." }
      ];
    } else {
      return [
        { title: "Nhiệm vụ 1: Sổ tay Ojigi & Meishi", desc: "Đọc kỹ hướng dẫn cách cúi chào theo 3 góc độ và cách cầm/trao danh thiếp chuẩn chỉ." },
        { title: "Nhiệm vụ 2: Quy tắc giao tiếp cơ bản (Hou-Ren-So)", desc: "Tìm hiểu vì sao người Nhật coi trọng Hou-Ren-So và thực hành qua 3 thử thách tình huống." },
        { title: "Nhiệm vụ 3: Tìm hiểu văn hóa phỏng vấn Nhật Bản", desc: "Tìm hiểu về trang phục Recruit Suit chuẩn và cách gõ cửa, chào hỏi khi vào phòng phỏng vấn." }
      ];
    }
  };

  if (isFinished) {
    const roadmap = getRoadmap(score);
    return (
      <div className="card-container" style={{ textAlign: 'center' }}>
        <Award size={64} style={{ color: 'var(--jp-red)', marginBottom: '1.5rem' }} />
        <h2 className="section-title">Kết quả đánh giá ban đầu</h2>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--jp-blue)', marginBottom: '1.5rem' }}>
          Độ hiểu biết văn hóa doanh nghiệp Nhật: <span style={{ color: 'var(--jp-red)', fontSize: '1.8rem' }}>{score}/{QUESTIONS.length}</span>
        </p>
        <p style={{ color: 'var(--jp-text-muted)', marginBottom: '2rem' }}>
          {score === 5 
            ? "Tuyệt vời! Bạn đã nắm rất rõ các quy tắc cơ bản trong văn phòng Nhật Bản. Sẵn sàng tỏa sáng!"
            : score >= 3 
            ? "Khá tốt! Bạn đã có hiểu biết cơ bản, tuy nhiên vẫn cần lưu ý một vài chi tiết nhỏ để trở nên chuyên nghiệp hơn."
            : "Đừng lo lắng! Môi trường văn phòng Nhật có rất nhiều quy tắc đặc thù. Hãy bắt đầu lộ trình học tập dưới đây."
          }
        </p>

        <div className="roadmap-container" style={{ textAlign: 'left' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1rem', borderBottom: '2px solid var(--jp-border)', paddingBottom: '0.5rem' }}>
            Lộ trình học tập đề xuất cho bạn
          </h3>
          {roadmap.map((task, index) => (
            <div key={index} className="roadmap-card">
              <div className="roadmap-details">
                <h4>{task.title}</h4>
                <p>{task.desc}</p>
              </div>
              <CheckCircle2 size={24} style={{ color: 'var(--jp-red)', flexShrink: 0, marginLeft: '1rem' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
          <button className="btn btn-primary" onClick={() => onComplete(roadmap, score)}>
            Vào Trang Chủ <ArrowRight size={16} />
          </button>
          <button className="btn btn-outline" onClick={() => {
            setCurrentIdx(0);
            setSelectedOpt(null);
            setAnswers([]);
            setIsFinished(false);
          }}>
            Làm lại bài Test <RefreshCw size={16} />
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentIdx];

  return (
    <div className="card-container">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '1rem' }}>
        <span>Khảo sát độ hiểu biết văn hóa Nhật</span>
        <span>Câu hỏi {currentIdx + 1}/{QUESTIONS.length}</span>
      </div>

      <h3 className="question-title">{currentQuestion.question}</h3>

      <div className="options-list">
        {currentQuestion.options.map((opt, oIdx) => (
          <button
            key={oIdx}
            className={`option-button ${selectedOpt === oIdx ? 'selected' : ''}`}
            onClick={() => handleSelect(oIdx)}
          >
            <span style={{
              display: 'inline-flex',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: selectedOpt === oIdx ? 'rgba(255,255,255,0.2)' : 'var(--jp-blue-light)',
              color: selectedOpt === oIdx ? '#fff' : 'var(--jp-blue)',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              {String.fromCharCode(65 + oIdx)}
            </span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selectedOpt === null}
          style={{ opacity: selectedOpt === null ? 0.6 : 1 }}
        >
          {currentIdx === QUESTIONS.length - 1 ? "Xem kết quả" : "Tiếp theo"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
