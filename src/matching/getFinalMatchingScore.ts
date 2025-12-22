import { isLayer1Fail } from './layer1/isLayer1Fail.js';
import { getLayer2Score } from './layer2/index.js';
import { getHobbyBonus } from './layer3/hobbyBonus.js';
import { UserLifeStyle } from './types.js';

type FinalMatchingResult = {
  baseScore: number;
  hobbyBonus: number;
  finalScore: number;
};

export function getFinalMatchingScore(
  A: UserLifeStyle,
  B: UserLifeStyle,
): FinalMatchingResult {
  // Layer2 (0 ~ 70)
  const baseScore = getLayer2Score(A, B);

  // Layer3 (0 ~ 30)
  const hobbyBonus = getHobbyBonus(A, B);

  const finalScore = Math.min(baseScore + hobbyBonus, 100);

  return {
    baseScore,
    hobbyBonus,
    finalScore,
  };
}
