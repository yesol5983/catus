import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SettingsPage() {
  const navigate = useNavigate();

  // 개별 항목 펼침/접힘 상태
  const [expandedItems, setExpandedItems] = useState({
    nickname: false,
    password: false,
    diaryTime: false
  });

  // 계정 관리 상태
  const [userNickname, setUserNickname] = useState('사용자123');
  const [newNickname, setNewNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 일기 설정 상태
  const [diaryTime, setDiaryTime] = useState({ hour: '09', minute: '00', period: 'PM' });
  const [tempDiaryTime, setTempDiaryTime] = useState({ hour: '09', minute: '00', period: 'PM' });
  const [aiStyle, setAiStyle] = useState('casual');

  // 알람 설정 상태
  const [notifications, setNotifications] = useState({
    diaryCreation: true,
    encouragement: true
  });

  // 저장 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveType, setSaveType] = useState(''); // 'nickname', 'password', 'diaryTime'

  // 개별 항목 토글
  const toggleItem = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // 토글 스위치
  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // 닉네임 저장
  const handleSaveNickname = () => {
    if (!newNickname) {
      alert('새 닉네임을 입력해주세요.');
      return;
    }

    // 로딩 모달 표시
    setShowSaveModal(true);
    setSaveSuccess(false);
    setSaveType('nickname');

    // 저장 처리 (실제로는 API 호출)
    setTimeout(() => {
      setUserNickname(newNickname);
      setSaveSuccess(true);
    }, 1000);
  };

  // 닉네임 취소
  const handleCancelNickname = () => {
    setNewNickname('');
    setExpandedItems(prev => ({ ...prev, nickname: false }));
  };

  // 비밀번호 저장
  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 로딩 모달 표시
    setShowSaveModal(true);
    setSaveSuccess(false);
    setSaveType('password');

    // 저장 처리 (실제로는 API 호출)
    setTimeout(() => {
      setSaveSuccess(true);
    }, 1000);
  };

  // 비밀번호 취소
  const handleCancelPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setExpandedItems(prev => ({ ...prev, password: false }));
  };

  // 일기 시간 변경 시작
  const handleOpenDiaryTime = () => {
    setTempDiaryTime(diaryTime);
    toggleItem('diaryTime');
  };

  // 일기 시간 저장
  const handleSaveDiaryTime = () => {
    // 로딩 모달 표시
    setShowSaveModal(true);
    setSaveSuccess(false);
    setSaveType('diaryTime');

    // 저장 처리 (실제로는 API 호출)
    setTimeout(() => {
      setDiaryTime(tempDiaryTime);
      setSaveSuccess(true);
    }, 1000);
  };

  // 일기 시간 취소
  const handleCancelDiaryTime = () => {
    setTempDiaryTime(diaryTime);
    setExpandedItems(prev => ({ ...prev, diaryTime: false }));
  };

  // AI 스타일 토글
  const handleToggleAiStyle = (style) => {
    setAiStyle(style);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    if (saveType === 'nickname') {
      setNewNickname('');
      setExpandedItems(prev => ({ ...prev, nickname: false }));
    } else if (saveType === 'password') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setExpandedItems(prev => ({ ...prev, password: false }));
    } else if (saveType === 'diaryTime') {
      setExpandedItems(prev => ({ ...prev, diaryTime: false }));
    }
    setShowSaveModal(false);
    setSaveSuccess(false);
    setSaveType('');
  };

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F0' }}>
      {/* 헤더 */}
      <div className="relative flex items-center justify-center bg-white" style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          className="absolute left-[20px] text-[#333] bg-transparent border-0 cursor-pointer transition-all active:scale-93"
          style={{ fontSize: '28px', paddingLeft: '8px', paddingRight: '8px', transform: 'translateY(-2px)' }}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          &lt;
        </button>
        <h1 className="text-[#333] font-semibold" style={{ fontSize: '18px', margin: 0 }}>사용자 정보 수정</h1>
      </div>

      {/* 컨텐츠 */}
      <div style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* 계정 관리 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 className="text-[#999] font-semibold text-center" style={{ fontSize: '12px', margin: '0 0 8px 0', paddingLeft: '16px', paddingRight: '16px' }}>계정 관리</h3>
          <div className="bg-[white]" style={{ borderRadius: '16px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '8px' }}>
              {/* 닉네임 변경 */}
              <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }} onClick={() => toggleItem('nickname')}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>닉네임 변경</span>
                <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
              </div>
              <AnimatePresence>
              {expandedItems.nickname && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                <div style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '0px', paddingRight: '0px', borderBottom: '1px solid #f0f0f0' }}>
                  <div className="text-[#666] font-semibold" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '6px' }}>현재 닉네임</div>
                  <input
                    type="text"
                    className="w-full bg-[#f5f5f5] text-[#666] border border-[#e0e0e0] cursor-not-allowed"
                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' }}
                    value={userNickname}
                    readOnly
                  />
                  <div className="text-[#666] font-semibold" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '6px' }}>새 닉네임</div>
                  <input
                    type="text"
                    className="w-full border border-[#e0e0e0] focus:outline-none focus:border-[#5F6F52]"
                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' }}
                    placeholder="새 닉네임을 입력하세요"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                  />
                  <div className="flex" style={{ gap: '8px', marginTop: '16px' }}>
                    <button
                      className="flex-1 bg-white text-[#666] font-semibold cursor-pointer transition-all active:scale-93"
                      style={{ paddingTop: '12px', paddingBottom: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleCancelNickname}
                    >
                      취소
                    </button>
                    <button
                      className="flex-1 text-[#FFFFFF] font-semibold cursor-pointer transition-all active:scale-93 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ paddingTop: '12px', paddingBottom: '12px', backgroundColor: !newNickname ? '#ccc' : '#a3b899', border: 'none', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleSaveNickname}
                      disabled={!newNickname}
                    >
                      변경
                    </button>
                  </div>
                </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* 비밀번호 변경 */}
              <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px' }} onClick={() => toggleItem('password')}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>비밀번호 변경</span>
                <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
              </div>
              <AnimatePresence>
              {expandedItems.password && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                <div style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '0px', paddingRight: '0px' }}>
                  <div className="text-[#666] font-semibold" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '6px' }}>현재 비밀번호</div>
                  <input
                    type="password"
                    className="w-full border border-[#e0e0e0] focus:outline-none focus:border-[#5F6F52]"
                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' }}
                    placeholder="현재 비밀번호를 입력하세요"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <div className="text-[#666] font-semibold" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '6px' }}>새 비밀번호</div>
                  <input
                    type="password"
                    className="w-full border border-[#e0e0e0] focus:outline-none focus:border-[#5F6F52]"
                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' }}
                    placeholder="새 비밀번호를 입력하세요"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="text-[#666] font-semibold" style={{ fontSize: '13px', marginTop: '16px', marginBottom: '6px' }}>새 비밀번호 확인</div>
                  <input
                    type="password"
                    className="w-full border border-[#e0e0e0] focus:outline-none focus:border-[#5F6F52]"
                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box' }}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="flex" style={{ gap: '8px', marginTop: '16px' }}>
                    <button
                      className="flex-1 bg-white text-[#666] font-semibold cursor-pointer transition-all active:scale-93"
                      style={{ paddingTop: '12px', paddingBottom: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleCancelPassword}
                    >
                      취소
                    </button>
                    <button
                      className="flex-1 text-[white] font-semibold cursor-pointer transition-all active:scale-93 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ paddingTop: '12px', paddingBottom: '12px', backgroundColor: (!currentPassword || !newPassword || !confirmPassword) ? '#ccc' : '#a3b899', border: 'none', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleSavePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                    >
                      변경
                    </button>
                  </div>
                </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
        </div>

        {/* 일기 설정 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 className="text-[#999] font-semibold text-center" style={{ fontSize: '12px', margin: '0 0 8px 0', paddingLeft: '16px', paddingRight: '16px' }}>일기 설정</h3>
          <div className="bg-[white]" style={{ borderRadius: '16px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '8px' }}>
              {/* 그림일기 생성 시간 */}
              <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }} onClick={handleOpenDiaryTime}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>그림일기 생성 시간</span>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span className="text-[#999]" style={{ fontSize: '14px' }}>{diaryTime.period === 'AM' ? '오전' : '오후'} {diaryTime.hour}:{diaryTime.minute}</span>
                  <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
                </div>
              </div>
              <AnimatePresence>
              {expandedItems.diaryTime && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                <div style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '0px', paddingRight: '0px', borderBottom: '1px solid #f0f0f0' }}>
                  <div className="flex justify-around items-center" style={{ gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
                    <div className="flex flex-col items-center">
                      <span className="text-[#999]" style={{ fontSize: '13px', marginBottom: '6px' }}>오전/오후</span>
                      <select
                        className="border border-[#e0e0e0] bg-white cursor-pointer focus:outline-none focus:border-[#5F6F52]"
                        style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '8px', fontSize: '15px' }}
                        value={tempDiaryTime.period}
                        onChange={(e) => setTempDiaryTime(prev => ({ ...prev, period: e.target.value }))}
                      >
                        <option value="AM">오전</option>
                        <option value="PM">오후</option>
                      </select>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[#999]" style={{ fontSize: '13px', marginBottom: '6px' }}>시</span>
                      <select
                        className="border border-[#e0e0e0] bg-white cursor-pointer focus:outline-none focus:border-[#5F6F52]"
                        style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '8px', fontSize: '15px' }}
                        value={tempDiaryTime.hour}
                        onChange={(e) => setTempDiaryTime(prev => ({ ...prev, hour: e.target.value }))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[#999]" style={{ fontSize: '13px', marginBottom: '6px' }}>분</span>
                      <select
                        className="border border-[#e0e0e0] bg-white cursor-pointer focus:outline-none focus:border-[#5F6F52]"
                        style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '8px', fontSize: '15px' }}
                        value={tempDiaryTime.minute}
                        onChange={(e) => setTempDiaryTime(prev => ({ ...prev, minute: e.target.value }))}
                      >
                        {['00', '15', '30', '45'].map(minute => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex" style={{ gap: '8px', marginTop: '16px' }}>
                    <button
                      className="flex-1 bg-white text-[#666] font-semibold cursor-pointer transition-all active:scale-93"
                      style={{ paddingTop: '12px', paddingBottom: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleCancelDiaryTime}
                    >
                      취소
                    </button>
                    <button
                      className="flex-1 text-[white] font-semibold cursor-pointer transition-all active:scale-93"
                      style={{ paddingTop: '12px', paddingBottom: '12px', backgroundColor: '#a3b899', border: 'none', borderRadius: '12px', fontSize: '14px' }}
                      onClick={handleSaveDiaryTime}
                    >
                      저장
                    </button>
                  </div>
                </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* AI 대화 스타일 */}
              <div className="flex justify-between items-center" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>AI 대화 스타일 (반말)</span>
                <div
                  onClick={() => handleToggleAiStyle(aiStyle === 'casual' ? 'formal' : 'casual')}
                  className={`relative w-[51px] h-[31px] rounded-full cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    aiStyle === 'casual' ? "bg-[#a3b899]" : "bg-[#D1D5DB]"
                  }`}
                  style={{
                    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div
                    className={`absolute top-[3px] w-[25px] h-[25px] bg-[#FFFFFF] rounded-full transition-all duration-300 ${
                      aiStyle === 'casual' ? "left-[23px]" : "left-[3px]"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                    }}
                  />
                </div>
              </div>
            </div>
        </div>

        {/* 알람 설정 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 className="text-[#999] font-semibold text-center" style={{ fontSize: '12px', margin: '0 0 8px 0', paddingLeft: '16px', paddingRight: '16px' }}>알람 설정</h3>
          <div className="bg-[white]" style={{ borderRadius: '16px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '8px' }}>
              {/* 일기 생성 알림 */}
              <div className="flex justify-between items-center" style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>일기 생성 알림</span>
                <div
                  onClick={() => toggleNotification('diaryCreation')}
                  className={`relative w-[51px] h-[31px] rounded-full cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    notifications.diaryCreation ? "bg-[#a3b899]" : "bg-[#D1D5DB]"
                  }`}
                  style={{
                    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div
                    className={`absolute top-[3px] w-[25px] h-[25px] bg-[#FFFFFF] rounded-full transition-all duration-300 ${
                      notifications.diaryCreation ? "left-[23px]" : "left-[3px]"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                    }}
                  />
                </div>
              </div>

              {/* 응원 메시지 알림 */}
              <div className="flex justify-between items-center" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                <span className="text-[#333]" style={{ fontSize: '15px' }}>응원 메시지 알림</span>
                <div
                  onClick={() => toggleNotification('encouragement')}
                  className={`relative w-[51px] h-[31px] rounded-full cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    notifications.encouragement ? "bg-[#a3b899]" : "bg-[#D1D5DB]"
                  }`}
                  style={{
                    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div
                    className={`absolute top-[3px] w-[25px] h-[25px] bg-[#FFFFFF] rounded-full transition-all duration-300 ${
                      notifications.encouragement ? "left-[23px]" : "left-[3px]"
                    }`}
                    style={{
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                    }}
                  />
                </div>
              </div>
            </div>
        </div>

        {/* 기타 */}
        <div style={{ marginBottom: '8px' }}>
          <h3 className="text-[#999] font-semibold text-center" style={{ fontSize: '12px', margin: '0 0 8px 0', paddingLeft: '16px', paddingRight: '16px' }}>기타</h3>
          <div className="bg-[white]" style={{ borderRadius: '16px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '0px' }}>
            {/* 서비스 이용약관 */}
            <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }} onClick={() => console.log('서비스 이용약관')}>
              <span className="text-[#333]" style={{ fontSize: '15px' }}>서비스 이용약관</span>
              <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
            </div>

            {/* 개인정보 처리방침 */}
            <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }} onClick={() => console.log('개인정보 처리방침')}>
              <span className="text-[#333]" style={{ fontSize: '15px' }}>개인정보 처리방침</span>
              <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
            </div>

            {/* 문의하기 */}
            <div className="flex justify-between items-center cursor-pointer transition-all active:scale-98" style={{ paddingTop: '16px', paddingBottom: '16px' }} onClick={() => console.log('문의하기')}>
              <span className="text-[#333]" style={{ fontSize: '15px' }}>문의하기</span>
              <span className="text-[#999]" style={{ fontSize: '18px' }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 저장 모달 */}
    {showSaveModal && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="bg-[white]"
          style={{
            width: '280px',
            borderRadius: '16px',
            paddingTop: '32px',
            paddingBottom: '24px',
            paddingLeft: '24px',
            paddingRight: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          {!saveSuccess ? (
            <>
              {/* 로딩 상태 */}
              <style>{`
                @keyframes spinner-rotate {
                  to {
                    transform: rotate(360deg);
                  }
                }
                @keyframes dots-blink {
                  0%, 20% { opacity: 0.2; }
                  50% { opacity: 1; }
                  100% { opacity: 0.2; }
                }
              `}</style>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #f0f0f0',
                  borderTopColor: '#a3b899',
                  borderRadius: '50%',
                  animation: 'spinner-rotate 0.8s linear infinite',
                  marginBottom: '24px'
                }}
              />
              <h3 className="text-[#333] font-semibold text-center" style={{ fontSize: '16px', margin: '0 0 8px 0' }}>
                사용자 정보 수정중
              </h3>
              <p className="text-[#666] text-center" style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                사용자 정보를 저장하고 있어요
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a3b899', animation: 'dots-blink 1.4s infinite', animationDelay: '0s' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a3b899', animation: 'dots-blink 1.4s infinite', animationDelay: '0.2s' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a3b899', animation: 'dots-blink 1.4s infinite', animationDelay: '0.4s' }} />
              </div>
            </>
          ) : (
            <>
              {/* 완료 상태 */}
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#a3b899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-[#333] font-semibold text-center" style={{ fontSize: '16px', margin: '0 0 8px 0' }}>
                완료
              </h3>
              <p className="text-[#666] text-center" style={{ fontSize: '13px', margin: '0 0 24px 0' }}>
                사용자 정보가 성공적으로 수정되었어요
              </p>
              <button
                className="w-full text-white font-semibold cursor-pointer transition-all active:scale-93"
                style={{
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: '#a3b899',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
                onClick={handleCloseModal}
              >
                확인
              </button>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}

export default SettingsPage;
