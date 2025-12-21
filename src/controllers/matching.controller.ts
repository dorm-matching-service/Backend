import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/MatchingService.js';

export const matchingController = {
  /* 매칭 실행 */
  runMatching: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // query에서 mode 추출 (기본 값은 normal)
      const mode = req.query.mode === 'relaxed' ? 'relaxed' : 'normal';

      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      // mode를 서비스 로직으로 전달
      const results = await MatchingService.runMatching(userId, mode);

      return res.json({
        count: results.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  },
};
