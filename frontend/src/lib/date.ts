// 백엔드 date 필드는 'YYYY-MM-DD' 문자열. 타임존 문제를 피하려고 로컬 날짜로만 다룬다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = () => toISODate(new Date());

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseISODate(value);
  return !Number.isNaN(d.getTime()) && toISODate(d) === value;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** a - b (일 단위) */
export function diffDays(a: string, b: string): number {
  return Math.round((parseISODate(a).getTime() - parseISODate(b).getTime()) / 86_400_000);
}

/** 해당 날짜가 속한 주의 월요일 */
export function startOfWeek(iso: string): string {
  const day = parseISODate(iso).getDay(); // 0=일
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

export function weekday(iso: string, long = true): string {
  const w = WEEKDAYS[parseISODate(iso).getDay()];
  return long ? `${w}요일` : w;
}

export function formatMonthDay(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatFull(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday(iso)}`;
}

export function formatYearMonth(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export function formatDot(iso: string): string {
  const d = parseISODate(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 오늘/어제/n일 전 (일주일 이내만) */
export function relativeLabel(iso: string, today = todayISO()): string | null {
  const diff = diffDays(today, iso);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff > 1 && diff < 7) return `${diff}일 전`;
  if (diff < 0) return '예정';
  return null;
}

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Sunday, Mon … (short = 3글자) */
export function weekdayEn(iso: string, short = false): string {
  const w = WEEKDAYS_EN[parseISODate(iso).getDay()];
  return short ? w.slice(0, 3) : w;
}

export function monthEn(iso: string, short = false): string {
  const m = MONTHS_EN[parseISODate(iso).getMonth()];
  return short ? m.slice(0, 3) : m;
}

/** Wednesday, 25 November 2026 */
export function formatEnglish(iso: string): string {
  const d = parseISODate(iso);
  return `${weekdayEn(iso)}, ${d.getDate()} ${monthEn(iso)} ${d.getFullYear()}`;
}

/** 시간대 인사 */
export function greetingEn(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 11) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** 시간대 인사 (한글) */
export function greetingKo(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return '늦은 밤이에요';
  if (h < 11) return '좋은 아침이에요';
  if (h < 17) return '좋은 오후예요';
  if (h < 22) return '편안한 저녁이에요';
  return '늦은 밤이에요';
}
