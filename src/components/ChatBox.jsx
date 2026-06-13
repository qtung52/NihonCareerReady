import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, Cpu, WifiOff, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Groq API key from https://console.groq.com/keys
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const SYSTEM_PROMPT = `Bạn là AI hỗ trợ tích hợp trên nền tảng NihonLink - nền tảng hỗ trợ người Việt Nam làm việc tại Nhật Bản.
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

const DEFAULT_SENPAI_MESSAGES = {
  minh: [
    { id: 1, sender: 'senpai', text: 'Chào em, anh là Minh, hiện là Bridge SE tại Tokyo. Em có câu hỏi gì về ngành IT hoặc cuộc sống bên Nhật không?', time: '10:00' }
  ],
  trang: [
    { id: 1, sender: 'senpai', text: 'Chào bạn nhé! Mình là Trang, làm về Logistics & Xuất nhập khẩu tại Osaka. Rất vui được hỗ trợ bạn về kinh nghiệm Shukatsu!', time: '10:05' }
  ]
};

const MOCK_SENPAI_REPLIES = {
  minh: [
    "Công việc Bridge SE đòi hỏi cả kỹ năng lập trình lẫn tiếng Nhật tầm N2 trở lên em nhé. Em nên tập trung học hội thoại chuyên ngành.",
    "Bên Nhật tuyển IT đánh giá rất cao thái độ làm việc nhóm và khả năng tự nghiên cứu. Portfolio nên có dự án thực tế nhé.",
    "Cuộc sống ở Tokyo năng động nhưng chi phí thuê nhà hơi cao. Em có thể ở Saitama hoặc Chiba rồi đi tàu điện đi làm.",
    "Nếu muốn ứng tuyển, hãy viết phần kinh nghiệm dự án thật rõ ràng trong CV: vai trò của em là gì, sử dụng công nghệ nào."
  ],
  trang: [
    "Ngành Logistics ở Nhật giao dịch quốc tế nhiều, ngoài tiếng Nhật biết thêm tiếng Anh là lợi thế cực kỳ lớn!",
    "Khi chuẩn bị hồ sơ Shukatsu cho công ty thương mại, cần thể hiện khả năng giao tiếp khéo léo và chịu được áp lực cao.",
    "Tìm hiểu thêm về chứng chỉ nghiệp vụ hải quan hoặc chứng chỉ ngoại thương để làm đẹp hồ sơ ứng tuyển nhé.",
    "Văn hóa ngành này rất chú trọng giờ giấc và sự liên lạc nhanh chóng. Hãy làm quen với tác phong nhanh nhẹn từ bây giờ."
  ]
};

export default function ChatBox({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState('ai');
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState(GROQ_API_KEY ? 'groq' : 'offline');
  const [isStreaming, setIsStreaming] = useState(false);

  const welcomeText = GROQ_API_KEY
    ? 'Chào bạn! Mình là AI Trợ Lý NihonLink, bạn có thể hỏi mình bất cứ điều gì về văn hóa doanh nghiệp Nhật, phỏng vấn, viết CV hay cuộc sống tại Nhật nhé! 🤖'
    : 'Chào bạn! Mình là AI Trợ Lý NihonLink. Chưa có Groq API key nên mình đang dùng chế độ trả lời mẫu. Hỏi mình về văn hóa Nhật, phỏng vấn, viết CV nhé! 🌸';

  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'bot', text: welcomeText, time: 'Vừa xong' }
  ]);
  const [senpaiMinhMessages, setSenpaiMinhMessages] = useState(DEFAULT_SENPAI_MESSAGES.minh);
  const [senpaiTrangMessages, setSenpaiTrangMessages] = useState(DEFAULT_SENPAI_MESSAGES.trang);

  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  const handleResetChat = () => {
    setAiMessages([
      { id: Date.now(), sender: 'bot', text: welcomeText, time: 'Vừa xong' }
    ]);
    setInputValue('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, senpaiMinhMessages, senpaiTrangMessages, isTyping, chatMode, isOpen, isMinimized, streamingText]);

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
          model: 'llama-3.3-70b-versatile', // Updated model since llama3-8b-8192 is decommissioned
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...apiHistory
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 400
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
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || isStreaming) return;

    const userText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: userText, time: timeStr };

    setInputValue('');

    if (chatMode === 'ai') {
      const newMessages = [...aiMessages, userMsg];
      setAiMessages(newMessages);

      const callFn = aiMode === 'groq' ? callGroqStreaming : null;

      if (callFn) {
        setIsStreaming(true);
        setStreamingText('');
        const streamId = Date.now() + 1;

        // Xây dựng lịch sử trò chuyện để gửi cho AI hiểu context
        const apiHistory = newMessages.map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text
        }));

        callFn(
          apiHistory,
          (partialText) => setStreamingText(partialText),
          (finalText) => {
            setAiMessages(prev => [...prev, {
              id: streamId,
              sender: 'bot',
              text: finalText || 'Xin lỗi, tôi không tạo được phản hồi. Thử lại nhé!',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setStreamingText('');
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

            setAiMessages(prev => [...prev, {
              id: Date.now() + 2,
              sender: 'bot',
              text: errorMsg,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setStreamingText('');
            setIsStreaming(false);
            setAiMode('offline');
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

    } else if (chatMode === 'minh') {
      setSenpaiMinhMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        const replies = MOCK_SENPAI_REPLIES.minh;
        setSenpaiMinhMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'senpai',
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);

    } else if (chatMode === 'trang') {
      setSenpaiTrangMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        const replies = MOCK_SENPAI_REPLIES.trang;
        setSenpaiTrangMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'senpai',
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamingText) {
      setAiMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: streamingText + ' [dừng]',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setStreamingText('');
    setIsStreaming(false);
  };

  const getMessages = () => {
    switch (chatMode) {
      case 'ai': return aiMessages;
      case 'minh': return senpaiMinhMessages;
      case 'trang': return senpaiTrangMessages;
      default: return [];
    }
  };

  const getPartnerName = () => {
    return aiMode === 'groq' ? 'Trợ Lý AI NihonLink' : 'AI Hỗ trợ (Trả lời mẫu)';
  };

  const getPartnerAvatar = () => {
    return '🤖';
  };

  if (!currentUser) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
        className="chat-launcher hover-scale"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--jp-blue) 0%, #1e457e 100%)',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(15, 44, 89, 0.35)',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title="Trò chuyện hỗ trợ"
      >
        <MessageSquare size={26} style={{ color: 'white' }} />
        {/* AI status dot */}
        <span style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: aiMode !== 'offline' ? '#2ecc71' : '#f39c12',
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
    );
  }

  return (
    <div
      className="chat-panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '390px',
        height: isMinimized ? '55px' : '540px',
        borderRadius: '12px',
        background: 'var(--jp-card-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--jp-border)',
        boxShadow: 'var(--jp-shadow-lg)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        animation: isClosing ? 'modalPopOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transformOrigin: 'bottom right'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.85rem 1.2rem',
          background: 'linear-gradient(135deg, var(--jp-blue) 0%, #1e3a6e 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem' }}>{getPartnerAvatar()}</span>
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: aiMode !== 'offline' ? '#2ecc71' : '#f39c12',
                border: '1.5px solid var(--jp-blue)',
                transition: 'background-color 0.3s'
              }}
            />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              {getPartnerName()}
            </h4>
            <span style={{ fontSize: '0.68rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '3px' }}>
              {aiMode === 'groq' ? (
                <><Cpu size={10} /> Llama 3.3 đang bật</>
              ) : (
                <><WifiOff size={10} /> Chế độ trả lời mẫu</>
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
          {/* Quick FAQ Chips (AI mode only) */}
          {chatMode === 'ai' && (
            <div style={{ position: 'relative', background: 'var(--jp-soft-surface)', borderBottom: '1px solid var(--jp-border)', padding: '0.4rem 0' }}>
              <button 
                onClick={handleScrollLeft}
                style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', background: 'var(--jp-surface-raised)', border: '1px solid var(--jp-border)', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              >
                <ChevronLeft size={16} color="var(--jp-blue)" />
              </button>
              
              <div
                ref={scrollContainerRef}
                style={{
                  padding: '0 1.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  scrollBehavior: 'smooth'
                }}
                className="no-scrollbar"
              >
                {[
                  { emoji: '📝', label: 'Viết CV', text: 'Cách viết CV Rirekisho chuẩn Nhật?' },
                  { emoji: '🙇', label: 'Chào hỏi', text: 'Quy tắc cúi chào Ojigi trong văn phòng?' },
                  { emoji: '🍻', label: 'Nomikai', text: 'Văn hóa tiệc rượu Nomikai ở Nhật?' },
                  { emoji: '🏢', label: 'HouRenSo', text: 'Nguyên tắc Hou-Ren-So là gì?' },
                  { emoji: '💼', label: 'Phỏng vấn', text: 'Cách chuẩn bị phỏng vấn Shukatsu?' },
                  { emoji: '👔', label: 'Trang phục', text: 'Quy tắc trang phục công sở Nhật Bản?' },
                  { emoji: '✉️', label: 'Email', text: 'Mẫu email tiếng Nhật xin nghỉ phép?' }
                ].map((chip) => (
                  <span
                    key={chip.label}
                    onClick={() => setInputValue(chip.text)}
                    style={{
                      fontSize: '0.75rem',
                      background: 'var(--jp-card-bg)',
                      border: '1px solid var(--jp-border)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      color: 'var(--jp-text)',
                      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={e => { 
                      e.currentTarget.style.borderColor = 'var(--jp-blue)'; 
                      e.currentTarget.style.background = 'var(--jp-blue-light)'; 
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => { 
                      e.currentTarget.style.borderColor = 'var(--jp-border)'; 
                      e.currentTarget.style.background = 'var(--jp-card-bg)'; 
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    }}
                  >
                    <span>{chip.emoji}</span>
                    <span style={{ fontWeight: 500 }}>{chip.label}</span>
                  </span>
                ))}
              </div>

              <button 
                onClick={handleScrollRight}
                style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'var(--jp-surface-raised)', border: '1px solid var(--jp-border)', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              >
                <ChevronRight size={16} color="var(--jp-blue)" />
              </button>
            </div>
          )}

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, var(--jp-bg) 0%, var(--jp-surface-raised) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {getMessages().map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: '0.45rem'
                  }}
                >
                  {!isUser && (
                    <div style={{
                      fontSize: '1.1rem',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--jp-card-bg)',
                      borderRadius: '50%',
                      border: '1px solid var(--jp-border)',
                      flexShrink: 0
                    }}>
                      {getPartnerAvatar()}
                    </div>
                  )}
                  <div style={{ maxWidth: '78%' }}>
                    <div
                      style={{
                        padding: '0.6rem 0.85rem',
                        background: isUser
                          ? 'linear-gradient(135deg, var(--jp-blue) 0%, #1e457e 100%)'
                          : 'var(--jp-card-bg)',
                        color: isUser ? 'white' : 'var(--jp-text)',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        boxShadow: isUser
                          ? '0 2px 10px rgba(15,44,89,0.2)'
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid rgba(15,44,89,0.07)',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        wordBreak: 'break-word',
                        whiteSpace: isUser ? 'pre-wrap' : 'normal'
                      }}
                      className={!isUser ? 'markdown-body' : ''}
                    >
                      {isUser ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                    </div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.63rem',
                        color: 'var(--jp-text-muted)',
                        marginTop: '0.2rem',
                        textAlign: isUser ? 'right' : 'left',
                        padding: '0 0.25rem'
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Streaming bubble */}
            {isStreaming && streamingText && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.45rem' }}>
                <div style={{
                  fontSize: '1.1rem', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--jp-card-bg)', borderRadius: '50%', border: '1px solid var(--jp-border)', flexShrink: 0
                }}>
                  🤖
                </div>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    background: 'var(--jp-card-bg)',
                    color: 'var(--jp-text)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(15,44,89,0.07)',
                    borderRadius: '14px 14px 14px 2px',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                  }}
                    className="markdown-body"
                  >
                    <ReactMarkdown>{streamingText + ' ▍'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator (for senpai mode) */}
            {isTyping && !isStreaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  fontSize: '1.1rem', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--jp-card-bg)', borderRadius: '50%', border: '1px solid var(--jp-border)'
                }}>
                  {getPartnerAvatar()}
                </div>
                <div style={{
                  background: 'var(--jp-card-bg)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '14px 14px 14px 2px',
                  border: '1px solid rgba(15,44,89,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
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
              padding: '0.75rem 0.85rem',
              background: 'var(--jp-card-bg)',
              borderTop: '1px solid var(--jp-border)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isStreaming ? 'AI đang trả lời...' : 'Nhập câu hỏi...'}
              disabled={isStreaming}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                border: '1.5px solid var(--jp-border)',
                borderRadius: '20px',
                fontSize: '0.84rem',
                outline: 'none',
                background: isStreaming ? 'var(--jp-surface-raised)' : 'var(--jp-bg)',
                transition: 'border-color 0.2s',
                color: 'var(--jp-text)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--jp-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--jp-border)'}
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Dừng tạo"
              >
                <span style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px', display: 'block' }} />
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--jp-red) 0%, #c0392b 100%)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  flexShrink: 0
                }}
                className="hover-scale"
              >
                <Send size={15} style={{ color: 'white' }} />
              </button>
            )}
          </form>

          {/* Footer: Powered by */}
          {aiMode !== 'offline' && (
            <div style={{
              padding: '0.3rem 1rem',
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
              {aiMode === 'groq' ? 'Powered by Llama 3.3' : 'Powered by Gemini API · gemini-1.5-flash'}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
