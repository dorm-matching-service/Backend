export function formatChatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();

  const isAm = h < 12;
  const period = isAm ? '오전' : '오후';

  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, '0');

  return `${period} ${h12}:${mm}`;
}
