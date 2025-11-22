# 백엔드 보안 요구사항
**작성일**: 2025-01-21
**목적**: 프론트엔드-백엔드 통합 시 보안 수준 유지

---

## 🔴 필수 요구사항 (P0 - 통합 전 구현 필수)

### **1. HttpOnly Cookie로 JWT 토큰 전달**

#### **현재 문제점**:
프론트엔드가 `localStorage`에 JWT 토큰을 저장 중 → XSS 공격 시 즉시 탈취 가능

#### **요구 사항**:
```http
POST /api/v1/auth/kakao
Response:
Set-Cookie: accessToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=yyy; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800
```

#### **설정 상세**:
- **HttpOnly**: JavaScript 접근 차단 (XSS 방어)
- **Secure**: HTTPS에서만 전송
- **SameSite=Strict**: CSRF 공격 방어
- **Path**: 쿠키 유효 경로 제한
- **Max-Age**:
  - accessToken: 15분 (900초)
  - refreshToken: 7일 (604800초)

#### **프론트엔드 변경사항**:
```typescript
// 기존 (localStorage)
localStorage.setItem('catus_access_token', token);

// 변경 후 (자동)
// 쿠키는 브라우저가 자동으로 모든 요청에 포함
axios.defaults.withCredentials = true;
```

---

### **2. CORS 정책 엄격히 설정**

#### **현재 문제점**:
CORS 설정이 `Access-Control-Allow-Origin: *`일 가능성 → 모든 도메인 허용

#### **요구 사항**:
```javascript
// Express 예시
app.use(cors({
  origin: [
    'https://your-domain.vercel.app',     // 프로덕션
    'https://staging.your-domain.app',    // 스테이징
    'http://localhost:8100'               // 개발 (개발 환경에만)
  ],
  credentials: true,  // HttpOnly 쿠키 전송 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400  // Preflight 캐싱 (24시간)
}));
```

#### **절대 하지 말 것**:
```javascript
❌ origin: '*'  // 모든 도메인 허용 (위험!)
❌ credentials: true와 origin: '*' 동시 사용 (브라우저 차단)
```

---

### **3. Rate Limiting (브루트 포스 공격 방어)**

#### **요구 사항**:
```javascript
// Express 예시 (express-rate-limit)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 5,                     // 15분에 5회만 허용
  message: '로그인 시도 횟수 초과. 15분 후 다시 시도하세요.',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/v1/auth/kakao', loginLimiter, authController.kakaoLogin);
```

#### **적용 엔드포인트**:
- `/auth/kakao` - 5회/15분
- `/auth/refresh` - 10회/15분
- `/auth/signup` - 3회/1시간

---

### **4. Input Validation (서버 측 검증)**

#### **요구 사항**:
프론트엔드 검증은 **우회 가능** → 백엔드에서 반드시 재검증

```javascript
// 예시: 닉네임 검증
const validateNickname = (nickname) => {
  if (!nickname || nickname.length < 2 || nickname.length > 10) {
    throw new ValidationError('닉네임은 2-10자여야 합니다.');
  }

  // XSS 패턴 차단
  if (/<script|javascript:|onerror|onload/gi.test(nickname)) {
    throw new ValidationError('허용되지 않는 문자가 포함되어 있습니다.');
  }

  // SQL Injection 패턴 차단
  if (/SELECT|INSERT|UPDATE|DELETE|DROP|--|;/gi.test(nickname)) {
    throw new ValidationError('허용되지 않는 문자가 포함되어 있습니다.');
  }

  return nickname.trim();
};
```

---

## 🟡 권장 요구사항 (P1 - 런칭 전 구현 권장)

### **5. CSP Nonce 지원**

#### **현재 문제점**:
프론트엔드 CSP에 `unsafe-inline`, `unsafe-eval` 허용 → 보안 약화

#### **요구 사항**:
백엔드에서 매 요청마다 랜덤 nonce 생성 후 HTML에 삽입

```javascript
// Express 예시
app.get('*', (req, res) => {
  const nonce = crypto.randomBytes(16).toString('base64');

  res.setHeader('Content-Security-Policy', `
    script-src 'self' 'nonce-${nonce}';
    style-src 'self' 'nonce-${nonce}';
  `);

  // HTML에 nonce 삽입
  const html = indexHtml.replace(
    '<script',
    `<script nonce="${nonce}"`
  );

  res.send(html);
});
```

