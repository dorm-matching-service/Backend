import prisma from '../db/prisma.js';
import { requireAuth } from '..//middlewares/requireAuth.js';
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

export default router;
