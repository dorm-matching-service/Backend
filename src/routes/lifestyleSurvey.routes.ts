import express from 'express';
import { LifestyleSurveyController } from '../controllers/lifestyleSurvey.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

/* 유저 설문 여부 조회 */
router.get(
  '/lifestyle-survey/me',
  requireAuth,
  LifestyleSurveyController.getMySurvey,
);

/* 2) 설문 전체 제출 (POST) */
router.post(
  '/lifestyle-survey',
  requireAuth,
  LifestyleSurveyController.upsertSurvey,
);

/* 3) 설문 부분 수정 (PATCH) */
router.patch(
  '/lifestyle-survey',
  requireAuth,
  LifestyleSurveyController.patchSurvey,
);

router.get(
  '/me/summary',
  requireAuth,
  LifestyleSurveyController.getMySurveySummary,
);

export default router;
