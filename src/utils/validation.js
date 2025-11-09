/**
 * 유효성 검사 유틸리티
 */

/**
 * 이메일 유효성 검사
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 빈 문자열 체크
 */
export const isEmpty = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * 최소 길이 체크
 */
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * 최대 길이 체크
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

/**
 * 길이 범위 체크
 */
export const isLengthInRange = (value, min, max) => {
  return value && value.length >= min && value.length <= max;
};

/**
 * 숫자만 포함 체크
 */
export const isNumeric = (value) => {
  return /^\d+$/.test(value);
};

/**
 * 한글만 포함 체크
 */
export const isKorean = (value) => {
  return /^[가-힣\s]+$/.test(value);
};

/**
 * 영문만 포함 체크
 */
export const isEnglish = (value) => {
  return /^[a-zA-Z\s]+$/.test(value);
};

/**
 * 영문+숫자 체크
 */
export const isAlphanumeric = (value) => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * URL 유효성 검사
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 전화번호 유효성 검사 (한국)
 */
export const isValidPhoneNumber = (phone) => {
  // 010-1234-5678, 01012345678, 02-1234-5678 등
  const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 날짜 형식 체크 (YYYY-MM-DD)
 */
export const isValidDateFormat = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * 메시지 내용 유효성 검사
 */
export const isValidMessage = (message, minLength = 1, maxLength = 1000) => {
  if (isEmpty(message)) {
    return { valid: false, error: '메시지를 입력해주세요.' };
  }

  if (!hasMinLength(message, minLength)) {
    return { valid: false, error: `최소 ${minLength}자 이상 입력해주세요.` };
  }

  if (!hasMaxLength(message, maxLength)) {
    return { valid: false, error: `최대 ${maxLength}자까지 입력 가능합니다.` };
  }

  return { valid: true };
};

/**
 * 폼 데이터 일괄 검증
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    // required 체크
    if (fieldRules.required && isEmpty(value)) {
      errors[field] = fieldRules.requiredMessage || '필수 입력 항목입니다.';
      return;
    }

    // minLength 체크
    if (fieldRules.minLength && !hasMinLength(value, fieldRules.minLength)) {
      errors[field] = `최소 ${fieldRules.minLength}자 이상 입력해주세요.`;
      return;
    }

    // maxLength 체크
    if (fieldRules.maxLength && !hasMaxLength(value, fieldRules.maxLength)) {
      errors[field] = `최대 ${fieldRules.maxLength}자까지 입력 가능합니다.`;
      return;
    }

    // pattern 체크
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || '형식이 올바르지 않습니다.';
      return;
    }

    // custom 검증 함수
    if (fieldRules.validate) {
      const result = fieldRules.validate(value);
      if (result !== true) {
        errors[field] = result;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 비밀번호 강도 체크
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;

  let strength = 0;

  // 길이
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 대문자
  if (/[A-Z]/.test(password)) strength++;

  // 소문자
  if (/[a-z]/.test(password)) strength++;

  // 숫자
  if (/\d/.test(password)) strength++;

  // 특수문자
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return Math.min(strength, 5);
};

/**
 * XSS 방어를 위한 문자열 이스케이프
 */
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * 파일 크기 유효성 검사
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * 파일 타입 유효성 검사
 */
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};
