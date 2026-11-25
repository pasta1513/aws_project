// FastAPI 스키마(fastapi/schemas/*.py)와 1:1로 대응하는 타입

/** models/meal_model.py — MealType */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'late_snack' | 'snack';

/** schemas/user_schema.py — UserResponse */
export interface User {
  id: number;
  userid: string;
  email: string;
  name: string;
}

/** schemas/user_schema.py — UserCreate */
export interface UserCreate {
  userid: string; // 2~20자, 영문/숫자
  password: string; // 4~24자
  email: string;
  name: string; // 1~50자
}

/** schemas/user_schema.py — UserUpdate (세 필드 모두 필수) */
export interface UserUpdate {
  password: string;
  email: string;
  name: string;
}

/** schemas/meal_schema.py — MealResponse */
export interface Meal {
  id: number;
  user_id: number;
  type: MealType;
  menu: string;
  date: string; // YYYY-MM-DD
}

/** schemas/meal_schema.py — MealCreate */
export interface MealCreate {
  user_id: number;
  type: MealType;
  menu: string; // 1~255자
  date: string; // YYYY-MM-DD
}
