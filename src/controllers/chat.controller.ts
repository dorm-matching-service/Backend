import { Request, Response, NextFunction } from 'express';
import { formatChatTime } from '../utils/formatChatTIme.js';
import { AuthenticatedRequest } from '../types/auth.js';
import prisma from '../db/prisma.js';

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
      const { auth } = req as AuthenticatedRequest;
      if (!auth?.uid) {
        return res.status(401).json({ message: '인증 필요' });
      }

      const userId = auth.uid;

      const { roomId } = req.params;
      const { content } = req.body;
      if (!roomId || !content?.trim()) {
        return res.status(400).json({ message: '잘못된 요청' });
      }

      // 유저 검증
      const isMember = await prisma.chatMember.findFirst({
        where: {
          room_id: roomId,
          user_id: userId,
        },
      });

      if (!isMember) {
        return res.status(403).json({ message: '채팅방 접근 권한 없음' });
      }

      // 메세지 생성
      const message = await prisma.message.create({
        data: {
          room_id: roomId,
          sender_id: userId,
          content,
        },
      });

      // 실시간 전달
      req.app.get('io').to(roomId).emit('receive_message', message);

      return res.json(message);
    } catch (error) {
      next(error);
    }
  },

  /* 읽음 처리 */
  readRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

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
      // 상대에게 읽음 알림
      req.app.get('io').to(roomId).emit('message_read', {
        userId,
        lastMessageId,
      });

      return res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },

  /* 채팅방 생성 */
  createRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;
      const userId = auth.uid;

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

      // 유저 A-B 관계 찾기
      const match = await prisma.roommateMatch.findFirst({
        where: {
          OR: [
            { requesterId: userId, candidateId: opponentId },
            { requesterId: opponentId, candidateId: userId },
          ],
        },
      });

      const room = await prisma.$transaction(async (tx) => {
        //채팅방 생성
        const room = await tx.chatRoom.create({
          data: {
            members: {
              create: [{ user_id: userId }, { user_id: opponentId }],
            },
          },
        });

        //관계 상태 CONNECTED로 변경
        if (match && match.status !== 'CONNECTED') {
          await tx.roommateMatch.update({
            where: { id: match.id },
            data: { status: 'CONNECTED' },
          });
        }

        return room;
      });

      return res.json({ roomId: room.id });
    } catch (error) {
      next(error);
    }
  },

  /* 내가 속한 채팅방 목록 조회 */
  getMyChatRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth } = req as AuthenticatedRequest;

      if (!auth?.uid) {
        return res.status(401).json({ message: '인증 필요' });
      }

      const userId = auth.uid;

      const chatMembers = await prisma.chatMember.findMany({
        where: {
          user_id: userId,
        },
        include: {
          room: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      lifestyleSurvey: {
                        select: {
                          age: true,
                          department: true,
                        },
                      },
                    },
                  },
                },
              },
              messages: {
                orderBy: {
                  created_at: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

      const rooms = await Promise.all(
        chatMembers.map(async (member) => {
          const room = member.room;

          // 상대 찾기
          const opponentMember = room.members.find((m) => m.user_id !== userId);

          if (!opponentMember) return null;

          const opponent = opponentMember.user;
          const survey = opponent.lifestyleSurvey;

          const lastMessage = room.messages[0] ?? null;

          // unreadCount 계산
          const unreadCount = await prisma.message.count({
            where: {
              room_id: room.id,
              sender_id: {
                not: userId,
              },
              ...(member.last_read_message_id && {
                created_at: {
                  gt: (
                    await prisma.message.findUnique({
                      where: {
                        id: member.last_read_message_id,
                      },
                      select: {
                        created_at: true,
                      },
                    })
                  )?.created_at,
                },
              }),
            },
          });

          return {
            roomId: room.id,

            opponent: {
              id: opponent.id,
              email: opponent.email,
              age: survey?.age ?? null,
              department: survey?.department ?? null,
            },

            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  content: lastMessage.content,
                  createdAt: formatChatTime(lastMessage.created_at),
                }
              : null,

            unreadCount,
          };
        }),
      );

      return res.json({
        count: rooms.filter(Boolean).length,
        rooms: rooms.filter(Boolean),
      });
    } catch (error) {
      next(error);
    }
  },
};
