import { UserLifeStyle } from '../types.js';
import { getSleepSimilarity } from './sleepSimilarity.js';
import { getShowerSimilarity } from './showerSimilarity.js';
import { getRiskMultiplier } from './risk.js';
import { getTraitSimilarity } from './traitSimilarity.js';
import { getDrinkSimilarity } from './drinkSimilarity.js';
import { getGameSimilarity } from './gameSimilarity.js';
import { getMealSimilarity } from './mealSimilarity.js';
import { getHomeVisitSimilarity } from './homeVisitSimilarity.js';
import { average } from './average.js';
import { getCleanSimilarity } from './getCleanSimilarity.js';

const CATEGORY_WEIGHT = {
  rhythm: 1.3,
  habit: 1.0,
  trait: 0.6,
} as const;

export function getLayer2Score(A: UserLifeStyle, B: UserLifeStyle): number {
  // 카테고리별 점수

  // 1. 생활 리듬

  const sleepScore = getSleepSimilarity(A, B);
  const drinkScore = getDrinkSimilarity(A, B);
  const gameScore = getGameSimilarity(A, B);

  const rhythmScore = average([sleepScore, drinkScore, gameScore]);

  // 2. 생활 습관

  const showerScore = getShowerSimilarity(A, B);
  const cleanScore = getCleanSimilarity(A, B);
  const mealScore = getMealSimilarity(A, B);

  const habitScore = average([showerScore, cleanScore, mealScore]);

  // 3. 개인 성향 / 민감도
  const traitScores = [getTraitSimilarity(A, B), getHomeVisitSimilarity(A, B)];

  const traitScore = average(traitScores);

  // 2카테고리 가중치 적용
  const weighted =
    rhythmScore * CATEGORY_WEIGHT.rhythm +
    habitScore * CATEGORY_WEIGHT.habit +
    traitScore * CATEGORY_WEIGHT.trait;

  // 리스크 보정
  const riskMultiplier = getRiskMultiplier(A, B);
  const final = weighted * riskMultiplier;

  // 70점 정규화
  const MAX_LAYER2_SCORE =
    CATEGORY_WEIGHT.rhythm + CATEGORY_WEIGHT.habit + CATEGORY_WEIGHT.trait;

  return Math.round((final / MAX_LAYER2_SCORE) * 70);
}
