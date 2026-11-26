import { getUserMeals } from './api.js';
import { groupByDate } from './meal.js';

/**
 * 사용자의 식단 기록을 받아 날짜별로 묶는다.
 * @returns {Promise<{meals: object[], days: {date: string, meals: object[], representative: object}[]}>}
 */
export async function fetchDayLogs(user) {
  const meals = (await getUserMeals(user.id)) ?? [];
  return { meals, days: groupByDate(meals) };
}
