import { UserLifeStyle } from '../types.js';
import { similarityByScore } from './similarityByScore.js';
import { HomeVisitFreq } from './HomeVisitFreq.js';

const HOME_VISIT_SCORE: Record<HomeVisitFreq, number> = {
  [HomeVisitFreq.EVERY_WEEK]: 2.0,
  [HomeVisitFreq.TWO_WEEKS]: 1.5,
  [HomeVisitFreq.ONCE_A_MONTH]: 1.0,
  [HomeVisitFreq.RARE]: 0.5,
};

export function getHomeVisitSimilarity(
  A: UserLifeStyle,
  B: UserLifeStyle,
): number {
  if (!A.homeVisitFreq || !B.homeVisitFreq) return 1.0;

  return similarityByScore(
    HOME_VISIT_SCORE[A.homeVisitFreq],
    HOME_VISIT_SCORE[B.homeVisitFreq],
  );
}
