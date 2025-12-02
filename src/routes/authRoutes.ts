// src/routes/authRoutes.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { z, ZodError } from 'zod';
import prisma from '../db/prisma.js';
import { generateNumericCode, hashCode, addMinutes } from '../utils/otp.js';
import { sendOtpMail } from '../utils/mailer.js';
import { signAccessToken } from '../utils/jwt.js';
import { requireAuth } from '../middlewares/requireAuth.js';

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
      const code_hash = hashCode(code);
      const ttlMin = Number(process.env.OTP_CODE_TTL_MIN ?? 10);
      const expires_at = addMinutes(new Date(), ttlMin);

      // snake_case 맞춤
      await prisma.verificationCode.create({
        data: {
          email,
          code_hash,
          expires_at,
          created_at: new Date(),
        },
      });

      await sendOtpMail(email, code);

      return res.status(200).json({
        ok: true,
        message: '인증 코드가 이메일로 전송되었습니다.',
        expiresAt: expires_at.toISOString(),
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

/** 2) 코드 검증 */
const verifySchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.trim().toLowerCase()),
  code: z.string().min(4).max(8),
});

router.post(
  '/email/verify',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = verifySchema.parse(req.body);

      const record = await prisma.verificationCode.findFirst({
        where: {
          email,
          consumed_at: null,
          expires_at: { gt: new Date() },
        },
        orderBy: { created_at: 'desc' },
      });

      if (!record)
        return res
          .status(400)
          .json({ message: '코드가 없거나 만료되었습니다.' });

      if (record.attempts >= Number(process.env.OTP_MAX_ATTEMPTS ?? 5)) {
        return res.status(429).json({ message: '시도 횟수를 초과했습니다.' });
      }

      const ok = record.code_hash === hashCode(code);

      await prisma.verificationCode.update({
        where: { id: record.id },
        data: {
          attempts: { increment: 1 },
          consumed_at: ok ? new Date() : null,
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

      // JWT 발급
      const accessToken = signAccessToken({
        uid: user.id,
        email: user.email,
      });

      // 개발 환경 디버그용
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEBUG] Issued access token:', accessToken);
        res.setHeader('x-debug-token', accessToken);
      }

      // 쿠키 설정
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60,
        path: '/',
      });

      return res.json({
        ok: true,
        message: '인증 성공',
        email: user.email,
        isNew,
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

      return res.status(204).send();
    } catch (err) {
      console.error('로그아웃 에러:', err);
      return res.status(500).json({ message: '로그아웃 실패' });
    }
  },
);

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.uid },
      select: {
        id: true,
        email: true,
        email_verified: true,
        consent_privacy: true,
        consent_privacy_at: true,
        consent_privacy_version: true,
        created_at: true,
        last_login: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: '유저가 존재하지 않습니다.' });
    }

    return res.json({ ok: true, user });
  } catch (err) {
    return res.status(500).json({ ok: false, message: '서버 오류' });
  }
});

export default router;
