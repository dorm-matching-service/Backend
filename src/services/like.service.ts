import prisma from '../db/prisma.js';

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
};
