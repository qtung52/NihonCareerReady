import { useState, useEffect } from 'react';
import { Plus, BookOpen, Award, CheckCircle, FileText, Trash2, Edit3, X, Upload, Users, Key, BarChart2, MessageSquare, LayoutTemplate } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';

export default function AdminPanel({ 
  currentUser,
  onUpdateProfile,
  dictionary, 
  roleplay, 
  onAddDictionary, 
  onUpdateDictionary,
  onDeleteDictionary,
  onAddRoleplay, 
  onUpdateRoleplay,
  onDeleteRoleplay,
  onViewProfile
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard

  const [usersList, setUsersList] = useState([]);
  const [threadsList, setThreadsList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      const users = await getSharedArray('users', []);
      const threads = await getSharedArray('threads', []);
      if (!isMounted) return;
      setUsersList(users);
      setThreadsList(threads);
    };

    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dict Form State
  const [editingDictId, setEditingDictId] = useState(null); // null means adding mode
  const [dictCategory, setDictCategory] = useState('ojigi');
  const [dictTitleJp, setDictTitleJp] = useState('');
  const [dictTitleVi, setDictTitleVi] = useState('');
  const [dictFrontDesc, setDictFrontDesc] = useState('');
  const [dictDos, setDictDos] = useState('');
  const [dictDonts, setDictDonts] = useState('');

  // Roleplay Form State
  const [editingRoleplayId, setEditingRoleplayId] = useState(null); // null means adding mode
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [optAText, setOptAText] = useState('');
  const [optBText, setOptBText] = useState('');
  const [optCText, setOptCText] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');
  const [optAExpl, setOptAExpl] = useState('');
  const [optBExpl, setOptBExpl] = useState('');
  const [optCExpl, setOptCExpl] = useState('');
  
  // Image states (supporting base64 file upload or URL)
  const [roleImageUrl, setRoleImageUrl] = useState('');

  const [notification, setNotification] = useState('');

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoleImageUrl(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const resetDictForm = () => {
    setEditingDictId(null);
    setDictCategory('ojigi');
    setDictTitleJp('');
    setDictTitleVi('');
    setDictFrontDesc('');
    setDictDos('');
    setDictDonts('');
  };

  const loadDictTemplate = () => {
    setEditingDictId(null);
    setDictCategory('meishi');
    setDictTitleJp('電話応対 (Denwa Outai)');
    setDictTitleVi('Nhận điện thoại công sở');
    setDictFrontDesc('Quy tắc trả lời điện thoại chuyên nghiệp khi đối tác/khách hàng gọi tới văn phòng.');
    setDictDos("Nhấc máy nhanh trước tiếng chuông thứ 3.\nNói lời chào tiêu chuẩn: 'Luôn cảm ơn quý khách đã ủng hộ'.\nGhi chép cẩn thận thông tin người gọi.");
    setDictDonts("Không để chuông reo quá 3 lần mà không xin lỗi vì sự chậm trễ.\nKhông cúp máy trước đối tác.");
  };

  const startEditDict = (item) => {
    setEditingDictId(item.id);
    setDictCategory(item.category);
    setDictTitleJp(item.titleJp);
    setDictTitleVi(item.titleVi);
    setDictFrontDesc(item.frontDesc || '');
    setDictDos((item.dos || []).join('\n'));
    setDictDonts((item.donts || []).join('\n'));
  };

  const loadRoleplayTemplate = () => {
    setRoleTitle("Chào hỏi đối tác khi đến thăm văn phòng");
    setRoleDesc("Đối tác của công ty vừa đến sảnh văn phòng và bạn là người đầu tiên nhìn thấy họ. Đối tác thông báo họ có cuộc hẹn trước với Giám đốc bộ phận lúc 10h. Hiện tại là 9h55. Bạn nên xử lý thế nào?");
    setOptAText("Bảo khách ngồi đợi ở sảnh rồi quay lại làm tiếp việc của mình mà không báo cáo cho ai.");
    setOptBText("Dẫn khách vào phòng chờ, mời nước bằng 2 tay và nhanh chóng thông báo cho Giám đốc bằng điện thoại nội bộ.");
    setOptCText("Yêu cầu khách tự đi thang máy lên tầng 3 tìm phòng làm việc của Giám đốc bộ phận.");
    setCorrectOpt("B");
    setOptAExpl("Để khách ngồi đợi một mình mà không thông báo cho người tiếp đón là thiếu tôn trọng khách hàng.");
    setOptBExpl("Đúng chuẩn văn hóa tiếp khách Nhật Bản (Omotenashi)! Khách được tiếp đón chu đáo và Giám đốc được thông báo kịp thời.");
    setOptCExpl("Tuyệt đối không để khách tự đi tìm phòng làm việc của lãnh đạo trừ khi có hướng dẫn đặc biệt.");
    setRoleImageUrl(''); // Empty by default
  };

  const handleAddDictSubmit = (e) => {
    e.preventDefault();
    if (!dictTitleJp || !dictTitleVi || !dictFrontDesc) return;

    const newItem = {
      id: editingDictId !== null ? editingDictId : `custom-dict-${Date.now()}`,
      category: dictCategory,
      titleJp: dictTitleJp,
      titleVi: dictTitleVi,
      frontDesc: dictFrontDesc,
      dos: dictDos.split('\n').filter(line => line.trim() !== ''),
      donts: dictDonts.split('\n').filter(line => line.trim() !== '')
    };

    if (editingDictId !== null) {
      onUpdateDictionary(newItem);
      setNotification('Đã cập nhật thẻ quy tắc thành công!');
    } else {
      onAddDictionary(newItem);
      setNotification('Đã thêm thẻ quy tắc mới thành công!');
    }
    
    setTimeout(() => setNotification(''), 3000);
    resetDictForm();
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleTitle || !roleDesc || !optAText || !optBText || !optCText) return;

    const scenarioData = {
      title: roleTitle,
      description: roleDesc,
      imageUrl: roleImageUrl,
      options: [
        {
          letter: "A",
          text: optAText,
          isCorrect: correctOpt === 'A',
          explanation: optAExpl || `Lựa chọn A ${correctOpt === 'A' ? 'là đáp án đúng' : 'chưa chính xác'} cho tình huống này.`
        },
        {
          letter: "B",
          text: optBText,
          isCorrect: correctOpt === 'B',
          explanation: optBExpl || `Lựa chọn B ${correctOpt === 'B' ? 'là đáp án đúng' : 'chưa chính xác'} cho tình huống này.`
        },
        {
          letter: "C",
          text: optCText,
          isCorrect: correctOpt === 'C',
          explanation: optCExpl || `Lựa chọn C ${correctOpt === 'C' ? 'là đáp án đúng' : 'chưa chính xác'} cho tình huống này.`
        }
      ]
    };

    if (editingRoleplayId !== null) {
      onUpdateRoleplay({
        ...scenarioData,
        id: editingRoleplayId
      });
      setNotification('Đã cập nhật tình huống trắc nghiệm thành công!');
      setEditingRoleplayId(null);
    } else {
      onAddRoleplay({
        ...scenarioData,
        id: `custom-role-${roleplay.length + 1}-${roleTitle.trim().toLowerCase().replace(/\s+/g, '-')}`
      });
      setNotification('Đã thêm tình huống trắc nghiệm mới thành công!');
    }

    setTimeout(() => setNotification(''), 3000);
    resetRoleForm();
  };

  const resetRoleForm = () => {
    setEditingRoleplayId(null);
    setRoleTitle('');
    setRoleDesc('');
    setOptAText('');
    setOptBText('');
    setOptCText('');
    setOptAExpl('');
    setOptBExpl('');
    setOptCExpl('');
    setCorrectOpt('A');
    setRoleImageUrl('');
  };

  const startEditRoleplay = (scenario) => {
    setEditingRoleplayId(scenario.id);
    setRoleTitle(scenario.title);
    setRoleDesc(scenario.description);
    setRoleImageUrl(scenario.imageUrl || '');
    
    const optA = scenario.options.find(o => o.letter === 'A') || {};
    const optB = scenario.options.find(o => o.letter === 'B') || {};
    const optC = scenario.options.find(o => o.letter === 'C') || {};
    
    setOptAText(optA.text || '');
    setOptBText(optB.text || '');
    setOptCText(optC.text || '');
    setOptAExpl(optA.explanation || '');
    setOptBExpl(optB.explanation || '');
    setOptCExpl(optC.explanation || '');
    
    const correct = scenario.options.find(o => o.isCorrect);
    setCorrectOpt(correct ? correct.letter : 'A');
  };

  const handleDeleteDictItem = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thẻ quy tắc này?')) {
      onDeleteDictionary(id);
      setNotification('Đã xóa thẻ quy tắc thành công!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleDeleteRoleItem = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tình huống này?')) {
      onDeleteRoleplay(id);
      setNotification('Đã xóa tình huống thành công!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // User actions
  const handleDeleteUser = async (email) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${email}? Hành động này không thể khôi phục.`)) {
      const currentUsers = await getSharedArray('users', []);
      const filtered = currentUsers.filter(u => u.email !== email);
      await setSharedArray('users', filtered);
      setUsersList(filtered);
      setNotification(`Đã xóa tài khoản ${email} thành công.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleUpdateUserRole = async (email, newRole) => {
    if (window.confirm(`Bạn có chắc muốn thay đổi quyền của ${email} thành ${newRole}?`)) {
      const currentUsers = await getSharedArray('users', []);
      const updated = currentUsers.map(u => {
        if (u.email === email) {
          return {
            ...u,
            isAdmin: newRole === 'admin',
            isSenpai: newRole === 'senpai' || newRole === 'admin'
          };
        }
        return u;
      });
      await setSharedArray('users', updated);
      setUsersList(updated);

      // Nếu đang tự đổi quyền của chính mình, update session ngay lập tức để Navbar đổi màu
      if (currentUser && currentUser.email === email) {
        onUpdateProfile({
          isAdmin: newRole === 'admin',
          isSenpai: newRole === 'senpai' || newRole === 'admin'
        });
      }

      setNotification(`Đã cập nhật quyền của ${email} thành ${newRole.toUpperCase()}.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleResetUserPassword = async (email) => {
    if (window.confirm(`Bạn có muốn reset mật khẩu của tài khoản ${email} về mặc định "123456"?`)) {
      const currentUsers = await getSharedArray('users', []);
      const updated = currentUsers.map(u => {
        if (u.email === email) {
          return { ...u, password: '123456' };
        }
        return u;
      });
      await setSharedArray('users', updated);
      setUsersList(updated);
      setNotification(`Mật khẩu của tài khoản ${email} đã reset về "123456".`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Refresh data list when switching tab
  const switchTab = async (tab) => {
    setActiveTab(tab);
    setUsersList(await getSharedArray('users', []));
    setThreadsList(await getSharedArray('threads', []));
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Hệ thống Quản Trị - Admin Control Panel</h2>
        <p className="section-subtitle">Tùy biến cẩm nang văn hóa bằng cách thêm, sửa, xóa quy tắc và tình huống thử thách.</p>
      </div>

      {notification && (
        <div style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.05)', padding: '1rem', borderRadius: 'var(--jp-radius)', fontSize: '0.9rem', marginBottom: '1.5rem', borderLeft: '4px solid #2ecc71', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      <div className="filter-tabs" style={{ justifyContent: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}>
          <BarChart2 size={14} style={{ display: 'inline', marginRight: '5px' }} /> Tổng quan
        </button>
        <button className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`} onClick={() => switchTab('community')}>
          <MessageSquare size={14} style={{ display: 'inline', marginRight: '5px' }} /> Quản lý Cộng đồng
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => switchTab('users')}>
          <Users size={14} style={{ display: 'inline', marginRight: '5px' }} /> Quản lý Tài khoản ({usersList.length})
        </button>
        <button className={`tab-btn ${activeTab === 'dict' ? 'active' : ''}`} onClick={() => switchTab('dict')}>
          <BookOpen size={14} style={{ display: 'inline', marginRight: '5px' }} /> Sổ tay văn hóa
        </button>
        <button className={`tab-btn ${activeTab === 'role' ? 'active' : ''}`} onClick={() => switchTab('role')}>
          <Award size={14} style={{ display: 'inline', marginRight: '5px' }} /> Tình huống
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} /> Tổng quan Hệ thống
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--jp-blue-light)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--jp-blue)' }}>{usersList.length}</div>
              <div style={{ color: 'var(--jp-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Người dùng</div>
            </div>
            <div style={{ background: 'var(--jp-soft-red)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--jp-red)' }}>{threadsList.length}</div>
              <div style={{ color: 'var(--jp-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Chủ đề Góc Senpai</div>
            </div>
            <div style={{ background: 'var(--jp-surface-raised)', border: '1px solid var(--jp-border)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--jp-text)' }}>
                {threadsList.reduce((acc, t) => acc + (t.answers?.length || 0), 0)}
              </div>
              <div style={{ color: 'var(--jp-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Bình luận Góc Senpai</div>
            </div>
            <div style={{ background: 'var(--jp-soft-surface)', border: '1px solid var(--jp-border)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2ecc71' }}>{dictionary.length + roleplay.length}</div>
              <div style={{ color: 'var(--jp-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Nội dung bài học</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} /> Quản lý các bài đăng cộng đồng
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '1rem' }}>Admin có thể trực tiếp xóa các bài đăng và bình luận trên Góc Senpai tại hệ thống trang chủ. Tính năng quản lý tập trung sẽ sớm được ra mắt.</p>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); /* Need a way to jump to community or just let user click Navbar */ alert("Vui lòng truy cập trang Góc Senpai để quản lý trực tiếp với vai trò Admin."); }} className="btn btn-primary" style={{ display: 'inline-block' }}>Đến trang Góc Senpai</a>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        // Tab Quản lý tài khoản
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Danh sách thành viên đăng ký hệ thống ({usersList.length})
          </h3>
          {usersList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--jp-text-muted)' }}>
              Chưa có thành viên nào đăng ký tài khoản.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--jp-border)', textAlign: 'left', background: 'var(--jp-blue-light)' }}>
                    <th style={{ padding: '0.75rem' }}>Thông tin thành viên</th>
                    <th style={{ padding: '0.75rem' }}>Mục tiêu nghề nghiệp</th>
                    <th style={{ padding: '0.75rem' }}>Câu hỏi bảo mật</th>
                    <th style={{ padding: '0.75rem' }}>Vai trò (Role)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, idx) => (
                    <tr key={user.email || idx} style={{ borderBottom: '1px solid var(--jp-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span 
                            style={{ fontSize: '1.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
                            onClick={() => onViewProfile && onViewProfile(user.email, user.name, user.careerGoal)}
                            title="Xem thông tin người dùng"
                          >
                            {user.avatar?.startsWith('data:image') ? (
                              <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              user.avatar || '🧑‍💻'
                            )}
                          </span>
                          <div>
                            <strong 
                              style={{ display: 'block', cursor: 'pointer', color: 'var(--jp-blue)', textDecoration: 'underline' }}
                              onClick={() => onViewProfile && onViewProfile(user.email, user.name, user.careerGoal)}
                              title="Xem thông tin người dùng"
                            >
                              {user.name}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)' }}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', background: 'var(--jp-blue-light)', color: 'var(--jp-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {user.careerGoal || 'Chưa thiết lập'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        {user.securityQuestion ? (
                          <div>
                            <span style={{ display: 'block', color: 'var(--jp-text-muted)' }}>Q: {user.securityQuestion}</span>
                            <span style={{ fontWeight: 600, color: '#27ae60' }}>A: {user.securityAnswer}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--jp-red)' }}>⚠️ Chưa thiết lập câu hỏi bảo mật</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select 
                          className="form-input" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }}
                          value={user.isAdmin ? 'admin' : user.isSenpai ? 'senpai' : 'student'}
                          onChange={(e) => handleUpdateUserRole(user.email, e.target.value)}
                        >
                          <option value="student">Học viên</option>
                          <option value="senpai">Senpai</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleResetUserPassword(user.email)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--jp-blue)', color: 'var(--jp-blue)', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Reset mật khẩu về 123456"
                          >
                            <Key size={12} /> Reset Pass
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--jp-red)', color: 'var(--jp-red)', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Xóa tài khoản này"
                          >
                            <Trash2 size={12} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {(activeTab === 'dict' || activeTab === 'role') && (
        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Left Side: Creation/Update Forms */}
          <div className="admin-card">
            {activeTab === 'dict' ? (
              <form onSubmit={handleAddDictSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.1rem' }}>
                    {editingDictId !== null ? 'Chỉnh sửa thẻ quy tắc' : 'Thêm quy tắc văn hóa (Flashcard) mới'}
                  </h3>
                  {editingDictId !== null ? (
                    <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--jp-red)' }} onClick={resetDictForm}>
                      <X size={12} /> Hủy sửa
                    </button>
                  ) : (
                    <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={loadDictTemplate}>
                      <FileText size={12} /> Tải mẫu nhanh
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select className="form-input" value={dictCategory} onChange={(e) => setDictCategory(e.target.value)}>
                    <option value="ojigi">Cúi chào (Ojigi)</option>
                    <option value="meishi">Danh thiếp & Giao tiếp (Meishi)</option>
                    <option value="seating">Ghế ngồi (Kamiza)</option>
                    <option value="dresscode">Trang phục</option>
                  </select>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên Tiếng Nhật (Kanji/Kana)</label>
                    <input type="text" className="form-input" value={dictTitleJp} onChange={(e) => setDictTitleJp(e.target.value)} placeholder="例: 名刺交換" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên Tiếng Việt</label>
                    <input type="text" className="form-input" value={dictTitleVi} onChange={(e) => setDictTitleVi(e.target.value)} placeholder="Ví dụ: Trao đổi danh thiếp" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả tóm tắt (Mặt trước card)</label>
                  <input type="text" className="form-input" value={dictFrontDesc} onChange={(e) => setDictFrontDesc(e.target.value)} placeholder="Ghi mô tả ngắn gọn..." required />
                </div>

                <div className="form-group">
                  <label className="form-label">Quy tắc NÊN LÀM (Ghi mỗi quy tắc một dòng)</label>
                  <textarea className="form-textarea" value={dictDos} onChange={(e) => setDictDos(e.target.value)} placeholder="Ví dụ:&#10;Dùng cả hai tay trao nhận&#10;Đưa danh thiếp thấp hơn đối tác..." required></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Quy tắc TRÁNH LÀM (Ghi mỗi quy tắc một dòng)</label>
                  <textarea className="form-textarea" value={dictDonts} onChange={(e) => setDictDonts(e.target.value)} placeholder="Ví dụ:&#10;Không dùng một tay&#10;Không cất ngay vào ví..." required></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={16} /> {editingDictId !== null ? 'Lưu thay đổi' : 'Thêm Thẻ Quy Tắc'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRoleSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ color: 'var(--jp-blue)', fontSize: '1.1rem' }}>
                    {editingRoleplayId !== null ? 'Chỉnh sửa tình huống' : 'Thêm tình huống trắc nghiệm mới'}
                  </h3>
                  {editingRoleplayId !== null ? (
                    <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--jp-red)' }} onClick={resetRoleForm}>
                      <X size={12} /> Hủy sửa
                  </button>
                  ) : (
                    <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={loadRoleplayTemplate}>
                      <FileText size={12} /> Tải mẫu nhanh
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tiêu đề tình huống</label>
                  <input type="text" className="form-input" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Ví dụ: Tình huống chào hỏi trong thang máy..." required />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả ngữ cảnh tình huống</label>
                  <textarea className="form-textarea" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} placeholder="Mô tả cụ thể chuyện gì xảy ra, ai đang làm gì..." required></textarea>
                </div>

                <div className="form-group admin-upload-zone" style={{ background: 'var(--jp-soft-red)', padding: '1rem', borderRadius: 'var(--jp-radius)', border: '1px dashed var(--jp-red)', marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--jp-red)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Upload size={14} /> Ảnh minh họa Tình huống (Tải từ máy tính)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}
                  />
                  
                  {roleImageUrl && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Ảnh đã chọn:</span>
                      <img 
                        src={roleImageUrl} 
                        alt="Xem trước minh họa" 
                        style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--jp-border)' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setRoleImageUrl('')}
                        style={{ display: 'block', margin: '0.25rem auto 0 auto', background: 'none', border: 'none', color: 'var(--jp-red)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Xóa ảnh này
                      </button>
                    </div>
                  )}
                </div>

                <div className="admin-options-panel" style={{ background: 'var(--jp-surface-raised)', padding: '1rem', borderRadius: 'var(--jp-radius)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--jp-blue)', marginBottom: '0.75rem', fontWeight: 700 }}>Thiết lập 3 Lựa chọn & Giải thích:</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Nội dung đáp án A</label>
                    <input type="text" className="form-input" value={optAText} onChange={(e) => setOptAText(e.target.value)} required />
                    <label className="form-label" style={{ fontWeight: 'normal', color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>Giải thích A (Tùy chọn)</label>
                    <input type="text" className="form-input" value={optAExpl} onChange={(e) => setOptAExpl(e.target.value)} placeholder="Nếu để trống sẽ sử dụng giải thích tự động" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nội dung đáp án B</label>
                    <input type="text" className="form-input" value={optBText} onChange={(e) => setOptBText(e.target.value)} required />
                    <label className="form-label" style={{ fontWeight: 'normal', color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>Giải thích B (Tùy chọn)</label>
                    <input type="text" className="form-input" value={optBExpl} onChange={(e) => setOptBExpl(e.target.value)} placeholder="Nếu để trống sẽ sử dụng giải thích tự động" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nội dung đáp án C</label>
                    <input type="text" className="form-input" value={optCText} onChange={(e) => setOptCText(e.target.value)} required />
                    <label className="form-label" style={{ fontWeight: 'normal', color: 'var(--jp-text-muted)', fontSize: '0.75rem' }}>Giải thích C (Tùy chọn)</label>
                    <input type="text" className="form-input" value={optCExpl} onChange={(e) => setOptCExpl(e.target.value)} placeholder="Nếu để trống sẽ sử dụng giải thích tự động" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Đáp án đúng nhất</label>
                    <select className="form-input" value={correctOpt} onChange={(e) => setCorrectOpt(e.target.value)}>
                      <option value="A">Đáp án A</option>
                      <option value="B">Đáp án B</option>
                      <option value="C">Đáp án C</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {editingRoleplayId !== null ? 'Cập nhật Tình huống' : 'Thêm Tình huống'}
                </button>
              </form>
            )}
          </div>

          {/* Right Side: Manage & Actions */}
          <div>
            <div className="admin-card" style={{ maxHeight: '780px', overflowY: 'auto' }}>
              <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Danh sách hiện tại</h3>
              {activeTab === 'dict' ? (
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--jp-border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Tiếng Việt</th>
                      <th style={{ padding: '0.5rem' }}>Danh mục</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dictionary.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--jp-border)' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <div><strong>{item.titleVi}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>{item.titleJp}</div>
                        </td>
                        <td style={{ padding: '0.5rem' }}><code>{item.category}</code></td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => startEditDict(item)}
                            style={{ background: 'none', border: 'none', color: 'var(--jp-blue)', cursor: 'pointer' }}
                            title="Sửa thẻ quy tắc"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDictItem(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--jp-red)', cursor: 'pointer' }}
                            title="Xóa thẻ quy tắc"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--jp-border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Tên tình huống</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleplay.map((scenario, idx) => (
                      <tr key={scenario.id || idx} style={{ borderBottom: '1px solid var(--jp-border)' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <strong>{scenario.title}</strong>
                          {scenario.imageUrl && <span style={{ fontSize: '0.65rem', color: '#27ae60', marginLeft: '5px', fontWeight: 'bold' }}>(Đã đính kèm ảnh)</span>}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => startEditRoleplay(scenario)}
                            style={{ background: 'none', border: 'none', color: 'var(--jp-blue)', cursor: 'pointer' }}
                            title="Sửa tình huống"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoleItem(scenario.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--jp-red)', cursor: 'pointer' }}
                            title="Xóa tình huống"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
