import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useDarkMode } from "../contexts/DarkModeContext";
import earthIcon from "../assets/images/earth.png";
import airplaneIcon from "../assets/images/airplane.svg";

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const { isDarkMode } = useDarkMode();
  const [diaryData, setDiaryData] = useLocalStorage("diary_data", {});
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [editedSummary, setEditedSummary] = useState("");
  const scrollContainerRef = React.useRef(null);

  const diary = diaryData[date];

  // diary의 isPrivate 값으로 초기화
  useEffect(() => {
    if (diary) {
      setIsPrivate(diary.isPrivate || false);
    }
  }, [diary]);

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  const handlePrivateToggle = () => {
    const newPrivateState = !isPrivate;
    setIsPrivate(newPrivateState);

    // localStorage에 저장
    setDiaryData({
      ...diaryData,
      [date]: {
        ...diary,
        isPrivate: newPrivateState
      }
    });

    if (newPrivateState) {
      setToastMessage("일기를 나만 볼 수 있게 수정했어요");
    } else {
      setToastMessage("일기가 모두에게 공유되었어요");
    }

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleDeleteClick = () => {
    setShowEditModal(false);
    setTimeout(() => {
      setShowDeleteModal(true);
    }, 250);
  };

  const handleDeleteConfirm = () => {
    // TODO: 실제로는 API 호출하여 localStorage에서 삭제
    console.log('일기 삭제:', date);
    setShowDeleteModal(false);
    navigate(ROUTES.CALENDAR);
  };

  const handleEditDiary = () => {
    // 일기 관리 모달 닫고 수정 화면 열기
    setSelectedEmotion(diary?.emotion || "보통");
    setEditedSummary(diary?.summary || "");
    setShowEditModal(false);
    setTimeout(() => {
      setShowEditSheet(true);
    }, 250);
  };

  const prevQuote = () => {
    if (currentQuoteIndex > 0) {
      const newIndex = currentQuoteIndex - 1;
      setCurrentQuoteIndex(newIndex);
      scrollToMessage(newIndex);
    }
  };
  const nextQuote = () => {
    const messages = diary?.encouragementMessages || [];
    if (currentQuoteIndex < messages.length - 1) {
      const newIndex = currentQuoteIndex + 1;
      setCurrentQuoteIndex(newIndex);
      scrollToMessage(newIndex);
    }
  };

  const scrollToMessage = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const messageWidth = container.scrollWidth / (diary?.encouragementMessages?.length || 1);
      container.scrollTo({
        left: messageWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const messageWidth = container.scrollWidth / (diary?.encouragementMessages?.length || 1);
      const currentIndex = Math.round(container.scrollLeft / messageWidth);
      setCurrentQuoteIndex(currentIndex);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      행복: "#8EC7A9",
      슬픔: "#AFCBFF",
      불안: "#FDE68A",
      화남: "#FCA5A5",
      보통: "#D4D4D4",
    };
    return colors[emotion] || "#AFCBFF";
  };

  if (!diary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-main-bg)' }}>
        <div className="text-5xl mb-4">📭</div>
        <p>이 날짜에는 기록된 일기가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--color-main-bg)' }}>
      {/* 토스트 알림 - 화면 중앙 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#5E705790] bg-opacity-90 text-[#FFFFFF] text-[14px] px-[20px] py-[12px] rounded-[12px] shadow-lg"
            style={{ minWidth: '250px', textAlign: 'center' }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-[12px] py-[12px] relative" style={{ backgroundColor: 'var(--color-bg-card)', zIndex: 1 }}>
        <button
          onClick={() => navigate(ROUTES.CALENDAR)}
          className="text-[#5E7057] hover:opacity-70 text-[20px] bg-transparent border-0"
          style={{ marginTop: '-5px' }}
        >
          ←
        </button>
        <div className="text-[16px] font-[600] text-[#5E7057]">
          {formatDate(date)}
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="text-[#5E7057] hover:opacity-70 text-[20px] bg-transparent border-0"
          style={{ marginTop: '-4px' }}
        >
          ⋯
        </button>
      </div>

      {/*  본문 */}
      <div className="flex-1 overflow-y-auto px-[20px]" style={{ position: 'relative', zIndex: 1 }}>
        {/* 이미지 카드 */}
        {diary.image && (
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src={diary.image}
            alt="일기 이미지"
            className="w-full aspect-square object-cover rounded-[20px] my-[16px] mx-auto block max-h-[400px] max-w-[400px]"
          />
        )}

        {/* 오늘의 기분 카드 */}
        <div className="rounded-[20px] shadow-sm px-[20px] py-[16px] my-[16px]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          {/* 감정 색상 + 텍스트 */}
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div
              className="w-[25px] h-[25px] rounded-[4px] flex-shrink-0"
              style={{ backgroundColor: getEmotionColor(diary.emotion) }}
            ></div>
            <div>
              <div className="text-[15px] font-[600]" style={{ color: 'var(--color-text-primary)' }}>
                오늘의 기분
              </div>
              <div className="text-[13px] font-[500]" style={{ color: 'var(--color-text-secondary)' }}>
                {diary.title || "약간은 슬펐던 하루"}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t my-[12px]" style={{ borderColor: 'var(--color-border)' }}></div>

          {/* AI의 속삭임 */}
          <div>
            <div className="text-[15px] font-[600] mb-[8px]" style={{ color: 'var(--color-text-primary)' }}>
              AI의 속삭임
            </div>
            <div className="text-[13px] font-[500] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {diary.summary ||
                "조용한 숲속의 가벼운 바람소리를 들으며 한숨 돌릴 수 있었던 하루네요. 자연이 주는 위로를 느낄 수 있었던 시간이에요."}
            </div>
          </div>
        </div>

        {/* 비공개하기 카드 */}
        <div className="rounded-[20px] shadow-sm px-[20px] py-[16px] my-[16px] flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="font-[600] flex items-center gap-[12px] text-[15px]" style={{ color: 'var(--color-text-primary)' }}>
            <img
              src={earthIcon}
              alt="earth"
              className="w-[18px] h-[18px]"
            />
            비공개하기
          </div>
          <div
            onClick={handlePrivateToggle}
            className={`relative w-[51px] h-[31px] rounded-full cursor-pointer transition-all duration-300 flex-shrink-0 ${
              isPrivate ? "bg-[#5E7057]" : "bg-[#D1D5DB]"
            }`}
            style={{
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div
              className={`absolute top-[3px] w-[25px] h-[25px] bg-[#FFFFFF] rounded-full transition-all duration-300 ${
                isPrivate ? "left-[23px]" : "left-[3px]"
              }`}
              style={{
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
              }}
            />
          </div>
        </div>

        {/* 응원 메시지 카드 */}
        {diary.encouragementMessages &&
          diary.encouragementMessages.length > 0 && (
            <div className="rounded-[20px] shadow-sm px-5 py-5 my-[16px]" >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-[12px]">
                  <img
                    src={airplaneIcon}
                    alt="airplane"
                    className="w-[18px] h-[18px]"
                    style={{
                      filter: 'brightness(0) saturate(100%) invert(42%) sepia(11%) saturate(789%) hue-rotate(62deg) brightness(95%) contrast(87%)',
                      transform: 'scaleX(-1)'
                    }}
                  />
                  <div className="text-[15px] font-[600]" style={{ color: 'var(--color-text-primary)' }}>
                    날아온 응원 메시지
                  </div>
                </div>

                
              </div>

              {/* 메시지 본문 - 가로 스크롤 */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="overflow-x-scroll scrollbar-hide mb-3 mt-[12px]"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex gap-[12px]">
                  {diary.encouragementMessages.map((message, index) => (
                    <div
                      key={index}
                      className="text-[13px] font-[500] leading-relaxed px-[12px] py-[16px] rounded-[16px] flex-shrink-0"
                      style={{
                        width: '60%',
                        scrollSnapAlign: 'start',
                        backgroundColor: index % 2 === 0 ? 'rgba(163, 184, 153, 0.3)' : 'var(--color-bg-card)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {message}
                    </div>
                  ))}
                </div>
              </div>

              {/* 페이지 인디케이터 */}
              <div className="flex items-center justify-center gap-[6px] py-[8px]">
                {(() => {
                  const totalMessages = diary.encouragementMessages.length;
                  const maxVisible = 5;

                  if (totalMessages <= maxVisible) {
                    // 메시지가 5개 이하면 전부 표시
                    return diary.encouragementMessages.map((_, index) => (
                      <div
                        key={index}
                        className="transition-all duration-300 rounded-full"
                        style={{
                          backgroundColor: index === currentQuoteIndex ? "#1F2937" : "#9CA3AF",
                          width: index === currentQuoteIndex ? "8px" : "6px",
                          height: index === currentQuoteIndex ? "8px" : "6px"
                        }}
                      />
                    ));
                  } else {
                    // 5개 이상이면 현재 위치 기준으로 5개만 표시
                    let startIndex = Math.max(0, currentQuoteIndex - 2);
                    let endIndex = Math.min(totalMessages - 1, startIndex + maxVisible - 1);

                    // 끝쪽에서는 앞으로 당김
                    if (endIndex - startIndex < maxVisible - 1) {
                      startIndex = Math.max(0, endIndex - maxVisible + 1);
                    }

                    const visibleIndices = [];
                    for (let i = startIndex; i <= endIndex; i++) {
                      visibleIndices.push(i);
                    }

                    return visibleIndices.map((index) => (
                      <div
                        key={index}
                        className="transition-all duration-300 rounded-full"
                        style={{
                          backgroundColor: index === currentQuoteIndex ? "#1F2937" : "#9CA3AF",
                          width: index === currentQuoteIndex ? "8px" : "6px",
                          height: index === currentQuoteIndex ? "8px" : "6px"
                        }}
                      />
                    ));
                  }
                })()}
              </div>
            </div>
          )}
      </div>

      {/* 공통 배경 오버레이 */}
      {(showEditModal || showDeleteModal || showEditSheet) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000
          }}
          onClick={() => {
            if (showEditModal) setShowEditModal(false);
            if (showDeleteModal) setShowDeleteModal(false);
            if (showEditSheet) setShowEditSheet(false);
          }}
        />
      )}

      {/* 일기 수정 모달 */}
      <AnimatePresence>
        {showEditModal && (
          <>
            {/* 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] p-[24px] w-[85%] max-w-[320px]"
              style={{ backgroundColor: 'var(--color-bg-card)', zIndex: 10001 }}
            >
              <h2 className="text-[18px] font-semibold mb-[20px] text-center" style={{ color: 'var(--color-text-primary)' }}>
                일기 관리
              </h2>
              <div className="flex flex-col gap-[12px]">
                <button
                  onClick={handleEditDiary}
                  className="w-full py-[14px] bg-[#5E7057] text-[#FFFFFF] rounded-[12px] text-[15px] font-medium hover:opacity-90 transition-opacity border-0"
                >
                  일기 수정하기
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full py-[14px] rounded-[12px] text-[15px] font-medium hover:bg-red-50 transition-colors border border-[#5E7057]"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: isDarkMode ? 'white' : 'var(--color-text-primary)' }}
                >
                  일기 삭제하기
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-full py-[14px] rounded-[12px] text-[15px] font-medium transition-colors border-0"
                  style={{ backgroundColor: 'rgba(128, 128, 128, 0.2)', color: 'var(--color-text-primary)' }}
                >
                  취소
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] p-[24px] w-[85%] max-w-[320px]"
              style={{ backgroundColor: 'var(--color-bg-card)', zIndex: 10001 }}
            >
              <div className="text-[40px] text-center mb-[16px]">⚠️</div>
              <h2 className="text-[18px] font-semibold mb-[12px] text-center" style={{ color: 'var(--color-text-primary)' }}>
                일기를 삭제할까요?
              </h2>
              <p className="text-[14px] mb-[24px] text-center leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                삭제한 일기는 복구할 수 없어요.<br />
                정말 삭제하시겠어요?
              </p>
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-[14px] rounded-[12px] text-[15px] font-medium transition-colors border-0"
                  style={{ backgroundColor: 'rgba(128, 128, 128, 0.2)', color: 'var(--color-text-primary)' }}
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-[14px] bg-[black] text-[white] rounded-[12px] text-[15px] font-medium hover:bg-red-50 transition-colors border border-red-500"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 일기 수정 화면 - Bottom Sheet */}
      <AnimatePresence>
        {showEditSheet && (
          <div
            onClick={() => setShowEditSheet(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full rounded-t-[24px] p-[24px] pb-[32px] max-h-[80vh] overflow-y-auto relative"
              style={{ backgroundColor: 'var(--color-bg-card)', zIndex: 10001 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-[16px] font-semibold mb-[24px] text-center" style={{ color: 'var(--color-text-primary)' }}>
                일기 수정하기
              </h2>

              {/* 오늘의 기분 */}
              <div className="mb-[24px]">
                <label className="text-[14px] mb-[12px] block" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  오늘의 기분
                </label>
                <div className="flex justify-between gap-[8px]">
                  {[
                    { emotion: '행복', color: '#6BCB77' },
                    { emotion: '슬픔', color: '#4D96FF' },
                    { emotion: '보통', color: '#9E9E9E' },
                    { emotion: '화남', color: '#FF6B6B' },
                    { emotion: '불안', color: '#FFD93D' }
                  ].map(({ emotion, color }) => (
                    <button
                      key={emotion}
                      onClick={() => setSelectedEmotion(emotion)}
                      className="flex flex-col items-center gap-[6px] flex-1 py-[10px] px-[8px] rounded-[12px] transition-all border-0"
                      style={{
                        backgroundColor: selectedEmotion === emotion ? `${color}20` : 'transparent'
                      }}
                    >
                      <div
                        className="w-[36px] h-[36px] rounded-[8px]"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[12px]" style={{ color: 'var(--color-text-primary)' }}>{emotion}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI의 속삭임 */}
              <div className="mb-[24px]">
                <label className="text-[14px] mb-[12px] block" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  AI의 속삭임
                </label>
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  placeholder="오늘의 속삭임을 기록해 보세요. 말하고 싶었지만 말하지 못했던 것들 멀어지던 아쉬웠던 생각들이 흐릿한 안개가 내린 것처럼 흩날렸다. 소중한 시간이었어요. 꾸준히 꾸준히 위로의 길이 날개 없이 열릴 것이다"
                  className="w-full rounded-[12px] text-[13px] min-h-[120px] resize-none"
                  style={{
                    outline: 'none',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)'
                  }}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setShowEditSheet(false)}
                  className="flex-1 py-[14px] rounded-[12px] text-[15px] font-medium"
                  style={{
                    backgroundColor: 'rgba(128, 128, 128, 0.2)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // TODO: 수정 저장 로직
                    console.log('일기 수정 저장:', { emotion: selectedEmotion, summary: editedSummary });
                    setShowEditSheet(false);
                  }}
                  className="flex-1 py-[14px] rounded-[12px] text-[15px] font-medium border-0"
                  style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 스크롤바 숨기기 CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
