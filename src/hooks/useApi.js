/**
 * API 호출 커스텀 훅
 * 로딩, 에러, 데이터 상태를 자동 관리
 */

import { useState, useCallback, useEffect } from 'react';
import { handleAsync, logError } from '../utils/errorHandler';

/**
 * API 호출 훅
 * @param {Function} apiFunction - API 호출 함수
 * @param {Object} options - 옵션 설정
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    initialData = null,
    showToast = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    const [result, err] = await handleAsync(apiFunction(...args));

    if (err) {
      setError(err);
      logError(err, { apiFunction: apiFunction.name, args });

      if (showToast && window.showToast) {
        window.showToast(err.message || '오류가 발생했습니다.', 'error');
      }

      if (onError) {
        onError(err);
      }

      setLoading(false);
      return [null, err];
    }

    setData(result);
    setLoading(false);

    if (onSuccess) {
      onSuccess(result);
    }

    return [result, null];
  }, [apiFunction, onSuccess, onError, showToast]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * 자동 실행 API 훅
 * 컴포넌트 마운트 시 자동으로 API 호출
 */
export const useApiAuto = (apiFunction, dependencies = [], options = {}) => {
  const { data, loading, error, execute, reset } = useApi(apiFunction, options);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute, reset };
};

export default useApi;
