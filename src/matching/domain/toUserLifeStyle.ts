import { UserLifeStyle } from '../types.js';
import type { LifestyleSurvey } from '@prisma/client';

import { CleanFreq } from '../layer2/CleanFreq.js';
import { GamingTime } from '../layer2/GamingTime.js';
import { MealPlace } from '../layer2/MealPlace.js';
import { HomeVisitFreq } from '../layer2/HomeVisitFreq.js';

const mapDrinkFreq: Record<
  LifestyleSurvey['drinkFreq'],
  UserLifeStyle['drinkFreq']
> = {
  NONE: 'NONE',
  RARE: 'RARE',
  ONE_TWO: 'SOMETIMES',
  THREE_PLUS: 'OFTEN',
};

const mapShowerFreq: Record<
  LifestyleSurvey['showerFreq'],
  UserLifeStyle['showerFreq']
> = {
  ONCE: 'ONCE',
  TWICE: 'TWICE',
  TWO_DAYS: 'EVERY_TWO_DAYS',
  RARE: 'RARE',
};

export function toUserLifeStyle(survey: LifestyleSurvey): UserLifeStyle {
  return {
    userId: survey.userId,
    gender: survey.gender,

    /* ──────────────
     * Layer1
     * ────────────── */
    smoking: survey.activityLevel === 'SMOKER',
    gaming: survey.gamingTime !== 'NONE',

    /* ──────────────
     * Layer2-1
     * ────────────── */
    wakeTimeMinutes: survey.wakeTimeMinutes,
    sleepTimeMinutes: survey.sleepTimeMinutes,
    drinkFreq: mapDrinkFreq[survey.drinkFreq],

    /* ──────────────
     * Layer2-2
     * ────────────── */
    cleanFreq: survey.cleaningFreq as unknown as CleanFreq,
    showerFreq: mapShowerFreq[survey.showerFreq],

    /* ──────────────
     * 선택 필드
     * ────────────── */
    gamingTime:
      survey.gamingTime !== 'NONE'
        ? (survey.gamingTime as unknown as GamingTime)
        : undefined,

    mealPlace: survey.mealPlace as unknown as MealPlace,
    homeVisitFreq: survey.outgoingFreq as unknown as HomeVisitFreq,

    coldSensitive: survey.coldSensitivity,
    heatSensitive: survey.hotSensitivity,

    sleepHabits: survey.roomTraits,
    drinkHabits: survey.homeStyle,
    hobbies: survey.hobbies,
  };
}
