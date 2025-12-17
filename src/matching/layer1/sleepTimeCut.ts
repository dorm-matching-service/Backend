import { UserLifeStyle } from '../types.js';

const WAKE_DIFF_CUT = 150; // 2시간 30분
const SLEEP_DIFF_CUT = 180; // 3시간
const TOTAL_DIFF_CUT = 330;

function getTimeDiffMinutes(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 1440 - diff);
}

export function failBySleepTIme(A: UserLifeStyle, B: UserLifeStyle): boolean {
  const wakeDiff = getTimeDiffMinutes(A.wakeTimeMinutes, B.wakeTimeMinutes);

  const sleepDIff = getTimeDiffMinutes(A.sleepTimeMinutes, B.sleepTimeMinutes);

  if (wakeDiff > WAKE_DIFF_CUT) return true;
  if (sleepDIff > SLEEP_DIFF_CUT) return true;
  if (wakeDiff + SLEEP_DIFF_CUT > TOTAL_DIFF_CUT) return true;

  return false;
}
