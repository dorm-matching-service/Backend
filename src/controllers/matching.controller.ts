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

  /* 매칭 결과 존재 여부 + 결과 조회 */
  getMatchingStatus: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const status = await MatchingService.getMatchingStatus(userId);

      return res.json(status);
      // 컨트롤러의 반환 타입 예시
      /**
       * {
       *   hasResult: boolean,
       *   count: number,
       *   results: []
       * }
       */
    } catch (error) {
      next(error);
    }
  },

  /* 지난 매칭 기록 조회 (최근 batch 제외 + REJECTED 제외) */
  getPastMatchingCards: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      const results = await MatchingService.getPastMatchingHistory(userId);

      return res.json({
        count: results.length,
        results,
      });
    } catch (error) {
      next(error);
    }
  },

  // 과거 매칭 횟수 조회
  getPastMatchingCount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.auth?.uid;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const count = await MatchingService.getPastMatchingCount(userId);

      return res.json({ count });
    } catch (error) {
      next(error);
    }
  },

  /* 특정 상대와의 매칭 상태 조회 */
  getMatchStatusWithUser: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.auth?.uid;
      const { opponentId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const status = await MatchingService.getMatchStatusWithUser(
        userId,
        opponentId,
      );

      return res.json(status);
    } catch (error) {
      next(error);
    }
  },
};
