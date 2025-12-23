import prisma from '../db/prisma.js';
import { minutesToAmPm } from '../utils/time.js';

export const LikeService = {
  /* 찜 토글 기능 */
  async toggleLike(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new Error('자기 자신을 찜할 수 없습니다.');
    }

    // userLike 테이블 유니크 키
    const likeKey = {
      fromUserId_toUserId: {
        fromUserId,
        toUserId,
      },
    };

    // 이미 찜했는지 확인
    const exists = await prisma.userLike.findUnique({
      where: likeKey,
    });

    // 찜 취소
    if (exists) {
      await prisma.userLike.delete({
        where: likeKey,
      });

      return { liked: false };
    }

    // 찜 추가
    await prisma.userLike.create({
      data: {
        fromUserId,
        toUserId,
      },
    });

    return { liked: true };
  },

  /* 내가 좋아요(찜)한 개수 */
  async getMyLikeCount(fromUserId: string) {
    const count = await prisma.userLike.count({
      where: {
        fromUserId,
      },
    });

    return { count };
  },

  /* 찜한 유저 프로필 정보 가져오기 */
  async getMyLikedCards(userId: string) {
    const likes = await prisma.userLike.findMany({
      where: {
        fromUserId: userId,
      },
      include: {
        toUser: {
          select: {
            id: true,
            lifestyleSurvey: {
              select: {
                age: true,
                department: true,
                wakeTimeMinutes: true,
                sleepTimeMinutes: true,
                selfTags: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likes.map((like) => {
      const survey = like.toUser.lifestyleSurvey;

      return {
        userId: like.toUser.id,
        isLiked: true,

        major: survey?.department ?? '',
        age: survey?.age ?? 0,
        wakeTime:
          survey?.wakeTimeMinutes != null
            ? minutesToAmPm(survey.wakeTimeMinutes)
            : '',
        sleepTime:
          survey?.sleepTimeMinutes != null
            ? minutesToAmPm(survey.sleepTimeMinutes)
            : '',
        tags: survey?.selfTags ?? [],
      };
    });
  },
};
