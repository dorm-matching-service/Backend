export function minutesToAmPm(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;

  const isAm = h24 < 12;
  const period = isAm ? 'am' : 'pm';

  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const hh = h12.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');

  return `${hh}:${mm} ${period}`;
}
