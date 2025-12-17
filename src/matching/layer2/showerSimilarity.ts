import { UserLifeStyle } from '../types.js';

const SHOWER_SCORE = {
  TWICE: 2.0,
  ONCE: 1.0,
  EVERY_TWO_DAYS: 0.5,
  RARE: 0.33,
} as const;

export function getShowerSimilarity(
  A: UserLifeStyle,
  B: UserLifeStyle,
): number {
  const diff = Math.abs(
    SHOWER_SCORE[A.showerFreq] - SHOWER_SCORE[B.showerFreq],
  );

  if (diff === 0) return 1.0;
  if (diff <= 0.5) return 0.8;
  if (diff <= 1.0) return 0.6;
  return 0.4;
}
