import { CleanFreq } from './layer2/CleanFreq.js';
import { GamingTime } from './layer2/GamingTime.js';
import { MealPlace } from './layer2/MealPlace.js';
import { HomeVisitFreq } from './layer2/HomeVisitFreq.js';

export interface UserLifeStyle {
  /* ──────────────
   * Layer1 - 절대 조건
   * ────────────── */
  smoking: boolean;
  gaming: boolean;

  /* ──────────────
   * Layer2-1. 생활 리듬 (40%)
   * 갈등 직결 요소
   * ────────────── */
  wakeTimeMinutes: number;
  sleepTimeMinutes: number;
  drinkFreq: 'NONE' | 'RARE' | 'SOMETIMES' | 'OFTEN';
  gamingTime?: GamingTime; // gaming === true 인 경우만 사용

  /* ──────────────
   * Layer2-2. 생활 습관 (30%)
   * 누적 스트레스 요소
   * ────────────── */
  cleanFreq: CleanFreq; // 방 청소 주기
  showerFreq: 'TWICE' | 'ONCE' | 'EVERY_TWO_DAYS' | 'RARE';
  mealPlace?: MealPlace;

  /* ──────────────
   * Layer2-3. 개인 성향 / 민감도 (15~25%)
   * ────────────── */
  homeVisitFreq?: HomeVisitFreq; // 본가 가는 주기
  coldSensitive?: boolean;
  heatSensitive?: boolean;

  /* ──────────────
   * 리스크 보정 요소
   * ────────────── */
  sleepHabits?: string[];
  drinkHabits?: string[];

  /* ──────────────
   * Layer3 - 가산 요소
   * ────────────── */
  hobbies?: string[];
}
