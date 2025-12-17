// gameSimilarity.ts
import { UserLifeStyle } from '../types.js';
import { similarityByScore } from './similarityByScore.js';
import { GamingTime } from './GamingTime.js';

const GAME_TIME_SCORE: Record<GamingTime, number> = {
  NONE: 0,
  ONE_MINUS: 0.5,
  ONE_TO_THREE: 1.0,
  THREE_PLUS: 1.5,
} as const;

export function getGameSimilarity(A: UserLifeStyle, B: UserLifeStyle): number {
  // 둘 다 게임 안 하면 완전 일치
  if (!A.gaming && !B.gaming) return 1.0;

  // 한 명만 게임하면 Layer1에서 컷 대상 (여기선 중립 처리)
  if (!A.gaming || !B.gaming) return 1.0;

  // 게임은 둘 다 하지만 시간 정보 없으면 중립
  if (!A.gamingTime || !B.gamingTime) return 1.0;

  return similarityByScore(
    GAME_TIME_SCORE[A.gamingTime],
    GAME_TIME_SCORE[B.gamingTime],
  );
}
