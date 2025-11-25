import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../constants/routes';
import { messageApi } from '../utils/api';
import HomePage from './HomePage';

export default function MessagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 받은 메시지 조회 (백엔드: GET /api/message/received)
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', 'received'],
    queryFn: async () => {
      return await messageApi.getReceived();
    },
    retry: 2,
  });

  // 메시지 읽음 처리 Mutation (백엔드: PUT /api/message/read/{id})
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await messageApi.markAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'notifications'] });
    },
    onError: (error: any) => {
      console.error('메시지 읽음 처리 실패:', error);
    },
  });

  const messages = messagesData?.messages || [];
  const totalMessages = messages.length;
  const currentMessage = messages[currentIndex];

  // 현재 메시지가 안읽음이면 읽음 처리
  useEffect(() => {
    if (currentMessage && !currentMessage.isRead) {
      markAsReadMutation.mutate(currentMessage.id);
    }
  }, [currentIndex, currentMessage?.id]);

  // 이전 메시지로 이동
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 다음 메시지로 이동
  const handleNext = () => {
    if (currentIndex < totalMessages - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 기본 일기 이미지 생성 (SVG)
  const createDefaultDiaryImage = (): string => {
    const svg = `
      <svg width="260" height="260" xmlns="http://www.w3.org/2000/svg">
        <rect width="260" height="260" fill="#F9F9F9"/>
        <text x="50%" y="50%" font-size="20" fill="#8B9A8E" text-anchor="middle" dy=".35em">그림일기</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일의 그림일기`;
  };

  // 로딩 중
  if (isLoading) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <HomePage />
        </div>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E7057] mx-auto mb-4"></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>메시지를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  // 에러
  if (error) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <HomePage />
        </div>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-center p-8">
            <p style={{ color: 'var(--color-text-secondary)' }} className="mb-6">
              메시지를 불러올 수 없습니다 😢
            </p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="px-6 py-3 bg-[#5E7057] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  // 메시지 없음
  if (totalMessages === 0) {
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <HomePage />
        </div>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            className="rounded-[24px] w-[90%] max-w-[360px] p-[24px] text-center"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-5xl mb-4">📭</div>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-[15px] font-semibold mb-2">
              받은 메시지가 없습니다
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-[13px] mb-6">
              다른 사람들이 보낸 응원 메시지가 여기에 표시됩니다
            </p>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="px-6 py-3 bg-[#5E7057] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 백그라운드로 HomePage 렌더링 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <HomePage />
      </div>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          className="relative rounded-[24px] w-[90%] max-w-[360px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-card)', perspective: '1200px' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 편지 봉투 뚜껑 (직사각형) */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '80px',
              backgroundColor: '#C9A961',
              borderRadius: '24px 24px 0 0',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              zIndex: 10,
              pointerEvents: 'none',
            }}
            initial={{ rotateX: 0, opacity: 1 }}
            animate={{ rotateX: -120, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: 'easeInOut' }}
          />

          {/* 편지 내용 */}
          <motion.div
            className="overflow-y-auto flex-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            {/* 헤더 */}
            <div className="px-[16px] pt-[12px] pb-[12px] flex items-start justify-between">
              <div className="text-left">
                <h2
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {currentMessage?.receivedAt
                    ? formatDate(currentMessage.receivedAt)
                    : '응원 메시지'}
                </h2>
              </div>
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="text-[26px] leading-none bg-transparent border-0"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ×
              </button>
            </div>

            {/* 그림일기 이미지 */}
            <div className="px-[16px] mb-[12px]" style={{ position: 'relative', overflow: 'hidden' }}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="p-[12px] rounded-xl shadow-sm border"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <img
                    src={(currentMessage as any)?.thumbnailUrl || createDefaultDiaryImage()}
                    alt="일기 그림"
                    className="w-full h-[260px] rounded-md object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 네비게이션 영역 */}
            {totalMessages > 1 && (
              <div
                className="mb-[12px] px-[16px] flex items-center justify-between"
                style={{
                  zIndex: 50,
                  position: 'relative',
                }}
              >
                {/* 좌측 화살표 */}
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="w-[32px] h-[32px] rounded-full bg-[#EAEAEA] text-gray-800 flex items-center justify-center
                            disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#DADADA] transition-all"
                  style={{
                    fontSize: '20px',
                    lineHeight: '1',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                  }}
                >
                  ‹
                </button>

                {/* 페이지 인디케이터 */}
                {totalMessages <= 7 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minWidth: '80px',
                      height: '32px',
                    }}
                  >
                    {messages.map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: index === currentIndex ? '8px' : '6px',
                          height: index === currentIndex ? '8px' : '6px',
                          borderRadius: '50%',
                          backgroundColor: index === currentIndex ? '#000000' : '#9CA3AF',
                          flexShrink: 0,
                          transition: 'all 0.3s',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '80px',
                      height: '32px',
                      overflow: 'hidden',
                      paddingLeft: '6px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'transform 0.3s ease-in-out',
                        transform: (() => {
                          const total = messages.length;
                          if (currentIndex <= 2) return 'translateX(0px)';
                          if (currentIndex >= total - 3) {
                            const offset = (total - 6) * 12;
                            return `translateX(-${offset}px)`;
                          }
                          return `translateX(-${(currentIndex - 2) * 12}px)`;
                        })(),
                      }}
                    >
                      {messages.map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: index === currentIndex ? '8px' : '6px',
                            height: index === currentIndex ? '8px' : '6px',
                            borderRadius: '50%',
                            backgroundColor: index === currentIndex ? '#000000' : '#9CA3AF',
                            flexShrink: 0,
                            transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 우측 화살표 */}
                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalMessages - 1}
                  className="w-[32px] h-[32px] rounded-full bg-[#EAEAEA] text-gray-800 flex items-center justify-center
                            disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#DADADA] transition-all"
                  style={{
                    fontSize: '20px',
                    lineHeight: '1',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                  }}
                >
                  ›
                </button>
              </div>
            )}

            {/* 메시지 내용 */}
            <div className="px-[16px] pb-[20px] relative" style={{ overflow: 'hidden' }}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex + '-message'}
                  custom={direction}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <p
                    className="text-[13px] mb-[4px] leading-relaxed whitespace-pre-line"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {currentMessage?.content || '응원 메시지가 없습니다.'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    - 익명의 친구로부터
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* 메시지 개수 표시 */}
              {totalMessages > 1 && (
                <div
                  className="absolute bottom-[20px] right-[16px] text-[10px]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {totalMessages}개의 메시지
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
