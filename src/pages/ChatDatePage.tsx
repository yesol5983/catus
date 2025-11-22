import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ROUTES } from '../constants/routes';
import { chatApi } from '../utils/api';
import { formatDate } from '../utils/dateFormat';

export default function ChatDatePage() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  // 특정 날짜 채팅 조회 (백엔드: GET /api/chat/context/{date})
  const { data: chatData, isLoading, error } = useQuery({
    queryKey: ['chat', 'context', date],
    queryFn: async () => {
      if (!date) throw new Error('날짜가 필요합니다.');
      return await chatApi.getContextByDate(date);
    },
    enabled: !!date,
    retry: 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6F52] mx-auto mb-4"></div>
          <p className="text-gray-600">채팅을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !chatData) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">😢 채팅을 불러올 수 없습니다</h1>
        <p className="text-gray-600 mb-8">해당 날짜의 채팅 기록을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(ROUTES.CHAT)}
          className="px-6 py-3 bg-[#5F6F52] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          채팅으로 돌아가기
        </button>
      </div>
    );
  }

  const messages = chatData.messages || [];

  return (
    <div className="min-h-screen bg-[#fef9f1]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.CHAT)}
            className="text-2xl text-gray-700 hover:text-gray-900"
          >
            ‹
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {chatData.date && formatDate(chatData.date, 'full')}
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 text-lg mb-2">이 날짜의 대화가 없습니다</p>
            <p className="text-gray-500 text-sm">
              다른 날짜를 선택해주세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="space-y-4"
              >
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-[#5F6F52] text-white rounded-2xl px-4 py-3 max-w-[70%] shadow-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.userMessage}
                    </p>
                    <p className="text-xs text-gray-200 mt-2">
                      {formatDate(msg.timestamp, 'time')}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 max-w-[70%] shadow-md border border-gray-200">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {msg.aiResponse}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(msg.timestamp, 'time')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          <button
            onClick={() => navigate(ROUTES.CHAT)}
            className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
          >
            채팅으로
          </button>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex-1 py-3 bg-[#5F6F52] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            홈으로
          </button>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
}
