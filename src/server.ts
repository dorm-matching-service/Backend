// src/app.ts
import 'dotenv/config';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // ✅ 사용자 라우트 추가
import prisma from './db/prisma.js';

// ✅ SMTP 설정 확인 로그 (디버깅용)
console.log(
  'SMTP host/port/secure',
  process.env.SMTP_HOST,
  process.env.SMTP_PORT,
  Number(process.env.SMTP_PORT) === 465,
);
console.log(
  'SMTP user(masked):',
  (process.env.SMTP_USER || '').replace(/.(?=.{3})/g, '*'),
);
console.log('FROM:', process.env.EMAIL_FROM);

const app = express();

// ✅ 프록시 뒤(Cloudflare/ELB 등)에서 secure 쿠키 인식
app.set('trust proxy', 1);

// ✅ CORS 설정 추가
// process.env.CORS_ORIGIN이 있으면 ,로 구분된 여러 도메인 허용
// 없으면 기본값은 http://localhost:3000 으로 지정 (Next.js dev 서버)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || [
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // ✅ 여기가 올바른 위치
  }),
);

// ✅ 기본 미들웨어
app.use(express.json());
app.use(cookieParser());

// ✅ OTP 남발 방지: 이메일 관련 엔드포인트만 타이트하게 제한
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10분
  max: 20, // 10분에 최대 20회
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/email/start', otpLimiter);
app.use('/auth/email/verify', otpLimiter);

// ✅ 라우터 등록
app.use('/auth', authRoutes);
app.use('/users', userRoutes); // ✅ 분리한 사용자 라우트 등록

// ✅ 헬스 체크
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

// ✅ 404 핸들러 (라우트 미스)
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ✅ 에러 핸들러 (반드시 4개 인자)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🚨 서버 에러 발생:', err);
  res.status(500).json({ message: '서버 에러' });
});

// ✅ 포트 설정
const PORT = Number(process.env.PORT) || 3001;

// ✅ 서버 시작 전 Prisma 연결 확인
async function startServer() {
  try {
    console.log('⏳ Prisma 데이터베이스 연결 시도 중...');
    await prisma.$connect();
    console.log('🟢 Prisma 및 DB 연결 성공!');

    // 🔥 핵심 수정 → '0.0.0.0'으로 바인딩
    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ 서버 실행 성공!');
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
      console.log('🔗 OTP endpoints:');
      console.log(`   POST http://0.0.0.0:${PORT}/auth/email/start`);
      console.log(`   POST http://0.0.0.0:${PORT}/auth/email/verify`);
      console.log('🔗 User endpoints (JWT 보호):');
      console.log(`   GET  http://0.0.0.0:${PORT}/users/me`);
    });
  } catch (err) {
    console.error('🔴 Prisma 연결 실패:', err);
    process.exit(1);
  }
}

// ✅ 우아한 종료
function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    try {
      console.log(`\n🛑 Received ${signal}. Shutting down...`);
      await prisma.$disconnect();
      process.exit(0);
    } catch (e) {
      console.error('⚠️ Shutdown error:', e);
      process.exit(1);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

setupGracefulShutdown();
startServer();

export default app; // (옵션) 테스트 용도
