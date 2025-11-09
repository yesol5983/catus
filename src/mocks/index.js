/**
 * Mock 데이터 통합 export
 */

export { mockDiaries } from './diaryData';
export { mockReceivedMessages, mockSentMessages } from './supportData';
export { mockUser, mockOnboardingData } from './userData';

export default {
  diaries: () => import('./diaryData'),
  support: () => import('./supportData'),
  user: () => import('./userData'),
};
