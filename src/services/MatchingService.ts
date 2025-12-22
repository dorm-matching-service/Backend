import prisma from '../db/prisma.js';
import { MatchStatus } from '@prisma/client';

import crypto from 'crypto';

import { getFinalMatchingScore } from '../matching/getFinalMatchingScore.js';

import { minutesToAmPm } from '../utils/time.js';

type MatchingMode = 'normal' | 'relaxed';

import { addDays } from '../utils/date.js';

export const MatchingService = {
  // 매칭 결과 조회 로직
  async getMatchingStatus(userId: string) {
    // 1. 가장 최근 매칭 시점
    const latestBatch = await prisma.roommateMatch.findFirst({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      select: { matchBatchId: true },
    });

    if (!latestBatch) {
      return {
        hasResult: false,
        count: 0,
        results: [],
      };
    }

    // 2. 해당 batch의 매칭만 조회
    const matches = await prisma.roommateMatch.findMany({
      where: {
        requesterId: userId,
        matchBatchId: latestBatch.matchBatchId,
      },
      include: {
        candidate: {
          include: {
            lifestyleSurvey: true,
          },
        },
      },
      orderBy: {
        finalScore: 'desc',
      },
    });

    const results = matches
      .map((m) => {
        const survey = m.candidate.lifestyleSurvey;
        if (!survey) return null;

        return {
          matchingScore: Math.round(m.finalScore),
          major: survey.department,
          age: survey.age,
          wakeTime: minutesToAmPm(survey.wakeTimeMinutes),
          sleepTime: minutesToAmPm(survey.sleepTimeMinutes),
          tags: survey.selfTags ?? [],
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return {
      hasResult: results.length > 0,
      count: results.length,
      results,
    };
  },

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
    await prisma.roommateMatch.updateMany({
      where: {
        requesterId: userId,
        status: MatchStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: {
        status: MatchStatus.EXPIRED,
      },
    });

    const MIN_MATCH_SCORE = mode === 'relaxed' ? 60 : 70;

    // 매칭 그룹화 ID 생성
    const batchId = crypto.randomUUID();

    // A 유저 설문
    const A = await this.getSurveyOrThrow(userId);

    // 이미 매칭된 후보 ID
    const excludeIds = await this.getAlreadyMatchedCandidateIds(userId);

    // 새로운 후보만 조회
    const candidates = await this.getCandidateSurveys(userId, excludeIds);

    // DB에 저장할 create 작업들을 모아둘 배열 (트랜잭션 처리를 위한)
    const createOperations: ReturnType<typeof prisma.roommateMatch.create>[] =
      [];

    // 매칭 API 응답용 타입
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

      createOperations.push(
        prisma.roommateMatch.create({
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
            status: MatchStatus.PENDING,
            expiresAt: addDays(new Date(), 7), // 매칭 데이터 생성 시간 기준 1주일 뒤에 만료

            matchBatchId: batchId, // 매칭 그룹화 ID
          },
        }),
      );

      //응답 데이터는 메모리에서만 쌓음
      results.push({
        matchingScore: Math.round(result.finalScore),
        major: B.department,
        age: B.age,
        wakeTime: minutesToAmPm(B.wakeTimeMinutes),
        sleepTime: minutesToAmPm(B.sleepTimeMinutes),
        tags: B.selfTags,
      });
    }

    // 매칭 결과가 하나도 없으면 바로 종료
    if (results.length === 0) {
      return [];
    }

    // 여기서 "한 번에" DB 반영
    await prisma.$transaction(createOperations);

    return results.sort((a, b) => b.matchingScore - a.matchingScore);
  },
};
