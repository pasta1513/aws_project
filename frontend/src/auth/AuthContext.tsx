import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { getUser } from '../api/users';
import type { User } from '../api/types';

/*
 * ⚠️ 간이 로그인
 * 백엔드에 로그인(비밀번호 검증·토큰) API가 없어서,
 * GET /users/{userid} 로 사용자가 존재하는지만 확인한 뒤 브라우저에 세션을 저장한다.
 * 비밀번호는 검증되지 않는다. 로그인 API가 생기면 login()만 교체하면 된다.
 */

const STORAGE_KEY = 'soban.session';

interface AuthContextValue {
  user: User | null;
  login: (userid: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 저장소를 쓸 수 없는 환경에서는 메모리 세션만 유지 */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<User | null>(readStoredUser);

  const setUser = useCallback((next: User | null) => {
    writeStoredUser(next);
    setUserState(next);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    queryClient.clear();
  }, [queryClient, setUser]);

  const login = useCallback(
    async (userid: string) => {
      const found = await getUser(userid.trim());
      setUser(found);
      return found;
    },
    [setUser],
  );

  // 저장된 세션이 있으면 서버 기준 최신 정보로 갱신 (탈퇴된 계정이면 로그아웃)
  useEffect(() => {
    const stored = readStoredUser();
    if (!stored) return;
    getUser(stored.userid)
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) logout();
      });
  }, [logout, setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout, setUser: (u: User) => setUser(u) }),
    [user, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** RequireAuth 하위 화면에서 사용 — 로그인 사용자 보장 */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called without a signed-in user');
  return user;
}
