import { UserLifeStyle } from '../types.js';

// 샤워 빈도를 숫자로 변환하기 위한 기준표
const SHOWER_SCORE = {
  TWICE: 2.0,
  ONCE: 1.0,
  EVERY_TWO_DAYS: 0.5,
  RARE: 0.33,
} as const;

export function failByShower(A: UserLifeStyle, B: UserLifeStyle): boolean {
  const a = SHOWER_SCORE[A.showerFreq];
  const b = SHOWER_SCORE[B.showerFreq];

  return Math.abs(a - b) >= 1.5;
}
