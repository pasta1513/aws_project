import { API_BASE_URL } from './config.js';

// 백엔드(FastAPI)와 통신하는 곳은 이 파일 한 군데뿐이다.

const BASE_URL = API_BASE_URL.replace(/\/$/, '');

export class ApiError extends Error {
  /**
   * @param {number} status HTTP 상태 (네트워크 오류는 0)
   * @param {string} message 화면에 보여 줄 한국어 메시지
   * @param {Record<string, string>} fieldErrors 422 검증 오류를 필드명 → 메시지로 정리한 값
   */
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** FastAPI 422 응답의 detail 항목 → 한국어 메시지 */
function translateIssue(issue) {
  const ctx = issue.ctx ?? {};
  switch (issue.type) {
    case 'missing':
      return '필수 입력 항목이에요.';
    case 'string_too_short':
      return `${ctx.min_length}자 이상 입력해 주세요.`;
    case 'string_too_long':
      return `${ctx.max_length}자까지 입력할 수 있어요.`;
    case 'string_pattern_mismatch':
      return '영문과 숫자만 사용할 수 있어요.';
    case 'value_error':
      return '올바른 이메일 형식이 아니에요.';
    case 'enum':
      return '선택할 수 없는 값이에요.';
    case 'date_from_datetime_parsing':
    case 'date_parsing':
    case 'date_type':
      return '올바른 날짜가 아니에요.';
    case 'int_parsing':
      return '숫자 형식이 아니에요.';
    default:
      return issue.msg;
  }
}

function toApiError(status, body) {
  const detail = body?.detail;

  if (typeof detail === 'string') {
    return new ApiError(status, detail);
  }

  if (Array.isArray(detail)) {
    const fieldErrors = {};
    for (const issue of detail) {
      const field = String(issue.loc?.[issue.loc.length - 1] ?? '');
      if (field && !fieldErrors[field]) fieldErrors[field] = translateIssue(issue);
    }
    return new ApiError(status, '입력한 내용을 다시 확인해 주세요.', fieldErrors);
  }

  if (status >= 500) {
    return new ApiError(status, '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
  }
  return new ApiError(status, '요청을 처리하지 못했어요.');
}

async function send(path, { method = 'GET', json } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 네트워크 상태나 백엔드 실행 여부를 확인해 주세요.');
  }

  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) throw toApiError(res.status, body);
  return body;
}

/** 조회(GET)는 네트워크/서버 오류일 때만 최대 2번 다시 시도 (4xx 는 다시 해도 결과가 같음) */
export async function request(path, options = {}) {
  const retries = (options.method ?? 'GET') === 'GET' ? 2 : 0;
  for (let attempt = 0; ; attempt++) {
    try {
      return await send(path, options);
    } catch (err) {
      const clientError = err instanceof ApiError && err.status >= 400 && err.status < 500;
      if (clientError || attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt, 30_000)));
    }
  }
}

export function errorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return '알 수 없는 오류가 발생했어요.';
}

// ---------- users (routes/user_route.py, prefix: /users) ----------

/** POST /users/signup → 201 UserResponse | 409 */
export const signup = (body) => request('/users/signup', { method: 'POST', json: body });

/** GET /users/{userid} → UserResponse | 404 */
export const getUser = (userid) => request(`/users/${encodeURIComponent(userid)}`);

/** PUT /users/{userid} → UserResponse | 404 | 409 */
export const updateUser = (userid, body) => request(`/users/${encodeURIComponent(userid)}`, { method: 'PUT', json: body });

/** DELETE /users/{userid} → string | 404 */
export const deleteUser = (userid) => request(`/users/${encodeURIComponent(userid)}`, { method: 'DELETE' });

// ---------- meals (routes/meal_route.py, prefix: /meals) ----------
// 백엔드에 식단 수정·삭제 라우트가 없으므로 작성·조회만 제공한다.

/** GET /meals/user/{user_id} → MealResponse[] (date desc) */
export const getUserMeals = (userId) => request(`/meals/user/${userId}`);

/** POST /meals → 201 MealResponse | 404 사용자 없음 | 409 같은 날짜·구분 중복 */
export const createMeal = (body) => request('/meals', { method: 'POST', json: body });
