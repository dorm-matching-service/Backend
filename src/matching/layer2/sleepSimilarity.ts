import { UserLifeStyle } from '../types.js';
import { getTimeDiffMinutes } from '../utils/time.js';

export function getSleepSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  const wakeDiff = getTimeDiffMinutes(A.wakeTimeMinutes, B.wakeTimeMinutes);

  const sleepDiff = getTimeDiffMinutes(A.sleepTimeMinutes, B.sleepTimeMinutes);

  const avg = (wakeDiff + sleepDiff) / 2;

  if (avg <= 30) return 1.0;
  if (avg <= 60) return 0.8;
  if (avg <= 120) return 0.6;
  return 0.4;
}
