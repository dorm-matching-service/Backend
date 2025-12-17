export function average(values: number[]): number {
  if (values.length === 0) return 1.0;

  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}
