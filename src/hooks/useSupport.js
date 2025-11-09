/**
 * 익명 응원 메시지 커스텀 훅
 */

import { useState, useCallback, useEffect } from 'react';
import { supportApi } from '../utils/api';
import { logError } from '../utils/errorHandler';

/**
 * 익명 응원 훅
 * @returns {Object} 메시지 관련 상태 및 함수
 */
export const useSupport = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 받은 메시지 조회
  const fetchReceived = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await supportApi.getReceived();
      setReceivedMessages(data);
    } catch (err) {
      logError(err, { action: 'fetchReceived' });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 보낸 메시지 조회
  const fetchSent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await supportApi.getSent();
      setSentMessages(data);
    } catch (err) {
      logError(err, { action: 'fetchSent' });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (messageData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await supportApi.send(messageData);

      // 보낸 메시지 목록에 추가
      setSentMessages((prev) => [result, ...prev]);

      if (window.showToast) {
        window.showToast('응원 메시지가 전송되었습니다.', 'success');
      }

      return [result, null];
    } catch (err) {
      logError(err, { action: 'sendMessage', messageData });
      setError(err);

      if (window.showToast) {
        window.showToast('메시지 전송에 실패했습니다.', 'error');
      }

      return [null, err];
    } finally {
      setLoading(false);
    }
  }, []);

  // 메시지 읽음 처리
  const markAsRead = useCallback(async (messageId) => {
    try {
      await supportApi.markAsRead(messageId);

      // 로컬 상태 업데이트
      setReceivedMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (err) {
      logError(err, { action: 'markAsRead', messageId });
    }
  }, []);

  // 읽지 않은 메시지 수
  const unreadCount = receivedMessages.filter((msg) => !msg.isRead).length;

  return {
    receivedMessages,
    sentMessages,
    loading,
    error,
    unreadCount,
    fetchReceived,
    fetchSent,
    sendMessage,
    markAsRead,
  };
};

export default useSupport;
