export function getTimeDiffMinutes(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 1440 - diff);
}
