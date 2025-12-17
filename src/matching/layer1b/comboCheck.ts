import { BAD_COMBOS, WARN_COMBOS } from './comboRules.js';
import { UserLifeStyle } from '../types.js';

// 매개변수 타밉정의에서 listA: string[] = [] 이렇게 쓰는 이유는 undefined면 빈 배열 줘서 에러 막기 위함
function hasCombo(
  listA: string[] = [],
  listB: string[] = [],
  [a, b]: [string, string],
): boolean {
  return (
    (listA.includes(a) && listB.includes(b)) ||
    (listA.includes(b) && listB.includes(a))
  );
}

export function getComboCounts(A: UserLifeStyle, B: UserLifeStyle) {
  let bad = 0;
  let warn = 0;

  for (const combo of BAD_COMBOS) {
    if (
      hasCombo(A.sleepHabits, B.sleepHabits, combo) ||
      hasCombo(A.drinkHabits, B.drinkHabits, combo)
    ) {
      bad++;
    }
  }

  for (const combo of WARN_COMBOS) {
    if (
      hasCombo(A.sleepHabits, B.sleepHabits, combo) ||
      hasCombo(A.drinkHabits, B.drinkHabits, combo)
    ) {
      warn++;
    }
  }

  return { bad, warn };
}
