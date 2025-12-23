import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export const userController = {
  /* 로그인 유저 정보 조회 */
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const me = await UserService.getMe(userId);

      return res.json(me);
    } catch (error) {
      next(error);
    }
  },
  // 리프레시 토큰 구현할때 로그아웃 만들기
  //   /* 로그아웃 */
  //   logout: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const userId = req.auth?.uid;

  //       if (!userId) {
  //         return res.status(401).json({
  //           message: 'Unauthorized',
  //         });
  //       }

  //       await UserService.logout(userId);

  //       return res.json({ success: true });
  //     } catch (error) {
  //       next(error);
  //     }
  //   },

  //   /* 회원탈퇴 */
  //   deleteMe: async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const userId = req.auth?.uid;

  //       if (!userId) {
  //         return res.status(401).json({
  //           message: 'Unauthorized',
  //         });
  //       }

  //       await UserService.deleteMe(userId);

  //       return res.json({ success: true });
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
};
