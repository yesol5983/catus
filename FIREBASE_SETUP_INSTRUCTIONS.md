# 🔥 Firebase 설정 정보 확인 방법

## 1️⃣ Firebase Console 접속

1. 브라우저에서 접속: https://console.firebase.google.com/
2. Google 계정으로 로그인
3. CATUS 프로젝트 선택

---

## 2️⃣ Firebase SDK 설정 정보 복사

1. 왼쪽 사이드바에서 **⚙️ 설정 (톱니바퀴 아이콘)** 클릭
2. **프로젝트 설정** 선택
3. **일반** 탭 선택
4. 아래로 스크롤하여 **내 앱** 섹션 찾기

### 웹 앱이 없는 경우:
- **웹 앱 추가** 버튼 (</> 아이콘) 클릭
- 앱 닉네임: `Catus Web` 입력
- **앱 등록** 클릭

### 웹 앱이 있는 경우:
- 기존 웹 앱에서 **SDK 설정 및 구성** 섹션 확인
- **구성** 라디오 버튼 선택
- `firebaseConfig` 객체 복사

**예시:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "catus-xxxxx.firebaseapp.com",
  projectId: "catus-xxxxx",
  storageBucket: "catus-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 3️⃣ VAPID 공개 키 확인

1. **프로젝트 설정** 페이지에서 **Cloud Messaging** 탭 선택
2. 아래로 스크롤하여 **웹 푸시 인증서** 섹션 찾기

### VAPID 키가 없는 경우:
- **키 쌍 생성** 버튼 클릭
- 생성된 키 복사

### VAPID 키가 있는 경우:
- 키 쌍 값 복사 (예: `BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

---

## 4️⃣ 설정 정보 입력

위에서 복사한 정보를 다음 두 파일에 입력:

### 📁 `.env` 파일
```bash
VITE_FIREBASE_API_KEY=여기에_apiKey_붙여넣기
VITE_FIREBASE_AUTH_DOMAIN=여기에_authDomain_붙여넣기
VITE_FIREBASE_PROJECT_ID=여기에_projectId_붙여넣기
VITE_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_붙여넣기
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_붙여넣기
VITE_FIREBASE_APP_ID=여기에_appId_붙여넣기
VITE_FIREBASE_MEASUREMENT_ID=여기에_measurementId_붙여넣기
VITE_FIREBASE_VAPID_KEY=여기에_VAPID키_붙여넣기
```

### 📁 `public/firebase-messaging-sw.js` 파일 (19번째 줄)
```javascript
const firebaseConfig = {
  apiKey: "여기에_apiKey_붙여넣기",
  authDomain: "여기에_authDomain_붙여넣기",
  projectId: "여기에_projectId_붙여넣기",
  storageBucket: "여기에_storageBucket_붙여넣기",
  messagingSenderId: "여기에_messagingSenderId_붙여넣기",
  appId: "여기에_appId_붙여넣기",
  measurementId: "여기에_measurementId_붙여넣기"
};
```

---

## ✅ 완료 후

설정 완료하면 알려주세요! 바로 테스트 진행하겠습니다. 🚀
