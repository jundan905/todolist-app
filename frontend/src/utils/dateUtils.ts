export function formatDate(dateStr: string): string {
  // ISO 형식 (2026-04-08T15:00:00.000Z) 에서 날짜 부분만 추출
  const dateOnly = dateStr.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  return `${year}년 ${month}월 ${day}일`;
}

export function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

export function compareDates(dateA: string, dateB: string): number {
  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;
  return 0;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
