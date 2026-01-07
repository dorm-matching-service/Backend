import prisma from '../db/prisma.js';
import { Prisma } from '@prisma/client';

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
  async upsertSurvey(
    userId: string,
    //data 안에 **userId가 “있을 수도 있고 없을 수도 있다”**고 타입으로 허용
    data:
      | Prisma.LifestyleSurveyUncheckedCreateInput
      | Omit<Prisma.LifestyleSurveyUncheckedCreateInput, 'userId'>,
  ) {
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

  async patchSurvey(
    userId: string,
    data:
      | Prisma.LifestyleSurveyUncheckedUpdateInput
      | Omit<Prisma.LifestyleSurveyUncheckedUpdateInput, 'userId'>,
  ) {
    const survey = await prisma.lifestyleSurvey.update({
      where: { userId: userId },
      data,
    });

    return {
      success: true,
      survey,
    };
  },

  /* 로그인한 유저의 설문 요약 정보 조회 */
  async getMySurveySummary(userId: string) {
    const survey = await prisma.lifestyleSurvey.findUnique({
      where: { userId },
      select: {
        age: true,
        department: true,
        wakeTimeMinutes: true,
        sleepTimeMinutes: true,
        selfTags: true,
      },
    });

    if (!survey) {
      return {
        exists: false,
        survey: null,
      };
    }

    return {
      exists: true,
      survey,
    };
  },
};
