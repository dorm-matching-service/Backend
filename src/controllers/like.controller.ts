import { Request, Response, NextFunction } from 'express';
import { LikeService } from '../services/like.service.js';
import { AuthenticatedRequest } from '../types/auth.js';

export const LikeController = {
  /* 좋아요 토글 기능 */
  toggleLike: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUserId = req.auth?.uid;
      const { toUserId } = req.body;

      if (!fromUserId) {
        return res.status(401).json({
          message: '인증 정보가 없습니다.',
        });
      }
      if (!toUserId) {
        return res.status(400).json({
          message: 'toUserId는 필수입니다.',
        });
      }

      const result = await LikeService.toggleLike(fromUserId, toUserId);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /* 유저 좋아요 개수 조회 */
  getMyLikeCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUserId = req.auth?.uid;

      if (!fromUserId) {
        return res.status(401).json({
          message: '인증 정보가 없습니다.',
        });
      }

      const result = await LikeService.getMyLikeCount(fromUserId);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /* 내가 찜한 유저 카드 목록 조회 */
  getMyLikedCards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;
      const cards = await LikeService.getMyLikedCards(userId);

      return res.json(cards);
    } catch (error) {
      next(error);
    }
  },
};
