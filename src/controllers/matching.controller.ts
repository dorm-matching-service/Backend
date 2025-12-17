import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/MatchingService.js';

export const matchingController = {
  /* 매칭 실행 */
  runMatching: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const results = await MatchingService.runMatching(userId);

      return res.json({
        count: results.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  },
};
