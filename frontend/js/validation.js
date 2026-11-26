// schemas/user_schema.py 의 Field 제약을 그대로 옮긴 클라이언트 검증 (서버 검증은 그대로 유지)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{userid?: string, password: string, passwordConfirm: string, email: string, name: string}} form
 * @returns {Record<string, string>} 필드명 → 오류 메시지 (문제가 없으면 빈 객체)
 */
export function validateAccount(form, { requireUserid }) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();

  if (!name) errors.name = '이름을 입력해 주세요.';
  else if (name.length > 50) errors.name = '50자까지 입력할 수 있어요.';

  if (requireUserid) {
    const userid = (form.userid ?? '').trim();
    if (!userid) errors.userid = '아이디를 입력해 주세요.';
    else if (!/^[a-zA-Z0-9]+$/.test(userid)) errors.userid = '영문과 숫자만 사용할 수 있어요.';
    else if (userid.length < 2 || userid.length > 20) errors.userid = '2~20자로 입력해 주세요.';
  }

  if (!email) errors.email = '이메일을 입력해 주세요.';
  else if (!EMAIL_RE.test(email)) errors.email = '올바른 이메일 형식이 아니에요.';

  if (!form.password) errors.password = '비밀번호를 입력해 주세요.';
  else if (form.password.length < 4 || form.password.length > 24) errors.password = '4~24자로 입력해 주세요.';

  if (form.password && form.password !== form.passwordConfirm) errors.passwordConfirm = '비밀번호가 일치하지 않아요.';

  return errors;
}
