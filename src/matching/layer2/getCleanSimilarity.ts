// src/matching/layer2/cleanSimilarity.ts

import type { UserLifeStyle } from '../types.js';
import { similarityByScore } from './similarityByScore.js';

/**
 * 방 청소 주기 → 점수 치환
 */
export const CLEAN_SCORE = {
  EVERY_DAY: 2.0,
  EVERY_TWO_DAYS: 1.5,
  WEEKLY: 1.0,
  RARE: 0.5,
} as const;

/**
 * CLEAN_SCORE key 타입
 */
export type CleanFreq = keyof typeof CLEAN_SCORE;

/**
 * 방 청소 유사도 계산
 */
export function getCleanSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  // 값 없으면 중립
  if (!A.cleanFreq || !B.cleanFreq) return 1.0;

  return similarityByScore(CLEAN_SCORE[A.cleanFreq], CLEAN_SCORE[B.cleanFreq]);
}
