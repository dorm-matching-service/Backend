// src/app.ts
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
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
import userRoutes from './routes/userRoutes.js';
import lifestyleSurveyRoutes from './routes/lifestyleSurveyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import prisma from './db/prisma.js';

// SMTP 설정 확인 로그 (디버깅용)
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

// 프록시 뒤(Cloudflare/ELB 등)에서 secure 쿠키 인식
app.set('trust proxy', 1);

// CORS 설정 추가
// process.env.CORS_ORIGIN이 있으면 ,로 구분된 여러 도메인 허용
// 없으면 기본값은 http://localhost:3000 으로 지정 (Next.js dev 서버)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || [
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// 기본 미들웨어
app.use(express.json());
app.use(cookieParser());

// OTP 남발 방지: 이메일 관련 엔드포인트만 타이트하게 제한
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10분
  max: 20, // 10분에 최대 20회
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth/email/start', otpLimiter);
app.use('/auth/email/verify', otpLimiter);

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use(lifestyleSurveyRoutes);
app.use('/chat', chatRoutes);

// 헬스 체크
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

// 404 핸들러 (라우트 미스)
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// 에러 핸들러 (반드시 4개 인자)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🚨 서버 에러 발생:', err);
  res.status(500).json({ message: '서버 에러' });
});

// 포트 설정
const PORT = Number(process.env.PORT) || 3001;

// 서버 시작 전 Prisma 연결 확인
async function startServer() {
  try {
    console.log('⏳ Prisma 데이터베이스 연결 시도 중...');
    await prisma.$connect();
    console.log('🟢 Prisma 및 DB 연결 성공!');

    console.log('🟢 Prisma 및 DB 연결 성공!');
    console.log(
      'Express 초기화 완료 — 실제 listen은 server.listen()에서 실행됩니다.',
    );
  } catch (err) {
    console.error('🔴 Prisma 연결 실패:', err);
    process.exit(1);
  }
}

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

import { Server } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from './utils/jwt.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

//소켓이 연결되기 전에 반드시 먼저 실행되는 함수(Socket.IO 전용 미들웨어 등록 함수) - jwt 토큰 인증용
io.use((socket, next) => {
  // handshake는 소켓이 서버에 접속할 때 처음 보내는 “초기 요청 정보”이다.
  //  auth: { token: "abc123" } 일 때 이 정보가 socket.handshake.auth에 들어간다.
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error('NO_TOKEN'));

  try {
    const user = verifyAccessToken(token);
    // 이렇게 입력되면 socket.data.user.uid 이러한 형태로 아래 로직에서 사용
    socket.data.user = user; // 여기에 유저정보 저장
    next();
  } catch (err) {
    //Socket.IO는 "next(error)" 를 호출하면 해당 소켓 연결을 거부하면
    // 클라이언트에게 "connect_error" 이벤트로 에러 메시지 전달해준다.
    //따라서 error 객체를 만들어 던져야한다.

    next(new Error('INVALID_TOKEN'));
  }
});

//연결 이벤트
io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  //방 참여
  socket.on('join_room', async (roomId) => {
    const isMember = await prisma.chatMember.findFirst({
      where: { room_id: roomId, user_id: socket.data.user.uid },
    });

    if (!isMember) return;

    socket.join(roomId);
  });

  //메세지 전송
  socket.on('send_message', async (data) => {
    const message = await prisma.message.create({
      data: {
        room_id: data.roomId,
        sender_id: socket.data.user.uid,
        content: data.content,
      },
    });
    io.to(data.roomId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // 읽음처리
  socket.on('read_message', async ({ roomId, messageId }) => {
    const userId = socket.data.user.uid;

    //db 업데이트
    await prisma.chatMember.updateMany({
      where: {
        room_id: roomId,
        user_id: userId,
      },
      data: {
        last_read_message_id: messageId,
      },
    });
    socket.to(roomId).emit('message_read', {
      roomId,
      userId,
      messageId,
    });
  });
});

server.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`),
);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  try {
    const payload = verifyAccessToken(token);
    socket.data.user = payload; // 인증된 유저 정보 저장
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

export default app; // (옵션) 테스트 용도
