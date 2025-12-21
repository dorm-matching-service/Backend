import prisma from '../db/prisma.js';
import { getFinalMatchingScore } from '../matching/getFinalMatchingScore.js';
import { minutesToAmPm } from '../utils/time.js';

type MatchingMode = 'normal' | 'relaxed';

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

  // 이미 매칭된 후보 ID 조회
  async getAlreadyMatchedCandidateIds(userId: string): Promise<string[]> {
    const matches = await prisma.roommateMatch.findMany({
      where: { requesterId: userId },
      select: { candidateId: true },
    });

    return matches.map((m) => m.candidateId);
  },

  // 후보 체크리스트 조회 (본인 + 이미 매칭된 후보 제외)
  async getCandidateSurveys(
    excludeUserId: string,
    excludeCandidateIds: string[],
  ) {
    const surveys = await prisma.lifestyleSurvey.findMany({
      where: {
        userId: {
          not: excludeUserId,
          notIn: excludeCandidateIds,
        },
      },
    });

    //findMany의 반환값 타입은 항상 배열이므로 결과가 없으면 빈배열을 return한다
    // throw new Error 작성하지 않아도 됨

    return surveys;
  },

  // 매칭 실행 로직
  async runMatching(userId: string, mode: MatchingMode) {
    const MIN_MATCH_SCORE = mode === 'relaxed' ? 60 : 70;

    // A 유저 설문
    const A = await this.getSurveyOrThrow(userId);

    // 이미 매칭된 후보 ID
    const excludeIds = await this.getAlreadyMatchedCandidateIds(userId);

    // 새로운 후보만 조회
    const candidates = await this.getCandidateSurveys(userId, excludeIds);

    const results: {
      matchingScore: number;
      major: string;
      age: number;
      wakeTime: string;
      sleepTime: string;
      tags: string[];
    }[] = [];

    for (const B of candidates) {
      if (A.gender !== B.gender) {
        console.log('❌ 성별 컷:', B.userId);
        continue;
      }

      const result = getFinalMatchingScore(A, B);

      console.log('---- 후보 ----');
      console.log('B.userId:', B.userId);
      console.log('result:', result);

      if (!result) {
        console.log('❌ Layer1 컷');
        continue;
      }

      if (result.finalScore < MIN_MATCH_SCORE) {
        console.log('❌ 점수 미달:', result.finalScore);
        continue;
      }

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
          hobbyBonus: result.hobbyBonus,
        },
      });

      results.push({
        matchingScore: result.finalScore,
        major: B.department,
        age: B.age,
        wakeTime: minutesToAmPm(B.wakeTimeMinutes),
        sleepTime: minutesToAmPm(B.sleepTimeMinutes),
        tags: B.selfTags,
      });
    }
    return results.sort((a, b) => b.matchingScore - a.matchingScore);
  },
};
