import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ROUTES } from '../constants/routes';
import { diaryApi } from '../utils/api';
import { formatDate } from '../utils/dateFormat';
import type { Diary } from '../types';
import HomePage from './HomePage';

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const diaryId = id ? parseInt(id, 10) : null;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Browser back button handling for modal
  useEffect(() => {
    // Push a new history state when modal opens
    window.history.pushState({ modal: 'diaryDetail' }, '');

    const handlePopState = (event: PopStateEvent) => {
      // Close modal when back button is pressed
      navigate(ROUTES.CALENDAR);
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Fetch diary data (백엔드: GET /api/diary/{id})
  const { data: diaryData, isLoading, error } = useQuery({
    queryKey: ['diary', 'detail', diaryId],
    queryFn: async () => {
      if (!diaryId) throw new Error('일기 ID가 필요합니다.');
      return await diaryApi.getById(diaryId);
    },
    enabled: !!diaryId && !isNaN(diaryId),
    retry: 2,
  });

  const diary: Diary | undefined = diaryData;

  // 일기 데이터 로드 시 편집 폼 초기화
  useEffect(() => {
    if (diary) {
      setEditedTitle(diary.title || '');
      setEditedContent(diary.content || '');
    }
  }, [diary]);

  // 일기 수정 Mutation (백엔드: PUT /api/diary/{id})
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!diaryId) throw new Error('일기 ID가 필요합니다.');
      return await diaryApi.update(diaryId, {
        title: editedTitle,
        content: editedContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', 'detail', diaryId] });
      queryClient.invalidateQueries({ queryKey: ['diary', 'list'] });
      setIsEditing(false);
      alert('일기가 수정되었습니다.');
    },
    onError: (error: any) => {
      console.error('일기 수정 실패:', error);
      alert(`일기 수정에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    },
  });

  // 일기 삭제 Mutation (백엔드: DELETE /api/diary/{id})
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!diaryId) throw new Error('일기 ID가 필요합니다.');
      return await diaryApi.delete(diaryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', 'list'] });
      alert('일기가 삭제되었습니다.');
      navigate(ROUTES.CALENDAR);
    },
    onError: (error: any) => {
      console.error('일기 삭제 실패:', error);
      alert(`일기 삭제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    },
  });

  const handleUpdate = () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    updateMutation.mutate();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6F52] mx-auto mb-4"></div>
          <p className="text-gray-600">일기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !diary) {
    return (
      <div className="min-h-screen bg-[#fef9f1] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">😢 일기를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">일기 ID {diaryId}를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate(ROUTES.CALENDAR)}
          className="px-6 py-3 bg-[#5F6F52] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          캘린더로 돌아가기
        </button>
      </div>
    );
  }

  // diary.emotion이 없을 수 있으므로 기본값 설정
  const emotionColor = '#ccc';
  const emotionEmoji = '😐';

  return (
    <>
      {/* Background (HomePage) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <HomePage />
      </div>

      {/* Diary Detail Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}
      >
        <motion.div
          className="bg-[#F5F5F0] rounded-[24px] w-[90%] max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl my-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white rounded-t-[24px]"
            style={{ backgroundColor: emotionColor }}
          >
            <button
              onClick={() => navigate(ROUTES.CALENDAR)}
              className="text-2xl w-10 h-10 flex items-center justify-center hover:opacity-70 bg-transparent border-0 text-white"
            >
              ‹
            </button>
            <div className="text-[15px] font-semibold">
              {diary.date && formatDate(diary.date, 'full')}
            </div>
            <button
              onClick={() => navigate(ROUTES.CALENDAR)}
              className="text-2xl w-10 h-10 flex items-center justify-center hover:opacity-70 bg-transparent border-0 text-white"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Emotion & Picture */}
            <div className="text-center">
              <div className="text-6xl mb-3">{emotionEmoji}</div>
              <div
                className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm"
                style={{ backgroundColor: emotionColor }}
              >
                {diary.emotion}
              </div>
            </div>

            {/* Picture (백엔드 필드: imageUrl) */}
            {diary.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                <img
                  src={diary.imageUrl}
                  alt="그림일기"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Title */}
            {isEditing ? (
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  <span>제목</span>
                </h3>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F6F52]"
                  placeholder="제목을 입력하세요"
                />
              </div>
            ) : (
              diary.title && (
                <div className="bg-white rounded-2xl p-5 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>제목</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {diary.title}
                  </p>
                </div>
              )
            )}

            {/* Content (백엔드 필드: content) */}
            {isEditing ? (
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>💬</span>
                  <span>전체 내용</span>
                </h3>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F6F52] min-h-[200px]"
                  placeholder="내용을 입력하세요"
                />
              </div>
            ) : (
              diary.content && (
                <div className="bg-white rounded-2xl p-5 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>💬</span>
                    <span>전체 내용</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {diary.content}
                  </p>
                </div>
              )
            )}

            {/* Big5 Scores (백엔드 응답에 포함될 수 있음) */}
            {diary.big5Scores && (
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🧠</span>
                  <span>성격 분석</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>개방성 (Openness):</span>
                    <span className="font-semibold">{diary.big5Scores.openness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>성실성 (Conscientiousness):</span>
                    <span className="font-semibold">{diary.big5Scores.conscientiousness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>외향성 (Extraversion):</span>
                    <span className="font-semibold">{diary.big5Scores.extraversion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>친화성 (Agreeableness):</span>
                    <span className="font-semibold">{diary.big5Scores.agreeableness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>신경증 (Neuroticism):</span>
                    <span className="font-semibold">{diary.big5Scores.neuroticism}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="text-center text-sm text-gray-500">
              {diary.createdAt && `작성일: ${formatDate(diary.createdAt, 'datetime')}`}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-[#F5F5F0] p-4 space-y-3">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-[#5F6F52] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(ROUTES.CALENDAR)}
                    className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
                  >
                    캘린더로
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.HOME)}
                    className="flex-1 py-3 bg-[#5F6F52] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    홈으로
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">일기 삭제</h3>
              <p className="text-gray-600 mb-6">정말로 이 일기를 삭제하시겠습니까? 삭제된 일기는 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
