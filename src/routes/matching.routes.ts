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

// 과거 매칭 횟수
router.get('/past/count', requireAuth, matchingController.getPastMatchingCount);
export default router;

// 매칭 status 조회
router.get(
  '/:opponentId/status',
  requireAuth,
  matchingController.getMatchStatusWithUser,
);

/**
 * 내가 받은 룸메 요청 목록 조회
 * GET /matches/received
 */
router.get('/received', requireAuth, matchingController.getReceivedRequests);

/**
 * 룸메 요청 수락
 * POST /matches/:matchId/accept
 */
router.post('/:matchId/accept', requireAuth, matchingController.acceptRequest);

/**
 * 룸메 요청 거절
 * POST /matches/:matchId/reject
 */
router.post('/:matchId/reject', requireAuth, matchingController.rejectRequest);
