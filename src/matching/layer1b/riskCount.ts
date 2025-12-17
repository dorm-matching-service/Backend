import { UserLifeStyle } from '../types.js';
import { SLEEP_RISK_FLAGS, DRINK_RISK_FLAGS } from './riskFlags.js';

export function getRiskCount(user: UserLifeStyle): number {
  let count = 0;

  //habit 값이 없으면 undefined가 아닌 ?? 뒤의 값인 [] 빈 배열로 대체
  for (const habit of user.sleepHabits ?? []) {
    if (SLEEP_RISK_FLAGS.includes(habit as any)) {
      count++;
    }
  }

  for (const habit of user.drinkHabits ?? []) {
    if (DRINK_RISK_FLAGS.includes(habit as any)) {
      count++;
    }
  }

  return count;
}
