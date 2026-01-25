import { Request, Response, NextFunction } from 'express';
import { LifestyleSurveyService } from '../services/LifestyleSurveyService.js';
import { AuthenticatedRequest } from '../types/auth.js';

import {
  lifestyleSurveySchema,
  lifestyleSurveyPartialSchema,
} from '../schemas/lifestyleSurvey.schema.js';

export const LifestyleSurveyController = {
  /* 유저 설문 여부 조회 */
  getMySurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

      const result = await LifestyleSurveyService.getMySurvey(userId);
      return res.json({
        exists: result.exists,
        survey: result.exists ? result.survey : null,
      });
    } catch (error) {
      next(error);
    }
  },

  /* 설문 전체 제출 - 처음 제출시 (POST) */
  upsertSurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('==============================');
      console.log('POST /lifestyle-survey');
      console.log('headers:', req.headers);
      console.log('authorization:', req.headers.authorization);
      console.log('auth:', (req as any).auth);
      console.log('body:', req.body);
      console.log('==============================');

      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

      const data = lifestyleSurveySchema.parse(req.body);
      const result = await LifestyleSurveyService.upsertSurvey(userId, data);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /* 유저 설문 부분 수정 (PATCH) */
  patchSurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

      const data = lifestyleSurveyPartialSchema.parse(req.body);
      const result = await LifestyleSurveyService.patchSurvey(userId, data);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /* 유저 설문 요약 조회 */
  getMySurveySummary: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

      const result = await LifestyleSurveyService.getMySurveySummary(userId);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
  /* 특정 유저 설문 전체 조회 (프로필 상세용) */
  getUserSurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const result = await LifestyleSurveyService.getSurveyByUserId(userId);

      return res.json({
        exists: result.exists,
        survey: result.exists ? result.survey : null,
      });
    } catch (error) {
      next(error);
    }
  },
};
