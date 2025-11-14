import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  // 자동 로그인: JWT 토큰으로 사용자 정보 복원
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('catus_access_token');
      const storedUser = localStorage.getItem('catus_user');

      if (accessToken && storedUser) {
        try {
          // 토큰이 유효한지 확인
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );

          // 서버에서 받은 최신 사용자 정보로 업데이트
          setUser(response.data);
          localStorage.setItem('catus_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Token validation failed:', error);
          // 토큰이 만료되었으면 갱신 시도
          await refreshAccessToken();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 액세스 토큰 갱신
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('catus_refresh_token');

    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, user: userData } = response.data;

      // 새 액세스 토큰 저장
      localStorage.setItem('catus_access_token', accessToken);
      setUser(userData);
      localStorage.setItem('catus_user', JSON.stringify(userData));

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  // 로그인
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('catus_user', JSON.stringify(userData));
  };

  // 로그아웃
  const logout = async () => {
    const accessToken = localStorage.getItem('catus_access_token');

    // 백엔드에 로그아웃 알림 (선택사항)
    if (accessToken) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    // 로컬 상태 초기화
    setUser(null);
    localStorage.removeItem('catus_user');
    localStorage.removeItem('catus_access_token');
    localStorage.removeItem('catus_refresh_token');
  };

  // 사용자 정보 업데이트
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('catus_user', JSON.stringify(updatedUser));
  };

  // 액세스 토큰 가져오기 (API 호출 시 사용)
  const getAccessToken = () => {
    return localStorage.getItem('catus_access_token');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    getAccessToken,
    refreshAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
