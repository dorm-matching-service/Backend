import prisma from '../db/prisma.js';
import { getFinalMatchingScore } from '../matching/getFinalMatchingScore.js';
import { minutesToAmPm } from '../utils/time.js';

export const MatchingService = {
  // 매칭 요청한 유저의 ID로 체크리스트 정보 조회
  async getSurveyOrThrow(userId: string) {
    const survey = await prisma.lifestyleSurvey.findUnique({
      where: { userId: userId },
    });

    if (!survey) {
      throw new Error('No LifeStyleSurvey');
    }

    return survey;
  },

  // 매칭 요청한 유저를 제외한 모든 유저의 체크리스트 조회
  async getCandidateSurveys(excludeUserId: string) {
    const surveys = await prisma.lifestyleSurvey.findMany({
      where: {
        userId: { not: excludeUserId },
      },
    });

    //findMany의 반환값 타입은 항상 배열이므로 결과가 없으면 빈배열을 return한다
    // throw new Error 작성하지 않아도 됨

    return surveys;
  },

  // 매칭 실행 로직
  async runMatching(userId: string) {
    const MIN_MATCH_SCORE = 70;

    const A = await this.getSurveyOrThrow(userId);
    const candidates = await this.getCandidateSurveys(userId);

    const results: {
      matchingScore: number;
      major: string;
      age: number;
      wakeTime: string;
      sleepTime: string;
      tags: string[];
    }[] = [];

    for (const B of candidates) {
      const result = getFinalMatchingScore(A, B);

      if (!result) continue;
      if (result.finalScore < MIN_MATCH_SCORE) continue;

      await prisma.roommateMatch.create({
        data: {
          requester: {
            connect: { id: userId },
          },
          candidate: {
            connect: { id: B.userId },
          },
          baseScore: result.baseScore,
          finalScore: result.finalScore,
        },
      });

      results.push({
        matchingScore: result.finalScore,
        major: B.major,
        age: B.age,
        wakeTime: minutesToAmPm(B.wakeTimeMinutes),
        sleepTime: minutesToAmPm(B.sleepTimeMinutes),
        tags: B.selfTags,
      });
    }
    return results.sort((a, b) => b.matchingScore - a.matchingScore);
  },
};
