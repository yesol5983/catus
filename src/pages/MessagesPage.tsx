import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ROUTES } from '../constants/routes';
import { messageApi } from '../utils/api';
import { formatDate } from '../utils/dateFormat';
import type { MessageReceivedResponse } from '../types';

export default function MessagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

  // 받은 메시지 조회 (백엔드: GET /api/message/received)
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', 'received'],
    queryFn: async () => {
      return await messageApi.getReceived();
    },
    retry: 2,
  });

  // 알림 조회 (백엔드: GET /api/message/notifications)
  const { data: notificationsData } = useQuery({
    queryKey: ['messages', 'notifications'],
    queryFn: async () => {
      return await messageApi.getNotifications();
    },
    retry: 2,
  });

  // 메시지 읽음 처리 Mutation (백엔드: PUT /api/message/read/{id})
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await messageApi.markAsRead(messageId);
    },
    onSuccess: () => {
      // 메시지 목록 및 알림 갱신
      queryClient.invalidateQueries({ queryKey: ['messages', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'notifications'] });
    },
    onError: (error: any) => {
      console.error('메시지 읽음 처리 실패:', error);
      alert(`읽음 처리에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    },
  });

  const handleMessageClick = (messageId: number, diaryId: number, isRead: boolean) => {
    // 읽지 않은 메시지면 읽음 처리
    if (!isRead) {
      markAsReadMutation.mutate(messageId);
    }

    // 일기 상세 페이지로 이동 (diaryId가 있는 경우)
    if (diaryId) {
      navigate(`/diary/${diaryId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6F52] mx-auto mb-4"></div>
          <p className="text-gray-600">메시지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">😢 메시지를 불러올 수 없습니다</h1>
        <p className="text-gray-600 mb-8">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="px-6 py-3 bg-[#5F6F52] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const messages = messagesData?.messages || [];
  const unreadCount = messagesData?.unreadCount || 0;
  const totalPages = messagesData?.totalPages || 1;

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
          <h1 className="text-xl font-bold text-gray-800">받은 메시지</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Unread Count Banner */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <span className="text-blue-600 font-semibold">📬</span>
            <span className="text-blue-800 text-sm">
              읽지 않은 메시지가 <strong>{unreadCount}개</strong> 있습니다
            </span>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg mb-2">받은 메시지가 없습니다</p>
            <p className="text-gray-500 text-sm">
              친구들이 보낸 익명 메시지가 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleMessageClick(message.id, message.diaryId, message.isRead)}
                className={`
                  bg-white rounded-2xl p-5 shadow-md cursor-pointer
                  transition-all hover:shadow-lg hover:scale-[1.02]
                  ${!message.isRead ? 'border-2 border-blue-400' : 'border border-gray-200'}
                `}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {message.isRead ? '✉️' : '💌'}
                    </span>
                    {!message.isRead && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(message.receivedAt, 'datetime')}
                  </span>
                </div>

                {/* Message Content */}
                <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Diary Link */}
                {message.diaryId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📖</span>
                    <span>관련 일기 보기</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            전체 {totalPages}페이지 중 1페이지
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
          >
            홈으로
          </button>
          <button
            onClick={() => navigate(ROUTES.LETTER)}
            className="flex-1 py-3 bg-[#5F6F52] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            메시지 보내기
          </button>
        </div>
      </div>

      {/* Bottom padding for fixed navigation */}
      <div className="h-24"></div>
    </div>
  );
}
