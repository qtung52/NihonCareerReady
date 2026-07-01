import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, Cpu, WifiOff, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Groq API key from https://console.groq.com/keys
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
// Groq Compound model selection: 'groq/compound-mini' (recommended, 3x faster) or 'groq/compound' (complex tasks)
const GROQ_MODEL = 'groq/compound-mini';

const SYSTEM_PROMPT = `Bạn là AI hỗ trợ tích hợp trên nền tảng NihonBot - nền tảng hỗ trợ người Việt Nam làm việc tại Nhật Bản.
Nhiệm vụ của bạn:
- Giải đáp các thắc mắc về văn hóa ứng xử công sở Nhật Bản (Ojigi, Nomikai, HouRenSo, trang phục)
- Tư vấn quy trình Shukatsu xin việc tại Nhật
- Hỗ trợ viết CV Rirekisho chuẩn Nhật
- Chia sẻ kinh nghiệm sống và làm việc tại Nhật
Hãy trả lời ngắn gọn, thân thiện, chuyên nghiệp bằng tiếng Việt. Dùng emoji phù hợp.`;

const AI_RESPONSES_FALLBACK = [
  {
    keywords: ['cv', 'rirekisho', 'tạo cv', 'hồ sơ', 'viết cv'],
    response: "Để viết CV (Rirekisho) chuẩn Nhật, bạn cần lưu ý: 1. Sử dụng ảnh thẻ nghiêm túc (trang phục công sở). 2. Điền đầy đủ lịch sử học tập, làm việc từ cũ đến mới. 3. Phần Jiyuu PR hãy làm nổi bật thái độ nghiêm túc và mong muốn gắn bó lâu dài. Bạn có thể dùng tính năng 'Tạo CV' của NihonLink để tạo file PDF A4 chuẩn! 🌸"
  },
  {
    keywords: ['chào hỏi', 'ojigi', 'cúi chào', 'lễ nghi'],
    response: "Trong văn hóa Nhật Bản, có 3 kiểu cúi chào (Ojigi) phổ biến: 1. Eshaku (cúi 15°) khi chào xã giao. 2. Keirei (cúi 30°) cho khách hàng/cấp trên. 3. Saikeirei (cúi 45°) biểu thị sự biết ơn sâu sắc. Giữ lưng thẳng, không cúi gập cổ nhé! 🎌"
  },
  {
    keywords: ['nomikai', 'tiệc rượu', 'nhậu', 'uống rượu'],
    response: "Nomikai (tiệc rượu công sở) là nơi thắt chặt tình đồng nghiệp. Lưu ý: 1. Chỉ uống sau khi hô 'Kanpai'. 2. Rót bia cho sếp bằng cả hai tay. 3. Giữ miệng cốc thấp hơn sếp khi cụng ly! 🍻"
  },
  {
    keywords: ['phỏng vấn', 'shukatsu', 'xin việc'],
    response: "Khi phỏng vấn với doanh nghiệp Nhật: 1. Đến trước 10-15 phút. 2. Trang phục Suit tối màu phẳng phiu. 3. Gõ cửa 3 tiếng, nói 'Shitsurei shimasu' trước khi vào. 4. Nắm vững Hou-Ren-So để trả lời tình huống! 💼"
  },
  {
    keywords: ['hourenso', 'báo cáo', 'liên lạc'],
    response: "Hou-Ren-So (Hokoku - Báo cáo, Renraku - Liên lạc, Soudan - Thảo luận) là xương sống giao tiếp công sở Nhật. Khi gặp lỗi, dù nhỏ, KHÔNG được tự ý sửa đổi âm thầm. Phải báo cáo ngay cho sếp! 🏢"
  }
];