---

### **6. Security Headers 설정**

#### **요구 사항**:
```javascript
// Express 예시 (helmet 사용)
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{NONCE}'"],
      styleSrc: ["'self'", "'nonce-{NONCE}'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://catus-backend-node.vercel.app"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));
```

---

### **7. JWT Secret 관리**

#### **요구 사항**:
```javascript
// ❌ 하드코딩 금지
const JWT_SECRET = 'my-secret-key';

// ✅ 환경변수 사용
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ 주기적 갱신 (3개월마다)
const JWT_SECRET = process.env[`JWT_SECRET_${getCurrentQuarter()}`];
```

#### **생성 방법**:
```bash
# 256비트 랜덤 시크릿 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### **8. Prepared Statements (SQL Injection 방어)**

#### **요구 사항**:
```javascript
// ❌ 문자열 연결 (SQL Injection 위험)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Prepared Statement
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);

// ✅ ORM 사용 (TypeORM, Sequelize 등)
await User.findOne({ where: { email } });
```

---

## 🟢 선택 요구사항 (P2 - 장기 개선)

### **9. 로그 관리**

```javascript
// 민감 정보 마스킹
logger.info('User login', {
  userId: user.id,
  email: maskEmail(user.email),  // t***@example.com
  ip: req.ip,
  // ❌ password, token은 절대 로깅하지 않음
});
```

---

### **10. 파일 업로드 검증**

```javascript
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (req, file, cb) => {
    // MIME 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('허용되지 않는 파일 형식입니다.'));
    }

    // 확장자 검증
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new Error('허용되지 않는 파일 확장자입니다.'));
    }

    cb(null, true);
  }
});
```

---

## 📋 통합 체크리스트

### **프론트엔드 (완료)**:
- [x] CSP 헤더 설정
- [x] 보안 헤더 10개 추가
- [x] XSS/Injection 방어 로직
- [x] HTTPS 강제 리다이렉트
- [x] 환경변수 검증
- [x] npm audit 취약점 제거
- [x] console.log 프로덕션 제거

### **백엔드 (요청)**:
- [ ] **P0**: HttpOnly Cookie 구현
- [ ] **P0**: CORS 정책 엄격히 설정
- [ ] **P0**: Rate Limiting 적용
- [ ] **P0**: Input Validation (서버 측)
- [ ] **P1**: CSP Nonce 지원
- [ ] **P1**: Security Headers 설정
- [ ] **P1**: JWT Secret 환경변수화
- [ ] **P1**: Prepared Statements 사용
- [ ] **P2**: 로그 민감정보 마스킹
- [ ] **P2**: 파일 업로드 검증

---

## 🔧 통합 시 테스트 항목

### **1. 쿠키 동작 확인**:
```bash
# 로그인 후 쿠키 확인
curl -c cookies.txt -X POST https://api.your-domain.com/auth/kakao

# 쿠키가 자동으로 포함되는지 확인
curl -b cookies.txt https://api.your-domain.com/auth/me
```

### **2. CORS 확인**:
```javascript
// 브라우저 콘솔에서
fetch('https://api.your-domain.com/auth/me', {
  credentials: 'include'  // 쿠키 포함
}).then(r => r.json()).then(console.log);
```

### **3. Rate Limiting 확인**:
```bash
# 6번 연속 로그인 시도
for i in {1..6}; do
  curl -X POST https://api.your-domain.com/auth/kakao
done
# 6번째 요청이 429 Too Many Requests 반환해야 함
```

---

## 📞 연락 및 협업

### **질문 사항**:
1. 현재 백엔드 프레임워크? (Express, NestJS, FastAPI 등)
2. 현재 CORS 설정 상태?
3. JWT 토큰 발급 방식?
4. 데이터베이스 종류? (MySQL, PostgreSQL, MongoDB 등)

### **프론트엔드 대응**:
백엔드에서 HttpOnly Cookie 구현 완료 시, 프론트엔드는:
```typescript
// axios 글로벌 설정
axios.defaults.withCredentials = true;

// localStorage 제거
// localStorage.setItem('catus_access_token', token); // 삭제
// localStorage.setItem('catus_refresh_token', token); // 삭제
```

---

**작성자**: 프론트엔드 팀
**최종 업데이트**: 2025-01-21
**다음 단계**: 백엔드 팀과 P0 요구사항 협의
