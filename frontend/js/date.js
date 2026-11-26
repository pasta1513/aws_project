// 백엔드 date 필드는 'YYYY-MM-DD' 문자열. 타임존 문제를 피하려고 로컬 날짜로만 다룬다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n) => String(n).padStart(2, '0');

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = () => toISODate(new Date());

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseISODate(value);
  return !Number.isNaN(d.getTime()) && toISODate(d) === value;
}

export function addDays(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** a - b (일 단위) */
export function diffDays(a, b) {
  return Math.round((parseISODate(a).getTime() - parseISODate(b).getTime()) / 86_400_000);
}

/** 해당 날짜가 속한 주의 월요일 */
export function startOfWeek(iso) {
  const day = parseISODate(iso).getDay(); // 0=일
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

export function weekday(iso, long = true) {
  const w = WEEKDAYS[parseISODate(iso).getDay()];
  return long ? `${w}요일` : w;
}

export function formatMonthDay(iso) {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatFull(iso) {
  const d = parseISODate(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday(iso)}`;
}

export function formatYearMonth(iso) {
  const d = parseISODate(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export function formatDot(iso) {
  const d = parseISODate(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 오늘/어제/n일 전 (일주일 이내만) */
export function relativeLabel(iso, today = todayISO()) {
  const diff = diffDays(today, iso);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff > 1 && diff < 7) return `${diff}일 전`;
  if (diff < 0) return '예정';
  return null;
}

/** 시간대 인사 (한글) */
export function greetingKo(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return '늦은 밤이에요';
  if (h < 11) return '좋은 아침이에요';
  if (h < 17) return '좋은 오후예요';
  if (h < 22) return '편안한 저녁이에요';
  return '늦은 밤이에요';
}
