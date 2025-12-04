import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';

export const ChatController = {
  /* 메시지 조회 (페이지네이션) */
  getMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const cursor = req.query.cursor as string | undefined;

      const take = 40;

      const messages = await prisma.message.findMany({
        where: { room_id: roomId },
        orderBy: { created_at: 'desc' },
        take,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      return res.json(messages.reverse());
    } catch (error) {
      next(error);
    }
  },

  /* 메시지 보내기 */
  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.uid;
      const { roomId, content } = req.body;

      const message = await prisma.message.create({
        data: {
          room_id: roomId,
          sender_id: userId,
          content,
        },
      });

      return res.json(message);
    } catch (error) {
      next(error);
    }
  },

  /* 읽음 처리 */
  readRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.uid;
      const { roomId } = req.params;
      const { lastMessageId } = req.body;

      await prisma.chatMember.updateMany({
        where: {
          room_id: roomId,
          user_id: userId,
        },
        data: {
          last_read_message_id: lastMessageId,
        },
      });

      return res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },

  /* 채팅방 생성 */
  createRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.uid;
      const { opponentId } = req.body;

      // 방 존재 여부 체크
      const exist = await prisma.chatMember.findFirst({
        where: {
          user_id: userId,
          room: {
            members: {
              some: {
                user_id: opponentId,
              },
            },
          },
        },
        include: {
          room: true,
        },
      });

      if (exist) {
        return res.json({ roomId: exist.room_id });
      }

      // 방 생성
      const room = await prisma.chatRoom.create({
        data: {
          members: {
            create: [{ user_id: userId }, { user_id: opponentId }],
          },
        },
      });

      return res.json({ roomId: room.id });
    } catch (error) {
      next(error);
    }
  },
};
