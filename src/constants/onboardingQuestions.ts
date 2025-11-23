interface OnboardingQuestion {
  id: number;
  question: string;
  type: 'selection' | 'text';
  options?: string[];
  placeholder?: string;
}

// 온보딩 질문 (백엔드 API 명세 기준: /api/auth/signup)
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 1,
    question: "닉네임을 입력해주세요",
    type: "text",
    placeholder: "귀여운고양이123"
  },
  {
    id: 2,
    question: "비밀번호를 설정해주세요",
    type: "text",
    placeholder: "8자 이상의 비밀번호"
  },
  {
    id: 3,
    question: "일기를 받고 싶은 시간을 선택해주세요",
    type: "selection",
    options: ["21:00", "22:00", "23:00", "00:00"]
  }
];

// 온보딩 완료 여부 로컬스토리지 키
export const ONBOARDING_COMPLETED_KEY = "catus_onboarding_completed";
