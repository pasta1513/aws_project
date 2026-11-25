import { request } from './client';
import type { Meal, MealCreate } from './types';

// routes/meal_route.py (prefix: /meals)
// 백엔드에 식단 수정·삭제 라우트가 없으므로 작성·조회만 제공한다.

/** GET /meals/user/{user_id} → MealResponse[] (date desc) */
export const getUserMeals = (userId: number, signal?: AbortSignal) =>
  request<Meal[]>(`/meals/user/${userId}`, { signal });

/** POST /meals → 201 MealResponse | 404 사용자 없음 | 409 같은 날짜·구분 중복 */
export const createMeal = (body: MealCreate) =>
  request<Meal>('/meals', { method: 'POST', json: body });
