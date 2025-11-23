import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ONBOARDING_QUESTIONS } from '../constants/onboardingQuestions';
import { OnboardingData } from '../types';
import api from '../utils/api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (answer: string) => {
    const questionId = currentQuestion.id;

    // 답변 저장
    const updatedAnswers = { ...answers };

    switch (questionId) {
      case 1: // 닉네임
        updatedAnswers.nickname = answer;
        break;
      case 2: // 비밀번호
        updatedAnswers.password = answer;
        break;
      case 3: // 일기 생성 시간
        updatedAnswers.diaryGenerationTime = answer;
        break;
    }

    setAnswers(updatedAnswers);

    // 마지막 질문이면 제출
    if (currentStep === ONBOARDING_QUESTIONS.length - 1) {
      submitOnboarding(updatedAnswers as OnboardingData);
    } else {
      // 다음 질문으로
      setCurrentStep(currentStep + 1);
    }
  };

  const submitOnboarding = async (data: OnboardingData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 백엔드 API 호출: POST /api/auth/signup
      await api.auth.signup(data);

      // 로컬 스토리지에 온보딩 완료 표시
      localStorage.setItem('catus_onboarding_completed', 'true');

      // Big5 테스트 페이지로 이동
      navigate('/big5-test');
    } catch (err: any) {
      console.error('회원가입 실패:', err);
      setError(err.message || '회원가입에 실패했습니다.');
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTextSubmit = (text: string) => {
    if (text.trim()) {
      handleAnswer(text.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef9f1] to-[#f5e6d3] flex flex-col">
      {/* 헤더 */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            {currentStep + 1} / {ONBOARDING_QUESTIONS.length}
          </h2>
          {/* 프로그레스 바 */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5F6F52] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* 질문 */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h1>
            {currentQuestion.placeholder && (
              <p className="text-gray-500">
                {currentQuestion.placeholder}
              </p>
            )}
          </div>

          {/* 답변 옵션 */}
          {currentQuestion.type === 'selection' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isLoading}
                  className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#5F6F52] hover:bg-[#fef9f1] transition-all duration-200 text-lg font-medium text-gray-700 hover:text-[#5F6F52] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* 텍스트 입력 */}
          {currentQuestion.type === 'text' && (
            <div>
              <input
                type={currentQuestion.id === 2 ? 'password' : 'text'}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 focus:border-[#5F6F52] focus:outline-none transition-all duration-200 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTextSubmit(e.currentTarget.value);
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleTextSubmit(input.value);
                }}
                disabled={isLoading}
                className="mt-4 w-full p-4 bg-[#5F6F52] text-white rounded-xl font-medium text-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '저장 중...' : '다음'}
              </button>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
            className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>
          <p className="text-sm text-gray-500 flex items-center">
            잠깐만 시간을 내주세요 😊
          </p>
        </div>
      </div>
    </div>
  );
}
