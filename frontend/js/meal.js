import { addDays, diffDays, todayISO } from './date.js';

// MealType: 'breakfast' | 'lunch' | 'dinner' | 'late_snack' | 'snack' (백엔드 models/meal_model.py)

export const MEAL_META = {
  breakfast: { label: '아침', en: 'Breakfast', placeholder: '예: 그릭요거트, 블루베리, 아메리카노' },
  lunch: { label: '점심', en: 'Lunch', placeholder: '예: 연어 포케, 현미밥' },
  snack: { label: '간식', en: 'Snack', placeholder: '예: 얼그레이 티, 마들렌' },
  dinner: { label: '저녁', en: 'Dinner', placeholder: '예: 된장찌개, 계란말이, 잡곡밥' },
  late_snack: { label: '야식', en: 'Late night', placeholder: '예: 따뜻한 우동 한 그릇' },
};

/** 하루 흐름 순서 */
export const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner', 'late_snack'];

export const isMealType = (v) => !!v && MEAL_ORDER.includes(v);

/** 날짜 카드의 대표 메뉴 선정 우선순위 (주식 → 간식) */
const REPRESENTATIVE_PRIORITY = ['dinner', 'lunch', 'breakfast', 'late_snack', 'snack'];

/**
 * 식단 목록 → 날짜별 묶음 (최신 날짜 먼저)
 * @returns {{date: string, meals: object[], representative: object}[]}
 */
export function groupByDate(meals) {
  const map = new Map();
  for (const meal of meals) {
    const list = map.get(meal.date);
    if (list) list.push(meal);
    else map.set(meal.date, [meal]);
  }

  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, list]) => {
      const sorted = [...list].sort((a, b) => MEAL_ORDER.indexOf(a.type) - MEAL_ORDER.indexOf(b.type));
      const representative =
        REPRESENTATIVE_PRIORITY.map((t) => sorted.find((m) => m.type === t)).find(Boolean) ?? sorted[0];
      return { date, meals: sorted, representative };
    });
}

/** 오늘(또는 어제)부터 끊김 없이 이어진 기록 일수 */
export function currentStreak(days, today = todayISO()) {
  const recorded = new Set(days.map((d) => d.date));
  let cursor = recorded.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (recorded.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** 지금 시간대에 어울리는 끼니 — 이미 기록했다면 그다음 비어 있는 끼니 */
export function suggestMealType(recorded, now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const byTime =
    minutes < 10 * 60 + 30 ? 'breakfast' : minutes < 15 * 60 ? 'lunch' : minutes < 17 * 60 + 30 ? 'snack' : minutes < 21 * 60 ? 'dinner' : 'late_snack';
  if (!recorded.has(byTime)) return byTime;
  return MEAL_ORDER.slice(MEAL_ORDER.indexOf(byTime)).find((t) => !recorded.has(t)) ?? null;
}

export function countInRange(days, from, to) {
  return days
    .filter((d) => diffDays(d.date, from) >= 0 && diffDays(to, d.date) >= 0)
    .reduce((sum, d) => sum + d.meals.length, 0);
}

/** 식사 구분 컬러를 CSS 변수(--c, --c-soft, --c-wash)로 주입하는 style 문자열 */
export function mealVars(type) {
  return `--c: var(--${type}); --c-soft: var(--${type}-soft); --c-wash: var(--${type}-wash);`;
}
