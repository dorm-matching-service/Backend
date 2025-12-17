import { failBySleepTIme } from './sleepTimeCut.js';
import { failByShower } from './showerCut.js';
import { UserLifeStyle } from '../types.js';

export function isLayer1Fail(A: UserLifeStyle, B: UserLifeStyle): boolean {
  if (A.smoking !== B.smoking) return true;
  if (A.gaming !== B.gaming) return true;

  if (failBySleepTIme(A, B)) return true;
  if (failByShower(A, B)) return true;

  return false;
}
