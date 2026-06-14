import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, Check, Eye } from 'lucide-react';
import styles from './CVBuilder.module.css';

/* eslint-disable no-irregular-whitespace */

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
    
    // Step 2
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
    <div className={styles.container}>
      {/* Left Form Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Công cụ Tạo Rirekisho</h2>
          <p className={styles.subtitle}>Điền thông tin theo mẫu từng bước bên dưới. Form tự động căn chỉnh ra chuẩn form Rirekisho truyền thống của Nhật.</p>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.stepper}>
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`${styles.stepNode} ${currentStep === step.id ? styles.active : currentStep > step.id ? styles.completed : ''}`}
                onClick={() => setCurrentStep(step.id)}
                title={step.label}
              >
                {currentStep > step.id ? <Check size={18} /> : step.id}
              </div>
            ))}
          </div>

          <h3 className={styles.stepTitle}>
            Bước {currentStep}: {STEPS[currentStep - 1].label}
          </h3>

          {/* Form Content */}
          <div className={styles.bentoGrid}>
            {currentStep === 1 && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên đọc phiên âm (Furigana)</label>
                  <input type="text" className={styles.formInput} name="furiganaName" value={formData.furiganaName} onChange={handleChange} placeholder="グエン　ヴァン　ア" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên (In hoa/Kanji)</label>
                  <input type="text" className={styles.formInput} name="kanjiName" value={formData.kanjiName} onChange={handleChange} placeholder="NGUYEN VAN A" />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Năm sinh</label>
                  <input type="text" className={styles.formInput} name="birthYear" value={formData.birthYear} onChange={handleChange} placeholder="2004" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tháng / Ngày sinh</label>
                  <div className={styles.flexRow}>
                    <input type="text" className={styles.formInput} style={{flex: 1}} name="birthMonth" value={formData.birthMonth} onChange={handleChange} placeholder="08" />
                    <input type="text" className={styles.formInput} style={{flex: 1}} name="birthDay" value={formData.birthDay} onChange={handleChange} placeholder="15" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới tính</label>
                  <select className={styles.formSelect} name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="Nam">Nam (男)</option>
                    <option value="Nữ">Nữ (女)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Điện thoại</label>
                  <input type="text" className={styles.formInput} name="phone" value={formData.phone} onChange={handleChange} placeholder="090-1234-5678" />
                </div>

                <div className={`${styles.formGroup} ${styles.bentoItemFull}`}>
                  <label className={styles.formLabel}>Email</label>
                  <input type="email" className={styles.formInput} name="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" />
                </div>

                <div className={`${styles.formGroup} ${styles.bentoItemFull}`}>
                  <label className={styles.formLabel}>Địa chỉ phiên âm (Furigana)</label>
                  <input type="text" className={styles.formInput} name="addressFurigana" value={formData.addressFurigana} onChange={handleChange} />
                </div>
                <div className={`${styles.formGroup} ${styles.bentoItemFull}`}>
                  <label className={styles.formLabel}>Địa chỉ hiện tại</label>
                  <input type="text" className={styles.formInput} name="addressKanji" value={formData.addressKanji} onChange={handleChange} />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className={styles.bentoItemFull}>
                  <p className={styles.subText}>Học vấn (学歴) và Lịch sử làm việc (職歴). Để trống các dòng không dùng.</p>
                  
                  <div className={styles.sectionDivider}>Học vấn</div>
                  
                  {[1,2,3].map(i => (
                    <div key={`edu${i}`} className={`${styles.formGroup} ${styles.bentoItemFull}`} style={{marginBottom: '0.75rem'}}>
                      <div className={styles.flexRow}>
                        <input type="text" className={styles.formInput} style={{width: '80px'}} name={`eduYear${i}`} value={formData[`eduYear${i}`]} onChange={handleChange} placeholder="Năm" />
                        <input type="text" className={styles.formInput} style={{width: '70px'}} name={`eduMonth${i}`} value={formData[`eduMonth${i}`]} onChange={handleChange} placeholder="Tháng" />
                        <input type="text" className={styles.formInput} style={{flex: 1}} name={`eduDetail${i}`} value={formData[`eduDetail${i}`]} onChange={handleChange} placeholder="Tên trường học & Nhập học/Tốt nghiệp" />
                      </div>
                    </div>
                  ))}

                  <div className={styles.sectionDivider}>Lịch sử làm việc</div>
                  
                  {[1,2].map(i => (
                    <div key={`work${i}`} className={`${styles.formGroup} ${styles.bentoItemFull}`} style={{marginBottom: '0.75rem'}}>
                      <div className={styles.flexRow}>
                        <input type="text" className={styles.formInput} style={{width: '80px'}} name={`workYear${i}`} value={formData[`workYear${i}`]} onChange={handleChange} placeholder="Năm" />
                        <input type="text" className={styles.formInput} style={{width: '70px'}} name={`workMonth${i}`} value={formData[`workMonth${i}`]} onChange={handleChange} placeholder="Tháng" />
                        <input type="text" className={styles.formInput} style={{flex: 1}} name={`workDetail${i}`} value={formData[`workDetail${i}`]} onChange={handleChange} placeholder="Tên công ty & Vào/Thôi việc" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <div className={styles.bentoItemFull}>
                <p className={styles.subText}>Bằng cấp (免許) và Chứng chỉ (資格) liên quan.</p>
                <div className={styles.sectionDivider}>Danh sách bằng cấp/chứng chỉ</div>
                {[1,2,3].map(i => (
                  <div key={`lic${i}`} className={`${styles.formGroup} ${styles.bentoItemFull}`} style={{marginBottom: '0.75rem'}}>
                    <div className={styles.flexRow}>
                      <input type="text" className={styles.formInput} style={{width: '80px'}} name={`licYear${i}`} value={formData[`licYear${i}`]} onChange={handleChange} placeholder="Năm" />
                      <input type="text" className={styles.formInput} style={{width: '70px'}} name={`licMonth${i}`} value={formData[`licMonth${i}`]} onChange={handleChange} placeholder="Tháng" />
                      <input type="text" className={styles.formInput} style={{flex: 1}} name={`licDetail${i}`} value={formData[`licDetail${i}`]} onChange={handleChange} placeholder="Tên bằng cấp/chứng chỉ" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <>
                <div className={`${styles.formGroup} ${styles.bentoItemFull}`}>
                  <label className={styles.formLabel}>Động lực ứng tuyển (志望動機)</label>
                  <textarea className={styles.formTextarea} name="motivation" value={formData.motivation} onChange={handleChange} placeholder="Ghi rõ lý do tại sao bạn muốn ứng tuyển..."></textarea>
                </div>

                <div className={`${styles.formGroup} ${styles.bentoItemFull}`}>
                  <label className={styles.formLabel}>PR bản thân (自己PR)</label>
                  <textarea className={styles.formTextarea} name="selfPR" value={formData.selfPR} onChange={handleChange} placeholder="Điểm mạnh, kỹ năng mềm và kinh nghiệm nổi trội của bạn..."></textarea>
                </div>
              </>
            )}
          </div>

          <div className={styles.navButtons}>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handlePrev} disabled={currentStep === 1} style={{ opacity: currentStep === 1 ? 0.5 : 1 }}>
              <ChevronLeft size={18} /> Quay lại
            </button>
            
            {currentStep < 4 ? (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNext}>
                Tiếp theo <ChevronRight size={18} />
              </button>
            ) : (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePrint}>
                <Download size={18} /> Tải PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Preview Sheet */}
      <div className={styles.rightPanel}>
        <div className={styles.previewHeader}>
          <div className={styles.previewTitle}><Eye size={20} color="#1976d2" /> Xem trước (Real-time)</div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{padding: '0.5rem 1rem'}} onClick={handlePrint}>
            <Download size={16} /> Xuất PDF
          </button>
        </div>

        <div className={styles.glassPaper}>
          <h3 className={styles.rirekishoTitle}>履　歴　書</h3>
          
          <table className={styles.riTable}>
            <tbody>
              <tr>
                <td className={styles.furigana} colSpan="4">ふりがな: {formData.furiganaName}</td>
                <td rowSpan="4" style={{ width: '100px', textAlign: 'center', background: '#f8fafc', padding: 0 }}>
                  <div style={{ height: '130px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', margin: '4px' }}>
                    Ảnh thẻ<br />(3x4)
                  </div>
                </td>
              </tr>
              <tr>
                <td className={styles.label}>氏　名</td>
                <td colSpan="3" style={{ fontSize: '18px', fontWeight: 'bold' }}>{formData.kanjiName}</td>
              </tr>
              <tr>
                <td className={styles.label}>生年月日</td>
                <td colSpan="3">
                  {formData.birthYear} 年 {formData.birthMonth} 月 {formData.birthDay} 日生 (満 {new Date().getFullYear() - parseInt(formData.birthYear || 2000)} 歳) 性別: {formData.gender}
                </td>
              </tr>
              <tr>
                <td className={styles.furigana} colSpan="4">ふりがな: {formData.addressFurigana}</td>
              </tr>
              <tr>
                <td className={styles.label}>現住所</td>
                <td colSpan="4">{formData.addressKanji}</td>
              </tr>
              <tr>
                <td className={styles.label}>電話番号</td>
                <td colSpan="2">{formData.phone}</td>
                <td className={styles.label}>E-mail</td>
                <td>{formData.email}</td>
              </tr>
            </tbody>
          </table>

          <table className={styles.riTable}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '50px' }}>年</th>
                <th style={{ width: '30px' }}>月</th>
                <th>学歴・職歴</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="3" style={{ textAlign: 'center', fontWeight: 'bold', borderTop: '2px solid #000' }}>学　　歴</td></tr>
              {[1,2,3].map(i => formData[`eduDetail${i}`] ? (
                <tr key={`edut${i}`}>
                  <td style={{ textAlign: 'center' }}>{formData[`eduYear${i}`]}</td>
                  <td style={{ textAlign: 'center' }}>{formData[`eduMonth${i}`]}</td>
                  <td>{formData[`eduDetail${i}`]}</td>
                </tr>
              ) : null)}

              <tr><td colSpan="3" style={{ textAlign: 'center', fontWeight: 'bold', borderTop: '2px solid #000' }}>職　　歴</td></tr>
              {[1,2].map(i => formData[`workDetail${i}`] ? (
                <tr key={`workt${i}`}>
                  <td style={{ textAlign: 'center' }}>{formData[`workYear${i}`]}</td>
                  <td style={{ textAlign: 'center' }}>{formData[`workMonth${i}`]}</td>
                  <td>{formData[`workDetail${i}`]}</td>
                </tr>
              ) : null)}
              <tr>
                <td></td><td></td><td style={{ textAlign: 'right' }}>以　上</td>
              </tr>
            </tbody>
          </table>

          <table className={styles.riTable}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '50px' }}>年</th>
                <th style={{ width: '30px' }}>月</th>
                <th>免許・資格</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map(i => (
                <tr key={`lict${i}`}>
                  <td style={{ textAlign: 'center' }}>{formData[`licYear${i}`]}</td>
                  <td style={{ textAlign: 'center' }}>{formData[`licMonth${i}`]}</td>
                  <td>{formData[`licDetail${i}`] || '\u00A0'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className={styles.riTable}>
            <tbody>
              <tr style={{ background: '#f8fafc' }}>
                <th>志望動機・特技・好きな学科・アピールポイントなど</th>
              </tr>
              <tr>
                <td style={{ padding: '1rem', height: '140px', verticalAlign: 'top', lineHeight: '1.6' }}>
                  <div style={{marginBottom: '0.5rem'}}><strong>【志望動機】</strong></div>
                  <div style={{marginBottom: '1rem'}}>{formData.motivation}</div>
                  <div style={{marginBottom: '0.5rem'}}><strong>【自己PR】</strong></div>
                  <div>{formData.selfPR}</div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className={styles.pageNum}>1 / 1</div>
        </div>
      </div>
    </div>
  );
}
