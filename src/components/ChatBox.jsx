import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, Users, Sparkles, Cpu, Wifi, WifiOff } from 'lucide-react';

// Use VITE_OLLAMA_URL env var (ngrok URL for Vercel deploy) or fall back to local Vite proxy
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || '/ollama';
const OLLAMA_MODEL = 'gemma3:latest';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState('ai');
  const [inputValue, setInputValue] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [isStreaming, setIsStreaming] = useState(false);

  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Chào bạn! Mình là AI Trợ Lý của NihonLink, chạy bằng Gemma3 trên máy bạn (hoàn toàn offline). Hỏi mình bất cứ điều gì về văn hóa doanh nghiệp Nhật, phỏng vấn, viết CV hay cuộc sống tại Nhật nhé! 🤖✨',
      time: 'Vừa xong'
    }
  ]);
  const [senpaiMinhMessages, setSenpaiMinhMessages] = useState(DEFAULT_SENPAI_MESSAGES.minh);
  const [senpaiTrangMessages, setSenpaiTrangMessages] = useState(DEFAULT_SENPAI_MESSAGES.trang);

  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 15000); // re-check every 15s
    return () => clearInterval(interval);
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        // Check if gemma3 model exists
        const hasModel = data.models?.some(m => m.name.includes('gemma3'));
        setOllamaStatus(hasModel ? 'online' : 'no_model');
      } else {
        setOllamaStatus('offline');
      }
    } catch {
      setOllamaStatus('offline');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, senpaiMinhMessages, senpaiTrangMessages, isTyping, chatMode, isOpen, isMinimized, streamingText]);

  const callOllamaStreaming = async (userText, onChunk, onDone, onError) => {
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userText }
          ],
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 400
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama ${response.status}: ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            // /api/chat returns { message: { content: '...' }, done: bool }
            if (parsed.message?.content) {
              fullText += parsed.message.content;
              onChunk(fullText);
            }
            if (parsed.done) {
              onDone(fullText);
              return;
            }
          } catch { /* skip malformed JSON */ }
        }
      }
      onDone(fullText);
    } catch (error) {
      if (error.name === 'AbortError') return;
      onError(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || isStreaming) return;

    const userText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: userText, time: timeStr };

    setInputValue('');

    if (chatMode === 'ai') {
      setAiMessages(prev => [...prev, userMsg]);

      if (ollamaStatus === 'online') {
        // Streaming mode with Ollama
        setIsStreaming(true);
        setStreamingText('');

        const streamId = Date.now() + 1;

        callOllamaStreaming(
          userText,
          (partialText) => {
            setStreamingText(partialText);
          },
          (finalText) => {
            const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setAiMessages(prev => [...prev, {
              id: streamId,
              sender: 'bot',
              text: finalText || 'Xin lỗi, tôi không tạo được phản hồi. Thử lại nhé!',
              time: responseTime
            }]);
            setStreamingText('');
            setIsStreaming(false);
          },
          (error) => {
            console.error('Ollama error:', error);
            setAiMessages(prev => [...prev, {
              id: Date.now() + 2,
              sender: 'bot',
              text: '⚠️ Không thể kết nối với Ollama. Đảm bảo Ollama đang chạy và model gemma3 đã được tải.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setStreamingText('');
            setIsStreaming(false);
            setOllamaStatus('offline');
          }
        );
      } else {
        // Fallback to mock responses
        setIsTyping(true);
        setTimeout(() => {
          const query = userText.toLowerCase();
          let matchedResponse = null;

          for (const item of AI_RESPONSES_FALLBACK) {
            if (item.keywords.some(kw => query.includes(kw))) {
              matchedResponse = item.response;
              break;
            }
          }

          if (!matchedResponse) {
            matchedResponse = `[Chế độ offline] Cảm ơn câu hỏi về "${userText}". Để kết nối AI thật, hãy đảm bảo Ollama đang chạy trên máy bạn với model gemma3. Trong lúc đó, hãy thử hỏi về CV, phỏng vấn, Nomikai, Ojigi, hoặc HouRenSo! 🌸`;
          }

          setAiMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'bot',
            text: matchedResponse,
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
    switch (chatMode) {
      case 'ai':
        if (ollamaStatus === 'online') return 'Gemma3 AI (Local · Offline)';
        if (ollamaStatus === 'no_model') return 'AI Hỗ trợ (Thiếu model)';
        return 'AI Hỗ trợ (Offline)';
      case 'minh': return 'Senpai Minh (Bridge SE)';
      case 'trang': return 'Senpai Trang (Logistics)';
      default: return 'NihonLink Help';
    }
  };

  const getPartnerAvatar = () => {
    switch (chatMode) {
      case 'ai': return '🤖';
      case 'minh': return '👨‍💼';
      case 'trang': return '👩‍💼';
      default: return '🧑‍💻';
    }
  };

  if (!currentUser) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setHasUnread(false); }}
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
        className="hover-scale"
        title="Trò chuyện hỗ trợ"
      >
        <MessageSquare size={26} style={{ color: 'white' }} />
        {/* Ollama status dot */}
        <span style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: ollamaStatus === 'online' ? '#2ecc71' : '#e74c3c',
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
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '390px',
        height: isMinimized ? '55px' : '540px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(15, 44, 89, 0.12)',
        boxShadow: '0 16px 48px rgba(15, 44, 89, 0.18)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
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
                backgroundColor: ollamaStatus === 'online' ? '#2ecc71' : '#e74c3c',
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
              {chatMode === 'ai' ? (
                <>
                  {ollamaStatus === 'online' ? <Cpu size={10} /> : <WifiOff size={10} />}
                  {ollamaStatus === 'online' ? 'Ollama đang chạy · gemma3' : 'Chế độ offline'}
                </>
              ) : (
                <><span style={{ color: '#2ecc71' }}>●</span> online</>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.2rem' }}
          >
            {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mode Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f8fafc',
              borderBottom: '1px solid var(--jp-border)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {[
              { key: 'ai', label: 'AI Hỗ trợ', icon: <Bot size={13} /> },
              { key: 'minh', label: 'Senpai Minh', icon: <span style={{ fontSize: '0.8rem' }}>👨‍💼</span> },
              { key: 'trang', label: 'Senpai Trang', icon: <span style={{ fontSize: '0.8rem' }}>👩‍💼</span> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setChatMode(tab.key)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.25rem',
                  border: 'none',
                  background: chatMode === tab.key ? '#fff' : 'transparent',
                  color: chatMode === tab.key
                    ? (tab.key === 'ai' ? 'var(--jp-red)' : 'var(--jp-blue)')
                    : 'var(--jp-text-muted)',
                  borderBottom: chatMode === tab.key
                    ? `2.5px solid ${tab.key === 'ai' ? 'var(--jp-red)' : 'var(--jp-blue)'}`
                    : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Ollama Status Banner */}
          {chatMode === 'ai' && ollamaStatus !== 'online' && (
            <div style={{
              padding: '0.5rem 0.75rem',
              background: ollamaStatus === 'no_model'
                ? 'rgba(243, 156, 18, 0.08)'
                : 'rgba(231, 76, 60, 0.08)',
              borderBottom: `1px solid ${ollamaStatus === 'no_model' ? 'rgba(243,156,18,0.25)' : 'rgba(231,76,60,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: ollamaStatus === 'no_model' ? '#d68910' : '#c0392b'
            }}>
              <WifiOff size={12} />
              {ollamaStatus === 'no_model' ? (
                <span>Ollama đang chạy nhưng chưa có model gemma3. Chạy <code style={{ background: 'rgba(243,156,18,0.12)', padding: '0 3px', borderRadius: '3px' }}>ollama pull gemma3</code> để tải.</span>
              ) : (
                <span>Ollama offline — đang dùng chế độ giả lập. Chạy <code style={{ background: 'rgba(231,76,60,0.1)', padding: '0 3px', borderRadius: '3px' }}>ollama serve</code> để bật AI thật.</span>
              )}
            </div>
          )}

          {/* Quick FAQ Chips (AI mode only) */}
          {chatMode === 'ai' && (
            <div
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(230, 238, 252, 0.35)',
                borderBottom: '1px solid var(--jp-border)',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
              className="no-scrollbar"
            >
              {[
                { emoji: '📝', label: 'Viết CV', text: 'Cách viết CV Rirekisho chuẩn Nhật?' },
                { emoji: '🙇', label: 'Chào hỏi', text: 'Quy tắc cúi chào Ojigi trong văn phòng?' },
                { emoji: '🍻', label: 'Nomikai', text: 'Văn hóa tiệc rượu Nomikai ở Nhật?' },
                { emoji: '🏢', label: 'HouRenSo', text: 'Nguyên tắc Hou-Ren-So là gì?' },
                { emoji: '💼', label: 'Phỏng vấn', text: 'Cách chuẩn bị phỏng vấn Shukatsu?' }
              ].map((chip) => (
                <span
                  key={chip.label}
                  onClick={() => setInputValue(chip.text)}
                  style={{
                    fontSize: '0.7rem',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: 'var(--jp-text)',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--jp-blue)'; e.target.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#fff'; }}
                >
                  {chip.emoji} {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #f8fafe 0%, #fafbff 100%)',
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
                      background: '#fff',
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
                          : '#fff',
                        color: isUser ? 'white' : 'var(--jp-text)',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        boxShadow: isUser
                          ? '0 2px 10px rgba(15,44,89,0.2)'
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid rgba(15,44,89,0.07)',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
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
                  background: '#fff', borderRadius: '50%', border: '1px solid var(--jp-border)', flexShrink: 0
                }}>
                  🤖
                </div>
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    background: '#fff',
                    color: 'var(--jp-text)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(15,44,89,0.07)',
                    borderRadius: '14px 14px 14px 2px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {streamingText}
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '14px',
                      background: 'var(--jp-blue)',
                      marginLeft: '2px',
                      verticalAlign: 'middle',
                      animation: 'blink 0.8s step-end infinite'
                    }} />
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
                  background: '#fff', borderRadius: '50%', border: '1px solid var(--jp-border)'
                }}>
                  {getPartnerAvatar()}
                </div>
                <div style={{
                  background: '#fff',
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
              background: '#fff',
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
                background: isStreaming ? '#f5f7fa' : '#f8fafc',
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
          <div style={{
            padding: '0.3rem 1rem',
            background: '#f8fafe',
            borderTop: '1px solid var(--jp-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            fontSize: '0.62rem',
            color: 'var(--jp-text-muted)'
          }}>
            <Cpu size={10} />
            Powered by Ollama · {OLLAMA_MODEL} · chạy hoàn toàn trên máy bạn
          </div>
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
