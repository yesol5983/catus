import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userSettings, setUserSettings] = useState({
    nickname: '',
    gender: '',
    ageGroup: '',
    occupation: '',
    purpose: '',
    diaryTime: '00:00',
    aiStyle: '친근함', // '친근함' or '진중한'
    notifications: {
      diary: true,
      support: true
    }
  });

  // 로컬스토리지에서 설정 로드
  useEffect(() => {
    const storedSettings = localStorage.getItem('catus_user_settings');
    if (storedSettings) {
      setUserSettings(JSON.parse(storedSettings));
    }
  }, []);

  // 설정 업데이트
  const updateSettings = (updates) => {
    const newSettings = { ...userSettings, ...updates };
    setUserSettings(newSettings);
    localStorage.setItem('catus_user_settings', JSON.stringify(newSettings));
  };

  // 온보딩 정보 저장
  const saveOnboardingInfo = (info) => {
    updateSettings(info);
  };

  const value = {
    userSettings,
    updateSettings,
    saveOnboardingInfo
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
