/**
 * Catus 백엔드 API 전체 테스트 스크립트
 * 실행: node test-backend-apis.js
 */

const https = require('https');
const axios = require('axios');

const BACKEND_URL = 'https://34.158.193.95/api';

// SSL 검증 우회 (개발용)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const api = axios.create({
  baseURL: BACKEND_URL,
  httpsAgent,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 색상 출력 유틸리티
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}\n${colors.magenta}${msg}${colors.reset}\n${colors.magenta}${'='.repeat(60)}${colors.reset}\n`),
};

// 테스트 결과 저장
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// 테스트 헬퍼
async function test(name, fn, requiresAuth = false) {
  testResults.total++;

  if (requiresAuth && !global.authToken) {
    log.warning(`SKIPPED: ${name} (인증 필요)`);
    testResults.skipped++;
    testResults.details.push({ name, status: 'SKIPPED', reason: '인증 필요' });
    return;
  }

  try {
    log.info(`Testing: ${name}`);
    const result = await fn();
    log.success(`PASSED: ${name}`);
    testResults.passed++;
    testResults.details.push({ name, status: 'PASSED', result });
    return result;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || '알 수 없는 오류';
    const statusCode = error.response?.status || 'N/A';
    log.error(`FAILED: ${name}`);
    console.log(`   └─ Status: ${statusCode}, Message: ${errorMsg}`);
    testResults.failed++;
    testResults.details.push({
      name,
      status: 'FAILED',
      error: errorMsg,
      statusCode
    });
  }
}

// 인증 헤더 설정
function setAuthToken(token) {
  global.authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ============================================================
// 테스트 시작
// ============================================================

async function runTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║           Catus 백엔드 API 전체 테스트 시작               ║
║           Backend: ${BACKEND_URL}           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  // ============================================================
  // 1. 서버 상태 확인
  // ============================================================
  log.section('1️⃣  서버 상태 확인');

  await test('서버 Health Check', async () => {
    const response = await api.get('/health');
    console.log('   └─ Response:', response.data);
    return response.data;
  });

  await test('서버 정보 조회', async () => {
    const response = await api.get('/info');
    console.log('   └─ Response:', response.data);
    return response.data;
  });

  // ============================================================
  // 2. 인증 API (공개)
  // ============================================================
  log.section('2️⃣  인증 API 테스트');

  // 실제 카카오 로그인은 웹 플로우가 필요하므로 스킵
  log.warning('카카오 로그인 테스트 스킵 (실제 웹 플로우 필요)');
  testResults.skipped++;

  // 테스트용 사용자 로그인 (백엔드에 테스트 계정이 있다면)
  await test('로그인 테스트 (테스트 계정)', async () => {
    try {
      // 백엔드에 테스트용 로그인 API가 있다면 사용
      const response = await api.post('/auth/test-login', {
        username: 'test@catus.com',
        password: 'test1234'
      });

      if (response.data.accessToken) {
        setAuthToken(response.data.accessToken);
        console.log('   └─ 토큰 발급 성공');
      }

      return response.data;
    } catch (error) {
      // 테스트 로그인 API가 없으면 스킵
      if (error.response?.status === 404) {
        throw new Error('테스트 로그인 API 미구현');
      }
      throw error;
    }
  });

  // ============================================================
  // 3. 채팅 API
  // ============================================================
  log.section('3️⃣  채팅 API 테스트');

  await test('채팅 메시지 전송', async () => {
    const response = await api.post('/chat/message', {
      message: '테스트 메시지입니다.'
    });
    console.log('   └─ AI 응답:', response.data.aiResponse?.substring(0, 50) + '...');
    global.testMessageId = response.data.messageId;
    return response.data;
  }, true);

  await test('채팅 히스토리 조회 (페이징)', async () => {
    const response = await api.get('/chat/history?page=0&size=10');
    console.log('   └─ 총 메시지:', response.data.totalMessages);
    console.log('   └─ 현재 페이지 메시지:', response.data.messages.length);
    return response.data;
  }, true);

  await test('특정 날짜 채팅 조회', async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const response = await api.get(`/chat/context/${today}`);
    console.log('   └─ 날짜:', response.data.date);
    console.log('   └─ 메시지 수:', response.data.messages.length);
    return response.data;
  }, true);

  await test('채팅 분석', async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await api.post('/chat/analyze', {
      startDate,
      endDate
    });
    console.log('   └─ 분석 기간:', `${startDate} ~ ${endDate}`);
    console.log('   └─ 주요 감정:', response.data.dominantEmotion);
    return response.data;
  }, true);

  // ============================================================
  // 4. 일기 API
  // ============================================================
  log.section('4️⃣  일기 API 테스트');

  await test('일기 목록 조회 (월별)', async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const response = await api.get(`/diary/list?year=${year}&month=${month}`);
    console.log('   └─ 조회 월:', `${year}년 ${month}월`);
    console.log('   └─ 일기 수:', response.data.diaries.length);

    // 첫 번째 일기 ID 저장 (수정/삭제 테스트용)
    if (response.data.diaries.length > 0) {
      global.testDiaryId = response.data.diaries[0].id;
    }

    return response.data;
  }, true);

  await test('일기 상세 조회', async () => {
    if (!global.testDiaryId) {
      throw new Error('테스트할 일기가 없습니다.');
    }

    const response = await api.get(`/diary/${global.testDiaryId}`);
    console.log('   └─ 일기 제목:', response.data.title);
    console.log('   └─ 작성일:', response.data.date);
    return response.data;
  }, true);

  await test('일기 수정', async () => {
    if (!global.testDiaryId) {
      throw new Error('테스트할 일기가 없습니다.');
    }

    const response = await api.put(`/diary/${global.testDiaryId}`, {
      title: '수정된 제목 (테스트)',
      content: '수정된 내용입니다. 이것은 API 테스트입니다.'
    });
    console.log('   └─ 수정 완료:', response.data.message);
    return response.data;
  }, true);

  await test('랜덤 일기 조회', async () => {
    const response = await api.get('/diary/random');
    console.log('   └─ 랜덤 일기:', response.data.title);
    return response.data;
  }, true);

  // 삭제는 마지막에 (데이터 보존)
  // await test('일기 삭제', async () => { ... }, true);

  // ============================================================
  // 5. 익명 메시지 API
  // ============================================================
  log.section('5️⃣  익명 메시지 API 테스트');

  await test('받은 메시지 조회', async () => {
    const response = await api.get('/message/received?page=0&size=20');
    console.log('   └─ 전체 페이지:', response.data.totalPages);
    console.log('   └─ 읽지 않은 메시지:', response.data.unreadCount);

    // 첫 번째 메시지 ID 저장
    if (response.data.messages.length > 0) {
      global.testMessageId = response.data.messages[0].id;
    }

    return response.data;
  }, true);

  await test('알림 조회', async () => {
    const response = await api.get('/message/notifications');
    console.log('   └─ 읽지 않은 수:', response.data.unreadCount);
    console.log('   └─ 알림 개수:', response.data.notifications.length);
    return response.data;
  }, true);

  await test('메시지 읽음 처리', async () => {
    if (!global.testMessageId) {
      throw new Error('읽음 처리할 메시지가 없습니다.');
    }

    const response = await api.put(`/message/read/${global.testMessageId}`);
    console.log('   └─ 결과:', response.data.message);
    return response.data;
  }, true);

  await test('메시지 전송', async () => {
    if (!global.testDiaryId) {
      throw new Error('메시지를 보낼 일기가 없습니다.');
    }

    const response = await api.post('/message/send', {
      diaryId: global.testDiaryId,
      content: '테스트 익명 메시지입니다.'
    });
    console.log('   └─ 메시지 ID:', response.data.messageId);
    console.log('   └─ 전송 시간:', response.data.sentAt);
    return response.data;
  }, true);

  // ============================================================
  // 6. Big5 성격 분석 API
  // ============================================================
  log.section('6️⃣  Big5 성격 분석 API 테스트');

  await test('현재 성격 점수 조회', async () => {
    const response = await api.get('/big5/current');
    console.log('   └─ 성격 점수:', response.data.scores);
    return response.data;
  }, true);

  await test('성격 변화 이력 조회 (월별)', async () => {
    const response = await api.get('/big5/history?period=monthly');
    console.log('   └─ 이력 개수:', response.data.history.length);
    return response.data;
  }, true);

  // 초기 테스트는 한 번만 실행하므로 스킵
  log.warning('Big5 초기 테스트 제출 스킵 (한 번만 실행 가능)');
  testResults.skipped++;

  // ============================================================
  // 7. 설정 API
  // ============================================================
  log.section('7️⃣  설정 API 테스트');

  await test('설정 조회', async () => {
    const response = await api.get('/settings');
    console.log('   └─ 일기 생성 시간:', response.data.diaryGenerationTime);
    console.log('   └─ 닉네임:', response.data.nickname);
    return response.data;
  }, true);

  await test('일기 생성 시간 변경', async () => {
    const response = await api.put('/settings/diary-time', {
      time: '09:00'
    });
    console.log('   └─ 변경된 시간:', response.data.diaryGenerationTime);
    return response.data;
  }, true);

  await test('알림 설정 변경', async () => {
    const response = await api.put('/settings/notifications', {
      diaryCreated: true,
      messageReceived: true
    });
    console.log('   └─ 알림 설정:', response.data.notifications);
    return response.data;
  }, true);

  await test('테마 설정 변경', async () => {
    const response = await api.put('/settings/theme', {
      darkMode: true
    });
    console.log('   └─ 다크모드:', response.data.theme.darkMode);
    return response.data;
  }, true);

  // ============================================================
  // 8. 통계 API
  // ============================================================
  log.section('8️⃣  통계 API 테스트');

  await test('감정 통계 조회', async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const response = await api.get(`/stats/emotions?year=${year}&month=${month}`);
    console.log('   └─ 조회 기간:', `${year}년 ${month}월`);
    console.log('   └─ 감정 데이터:', response.data.emotions);
    return response.data;
  }, true);

  await test('월별 통계 조회', async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const response = await api.get(`/stats/monthly?year=${year}&month=${month}`);
    console.log('   └─ 총 일기:', response.data.totalDiaries);
    console.log('   └─ 총 채팅:', response.data.totalChats);
    return response.data;
  }, true);

  // ============================================================
  // 9. 사용자 API (온보딩)
  // ============================================================
  log.section('9️⃣  사용자 API 테스트');

  // 온보딩은 한 번만 실행 가능하므로 스킵
  log.warning('온보딩 정보 저장 스킵 (한 번만 실행 가능)');
  testResults.skipped++;

  // ============================================================
  // 테스트 결과 요약
  // ============================================================
  log.section('📊 테스트 결과 요약');

  console.log(`총 테스트: ${testResults.total}`);
  console.log(`${colors.green}✅ 성공: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ 실패: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  스킵: ${testResults.skipped}${colors.reset}`);

  const successRate = ((testResults.passed / (testResults.total - testResults.skipped)) * 100).toFixed(1);
  console.log(`\n성공률: ${successRate}%`);

  // 상세 결과
  console.log('\n상세 결과:');
  testResults.details.forEach((detail, index) => {
    const icon = detail.status === 'PASSED' ? '✅' : detail.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${icon} ${detail.name}`);
    if (detail.error) {
      console.log(`   └─ 에러: ${detail.error} (Status: ${detail.statusCode})`);
    }
  });

  console.log(`\n${colors.cyan}테스트 완료!${colors.reset}\n`);
}

// 실행
runTests().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
  process.exit(1);
});
