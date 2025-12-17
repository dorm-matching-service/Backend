// mealSimilarity.ts
import { UserLifeStyle } from '../types.js';

export function getMealSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  if (A.mealPlace === B.mealPlace) return 1.0;
  return 0.7;
}
