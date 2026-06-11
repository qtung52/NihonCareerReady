import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: "Thông tin cá nhân" },
  { id: 2, label: "Học vấn & Kinh nghiệm" },
  { id: 3, label: "Bằng cấp & Chứng chỉ" },
  { id: 4, label: "Động lực & PR bản thân" }
];

export default function CVBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    furiganaName: 'グエン　ヴァン　ア',
    kanjiName: 'NGUYEN VAN A',
    birthYear: '2004',
    birthMonth: '08',
    birthDay: '15',
    gender: 'Nam',
    email: 'nguyenvana@email.com',
    phone: '090-1234-5678',
    addressFurigana: 'ハノイシ　カウザイック',
    addressKanji: 'Thành phố Hà Nội, Quận Cầu Giấy',
    
    // Step 2 (Simplified arrays for simplicity, serialised as inputs)
    eduYear1: '2019', eduMonth1: '09', eduDetail1: 'Trường THPT Chuyên Hà Nội - Amsterdam (Nhập học)',
    eduYear2: '2022', eduMonth2: '06', eduDetail2: 'Trường THPT Chuyên Hà Nội - Amsterdam (Tốt nghiệp)',
    eduYear3: '2022', eduMonth3: '09', eduDetail3: 'Đại học Quốc gia Hà Nội - Khoa Tiếng Nhật (Nhập học)',
    eduYear4: '', eduMonth4: '', eduDetail4: '',
    
    workYear1: '2024', workMonth1: '06', workDetail1: 'FPT Software - Thực tập sinh Biên dịch tiếng Nhật (Vào công ty)',
    workYear2: '2024', workMonth2: '09', workDetail2: 'FPT Software (Thôi việc)',
    workYear3: '', workMonth3: '', workDetail3: '',
    
    // Step 3
    licYear1: '2023', licMonth1: '12', licDetail1: 'Kỳ thi Năng lực Tiếng Nhật JLPT N2 (Đỗ)',
    licYear2: '2024', licMonth2: '05', licDetail2: 'Chứng chỉ Business Manner Nhật Bản - Hạng 3',
    licYear3: '', licMonth3: '', licDetail3: '',

    // Step 4
    motivation: 'Từ nhỏ tôi đã yêu thích văn hóa Nhật Bản và đặc biệt ấn tượng với tác phong làm việc ngăn nắp, kỷ luật của người Nhật. Với thế mạnh ngôn ngữ cùng kiến thức vững chắc về quy tắc ứng xử văn phòng Nhật đã học, tôi mong muốn được cống hiến cho sự phát triển của công ty và là cầu nối văn hóa đắc lực.',
    selfPR: 'Tôi là người luôn chủ động trong công việc và có tinh thần trách nhiệm cao. Trong thời gian thực tập tại FPT Software, tôi luôn tuân thủ nguyên tắc báo cáo Hou-Ren-So và nhận được đánh giá cao từ sếp người Nhật. Tôi tự tin có khả năng học hỏi nhanh và thích nghi tốt.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Công cụ Tạo Rirekisho chuẩn Nhật</h2>
        <p className="section-subtitle">Điền thông tin theo mẫu từng bước bên dưới. Form tự động căn chỉnh ra chuẩn form Rirekisho truyền thống của Nhật.</p>
      </div>

      <div className="cv-builder-layout">
        {/* Left Form Panel */}
        <div className="cv-form-panel">
          <div className="step-indicator">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`step-node ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
                style={{ cursor: 'pointer' }}
                title={step.label}
              >
                {currentStep > step.id ? <Check size={14} /> : step.id}
              </div>
            ))}
          </div>

          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Bước {currentStep}: {STEPS[currentStep - 1].label}
          </h3>

          {/* Form Content */}
          {currentStep === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">Tên đọc phiên âm (Furigana - Katakana)</label>
                <input
                  type="text"
                  className="form-input"
                  name="furiganaName"
                  value={formData.furiganaName}
                  onChange={handleChange}
                  placeholder="グエン　ヴァン　ア"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Họ và tên (Chữ in hoa không dấu hoặc Kanji)</label>
                <input
                  type="text"
                  className="form-input"
                  name="kanjiName"
                  value={formData.kanjiName}
                  onChange={handleChange}
                  placeholder="NGUYEN VAN A"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Năm sinh</label>
                  <input
                    type="text"
                    className="form-input"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    placeholder="2004"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tháng / Ngày sinh</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      name="birthMonth"
                      value={formData.birthMonth}
                      onChange={handleChange}
                      placeholder="08"
                    />
                    <input
                      type="text"
                      className="form-input"
                      name="birthDay"
                      value={formData.birthDay}
                      onChange={handleChange}
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <select className="form-input" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Nam">Nam (男)</option>
                  <option value="Nữ">Nữ (女)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Điện thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ phiên âm (Furigana)</label>
                <input
                  type="text"
                  className="form-input"
                  name="addressFurigana"
                  value={formData.addressFurigana}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ hiện tại</label>
                <input
                  type="text"
                  className="form-input"
                  name="addressKanji"
                  value={formData.addressKanji}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)', marginBottom: '1rem' }}>
                Học vấn (学歴) và Lịch sử làm việc (職歴). Để trống các dòng không dùng.
              </p>
              
              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Dòng học vấn 1:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="eduYear1" value={formData.eduYear1} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="eduMonth1" value={formData.eduMonth1} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="eduDetail1" value={formData.eduDetail1} onChange={handleChange} placeholder="Tên trường học & Nhập học/Tốt nghiệp" />
              </div>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Dòng học vấn 2:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="eduYear2" value={formData.eduYear2} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="eduMonth2" value={formData.eduMonth2} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="eduDetail2" value={formData.eduDetail2} onChange={handleChange} placeholder="Tên trường học & Nhập học/Tốt nghiệp" />
              </div>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Dòng học vấn 3:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="eduYear3" value={formData.eduYear3} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="eduMonth3" value={formData.eduMonth3} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="eduDetail3" value={formData.eduDetail3} onChange={handleChange} placeholder="Tên trường học & Nhập học/Tốt nghiệp" />
              </div>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 600, borderTop: '1px solid var(--jp-border)', paddingTop: '1rem' }}>Lịch sử làm việc (Kinh nghiệm) 1:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="workYear1" value={formData.workYear1} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="workMonth1" value={formData.workMonth1} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="workDetail1" value={formData.workDetail1} onChange={handleChange} placeholder="Tên công ty & Vào/Thôi việc" />
              </div>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Lịch sử làm việc 2:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="workYear2" value={formData.workYear2} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="workMonth2" value={formData.workMonth2} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="workDetail2" value={formData.workDetail2} onChange={handleChange} placeholder="Tên công ty & Vào/Thôi việc" />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)', marginBottom: '1rem' }}>
                Bằng cấp (免許) và Chứng chỉ (資格) liên quan. Nên ghi rõ ngày tháng năm nhận bằng.
              </p>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Bằng cấp 1:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="licYear1" value={formData.licYear1} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="licMonth1" value={formData.licMonth1} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="licDetail1" value={formData.licDetail1} onChange={handleChange} placeholder="Tên bằng cấp/chứng chỉ" />
              </div>

              <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Bằng cấp 2:</h4>
              <div className="form-row">
                <input type="text" className="form-input" style={{ width: '70px' }} name="licYear2" value={formData.licYear2} onChange={handleChange} placeholder="Năm" />
                <input type="text" className="form-input" style={{ width: '50px' }} name="licMonth2" value={formData.licMonth2} onChange={handleChange} placeholder="Tháng" />
                <input type="text" className="form-input" name="licDetail2" value={formData.licDetail2} onChange={handleChange} placeholder="Tên bằng cấp/chứng chỉ" />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="form-group">
                <label className="form-label">Động lực ứng tuyển (志望動機 - Jibou Douki)</label>
                <textarea
                  className="form-textarea"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Ghi rõ lý do tại sao bạn muốn ứng tuyển..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">PR bản thân (自己PR - Jiko PR)</label>
                <textarea
                  className="form-textarea"
                  name="selfPR"
                  value={formData.selfPR}
                  onChange={handleChange}
                  placeholder="Điểm mạnh, kỹ năng mềm và kinh nghiệm nổi trội của bạn..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="form-navigation">
            <button
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} /> Quay lại
            </button>
            
            {currentStep < 4 ? (
              <button className="btn btn-secondary" onClick={handleNext}>
                Tiếp theo <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handlePrint}>
                <Download size={16} /> In / Xuất PDF (A4)
              </button>
            )}
          </div>
        </div>

        {/* Right Preview Sheet */}
        <div className="rirekisho-container">
          <div className="rirekisho-header-actions">
            <h4 style={{ color: 'var(--jp-blue)', fontWeight: 700 }}>Bản xem trước Rirekisho (A4)</h4>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Download size={14} /> Tải PDF
            </button>
          </div>

          <div className="rirekisho-paper">
            <h3 className="rirekisho-title-jp">履　歴　書</h3>
            
            {/* Personal Info Table */}
            <table className="ri-table">
              <tbody>
                <tr>
                  <td className="furigana" colSpan="4">ふりがana: {formData.furiganaName}</td>
                  <td rowSpan="4" style={{ width: '90px', textAlign: 'center', background: '#fafafa' }}>
                    <div style={{ height: '110px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999' }}>
                      Ảnh thẻ<br />(3cm x 4cm)
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="label">氏　名</td>
                  <td colSpan="3" style={{ fontSize: '14px', fontWeight: 'bold' }}>{formData.kanjiName}</td>
                </tr>
                <tr>
                  <td className="label">生年月日</td>
                  <td colSpan="3">
                    {formData.birthYear} 年 {formData.birthMonth} 月 {formData.birthDay} 日生 (満 {new Date().getFullYear() - parseInt(formData.birthYear || 2000)} 歳) 性別: {formData.gender}
                  </td>
                </tr>
                <tr>
                  <td className="furigana" colSpan="4">ふりがana: {formData.addressFurigana}</td>
                </tr>
                <tr>
                  <td className="label">現住所</td>
                  <td colSpan="4">{formData.addressKanji}</td>
                </tr>
                <tr>
                  <td className="label">電話番号</td>
                  <td colSpan="2">{formData.phone}</td>
                  <td className="label">E-mail</td>
                  <td>{formData.email}</td>
                </tr>
              </tbody>
            </table>

            {/* Academic & Work History Table */}
            <table className="ri-table" style={{ marginTop: '5px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ width: '45px' }}>年 (Năm)</th>
                  <th style={{ width: '25px' }}>月 (T)</th>
                  <th>学歴・職歴 (Lịch sử Học vấn & Làm việc)</th>
                </tr>
              </thead>
              <tbody>
                {/* Header Academic */}
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>学　　歴 (Học vấn)</td>
                </tr>
                
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.eduYear1}</td>
                  <td style={{ textAlign: 'center' }}>{formData.eduMonth1}</td>
                  <td>{formData.eduDetail1}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.eduYear2}</td>
                  <td style={{ textAlign: 'center' }}>{formData.eduMonth2}</td>
                  <td>{formData.eduDetail2}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.eduYear3}</td>
                  <td style={{ textAlign: 'center' }}>{formData.eduMonth3}</td>
                  <td>{formData.eduDetail3}</td>
                </tr>

                {/* Header Work */}
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>職　　歴 (Lịch sử làm việc)</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.workYear1}</td>
                  <td style={{ textAlign: 'center' }}>{formData.workMonth1}</td>
                  <td>{formData.workDetail1}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.workYear2}</td>
                  <td style={{ textAlign: 'center' }}>{formData.workMonth2}</td>
                  <td>{formData.workDetail2}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'right' }}>以　上 (Hết)</td>
                </tr>
              </tbody>
            </table>

            {/* Licenses & Qualifications */}
            <table className="ri-table" style={{ marginTop: '5px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ width: '45px' }}>年 (Năm)</th>
                  <th style={{ width: '25px' }}>月 (T)</th>
                  <th>免許・資格 (Bằng cấp & Chứng chỉ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.licYear1}</td>
                  <td style={{ textAlign: 'center' }}>{formData.licMonth1}</td>
                  <td>{formData.licDetail1}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{formData.licYear2}</td>
                  <td style={{ textAlign: 'center' }}>{formData.licMonth2}</td>
                  <td>{formData.licDetail2}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td style={{ textAlign: 'center' }}></td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* Motivation & PR Box */}
            <table className="ri-table" style={{ marginTop: '5px' }}>
              <tbody>
                <tr style={{ background: '#f5f5f5' }}>
                  <th>志望動機 (Động lực ứng tuyển) & 自己PR (PR Bản thân)</th>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', height: '100px', verticalAlign: 'top' }}>
                    <strong>【志望動機】</strong><br />
                    {formData.motivation}
                    <br /><br />
                    <strong>【自己PR】</strong><br />
                    {formData.selfPR}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
