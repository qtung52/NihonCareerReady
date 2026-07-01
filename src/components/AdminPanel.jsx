import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, BookOpen, Award, CheckCircle, FileText, Trash2, Edit3, X, Upload, Users, Key, BarChart2, MessageSquare, LayoutTemplate, ChevronDown, ChevronUp, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { getSharedArray, setSharedArray } from '../lib/sharedStore';
import { MANNERS_DATA } from '../data/mannersData';
import CustomDropdown from './CustomDropdown';

export default function AdminPanel({ 
  currentUser,
  onUpdateProfile,
  dictionary, 
  onAddDictionary, 
  onUpdateDictionary,
  onDeleteDictionary,
  onViewProfile
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard

  const [usersList, setUsersList] = useState([]);
  const [threadsList, setThreadsList] = useState([]);
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [rolesList, setRolesList] = useState(['Học viên', 'Senpai', 'Admin']);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [roleLevels, setRoleLevels] = useState({ 'Học viên': 1, 'Senpai': 2, 'Admin': 3 });
  const [newRoleLevel, setNewRoleLevel] = useState(1);

  // Custom confirm dialog state and ref
  const resolveRef = useRef(null);
  const [confirmData, setConfirmData] = useState(null);

  const triggerConfirm = (options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmData({
        isOpen: true,
        isClosing: false,
        title: options.title || 'Xác nhận',
        message: options.message || '',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        type: options.type || 'warning',
      });
    });
  };

  const handleConfirmAction = () => {
    if (resolveRef.current) resolveRef.current(true);
    closeConfirmModal();
  };

  const handleCancelAction = () => {
    if (resolveRef.current) resolveRef.current(false);
    closeConfirmModal();
  };

  const closeConfirmModal = () => {
    setConfirmData(prev => prev ? { ...prev, isClosing: true } : null);
    setTimeout(() => {
      setConfirmData(null);
      resolveRef.current = null;
    }, 240);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      const users = await getSharedArray('users', []);
      const threads = await getSharedArray('threads', []);
      const roles = await getSharedArray('custom_roles', ['Học viên', 'Senpai', 'Admin']);
      const levels = await getSharedArray('role_levels', { 'Học viên': 1, 'Senpai': 2, 'Admin': 3 });
      if (!isMounted) return;
      setUsersList(users);
      setThreadsList(threads);
      setRolesList(roles);
      setRoleLevels(levels);
    };

    fetchAdminData();
    const interval = setInterval(fetchAdminData, 300000); // 5 minutes
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

  // Challenge Scenarios management state
  const [scenariosList, setScenariosList] = useState([]); // flat list from sharedStore
  const [editingScenarioId, setEditingScenarioId] = useState(null);
  const [scenCardId, setScenCardId] = useState('');
  const [scenSituation, setScenSituation] = useState('');
  const [scenOpt0, setScenOpt0] = useState('');
  const [scenOpt1, setScenOpt1] = useState('');
  const [scenOpt2, setScenOpt2] = useState('');
  const [scenCorrect, setScenCorrect] = useState(0);
  const [scenExplanation, setScenExplanation] = useState('');
  const [scenFilterCard, setScenFilterCard] = useState('all');

  useEffect(() => {
    let mounted = true;
    const loadScenarios = async () => {
      const saved = await getSharedArray('dict_scenarios', []);
      if (mounted) setScenariosList(saved);
    };
    loadScenarios();
    return () => { mounted = false; };
  }, []);

  const combinedScenarios = React.useMemo(() => {
    const builtIn = [];
    MANNERS_DATA.forEach(card => {
      if (Array.isArray(card.scenarios)) {
        card.scenarios.forEach((scen, idx) => {
          builtIn.push({
            id: `built-in-${card.id}-${idx}`,
            cardId: card.id,
            situation: scen.situation,
            options: scen.options,
            correctOption: scen.correctOption,
            explanation: scen.explanation,
            isBuiltIn: true
          });
        });
      }
    });

    let list = [...builtIn];
    scenariosList.forEach(custom => {
      if (custom.isDeleted) {
        list = list.filter(item => item.id !== custom.id);
      } else {
        const idx = list.findIndex(item => item.id === custom.id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...custom,
            isBuiltIn: false
          };
        } else {
          list.push({
            ...custom,
            isBuiltIn: false
          });
        }
      }
    });

    return list;
  }, [scenariosList]);

  const resetScenForm = () => {
    setEditingScenarioId(null);
    setScenCardId('');
    setScenSituation('');
    setScenOpt0('');
    setScenOpt1('');
    setScenOpt2('');
    setScenCorrect(0);
    setScenExplanation('');
  };

  const startEditScenario = (s) => {
    setEditingScenarioId(s.id);
    setScenCardId(s.cardId);
    setScenSituation(s.situation);
    setScenOpt0(s.options[0] || '');
    setScenOpt1(s.options[1] || '');
    setScenOpt2(s.options[2] || '');
    setScenCorrect(s.correctOption);
    setScenExplanation(s.explanation);
  };

  const handleScenSubmit = async (e) => {
    e.preventDefault();
    if (!scenCardId || !scenSituation || !scenOpt0 || !scenOpt1 || !scenOpt2) return;
    
    const newScen = {
      id: editingScenarioId !== null ? editingScenarioId : `scen-custom-${Date.now()}`,
      cardId: scenCardId,
      situation: scenSituation,
      options: [scenOpt0, scenOpt1, scenOpt2],
      correctOption: scenCorrect,
      explanation: scenExplanation
    };

    let updated;
    const isEditing = editingScenarioId !== null;
    const existsInDb = scenariosList.some(s => s.id === editingScenarioId);

    if (isEditing) {
      if (existsInDb) {
        updated = scenariosList.map(s => s.id === editingScenarioId ? newScen : s);
      } else {
        updated = [...scenariosList, newScen];
      }
      setNotification('Đã cập nhật câu hỏi thành công!');
    } else {
      updated = [...scenariosList, newScen];
      setNotification('Đã thêm câu hỏi mới thành công!');
    }

    await setSharedArray('dict_scenarios', updated);
    setScenariosList(updated);
    setTimeout(() => setNotification(''), 3000);
    resetScenForm();
  };

  const handleDeleteScenario = async (id) => {
    if (await triggerConfirm({
      title: 'Xóa câu hỏi?',
      message: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      let updated;
      if (id.startsWith('built-in-')) {
        const exists = scenariosList.some(s => s.id === id);
        if (exists) {
          updated = scenariosList.map(s => s.id === id ? { ...s, isDeleted: true } : s);
        } else {
          const cardId = MANNERS_DATA.find(c => id.startsWith(`built-in-${c.id}-`))?.id || '';
          updated = [...scenariosList, { id, cardId, isDeleted: true }];
        }
      } else {
        updated = scenariosList.filter(s => s.id !== id);
      }
      await setSharedArray('dict_scenarios', updated);
      setScenariosList(updated);
      setNotification('Đã xóa câu hỏi thành công!');
      setTimeout(() => setNotification(''), 3000);
      
      if (editingScenarioId === id) {
        resetScenForm();
      }
    }
  };


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

    const oldItem = dictionary.find(item => item.id === editingDictId) || {};
    const newItem = {
      id: editingDictId !== null ? editingDictId : `custom-dict-${Date.now()}`,
      category: dictCategory,
      titleJp: dictTitleJp,
      titleVi: dictTitleVi,
      frontDesc: dictFrontDesc,
      dos: dictDos.split('\n').filter(line => line.trim() !== ''),
      donts: dictDonts.split('\n').filter(line => line.trim() !== ''),
      scenarios: oldItem.scenarios || []
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

  const handleDeleteDictItem = async (id) => {
    if (await triggerConfirm({
      title: 'Xóa thẻ quy tắc?',
      message: 'Bạn có chắc chắn muốn xóa thẻ quy tắc này?',
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      onDeleteDictionary(id);
      setNotification('Đã xóa thẻ quy tắc thành công!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleDeleteRoleItem = async (id) => {
    if (await triggerConfirm({
      title: 'Xóa tình huống?',
      message: 'Bạn có chắc chắn muốn xóa tình huống này?',
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      onDeleteRoleplay(id);
      setNotification('Đã xóa tình huống thành công!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // User actions
  const handleDeleteUser = async (email) => {
    if (await triggerConfirm({
      title: 'Xóa tài khoản?',
      message: `Bạn có chắc chắn muốn xóa tài khoản ${email}? Hành động này không thể khôi phục.`,
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      const currentUsers = await getSharedArray('users', []);
      const filtered = currentUsers.filter(u => (u.email || '').trim().toLowerCase() !== email.trim().toLowerCase());
      await setSharedArray('users', filtered);
      setUsersList(filtered);
      setNotification(`Đã xóa tài khoản ${email} thành công.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleDeleteThread = async (id, title) => {
    if (await triggerConfirm({
      title: 'Xóa bài viết?',
      message: `Bạn có chắc chắn muốn xóa bài viết "${title}"? Tất cả bình luận liên quan cũng sẽ bị xóa.`,
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      const currentThreads = await getSharedArray('threads', []);
      const filtered = currentThreads.filter(t => t.id !== id);
      await setSharedArray('threads', filtered);
      setThreadsList(filtered);
      setNotification(`Đã xóa bài viết "${title}" thành công.`);
      setTimeout(() => setNotification(''), 3000);
      if (expandedThreadId === id) {
        setExpandedThreadId(null);
      }
    }
  };

  const handleDeleteReply = async (threadId, replyId) => {
    if (await triggerConfirm({
      title: 'Xóa bình luận?',
      message: 'Bạn có chắc chắn muốn xóa bình luận này?',
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      const currentThreads = await getSharedArray('threads', []);
      const updated = currentThreads.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            answers: (t.answers || []).filter(a => a.id !== replyId)
          };
        }
        return t;
      });
      await setSharedArray('threads', updated);
      setThreadsList(updated);
      setNotification('Đã xóa bình luận thành công.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    const cleanRoleName = newRoleInput.trim();
    if (!cleanRoleName) return;

    if (rolesList.map(r => r.toLowerCase()).includes(cleanRoleName.toLowerCase())) {
      alert("Vai trò này đã tồn tại!");
      return;
    }

    const updatedRoles = [...rolesList, cleanRoleName];
    await setSharedArray('custom_roles', updatedRoles);
    setRolesList(updatedRoles);

    // Save level
    const updatedLevels = { ...roleLevels, [cleanRoleName]: parseInt(newRoleLevel, 10) };
    await setSharedArray('role_levels', updatedLevels);
    setRoleLevels(updatedLevels);

    setNewRoleInput('');
    setNewRoleLevel(1); // Reset
    setNotification(`Đã tạo vai trò "${cleanRoleName}" với cấp quyền ${newRoleLevel} thành công.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDeleteRole = async (roleName) => {
    if (['Học viên', 'Senpai', 'Admin'].includes(roleName)) {
      alert("Không thể xóa các vai trò mặc định!");
      return;
    }

    if (await triggerConfirm({
      title: 'Xóa vai trò?',
      message: `Bạn có chắc chắn muốn xóa vai trò "${roleName}"? Người dùng đang mang vai trò này sẽ tự động chuyển về vai trò "Học viên".`,
      confirmText: 'Xóa',
      type: 'danger'
    })) {
      const updatedRoles = rolesList.filter(r => r !== roleName);
      await setSharedArray('custom_roles', updatedRoles);
      setRolesList(updatedRoles);

      // Clean up level
      const updatedLevels = { ...roleLevels };
      delete updatedLevels[roleName];
      await setSharedArray('role_levels', updatedLevels);
      setRoleLevels(updatedLevels);

      const currentUsers = await getSharedArray('users', []);
      const updatedUsers = currentUsers.map(u => {
        if (u.customRole === roleName) {
          return {
            ...u,
            customRole: 'Học viên',
            isAdmin: false,
            isSenpai: false
          };
        }
        return u;
      });
      await setSharedArray('users', updatedUsers);
      setUsersList(updatedUsers);

      setNotification(`Đã xóa vai trò "${roleName}" thành công.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleUpdateUserCustomRole = async (email, newRole) => {
    const targetLevel = roleLevels[newRole] || (newRole === 'Admin' ? 3 : newRole === 'Senpai' ? 2 : 1);
    if (await triggerConfirm({
      title: 'Thay đổi vai trò?',
      message: `Bạn có muốn thay đổi vai trò của ${email} thành "${newRole}"?`,
      confirmText: 'Thay đổi',
      type: 'warning'
    })) {
      const currentUsers = await getSharedArray('users', []);
      const updated = currentUsers.map(u => {
        if ((u.email || '').trim().toLowerCase() === email.trim().toLowerCase()) {
          return {
            ...u,
            customRole: newRole,
            isAdmin: targetLevel >= 3,
            isSenpai: targetLevel >= 2
          };
        }
        return u;
      });
      await setSharedArray('users', updated);
      setUsersList(updated);

      if (currentUser && currentUser.email.trim().toLowerCase() === email.trim().toLowerCase()) {
        onUpdateProfile({
          customRole: newRole,
          isAdmin: targetLevel >= 3,
          isSenpai: targetLevel >= 2
        });
      }

      setNotification(`Đã cập nhật vai trò của ${email} thành "${newRole}".`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleUpdateRoleLevel = async (roleName, newLevel) => {
    const parsedLevel = parseInt(newLevel, 10);
    const updatedLevels = { ...roleLevels, [roleName]: parsedLevel };
    await setSharedArray('role_levels', updatedLevels);
    setRoleLevels(updatedLevels);

    // Sync all users carrying this role
    const currentUsers = await getSharedArray('users', []);
    const updatedUsers = currentUsers.map(u => {
      const uRole = u.customRole || (u.isAdmin ? 'Admin' : u.isSenpai ? 'Senpai' : 'Học viên');
      if (uRole === roleName) {
        return {
          ...u,
          isSenpai: parsedLevel >= 2,
          isAdmin: parsedLevel >= 3
        };
      }
      return u;
    });
    await setSharedArray('users', updatedUsers);
    setUsersList(updatedUsers);

    // If current logged-in user is affected, update profile state instantly
    if (currentUser) {
      const curRole = currentUser.customRole || (currentUser.isAdmin ? 'Admin' : currentUser.isSenpai ? 'Senpai' : 'Học viên');
      if (curRole === roleName) {
        onUpdateProfile({
          isSenpai: parsedLevel >= 2,
          isAdmin: parsedLevel >= 3
        });
      }
    }

    setNotification(`Đã cập nhật cấp quyền của vai trò "${roleName}" thành công.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleResetUserPassword = async (email) => {
    if (await triggerConfirm({
      title: 'Reset mật khẩu?',
      message: `Bạn có muốn reset mật khẩu của tài khoản ${email} về mặc định "123456"?`,
      confirmText: 'Reset',
      type: 'warning'
    })) {
      const currentUsers = await getSharedArray('users', []);
      const updated = currentUsers.map(u => {
        if ((u.email || '').trim().toLowerCase() === email.trim().toLowerCase()) {
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
    setRolesList(await getSharedArray('custom_roles', ['Học viên', 'Senpai', 'Admin']));
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
        <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => switchTab('roles')}>
          <Key size={14} style={{ display: 'inline', marginRight: '5px' }} /> Thiết lập Vai trò ({rolesList.length})
        </button>
        <button className={`tab-btn ${activeTab === 'dict' ? 'active' : ''}`} onClick={() => switchTab('dict')}>
          <BookOpen size={14} style={{ display: 'inline', marginRight: '5px' }} /> Sổ tay văn hóa
        </button>
        <button className={`tab-btn ${activeTab === 'scenarios' ? 'active' : ''}`} onClick={() => switchTab('scenarios')}>
          <HelpCircle size={14} style={{ display: 'inline', marginRight: '5px' }} /> Câu hỏi thử thách ({combinedScenarios.length})
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
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2ecc71' }}>{dictionary.length}</div>
              <div style={{ color: 'var(--jp-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Nội dung bài học</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} /> Kiểm duyệt Góc Senpai ({threadsList.length} bài đăng)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '1.5rem' }}>
            Quản lý tập trung các bài viết thảo luận và bình luận của học viên. Admin có quyền xóa toàn bộ bài viết hoặc xóa từng bình luận đơn lẻ vi phạm quy tắc cộng đồng.
          </p>

          {threadsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--jp-text-muted)' }}>
              Chưa có bài đăng nào trên Góc Senpai.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--jp-border)', textAlign: 'left', background: 'var(--jp-blue-light)' }}>
                    <th style={{ padding: '0.75rem', width: '40%' }}>Thông tin bài đăng (Nhấp để xem chi tiết)</th>
                    <th style={{ padding: '0.75rem', width: '20%' }}>Người viết</th>
                    <th style={{ padding: '0.75rem', width: '15%' }}>Lượt tương tác</th>
                    <th style={{ padding: '0.75rem', width: '15%' }}>Thời gian đăng</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '10%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {threadsList.map((thread) => {
                    const isExpanded = expandedThreadId === thread.id;
                    const dateObj = new Date(thread.date);
                    const formattedDate = isNaN(dateObj) ? thread.date : dateObj.toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                    
                    return (
                      <React.Fragment key={thread.id}>
                        <tr 
                          style={{ 
                            borderBottom: '1px solid var(--jp-border)',
                            background: isExpanded ? 'rgba(15, 44, 89, 0.02)' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <span style={{ 
                                alignSelf: 'flex-start',
                                fontSize: '0.7rem', 
                                background: 'var(--jp-blue-light)', 
                                color: 'var(--jp-blue)', 
                                padding: '0.15rem 0.45rem', 
                                borderRadius: '10px',
                                fontWeight: 600
                              }}>
                                {thread.tagName || thread.tag}
                              </span>
                              <strong 
                                style={{ 
                                  color: 'var(--jp-blue)', 
                                  cursor: 'pointer',
                                  fontSize: '0.95rem'
                                }}
                                onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                              >
                                {thread.title}
                              </strong>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{thread.author}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--jp-text-muted)' }}>{thread.authorEmail}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--jp-text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Heart size={14} style={{ color: 'var(--jp-red)' }} /> {thread.likes?.length || 0}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <MessageCircle size={14} style={{ color: 'var(--jp-blue)' }} /> {thread.answers?.length || 0}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--jp-text-muted)', fontSize: '0.85rem' }}>
                            {formattedDate}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              <button
                                type="button"
                                className="btn"
                                onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  background: 'var(--jp-surface)',
                                  color: 'var(--jp-text)',
                                  border: '1px solid var(--jp-border)'
                                }}
                                title="Xem nội dung và bình luận"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Chi tiết
                              </button>
                              <button
                                type="button"
                                className="btn"
                                onClick={() => handleDeleteThread(thread.id, thread.title)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  background: 'rgba(232, 54, 93, 0.08)',
                                  color: 'var(--jp-red)',
                                  border: '1px solid rgba(232, 54, 93, 0.2)'
                                }}
                                title="Xóa bài viết"
                              >
                                <Trash2 size={14} /> Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr style={{ background: 'rgba(15, 44, 89, 0.01)' }}>
                            <td colSpan="5" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--jp-border)' }}>
                              {/* Main post content info */}
                              <div style={{ 
                                padding: '1rem', 
                                background: 'var(--jp-card-bg)', 
                                border: '1px solid var(--jp-border)', 
                                borderRadius: 'var(--jp-radius)',
                                marginBottom: '1.25rem'
                              }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--jp-blue)' }}>Nội dung bài viết:</strong>
                                <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--jp-text)' }}>{thread.content}</p>
                              </div>

                              {/* Answers (Replies) list */}
                              <div>
                                <h4 style={{ color: 'var(--jp-blue)', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <MessageCircle size={16} /> Danh sách bình luận ({thread.answers?.length || 0})
                                </h4>
                                {(!thread.answers || thread.answers.length === 0) ? (
                                  <p style={{ color: 'var(--jp-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '1rem' }}>
                                    Chưa có bình luận nào cho bài viết này.
                                  </p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1rem' }}>
                                    {thread.answers.map((answer) => {
                                      const ansDate = new Date(answer.date);
                                      const formattedAnsDate = isNaN(ansDate) ? answer.date : ansDate.toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      });
                                      
                                      return (
                                        <div 
                                          key={answer.id} 
                                          style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'flex-start',
                                            padding: '0.75rem 1rem', 
                                            background: 'var(--jp-card-bg)', 
                                            border: '1px solid var(--jp-border)', 
                                            borderRadius: '8px',
                                            gap: '1rem'
                                          }}
                                        >
                                          <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                              <strong style={{ fontSize: '0.85rem' }}>{answer.author}</strong>
                                              <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>({answer.authorEmail || 'Kouhai'})</span>
                                              <span style={{ 
                                                fontSize: '0.7rem', 
                                                background: 'var(--jp-surface)', 
                                                padding: '0.1rem 0.4rem', 
                                                borderRadius: '6px',
                                                color: 'var(--jp-text-muted)'
                                              }}>
                                                {answer.role || 'Học viên'}
                                              </span>
                                              <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginLeft: 'auto' }}>{formattedAnsDate}</span>
                                            </div>
                                            <p style={{ fontSize: '0.88rem', margin: 0, whiteSpace: 'pre-wrap' }}>{answer.content}</p>
                                          </div>
                                          <button
                                            type="button"
                                            className="btn"
                                            onClick={() => handleDeleteReply(thread.id, answer.id)}
                                            style={{
                                              padding: '0.25rem 0.5rem',
                                              fontSize: '0.7rem',
                                              background: 'rgba(232, 54, 93, 0.05)',
                                              color: 'var(--jp-red)',
                                              border: '1px solid rgba(232, 54, 93, 0.15)',
                                              alignSelf: 'center'
                                            }}
                                            title="Xóa bình luận này"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
            <div style={{ overflowX: 'auto', minHeight: '260px' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'var(--jp-blue-light)' }}>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--jp-border)' }}>Thông tin thành viên</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--jp-border)' }}>Mục tiêu nghề nghiệp</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--jp-border)' }}>Câu hỏi bảo mật</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--jp-border)' }}>Vai trò (Role)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--jp-border)' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, idx) => (
                    <tr key={user.email || idx}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--jp-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span 
                            style={{ 
                              fontSize: '1.5rem', 
                              width: '40px', 
                              height: '40px', 
                              aspectRatio: '1 / 1',
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              cursor: 'pointer', 
                              overflow: 'hidden' 
                            }}
                            onClick={() => onViewProfile && onViewProfile(user.email, user.name, user.careerGoal)}
                            title="Xem thông tin người dùng"
                          >
                            {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
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
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--jp-border)' }}>
                        <span style={{ fontSize: '0.85rem', background: 'var(--jp-blue-light)', color: 'var(--jp-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {user.careerGoal || 'Chưa thiết lập'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--jp-border)', fontSize: '0.85rem' }}>
                        {user.securityQuestion ? (
                          <div>
                            <span style={{ display: 'block', color: 'var(--jp-text-muted)' }}>Q: {user.securityQuestion}</span>
                            <span style={{ fontWeight: 600, color: '#27ae60' }}>A: {user.securityAnswer}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--jp-red)' }}>⚠️ Chưa thiết lập câu hỏi bảo mật</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--jp-border)' }}>
                        <CustomDropdown
                          options={rolesList}
                          value={user.customRole || (user.isAdmin ? 'Admin' : user.isSenpai ? 'Senpai' : 'Học viên')}
                          onChange={(val) => handleUpdateUserCustomRole(user.email, val)}
                          buttonStyle={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.8rem',
                            height: 'auto',
                            minHeight: 'unset',
                            borderRadius: '6px',
                            fontWeight: 'normal',
                            border: '1px solid var(--jp-border)'
                          }}
                          style={{ width: '130px' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--jp-border)', textAlign: 'center' }}>
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
      
      {activeTab === 'roles' && (
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} /> Thiết lập & Tạo Vai trò thành viên
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '1.5rem' }}>
            Quản lý các vai trò tùy chỉnh trên hệ thống. Bạn có thể thêm các vai trò mới (như Cố vấn, Trưởng nhóm học tập...) để gán cho các tài khoản thành viên.
          </p>

          <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
            {/* Left Column: Create Role Form */}
            <div style={{ background: 'var(--jp-soft-surface)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)' }}>
              <h4 style={{ color: 'var(--jp-blue)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Tạo vai trò mới</h4>
              <form onSubmit={handleCreateRole}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Tên vai trò mới</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ví dụ: Cố vấn chuyên môn, Leader..." 
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Cấp quyền hạn (Authority Level)</label>
                  <select
                    className="form-input"
                    value={newRoleLevel}
                    onChange={(e) => setNewRoleLevel(parseInt(e.target.value, 10))}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      border: '1px solid var(--jp-border)', 
                      background: 'var(--jp-surface)', 
                      color: 'var(--jp-text)',
                      outline: 'none'
                    }}
                  >
                    <option value={1}>Cấp 1 - Học viên (Quyền cơ bản)</option>
                    <option value={2}>Cấp 2 - Senpai (Viết bài & Kinh nghiệm tự khai)</option>
                    <option value={3}>Cấp 3 - Admin (Quản trị viên hệ thống)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={16} /> Thêm vai trò
                </button>
              </form>
            </div>

            {/* Right Column: List of Roles */}
            <div style={{ background: 'var(--jp-card-bg)', padding: '1.5rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)' }}>
              <h4 style={{ color: 'var(--jp-blue)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Danh sách vai trò hiện tại ({rolesList.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rolesList.map((role) => {
                  const isDefault = ['Học viên', 'Senpai', 'Admin'].includes(role);
                  const currentLevel = roleLevels[role] || (role === 'Admin' ? 3 : role === 'Senpai' ? 2 : 1);
                  return (
                    <div 
                      key={role} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 1rem', 
                        background: isDefault ? 'var(--jp-soft-surface)' : 'var(--jp-surface-raised)', 
                        border: '1px solid var(--jp-border)', 
                        borderRadius: '8px' 
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--jp-text)' }}>{role}</strong>
                        {isDefault && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', marginLeft: '0.5rem', background: 'var(--jp-border)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isDefault ? (
                          <span style={{ fontSize: '0.72rem', color: 'var(--jp-text-muted)', background: 'var(--jp-border)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                            Cấp {currentLevel} {currentLevel === 3 ? '(Admin)' : currentLevel === 2 ? '(Senpai)' : '(Học viên)'}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', fontWeight: 500 }}>Cấp:</span>
                            <select
                              value={currentLevel}
                              onChange={(e) => handleUpdateRoleLevel(role, e.target.value)}
                              style={{
                                padding: '0.15rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                border: '1px solid var(--jp-border)',
                                background: 'var(--jp-surface-raised)',
                                color: 'var(--jp-text)',
                                fontWeight: 600
                              }}
                            >
                              <option value={1}>1 (Học viên)</option>
                              <option value={2}>2 (Senpai)</option>
                              <option value={3}>3 (Admin)</option>
                            </select>
                          </div>
                        )}

                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--jp-red)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={`Xóa vai trò "${role}"`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dict' && (
        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Left Side: Creation/Update Forms */}
          <div className="admin-card">
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
                <CustomDropdown
                  options={[
                    { value: 'ojigi', label: 'Cúi chào (Ojigi)' },
                    { value: 'meishi', label: 'Danh thiếp (Meishi)' },
                    { value: 'seating', label: 'Ghế ngồi (Kamiza)' },
                    { value: 'dresscode', label: 'Trang phục (Dresscode)' },
                    { value: 'nomikai', label: 'Tiệc rượu (Nomikai)' },
                    { value: 'email_phone', label: 'Email & Điện thoại (Email & Phone)' },
                    { value: 'omiyage', label: 'Công tác & Quà cáp (Omiyage)' },
                    { value: 'workrules', label: 'Quy tắc làm việc (Work Rules)' }
                  ]}
                  value={dictCategory}
                  onChange={setDictCategory}
                />
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
          </div>

          {/* Right Side: Manage & Actions */}
          <div>
            <div className="admin-card" style={{ maxHeight: '780px', overflowY: 'auto' }}>
              <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Danh sách hiện tại</h3>
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
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
          {/* LEFT: Form */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--jp-blue)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} />
              {editingScenarioId ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>
            <form onSubmit={handleScenSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '0.35rem', display: 'block' }}>Thẻ flashcard *</label>
                <select
                  value={scenCardId}
                  onChange={e => setScenCardId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)', background: 'var(--jp-surface)', color: 'var(--jp-text)', fontSize: '0.9rem' }}
                >
                  <option value="">-- Chọn thẻ --</option>
                  {MANNERS_DATA.map(card => (
                    <option key={card.id} value={card.id}>{card.titleVi} ({card.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '0.35rem', display: 'block' }}>Tình huống (câu hỏi) *</label>
                <textarea
                  value={scenSituation}
                  onChange={e => setScenSituation(e.target.value)}
                  required
                  rows={3}
                  placeholder="Mô tả tình huống cho học viên..."
                  style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)', background: 'var(--jp-surface)', color: 'var(--jp-text)', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              {[0, 1, 2].map(idx => (
                <div key={idx}>
                  <label style={{ fontSize: '0.85rem', color: scenCorrect === idx ? '#2ecc71' : 'var(--jp-text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="scenCorrect" value={idx} checked={scenCorrect === idx} onChange={() => setScenCorrect(idx)} />
                    Đáp án {String.fromCharCode(65 + idx)} {scenCorrect === idx ? '✓ (Đúng)' : ''}
                  </label>
                  <input
                    type="text"
                    value={idx === 0 ? scenOpt0 : idx === 1 ? scenOpt1 : scenOpt2}
                    onChange={e => idx === 0 ? setScenOpt0(e.target.value) : idx === 1 ? setScenOpt1(e.target.value) : setScenOpt2(e.target.value)}
                    required
                    placeholder={`Nội dung đáp án ${String.fromCharCode(65 + idx)}...`}
                    style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--jp-radius)', border: `1px solid ${scenCorrect === idx ? '#2ecc71' : 'var(--jp-border)'}`, background: 'var(--jp-surface)', color: 'var(--jp-text)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--jp-text-muted)', marginBottom: '0.35rem', display: 'block' }}>Giải thích đáp án đúng</label>
                <textarea
                  value={scenExplanation}
                  onChange={e => setScenExplanation(e.target.value)}
                  rows={2}
                  placeholder="Giải thích tại sao đáp án đó đúng..."
                  style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)', background: 'var(--jp-surface)', color: 'var(--jp-text)', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="jp-btn jp-btn-primary" style={{ flex: 1 }}>
                  <Plus size={16} /> {editingScenarioId ? 'Lưu thay đổi' : 'Thêm câu hỏi'}
                </button>
                {editingScenarioId && (
                  <button type="button" onClick={resetScenForm} className="jp-btn" style={{ background: 'var(--jp-surface-raised)', color: 'var(--jp-text)' }}>
                    <X size={16} /> Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: List */}
          <div className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ color: 'var(--jp-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <FileText size={20} /> Danh sách câu hỏi ({combinedScenarios.filter(s => scenFilterCard === 'all' || s.cardId === scenFilterCard).length})
              </h3>
              <select
                value={scenFilterCard}
                onChange={e => setScenFilterCard(e.target.value)}
                style={{ padding: '0.4rem 0.7rem', borderRadius: 'var(--jp-radius)', border: '1px solid var(--jp-border)', background: 'var(--jp-surface)', color: 'var(--jp-text)', fontSize: '0.85rem' }}
              >
                <option value="all">Tất cả thẻ</option>
                {MANNERS_DATA.map(card => (
                  <option key={card.id} value={card.id}>{card.titleVi}</option>
                ))}
              </select>
            </div>
            {combinedScenarios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--jp-text-muted)' }}>
                <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>Chưa có câu hỏi nào.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '65vh', overflowY: 'auto' }}>
                {combinedScenarios
                  .filter(s => scenFilterCard === 'all' || s.cardId === scenFilterCard)
                  .map((s, i) => {
                    const card = MANNERS_DATA.find(c => c.id === s.cardId);
                    
                    // Determine badge
                    let badge = null;
                    if (s.id.startsWith('built-in-')) {
                      // Check if it's edited by looking for its presence in scenariosList
                      const isEdited = scenariosList.some(item => item.id === s.id && !item.isDeleted);
                      if (isEdited) {
                        badge = (
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', background: 'rgba(79, 142, 247, 0.1)', border: '1px solid rgba(79, 142, 247, 0.3)', color: 'var(--jp-blue)', marginLeft: '0.5rem', fontWeight: 600 }}>
                            Đã chỉnh sửa
                          </span>
                        );
                      } else {
                        badge = (
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', background: 'var(--jp-soft-surface)', border: '1px solid var(--jp-border)', color: 'var(--jp-text-muted)', marginLeft: '0.5rem', fontWeight: 500 }}>
                            Mặc định
                          </span>
                        );
                      }
                    } else {
                      badge = (
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71', marginLeft: '0.5rem', fontWeight: 600 }}>
                          Tùy chỉnh
                        </span>
                      );
                    }

                    return (
                      <div key={s.id} style={{ background: 'var(--jp-surface-raised)', border: '1px solid var(--jp-border)', borderRadius: 'var(--jp-radius)', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--jp-blue)', fontWeight: 600 }}>
                                {card ? card.titleVi : s.cardId}
                              </span>
                              {badge}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--jp-text)', marginBottom: '0.5rem' }}>
                              {s.situation}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--jp-text-muted)' }}>
                              {s.options.map((opt, oi) => (
                                <div key={oi} style={{ color: oi === s.correctOption ? '#2ecc71' : 'inherit' }}>
                                  {String.fromCharCode(65 + oi)}. {opt} {oi === s.correctOption ? '✓' : ''}
                                </div>
                              ))}
                            </div>
                            {s.explanation && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--jp-text-muted)', borderTop: '1px dashed var(--jp-border)', paddingTop: '0.25rem', fontStyle: 'italic' }}>
                                Giải thích: {s.explanation}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                            <button onClick={() => startEditScenario(s)} style={{ background: 'none', border: 'none', color: 'var(--jp-blue)', cursor: 'pointer' }} title="Sửa">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteScenario(s.id)} style={{ background: 'none', border: 'none', color: 'var(--jp-red)', cursor: 'pointer' }} title="Xóa">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal Portal */}
      {confirmData && confirmData.isOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: confirmData.isClosing ? 'fadeOut 0.2s ease-in forwards' : 'fadeIn 0.2s ease-out forwards'
          }}
          onClick={handleCancelAction}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes scaleDown { from { transform: scale(1); opacity: 1; } to { transform: scale(0.95); opacity: 0; } }
          `}</style>
          <div
            style={{
              width: '90%',
              maxWidth: '420px',
              background: 'var(--jp-card-bg, #ffffff)',
              borderRadius: '24px',
              padding: '2rem',
              color: 'var(--jp-text, #111424)',
              border: '1px solid var(--jp-border, #e5e5e5)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              textAlign: 'center',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.2)',
              animation: confirmData.isClosing ? 'scaleDown 0.2s ease-in forwards' : 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Type-based Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              background: confirmData.type === 'danger' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(241, 196, 15, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: confirmData.type === 'danger' ? 'var(--jp-red, #e74c3c)' : 'var(--jp-blue, #3498db)'
            }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                {confirmData.type === 'danger' ? '🗑️' : '⚠️'}
              </span>
            </div>

            {/* Content */}
            <div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--jp-text, #111424)',
                margin: '0 0 0.5rem 0'
              }}>
                {confirmData.title}
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--jp-text-muted, #777)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {confirmData.message}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleCancelAction}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--jp-border, #e5e5e5)',
                  background: 'none',
                  color: 'var(--jp-text, #333)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {confirmData.cancelText}
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: confirmData.type === 'danger'
                    ? 'linear-gradient(135deg, var(--jp-red, #e8365d) 0%, #c0392b 100%)'
                    : 'linear-gradient(135deg, var(--jp-blue, #3498db) 0%, #2980b9 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: confirmData.type === 'danger'
                    ? '0 4px 12px rgba(232, 54, 93, 0.2)'
                    : '0 4px 12px rgba(52, 152, 219, 0.2)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {confirmData.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
