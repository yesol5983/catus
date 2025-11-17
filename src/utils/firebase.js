// Firebase 초기화 및 FCM 설정
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정 정보 (Firebase Console에서 복사)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// FCM 인스턴스 생성
const messaging = getMessaging(app);

/**
 * 푸시 알림 권한 요청 및 FCM 토큰 발급
 * @returns {Promise<string|null>} FCM 토큰 또는 null
 */
export const requestNotificationPermission = async () => {
  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ 알림 권한 허용됨');

      // FCM 토큰 발급
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log('🔑 FCM 토큰:', token);

        // 서버에 토큰 전송하여 저장
        await saveTokenToServer(token);

        return token;
      } else {
        console.error('❌ FCM 토큰 발급 실패');
        return null;
      }
    } else {
      console.warn('⚠️ 알림 권한 거부됨');
      return null;
    }
  } catch (error) {
    console.error('❌ 알림 권한 요청 에러:', error);
    return null;
  }
};

/**
 * 서버에 FCM 토큰 저장
 * @param {string} token - FCM 토큰
 */
const saveTokenToServer = async (token) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fcm/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ fcmToken: token })
    });

    if (response.ok) {
      console.log('✅ FCM 토큰 서버 저장 완료');
      localStorage.setItem('fcm_token', token);
    } else {
      console.error('❌ FCM 토큰 서버 저장 실패');
    }
  } catch (error) {
    console.error('❌ FCM 토큰 서버 저장 에러:', error);
  }
};

/**
 * 포그라운드 메시지 수신 리스너
 * (앱이 열려있을 때 알림 수신)
 */
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('📩 포그라운드 메시지 수신:', payload);

    // 커스텀 알림 표시
    const { title, body, icon } = payload.notification;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/catus-logo.png',
        badge: '/catus-badge.png',
        tag: 'catus-notification',
        requireInteraction: false
      });
    }

    // 콜백 함수 실행 (UI 업데이트 등)
    if (callback) {
      callback(payload);
    }
  });
};

/**
 * FCM 토큰 갱신 감지
 */
export const onTokenRefresh = (callback) => {
  // Firebase SDK v9+는 자동으로 토큰 갱신 처리
  // 필요시 주기적으로 토큰 체크
  setInterval(async () => {
    try {
      const newToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      const storedToken = localStorage.getItem('fcm_token');

      if (newToken && newToken !== storedToken) {
        console.log('🔄 FCM 토큰 갱신됨:', newToken);
        await saveTokenToServer(newToken);

        if (callback) {
          callback(newToken);
        }
      }
    } catch (error) {
      console.error('❌ 토큰 갱신 체크 에러:', error);
    }
  }, 60 * 60 * 1000); // 1시간마다 체크
};

export { messaging };
