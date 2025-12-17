export function getCaseMultiplier(a: number, b: number): number {
  // Case 2: 쌍방 고위험
  if (a >= 2 && b >= 2) {
    return 0.6;
  }

  // Case 1: 편중 고위험
  if ((a === 0 && b >= 3) || (b === 0 && a >= 3)) {
    return 0.75;
  }

  // Case M: 중간 위험
  if (a + b >= 3) {
    return 0.9;
  }
  // Case 3: 저위험 / 안정
  return 1.0;
}
