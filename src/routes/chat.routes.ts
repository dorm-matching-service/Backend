import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { ChatController } from '../controllers/chat.controller.js';

const router = express.Router();

/** 1) 채팅방 생성 */
router.post('/rooms', requireAuth, ChatController.createRoom);

/** 2) 채팅방 메시지 목록 조회 */
router.get('/rooms/:roomId/messages', requireAuth, ChatController.getMessages);

/** 3) 메시지 보내기 */
router.post('/messages/:roomId', requireAuth, ChatController.sendMessage);

/** 4) 읽음 처리 */
router.patch('/rooms/:roomId/read', requireAuth, ChatController.readRoom);

export default router;
