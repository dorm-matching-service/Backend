// src/routes/authRoutes.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { z, ZodError } from 'zod';
import prisma from '../db/prisma.js';
import { generateNumericCode, hashCode, addMinutes } from '../utils/otp.js';
import { sendOtpMail } from '../utils/mailer';
import { signAccessToken } from '../utils/jwt';

const router = express.Router();

/** 1) 코드 발송 */
const startSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.trim().toLowerCase()),
});

router.post(
  '/email/start',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = startSchema.parse(req.body);

      const code = generateNumericCode(6);
      const codeHash = hashCode(code);
      const ttlMin = Number(process.env.OTP_CODE_TTL_MIN ?? 10);
      const expiresAt = addMinutes(new Date(), ttlMin);

      await prisma.verificationCode.create({
        data: { email, codeHash, expiresAt },
      });

      await sendOtpMail(email, code);

      return res.status(204).send();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json({ message: '잘못된 요청', errors: err.flatten() });
      }
      next(err);
    }
  },
);

/** 2) 코드 검증 (가입 or 로그인) */
const verifySchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.trim().toLowerCase()),
  code: z.string().min(4).max(8),
  name: z.string().min(1).max(100).optional(),
});

router.post(
  '/email/verify',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code, name } = verifySchema.parse(req.body);

      const record = await prisma.verificationCode.findFirst({
        where: {
          email,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!record)
        return res
          .status(400)
          .json({ message: '코드가 없거나 만료되었습니다.' });

      if (record.attempts >= Number(process.env.OTP_MAX_ATTEMPTS ?? 5)) {
        return res.status(429).json({ message: '시도 횟수를 초과했습니다.' });
      }

      const ok = record.codeHash === hashCode(code);

      await prisma.verificationCode.update({
        where: { id: record.id },
        data: {
          attempts: { increment: 1 },
          consumedAt: ok ? new Date() : null,
        },
      });

      if (!ok)
        return res.status(401).json({ message: '코드가 올바르지 않습니다.' });

      // 유저 조회/생성
      let user = await prisma.user.findUnique({ where: { email } });
      const isNew = !user;

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name ?? email.split('@')[0],
            email_verified: true,
            created_at: new Date(),
            last_login: new Date(),
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { last_login: new Date(), email_verified: true },
        });
      }
      // ✅ JWT 발급 (OTP 로그인은 구글 sub가 없으므로 sub에 우리 user.id를 넣는 걸 권장)
      const accessToken = signAccessToken({
        uid: user.id,
        email: user.email,
      });

      // ✅ 개발 환경에서만 콘솔에 토큰 출력
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEBUG] Issued access token:', accessToken);
        // Postman에서 보기 편하게 헤더로도 내려주기 (개발 전용)
        res.setHeader('x-debug-token', accessToken);
      }

      // ✅ httpOnly 쿠키로 세팅
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60, // JWT_EXPIRES_IN=1h 기준
        path: '/',
      });

      // ✅ 응답 바디에도 토큰 포함(모바일/다중클라이언트 지원용)
      return res.json({
        message: isNew ? '회원가입 및 로그인 성공' : '로그인 성공',
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: user.email_verified,
          last_login: user.last_login,
        },
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json({ message: '잘못된 요청', errors: err.flatten() });
      }
      next(err);
    }
  },
);

/** 3) 로그아웃 */
router.post(
  '/logout',
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      // ✅ access_token, refresh_token 쿠키 삭제
      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
        path: '/',
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
        path: '/',
      });

      return res.status(204).send(); // 내용 없는 성공 응답
    } catch (err) {
      console.error('로그아웃 에러:', err);
      return res.status(500).json({ message: '로그아웃 실패' });
    }
  },
);

export default router;
