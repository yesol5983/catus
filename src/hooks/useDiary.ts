/**
 * 일기 CRUD 커스텀 훅
 */

import { useState, useCallback, useEffect } from 'react';
import { diaryApi } from '../utils/api';
import { logError } from '../utils/errorHandler';
import type { Diary } from '../types';

interface DiaryMap {
  [date: string]: Diary;
}

interface UseDiaryListReturn {
  diaries: DiaryMap;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

/**
 * 일기 목록 훅
 */
export const useDiaryList = (year: number, month: number): UseDiaryListReturn => {
  const [diaries, setDiaries] = useState<DiaryMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchDiaries = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await diaryApi.getList(year, month);

      // 🔍 백엔드 응답 날짜 형식 확인용 로그
      console.log('📅 [useDiary] API 응답:', {
        year,
        month,
        diariesCount: data.diaries?.length,
        sampleDiary: data.diaries?.[0],
        allDates: data.diaries?.map((d: any) => ({ diaryDate: d.diaryDate, date: d.date, thumbnailUrl: d.thumbnailUrl }))
      });

      // 읽은 일기 ID 목록 가져오기 (localStorage)
      const readDiaryIdsStr = localStorage.getItem('catus_read_diary_ids');
      const readDiaryIds: number[] = readDiaryIdsStr ? JSON.parse(readDiaryIdsStr) : [];

      // 1단계: 목록 데이터로 초기 맵 생성
      const diariesMap = data.diaries.reduce((acc: DiaryMap, diary: any) => {
        const dateKey = diary.diaryDate || diary.date;
        // isRead: 백엔드 값 우선, 없으면 localStorage 체크
        const isReadFromBackend = diary.isRead;
        const isReadFromLocal = readDiaryIds.includes(diary.id);
        acc[dateKey] = {
          id: diary.id,
          date: dateKey,
          title: diary.title || diary.emotion || '오늘의 일기',
          content: diary.contentPreview || diary.previewText,
          imageUrl: diary.thumbnailUrl || diary.image,
          thumbnailUrl: diary.thumbnailUrl || diary.image,
          emotion: diary.emotion,
          isRead: isReadFromBackend !== undefined ? isReadFromBackend : isReadFromLocal,
          createdAt: new Date().toISOString(),
        };
        return acc;
      }, {});

      // 먼저 목록 데이터 표시 (이미지 없이라도)
      setDiaries(diariesMap);

      // 2단계: 이미지가 없는 일기들 개별 조회 (병렬 처리)
      const diariesWithoutImage = Object.entries(diariesMap).filter(
        ([, diary]) => !diary.thumbnailUrl && !diary.imageUrl
      );

      if (diariesWithoutImage.length > 0) {
        const detailPromises = diariesWithoutImage.map(async ([dateKey, diary]) => {
          try {
            const detail = await diaryApi.getById(diary.id);
            return {
              dateKey,
              imageUrl: detail.diary?.image || detail.image || detail.imageUrl,
            };
          } catch {
            return { dateKey, imageUrl: null };
          }
        });

        const details = await Promise.all(detailPromises);

        // 이미지 정보 업데이트
        setDiaries((prev) => {
          const updated = { ...prev };
          details.forEach(({ dateKey, imageUrl }) => {
            if (imageUrl && updated[dateKey]) {
              updated[dateKey] = {
                ...updated[dateKey],
                imageUrl,
                thumbnailUrl: imageUrl,
              };
            }
          });
          return updated;
        });
      }
    } catch (err) {
      logError(err, { action: 'fetchDiaries', year, month });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return { diaries, loading, error, refetch: fetchDiaries };
};

interface UseDiaryReturn {
  diary: Diary | null;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

/**
 * 일기 상세 훅 (id 기반)
 */
export const useDiary = (id: number | null): UseDiaryReturn => {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchDiary = useCallback(async (): Promise<void> => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // 백엔드: getById(id) 사용, 응답: {id, date, title, content, imageUrl, big5Scores?, createdAt}
      const data = await diaryApi.getById(id);
      setDiary({
        id: data.id,
        date: data.date,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt,
      });
    } catch (err) {
      logError(err, { action: 'fetchDiary', id });
      setError(err);
      setDiary(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  return {
    diary,
    loading,
    error,
    refetch: fetchDiary,
  };
};

interface UseDiaryMutationsReturn {
  createDiary: (data: any) => Promise<[Diary, null] | [null, unknown]>;
  updateDiary: (id: number, data: any) => Promise<[any, null] | [null, unknown]>;
  deleteDiary: (id: number) => Promise<[boolean, null] | [false, unknown]>;
  loading: boolean;
  error: unknown | null;
}

/**
 * 일기 작성/수정/삭제 훅
 */
export const useDiaryMutations = (): UseDiaryMutationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  // 일기 생성 (백엔드에 create API 없음 - 시스템 자동 생성만 지원)
  const createDiary = useCallback(async (data: { date: string; emotion: string; summary: string; pictureUrl?: string }): Promise<[Diary, null] | [null, unknown]> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 백엔드에 일기 수동 생성 API 없음
      // POST /api/diary/generate는 시스템용 (X-System-Auth 필요)
      // 임시로 에러 반환
      throw new Error('일기 수동 생성 기능은 백엔드 미구현');
    } catch (err) {
      logError(err, { action: 'createDiary', data });
      setError(err);

      if (window.showToast) {
        window.showToast('일기 저장에 실패했습니다.', 'error');
      }

      return [null, err];
    } finally {
      setLoading(false);
    }
  }, []);

  // 일기 수정
  const updateDiary = useCallback(async (id: number, data: any): Promise<[any, null] | [null, unknown]> => {
    setLoading(true);
    setError(null);

    try {
      // 백엔드: PUT /api/diary/{id}, 응답: {id, updatedAt, message}
      const result = await diaryApi.update(id, data);

      if (window.showToast) {
        window.showToast('일기가 수정되었습니다.', 'success');
      }

      return [result, null];
    } catch (err) {
      logError(err, { action: 'updateDiary', id, data });
      setError(err);

      if (window.showToast) {
        window.showToast('일기 수정에 실패했습니다.', 'error');
      }

      return [null, err];
    } finally {
      setLoading(false);
    }
  }, []);

  // 일기 삭제
  const deleteDiary = useCallback(async (id: number): Promise<[boolean, null] | [false, unknown]> => {
    setLoading(true);
    setError(null);

    try {
      await diaryApi.delete(id);

      if (window.showToast) {
        window.showToast('일기가 삭제되었습니다.', 'success');
      }

      return [true, null];
    } catch (err) {
      logError(err, { action: 'deleteDiary', id });
      setError(err);

      if (window.showToast) {
        window.showToast('일기 삭제에 실패했습니다.', 'error');
      }

      return [false, err];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDiary,
    updateDiary,
    deleteDiary,
    loading,
    error,
  };
};

export default useDiary;
