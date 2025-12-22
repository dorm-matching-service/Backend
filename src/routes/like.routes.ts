import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { LikeController } from '../controllers/like.controller.js';

const router = express.Router();

/**
 * 좋아요 토글 기능
 */
router.post('/toggle', requireAuth, LikeController.toggleLike);

/**
 * 좋아요 횟수 조회 기능
 */
router.get('/me/count', requireAuth, LikeController.getMyLikeCount);

export default router;
