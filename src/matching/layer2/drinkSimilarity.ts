// drinkSimilarity.ts
import { UserLifeStyle } from '../types.js';
import { similarityByScore } from './similarityByScore.js';

const DRINK_SCORE = {
  NONE: 0,
  RARE: 0.5,
  SOMETIMES: 1.0,
  OFTEN: 1.5,
} as const;

export function getDrinkSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  return similarityByScore(DRINK_SCORE[A.drinkFreq], DRINK_SCORE[B.drinkFreq]);
}
