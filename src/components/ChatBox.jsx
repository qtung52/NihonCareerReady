import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, Cpu, WifiOff, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Copy, ThumbsUp, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState(GROQ_API_KEY ? 'groq' : 'disabled');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('all');
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [copyToast, setCopyToast] = useState(null);
  // Sync with website theme (watches document.documentElement[data-theme])
  const [chatTheme, setChatTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  );
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setChatTheme(el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const getFilteredTemplates = () => {
    if (activeTemplateTab === 'all') return PROMPT_TEMPLATES;
    return PROMPT_TEMPLATES.filter(t => t.category === activeTemplateTab);
  };

  const welcomeText = GROQ_API_KEY
    ? 'Xin chào! Mình là **NihonBot** 🌸 AI đồng hành trên hành trình chinh phục Nhật Bản của bạn.\n\nHỏi mình bất cứ điều gì về văn hóa công sở, viết CV Rirekisho, hay cuộc sống tại Nhật nhé!'
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
  const activeUtterancesRef = useRef([]);

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '0px';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
        if (scrollHeight > 150) {
          textareaRef.current.style.overflowY = 'auto';
        } else {
          textareaRef.current.style.overflowY = 'hidden';
        }
      }
    };
    adjustHeight();
    const timer = setTimeout(adjustHeight, 100);
    return () => clearTimeout(timer);
  }, [inputValue, isOpen, isMinimized]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.target.form;
      if (form) form.requestSubmit();
    }
  };

  const handleResetChat = () => {
    setAiMessages([
      { id: Date.now(), sender: 'bot', text: welcomeText, time: 'Vừa xong' }
    ]);
    setInputValue('');
    setLikedMessages(new Set());
  };

  useEffect(() => {
    const hasStreamingMsg = aiMessages.some(m => m.isStreaming);
    if (hasStreamingMsg) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isTyping, isOpen, isMinimized]);

  // --- Groq API streaming ---
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
        const lines = chunk.split('\n').filter(l => l.trim() !== '' && l.startsWith('data: '));
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            onDone(fullText);
            return;
          }
          try {
            const json = JSON.parse(line.slice(6));
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
    setIsMinimized(false);
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

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast('Đã sao chép!');
      setTimeout(() => setCopyToast(null), 2000);
    });
  };

  const handleSpeakMessage = (text) => {
    try {
      window.speechSynthesis.cancel();
      activeUtterancesRef.current = []; // Clear old references
      
      const cleanText = text.replace(/[*#`_~]/g, '').replace(/\[.*?\]/g, '');
      
      // Split text into Japanese segments and Non-Japanese segments
      const segments = cleanText.split(/([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uff66-\uff9f]+)/g);
      
      segments.forEach((seg) => {
        const trimmed = seg.trim();
        if (!trimmed) return;
        
        const jpChars = (trimmed.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uff66-\uff9f]/g) || []).length;
        const viAccents = (trimmed.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/ig) || []).length;
        const enWords = (trimmed.match(/\b(the|and|you|that|was|for|are|with|have|this|from|your|hello|interview|resume|company|japan|work|salary|nomikai|ojigi|boss|manager|english|japanese|vietnamese|cv|status|mode|api|key)\b/gi) || []).length;

        let lang = 'vi-VN';
        if (jpChars > 0) {
          lang = 'ja-JP';
        } else if (enWords > 0 && viAccents === 0) {
          lang = 'en-US';
        }
        
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        
        if (window.speechSynthesis.getVoices) {
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find(v => v.lang.startsWith(lang));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
        }
        
        utterance.rate = lang === 'ja-JP' ? 1.0 : 0.95;
        
        // Keep reference to prevent GC in iOS Safari
        utterance.onend = () => {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        };
        activeUtterancesRef.current.push(utterance);
        
        window.speechSynthesis.speak(utterance);
      });
    } catch (e) { /* skip */ }
  };

  const handleLikeMessage = (msgId) => {
    setLikedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const getPartnerName = () => {
    return GROQ_API_KEY ? 'NihonBot AI' : 'NihonBot (Đang tắt)';
  };

  const getPartnerAvatar = () => '🌸';

  if (!currentUser) return null;

  return (
    <>
      <style>{`
        .chat-launcher-modern {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 62px !important;
          height: 62px !important;
          min-height: unset !important;
          max-height: 62px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-launcher-modern.active {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;
          animation: fabFloat 4s ease-in-out infinite, fabPulseGlow 2.5s ease-in-out infinite;
        }
        .chat-launcher-modern.inactive {
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
        }
        @keyframes fabFloat {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1) translateY(-6px); }
        }
        @keyframes fabPulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5), 0 8px 32px rgba(124, 58, 237, 0.4); }
          50% { box-shadow: 0 0 0 14px rgba(124, 58, 237, 0), 0 8px 32px rgba(236, 72, 153, 0.5); }
        }

        /* ===== UNREAD BADGE ===== */
        .unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          border: 2px solid white;
          font-size: 0.6rem;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        /* ===== CHAT PANEL ===== */
        .chat-panel-modern {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 480px;
          max-width: calc(100vw - 32px);
          height: 640px;
          max-height: calc(100vh - 80px);
          border-radius: 24px;
          background: linear-gradient(180deg, #1a0a2e 0%, #12062a 100%);
          border: 1px solid rgba(124, 58, 237, 0.3);
          box-shadow:
            0 0 0 1px rgba(236, 72, 153, 0.1),
            0 32px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(124, 58, 237, 0.12);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition:
            transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            border-radius 0.4s ease,
            width 0.4s ease;
          transform-origin: calc(100% - 31px) calc(100% + 24px);
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
        .chat-panel-modern.minimized {
          height: 64px;
          width: 280px;
          border-radius: 32px;
          overflow: hidden;
        }
        .chat-panel-modern.minimized .chat-header-modern {
          height: 64px;
          padding: 0 1rem;
          border-bottom: none;
          border-radius: 32px;
          overflow: hidden;
        }
        .chat-panel-modern.minimized .sakura-petal { display: none; }
        .chat-panel-modern.minimized .header-subtitle { display: none; }
        .chat-panel-modern.minimized .avatar-glow {
          width: 32px;
          height: 32px;
          font-size: 1rem;
        }

        /* ===== SAKURA HEADER ===== */
        .chat-header-modern {
          padding: 1rem 1.2rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.35) 0%, rgba(236, 72, 153, 0.25) 100%);
          border-bottom: 1px solid rgba(124, 58, 237, 0.25);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* Sakura petals */
        .sakura-petal {
          position: absolute;
          top: -10px;
          font-size: 0.75rem;
          opacity: 0;
          pointer-events: none;
          animation: sakuraFall linear infinite;
        }
        .sakura-petal:nth-child(1) { left: 10%; animation-duration: 4s; animation-delay: 0s; }
        .sakura-petal:nth-child(2) { left: 25%; animation-duration: 5s; animation-delay: 0.8s; }
        .sakura-petal:nth-child(3) { left: 45%; animation-duration: 4.5s; animation-delay: 1.5s; }
        .sakura-petal:nth-child(4) { left: 65%; animation-duration: 3.8s; animation-delay: 0.4s; }
        .sakura-petal:nth-child(5) { left: 82%; animation-duration: 5.2s; animation-delay: 2s; }
        @keyframes sakuraFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.4; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }

        /* Avatar glow */
        .avatar-glow {
          width: 40px !important;
          height: 40px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(236, 72, 153, 0.4));
          border: 2px solid rgba(236, 72, 153, 0.5);
          box-shadow: 0 0 16px rgba(236, 72, 153, 0.6), 0 0 32px rgba(124, 58, 237, 0.3);
          animation: avatarPulse 3s ease-in-out infinite;
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(236, 72, 153, 0.6), 0 0 32px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 24px rgba(236, 72, 153, 0.9), 0 0 48px rgba(124, 58, 237, 0.5); }
        }

        /* Header button  */
        .header-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          width: 30px !important;
          height: 30px !important;
          min-height: unset !important;
          max-height: 30px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          padding: 0;
        }
        .header-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: white;
          border-color: rgba(236, 72, 153, 0.5);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
        }

        /* ===== MESSAGES BODY ===== */
        .chat-body-modern {
          flex: 1;
          padding: 1.5rem 1.4rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          background: transparent;
        }
        .chat-body-modern::-webkit-scrollbar { width: 4px; }
        .chat-body-modern::-webkit-scrollbar-track { background: transparent; }
        .chat-body-modern::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.3);
          border-radius: 10px;
        }

        /* ===== USER BUBBLE ===== */
        .msg-bubble-user {
          max-width: 85%;
          padding: 0.75rem 1.1rem;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
          font-size: 0.875rem;
          line-height: 1.55;
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35);
          animation: msgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          word-break: break-word;
        }

        /* ===== BOT BUBBLE (glass) ===== */
        .msg-bubble-bot {
          max-width: 92%;
          padding: 1rem 1.15rem;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          line-height: 1.7;
          border-radius: 4px 20px 20px 20px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-left: 2px solid rgba(236, 72, 153, 0.5);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.06);
          animation: msgIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          word-break: break-word;
        }
        @keyframes msgIn {
          0% { transform: translateY(12px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* ── Paragraphs ── */
        .msg-bubble-bot p {
          margin: 0 0 0.65rem 0;
          color: rgba(255, 255, 255, 0.88);
        }
        .msg-bubble-bot p:last-child { margin-bottom: 0; }

        /* ── Bold & italic ── */
        .msg-bubble-bot strong {
          color: #f0abfc;
          font-weight: 700;
          text-shadow: 0 0 12px rgba(240, 171, 252, 0.35);
        }
        .msg-bubble-bot em {
          color: #c4b5fd;
          font-style: italic;
        }

        /* ── Inline code ── */
        .msg-bubble-bot :not(pre) > code {
          background: rgba(124, 58, 237, 0.22);
          border: 1px solid rgba(124, 58, 237, 0.35);
          color: #f0abfc;
          padding: 1px 6px;
          border-radius: 5px;
          font-size: 0.8em;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          letter-spacing: 0.02em;
        }

        /* ── Code block ── */
        .msg-bubble-bot pre {
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(124, 58, 237, 0.35);
          border-left: 3px solid #7c3aed;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          overflow-x: auto;
          margin: 0.65rem 0;
          position: relative;
        }
        .msg-bubble-bot pre code {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.8em;
          padding: 0;
        }

        /* ── Headings ── */
        .msg-bubble-bot h1 {
          font-size: 1rem;
          font-weight: 800;
          color: white;
          background: linear-gradient(90deg, #e879f9, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0.9rem 0 0.4rem 0;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid rgba(167, 139, 250, 0.25);
          letter-spacing: -0.2px;
        }
        .msg-bubble-bot h2 {
          font-size: 0.93rem;
          font-weight: 700;
          color: #f0abfc;
          margin: 0.75rem 0 0.35rem 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .msg-bubble-bot h2::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, #ec4899, #7c3aed);
          border-radius: 2px;
          flex-shrink: 0;
        }
        .msg-bubble-bot h3 {
          font-size: 0.88rem;
          font-weight: 600;
          color: #c4b5fd;
          margin: 0.6rem 0 0.25rem 0;
        }

        /* ── Lists ── */
        .msg-bubble-bot ul {
          list-style: none;
          padding-left: 0;
          margin: 0.45rem 0;
        }
        .msg-bubble-bot ul li {
          position: relative;
          padding-left: 1.3rem;
          margin-bottom: 0.35rem;
          color: rgba(255, 255, 255, 0.85);
        }
        .msg-bubble-bot ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #7c3aed);
          box-shadow: 0 0 6px rgba(236, 72, 153, 0.5);
        }
        .msg-bubble-bot ol {
          list-style: none;
          padding-left: 0;
          margin: 0.45rem 0;
          counter-reset: bot-ol;
        }
        .msg-bubble-bot ol li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.35rem;
          color: rgba(255, 255, 255, 0.85);
          counter-increment: bot-ol;
        }
        .msg-bubble-bot ol li::before {
          content: counter(bot-ol);
          position: absolute;
          left: 0;
          top: 0;
          width: 1.25rem;
          height: 1.25rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.5), rgba(236, 72, 153, 0.4));
          border: 1px solid rgba(236, 72, 153, 0.35);
          border-radius: 50%;
          font-size: 0.65em;
          font-weight: 700;
          color: #f0abfc;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        /* ── Blockquote ── */
        .msg-bubble-bot blockquote {
          margin: 0.6rem 0;
          padding: 0.5rem 0.9rem;
          border-left: 3px solid #ec4899;
          background: rgba(236, 72, 153, 0.08);
          border-radius: 0 8px 8px 0;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }

        /* ── Horizontal rule ── */
        .msg-bubble-bot hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4), transparent);
          margin: 0.8rem 0;
        }

        /* ── Table ── */
        .msg-bubble-bot table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.65rem 0;
          font-size: 0.82em;
        }
        .msg-bubble-bot th {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(236, 72, 153, 0.25));
          color: #f0abfc;
          font-weight: 700;
          padding: 0.4rem 0.65rem;
          border: 1px solid rgba(124, 58, 237, 0.25);
          text-align: left;
        }
        .msg-bubble-bot td {
          padding: 0.35rem 0.65rem;
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.8);
        }
        .msg-bubble-bot tr:nth-child(even) td {
          background: rgba(255, 255, 255, 0.03);
        }

        /* Streaming cursor */
        .msg-bubble-bot.streaming > *:last-child::after {
          content: '';
          display: inline-block;
          width: 6px;
          height: 14px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          margin-left: 5px;
          border-radius: 2px;
          vertical-align: middle;
          animation: cursorBlink 1s ease-in-out infinite;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* ===== MSG HOVER ACTIONS ===== */
        .msg-actions-row {
          display: flex;
          gap: 4px;
          margin-top: 4px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .msg-wrapper:hover .msg-actions-row {
          opacity: 1;
          pointer-events: auto;
        }
        .msg-action-btn {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: all 0.2s;
        }
        .msg-action-btn:hover {
          background: rgba(124, 58, 237, 0.3);
          color: white;
          border-color: rgba(124, 58, 237, 0.5);
        }
        .msg-action-btn.liked {
          background: rgba(236, 72, 153, 0.25);
          color: #f9a8d4;
          border-color: rgba(236, 72, 153, 0.4);
        }

        /* ===== COPY TOAST ===== */
        .copy-toast {
          position: absolute;
          bottom: 85px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(124, 58, 237, 0.9);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(236, 72, 153, 0.4);
          z-index: 200;
          animation: toastIn 0.3s ease;
          white-space: nowrap;
        }
        @keyframes toastIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(6px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ===== TYPING INDICATOR ===== */
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          display: inline-block;
          animation: dotBounce 1.4s infinite ease-in-out both;
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* ===== STATUS DOTS ===== */
        .status-dot-active {
          width: 8px; height: 8px;
          border-radius: 50%;
          background-color: #4ade80;
          border: 1.5px solid #1a0a2e;
          box-shadow: 0 0 8px #4ade80;
          animation: breathe 2s infinite ease-in-out;
        }
        .status-dot-active {
          width: 8px !important;
          height: 8px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          border-radius: 50%;
          background-color: #4ade80;
          border: 1.5px solid #1a0a2e;
          box-shadow: 0 0 8px #4ade80;
          animation: breathe 2s infinite ease-in-out;
        }
        .status-dot-offline {
          width: 8px !important;
          height: 8px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          border-radius: 50%;
          background-color: #fb923c;
          border: 1.5px solid #1a0a2e;
          box-shadow: 0 0 6px #fb923c;
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 8px #4ade80; opacity: 1; }
          50% { box-shadow: 0 0 3px #4ade80; opacity: 0.6; }
        }

        /* ===== TEMPLATE DRAWER ===== */
        .template-drawer {
          position: absolute;
          bottom: 92px;
          left: 0;
          right: 0;
          top: 73px;
          background: rgba(26, 10, 46, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(124, 58, 237, 0.25);
          display: flex;
          flex-direction: column;
          z-index: 100;
          animation: drawerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes drawerSlideUp {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .template-header {
          padding: 0.8rem 1.1rem;
          border-bottom: 1px solid rgba(124, 58, 237, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .template-tabs-container {
          display: flex;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-bottom: 1px solid rgba(124, 58, 237, 0.15);
          overflow-x: auto;
          white-space: nowrap;
        }
        .template-tabs-container::-webkit-scrollbar { display: none; }
        .template-tab {
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.2s;
        }
        .template-tab.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.6), rgba(236, 72, 153, 0.5));
          color: white;
          border-color: rgba(236, 72, 153, 0.4);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.3);
        }
        .template-list-scroll {
          flex: 1;
          padding: 0.8rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .template-card-modern {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          gap: 0.65rem;
          text-align: left;
          align-items: flex-start;
        }
        .template-card-modern:hover {
          background: rgba(124, 58, 237, 0.15);
          border-color: rgba(124, 58, 237, 0.4);
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.2);
          transform: translateY(-1px);
        }

        /* Template text classes (dark mode defaults) */
        .template-sparkle-icon { color: #e879f9; }
        .template-header-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }
        .template-close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
        }
        .template-close-btn:hover { color: rgba(255, 255, 255, 0.8); }
        .template-card-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #e879f9;
          margin-bottom: 0.15rem;
        }
        .template-card-desc {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.35;
        }

        /* Msg timestamp class */
        .msg-timestamp {
          display: block;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 4px;
          padding: 0 2px;
        }

        /* ===== INPUT AREA ===== */
        .chat-input-form {
          margin: 0 1rem 1rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 16px;
          padding: 0.6rem 0.85rem;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 101;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input-form:focus-within {
          border-color: rgba(236, 72, 153, 0.55);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
        }
        textarea.chat-textarea {
          flex: none;
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          line-height: 1.5;
          resize: none;
          font-family: inherit;
          max-height: 150px;
          overflow-y: hidden;
          padding: 0.35rem 0 !important;
          min-height: unset !important;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        textarea.chat-textarea::placeholder { color: rgba(255, 255, 255, 0.3); }
        textarea.chat-textarea:disabled { cursor: not-allowed; }

        .bot-avatar {
          width: 32px !important;
          height: 32px !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          border-radius: 50% !important;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.3));
          border: 1px solid rgba(236, 72, 153, 0.3);
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.25);
          font-size: 1rem;
        }

        .send-btn {
          width: 30px !important;
          height: 30px !important;
          min-height: unset !important;
          max-height: 30px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 0 16px rgba(236, 72, 153, 0.6);
        }
        .send-btn:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; }

        .stop-btn {
          width: 30px !important;
          height: 30px !important;
          min-height: unset !important;
          max-height: 30px !important;
          border-radius: 50% !important;
          background: rgba(239, 68, 68, 0.8);
          border: 1px solid rgba(239, 68, 68, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          transition: all 0.2s;
        }
        .stop-btn:hover { background: rgb(239, 68, 68); transform: scale(1.05); }

        /* Sparkles btn */
        .btn-sparkles {
          width: 28px !important;
          height: 28px !important;
          min-height: unset !important;
          max-height: 28px !important;
          border-radius: 50% !important;
          aspect-ratio: 1 / 1 !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          aspect-ratio: 1 / 1;
          flex-shrink: 0;
          padding: 0;
        }
        .btn-sparkles.active, .btn-sparkles:hover {
          background: rgba(124, 58, 237, 0.3);
          border-color: rgba(124, 58, 237, 0.5);
          color: #e879f9;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
        }

        /* Model tag */
        .model-tag {
          font-size: 0.62rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 2px 7px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        /* ========================================
           LIGHT THEME
        ======================================== */
        [data-chat-theme='light'].chat-panel-modern {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
          border-color: rgba(15, 44, 89, 0.15);
          box-shadow:
            0 0 0 1px rgba(15, 44, 89, 0.06),
            0 24px 60px rgba(15, 44, 89, 0.14),
            0 0 40px rgba(15, 44, 89, 0.04);
        }
        [data-chat-theme='light'] .chat-header-modern {
          background: linear-gradient(135deg, #0f2c59 0%, #1a4080 100%);
          border-bottom-color: rgba(15, 44, 89, 0.15);
        }
        [data-chat-theme='light'] .chat-body-modern::-webkit-scrollbar-thumb {
          background: rgba(15, 44, 89, 0.2);
        }

        /* Light: messages body bg */
        [data-chat-theme='light'] .chat-body-modern {
          background: transparent;
        }

        /* Light: user bubble — keep crimson red */
        [data-chat-theme='light'] .msg-bubble-user {
          background: linear-gradient(135deg, #bc002d 0%, #e8365d 100%);
          box-shadow: 0 4px 16px rgba(188, 0, 45, 0.25);
        }

        /* Light: AI bubble — white card */
        [data-chat-theme='light'] .msg-bubble-bot {
          background: #ffffff;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: 1px solid #e2e8f0;
          border-left: 2px solid #bc002d;
          box-shadow: 0 2px 12px rgba(15, 44, 89, 0.08);
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot p {
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot strong {
          color: #bc002d;
          text-shadow: none;
        }
        [data-chat-theme='light'] .msg-bubble-bot em {
          color: #0f2c59;
        }
        [data-chat-theme='light'] .msg-bubble-bot :not(pre) > code {
          background: rgba(188, 0, 45, 0.07);
          border-color: rgba(188, 0, 45, 0.2);
          color: #bc002d;
        }
        [data-chat-theme='light'] .msg-bubble-bot pre {
          background: #f1f5f9;
          border-color: #e2e8f0;
          border-left-color: #0f2c59;
        }
        [data-chat-theme='light'] .msg-bubble-bot pre code {
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot h1 {
          background: linear-gradient(90deg, #bc002d, #0f2c59);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          border-bottom-color: rgba(15, 44, 89, 0.15);
        }
        [data-chat-theme='light'] .msg-bubble-bot h2 {
          color: #0f2c59;
        }
        [data-chat-theme='light'] .msg-bubble-bot h2::before {
          background: linear-gradient(180deg, #bc002d, #0f2c59);
        }
        [data-chat-theme='light'] .msg-bubble-bot h3 {
          color: #0f2c59;
        }
        [data-chat-theme='light'] .msg-bubble-bot ul li {
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot ul li::before {
          background: linear-gradient(135deg, #bc002d, #0f2c59);
          box-shadow: 0 0 4px rgba(188, 0, 45, 0.3);
        }
        [data-chat-theme='light'] .msg-bubble-bot ol li {
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot ol li::before {
          background: linear-gradient(135deg, rgba(15, 44, 89, 0.15), rgba(188, 0, 45, 0.12));
          border-color: rgba(188, 0, 45, 0.3);
          color: #bc002d;
        }
        [data-chat-theme='light'] .msg-bubble-bot blockquote {
          border-left-color: #bc002d;
          background: rgba(188, 0, 45, 0.05);
          color: #4a5568;
        }
        [data-chat-theme='light'] .msg-bubble-bot hr {
          background: linear-gradient(90deg, transparent, rgba(15, 44, 89, 0.2), transparent);
        }
        [data-chat-theme='light'] .msg-bubble-bot th {
          background: linear-gradient(135deg, rgba(15, 44, 89, 0.12), rgba(188, 0, 45, 0.08));
          color: #0f2c59;
          border-color: rgba(15, 44, 89, 0.15);
        }
        [data-chat-theme='light'] .msg-bubble-bot td {
          border-color: #e2e8f0;
          color: #2c3e50;
        }
        [data-chat-theme='light'] .msg-bubble-bot tr:nth-child(even) td {
          background: rgba(15, 44, 89, 0.03);
        }

        /* Light: timestamp */
        [data-chat-theme='light'] .msg-wrapper [style*='rgba(255,255,255,0.3)'] {
          color: rgba(15, 44, 89, 0.4) !important;
        }

        /* Light: action buttons */
        [data-chat-theme='light'] .msg-action-btn {
          background: rgba(15, 44, 89, 0.05);
          border-color: rgba(15, 44, 89, 0.12);
          color: #4a5568;
        }
        [data-chat-theme='light'] .msg-action-btn:hover {
          background: rgba(15, 44, 89, 0.1);
          color: #0f2c59;
          border-color: rgba(15, 44, 89, 0.3);
        }
        [data-chat-theme='light'] .msg-action-btn.liked {
          background: rgba(188, 0, 45, 0.08);
          color: #bc002d;
          border-color: rgba(188, 0, 45, 0.25);
        }

        /* Light: bot avatar */
        [data-chat-theme='light'] .msg-wrapper .bot-avatar {
          background: linear-gradient(135deg, rgba(15, 44, 89, 0.1), rgba(188, 0, 45, 0.08));
          border-color: rgba(188, 0, 45, 0.25);
          box-shadow: 0 0 8px rgba(188, 0, 45, 0.15);
        }

        /* Light: typing indicator */
        [data-chat-theme='light'] .typing-dot {
          background: linear-gradient(135deg, #0f2c59, #bc002d);
        }
        [data-chat-theme='light'] .typing-bubble {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 2px 8px rgba(15, 44, 89, 0.08);
        }

        /* Light: template drawer */
        [data-chat-theme='light'] .template-drawer {
          background: #f8f9ff;
          border-top-color: rgba(15, 44, 89, 0.12);
        }
        [data-chat-theme='light'] .template-header {
          border-bottom-color: rgba(15, 44, 89, 0.1);
        }
        [data-chat-theme='light'] .template-sparkle-icon { color: #bc002d; }
        [data-chat-theme='light'] .template-header-title { color: #0f2c59; }
        [data-chat-theme='light'] .template-close-btn { color: #4a5568; }
        [data-chat-theme='light'] .template-close-btn:hover { color: #0f2c59; }
        [data-chat-theme='light'] .template-card-title { color: #bc002d; }
        [data-chat-theme='light'] .template-card-desc { color: #4a5568; }
        [data-chat-theme='light'] .msg-timestamp { color: rgba(15, 44, 89, 0.38); }
        [data-chat-theme='light'] .template-tab {
          background: rgba(15, 44, 89, 0.06);
          color: #4a5568;
          border-color: rgba(15, 44, 89, 0.1);
        }
        [data-chat-theme='light'] .template-tab.active {
          background: linear-gradient(135deg, #0f2c59, #bc002d);
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(15, 44, 89, 0.25);
        }
        [data-chat-theme='light'] .template-card-modern {
          background: #ffffff;
          border-color: rgba(15, 44, 89, 0.1);
        }
        [data-chat-theme='light'] .template-card-modern:hover {
          background: rgba(15, 44, 89, 0.04);
          border-color: rgba(188, 0, 45, 0.25);
          box-shadow: 0 4px 12px rgba(15, 44, 89, 0.1);
          transform: translateY(-1px);
        }

        /* Light: input form */
        [data-chat-theme='light'] .chat-input-form {
          background: #ffffff;
          border-color: rgba(15, 44, 89, 0.2);
          box-shadow: 0 1px 4px rgba(15, 44, 89, 0.06);
        }
        [data-chat-theme='light'] .chat-input-form:focus-within {
          border-color: #bc002d;
          box-shadow: 0 0 0 3px rgba(188, 0, 45, 0.1);
        }
        [data-chat-theme='light'] textarea.chat-textarea {
          color: #2c3e50;
        }
        [data-chat-theme='light'] textarea.chat-textarea::placeholder {
          color: rgba(15, 44, 89, 0.35);
        }
        [data-chat-theme='light'] .btn-sparkles {
          background: rgba(15, 44, 89, 0.05);
          border-color: rgba(15, 44, 89, 0.12);
          color: #4a5568;
        }
        [data-chat-theme='light'] .btn-sparkles.active,
        [data-chat-theme='light'] .btn-sparkles:hover {
          background: rgba(188, 0, 45, 0.08);
          border-color: rgba(188, 0, 45, 0.3);
          color: #bc002d;
          box-shadow: 0 0 8px rgba(188, 0, 45, 0.15);
        }
        [data-chat-theme='light'] .send-btn {
          background: linear-gradient(135deg, #bc002d 0%, #e8365d 100%) !important;
        }
        [data-chat-theme='light'] .send-btn:hover:not(:disabled) {
          box-shadow: 0 0 14px rgba(188, 0, 45, 0.5) !important;
        }
        [data-chat-theme='light'] .model-tag {
          background: rgba(15, 44, 89, 0.05);
          border-color: rgba(15, 44, 89, 0.1);
          color: #4a5568;
        }

        /* Light: copy toast */
        [data-chat-theme='light'] .copy-toast {
          background: rgba(15, 44, 89, 0.9);
          border-color: rgba(188, 0, 45, 0.3);
        }

        /* Light: streaming cursor */
        [data-chat-theme='light'] .msg-bubble-bot.streaming > *:last-child::after {
          background: linear-gradient(135deg, #bc002d, #0f2c59);
        }
      `}</style>

      {/* ===== FAB Launcher ===== */}
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
        className={`chat-launcher-modern ${isOpen ? 'inactive' : 'active'}`}
        title="Trò chuyện cùng NihonBot AI"
      >
        <span style={{ fontSize: '1.6rem' }}>🌸</span>
        {/* AI online dot */}
        <span className={aiMode !== 'offline' ? 'status-dot-active' : 'status-dot-offline'} style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          border: '2px solid #12062a'
        }} />
        {/* Unread badge */}
        {hasUnread && (
          <span className="unread-badge">●</span>
        )}
      </button>

      {/* ===== Chat Panel ===== */}
      <div
        className={`chat-panel-modern ${isMinimized ? 'minimized' : ''} ${isOpen ? 'active' : 'inactive'}`}
        data-chat-theme={chatTheme}
        style={{ position: 'fixed' }}
      >
        {/* ===== HEADER ===== */}
        <div
          className="chat-header-modern"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {/* Sakura petals */}
          {['🌸', '🌸', '🌸', '✿', '🌸'].map((p, i) => (
            <span key={i} className="sakura-petal">{p}</span>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar-glow">{getPartnerAvatar()}</div>
              <span
                className={aiMode !== 'offline' ? 'status-dot-active' : 'status-dot-offline'}
                style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', letterSpacing: '0.2px' }}>
                {getPartnerName()}
              </div>
              <div className="header-subtitle" style={{ fontSize: '0.65rem', color: 'rgba(240,171,252,0.8)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                {GROQ_API_KEY ? (
                  <><Cpu size={9} style={{ color: '#a78bfa' }} /> Groq Compound · Trực tuyến</>
                ) : (
                  <><WifiOff size={9} /> Offline Mode</>
                )}
              </div>
            </div>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative', zIndex: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="header-btn" onClick={handleResetChat} title="Làm mới cuộc trò chuyện">
              <RefreshCw size={13} />
            </button>
            <button className="header-btn" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button className="header-btn" onClick={handleClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* ===== TEMPLATES DRAWER ===== */}
            {showTemplates && (
              <div className="template-drawer">
                <div className="template-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={14} className="template-sparkle-icon" />
                    <span className="template-header-title">Gợi ý câu hỏi mẫu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="template-close-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="template-tabs-container">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'cv', label: '📄 CV & Phỏng vấn' },
                    { id: 'communication', label: '💬 Giao tiếp' },
                    { id: 'life', label: '🏠 Đời sống Nhật' }
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
                        setTimeout(() => {
                          textareaRef.current?.focus();
                          if (textareaRef.current) {
                            textareaRef.current.style.height = '0px';
                            const scrollHeight = textareaRef.current.scrollHeight;
                            textareaRef.current.style.height = `${scrollHeight}px`;
                            if (scrollHeight > 150) {
                              textareaRef.current.style.overflowY = 'auto';
                            } else {
                              textareaRef.current.style.overflowY = 'hidden';
                            }
                          }
                        }, 100);
                      }}
                    >
                      <span style={{ fontSize: '1.3rem', marginTop: '1px' }}>{t.emoji}</span>
                      <div>
                        <div className="template-card-title">{t.title}</div>
                        <div className="template-card-desc">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== MESSAGES BODY ===== */}
            <div className="chat-body-modern">
              {aiMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className="msg-wrapper"
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '0.5rem',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {/* Bubble row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', width: '100%', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      {!isUser && (
                        <div className="bot-avatar">
                          🌸
                        </div>
                      )}
                      <div style={{ maxWidth: isUser ? '82%' : '88%' }}>
                        <div
                          className={isUser ? 'msg-bubble-user' : `msg-bubble-bot ${msg.isStreaming ? 'streaming' : ''}`}
                        >
                          {isUser ? (
                            msg.text
                          ) : msg.text ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >{msg.text}</ReactMarkdown>
                          ) : (
                            <p>&nbsp;</p>
                          )}
                        </div>
                        <div
                          className="msg-timestamp"
                          style={{ textAlign: isUser ? 'right' : 'left' }}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>

                    {/* Hover action buttons for bot messages */}
                    {!isUser && !msg.isStreaming && (
                      <div className="msg-actions-row" style={{ paddingLeft: '40px' }}>
                        <button
                          className="msg-action-btn"
                          onClick={() => handleCopyMessage(msg.text)}
                          title="Sao chép"
                        >
                          <Copy size={10} /> Sao chép
                        </button>
                        <button
                          className={`msg-action-btn ${likedMessages.has(msg.id) ? 'liked' : ''}`}
                          onClick={() => handleLikeMessage(msg.id)}
                          title="Thích"
                        >
                          <ThumbsUp size={10} /> {likedMessages.has(msg.id) ? 'Đã thích' : 'Thích'}
                        </button>
                        <button
                          className="msg-action-btn"
                          onClick={() => handleSpeakMessage(msg.text)}
                          title="Phát âm"
                        >
                          <Volume2 size={10} /> Đọc
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && !isStreaming && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="bot-avatar">
                    🌸
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    padding: '0.65rem 1rem',
                    borderRadius: '4px 16px 16px 16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span key={i} className="typing-dot" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ===== COPY TOAST ===== */}
            {copyToast && (
              <div className="copy-toast">{copyToast}</div>
            )}

            {/* ===== INPUT FORM ===== */}
            <form
              className="chat-input-form"
              onSubmit={handleSendMessage}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = '0px';
                  const scrollHeight = e.target.scrollHeight;
                  e.target.style.height = `${scrollHeight}px`;
                  if (scrollHeight > 150) {
                    e.target.style.overflowY = 'auto';
                  } else {
                    e.target.style.overflowY = 'hidden';
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  !GROQ_API_KEY
                    ? 'Trợ lý AI đang tắt...'
                    : isStreaming
                    ? 'AI đang soạn câu trả lời...'
                    : 'Hỏi NihonBot bất cứ điều gì... 🌸'
                }
                disabled={isStreaming || !GROQ_API_KEY}
                rows={1}
                className="chat-textarea"
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span
                    className={`btn-sparkles ${showTemplates ? 'active' : ''}`}
                    onClick={() => GROQ_API_KEY && setShowTemplates(!showTemplates)}
                    title={GROQ_API_KEY ? 'Xem gợi ý câu hỏi mẫu' : 'Trợ lý AI đang tắt'}
                    style={{
                      opacity: GROQ_API_KEY ? 1 : 0.4,
                      pointerEvents: GROQ_API_KEY ? 'auto' : 'none'
                    }}
                  >
                    <Sparkles size={13} />
                  </span>
                  {GROQ_API_KEY && (
                    <span className="model-tag">
                      <Cpu size={9} style={{ color: '#a78bfa' }} /> groq/compound-mini
                    </span>
                  )}
                </div>
                <div>
                  {isStreaming ? (
                    <button
                      type="button"
                      className="stop-btn"
                      onClick={handleStopStreaming}
                      title="Dừng tạo"
                    >
                      <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '1.5px', display: 'block' }} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="send-btn"
                      disabled={!GROQ_API_KEY || !inputValue.trim()}
                      title="Gửi"
                    >
                      <Send size={13} style={{ color: 'white' }} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
