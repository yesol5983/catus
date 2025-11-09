import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬스토리지에서 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem('catus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 로그인
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('catus_user', JSON.stringify(userData));
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem('catus_user');
  };

  // 사용자 정보 업데이트
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('catus_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
