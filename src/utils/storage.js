/**
 * localStorage 헬퍼 유틸리티
 * JSON 직렬화/역직렬화를 자동으로 처리합니다.
 */

const STORAGE_PREFIX = 'catus_';

/**
 * localStorage에 값 저장 (JSON 직렬화)
 */
export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
    return true;
  } catch (error) {
    console.error('localStorage setItem error:', error);
    return false;
  }
};

/**
 * localStorage에서 값 조회 (JSON 파싱)
 */
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('localStorage getItem error:', error);
    return null;
  }
};

/**
 * localStorage에서 값 삭제
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('localStorage removeItem error:', error);
    return false;
  }
};

/**
 * localStorage 전체 삭제 (Catus 관련만)
 */
export const clear = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('localStorage clear error:', error);
    return false;
  }
};

/**
 * 토큰 저장
 */
export const setToken = (token) => {
  return setItem('auth_token', token);
};

/**
 * 토큰 조회
 */
export const getToken = () => {
  return getItem('auth_token');
};

/**
 * 토큰 삭제
 */
export const removeToken = () => {
  return removeItem('auth_token');
};

/**
 * Refresh 토큰 저장
 */
export const setRefreshToken = (token) => {
  return setItem('refresh_token', token);
};

/**
 * Refresh 토큰 조회
 */
export const getRefreshToken = () => {
  return getItem('refresh_token');
};

/**
 * Refresh 토큰 삭제
 */
export const removeRefreshToken = () => {
  return removeItem('refresh_token');
};

/**
 * 사용자 정보 저장
 */
export const setUser = (user) => {
  return setItem('user', user);
};

/**
 * 사용자 정보 조회
 */
export const getUser = () => {
  return getItem('user');
};

/**
 * 사용자 정보 삭제
 */
export const removeUser = () => {
  return removeItem('user');
};

/**
 * 모든 인증 관련 데이터 삭제
 */
export const clearAuth = () => {
  removeToken();
  removeRefreshToken();
  removeUser();
};
