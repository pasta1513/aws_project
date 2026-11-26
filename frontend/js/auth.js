import { ApiError, getUser } from './api.js';
import { routes } from './ui.js';

/*
 * ⚠️ 간이 로그인
 * 백엔드에 로그인(비밀번호 검증·토큰) API가 없어서,
 * GET /users/{userid} 로 사용자가 존재하는지만 확인한 뒤 브라우저에 세션을 저장한다.
 * 비밀번호는 검증되지 않는다. 로그인 API가 생기면 login()만 교체하면 된다.
 */

const STORAGE_KEY = 'soban.session';
let memoryUser = null; // 저장소를 쓸 수 없는 환경에서는 메모리 세션만 유지

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : memoryUser;
  } catch {
    return memoryUser;
  }
}

export function setCurrentUser(user) {
  memoryUser = user;
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 메모리 세션만 유지 */
  }
}

export async function login(userid) {
  const found = await getUser(userid.trim());
  setCurrentUser(found);
  return found;
}

export function logout() {
  setCurrentUser(null);
}

/**
 * 로그인한 사용자만 들어올 수 있는 화면에서 호출.
 * 로그인하지 않았다면 로그인 화면으로 보내고 null 을 돌려준다.
 */
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const from = location.pathname.split('/').pop() + location.search;
    location.replace(`${routes.login}?next=${encodeURIComponent(from)}`);
    return null;
  }
  refreshSession(user);
  return user;
}

/** 로그인/회원가입 화면 — 이미 로그인했다면 홈으로 */
export function guestOnly() {
  if (getCurrentUser()) {
    location.replace(routes.home);
    return false;
  }
  return true;
}

// 저장된 세션이 있으면 서버 기준 최신 정보로 갱신 (탈퇴된 계정이면 로그아웃)
function refreshSession(stored) {
  getUser(stored.userid)
    .then((user) => {
      setCurrentUser(user);
      document.dispatchEvent(new CustomEvent('soban:user', { detail: user }));
    })
    .catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        logout();
        location.replace(routes.login);
      }
    });
}