const PROMPT_TEMPLATES = [
  {
    id: 'cv_pr',
    category: 'cv',
    emoji: '📝',
    title: 'Viết Jiyuu PR',
    desc: 'Tạo phần PR bản thân ấn tượng trong CV Rirekisho.',
    prompt: 'Hãy hướng dẫn tôi viết phần Jiyuu PR (tự giới thiệu bản thân) trong CV Rirekisho chuẩn Nhật. Tôi là kỹ sư cầu nối, có 2 năm kinh nghiệm và muốn làm nổi bật kỹ năng giao tiếp.'
  },
  {
    id: 'cv_shibou',
    category: 'cv',
    emoji: '💼',
    title: 'Lý do ứng tuyển',
    desc: 'Cách viết Shibou Douki thuyết phục sếp Nhật.',
    prompt: 'Viết mẫu câu Shibou Douki (Lý do ứng tuyển) bằng tiếng Nhật cho vị trí lập trình viên Frontend tại một công ty công nghệ ở Tokyo.'
  },
  {
    id: 'interview_weakness',
    category: 'cv',
    emoji: '🤝',
    title: 'Hỏi về Điểm yếu',
    desc: 'Cách biến điểm yếu thành thế mạnh khi phỏng vấn.',
    prompt: 'Khi nhà tuyển dụng Nhật hỏi: "Điểm yếu của bạn là gì?", tôi nên trả lời thế nào để thể hiện sự cầu tiến và không bị mất điểm?'
  },
  {
    id: 'email_sick',
    category: 'communication',
    emoji: '✉️',
    title: 'Email xin nghỉ ốm',
    desc: 'Mẫu email lịch sự gửi cho sếp khi bị ốm.',
    prompt: 'Cho tôi xin mẫu email tiếng Nhật chuẩn Kính ngữ (Keigo) để báo cáo sếp nghỉ làm hôm nay do bị sốt đột xuất.'
  },
  {
    id: 'hourenso_error',
    category: 'communication',
    emoji: '⚠️',
    title: 'Báo cáo sự cố',
    desc: 'Nguyên tắc HouRenSo khi làm sai hoặc gặp lỗi.',
    prompt: 'Tôi vừa vô tình làm mất file cấu hình trên server của dự án. Hãy hướng dẫn tôi viết tin nhắn báo cáo sếp ngay lập tức theo chuẩn Hou-Ren-So.'
  },
  {
    id: 'nomikai_manner',
    category: 'communication',
    emoji: '🍻',
    title: 'Quy tắc tiệc rượu',
    desc: 'Lưu ý khi đi Nomikai với sếp và đối tác.',
    prompt: 'Hãy tóm tắt các quy tắc bất thành văn quan trọng nhất khi tham gia tiệc rượu Nomikai với sếp người Nhật (ví dụ chỗ ngồi, cách rót bia, cụng ly).'
  },
  {
    id: 'life_address',
    category: 'life',
    emoji: '🏢',
    title: 'Đăng ký địa chỉ',
    desc: 'Thủ tục đăng ký cư trú tại quận (Shiyakusho).',
    prompt: 'Tôi mới sang Nhật theo diện kỹ sư. Cần chuẩn bị những giấy tờ gì và làm thế nào để đăng ký địa chỉ thường trú tại ủy ban quận (City Hall)?'
  },
  {
    id: 'life_garbage',
    category: 'life',
    emoji: '🗑️',
    title: 'Phân loại rác',
    desc: 'Quy tắc đổ rác chuẩn không lo bị hàng xóm nhắc.',
    prompt: 'Giải thích cho tôi cách phân loại rác (cháy được, không cháy được, rác tài nguyên) và quy định vứt rác ở Nhật Bản.'
  },
  {
    id: 'life_rent',
    category: 'life',
    emoji: '🔑',
    title: 'Thuê nhà ở Nhật',
    desc: 'Các loại phí đầu vào cần biết khi thuê nhà.',
    prompt: 'Phí đầu vào khi thuê nhà ở Nhật gồm những gì (Shikikin, Reikin, phí trung gian)? Làm sao để tiết kiệm chi phí này?'
  }
];

