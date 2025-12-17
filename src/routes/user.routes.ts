import prisma from '../db/prisma.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// 현재 로그인 유저 조회
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const me = await prisma.user.findUnique({
        where: { id: req.auth!.uid },
        select: {
          id: true,
          email: true,
          email_verified: true,
          last_login: true,
        },
      });
      res.json({ user: me });
    } catch (e) {
      next(e);
    }
  },
);
/**
 * 개인정보 수집 동의 처리
 * PATCH /user/consent/privacy
 */
router.patch(
  '/consent/privacy',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.uid;

      const { version } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          consent_privacy: true,
          consent_privacy_at: new Date(),
          consent_privacy_version: version ?? 1,
        },
        select: {
          id: true,
          email: true,
          email_verified: true,
          consent_privacy: true,
          consent_privacy_at: true,
          consent_privacy_version: true,
          last_login: true,
        },
      });

      return res.json({
        message: '개인정보 수집 동의 완료',
        user: updatedUser,
      });
    } catch (error: any) {
      console.log('서버에서 받은 에러:', error?.message);
    }
  },
);

export default router;
