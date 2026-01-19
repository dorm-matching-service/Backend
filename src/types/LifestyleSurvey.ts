// types/lifestyleSurvey.ts (추천)
export interface LifestyleSurveyPatchDTO {
  age?: number | null;
  department?: string | null;
  wakeTimeMinutes?: number | null;
  sleepTimeMinutes?: number | null;
  selfTags?: string[];
  // 수정 가능 필드만 명시
}