export default function ChatBox({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState(GROQ_API_KEY ? 'groq' : 'disabled');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('all');

  const getFilteredTemplates = () => {
    if (activeTemplateTab === 'all') return PROMPT_TEMPLATES;
    return PROMPT_TEMPLATES.filter(t => t.category === activeTemplateTab);
  };

  const welcomeText = GROQ_API_KEY
    ? 'Chào bạn! Mình là AI Trợ Lý NihonBot, bạn có thể hỏi mình bất cứ điều gì về văn hóa doanh nghiệp Nhật, phỏng vấn, viết CV hay cuộc sống tại Nhật nhé! 🤖'
    : '⚠️ Trợ lý AI đang tạm khóa. Vui lòng cấu hình trong file .env để kích hoạt Trợ lý AI NihonBot.';

  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'bot', text: welcomeText, time: 'Vừa xong' }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamingMsgIdRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Call onSubmit/handleSendMessage handler manually, passing a dummy event if needed or trigger the submit handler
      const form = e.target.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleResetChat = () => {
    setAiMessages([
      { id: Date.now(), sender: 'bot', text: welcomeText, time: 'Vừa xong' }
    ]);
    setInputValue('');
  };

  useEffect(() => {
    const hasStreamingMsg = aiMessages.some(m => m.isStreaming);
    if (hasStreamingMsg) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isTyping, isOpen, isMinimized]);

  // --- Groq API streaming (for Vercel deploy) ---
  const callGroqStreaming = async (apiHistory, onChunk, onDone, onError) => {
    abortControllerRef.current = new AbortController();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...apiHistory
          ],
          compound_custom: {
            tools: {
              enabled_tools: ["web_search", "visit_website", "code_interpreter"]
            }
          },
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq ${res.status}: ${errText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE format: each line starts with 'data: '
        const lines = chunk.split('\n').filter(l => l.trim() !== '' && l.startsWith('data: '));
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            onDone(fullText);
            return;
          }
          try {
            const json = JSON.parse(line.slice(6));
            console.log("[Groq Compound Stream Chunk]:", json);
            const text = json.choices?.[0]?.delta?.content || '';
            if (text) {
              fullText += text;
              onChunk(fullText);
            }
          } catch { /* skip */ }
        }
      }
      onDone(fullText);
    } catch (error) {
      if (error.name === 'AbortError') return;
      onError(error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!GROQ_API_KEY) return;
    if (!inputValue.trim() || isTyping || isStreaming) return;

    const userText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: userText, time: timeStr };

    setInputValue('');

    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);

    const callFn = aiMode === 'groq' ? callGroqStreaming : null;

    if (callFn) {
      setIsStreaming(true);
      const botMsgId = Date.now() + 1;
      streamingMsgIdRef.current = botMsgId;

      // Xây dựng lịch sử trò chuyện để gửi cho AI hiểu context
      const apiHistory = newMessages.map(m => ({
        role: m.sender === 'bot' ? 'assistant' : 'user',
        content: m.text
      }));

      setAiMessages(prev => [...prev, {
        id: botMsgId,
        sender: 'bot',
        text: '⏳ Đang phân tích và xử lý...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true
      }]);

      callFn(
        apiHistory,
        (partialText) => {
          setAiMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: partialText } : m));
        },
        (finalText) => {
          setAiMessages(prev => prev.map(m => m.id === botMsgId ? {
            ...m,
            text: finalText || 'Xin lỗi, tôi không tạo được phản hồi. Thử lại nhé!',
            isStreaming: false
          } : m));
          streamingMsgIdRef.current = null;
          setIsStreaming(false);
        },
        (error) => {
          console.error('AI error details:', error);
          let errorMsg = '⚠️ Lỗi không xác định.';
          if (aiMode === 'groq') {
            if (error.message.includes('429')) {
              errorMsg = '⚠️ Lỗi 429: API Key của bạn đã bị giới hạn.';
            } else if (error.message.includes('401')) {
              errorMsg = '⚠️ Lỗi 401: Groq API Key không hợp lệ. Vui lòng kiểm tra lại.';
            } else {
              errorMsg = `⚠️ Lỗi Groq API: ${error.message}`;
            }
          } else {
            errorMsg = '⚠️ Lỗi kết nối Ollama.';
          }

          setAiMessages(prev => prev.map(m => m.id === botMsgId ? {
            ...m,
            text: errorMsg,
            isStreaming: false
          } : m));
          streamingMsgIdRef.current = null;
          setIsStreaming(false);
          if (error.message.includes('401')) {
            setAiMode('offline');
          }
        }
      );
    } else {
      // Fallback mock responses
      setIsTyping(true);
      setTimeout(() => {
        const query = userText.toLowerCase();
        let matchedResponse = AI_RESPONSES_FALLBACK.find(
          item => item.keywords.some(kw => query.includes(kw))
        )?.response;
        if (!matchedResponse) {
          matchedResponse = `[Chế độ giả lập] Cảm ơn câu hỏi về "${userText}". Hiện AI chưa được kết nối. Hãy thử hỏi về: CV, phỏng vấn, Nomikai, Ojigi, HouRenSo! 🌸`;
        }
        setAiMessages(prev => [...prev, {
          id: Date.now() + 1, sender: 'bot', text: matchedResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamingMsgIdRef.current) {
      setAiMessages(prev => prev.map(m => m.id === streamingMsgIdRef.current ? {
        ...m,
        text: m.text + ' [dừng]',
        isStreaming: false
      } : m));
      streamingMsgIdRef.current = null;
    }
    setIsStreaming(false);
  };

  const getMessages = () => {
    return aiMessages;
  };

  const getPartnerName = () => {
    return GROQ_API_KEY ? 'Trợ Lý AI NihonBot' : 'Trợ lý AI (Đang tắt)';
  };

  const getPartnerAvatar = () => {
    return '🤖';
  };

  const getPartnerSubtitle = () => {
    return GROQ_API_KEY ? `${GROQ_MODEL} đang bật` : 'Chưa cấu hình API Key';
  };

  const getPartnerStatusColor = () => {
    return aiMode !== 'offline' ? '#2ecc71' : '#f39c12';
  };

  const getQuickChips = () => {
    return [
      { emoji: '📝', label: 'Viết CV', text: 'Cách viết CV Rirekisho chuẩn Nhật?' },
      { emoji: '🙇', label: 'Chào hỏi', text: 'Quy tắc cúi chào Ojigi trong văn phòng?' },
      { emoji: '🍻', label: 'Nomikai', text: 'Văn hóa tiệc rượu Nomikai ở Nhật?' },
      { emoji: '🏢', label: 'HouRenSo', text: 'Nguyên tắc Hou-Ren-So là gì?' },
      { emoji: '💼', label: 'Phỏng vấn', text: 'Cách chuẩn bị phỏng vấn Shukatsu?' },
      { emoji: '👔', label: 'Trang phục', text: 'Quy tắc trang phục công sở Nhật Bản?' },
      { emoji: '✉️', label: 'Email', text: 'Mẫu email tiếng Nhật xin nghỉ phép?' }
    ];
  };

  if (!currentUser) return null;

  return (
    <>
      <style>{`
        /* Launcher */
        .chat-launcher-modern {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--jp-blue) 0%, #1e457e 100%);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(15, 44, 89, 0.3);
          z-index: 9999;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-launcher-modern.active {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;
          animation: floatLauncher 4s ease-in-out infinite;
        }
        .chat-launcher-modern.inactive {
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
        }
        .chat-launcher-modern::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: inherit;
          z-index: -1;
          opacity: 0.4;
          animation: pulseGlow 2.5s infinite;
        }

        /* Chat Panel */
        .chat-panel-modern {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 410px;
          max-width: calc(100vw - 48px);
          height: 600px;
          max-height: calc(100vh - 100px);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 0 24px 70px rgba(15, 44, 89, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      height 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: calc(100% - 31px) calc(100% - 31px);
        }
        .chat-panel-modern.active {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;
        }
        .chat-panel-modern.inactive {
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
        }

        :root[data-theme="dark"] .chat-panel-modern {
          background: rgba(26, 29, 46, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .chat-panel-modern.minimized {
          height: 68px;
          border-radius: 16px;
        }

        /* Header */
        .chat-header-modern {
          padding: 1rem 1.4rem;
          background: linear-gradient(135deg, var(--jp-blue) 0%, #17345e 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        :root[data-theme="dark"] .chat-header-modern {
          background: linear-gradient(135deg, #162235 0%, #0c121e 100%);
        }

        /* Status dots */
        .status-dot-active {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #2ecc71;
          border: 2px solid white;
          box-shadow: 0 0 8px #2ecc71;
          animation: breathingStatus 2s infinite ease-in-out;
        }
        .status-dot-offline {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 6px #f39c12;
        }

        /* Messages container */
        .chat-body-modern {
          flex: 1;
          padding: 1.2rem;
          overflow-y: auto;
          background: linear-gradient(180deg, rgba(245, 247, 251, 0.4) 0%, rgba(255, 255, 255, 0.4) 100%);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        :root[data-theme="dark"] .chat-body-modern {
          background: linear-gradient(180deg, rgba(15, 17, 23, 0.4) 0%, rgba(26, 29, 46, 0.4) 100%);
        }

        /* Scrollbar styles */
        .chat-body-modern::-webkit-scrollbar,
        .template-list-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-body-modern::-webkit-scrollbar-track,
        .template-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-body-modern::-webkit-scrollbar-thumb,
        .template-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        :root[data-theme="dark"] .chat-body-modern::-webkit-scrollbar-thumb,
        :root[data-theme="dark"] .template-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Message bubble user */
        .msg-bubble-user {
          max-width: 100%;
          padding: 0.75rem 1.1rem;
          background: linear-gradient(135deg, var(--jp-blue) 0%, #1e457e 100%);
          color: white;
          font-size: 0.88rem;
          line-height: 1.5;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 4px 15px rgba(15, 44, 89, 0.15);
          animation: bubbleSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          word-break: break-word;
        }
        :root[data-theme="dark"] .msg-bubble-user {
          background: linear-gradient(135deg, #3572d4 0%, var(--jp-blue) 100%);
          box-shadow: 0 4px 15px rgba(79, 142, 247, 0.2);
        }

        /* Message bubble bot */
        .msg-bubble-bot {
          max-width: 100%;
          padding: 0.75rem 1.1rem;
          background: var(--jp-card-bg);
          color: var(--jp-text);
          font-size: 0.88rem;
          line-height: 1.5;
          border-radius: 20px 20px 20px 4px;
          border: 1px solid var(--jp-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          animation: bubbleSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          word-break: break-word;
        }
        :root[data-theme="dark"] .msg-bubble-bot {
          background: rgba(26, 29, 46, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Suggested Topic cards */
        .welcome-card-modern {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid var(--jp-border);
          border-radius: 14px;
          padding: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 0.25rem;
        }
        :root[data-theme="dark"] .welcome-card-modern {
          background: rgba(26, 29, 46, 0.4);
        }
        .welcome-card-modern:hover {
          border-color: var(--jp-blue);
          background: var(--jp-card-bg);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(15, 44, 89, 0.08);
        }

        /* Sparkles templates button */
        .btn-sparkles {
          width: 38px;
          height: 38px;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          border: 1px solid var(--jp-border);
          background: var(--jp-card-bg);
          color: var(--jp-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        :root[data-theme="dark"] .btn-sparkles {
          color: var(--jp-blue);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .btn-sparkles:hover {
          background: var(--jp-blue);
          color: white;
          transform: rotate(15deg) scale(1.05);
          box-shadow: 0 0 12px rgba(15, 44, 89, 0.2);
        }
        .btn-sparkles.active {
          background: var(--jp-blue);
          color: white;
          transform: rotate(45deg);
        }

        /* Template drawer panel */
        .template-drawer {
          position: absolute;
          bottom: 70px;
          left: 0;
          right: 0;
          top: 68px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-top: 1px solid var(--jp-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          animation: drawerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        :root[data-theme="dark"] .template-drawer {
          background: rgba(26, 29, 46, 0.94);
        }

        .template-header {
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid var(--jp-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .template-tabs-container {
          display: flex;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--jp-border);
          overflow-x: auto;
          white-space: nowrap;
        }
        .template-tabs-container::-webkit-scrollbar {
          display: none;
        }

        .template-tab {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 500;
          background: var(--jp-surface);
          color: var(--jp-text-muted);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .template-tab.active {
          background: var(--jp-blue);
          color: white;
        }

        .template-list-scroll {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .template-card-modern {
          background: var(--jp-card-bg);
          border: 1px solid var(--jp-border);
          border-radius: 12px;
          padding: 0.85rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          gap: 0.7rem;
          text-align: left;
          align-items: flex-start;
        }
        .template-card-modern:hover {
          transform: translateY(-2px);
          border-color: var(--jp-blue);
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
        }

        /* Animations */
        @keyframes floatLauncher {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(15, 44, 89, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(15, 44, 89, 0); }
          100% { box-shadow: 0 0 0 0 rgba(15, 44, 89, 0); }
        }

        @keyframes modalPop {
          0% { transform: scale(0.85) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes modalPopOut {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0.85) translateY(20px); opacity: 0; }
        }

        @keyframes drawerSlideUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }

        @keyframes bubbleSlideUp {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes breathingStatus {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #2ecc71; }
          50% { opacity: 0.6; box-shadow: 0 0 2px #2ecc71; }
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        @keyframes geminiPulse {
          0% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.2; transform: scale(0.9); }
        }

        .msg-bubble-bot.streaming > *:last-child::after {
          content: '';
          display: inline-block;
          width: 6.5px;
          height: 15px;
          background: linear-gradient(135deg, var(--jp-blue) 0%, #00d2ff 100%);
          margin-left: 6px;
          border-radius: 3px;
          vertical-align: middle;
          animation: geminiPulse 1.2s infinite ease-in-out;
          box-shadow: 0 0 8px rgba(0, 210, 255, 0.6);
        }

        .chat-textarea {
          flex: 1;
          padding: 0.65rem 1rem;
          border: 1px solid var(--jp-border);
          border-radius: 20px;
          font-size: 0.86rem;
          line-height: 1.4;
          outline: none;
          background: var(--jp-bg);
          color: var(--jp-text);
          resize: none;
          font-family: inherit;
          max-height: 120px;
          overflow-y: auto;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .chat-textarea:disabled {
          background: var(--jp-surface);
          cursor: not-allowed;
        }
        :root[data-theme="dark"] .chat-textarea {
          background: var(--jp-bg);
        }
      `}</style>

      {/* Launcher */}
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
        className={`chat-launcher-modern hover-scale ${isOpen ? 'inactive' : 'active'}`}
        title="Trò chuyện hỗ trợ AI"
      >
        <MessageSquare size={26} style={{ color: 'white' }} />
        {/* AI status dot */}
        <span className={aiMode !== 'offline' ? 'status-dot-active' : 'status-dot-offline'} style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '12px',
          height: '12px',
          border: '2px solid white',
          transition: 'background-color 0.3s'
        }} />
        {hasUnread && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: 'var(--jp-red)',
            border: '2px solid white'
          }} />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`chat-panel-modern ${isMinimized ? 'minimized' : ''} ${isOpen ? 'active' : 'inactive'}`}
      >
        {/* Header */}
        <div
          className="chat-header-modern"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.35rem' }}>{getPartnerAvatar()}</span>
              <span
                className={aiMode !== 'offline' ? 'status-dot-active' : 'status-dot-offline'}
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  border: '1.5px solid var(--jp-blue)',
                }}
              />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, lineHeight: 1.2, letterSpacing: '0.1px' }}>
                {getPartnerName()}
              </h4>
              <span style={{ fontSize: '0.68rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                {GROQ_API_KEY ? (
                  <><Cpu size={10} /> {GROQ_MODEL} đang bật</>
                ) : (
                  <><WifiOff size={10} /> Trợ lý AI đang tắt</>
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={handleResetChat}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.2rem' }}
              title="Làm mới cuộc trò chuyện"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.2rem' }}
            >
              {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
            </button>
            <button
              onClick={handleClose}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Templates Drawer overlaying the messages space */}
            {showTemplates && (
              <div
                className="template-drawer"
                style={{
                  bottom: aiMode !== 'offline' ? '112px' : '76px'
                }}
              >
                <div className="template-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={15} style={{ color: 'var(--jp-blue)' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--jp-text)' }}>Gợi ý câu hỏi mẫu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--jp-text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="template-tabs-container">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'cv', label: 'CV & Phỏng vấn' },
                    { id: 'communication', label: 'Giao tiếp' },
                    { id: 'life', label: 'Đời sống Nhật' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`template-tab ${activeTemplateTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTemplateTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="template-list-scroll">
                  {getFilteredTemplates().map(t => (
                    <div
                      key={t.id}
                      className="template-card-modern"
                      onClick={() => {
                        setInputValue(t.prompt);
                        setShowTemplates(false);
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{t.emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--jp-blue)', marginBottom: '0.15rem' }}>{t.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--jp-text-muted)', lineHeight: '1.3' }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Body */}
            <div className="chat-body-modern">
              {getMessages().map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '0.55rem'
                    }}
                  >
                    {!isUser && (
                      <div style={{
                        fontSize: '1.15rem',
                        width: '32px',
                        height: '32px',
                        aspectRatio: '1 / 1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--jp-card-bg)',
                        borderRadius: '50%',
                        border: '1px solid var(--jp-border)',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                      }}>
                        {getPartnerAvatar()}
                      </div>
                    )}
                    <div style={{ maxWidth: '80%' }}>
                      <div
                        className={isUser ? 'msg-bubble-user' : `msg-bubble-bot markdown-body ${msg.isStreaming ? 'streaming' : ''}`}
                      >
                        {isUser ? (
                          msg.text
                        ) : msg.text ? (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                          <p>&nbsp;</p>
                        )}
                      </div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.65rem',
                          color: 'var(--jp-text-muted)',
                          marginTop: '0.25rem',
                          textAlign: isUser ? 'right' : 'left',
                          padding: '0 0.35rem',
                          opacity: 0.85
                        }}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && !isStreaming && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{
                    fontSize: '1.15rem', width: '32px', height: '32px',
                    aspectRatio: '1 / 1', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--jp-card-bg)', borderRadius: '50%', border: '1px solid var(--jp-border)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                  }}>
                    {getPartnerAvatar()}
                  </div>
                  <div style={{
                    background: 'var(--jp-card-bg)',
                    padding: '0.6rem 1rem',
                    borderRadius: '20px 20px 20px 4px',
                    border: '1px solid var(--jp-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span key={i} style={{
                        width: '6px', height: '6px',
                        background: 'var(--jp-text-muted)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: `bounce 1.4s infinite ease-in-out both`,
                        animationDelay: `${delay}s`
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.8rem 1rem',
                background: 'var(--jp-card-bg)',
                borderTop: '1px solid var(--jp-border)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-end',
                position: 'relative',
                zIndex: 101
              }}
            >
              <span
                className={`btn-sparkles ${showTemplates ? 'active' : ''}`}
                onClick={() => GROQ_API_KEY && setShowTemplates(!showTemplates)}
                title={GROQ_API_KEY ? "Xem gợi ý câu hỏi mẫu" : "Trợ lý AI đang tắt"}
                style={{ 
                  marginBottom: '1px', 
                  opacity: GROQ_API_KEY ? 1 : 0.5, 
                  cursor: GROQ_API_KEY ? 'pointer' : 'not-allowed',
                  pointerEvents: GROQ_API_KEY ? 'auto' : 'none',
                  aspectRatio: '1 / 1',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Sparkles size={16} />
              </span>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!GROQ_API_KEY ? 'Trợ lý AI đang tắt (Thiếu API Key)...' : isStreaming ? 'AI đang soạn câu trả lời...' : 'Nhập câu hỏi tại đây...'}
                disabled={isStreaming || !GROQ_API_KEY}
                rows={1}
                className="chat-textarea"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--jp-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(15, 44, 89, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--jp-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  style={{
                    width: '36px',
                    height: '36px',
                    minHeight: 'unset',
                    minWidth: 'unset',
                    padding: 0,
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.25)',
                    marginBottom: '2px'
                  }}
                  title="Dừng tạo"
                >
                  <span style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px', display: 'block' }} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!GROQ_API_KEY}
                  style={{
                    width: '36px',
                    height: '36px',
                    minHeight: 'unset',
                    minWidth: 'unset',
                    padding: 0,
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    background: GROQ_API_KEY ? 'linear-gradient(135deg, var(--jp-red) 0%, #c0392b 100%)' : '#bdc3c7',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: GROQ_API_KEY ? 'pointer' : 'not-allowed',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    flexShrink: 0,
                    boxShadow: GROQ_API_KEY ? '0 4px 12px rgba(188, 0, 45, 0.25)' : 'none',
                    marginBottom: '2px',
                    opacity: GROQ_API_KEY ? 1 : 0.6
                  }}
                  className={GROQ_API_KEY ? "hover-scale" : ""}
                >
                  <Send size={15} style={{ color: 'white' }} />
                </button>
              )}
            </form>

            {/* Footer: Powered by */}
            {aiMode !== 'offline' && (
              <div style={{
                padding: '0.4rem 1rem',
                background: 'var(--jp-surface-raised)',
                borderTop: '1px solid var(--jp-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.62rem',
                color: 'var(--jp-text-muted)'
              }}>
                <Cpu size={10} />
                {aiMode === 'groq' ? `Powered by Groq (${GROQ_MODEL})` : 'Powered by Gemini API · gemini-1.5-flash'}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
