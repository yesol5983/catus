/**
 * Mock 사용자 데이터
 */

export const mockUser = {
  id: 'user_001',
  name: '테스트 사용자',
  email: 'test@catus.com',
  profileImage: null,
  provider: 'kakao',
  kakaoId: 'kakao_12345',
  createdAt: '2025-01-01T00:00:00Z',
};

export const mockOnboardingData = {
  gender: '여성',
  ageGroup: '20대',
  occupation: '학생',
  purpose: '감정 관리',
};

export default {
  user: mockUser,
  onboarding: mockOnboardingData,
};
