const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

/** FastAPI 422 응답의 detail 항목 */
interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly status: number;
  /** 422 검증 오류를 필드명 → 메시지로 정리한 값 */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function translateIssue(issue: ValidationIssue): string {
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

function toApiError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;

  if (typeof detail === 'string') {
    return new ApiError(status, detail);
  }

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of detail as ValidationIssue[]) {
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

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  json?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(path: string, { method = 'GET', json, signal }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, '서버에 연결할 수 없어요. 네트워크 상태나 백엔드 실행 여부를 확인해 주세요.');
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) throw toApiError(res.status, body);
  return body as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return '알 수 없는 오류가 발생했어요.';
}
