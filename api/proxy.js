/**
 * Vercel Serverless Function - Backend API Proxy
 * ⚠️ 임시 SSL 검증 우회용 - 개발/테스트 전용
 * TODO: 백엔드 SSL 인증서 설정 후 제거 필요
 */

const https = require('https');
const axios = require('axios');

const BACKEND_URL = 'https://34.158.193.95/api';

// SSL 검증 우회 에이전트 (⚠️ 개발용만!)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

module.exports = async (req, res) => {
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
    // /api/proxy 경로 제거하고 백엔드로 프록시 요청
    const path = req.url.replace(/^\/api\/proxy/, '') || '/';
    const targetUrl = `${BACKEND_URL}${path}`;

    console.log(`Proxying: ${req.method} ${req.url} -> ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'],
      },
      data: req.body,
      httpsAgent, // ⚠️ SSL 검증 우회
      validateStatus: () => true, // 모든 상태 코드 허용
    });

    // 응답 헤더 복사
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    // 응답 전달
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
};
