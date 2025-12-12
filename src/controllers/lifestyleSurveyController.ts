import { Request, Response, NextFunction } from 'express';
import { LifestyleSurveyService } from '../services/LifestyleSurveyService.js';

import {
  lifestyleSurveySchema,
  lifestyleSurveyPartialSchema,
} from '../schemas/lifestyleSurvey.schema.js';

export const LifestyleSurveyController = {
  /* 유저 설문 여부 조회 */
  getMySurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.uid;
      const survey = await LifestyleSurveyService.getMySurvey(userId);
      return res.json({ hasChecklist: survey.exists });
    } catch (error) {
      next(error);
    }
  },

  /* 설문 전체 제출 - 처음 제출시 (POST) */
  upsertSurvey: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.uid;
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
      const userId = req.auth.uid;
      const data = lifestyleSurveyPartialSchema.parse(req.body);
      const result = await LifestyleSurveyService.patchSurvey(userId, data);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
