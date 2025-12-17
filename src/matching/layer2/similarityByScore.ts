export function similarityByScore(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff === 0) return 1.0;
  if (diff <= 0.5) return 0.8;
  if (diff <= 1) return 0.6;
  return 0.4;
}
