/**
 * Vercel Serverless Function - Backend API Proxy
 * ⚠️ 임시 SSL 검증 우회용 - 개발/테스트 전용
 * TODO: 백엔드 SSL 인증서 설정 후 제거 필요
 */

import https from 'https';
import axios from 'axios';

const BACKEND_URL = 'https://34.158.193.95/api';

// SSL 검증 우회 에이전트 (⚠️ 개발용만!)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Query string 파싱
    const url = new URL(req.url, `https://${req.headers.host}`);

    // /api/proxy 경로 제거
    let path = url.pathname.replace(/^\/api\/proxy/, '') || '/';

    // Query string 추가
    if (url.search) {
      path += url.search;
    }

    const targetUrl = `${BACKEND_URL}${path}`;

    console.log('📤 [REQUEST]', {
      method: req.method,
      originalUrl: req.url,
      targetUrl,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Bearer ***' : undefined,
      },
      body: req.body
    });

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'content-type': req.headers['content-type'] || 'application/json',
        'authorization': req.headers['authorization'],
      },
      data: req.body,
      httpsAgent, // ⚠️ SSL 검증 우회
      validateStatus: () => true, // 모든 상태 코드 허용
    });

    console.log('📥 [RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });

    // 응답 헤더 복사
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    // 응답 전달
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message,
      details: error.stack
    });
  }
}
