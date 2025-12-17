import { UserLifeStyle } from '../types.js';

export const SLEEP_RISK_FLAGS = ['SNORE', 'INSOMNIA'] as const;
export const DRINK_RISK_FLAGS = ['LATE_DRINK', 'BLACKOUT'] as const;

function countRisk(
  habits?: string[],
  riskList: readonly string[] = [],
): number {
  if (!habits) return 0;
  return habits.filter((h) => riskList.includes(h)).length;
}

export function getRiskMultiplier(A: UserLifeStyle, B: UserLifeStyle): number {
  const sleepRisk =
    countRisk(A.sleepHabits, SLEEP_RISK_FLAGS) +
    countRisk(B.sleepHabits, SLEEP_RISK_FLAGS);

  const drinkRisk =
    countRisk(A.drinkHabits, DRINK_RISK_FLAGS) +
    countRisk(B.drinkHabits, DRINK_RISK_FLAGS);

  let multiplier = 1.0;

  if (sleepRisk >= 3) multiplier *= 0.8;
  if (drinkRisk >= 2) multiplier *= 0.85;

  return Math.max(multiplier, 0.7);
}
