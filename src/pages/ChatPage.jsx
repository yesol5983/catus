import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common";
import { ROUTES } from "../constants/routes";
import { EMOTION_COLORS, EMOTION_EMOJIS } from "../constants/emotionColors";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import HomePage from "./HomePage";
import catProfile from "../assets/images/cat-profile.png";

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [messages, setMessages] = useLocalStorage(`chat_messages_${todayKey}`, []);
  const [inputValue, setInputValue] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const messagesEndRef = useRef(null);

  // 애니메이션 상태
  const [showChatModal, setShowChatModal] = useState(false);

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 진입 애니메이션 시퀀스
  useEffect(() => {
    // 채팅 모달 표시
    setShowChatModal(true);
  }, []);

  // 초기 AI 인사 메시지 (localStorage가 비어있을 때만)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: "ai",
          text: "안녕! 오늘 하루는 어땠어? 무슨 일이 있었는지 들려줘!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAITyping]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAITyping) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsAITyping(true);

    try {
      // 백엔드 API 호출
      const token = localStorage.getItem('catus_access_token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chat/messages`,
        {
          message: userMessage.text,
          date: todayKey
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // AI 응답 추가
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: response.data.aiMessage.content,
        timestamp: response.data.aiMessage.createdAt,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // 에러 발생 시 사용자에게 알림
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: "미안해, 지금 답변을 할 수 없어. 잠시 후 다시 시도해줄래?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAITyping(false);
    }
  };

  // 닫기
  const handleClose = () => {
    if (messages.length > 1) {
      setShowEmotionModal(true);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  // 감정 선택
  const handleSelectEmotion = (emotion) => {
    // TODO: 실제 저장 로직
    console.log("대화 저장", { date: todayLabel, emotion, messages });
    navigate(ROUTES.HOME);
  };

  // 저장 안함
  const handleDontSave = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="fixed inset-0 bg-[#fef9f1]">
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
      {/* 백그라운드로 HomePage 렌더링 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <HomePage hideButtons={true} />
      </div>

      {/* 채팅 화면 - 반투명 어두운 배경으로 전체 화면 */}
      {showChatModal && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4" style={{ paddingTop: '16px', paddingBottom: '16px', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
            <button
              onClick={handleClose}
              className="text-[white] flex items-center justify-center hover:opacity-80 transition-opacity bg-transparent border-0"
              style={{ width: '50px', height: '30px', fontSize: '25px' }}
              aria-label="뒤로가기"
            >
              ←
            </button>
            <span className="text-[white] text-sm font-medium">{todayLabel}</span>
            <div style={{ width: "40px" }} />
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto" style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}>
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start ${m.type === "user" ? "flex-row-reverse" : "flex-row"}`}
              style={{ gap: '8px', marginBottom: '16px' }}
            >
              {m.type === "ai" && (
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
                  <img src={catProfile} alt="cat" className="object-contain" style={{ width: '32px', height: '32px' }} />
                </div>
              )}
              <div className={`flex items-end ${m.type === "user" ? "flex-row-reverse" : ""}`} style={{ gap: '2px' }}>
                <div
                  className={`max-w-[200px] break-words ${
                    m.type === "ai"
                      ? "text-[white]"
                      : "text-[white]"
                  }`}
                  style={m.type === "ai" ? {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '16px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '12px'
                  } : {
                    backgroundColor: 'rgba(150, 150, 150, 0.8)',
                    borderRadius: '16px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  {m.text}
                </div>
                <div className="text-xs text-[white]/60" style={{ fontSize: '10px', paddingBottom: '2px' }}>
                  {new Date(m.timestamp).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI 타이핑 중 */}
        {isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start"
            style={{ gap: '8px', marginBottom: '16px' }}
          >
            <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
              <img src={catProfile} alt="cat" className="object-contain" style={{ width: '32px', height: '32px' }} />
            </div>
            <div className="text-[white] flex" style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '16px',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '14px',
              gap: '6px'
            }}>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '0ms'
              }}></span>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '200ms'
              }}></span>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '400ms'
              }}></span>
            </div>
          </motion.div>
        )}

        {/* 사용자 타이핑 중 */}
        {inputValue.trim() && !isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start flex-row-reverse"
            style={{ gap: '8px', marginBottom: '16px' }}
          >
            <div className="text-[white] flex" style={{
              backgroundColor: 'rgba(150, 150, 150, 0.8)',
              borderRadius: '16px',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '14px',
              gap: '6px'
            }}>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '0ms'
              }}></span>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '200ms'
              }}></span>
              <span className="bg-[white] rounded-full" style={{
                width: '6px',
                height: '6px',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '400ms'
              }}></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} /></div>

          {/* 입력 영역 */}
          <div className="bg-white flex items-center" style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', gap: '8px' }}>
            <button
              className="flex items-center justify-center text-[white] hover:opacity-90 transition-all active:scale-93 border-0"
              style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '12px' }}
              aria-label="음성 입력"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mic</span>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              disabled={isAITyping}
              className="flex-1 border border-gray-300 rounded-[12px] text-sm focus:outline-none focus:border-[#5F6F52] disabled:bg-gray-100 disabled:text-gray-400"
              style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAITyping}
              className="text-[white] text-sm font-medium hover:opacity-90 transition-all active:scale-93 disabled:opacity-50 disabled:cursor-not-allowed border-0"
              style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '11px', paddingBottom: '11px', backgroundColor: '#000000', borderRadius: '12px',opacity: 1, }}
            >
              전송
            </button>
          </div>
        </motion.div>
      )}

      {/* 감정 선택 모달 */}
      <AnimatePresence>
        {showEmotionModal && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '24px' }}
            >
              <h2 className="text-xl font-bold text-[white] text-center mb-2">오늘의 감정은?</h2>
              <p className="text-sm text-[white] text-center" style={{ marginBottom: '24px' }}>
                오늘 하루를 한 가지 감정으로 표현해볼까요?
              </p>
              <div className="flex justify-between" style={{ gap: '8px', marginBottom: '20px' }}>
                {[
                  { emotion: '행복', color: '#6BCB77' },
                  { emotion: '슬픔', color: '#4D96FF' },
                  { emotion: '보통', color: '#9E9E9E' },
                  { emotion: '화남', color: '#FF6B6B' },
                  { emotion: '불안', color: '#FFD93D' }
                ].map(({ emotion, color }) => (
                  <button
                    key={emotion}
                    onClick={() => handleSelectEmotion(emotion)}
                    className="flex flex-col items-center transition-all active:scale-93 border-0"
                    style={{
                      flex: 1,
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                      gap: '6px'
                    }}
                  >
                    <div
                      className="rounded-[8px] flex items-center justify-center"
                      style={{ width: '36px', height: '36px', backgroundColor: color, fontSize: '20px' }}
                    >
                      {EMOTION_EMOJIS[emotion]}
                    </div>
                    <span className="text-[white]" style={{ fontSize: '12px' }}>{emotion}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleDontSave}
                className="w-full text-[black] transition-all active:scale-93 border-0"
                style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                저장 안함
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
