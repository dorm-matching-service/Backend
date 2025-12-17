import { getCaseMultiplier } from './caseMultiplier.js';
import { getRiskCount } from './riskCount.js';
import { getComboCounts } from './comboCheck.js';
import { UserLifeStyle } from '../types.js';

export function getLayer1BMultiplier(
  A: UserLifeStyle,
  B: UserLifeStyle,
): number {
  const a = getRiskCount(A);
  const b = getRiskCount(B);

  // Case multiplier
  const caseMultiplier = getCaseMultiplier(a, b);

  // Combo multiplier
  const { bad, warn } = getComboCounts(A, B);

  let comboMultiplier = 1.0;

  // BAD 최대 2개까지만 반영
  const appliedBad = Math.min(bad, 2);

  // BAD 하나당 점수를 70%로 줄임
  comboMultiplier *= Math.pow(0.7, appliedBad);

  // WARN은 여러 개여도 한 번만 15%만 살짝 깎음
  if (warn > 0) {
    comboMultiplier *= 0.85;
  }

  // 계산 결과가 0.35보다 작아지면 → 무조건 0.35로 고정 (너무 값이 작아지지 않게 막음)
  //caseMultiplier * comboMultiplier → 실제 계산된 값 0.35 → 최소 허용값(바닥값) 둘 중 더 큰 값을 선택함
  const finalMultiplier = Math.max(caseMultiplier * comboMultiplier, 0.35);

  return finalMultiplier;
}
