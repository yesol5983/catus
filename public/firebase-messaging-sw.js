// Firebase Cloud Messaging Service Worker
// 백그라운드에서 푸시 알림을 수신하고 표시

// Firebase SDK import (CDN 방식)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase 설정 (환경 변수는 Service Worker에서 직접 접근 불가하므로 하드코딩)
// ⚠️ 실제 Firebase 프로젝트 설정으로 교체 필요
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// FCM 인스턴스 생성
const messaging = firebase.messaging();

/**
 * 백그라운드 메시지 수신 이벤트
 * (브라우저가 백그라운드일 때 자동으로 알림 표시)
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

  // 알림 데이터 추출
  const notificationTitle = payload.notification?.title || 'CATUS 알림';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 알림이 도착했습니다.',
    icon: payload.notification?.icon || '/catus-logo.png',
    badge: '/catus-badge.png',
    tag: 'catus-notification',
    requireInteraction: false,
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: '확인하기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  // 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 알림 클릭 이벤트
 * (알림을 클릭했을 때 동작)
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭:', event.notification);

  event.notification.close();

  // 액션에 따른 처리
  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // 열린 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (event.action === 'close') {
    // 닫기 액션 (아무것도 하지 않음)
    console.log('[firebase-messaging-sw.js] 알림 닫힘');
  } else {
    // 기본 클릭 (알림 본문 클릭)
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

/**
 * 푸시 이벤트 (선택사항)
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push 이벤트:', event);
});

console.log('[firebase-messaging-sw.js] Service Worker 로드 완료');
