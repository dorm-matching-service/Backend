import { z } from 'zod';

// Prisma Enum 매핑
export const Gender = z.enum(['MALE', 'FEMALE']);
export const ShowerFreq = z.enum(['ONCE', 'TWICE', 'TWO_DAYS', 'RARE']);
export const CleaningFreq = z.enum(['ONCE', 'TWICE', 'TWO_DAYS', 'RARE']);
export const ActivityLevel = z.enum(['SMOKER', 'NON_SMOKER']);
export const OutgoingFreq = z.enum([
  'EVERY_WEEK',
  'TWO_WEEKS',
  'WEEKENDS',
  'VACATION',
]);
export const MealPlace = z.enum(['DORM', 'OUTSIDE']);
export const GamingTime = z.enum([
  'NONE',
  'ONE_MINUS',
  'ONE_TO_THREE',
  'THREE_PLUS',
]);
export const DrinkFreq = z.enum(['NONE', 'RARE', 'ONE_TWO', 'THREE_PLUS']);
export const EI = z.enum(['E', 'I']);
export const NS = z.enum(['N', 'S']);
export const TF = z.enum(['T', 'F']);
export const JP = z.enum(['J', 'P']);

// ----------------------
// CREATE / UPDATE 스키마
// ----------------------
export const lifestyleSurveySchema = z.object({
  age: z.number().int().min(10).max(100),
  department: z.string().min(1),
  gender: Gender,

  mbti1: EI,
  mbti2: NS,
  mbti3: TF,
  mbti4: JP,

  wakeTimeMinutes: z.number().int().min(0).max(1440),
  sleepTimeMinutes: z.number().int().min(0).max(1440),

  showerFreq: ShowerFreq,
  cleaningFreq: CleaningFreq,

  activityLevel: ActivityLevel,

  // 배열은 default([]) 적용
  roomTraits: z.array(z.string()).default([]),
  coldSensitivity: z.boolean(),
  hotSensitivity: z.boolean(),

  outgoingFreq: OutgoingFreq,

  mealPlace: MealPlace,
  mealNote: z.string().max(15), //15자 제한

  gamingTime: GamingTime,
  drinkFreq: DrinkFreq,

  homeStyle: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),

  roommateWish: z.string().min(1).max(150), //150자 제한
  selfTags: z.array(z.string()).default([]),
});

/* 부분 수정용 (PATCH) */
export const lifestyleSurveyPartialSchema = lifestyleSurveySchema.partial();

export type LifestyleSurveyInput = z.infer<typeof lifestyleSurveySchema>;
