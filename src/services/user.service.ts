import prisma from '../db/prisma.js';

export const UserService = {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  //   async logout(userId: string) {
  //     // TODO: refresh token 도입 시 실제 무효화 로직 추가
  //     return { success: true };
  //   },

  //   async deleteMe(userId: string) {
  //     // TODO: 회원탈퇴 트랜잭션
  //     return { success: true };
  //   },
};
