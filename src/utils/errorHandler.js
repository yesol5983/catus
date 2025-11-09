/**
 * 에러 핸들링 유틸리티
 */

import { ApiError } from './api';

/**
 * 에러 메시지 추출
 */
export const getErrorMessage = (error) => {
  // ApiError 처리
  if (error instanceof ApiError) {
    return error.message;
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return error.message;
  }

  // 문자열 에러
  if (typeof error === 'string') {
    return error;
  }

  // 알 수 없는 에러
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * HTTP 상태 코드별 메시지 반환
 */
export const getStatusMessage = (status) => {
  const messages = {
    400: '잘못된 요청입니다.',
    401: '인증이 필요합니다.',
    403: '접근 권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    408: '요청 시간이 초과되었습니다.',
    429: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다.',
    502: '게이트웨이 오류가 발생했습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.',
    504: '게이트웨이 시간이 초과되었습니다.',
  };

  return messages[status] || '오류가 발생했습니다.';
};

/**
 * 에러 로깅
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.error('Error:', {
      message: getErrorMessage(error),
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Sentry 등 에러 추적 서비스로 전송
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
};

/**
 * 에러 분류
 */
export const classifyError = (error) => {
  if (!navigator.onLine) {
    return {
      type: 'network',
      message: '인터넷 연결을 확인해주세요.',
      retryable: true,
    };
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        type: 'auth',
        message: '로그인이 필요합니다.',
        retryable: false,
      };
    }

    if (error.status === 403) {
      return {
        type: 'permission',
        message: '접근 권한이 없습니다.',
        retryable: false,
      };
    }

    if (error.status >= 500) {
      return {
        type: 'server',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }

    return {
      type: 'client',
      message: error.message,
      retryable: false,
    };
  }

  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
    retryable: true,
  };
};

/**
 * 재시도 가능 여부 판단
 */
export const isRetryableError = (error) => {
  const classification = classifyError(error);
  return classification.retryable;
};

/**
 * 에러 핸들러 팩토리
 */
export const createErrorHandler = (options = {}) => {
  const {
    onError,
    showToast = true,
    logToConsole = true,
  } = options;

  return (error, context = {}) => {
    const errorMessage = getErrorMessage(error);
    const classification = classifyError(error);

    // 로깅
    if (logToConsole) {
      logError(error, context);
    }

    // Toast 표시
    if (showToast && window.showToast) {
      window.showToast(errorMessage, 'error');
    }

    // 커스텀 핸들러 호출
    if (onError) {
      onError(error, classification, context);
    }

    return classification;
  };
};

/**
 * Promise 래퍼 (에러 핸들링 자동화)
 */
export const handleAsync = async (promise, errorHandler) => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    }
    return [null, error];
  }
};

/**
 * 폴백 값과 함께 에러 처리
 */
export const withFallback = async (promise, fallbackValue) => {
  try {
    return await promise;
  } catch (error) {
    logError(error, { fallback: true });
    return fallbackValue;
  }
};

/**
 * 재시도 로직
 */
export const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts && isRetryableError(error)) {
        if (onRetry) {
          onRetry(attempt, error);
        }

        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break;
      }
    }
  }

  throw lastError;
};

/**
 * 타임아웃 래퍼
 */
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), timeoutMs)
    ),
  ]);
};

/**
 * 디바운스된 에러 핸들러
 */
export const debouncedErrorHandler = (() => {
  let timeoutId;
  const errorQueue = new Set();

  return (error, delay = 300) => {
    errorQueue.add(getErrorMessage(error));

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (errorQueue.size > 0) {
        const messages = Array.from(errorQueue);
        errorQueue.clear();

        if (window.showToast) {
          window.showToast(messages[0], 'error');
        }
      }
    }, delay);
  };
})();
