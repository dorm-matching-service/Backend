import prisma from '../db/prisma.js';

export const LifestyleSurveyService = {
  /* 유저 설문조사 여부 조회 */
  async getMySurvey(userId: string) {
    const survey = await prisma.lifestyleSurvey.findUnique({
      where: { userId: userId },
    });

    if (!survey) {
      return { exists: false };
    }

    return {
      exists: true,
      survey,
    };
  },

  /* 유저당 설문조사 한 개 생성 원칙 기반 => create or update (upsert 방식) */
  async upsertSurvey(userId: string, data: any) {
    const survey = await prisma.lifestyleSurvey.upsert({
      where: { userId: userId },
      update: data,
      create: {
        userId: userId,
        ...data,
      },
    });

    return {
      success: true,
      survey,
    };
  },

  async patchSurvey(userId, data) {
    const survey = await prisma.lifestyleSurvey.update({
      where: { userId: userId },
      data,
    });

    return {
      success: true,
      survey,
    };
  },
};
