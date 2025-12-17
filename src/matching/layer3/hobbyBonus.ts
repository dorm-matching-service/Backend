import { UserLifeStyle } from '../types.js';

const HOBBY_BONUS = [5, 4, 3, 2, 1];

export function getHobbyBonus(A: UserLifeStyle, B: UserLifeStyle): number {
  if (!A.hobbies || !B.hobbies) return 0;

  const setB = new Set(B.hobbies);
  const overlapCount = A.hobbies.filter((h) => setB.has(h)).length;

  let bonus = 0;
  for (let i = 0; i < overlapCount && i < HOBBY_BONUS.length; i++) {
    bonus += HOBBY_BONUS[i];
  }

  return bonus; // 0 ~ 15
}
