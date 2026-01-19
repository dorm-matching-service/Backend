import prisma from '../db/prisma.js';
import { minutesToAmPm } from '../utils/time.js';
import type { LifestyleSurveyPatchDTO } from '../types/LifestyleSurvey.js';

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
  async upsertSurvey(userId: string, data: LifestyleSurveyPatchDTO) {
    const survey = await prisma.lifestyleSurvey.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return {
      success: true,
      survey,
    };
  },

  async patchSurvey(userId: string, data: LifestyleSurveyPatchDTO) {
    const survey = await prisma.lifestyleSurvey.update({
      where: { userId },
      data,
    });

    return {
      success: true,
      survey,
    };
  },

  /* 로그인한 유저의 설문 요약 정보 조회 */
  async getMySurveySummary(userId: string) {
    const rawSurvey = await prisma.lifestyleSurvey.findUnique({
      where: { userId },
      select: {
        age: true,
        department: true,
        wakeTimeMinutes: true,
        sleepTimeMinutes: true,
        selfTags: true,
      },
    });

    if (!rawSurvey) {
      return {
        exists: false,
        survey: null,
      };
    }

    const survey = {
      age: rawSurvey.age,
      department: rawSurvey.department,
      wakeTime: rawSurvey.wakeTimeMinutes
        ? minutesToAmPm(rawSurvey.wakeTimeMinutes)
        : null,
      sleepTime: rawSurvey.sleepTimeMinutes
        ? minutesToAmPm(rawSurvey.sleepTimeMinutes)
        : null,
      tags: rawSurvey.selfTags,
    };

    return {
      exists: true,
      survey,
    };
  },
};
