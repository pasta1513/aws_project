import { request } from './client';
import type { User, UserCreate, UserUpdate } from './types';

// routes/user_route.py (prefix: /users)

/** POST /users/signup → 201 UserResponse | 409 */
export const signup = (body: UserCreate) =>
  request<User>('/users/signup', { method: 'POST', json: body });

/** GET /users/{userid} → UserResponse | 404 */
export const getUser = (userid: string) =>
  request<User>(`/users/${encodeURIComponent(userid)}`);

/** PUT /users/{userid} → UserResponse | 404 | 409 */
export const updateUser = (userid: string, body: UserUpdate) =>
  request<User>(`/users/${encodeURIComponent(userid)}`, { method: 'PUT', json: body });

/** DELETE /users/{userid} → string | 404 */
export const deleteUser = (userid: string) =>
  request<string>(`/users/${encodeURIComponent(userid)}`, { method: 'DELETE' });
