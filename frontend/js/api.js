// 백엔드 주소 (fastapi/main.py 에서 실행하는 주소)
const API_BASE = 'http://127.0.0.1:8080';

// 끼니 enum 값 → 화면에 보여줄 이름 (순서는 목록 정렬에도 사용)
const MEAL_TYPES = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  late_snack: '야식',
  snack: '간식',
};

// API 호출 공통 함수: 실패하면 서버가 보낸 메시지로 에러를 던짐
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(errorMessage(data));
    error.status = res.status;
    throw error;
  }

  return data;
}

// FastAPI 에러 응답(detail)을 사람이 읽을 수 있는 문장으로 변환
function errorMessage(data) {
  const detail = data?.detail;

  if (typeof detail === 'string') return detail;

  // 422 검증 오류는 [{ loc: [..., '필드명'], msg: '...' }] 형태의 배열
  if (Array.isArray(detail) && detail.length > 0) {
    const field = detail[0].loc?.at(-1);
    return `${FIELD_NAMES[field] ?? field}: ${detail[0].msg}`;
  }

  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.';
}

const FIELD_NAMES = {
  userid: '아이디',
  password: '비밀번호',
  email: '이메일',
  name: '이름',
  menu: '메뉴',
  date: '날짜',
  type: '끼니',
};

// 로그인한 사용자 정보(id, userid)를 브라우저에 저장해서 새로고침해도 유지
const session = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
  set(user) {
    localStorage.setItem('user', JSON.stringify({ id: user.id, userid: user.userid }));
  },
  clear() {
    localStorage.removeItem('user');
  },
};

function showError(el, message) {
  el.textContent = message;
  el.hidden = !message;
}
