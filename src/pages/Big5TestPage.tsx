/**
 * BIG5 성격 검사 페이지
 * 최초 1회 10문항 테스트 실시
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { big5Api } from '../utils/api';
import { ROUTES } from '../constants/routes';
import { BIG5_QUESTIONS, SCORE_OPTIONS } from '../constants/big5Questions';

export default function Big5TestPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; score: number }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const submitTestMutation = useMutation({
    mutationFn: (answers: Array<{ questionId: number; score: number }>) =>
      big5Api.submitInitial(answers),
    onSuccess: (data) => {
      console.log('✅ Big5 테스트 제출 성공:', data);

      // 로컬 스토리지에 Big5 완료 표시
      localStorage.setItem('catus_big5_completed', 'true');

      // 홈으로 이동
      navigate(ROUTES.HOME);
    },
    onError: (error: any) => {
      console.error('❌ Big5 테스트 제출 실패:', error);
      alert(error.message || '테스트 제출에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const handleAnswerSelect = (value: number) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const currentQ = BIG5_QUESTIONS[currentQuestion];

    // 역문항이면 점수 반전 (6 - score)
    const finalScore = currentQ.reverse ? 6 - selectedAnswer : selectedAnswer;

    const newAnswers = [
      ...answers,
      { questionId: currentQ.id, score: finalScore }
    ];
    setAnswers(newAnswers);

    if (currentQuestion < BIG5_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // 마지막 문항 - 테스트 제출
      submitTestMutation.mutate(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const newAnswers = [...answers];
      const previousAnswer = newAnswers.pop();
      setAnswers(newAnswers);

      // 이전 답변 복원 (역문항이면 다시 반전)
      if (previousAnswer) {
        const prevQ = BIG5_QUESTIONS[currentQuestion - 1];
        const originalScore = prevQ.reverse ? 6 - previousAnswer.score : previousAnswer.score;
        setSelectedAnswer(originalScore);
      }
    }
  };

  const progress = ((currentQuestion + 1) / BIG5_QUESTIONS.length) * 100;
  const currentQ = BIG5_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef9f1] to-[#f5efe3] flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-800 text-center">
            🧠 BIG5 성격 검사
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            당신의 성격을 분석하고 맞춤 일기를 만들어드려요
          </p>
        </div>
      </div>

      {/* 진행도 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {currentQuestion + 1} / {BIG5_QUESTIONS.length}
            </span>
            <span className="text-sm text-[#59B464] font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#59B464] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 질문 */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <p className="text-xl text-gray-800 text-center mb-8 leading-relaxed">
              {currentQ.text}
            </p>

            {/* 답변 선택 */}
            <div className="space-y-3">
              {SCORE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === option.value
                      ? 'border-[#59B464] bg-[#59B464] bg-opacity-10'
                      : 'border-gray-200 hover:border-[#59B464] hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`text-base ${
                      selectedAnswer === option.value ? 'text-[#59B464] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex gap-4 mt-6">
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                disabled={submitTestMutation.isPending}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null || submitTestMutation.isPending}
              className="flex-1 px-6 py-3 bg-[#59B464] text-white rounded-full hover:bg-[#4a9654] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentQuestion < BIG5_QUESTIONS.length - 1
                ? '다음'
                : submitTestMutation.isPending
                ? '제출 중...'
                : '완료'}
            </button>
          </div>

          {/* 도움말 */}
          {currentQuestion === 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💡 솔직하게 답변할수록 더 정확한 분석이 가능해요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
