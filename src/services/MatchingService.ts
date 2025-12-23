import prisma from '../db/prisma.js';
import type { LifestyleSurvey } from '@prisma/client';

import { MatchStatus } from '@prisma/client';

import crypto from 'crypto';

import { getFinalMatchingScore } from '../matching/getFinalMatchingScore.js';
import { isLayer1Fail } from '../matching/layer1/isLayer1Fail.js';

import { minutesToAmPm } from '../utils/time.js';

type MatchingMode = 'normal' | 'relaxed';
import { toUserLifeStyle } from '../matching/domain/toUserLifeStyle.js';

import { addDays } from '../utils/date.js';

import { UserLifeStyle } from '../matching/types.js';

async function getPastMatchingHistoryBase(userId: string) {
  const latestBatch = await prisma.roommateMatch.findFirst({
    where: { requesterId: userId },
    orderBy: { createdAt: 'desc' },
    select: { matchBatchId: true },
  });

  if (!latestBatch) {
    return [];
  }

  return prisma.roommateMatch.findMany({
    where: {
      requesterId: userId,
      matchBatchId: { not: latestBatch.matchBatchId },
      status: { not: MatchStatus.REJECTED },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export const MatchingService = {
  // 매칭 결과 조회 로직
  async getMatchingStatus(userId: string) {
    // 1. 가장 최근 매칭 시점 조회
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

    // 후보 userId 목록 추출
    const candidateUserIds = matches.map((m) => m.candidateId);

    // 로그인 유저 → 후보들 좋아요 여부 조회 (한 번만)
    const likes = await prisma.userLike.findMany({
      where: {
        fromUserId: userId, // 로그인 유저
        toUserId: { in: candidateUserIds },
      },
      select: {
        toUserId: true,
      },
    });

    // 좋아요 여부 Set 생성
    const likedUserIdSet = new Set(likes.map((like) => like.toUserId));

    const results = matches
      .map((m) => {
        const survey = m.candidate.lifestyleSurvey;
        if (!survey) return null;

        return {
          userId: m.candidateId, // 상대 유저 UUID
          isLiked: likedUserIdSet.has(m.candidateId), // 좋아요 여부
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

    return toUserLifeStyle(survey);
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
  ): Promise<LifestyleSurvey[]> {
    return prisma.lifestyleSurvey.findMany({
      where: {
        userId: {
          not: excludeUserId,
          notIn: excludeCandidateIds,
        },
      },
    });
  },

  /* runMatching 전체 흐름
      1. 후보 점수 계산
      2. 상위 3명 추림
      3. 후보 userId 배열 생성
      4. 로그인 유저 기준 좋아요 한 후보들 조회
      5. Set으로 변환
      6. 응답 결과에 userId + isLiked 포함
      7. DB 트랜잭션으로 매칭 저장
      8. 프론트에 응답
  */

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

    type Candidate = {
      userId: string;
      department: string;
      age: number;
      wakeTimeMinutes: number;
      sleepTimeMinutes: number;
      selfTags: string[] | null;
      gender: string;
    };

    const scoredCandidates: {
      profile: Candidate; // 응답/표시용
      lifeStyle: UserLifeStyle; // 매칭 계산용
      result: ReturnType<typeof getFinalMatchingScore>;
    }[] = [];

    for (const rawB of candidates) {
      const lifeStyle = toUserLifeStyle(rawB); // ✅ 선언

      if (A.gender !== lifeStyle.gender) {
        console.log('❌ 성별 컷:', lifeStyle.userId);
        continue;
      }

      if (isLayer1Fail(A, lifeStyle)) {
        console.log('❌ Layer1 컷:', lifeStyle.userId);
        continue;
      }

      const result = getFinalMatchingScore(A, lifeStyle);

      if (result.finalScore < MIN_MATCH_SCORE) {
        continue;
      }

      scoredCandidates.push({
        lifeStyle,
        profile: {
          userId: rawB.userId,
          department: rawB.department,
          age: rawB.age,
          wakeTimeMinutes: rawB.wakeTimeMinutes,
          sleepTimeMinutes: rawB.sleepTimeMinutes,
          selfTags: rawB.selfTags,
          gender: rawB.gender,
        },
        result,
      });
    }

    // 상위 3명만 잘라서 후보에 넣기위한 상수 값
    // 원본 배열을 변형하지 않기 위해 복사 후 정렬 함
    const topCandidates = [...scoredCandidates]
      .sort((a, b) => b.result.finalScore - a.result.finalScore)
      .slice(0, 3);

    // 매칭 결과가 하나도 없으면 바로 종료
    if (topCandidates.length === 0) {
      return [];
    }

    /* 
          topCandidates 배열 형태 예시
            const topCandidates = [
          {
            B: { userId: 'u1', age: 23, department: '컴공', ... },
            result: { baseScore: 70, finalScore: 92, hobbyBonus: 5 }
          },
          {
            B: { userId: 'u2', age: 24, department: '전자', ... },
            result: { baseScore: 68, finalScore: 91, hobbyBonus: 3 }
          },
          ...
        ];
        
      */

    // 후보 userId 목록
    const candidateUserId = topCandidates
      .map(({ profile }) => profile.userId)
      .filter((id): id is string => Boolean(id));

    // 로그인 유저 => 후보들 좋아요 여부 조회
    const likes = await prisma.userLike.findMany({
      where: {
        fromUserId: userId, // 로그인 유저
        toUserId: { in: candidateUserId },
      },
      select: {
        toUserId: true,
      },
    });

    // 좋아요 여부 Set으로 변환
    const likedUserIdSet = new Set(likes.map((like) => like.toUserId));

    // 매칭 API 응답용 타입
    const results: {
      userId: string; // 상대 userId (uuid)
      isLiked: boolean; // 로그인한 유저가 상대 좋아요 여부
      matchingScore: number;
      major: string;
      age: number;
      wakeTime: string;
      sleepTime: string;
      tags: string[];
    }[] = [];

    for (const { profile, result } of topCandidates) {
      // DB 저장용
      createOperations.push(
        prisma.roommateMatch.create({
          data: {
            requester: { connect: { id: userId } },
            candidate: { connect: { id: profile.userId } },
            baseScore: result.baseScore,
            finalScore: result.finalScore,
            hobbyBonus: result.hobbyBonus,
            status: MatchStatus.PENDING,
            expiresAt: addDays(new Date(), 7), // 매칭 데이터 생성 시간 기준 1주일 뒤에 만료
            matchBatchId: batchId,
          },
        }),
      );

      //응답 데이터
      results.push({
        userId: profile.userId, // 상대 유저 UUID
        isLiked: likedUserIdSet.has(profile.userId), // 좋아요 여부
        matchingScore: Math.round(result.finalScore),
        major: profile.department,
        age: profile.age,
        wakeTime: minutesToAmPm(profile.wakeTimeMinutes),
        sleepTime: minutesToAmPm(profile.sleepTimeMinutes),
        tags: profile.selfTags ?? [],
      });
    }

    // DB 트랜잭션 (DB에 반영하는 코드)
    await prisma.$transaction(createOperations);

    return results.sort((a, b) => b.matchingScore - a.matchingScore);
  },

  // 과거 매칭 기록 조회 (최근 batch 제외 + REJECTED 제외)
  async getPastMatchingHistory(userId: string) {
    // 가장 최근 매칭 batch 조회
    const matches = await getPastMatchingHistoryBase(userId);
    if (matches.length === 0) return [];

    // candidate + survey 정보 다시 조회 (기존 구조 유지)
    const detailedMatches = await prisma.roommateMatch.findMany({
      where: {
        id: { in: matches.map((m) => m.id) },
      },
      include: {
        candidate: {
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

    // 찜 여부 조회
    const candidateUserIds = detailedMatches.map((m) => m.candidateId);

    const likes = await prisma.userLike.findMany({
      where: {
        fromUserId: userId,
        toUserId: { in: candidateUserIds },
      },
      select: {
        toUserId: true,
      },
    });

    const likedUserIdSet = new Set(likes.map((like) => like.toUserId));

    // 찜 목록과 동일한 return 타입
    return detailedMatches.map((m) => {
      const survey = m.candidate.lifestyleSurvey;

      return {
        targetUserId: m.candidate.id,
        isLiked: likedUserIdSet.has(m.candidate.id),

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

  // 과거 매칭 횟수 조회 (최근 batch 제외 + REJECTED 제외)
  async getPastMatchingCount(userId: string) {
    const matches = await getPastMatchingHistoryBase(userId);
    return matches.length;
  },
};
