import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMeal, getUserMeals } from '../api/meals';
import type { Meal, MealCreate } from '../api/types';
import { useCurrentUser } from '../auth/AuthContext';
import { groupByDate } from '../lib/meal';

export const mealsKey = (userId: number) => ['meals', 'user', userId] as const;

export function useUserMeals() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: mealsKey(user.id),
    queryFn: ({ signal }) => getUserMeals(user.id, signal),
  });
}

/** 날짜별로 묶은 식단 기록 */
export function useDayLogs() {
  const query = useUserMeals();
  const days = useMemo(() => groupByDate(query.data ?? []), [query.data]);
  return { ...query, days };
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MealCreate) => createMeal(body),
    onSuccess: (meal: Meal) => {
      queryClient.setQueryData<Meal[]>(mealsKey(meal.user_id), (prev) => (prev ? [meal, ...prev] : prev));
      queryClient.invalidateQueries({ queryKey: mealsKey(meal.user_id) });
    },
  });
}
