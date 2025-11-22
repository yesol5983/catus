import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ROUTES } from '../constants/routes';
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
    <div className="min-h-screen bg-[#fef9f1]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-2xl text-gray-700 hover:text-gray-900"
          >
            ‹
          </button>
          <h1 className="text-xl font-bold text-gray-800">채팅 분석</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Description */}
        <div className="bg-blue-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📊</span>
            <h2 className="font-bold text-blue-900">채팅 분석이란?</h2>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            선택한 기간 동안의 대화를 Big5 성격 분석 모델로 분석하여
            감정 변화와 성격 특성을 파악할 수 있습니다.
          </p>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span>
            <span>분석 기간 선택</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F6F52]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F6F52]"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || !startDate || !endDate}
            className="w-full mt-6 py-3 bg-[#5F6F52] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzeMutation.isPending ? '분석 중...' : '분석 시작'}
          </button>
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Period */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📅</span>
                <span>분석 기간</span>
              </h3>
              <p className="text-gray-700">
                {analysisResult.period.start} ~ {analysisResult.period.end}
              </p>
            </div>

            {/* Big5 Scores */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🧠</span>
                <span>성격 분석 결과</span>
              </h3>
              <div className="space-y-4">
                {/* Openness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      개방성 (Openness)
                    </span>
                    <span className="text-sm font-bold text-[#5F6F52]">
                      {analysisResult.emotionScores.openness.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F6F52] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analysisResult.emotionScores.openness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Conscientiousness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      성실성 (Conscientiousness)
                    </span>
                    <span className="text-sm font-bold text-[#5F6F52]">
                      {analysisResult.emotionScores.conscientiousness.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F6F52] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analysisResult.emotionScores.conscientiousness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Extraversion */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      외향성 (Extraversion)
                    </span>
                    <span className="text-sm font-bold text-[#5F6F52]">
                      {analysisResult.emotionScores.extraversion.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F6F52] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analysisResult.emotionScores.extraversion / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Agreeableness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      친화성 (Agreeableness)
                    </span>
                    <span className="text-sm font-bold text-[#5F6F52]">
                      {analysisResult.emotionScores.agreeableness.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F6F52] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analysisResult.emotionScores.agreeableness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Neuroticism */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      신경증 (Neuroticism)
                    </span>
                    <span className="text-sm font-bold text-[#5F6F52]">
                      {analysisResult.emotionScores.neuroticism.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F6F52] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(analysisResult.emotionScores.neuroticism / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>💬</span>
                <span>분석 요약</span>
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysisResult.summary}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
}
