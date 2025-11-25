/**
 * BIG5 성격 검사 페이지
 * 최초 1회 10문항 테스트 실시
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { big5Api } from '../utils/api';
import { ROUTES } from '../constants/routes';
import { BIG5_QUESTIONS, SCORE_OPTIONS } from '../constants/big5Questions';
import footprintIcon from '../assets/images/footprint.svg';

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-main-bg)' }}>
      {/* 헤더 + 진행도 */}
      <div className="w-full flex flex-col items-center pt-[12px] pb-[12px]" style={{ backgroundColor: 'var(--color-main-bg)' }}>
        {/* 제목 */}
        <h1 className="text-[22px] font-[600] text-center whitespace-nowrap mb-[2px]" style={{ color: 'var(--color-text-primary)' }}>
          🧠 BIG5 성격 검사
        </h1>
        {/* 설명 */}
        <p className="text-[12px] text-center mb-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
          당신의 성향을 분석하고 맞춤 일기를 만들어 드려요
        </p>

        {/* 진행도 바 */}
        <div className="relative w-[80%] h-[6px] rounded-[9999px] mb-[6px]" style={{ backgroundColor: 'var(--color-border)' }}>
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#59B464] rounded-[9999px]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.img
            src={footprintIcon}
            alt="progress-footprint"
            className="absolute w-[14px] h-[14px] top-[-4px] z-50 select-none"
            animate={{ left: `calc(${progress}% - 7px)` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* 진행 단계 텍스트 */}
        <p className="text-[13px] font-[500] text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {currentQuestion + 1} / {BIG5_QUESTIONS.length}
        </p>
      </div>

      {/* 질문 + 답변 */}
      <div className="flex-1 flex flex-col justify-center px-[10%] py-[16px]">
        {/* 질문 */}
        <p className="text-[16px] text-center mb-[16px] leading-[1.5]" style={{ color: 'var(--color-text-primary)' }}>
          {currentQ.text}
        </p>

        {/* 구분선 */}
        <div className="w-full h-[1px] mb-[16px]" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* 답변 선택 */}
        <div className="flex flex-col gap-[8px]">
          {SCORE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswerSelect(option.value)}
              className={`w-full py-[12px] px-[14px] rounded-[10px] border-0 cursor-pointer transition-all text-[14px] ${
                selectedAnswer === option.value
                  ? 'bg-[rgba(89,180,100,0.15)] text-[#59B464] font-[500]'
                  : 'bg-[white] font-[400]'
              }`}
              style={{ color: selectedAnswer === option.value ? '#59B464' : 'var(--color-text-primary)' }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-[12px] mt-[20px]">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              disabled={submitTestMutation.isPending}
              className="flex-1 py-[10px] px-[20px] rounded-[10px] border-0 cursor-pointer text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null || submitTestMutation.isPending}
            className={`flex-1 py-[10px] px-[20px] rounded-[10px] border-0 cursor-pointer text-[14px] font-[500] text-[white] disabled:cursor-not-allowed ${
              selectedAnswer === null ? 'bg-[#ccc]' : 'bg-[#59B464]'
            }`}
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
          <div className="mt-[16px] p-[12px] rounded-[10px] bg-[rgba(89,180,100,0.1)]">
            <p className="text-[12px] text-center text-[#59B464]">
              💡 솔직하게 답변할수록 더 정확한 분석이 가능해요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
