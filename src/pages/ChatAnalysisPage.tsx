import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { chatApi } from '../utils/api';
import type { ChatAnalysisResponse } from '../types';

export default function ChatAnalysisPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ChatAnalysisResponse | null>(null);

  // 채팅 분석 Mutation (백엔드: POST /api/chat/analyze)
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) throw new Error('시작 날짜와 종료 날짜를 모두 선택해주세요.');
      return await chatApi.analyzeChat(startDate, endDate);
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
    onError: (error: any) => {
      console.error('채팅 분석 실패:', error);
      alert(`분석에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    },
  });

  const handleAnalyze = () => {
    if (!startDate || !endDate) {
      alert('시작 날짜와 종료 날짜를 모두 선택해주세요.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-main-bg)' }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-[12px] py-[12px] flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-[#5E7057] hover:opacity-70 text-[20px] bg-transparent border-0"
          style={{ marginTop: '-5px' }}
        >
          ←
        </button>
        <div className="text-[16px] font-[600] text-[#5E7057]">
          채팅 분석
        </div>
        <div className="w-[20px]" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col px-[16px] py-[16px] overflow-hidden">
        {/* 설명 */}
        <div
          className="rounded-[16px] p-[16px] mb-[12px] flex-shrink-0"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <div className="flex items-center gap-[8px] mb-[8px]">
            <span className="text-[20px]">📊</span>
            <h2
              className="font-[600] text-[15px]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              채팅 분석이란?
            </h2>
          </div>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            선택한 기간 동안의 대화를 Big5 성격 분석 모델로 분석하여
            감정 변화와 성격 특성을 파악할 수 있습니다.
          </p>
        </div>

        {/* 날짜 선택 */}
        <div
          className="rounded-[16px] p-[16px] mb-[12px] flex-shrink-0"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <h3
            className="text-[15px] font-[600] mb-[12px] flex items-center gap-[8px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span>📅</span>
            <span>분석 기간 선택</span>
          </h3>

          <div className="flex flex-col gap-[12px]">
            <div>
              <label
                className="block text-[13px] font-[500] mb-[6px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-[12px] py-[10px] border rounded-[10px] text-[14px] focus:outline-none focus:border-[#5E7057]"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-main-bg)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-[13px] font-[500] mb-[6px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-[12px] py-[10px] border rounded-[10px] text-[14px] focus:outline-none focus:border-[#5E7057]"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-main-bg)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || !startDate || !endDate}
            className="w-full mt-[16px] py-[12px] bg-[#5E7057] text-[#FFFFFF] rounded-[12px] text-[14px] font-[500] border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzeMutation.isPending ? '분석 중...' : '분석 시작'}
          </button>
        </div>

        {/* 분석 결과 - 스크롤 가능 영역 */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-[12px]"
          >
            {/* 기간 */}
            <div
              className="rounded-[16px] p-[16px] flex-shrink-0"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <h3
                className="text-[15px] font-[600] mb-[8px] flex items-center gap-[8px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>📅</span>
                <span>분석 기간</span>
              </h3>
              <p
                className="text-[14px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {analysisResult.period.start} ~ {analysisResult.period.end}
              </p>
            </div>

            {/* Big5 점수 */}
            <div
              className="rounded-[16px] p-[16px] flex-shrink-0"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <h3
                className="text-[15px] font-[600] mb-[12px] flex items-center gap-[8px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>🧠</span>
                <span>성격 분석 결과</span>
              </h3>
              <div className="flex flex-col gap-[12px]">
                {[
                  { key: 'openness', name: '개방성' },
                  { key: 'conscientiousness', name: '성실성' },
                  { key: 'extraversion', name: '외향성' },
                  { key: 'agreeableness', name: '친화성' },
                  { key: 'neuroticism', name: '신경증' },
                ].map(({ key, name }) => {
                  const score = analysisResult.emotionScores[key as keyof typeof analysisResult.emotionScores] || 0;
                  const percentage = Math.min(100, Math.round(score * 10));
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-[4px]">
                        <span
                          className="text-[13px] font-[500]"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {name}
                        </span>
                        <span
                          className="text-[13px] font-[600]"
                          style={{ color: '#5E7057' }}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-[6px]"
                        style={{ backgroundColor: '#E8E8E8' }}
                      >
                        <div
                          className="h-[6px] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: '#5E7057' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 요약 */}
            <div
              className="rounded-[16px] p-[16px] flex-shrink-0"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <h3
                className="text-[15px] font-[600] mb-[8px] flex items-center gap-[8px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>💬</span>
                <span>분석 요약</span>
              </h3>
              <p
                className="text-[13px] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {analysisResult.summary}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
