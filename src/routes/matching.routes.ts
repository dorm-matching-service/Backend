import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { matchingController } from '../controllers/matching.controller.js';

const router = express.Router();

/**
 * 매칭 실행
 */
router.get('/', requireAuth, matchingController.runMatching);

/**
 * 기존 매칭 결과 조회
 */
router.get('/status', requireAuth, matchingController.getMatchingStatus);

/**
 * 지난 매칭 기록 조회
 */
router.get('/history', requireAuth, matchingController.getPastMatchingCards);

export default router;
