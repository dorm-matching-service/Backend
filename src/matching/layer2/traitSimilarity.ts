// traitSimilarity.ts
import type { UserLifeStyle } from '../types.js';

export function getTraitSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  let score = 0;
  let count = 0;

  if (A.coldSensitive !== undefined && B.coldSensitive !== undefined) {
    score += A.coldSensitive === B.coldSensitive ? 1.0 : 0.5;
    count++;
  }

  if (A.heatSensitive !== undefined && B.heatSensitive !== undefined) {
    score += A.heatSensitive === B.heatSensitive ? 1.0 : 0.5;
    count++;
  }

  return count > 0 ? score / count : 1.0;
}
