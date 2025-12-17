import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { matchingController } from '../controllers/matching.controller.js';

const router = express.Router();

/**
 * 매칭 실행
 */
router.get('/', requireAuth, matchingController.runMatching);

export default router;
