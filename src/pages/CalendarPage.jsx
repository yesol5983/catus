//  CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ROUTES } from "../constants/routes";
import { EMOTION_COLORS } from "../constants/emotionColors";
import { mockDiaries } from "../mocks/diaryData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useDarkMode } from "../contexts/DarkModeContext";
import HomePage from "./HomePage";

export default function CalendarPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [diaryData, setDiaryData] = useLocalStorage('diary_data', {});
  const [showModeModal, setShowModeModal] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage('calendar_view_mode', 'calendar'); // 'calendar' or 'feed'
  const [feedFilter, setFeedFilter] = useState('my'); // 'my' or 'public'

  // SVG 이미지 생성 함수
  const createEmotionImage = (color, emoji) => {
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}"/>
        <text x="50%" y="50%" font-size="40" text-anchor="middle" dy=".35em">${emoji}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  //  Mock diary data from diaryData.js (localStorage가 비어있을 때만)
  useEffect(() => {
    // localStorage에 데이터가 없으면 mock 데이터로 초기화
    // 또는 기존 데이터에 via.placeholder.com이 있으면 다시 초기화
    const hasPlaceholderImages = Object.values(diaryData).some(
      diary => diary.image && diary.image.includes('via.placeholder.com')
    );

    if (Object.keys(diaryData).length === 0 || hasPlaceholderImages) {
      const processedData = Object.keys(mockDiaries).reduce((acc, dateKey) => {
        const diary = mockDiaries[dateKey];

        // 이미 image가 있으면 그대로 사용, 없으면 SVG 생성
        if (diary.image) {
          acc[dateKey] = {
            ...diary
          };
        } else {
          const emotionColorMap = {
            '행복': '#6BCB77',
            '슬픔': '#4D96FF',
            '불안': '#FFD93D',
            '화남': '#FF6B6B',
            '보통': '#9E9E9E'
          };
          const emotionEmojiMap = {
            '행복': '😊',
            '슬픔': '😢',
            '불안': '😰',
            '화남': '😠',
            '보통': '😐'
          };

          acc[dateKey] = {
            ...diary,
            image: createEmotionImage(emotionColorMap[diary.emotion], emotionEmojiMap[diary.emotion])
          };
        }
        return acc;
      }, {});

      setDiaryData(processedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayClick = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const diary = diaryData[dateStr];

    if (diary) {
      // 처음 확인하는 일기면 DiaryRevealPage로, 이미 본 일기면 DiaryDetailPage로
      if (!diary.isViewed) {
        navigate(`/diary-reveal/${dateStr}`);
      } else {
        navigate(`${ROUTES.DIARY}/${dateStr}`);
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const diary = diaryData[dateStr];

    if (diary && diary.image) {
      return (
        <div className="flex items-center justify-center mt-1">
          <div
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center border-[2px] overflow-hidden cursor-pointer hover:scale-110 transition-transform"
            style={{ borderColor: EMOTION_COLORS[diary.emotion] }}
          >
            <img
              src={diary.image}
              alt="diary"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/*  배경 페이지 (홈) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <HomePage />
      </div>

      {/*  캘린더 모달 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    rounded-[24px] w-[90%] max-w-[360px]
                    flex flex-col shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'transparent', zIndex: 1001 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >


          {/*  헤더  */}
          <div className="flex items-center justify-between px-[15px] py-[13px] bg-[#5F6F52] text-[white] rounded-t-[24px]">
            <button
              onClick={() => setShowModeModal(true)}
              className="text-2xl w-10 h-10 flex items-center justify-center hover:opacity-70 bg-transparent border-0 text-[white]"
            >
              ⋮
            </button>
            <div className="text-[15px] font-[600] text-[white]" >{viewMode === 'calendar' ? '캘린더' : '피드'}</div>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="text-[15px] w-10 h-10 flex items-center justify-center hover:opacity-70 bg-transparent border-0 text-[white]"
            >
              ×
            </button>
          </div>

          {/*  본문 */}
          <div className="pb-[12px] mb-0 flex flex-col shadow-md relative z-10" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '0 0 24px 24px' }}>
            {viewMode === 'calendar' ? (
              <Calendar
                value={currentDate}
                onActiveStartDateChange={({ activeStartDate }) => setCurrentDate(activeStartDate)}
                onClickDay={handleDayClick}
                tileContent={tileContent}
                locale="en-US"
                formatDay={(locale, date) => date.getDate().toString()}
                formatShortWeekday={(locale, date) => {
                  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                  return weekdays[date.getDay()];
                }}
                formatMonthYear={(locale, date) => {
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;
                  return `${year}년 ${month}월`;
                }}
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const day = date.getDay();
                    if (day === 0) return 'sunday';
                    if (day === 6) return 'saturday';
                  }
                  return null;
                }}
                next2Label={null}
                prev2Label={null}
              />
            ) : (
              /* 피드 모드 */
              <div className="w-[90%] mx-auto" style={{ height: '320px', minHeight: '320px' }}>
                {/* 탭 메뉴 */}
                <div className="flex gap-[8px] mb-[12px] pt-[12px]">
                  <button
                    onClick={() => setFeedFilter('my')}
                    className="flex-1 py-[8px] rounded-[8px] text-[13px] font-medium transition-all border-0"
                    style={{
                      backgroundColor: feedFilter === 'my' ? '#5F6F52' : 'transparent',
                      color: feedFilter === 'my' ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    내 일기
                  </button>
                  <button
                    onClick={() => setFeedFilter('public')}
                    className="flex-1 py-[8px] rounded-[8px] text-[13px] font-medium transition-all border-0"
                    style={{
                      backgroundColor: feedFilter === 'public' ? '#5F6F52' : 'transparent',
                      color: feedFilter === 'public' ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    공개한 일기
                  </button>
                </div>

                {/* 일기 그리드 */}
                <div className="overflow-y-auto pb-[12px]" style={{ height: 'calc(100% - 50px)' }}>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(diaryData)
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .filter(([dateKey, diary]) => {
                        // 내 일기: 모든 일기 표시
                        if (feedFilter === 'my') return true;
                        // 공개한 일기: isPrivate가 false이거나 정의되지 않은 경우 (기본값은 공개)
                        if (feedFilter === 'public') return !diary.isPrivate;
                        return true;
                      })
                      .map(([dateKey, diary]) => {
                      return (
                        <motion.div
                          key={dateKey}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-[8px] overflow-hidden shadow-sm border cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                          onClick={() => {
                            // 처음 확인하는 일기면 DiaryRevealPage로, 이미 본 일기면 DiaryDetailPage로
                            if (!diary.isViewed) {
                              navigate(`/diary-reveal/${dateKey}`);
                            } else {
                              navigate(`${ROUTES.DIARY}/${dateKey}`);
                            }
                          }}
                        >
                          {/* 이미지 */}
                          <div className="w-full aspect-square relative overflow-hidden">
                            <img
                              src={diary.image}
                              alt={diary.title}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            {/* 하얀색 사각형 (감정 색상 그림자) */}
                            <div
                              className="w-[13px] h-[13px] rounded-[4px]"
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '5.5px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                boxShadow: `2.5px 2.5px 0px ${EMOTION_COLORS[diary.emotion]}`
                              }}
                            />
                          </div>

                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 감정 색상 가이드 - 캘린더/피드 모드 공통 */}
            <div className="w-[90%] bg-[#f7f7f7] border border-[#E5E5E5] rounded-[12px] py-[4px] px-4 shadow-sm mx-auto mt-3 mb-5 flex flex-col items-center justify-center">
              <p className="text-[10px] font-semibold text-gray-700 mb-[3px] text-center">
                감정 색상 가이드
              </p>

              <div className="flex justify-center gap-[10px] text-[10px] text-gray-700 mb-[7px]">
                {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                  <div key={emotion} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-[4px] border border-gray-300"
                      style={{
                        backgroundColor: color || "#000",
                        display: "inline-block",
                        minWidth: "12px",
                        minHeight: "12px",
                      }}
                    />
                    <span>{emotion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오늘의 그림일기 쓰기 버튼 */}
          <div className="w-full flex justify-center pb-[6px] pt-[30px] -mt-[24px] rounded-b-[24px]" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f7f7f7' }}>
            <button
              className="w-[90%] py-[12px] bg-[#5F6F52] text-[white] rounded-[14px]
                         font-semibold text-[14px] shadow-md hover:opacity-90 transition-all border-0 outline-none"
              onClick={() => navigate(ROUTES.CHAT)}
            >
              오늘의 그림일기 쓰기
            </button>
          </div>
        </motion.div>
      </div>

      {/* react-calendar 커스텀 스타일 */}
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }

        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 8px;
        }

        .react-calendar__navigation button {
          min-width: 44px;
          background: transparent !important;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }

        .react-calendar__navigation button:hover,
        .react-calendar__navigation button:active,
        .react-calendar__navigation button:focus {
          background: transparent !important;
        }

        .react-calendar__navigation__label {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-primary);
          pointer-events: none;
        }

        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 11px;
          margin-bottom: 4px;
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 8px 0;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          color: var(--color-text-secondary);
        }

        .react-calendar__month-view__weekdays__weekday:nth-child(1) abbr {
          color: #FF6B6B;
        }

        .react-calendar__month-view__weekdays__weekday:nth-child(7) abbr {
          color: #4D96FF;
        }

        .react-calendar__month-view__days {
          gap: 2px;
          margin-bottom: 12px;
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }

        .react-calendar__month-view {
          transition: none !important;
        }

        .react-calendar__viewContainer {
          transition: none !important;
        }

        .react-calendar__tile {
          min-height: 50px;
          padding: 0;
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          border-radius: 6px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .react-calendar__tile abbr {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-primary);
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-top: 4px;
        }


        .react-calendar__tile--now abbr {
          background-color: #C8E6C9;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transform: scale(1.05);
        }

        .react-calendar__tile--active {
          background: transparent;
        }

        .react-calendar__tile:enabled:hover {
          background: rgba(95, 111, 82, 0.1);
        }

        .react-calendar__tile--neighboringMonth {
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          pointer-events: none !important;
          overflow: hidden !important;
        }

        .react-calendar__tile--neighboringMonth * {
          display: none !important;
        }

        .react-calendar__month-view__days__day--neighboringMonth {
          visibility: hidden !important;
          height: 0 !important;
        }
      `}</style>

      {/* 모드 선택 모달 */}
      <AnimatePresence>
        {showModeModal && (
          <>
            {/* 배경 오버레이 */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 10000
              }}
              onClick={() => setShowModeModal(false)}
            />

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
                보기 모드 선택
              </h2>
              <div className="flex flex-col gap-[12px]">
                <button
                  onClick={() => {
                    setViewMode('calendar');
                    setShowModeModal(false);
                  }}
                  className={`w-full py-[14px] rounded-[12px] text-[15px] font-medium transition-opacity border-0 ${
                    viewMode === 'calendar' ? 'bg-[#5F6F52] text-[#FFFFFF]' : ''
                  }`}
                  style={viewMode === 'calendar' ? {} : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                >
                  캘린더 모드
                </button>
                <button
                  onClick={() => {
                    setViewMode('feed');
                    setShowModeModal(false);
                  }}
                  className={`w-full py-[14px] rounded-[12px] text-[15px] font-medium transition-opacity border-0 ${
                    viewMode === 'feed' ? 'bg-[#5F6F52] text-[#FFFFFF]' : ''
                  }`}
                  style={viewMode === 'feed' ? {} : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                >
                  피드 모드
                </button>
                <button
                  onClick={() => setShowModeModal(false)}
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
    </>
  );
}
