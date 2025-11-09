/**
 * 일기 CRUD 커스텀 훅
 */

import { useState, useCallback, useEffect } from 'react';
import { diaryApi } from '../utils/api';
import { logError } from '../utils/errorHandler';

/**
 * 일기 목록 훅
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Object} 일기 관련 상태 및 함수
 */
export const useDiaryList = (year, month) => {
  const [diaries, setDiaries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await diaryApi.getList(year, month);
      // 배열을 객체로 변환 (날짜를 키로)
      const diariesMap = data.reduce((acc, diary) => {
        acc[diary.date] = diary;
        return acc;
      }, {});
      setDiaries(diariesMap);
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

  return {
    diaries,
    loading,
    error,
    refetch: fetchDiaries,
  };
};

/**
 * 일기 상세 훅
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @returns {Object} 일기 상세 정보 및 함수
 */
export const useDiary = (date) => {
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiary = useCallback(async () => {
    if (!date) return;

    setLoading(true);
    setError(null);

    try {
      const data = await diaryApi.getByDate(date);
      setDiary(data);
    } catch (err) {
      logError(err, { action: 'fetchDiary', date });
      setError(err);
      setDiary(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

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

/**
 * 일기 작성/수정/삭제 훅
 * @returns {Object} CRUD 함수들
 */
export const useDiaryMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 일기 생성
  const createDiary = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await diaryApi.create(data);

      if (window.showToast) {
        window.showToast('일기가 저장되었습니다.', 'success');
      }

      return [result, null];
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
  const updateDiary = useCallback(async (date, data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await diaryApi.update(date, data);

      if (window.showToast) {
        window.showToast('일기가 수정되었습니다.', 'success');
      }

      return [result, null];
    } catch (err) {
      logError(err, { action: 'updateDiary', date, data });
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
  const deleteDiary = useCallback(async (date) => {
    setLoading(true);
    setError(null);

    try {
      await diaryApi.delete(date);

      if (window.showToast) {
        window.showToast('일기가 삭제되었습니다.', 'success');
      }

      return [true, null];
    } catch (err) {
      logError(err, { action: 'deleteDiary', date });
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
